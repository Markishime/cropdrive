/**
 * Palmira PDF Processing Utilities
 * 
 * This module handles PDF extraction and structuring for Palmira chatbot.
 * In production, integrate with a proper PDF parsing library like pdf-parse or pdf.js
 */

export interface PDFSection {
  id: string;
  title: string;
  content: string;
  keyValues: Record<string, any>;
}

export interface ExtractedPDFData {
  sections: PDFSection[];
  summary?: string;
  fullText?: string; // Full extracted text from PDF
  metadata?: {
    title?: string;
    date?: string;
    type?: 'soil' | 'leaf' | 'other';
  };
}

/**
 * Extract and structure PDF data using best parsing libraries
 */
export async function extractPDFData(
  fileUrl: string,
  fileType: 'pdf' | 'image' | 'excel'
): Promise<ExtractedPDFData> {
  try {
    if (fileType === 'pdf') {
      return await extractPDF(fileUrl);
    } else if (fileType === 'excel') {
      return await extractExcel(fileUrl);
    } else {
      // For images, you would use OCR here
      throw new Error('Image OCR not yet implemented');
    }
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw error;
  }
}

/**
 * Extract data from PDF using advanced parsing with OCR fallback
 */
async function extractPDF(fileUrl: string): Promise<ExtractedPDFData> {
  try {
    // Note: pdf-parse requires Node.js Buffer, so this should be called server-side
    // For client-side, use pdfjs-dist instead
    if (typeof window !== 'undefined') {
      // Client-side: use pdfjs-dist
      return await extractPDFClient(fileUrl);
    }

    // Server-side: enhanced PDF extraction with OCR support
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fullText = '';
    let metadata: any = {};
    let extractionMethod = 'unknown';

    // Method 1: Try pdf-parse for text-based PDFs
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);

      if (data.text && data.text.trim().length > 100) {
        fullText = data.text.trim();
        metadata = {
          title: data.info?.Title || 'Untitled',
          author: data.info?.Author,
          subject: data.info?.Subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate,
          modDate: data.info?.ModDate,
          pages: data.numpages || 1,
        };
        extractionMethod = 'text_pdf';
      }
    } catch (pdfParseError: any) {
      console.warn('pdf-parse failed:', pdfParseError.message);
    }

    // Method 2: OCR fallback for image-based PDFs
    if (!fullText || fullText.length < 100) {
      try {
        console.log('Attempting OCR extraction...');
        const ocrText = await performOCR(buffer);
        if (ocrText && ocrText.trim().length > 50) {
          fullText = ocrText.trim();
          extractionMethod = 'ocr_image_pdf';
          metadata.note = 'Text extracted using OCR from image-based PDF';
        }
      } catch (ocrError: any) {
        console.warn('OCR failed:', ocrError.message);
      }
    }

    // Parse extracted text into structured sections
    const sections = parsePDFSections(fullText);
    const hasSoilData = detectSoilAnalysis(fullText);

    return {
      sections: sections.length > 0 ? sections : [{
        id: 'content',
        title: 'Document Content',
        content: fullText.substring(0, 2000),
        keyValues: {},
      }],
      fullText: fullText,
      summary: generateSummary(fullText, hasSoilData),
      metadata: {
        ...metadata,
        title: metadata.title || 'Untitled Document',
        type: hasSoilData ? 'soil' : 'other',
        extractionMethod,
      },
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

/**
 * Perform OCR on PDF buffer
 */
async function performOCR(pdfBuffer: Buffer): Promise<string | null> {
  try {
    const { createWorker } = require('tesseract.js');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { pdf2pic } = require('pdf2pic');

    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Convert PDF to images (first page only for performance)
      const convert = pdf2pic.fromBuffer(pdfBuffer, {
        density: 200,
        saveFilename: "page",
        savePath: tempDir,
        format: "png",
        width: 2000,
        height: 2000
      });

      const result = await convert(1);
      const imagePath = result.path;

      if (!fs.existsSync(imagePath)) {
        throw new Error('PDF to image conversion failed');
      }

      // Perform OCR
      const worker = await createWorker('eng+msa');
      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        tessedit_ocr_engine_mode: '2',
      });

      const { data: { text } } = await worker.recognize(imagePath);
      await worker.terminate();

      // Cleanup
      try {
        fs.unlinkSync(imagePath);
        fs.rmdirSync(tempDir);
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }

      return text?.trim() || null;
    } catch (conversionError) {
      console.error('PDF conversion failed:', conversionError);
      // Cleanup on error
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir, { recursive: true });
        }
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      return null;
    }
  } catch (error: any) {
    console.error('OCR processing failed:', error);
    return null;
  }
}

