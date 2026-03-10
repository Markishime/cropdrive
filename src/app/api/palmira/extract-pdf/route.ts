import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage, getAdminAuth } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';
import admin from 'firebase-admin';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const runtime = 'nodejs';
// Allow longer-running work (Document AI batch processing).
export const maxDuration = 300;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 200);
}

async function getPdfPageCount(pdfBuffer: Buffer): Promise<number | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PDFDocument } = require('pdf-lib') as any;
    const doc = await PDFDocument.load(pdfBuffer);
    const pages = Number(doc.getPageCount?.() ?? NaN);
    return Number.isFinite(pages) ? pages : null;
  } catch {
    return null;
  }
}

async function splitPdfIntoChunks(pdfBuffer: Buffer, maxPagesPerChunk: number): Promise<Buffer[]> {
  // Use require() to avoid TS moduleResolution=bundler issues with some CJS packages.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PDFDocument } = require('pdf-lib') as any;
  const src = await PDFDocument.load(pdfBuffer);
  const totalPages = src.getPageCount();
  if (totalPages <= maxPagesPerChunk) return [pdfBuffer];

  const chunks: Buffer[] = [];
  for (let start = 0; start < totalPages; start += maxPagesPerChunk) {
    const end = Math.min(start + maxPagesPerChunk, totalPages);
    const out = await PDFDocument.create();
    const indices = Array.from({ length: end - start }, (_, i) => start + i);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p: any) => out.addPage(p));
    const bytes = await out.save();
    chunks.push(Buffer.from(bytes));
  }
  return chunks;
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  // Remove leading/trailing fences, keep inner content
  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*\n/, '')
    .replace(/\n```$/, '')
    .trim();
}

function getDocumentAIClient(location: string): DocumentProcessorServiceClient {
  // Prefer explicit credentials in env (works on Vercel). Fallback to ADC (GOOGLE_APPLICATION_CREDENTIALS).
  const jsonBase64 = process.env.GOOGLE_DOCUMENT_AI_SERVICE_ACCOUNT_JSON_BASE64;
  const jsonRaw = process.env.GOOGLE_DOCUMENT_AI_SERVICE_ACCOUNT_JSON;

  if (jsonBase64 || jsonRaw) {
    const raw = jsonRaw ? String(jsonRaw) : Buffer.from(String(jsonBase64), 'base64').toString('utf8');
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{')) {
      throw new Error(
        'Invalid GOOGLE_DOCUMENT_AI_SERVICE_ACCOUNT_JSON(_BASE64): expected JSON object. ' +
          'Tip: set GOOGLE_APPLICATION_CREDENTIALS to a service-account.json file, or base64-encode the JSON.'
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e: any) {
      throw new Error(
        `Invalid GOOGLE_DOCUMENT_AI_SERVICE_ACCOUNT_JSON(_BASE64): ${e?.message || e}. ` +
          'Tip: ensure the value is valid JSON (or base64 of valid JSON).'
      );
    }

    const privateKey = String(parsed.private_key || '').replace(/\\n/g, '\n');
    const clientEmail = String(parsed.client_email || '');
    if (!privateKey || !clientEmail) {
      throw new Error(
        'Invalid Document AI service account JSON: missing client_email or private_key.'
      );
    }

    return new DocumentProcessorServiceClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: parsed.project_id || process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID,
      // Keep default endpoint selection; Document AI routes by resource location in `name`.
    });
  }

  return new DocumentProcessorServiceClient();
}

function isDocAiPageLimitError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return err?.code === 3 && /pages .*exceed the limit/i.test(msg);
}

async function startDocumentAIBatchJob(params: {
  gcsInputUri: string;
  gcsOutputUri: string;
}): Promise<{ operationName: string; extractionMethod: string }> {
  const projectId = process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID;
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us-central1';
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID;

  if (!projectId || !processorId) {
    throw new Error(
      'Document AI not configured (set GOOGLE_DOCUMENT_AI_PROJECT_ID and GOOGLE_DOCUMENT_AI_PROCESSOR_ID)'
    );
  }

  const client = getDocumentAIClient(location);
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const request = {
    name,
    inputDocuments: {
      gcsDocuments: {
        documents: [{ gcsUri: params.gcsInputUri, mimeType: 'application/pdf' }],
      },
    },
    documentOutputConfig: {
      gcsOutputConfig: { gcsUri: params.gcsOutputUri.endsWith('/') ? params.gcsOutputUri : `${params.gcsOutputUri}/` },
    },
  } as any;

  const [operation] = await client.batchProcessDocuments(request);
  const operationName = String((operation as any)?.name || '');
  if (!operationName) throw new Error('Document AI batch did not return an operation name.');

  return { operationName, extractionMethod: 'document_ai_batch' };
}

async function tryFinalizeDocumentAIBatchJob(params: {
  operationName: string;
  bucketName: string;
  outputPrefix: string; // bucket-relative prefix
  userId: string;
  uploadId: string;
}): Promise<{ done: false } | { done: true; fullText: string; pages: number; extractedTextStoragePath: string }> {
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us-central1';
  const client = getDocumentAIClient(location);

  const [op] = await client.operationsClient.getOperation({ name: params.operationName } as any);
  if (!(op as any)?.done) return { done: false };
  if ((op as any)?.error) {
    throw new Error(String((op as any)?.error?.message || 'Document AI batch failed.'));
  }

  const bucket = adminStorage.bucket(params.bucketName);
  const [files] = await bucket.getFiles({ prefix: params.outputPrefix });
  const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith('.json'));

  if (jsonFiles.length === 0) {
    throw new Error('Document AI batch finished but no output JSON files were found.');
  }

  let combined = '';
  let pages = 0;

  // Keep deterministic order
  jsonFiles.sort((a, b) => a.name.localeCompare(b.name));

  for (const f of jsonFiles) {
    const [buf] = await f.download();
    const parsed = JSON.parse(buf.toString('utf8'));
    const doc = parsed?.document || parsed;
    const text = String(doc?.text || '').trim();
    const pcount = Array.isArray(doc?.pages) ? doc.pages.length : 0;
    pages += pcount;
    if (text) combined = combined ? `${combined}\n\n${text}` : text;
  }

  combined = combined.trim();
  if (!combined) {
    throw new Error('Document AI batch finished but extracted text was empty.');
  }

  const extractedTextStoragePath = `palmira_user_library/${params.userId}/extracted_text/${params.uploadId}.txt`;
  await bucket.file(extractedTextStoragePath).save(Buffer.from(combined, 'utf8'), {
    contentType: 'text/plain; charset=utf-8',
    resumable: false,
    metadata: { cacheControl: 'private, max-age=0, no-transform' },
  });

  return { done: true, fullText: combined, pages: pages || 1, extractedTextStoragePath };
}

async function extractPdfTextWithDocumentAI(
  pdfBuffer: Buffer,
  fileName: string
): Promise<{ fullText: string; extractionMethod: string; pages: number }> {
  const projectId = process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID;
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us-central1';
  const processorId = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID;

  if (!projectId || !processorId) {
    throw new Error(
      'Document AI not configured (set GOOGLE_DOCUMENT_AI_PROJECT_ID and GOOGLE_DOCUMENT_AI_PROCESSOR_ID)'
    );
  }

  const client = getDocumentAIClient(location);
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const timeoutMs = Number(process.env.PALMIRA_PDF_EXTRACT_TIMEOUT_MS || 45000);
  const maxOnlinePages = 30; // Document AI online processing limit (cannot be increased)

  async function processOnlineOnce(buf: Buffer): Promise<{ text: string; pages: number }> {
    const request = {
      name,
      // Enabling imageless mode increases online limit to 30 pages and reduces payload size.
      imagelessMode: true,
      rawDocument: {
        content: buf.toString('base64'),
        mimeType: 'application/pdf',
      },
    } as any;

    // gax supports `timeout` for RPC deadline.
    const [result] = await client.processDocument(request, { timeout: timeoutMs } as any);
    const doc = result?.document as any;
    const text = (doc?.text || '').toString();
    const pages = Array.isArray(doc?.pages) ? doc.pages.length : 1;
    return { text, pages: pages || 1 };
  }

  try {
    const { text, pages } = await processOnlineOnce(pdfBuffer);
    if (!text || text.trim().length === 0) {
      throw new Error(`Document AI returned empty text for "${fileName}"`);
    }
    return { fullText: text, extractionMethod: 'document_ai', pages };
  } catch (e: any) {
    if (!isDocAiPageLimitError(e)) throw e;

    // Split PDF into <=30-page chunks and process sequentially.
    const parts = await splitPdfIntoChunks(pdfBuffer, maxOnlinePages);
    let combined = '';
    let totalPages = 0;

    for (let i = 0; i < parts.length; i++) {
      const { text, pages } = await processOnlineOnce(parts[i]);
      totalPages += pages || 0;
      const trimmed = String(text || '').trim();
      if (trimmed) {
        combined = combined ? `${combined}\n\n${trimmed}` : trimmed;
      }
    }

    if (!combined || combined.trim().length === 0) {
      throw new Error(`Document AI returned empty text for "${fileName}"`);
    }

    return { fullText: combined, extractionMethod: 'document_ai', pages: totalPages || 1 };
  }
}

// Polyfill DOMMatrix and related browser APIs for Node.js environment
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  // Complete DOMMatrix polyfill for pdfjs-dist compatibility
  (global as any).DOMMatrix = class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;
    
    constructor(init?: string | number[]) {
      if (typeof init === 'string') {
        // Parse matrix string if provided
        const values = init.match(/[\d.-]+/g);
        if (values && values.length >= 6) {
          this.m11 = parseFloat(values[0]) || 1;
          this.m12 = parseFloat(values[1]) || 0;
          this.m21 = parseFloat(values[2]) || 0;
          this.m22 = parseFloat(values[3]) || 1;
          this.m41 = parseFloat(values[4]) || 0;
          this.m42 = parseFloat(values[5]) || 0;
          this.a = this.m11;
          this.b = this.m12;
          this.c = this.m21;
          this.d = this.m22;
          this.e = this.m41;
          this.f = this.m42;
        }
      } else if (Array.isArray(init) && init.length >= 6) {
        this.m11 = init[0] || 1;
        this.m12 = init[1] || 0;
        this.m21 = init[2] || 0;
        this.m22 = init[3] || 1;
        this.m41 = init[4] || 0;
        this.m42 = init[5] || 0;
        this.a = this.m11;
        this.b = this.m12;
        this.c = this.m21;
        this.d = this.m22;
        this.e = this.m41;
        this.f = this.m42;
      }
    }
    
    static fromMatrix(other?: any) {
      if (other) {
        return new DOMMatrix([other.m11 || other.a || 1, other.m12 || other.b || 0, 
                              other.m21 || other.c || 0, other.m22 || other.d || 1,
                              other.m41 || other.e || 0, other.m42 || other.f || 0]);
      }
      return new DOMMatrix();
    }
    
    static fromFloat32Array(array: Float32Array) {
      if (array && array.length >= 6) {
        return new DOMMatrix([array[0], array[1], array[2], array[3], array[4], array[5]]);
      }
      return new DOMMatrix();
    }
    
    static fromFloat64Array(array: Float64Array) {
      if (array && array.length >= 6) {
        return new DOMMatrix([array[0], array[1], array[2], array[3], array[4], array[5]]);
      }
      return new DOMMatrix();
    }
    
    multiply(other: any) {
      return new DOMMatrix();
    }
    
    translate(x: number, y: number) {
      return new DOMMatrix();
    }
    
    scale(x: number, y?: number) {
      return new DOMMatrix();
    }
    
    rotate(angle: number) {
      return new DOMMatrix();
    }
  };
  
  // Polyfill ImageData if needed
  if (typeof (global as any).ImageData === 'undefined') {
    (global as any).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(dataOrWidth: Uint8ClampedArray | number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth;
          this.height = height || 0;
          this.data = new Uint8ClampedArray(dataOrWidth * (height || 0) * 4);
        } else {
          this.data = dataOrWidth;
          this.width = 0;
          this.height = height || 0;
        }
      }
    };
  }
  
  // Polyfill Path2D if needed
  if (typeof (global as any).Path2D === 'undefined') {
    (global as any).Path2D = class Path2D {
      constructor(path?: any) {
        // Minimal stub
      }
    };
  }
}

/**
 * Detect if PDF likely contains images (scanned) vs text
 */
function detectPDFType(buffer: Buffer): 'text' | 'image' | 'mixed' {
  const text = buffer.toString('latin1');

  // Count image-related markers
  const imageMarkers = (text.match(/\/Image\s+/g) || []).length;
  const textMarkers = (text.match(/\/Font\s+/g) || []).length;

  // Look for text content markers
  const hasTextContent = /BT[\s\S]*?ET/.test(text) || /\/F\d+\s+\d+\s+Tf/.test(text);

  if (imageMarkers > textMarkers * 2 && imageMarkers > 5) {
    return 'image'; // Likely scanned PDF
  } else if (hasTextContent && textMarkers > 0) {
    return 'text'; // Likely text-based PDF
  } else {
    return 'mixed'; // Could be either
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json({ success: false, error: 'Palmira access requires a plan' }, { status: 403 });
    }

    const url = new URL(request.url);
    const uploadId = url.searchParams.get('uploadId');
    if (!uploadId) {
      return NextResponse.json({ success: false, error: 'Missing uploadId' }, { status: 400 });
    }

    const uploadRef = adminDb.collection('palmira_user_uploads').doc(uploadId);
    const snap = await uploadRef.get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Upload not found' }, { status: 404 });
    }

    const data = snap.data() as any;
    if (data.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const status = String(data.status || '');
    const bucketName = String(data.bucketName || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '');
    const bucket = bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket();

    if (status === 'processed') {
      // Prefer the stored text file if present.
      const extractedTextStoragePath = String(data.extractedTextStoragePath || '');
      if (extractedTextStoragePath) {
        const [buf] = await bucket.file(extractedTextStoragePath).download();
        const fullText = buf.toString('utf8');
        return NextResponse.json({
          success: true,
          data: {
            fullText,
            pages: Number(data.pages || 1),
            metadata: {
              title: data.fileName,
              extractionMethod: data.extractionMethod || 'document_ai_batch',
              uploadId,
              storagePath: data.storagePath,
            },
          },
        });
      }

      // Fallback: no stored text path (should be rare); return pending.
      return NextResponse.json({ success: true, pending: true, uploadId, status: 'processed_missing_text' }, { status: 202 });
    }

    const operationName = String(data.batchOperationName || '');
    const outputPrefix = String(data.batchOutputPrefix || '');
    if (!operationName || !outputPrefix) {
      return NextResponse.json({ success: true, pending: true, uploadId, status: status || 'processing' }, { status: 202 });
    }

    const finalized = await tryFinalizeDocumentAIBatchJob({
      operationName,
      bucketName: bucket.name,
      outputPrefix,
      userId,
      uploadId,
    });

    if (!finalized.done) {
      return NextResponse.json({ success: true, pending: true, uploadId, status: status || 'processing' }, { status: 202 });
    }

    const fullText = finalized.fullText;
    const pages = finalized.pages;

    // Persist extracted text chunks for this upload
    try {
      const chunks = chunkText(fullText, 50_000);
      const batch = adminDb.batch();
      chunks.forEach((chunk, idx) => {
        const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
        batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      });
      batch.update(uploadRef, {
        status: 'processed',
        pages,
        extractionMethod: 'document_ai_batch',
        extractedTextChars: fullText.length,
        extractedTextPreview: fullText.slice(0, 2000),
        extractedTextStoragePath: finalized.extractedTextStoragePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await batch.commit();
    } catch (err) {
      console.warn('Failed to save extracted text chunks:', err);
      await uploadRef.update({
        status: 'processed',
        pages,
        extractionMethod: 'document_ai_batch',
        extractedTextChars: fullText.length,
        extractedTextPreview: fullText.slice(0, 2000),
        extractedTextStoragePath: finalized.extractedTextStoragePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fullText,
        pages,
        metadata: {
          title: data.fileName,
          extractionMethod: 'document_ai_batch',
          uploadId,
          storagePath: data.storagePath,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to check PDF extraction status', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check membership for Palmira access
    const membership = await getMembershipAdmin(userId);
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access requires a plan' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Parse PDF server-side with advanced text extraction and OCR support
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let fullText = '';
      let pages = 1;
      let metadata: any = { title: file.name, extractionMethod: 'unknown' };

      console.log(`Starting PDF extraction for file: ${file.name}, size: ${buffer.length} bytes`);

      // Per-user library storage: store raw PDF in Firebase Storage + metadata in Firestore.
      // Firestore cannot store large binaries; we store a Storage path + extracted-text chunks.
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const bucket = bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket();
      const storagePath = `palmira_user_library/${userId}/${Date.now()}_${sanitizeFileName(file.name)}`;

      const uploadRef = adminDb.collection('palmira_user_uploads').doc();
      const uploadId = uploadRef.id;

      try {
        await bucket.file(storagePath).save(buffer, {
          contentType: 'application/pdf',
          resumable: false,
          metadata: { cacheControl: 'private, max-age=0, no-transform' },
        });

        await uploadRef.set({
          id: uploadId,
          userId,
          fileName: file.name,
          contentType: 'application/pdf',
          sizeBytes: buffer.length,
          bucketName: bucket.name,
          storagePath,
          status: 'uploaded',
          pages: null,
          extractionMethod: null,
          extractedTextChars: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (uploadErr) {
        // For Document AI batch processing we need the PDF in GCS, so fail fast.
        console.warn('Failed to store PDF to user library:', uploadErr);
        return NextResponse.json(
          { success: false, error: 'Failed to upload PDF for processing', details: String((uploadErr as any)?.message || uploadErr), uploadId },
          { status: 500 }
        );
      }

      // Detect PDF type to prioritize extraction method
      const pdfType = detectPDFType(buffer);
      console.log(`Detected PDF type: ${pdfType}`);

      // Use Google Cloud Document AI (server-side PDF text extraction).
      try {
        console.log('Attempting Document AI extraction...');
        // For larger PDFs, prefer batch processing (higher page limits).
        const pageCount = await getPdfPageCount(buffer);
        if (pageCount && pageCount > 30) {
          const gcsInputUri = `gs://${bucket.name}/${storagePath}`;
          const outputPrefix = `palmira_document_ai_output/${userId}/${uploadId}/`;
          const gcsOutputUri = `gs://${bucket.name}/${outputPrefix}`;
          const { operationName, extractionMethod } = await startDocumentAIBatchJob({ gcsInputUri, gcsOutputUri });
          await uploadRef.update({
            status: 'processing',
            extractionMethod,
            batchOperationName: operationName,
            batchOutputPrefix: outputPrefix,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return NextResponse.json(
            {
              success: true,
              pending: true,
              uploadId,
              data: {
                pages: pageCount,
                metadata: { title: file.name, extractionMethod, uploadId, storagePath },
              },
            },
            { status: 202 }
          );
        }

        const docAi = await extractPdfTextWithDocumentAI(buffer, file.name);
        const extracted = (docAi.fullText || '').trim();
    

        if (extracted.length >= 20) {
          fullText = extracted;
          pages = docAi.pages || 1;
          metadata = {
            title: file.name,
            extractionMethod: docAi.extractionMethod,
            detectedType: pdfType,
          };

          // Persist extracted text chunks for this upload
          try {
            const chunks = chunkText(fullText, 50_000);
            const batch = adminDb.batch();
            chunks.forEach((chunk, idx) => {
              const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
              batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
            });
            batch.update(uploadRef, {
              status: 'processed',
              pages,
              extractionMethod: metadata.extractionMethod,
              extractedTextChars: fullText.length,
              extractedTextPreview: fullText.slice(0, 2000),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            await batch.commit();
          } catch (err) {
            console.warn('Failed to save extracted text chunks:', err);
          }

          console.log('Document AI extraction successful, returning result');
          return NextResponse.json({
            success: true,
            data: {
              fullText,
              pages,
              metadata: { ...metadata, uploadId, storagePath },
            },
          });
        } else {
        }
      } catch (docAiErr: any) {
        console.warn('Document AI extraction failed:', docAiErr?.message || docAiErr);

        // If online processing hits page limits, switch to batch processing.
        if (isDocAiPageLimitError(docAiErr)) {
          const gcsInputUri = `gs://${bucket.name}/${storagePath}`;
          const outputPrefix = `palmira_document_ai_output/${userId}/${uploadId}/`;
          const gcsOutputUri = `gs://${bucket.name}/${outputPrefix}`;
          const { operationName, extractionMethod } = await startDocumentAIBatchJob({ gcsInputUri, gcsOutputUri });
          await uploadRef.update({
            status: 'processing',
            extractionMethod,
            batchOperationName: operationName,
            batchOutputPrefix: outputPrefix,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return NextResponse.json(
            {
              success: true,
              pending: true,
              uploadId,
              data: {
                metadata: { title: file.name, extractionMethod, uploadId, storagePath },
              },
            },
            { status: 202 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'PDF text extraction failed (Document AI). Check Document AI env vars & credentials.',
            details: String(docAiErr?.message || docAiErr),
            uploadId,
          },
          { status: 500 }
        );
      }

      // Try extraction methods based on detected PDF type
      if (pdfType === 'image') {
        // For image-based PDFs, try OCR first
        console.log('Detected image-based PDF, trying OCR first...');

        try {
          const ocrText = await performOCR(buffer);
          console.log(`OCR extracted ${ocrText?.length || 0} characters`);

          if (ocrText && ocrText.trim().length > 20) {
            fullText = ocrText.trim();
            pages = 1;
            metadata = {
              title: file.name,
              extractionMethod: 'ocr_image_pdf',
              note: 'Text extracted using OCR from image-based PDF',
              detectedType: pdfType,
            };

            // Persist extracted text chunks for this upload
            try {
              const chunks = chunkText(fullText, 50_000);
              const batch = adminDb.batch();
              chunks.forEach((chunk, idx) => {
                const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
                batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
              });
              batch.update(uploadRef, {
                status: 'processed',
                pages,
                extractionMethod: metadata.extractionMethod,
                extractedTextChars: fullText.length,
                extractedTextPreview: fullText.slice(0, 2000),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              await batch.commit();
            } catch (err) {
              console.warn('Failed to save extracted text chunks:', err);
            }

            console.log('OCR extraction successful for image PDF, returning result');
            return NextResponse.json({
              success: true,
              data: {
                fullText: fullText,
                pages,
                metadata: { ...metadata, uploadId, storagePath },
              },
            });
          }
        } catch (ocrError: any) {
          console.warn('OCR failed for image PDF:', ocrError.message);
        }
      }

      // Method 1: Try advanced PDF text extraction using pdf-parse
      try {
        console.log('Attempting pdf-parse extraction...');
        // NOTE: In this repo, `require('pdf-parse')` exports an object with `PDFParse` class.
        // We use that API to extract text.
        const { PDFParse } = require('pdf-parse');
        // pdf-parse v2 expects binary data as Uint8Array (it rejects Node Buffer explicitly).
        const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const parser = new PDFParse(uint8);
        const pdfData = await parser.getText();

        const extractedText =
          typeof pdfData === 'string'
            ? pdfData
            : (pdfData?.text || '').toString();
        const numPages =
          typeof pdfData === 'object' && pdfData
            ? Number((pdfData as any).numpages || (pdfData as any).pages || 1) || 1
            : 1;

        console.log(`pdf-parse extracted ${extractedText.length} characters from ${numPages} pages`);

        if (extractedText.trim().length > 50) { // Lower threshold for text extraction
          fullText = extractedText.trim();
          pages = numPages;
          metadata = {
            title: pdfData.info?.Title || file.name,
            author: pdfData.info?.Author,
            subject: pdfData.info?.Subject,
            creator: pdfData.info?.Creator,
            producer: pdfData.info?.Producer,
            creationDate: pdfData.info?.CreationDate,
            modDate: pdfData.info?.ModDate,
            extractionMethod: 'text_pdf',
            pages: numPages,
          };

          // Persist extracted text chunks for this upload
          try {
            const chunks = chunkText(fullText, 50_000);
            const batch = adminDb.batch();
            chunks.forEach((chunk, idx) => {
              const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
              batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
            });
            batch.update(uploadRef, {
              status: 'processed',
              pages,
              extractionMethod: metadata.extractionMethod,
              extractedTextChars: fullText.length,
              extractedTextPreview: fullText.slice(0, 2000),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            await batch.commit();
          } catch (err) {
            console.warn('Failed to save extracted text chunks:', err);
          }

          console.log('pdf-parse extraction successful, returning result');
          return NextResponse.json({
            success: true,
            data: {
              fullText: fullText,
              pages,
              metadata: { ...metadata, uploadId, storagePath },
            },
          });
        } else {
          console.warn(`pdf-parse extracted insufficient text (${extractedText.length} chars), trying OCR...`);
        }
      } catch (pdfParseError: any) {
        console.warn('pdf-parse extraction failed:', pdfParseError.message);
      }

      // Method 2: OCR fallback for other PDF types
      if (pdfType !== 'image') { // Skip if we already tried OCR for image PDFs
        try {
          console.log('Attempting OCR extraction as fallback...');
          const ocrText = await performOCR(buffer);
          console.log(`OCR extracted ${ocrText?.length || 0} characters`);

          if (ocrText && ocrText.trim().length > 20) {
            fullText = ocrText.trim();
            pages = 1;
            metadata = {
              title: file.name,
              extractionMethod: 'ocr_image_pdf',
              note: 'Text extracted using OCR from image-based PDF',
              detectedType: pdfType,
            };

            // Persist extracted text chunks for this upload
            try {
              const chunks = chunkText(fullText, 50_000);
              const batch = adminDb.batch();
              chunks.forEach((chunk, idx) => {
                const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
                batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
              });
              batch.update(uploadRef, {
                status: 'processed',
                pages,
                extractionMethod: metadata.extractionMethod,
                extractedTextChars: fullText.length,
                extractedTextPreview: fullText.slice(0, 2000),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              await batch.commit();
            } catch (err) {
              console.warn('Failed to save extracted text chunks:', err);
            }

            console.log('OCR extraction successful as fallback, returning result');
            return NextResponse.json({
              success: true,
              data: {
                fullText: fullText,
                pages,
                metadata: { ...metadata, uploadId, storagePath },
              },
            });
          } else {
            console.warn(`OCR extraction returned insufficient text (${ocrText?.length || 0} chars), trying basic extraction`);
          }
        } catch (ocrError: any) {
          console.warn('OCR extraction failed:', ocrError.message);
        }
      }

      // Method 3: Fallback to basic text extraction (original method)
      try {
        console.log('Attempting basic text extraction as fallback...');
        const pdfText = buffer.toString('latin1');

        // Look for text between BT (Begin Text) and ET (End Text) markers
        const textMatches = pdfText.match(/BT[\s\S]*?ET/g);
        if (textMatches) {
          for (const match of textMatches) {
            const textParts = match.match(/\(([^)]+)\)/g) || [];
            for (const part of textParts) {
              const text = part.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
              if (text.trim()) {
                fullText += text + ' ';
              }
            }
          }
        }

        // Also look for Tj and TJ operators
        const tjMatches = pdfText.match(/\/F\d+\s+\d+\s+Tf[\s\S]*?(?=\/F\d+|BT|ET|endstream)/g);
        if (tjMatches) {
          for (const match of tjMatches) {
            const textParts = match.match(/\(([^)]+)\)/g) || [];
            for (const part of textParts) {
              const text = part.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
              if (text.trim()) {
                fullText += text + ' ';
              }
            }
          }
        }

        // Clean up the text
        fullText = fullText.replace(/\s+/g, ' ').trim();
        console.log(`Basic extraction found ${fullText.length} characters`);

        if (fullText.length > 10) { // Very low threshold for basic extraction
          pages = 1;
          metadata = {
            title: file.name,
            extractionMethod: 'basic_text_fallback',
            note: 'Text extracted using basic PDF parsing (limited capabilities)',
          };

          // Persist extracted text chunks for this upload
          try {
            const chunks = chunkText(fullText, 50_000);
            const batch = adminDb.batch();
            chunks.forEach((chunk, idx) => {
              const chunkRef = uploadRef.collection('text_chunks').doc(String(idx).padStart(4, '0'));
              batch.set(chunkRef, { index: idx, text: chunk, createdAt: admin.firestore.FieldValue.serverTimestamp() });
            });
            batch.update(uploadRef, {
              status: 'processed',
              pages,
              extractionMethod: metadata.extractionMethod,
              extractedTextChars: fullText.length,
              extractedTextPreview: fullText.slice(0, 2000),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            await batch.commit();
          } catch (err) {
            console.warn('Failed to save extracted text chunks:', err);
          }

          console.log('Basic text extraction successful, returning result');
          return NextResponse.json({
            success: true,
            data: {
              fullText: fullText.trim(),
              pages,
              metadata: { ...metadata, uploadId, storagePath },
            },
          });
        }
      } catch (basicError: any) {
        console.warn('Basic PDF extraction failed:', basicError.message);
      }

      // If all methods failed
      console.error('All PDF extraction methods failed for file:', file.name);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to extract text from PDF. The PDF may be corrupted, encrypted, contain only images with poor OCR quality, or be in an unsupported format.',
          details: 'Attempted methods: 1) Advanced text parsing, 2) OCR for scanned documents, 3) Basic text extraction. Please try a different PDF or ensure the document contains readable text.',
          suggestions: [
            'Ensure the PDF opens correctly in a PDF viewer',
            'If it\'s a scanned document, ensure the text is clear and not too small',
            'Try converting the PDF to a different format and back',
            'Contact support if the issue persists'
          ]
        },
        { status: 500 }
      );

    } catch (error: any) {
      console.error('Error in PDF extraction:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to extract text from PDF: ${error.message}. Please try a different PDF file.`
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in PDF extraction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Perform OCR on PDF pages to extract text from image-based PDFs
 */
async function performOCR(pdfBuffer: Buffer): Promise<string | null> {
  try {
    const { createWorker } = require('tesseract.js');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { fromBuffer } = require('pdf2pic');

    // Create temporary directory for processing
    const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      console.log('Creating PDF to image converter...');
      // Create converter function from buffer
      const convert = fromBuffer(pdfBuffer, {
        density: 200,           // Higher DPI for better OCR
        saveFilename: "page",
        savePath: tempDir,
        format: "png",
        width: 2000,           // Higher resolution
        height: 2000
      });

      // Perform OCR across multiple pages (best-effort).
      // NOTE: This is intentionally bounded for performance/timeouts.
      const MAX_OCR_PAGES = 12;

      console.log('Starting OCR worker...');
      // Next.js bundles route handlers; tesseract's default worker path can break in dev.
      // Force absolute paths to the Node worker script + core.
      // IMPORTANT: avoid `require.resolve(...)` here because Next dev can rewrite it to `.next/dev/...`.
      // Build paths from cwd to ensure they point at real files in node_modules.
      const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
      const corePath = path.join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js');

      if (!fs.existsSync(workerPath) || !fs.existsSync(corePath)) {
        console.error('OCR worker/core path missing; skipping OCR', { workerPath, corePath });
        return null;
      }

      const worker = await createWorker({
        workerPath,
        corePath,
        logger: (m: any) => console.log('OCR Progress:', m), // Add progress logging
      });
      await worker.loadLanguage('eng+msa'); // Load English and Malay
      await worker.initialize('eng+msa'); // Initialize with both languages

      let combinedText = '';

      for (let page = 1; page <= MAX_OCR_PAGES; page++) {
        console.log(`Converting PDF page ${page} to image...`);
        let result: any;
        try {
          result = await convert(page);
        } catch (e) {
          console.warn(`Stopping OCR: failed to convert page ${page}`, e);
          break;
        }

        const imagePath = result?.path;
        if (!imagePath || !fs.existsSync(imagePath)) {
          console.warn(`Stopping OCR: image not found for page ${page}`, { imagePath });
          break;
        }

        console.log(`Running OCR recognition for page ${page}...`);
        const perPageTimeoutMs = 20000;
        const ocrPromise = worker.recognize(imagePath);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`OCR timeout after ${perPageTimeoutMs}ms (page ${page})`)), perPageTimeoutMs)
        );

        try {
          const { data: { text } } = await Promise.race([ocrPromise, timeoutPromise]) as any;
          const pageText = (text || '').toString().trim();
          if (pageText.length > 0) {
            combinedText += `\n\n--- PAGE ${page} ---\n\n${pageText}`;
          }
        } catch (e) {
          console.warn(`OCR failed/timed out for page ${page}`, e);
          // continue to next page
        } finally {
          // Cleanup page image
          try {
            fs.unlinkSync(imagePath);
          } catch (cleanupError) {
            console.warn('Failed to clean up OCR image file:', cleanupError);
          }
        }
      }

      await worker.terminate();

      // Clean up temp directory
      try {
        fs.rmdirSync(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary directory:', cleanupError);
      }

      const final = combinedText.trim();
      console.log(`OCR completed, extracted ${final.length} characters across pages`);
      console.log('Sample OCR text:', final.substring(0, 200));
      return final.length > 0 ? final : null;

    } catch (conversionError) {
      console.error('PDF to image conversion failed:', conversionError);
      // Clean up on error
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir, { recursive: true });
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary directory:', cleanupError);
      }
      return null;
    }

  } catch (error: any) {
    console.error('OCR processing failed:', error);
    return null;
  }
}