/**
 * Parse PDF text into structured sections
 */
function parsePDFSections(text: string): PDFSection[] {
  const sections: PDFSection[] = [];

  // Extract summary section
  if (text.includes('Summary') || text.includes('summary') || text.includes('Ringkasan')) {
    const summaryMatch = text.match(/(?:Summary|SUMMARY|Ringkasan)[\s\S]{0,800}/i);
    if (summaryMatch) {
      sections.push({
        id: 'summary',
        title: 'Summary',
        content: summaryMatch[0].trim(),
        keyValues: {},
      });
    }
  }

  // Extract soil/leaf analysis data
  const soilKeywords = ['pH', 'nitrogen', 'phosphorus', 'potassium', 'N', 'P', 'K', 'kalsium', 'magnesium', 'sulfur'];
  const hasSoilData = soilKeywords.some(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasSoilData) {
    const keyValues: Record<string, any> = {};

    // Extract pH
    const pHMatch = text.match(/pH[:\s]+([\d.]+)/i);
    if (pHMatch) keyValues.pH = parseFloat(pHMatch[1]);

    // Extract Nitrogen
    const nitrogenMatch = text.match(/(?:nitrogen|N|nitrogen total)[:\s]+([\d.]+)/i);
    if (nitrogenMatch) keyValues.nitrogen = parseFloat(nitrogenMatch[1]);

    // Extract Phosphorus
    const phosphorusMatch = text.match(/(?:phosphorus|P|fosforus)[:\s]+([\d.]+)/i);
    if (phosphorusMatch) keyValues.phosphorus = parseFloat(phosphorusMatch[1]);

    // Extract Potassium
    const potassiumMatch = text.match(/(?:potassium|K|kalium)[:\s]+([\d.]+)/i);
    if (potassiumMatch) keyValues.potassium = parseFloat(potassiumMatch[1]);

    // Extract other nutrients
    const calciumMatch = text.match(/(?:calcium|Ca|kalsium)[:\s]+([\d.]+)/i);
    if (calciumMatch) keyValues.calcium = parseFloat(calciumMatch[1]);

    const magnesiumMatch = text.match(/(?:magnesium|Mg|magnesium)[:\s]+([\d.]+)/i);
    if (magnesiumMatch) keyValues.magnesium = parseFloat(magnesiumMatch[1]);

    sections.push({
      id: 'soil_analysis',
      title: 'Soil Analysis',
      content: text.substring(0, 1500),
      keyValues,
    });
  }

  // Extract recommendations
  if (text.includes('recommendation') || text.includes('cadangan') || text.includes('suggestion')) {
    const recMatch = text.match(/(?:recommendations?|cadangan|suggestions?)[\s\S]{0,1000}/i);
    if (recMatch) {
      sections.push({
        id: 'recommendations',
        title: 'Recommendations',
        content: recMatch[0].trim(),
        keyValues: {},
      });
    }
  }

  return sections;
}

/**
 * Detect if text contains soil analysis data
 */
function detectSoilAnalysis(text: string): boolean {
  const soilKeywords = ['pH', 'nitrogen', 'phosphorus', 'potassium', 'soil', 'tanah', 'analysis', 'analisis'];
  return soilKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * Generate a summary from extracted text
 */
function generateSummary(text: string, hasSoilData: boolean): string {
  if (hasSoilData) {
    // For soil analysis, extract key nutrient values
    const lines = text.split('\n').slice(0, 10);
    return lines.join(' ').substring(0, 500) + (text.length > 500 ? '...' : '');
  } else {
    // General summary
    return text.substring(0, 300) + (text.length > 300 ? '...' : '');
  }
}

/**
 * Extract data from Excel using exceljs (avoids xlsx vuln)
 */
async function extractExcel(fileUrl: string): Promise<ExtractedPDFData> {
  try {
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();

    // Fetch Excel file
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    // exceljs expects a Buffer; cast to any to satisfy Node's generic Buffer typing
    await workbook.xlsx.load(Buffer.from(arrayBuffer) as any);

    const sections: PDFSection[] = [];

    // Process each worksheet
    workbook.worksheets.forEach((worksheet, index) => {
      // Build header row
      const headerRow = worksheet.getRow(1);
      const headerValues = (headerRow.values ?? []) as unknown as any[];
      const headers = headerValues
        .slice(1) // exceljs rows are 1-indexed; index 0 is empty
        .map((h: any, i: number) => (h ?? `Column${i + 1}`).toString().trim());

      const rows: Array<Record<string, any>> = [];
      const maxRows = Math.min(worksheet.rowCount, 501); // header + 500 rows max

      for (let r = 2; r <= maxRows; r++) {
        const row = worksheet.getRow(r);
        const rowValues = (row.values ?? []) as unknown as any[];
        const values = rowValues.slice(1);
        const obj: Record<string, any> = {};
        let hasAny = false;

        for (let c = 0; c < headers.length; c++) {
          const key = headers[c] || `Column${c + 1}`;
          const value = values[c];
          if (value !== null && value !== undefined && value !== '') {
            hasAny = true;
          }
          obj[key] = value;
        }

        if (hasAny) {
          rows.push(obj);
        }
      }

      if (rows.length > 0) {
        sections.push({
          id: `sheet_${index}`,
          title: worksheet.name || `Sheet ${index + 1}`,
          content: JSON.stringify(rows, null, 2),
          keyValues: rows[0] || {},
        });
      }
    });

    return {
      sections,
      summary: `Excel file with ${workbook.worksheets.length} sheet(s)`,
      metadata: {
        type: 'other',
      },
    };
  } catch (error) {
    console.error('Error parsing Excel:', error);
    throw error;
  }
}

/**
 * Extract PDF on client-side (fallback - actual parsing done server-side)
 */
async function extractPDFClient(fileUrl: string): Promise<ExtractedPDFData> {
  try {
    // Client-side parsing is now handled server-side via API
    // This function is kept for compatibility but doesn't do actual parsing
    return {
      sections: [{
        id: 'content',
        title: 'Document Content',
        content: 'PDF content will be extracted server-side',
        keyValues: {},
      }],
      fullText: 'PDF content will be extracted server-side',
      summary: 'PDF content will be extracted server-side',
      metadata: {
        type: 'other',
      },
    };
  } catch (error) {
    console.error('Error parsing PDF (client):', error);
    throw error;
  }
}

/**
 * Structure report data into sections for guided navigation
 */
export function structureReportSections(
  analysisData: any
): PDFSection[] {
  const sections: PDFSection[] = [];

  // Extract summary section
  if (analysisData.summary) {
    sections.push({
      id: 'summary',
      title: 'Summary',
      content: analysisData.summary,
      keyValues: {},
    });
  }

  // Extract analysis results
  if (analysisData.analysisData) {
    const data = analysisData.analysisData;

    // Soil analysis section
    if (data.ph !== undefined || data.nitrogen !== undefined) {
      sections.push({
        id: 'soil_analysis',
        title: 'Soil Analysis',
        content: 'Soil nutrient analysis results',
        keyValues: {
          pH: data.ph,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
        },
      });
    }

    // Recommendations section
    if (data.recommendations || analysisData.recommendations) {
      const recommendations =
        data.recommendations || analysisData.recommendations || [];
      sections.push({
        id: 'recommendations',
        title: 'Recommendations',
        content: Array.isArray(recommendations)
          ? recommendations.join('\n')
          : recommendations,
        keyValues: {
          count: Array.isArray(recommendations) ? recommendations.length : 0,
        },
      });
    }

    // MPOB Standards section
    if (data.mpoStandards || data.mpoStandards) {
      sections.push({
        id: 'mpob_standards',
        title: 'MPOB Standards Comparison',
        content: 'Comparison with MPOB standards',
        keyValues: data.mpoStandards || {},
      });
    }
  }

  return sections;
}

/**
 * Get section by ID for guided navigation
 */
export function getSectionById(
  sections: PDFSection[],
  sectionId: string
): PDFSection | null {
  return sections.find(s => s.id === sectionId) || null;
}

/**
 * Format section content for chat context
 */
export function formatSectionForContext(section: PDFSection): string {
  let formatted = `**${section.title}**\n\n${section.content}\n\n`;

  if (Object.keys(section.keyValues).length > 0) {
    formatted += '**Key Values:**\n';
    for (const [key, value] of Object.entries(section.keyValues)) {
      if (value !== null && value !== undefined) {
        formatted += `- ${key}: ${value}\n`;
      }
    }
  }

  return formatted;
}
