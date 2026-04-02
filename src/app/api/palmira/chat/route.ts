import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getMembershipAdmin, canAccessPalmira } from '@/lib/membership-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Using adminDb from firebase-admin

interface ChatRequest {
  message: string;
  chatId?: string;
  reportId?: string;
  pdfContext?: string;
  pdfFileName?: string;
  pdfUploadId?: string;
  context?: {
    sectionId?: string;
    previousMessages?: number;
  };
}

// Safety boundaries - topics to refuse
const RESTRICTED_TOPICS = [
  'illegal activities',
  'harmful practices',
  'unauthorized advice',
  'financial advice',
  'investment advice',
  'medical advice',
  'legal advice',
];

// Product naming rules
const PRODUCT_NAMES = {
  correct: ['CropDrive', 'Palmira'],
  incorrect: ['crop drive', 'crop-drive', 'cropdrive'],
};

function stripMarkdownHeadingsOutsideCodeBlocks(text: string): string {
  if (!text) return text;
  // Split on fenced code blocks and only transform non-code segments.
  const parts = text.split(/```[\s\S]*?```/g);
  const fences = text.match(/```[\s\S]*?```/g) || [];
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    // Remove leading markdown heading markers (e.g. ### Title) → Title
    const cleaned = parts[i].replace(/^#{1,6}\s+/gm, '');
    out.push(cleaned);
    if (i < fences.length) out.push(fences[i]);
  }
  return out.join('');
}

function stripLeadingFiller(text: string): string {
  if (!text) return text;
  const trimmed = text.replace(/^\s+/, '');

  // Common English/Malay filler starts we want to avoid.
  const patterns: RegExp[] = [
    /^(of course|sure|certainly|absolutely|definitely|no problem|okay|ok)\s*[!,.:-]?\s+/i,
    /^(ya|baik|boleh|sudah tentu|tentu sekali)\s*[!,.:-]?\s+/i,
  ];

  let out = trimmed;
  for (let i = 0; i < 3; i++) {
    const before = out;
    for (const p of patterns) out = out.replace(p, '');
    if (out === before) break;
  }
  return out;
}

function stripExcessiveFiller(text: string): string {
  if (!text) return text;
  
  // Preserve fenced code blocks exactly.
  const parts = text.split(/```[\s\S]*?```/g);
  const fences = text.match(/```[\s\S]*?```/g) || [];
  const out: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    let seg = parts[i];

    // Remove overly enthusiastic filler phrases (English)
    seg = seg.replace(/\bThat is an? (absolutely )?brilliant question[!.]?\s*/gi, '');
    seg = seg.replace(/\bWhat an? (excellent|great|fantastic|wonderful|brilliant) question[!.]?\s*/gi, '');
    seg = seg.replace(/\bThis is (a )?(huge|great|fantastic|excellent) (clue|question|point)[!.]?\s*/gi, '');
    seg = seg.replace(/\bI('m| am) so (excited|thrilled|happy|delighted) to help[!.]?\s*/gi, '');
    seg = seg.replace(/\bI('m| am) (absolutely )?(thrilled|excited|delighted)[!.]?\s*/gi, '');
    seg = seg.replace(/\bThis is (absolutely )?fantastic[!.]?\s*/gi, '');
    seg = seg.replace(/\bThe food is on the table[^.]*\.\s*/gi, '');
    seg = seg.replace(/\bI am so excited to get to the bottom of this for you[!.]?\s*/gi, '');
    seg = seg.replace(/\bYes,? absolutely[!.]?\s*/gi, '');
    seg = seg.replace(/\bAbsolutely[!.,]?\s+/gi, '');

    // Remove overly enthusiastic filler phrases (Malay)
    seg = seg.replace(/\bIni adalah soalan yang (sangat )?(cemerlang|hebat|fantastik)[!.]?\s*/gi, '');
    seg = seg.replace(/\bSaya sangat (teruja|gembira|seronok) untuk membantu[!.]?\s*/gi, '');
    seg = seg.replace(/\bIni (sangat )?menarik[!.]?\s*/gi, '');

    // Remove "It's one of the most important..." type phrases
    seg = seg.replace(/\bIt'?s one of the most important[^.]*\.\s*/gi, '');
    seg = seg.replace(/\band it shows you are really thinking deeply[^.]*\.\s*/gi, '');

    // Cleanup spacing
    seg = seg.replace(/[ \t]{2,}/g, ' ');
    seg = seg.replace(/\n{3,}/g, '\n\n');
    out.push(seg.trim());

    if (i < fences.length) out.push(fences[i]);
  }

  return out.join('').replace(/\s{2,}/g, ' ').trim();
}

function stripPersonaClaims(text: string): string {
  if (!text) return text;
  // Only sanitize outside fenced code blocks so we don't mangle any code snippets.
  const parts = text.split(/```[\s\S]*?```/g);
  const fences = text.match(/```[\s\S]*?```/g) || [];
  const out: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    let seg = parts[i];

    // Remove common self-credential / self-experience phrasing (English + Malay).
    seg = seg.replace(/\b(in|from)\s+my\s+experience\b[,:]?\s*/gi, '');
    seg = seg.replace(/\bbased\s+on\s+my\s+experience\b[,:]?\s*/gi, '');
    seg = seg.replace(/\bpengalaman\s+saya\b[,:]?\s*/gi, '');
    seg = seg.replace(/\bberdasarkan\s+pengalaman\s+saya\b[,:]?\s*/gi, '');

    // Remove common "as an expert/professional..." lead-ins.
    seg = seg.replace(
      /\b(as an?|as your)\s+(agronomist|expert|specialist|advisor|consultant|professor|researcher|scientist)\b[,:]?\s*/gi,
      ''
    );
    seg = seg.replace(/\bsebagai\s+(pakar|agronomis|penasihat|profesor|penyelidik|saintis)\b[,:]?\s*/gi, '');

    // Remove common "credentials/experience" claims if the model slips them in.
    seg = seg.replace(/\bphd\b\s*(in\s+[a-z\s]+)?/gi, '');
    seg = seg.replace(/\bdoctorate\b\s*(in\s+[a-z\s]+)?/gi, '');
    seg = seg.replace(/\b\d+\s*\+?\s*years?\b\s*(of\s*)?(practical\s*)?experience\b/gi, '');
    seg = seg.replace(/\b(\d+\s*\+?\s*tahun)\b\s*(pengalaman)?/gi, '');
    seg = seg.replace(/\b40\s*\+?\s*years?\b/gi, '');
    seg = seg.replace(/\bprofessor\b/gi, '');

    // Remove standalone "I'm a PhD/professor/expert..." sentences/lines.
    seg = seg.replace(
      /(^|\n)\s*(i(?:'m| am))\s+(?:a|an)\s+[^.\n]{0,80}\b(phd|doctorate|professor|expert|specialist)\b[^.\n]*[.\n]/gi,
      '$1'
    );
    seg = seg.replace(
      /(^|\n)\s*saya\s+(?:seorang\s+)?[^.\n]{0,80}\b(phd|doktor|profesor|pakar)\b[^.\n]*[.\n]/gi,
      '$1'
    );

    // Cleanup spacing
    seg = seg.replace(/[ \t]{2,}/g, ' ');
    seg = seg.replace(/\n{3,}/g, '\n\n');
    out.push(seg.trim());

    if (i < fences.length) out.push(fences[i]);
  }

  return out.join('').replace(/\s{2,}/g, ' ').trim();
}

function redactConfidentials(text: string): string {
  if (!text) return text;
  let out = text;

  // Private keys / PEM blocks
  out = out.replace(
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    '[REDACTED_PRIVATE_KEY]'
  );

  // Common API keys / tokens (best-effort redaction)
  out = out.replace(/\bAIza[0-9A-Za-z\-_]{35}\b/g, '[REDACTED_API_KEY]');
  out = out.replace(/\bsk_(live|test)_[0-9a-zA-Z]{16,}\b/g, '[REDACTED_STRIPE_KEY]');
  out = out.replace(/\brk_(live|test)_[0-9a-zA-Z]{16,}\b/g, '[REDACTED_STRIPE_KEY]');
  out = out.replace(/\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g, '[REDACTED_TOKEN]');

  // JWT-like tokens
  out = out.replace(
    /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    '[REDACTED_TOKEN]'
  );

  // Avoid mentioning prompts/internal secrets explicitly
  out = out.replace(/\b(system\s+prompt|internal\s+prompt|developer\s+message)\b/gi, '[REDACTED_INTERNAL]');

  return out;
}

function normalizeChecklistFormattingOutsideCodeBlocks(text: string): string {
  if (!text) return text;

  // Preserve fenced code blocks exactly.
  const parts = text.split(/```[\s\S]*?```/g);
  const fences = text.match(/```[\s\S]*?```/g) || [];
  const out: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    // Ensure checklist markers don't stay inline in a paragraph.
    let segment = parts[i].replace(/(\S)\s+✓\s+/g, '$1\n✓ ');
    // When "Item 2:", "Item 3:", etc. appear on the same line as prior content, put them on a new line (one item per line).
    segment = segment.replace(/(Item\s*\d+\s*:[^\n]*?)\s+(Item\s*\d+\s*:)/gi, '$1\n\n$2');
    const lines = segment.split('\n');

    let inChecklistBlock = false;
    let seenFirstInBlock = false;

    const rewritten = lines.map((line) => {
      const original = line;
      const trimmed = line.trim();

      // Reset block on blank lines.
      if (trimmed.length === 0) {
        inChecklistBlock = false;
        seenFirstInBlock = false;
        return original;
      }

      // Normalize common "✓ 1." / "✓ 1)" / "✓ 1:" → "✓ Item 1:"
      const m = trimmed.match(/^✓\s*(\d+)\s*[\.\)\:]\s*(.*)$/);
      if (m) {
        const n = m[1];
        const rest = m[2] || '';
        inChecklistBlock = true;
        const prefix = seenFirstInBlock ? '  ✓ ' : '✓ ';
        seenFirstInBlock = true;
        return `${prefix}Item ${n}: ${rest}`.trimEnd();
      }

      // Normalize "✓ Item 1 ..." → enforce ":" after the number
      const m2 = trimmed.match(/^✓\s*Item\s*(\d+)\s*[:\-]?\s*(.*)$/i);
      if (m2) {
        const n = m2[1];
        const rest = m2[2] || '';
        inChecklistBlock = true;
        const prefix = seenFirstInBlock ? '  ✓ ' : '✓ ';
        seenFirstInBlock = true;
        return `${prefix}Item ${n}: ${rest}`.trimEnd();
      }

      // If we're in a checklist block and we see another "✓ ..." line, keep it on new line and indent.
      const m3 = trimmed.match(/^✓\s*(.*)$/);
      if (m3 && inChecklistBlock) {
        const rest = m3[1] || '';
        const prefix = seenFirstInBlock ? '  ✓ ' : '✓ ';
        seenFirstInBlock = true;
        return `${prefix}${rest}`.trimEnd();
      }

      return original;
    });

    out.push(rewritten.join('\n'));
    if (i < fences.length) out.push(fences[i]);
  }

  return out.join('');
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
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check membership for Palmira access
    const membership = await getMembershipAdmin(userId);
    // Palmira should be usable for active members AND cancelled members
    // who are still within their paid period (full access until period end).
    if (!canAccessPalmira(membership)) {
      return NextResponse.json(
        { success: false, error: 'Palmira access requires a plan' },
        { status: 403 }
      );
    }

    const body: any = await request.json();
    const { message, pdfContext, pdfFileName, pdfUploadId, chatId, reportId, context } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user onboarding (farm profile) for personalization – doc id is userId
    const onboardingDoc = await adminDb
      .collection('palmira_onboarding')
      .doc(userId)
      .get();

    const onboardingData = onboardingDoc.exists ? onboardingDoc.data() : null;

    // Get active report data if reportId is provided
    let activeReportData = null;
    if (reportId) {
      const reportDoc = await adminDb
        .collection('analysis_results')
        .doc(reportId)
        .get();

      if (reportDoc.exists) {
        activeReportData = reportDoc.data();
      }
    }

    // Handle large content by truncating if necessary (Firestore 1MB limit per field and AI token safety)
    let finalMessage = message;
    if (message.length > 800000) { // ~800KB threshold to be safe
      finalMessage = message.substring(0, 800000) + '\n\n[Content truncated due to size limit]';
    }

    // Create chat if it doesn't exist
    let currentChatId = chatId;
    if (!currentChatId) {
      const chatRef = adminDb.collection('palmira_chats').doc();
      currentChatId = chatRef.id;

      await chatRef.set({
        id: currentChatId,
        userId,
        title: `Chat ${new Date().toLocaleDateString()}`,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const chatRef = adminDb.collection('palmira_chats').doc(currentChatId);

    // Save user message to Firestore
    const userMessageRef = adminDb
      .collection('palmira_chats')
      .doc(currentChatId)
      .collection('messages')
      .doc();

    // Handle large content by truncating if necessary (Firestore 1MB limit per field)
    let finalContent = message;

    // Check if PDF context was provided separately
    if (pdfContext) {
      // Store PDF reference in metadata, but not the full content (Firestore doesn't allow large nested entities)
      // The PDF content will be sent to AI but not stored in Firestore to avoid size limits
      finalContent = message; // Keep user message clean for display
    }

    // Truncate content if still too large (keep first 800KB to be safe)
    if (finalContent.length > 800000) {
      finalContent = finalContent.substring(0, 800000) + '\n\n[Content truncated due to size limit]';
    }

    const userMessage = {
      id: userMessageRef.id,
      chatId: currentChatId,
      userId,
      role: 'user',
      content: finalContent,
      metadata: {
        reportId: reportId || null,
        sectionId: context?.sectionId || null,
        // PDF applies only when explicitly attached for THIS message.
        hasPdf: !!(pdfContext || pdfUploadId),
        pdfFileName: pdfFileName || null,
        pdfUploadId: pdfUploadId || null,
      },
      createdAt: FieldValue.serverTimestamp(),
    };

    await userMessageRef.set(userMessage);

    // If client didn't send pdfContext but provided a library uploadId, load it from Firestore
    let resolvedPdfContext: string | undefined = pdfContext;
    let resolvedPdfFileName: string | undefined = pdfFileName;
    if ((!resolvedPdfContext || resolvedPdfContext.trim().length === 0) && pdfUploadId) {
      try {
        const uploadDoc = await adminDb.collection('palmira_user_uploads').doc(pdfUploadId).get();
        if (uploadDoc.exists) {
          const uploadData = uploadDoc.data();
          if (uploadData?.userId === userId) {
            if (!resolvedPdfFileName && uploadData?.fileName) {
              resolvedPdfFileName = String(uploadData.fileName);
            }
            const chunksSnap = await adminDb
              .collection('palmira_user_uploads')
              .doc(pdfUploadId)
              .collection('text_chunks')
              .orderBy('index', 'asc')
              .get();
            const text = chunksSnap.docs.map(d => (d.data() as any).text || '').join('');
            resolvedPdfContext = text || undefined;
          }
        }
      } catch (e) {
        console.warn('Failed to load pdfContext from user library:', e);
      }
    }

    // Generate AI response using Google Gemini (use truncated finalMessage to avoid oversized prompts)
    const aiResponseRaw = await generateAIResponse(
      finalMessage,
      resolvedPdfContext,
      resolvedPdfFileName,
      onboardingData,
      activeReportData,
      currentChatId,
      userId
    );
    const aiResponse = {
      ...aiResponseRaw,
      content: redactConfidentials(
        stripPersonaClaims(
          stripExcessiveFiller(
            normalizeChecklistFormattingOutsideCodeBlocks(
              stripLeadingFiller(stripMarkdownHeadingsOutsideCodeBlocks(aiResponseRaw.content))
            )
          )
        )
      ),
    };

    // Save AI response to Firestore
    const aiMessageRef = adminDb
      .collection('palmira_chats')
      .doc(currentChatId)
      .collection('messages')
      .doc();

    const aiMessage = {
      id: aiMessageRef.id,
      chatId: currentChatId,
      userId,
      role: 'assistant',
      content: aiResponse.content,
      metadata: {
        reportSectionRefs: aiResponse.reportSectionRefs || [],
        escalated: aiResponse.escalated || false,
        escalationReason: aiResponse.escalationReason || null,
      },
      createdAt: FieldValue.serverTimestamp(),
    };

    await aiMessageRef.set(aiMessage);

    // Update chat's updatedAt timestamp
    await adminDb
      .collection('palmira_chats')
      .doc(currentChatId)
      .update({
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse.content,
        chatId: currentChatId,
        messageId: aiMessageRef.id,
        metadata: {
          knowledgeBaseRefs: [],
          reportSectionRefs: aiResponse.reportSectionRefs || [],
          escalated: aiResponse.escalated || false,
          escalationReason: aiResponse.escalationReason || null,
          transcriptSaved: true,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in Palmira chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  onboardingData: any,
  reportData: any,
  knowledgeBaseRefs: any[],
  userMessage?: string,
  isFirstMessage: boolean = false,
  pdfContext?: string,
  pdfFileName?: string
): string {
  const language = onboardingData?.language || 'en';
  const userType = onboardingData?.userType || 'farmer';
  const conversationStyle = onboardingData?.conversationStyle || 'short_direct';

  const completenessRule = language === 'ms'
    ? `KETEPATAN DAN KELENGKAPAN (WAJIB): Jawab soalan pengguna SEPENUHNYA dan dengan tepat. Jika pengguna minta terangkan langkah 1 hingga 5, berikan SEMUA langkah 1, 2, 3, 4, dan 5—jangan berhenti di langkah 1 atau beri jawapan separa. Baca soalan dengan teliti dan lengkapkan setiap bahagian yang diminta.`
    : `ACCURACY AND COMPLETENESS (MANDATORY): Answer the user's question FULLY and correctly. If the user asks to explain steps 1 to 5, cover ALL steps 1, 2, 3, 4, and 5—do not stop at step 1 or give a partial answer. Read the question carefully and address every part requested.`;

  const styleInstructions: Record<string, string> = {
    short_direct: language === 'ms'
      ? `MODE SEMASA: SHORT DIRECT (Ringkas & Langsung)
Anda MESTI menjawab dalam gaya SHORT sahaja. Setiap respons:
1. Langsung ke titik. Maksimum 8 ayat. Tiada perenggan panjang.
2. JANGAN guna senarai semak, bullet, atau "✓". Hanya prosa pendek.
3. JANGAN tanya soalan susulan melainkan sangat perlu.
4. Jawab soalan yang ditanya SEPENUHNYA (jika dia minta A sampai E, sentuh semua).
OUTPUT: Prosa berterusan, sehingga 8 ayat sahaja.`
      : `CURRENT MODE: SHORT DIRECT
You MUST respond in SHORT style only. Every response:
1. Be direct and to the point. Maximum 8 sentences. No long paragraphs.
2. DO NOT use checklists, bullet lists, or "✓". Use short plain prose only.
3. DO NOT ask follow-up questions unless strictly necessary.
4. Answer the question asked FULLY (if they ask for A through E, cover all).
OUTPUT: Plain prose only, up to 8 sentences.`,
    checklist_only: language === 'ms'
      ? `MODE SEMASA: CHECKLIST ONLY (Senarai Semak Sahaja)
Anda MESTI menjawab dalam gaya CHECKLIST sahaja. Tiada lain.
1. Setiap respons WAJIB senarai semak sahaja. JANGAN guna perenggan, ayat berterusan, atau penjelasan panjang.
2. WAJIB guna "Item N: [tindakan]" atau "✓ Item N: [tindakan]". SETIAP ITEM PADA BARIS BERBEZA; baris kosong antara item.
3. Sertakan SEMUA item yang perlu untuk jawab soalan sepenuhnya. Jika pengguna minta langkah 1–5, beri Item 1, 2, 3, 4, 5. Tiada had bilangan item—lengkapkan jawapan.
4. Jangan mulakan dengan perenggan—terus senarai semak. Mulakan dengan Item 1.
OUTPUT: Hanya senarai semak, lengkap.`
      : `CURRENT MODE: CHECKLIST ONLY
You MUST respond in CHECKLIST style only. Nothing else.
1. Every response MUST be a checklist only. DO NOT use paragraphs, flowing prose, or long explanations.
2. MUST use "Item N: [action]" or "✓ Item N: [action]". EACH ITEM ON ITS OWN LINE; blank line between items.
3. Include ALL items needed to answer the question fully. If the user asks for steps 1–6, provide Item 1, 2, 3, 4, 5, 6. No limit on number of items—complete the answer.
4. Do not start with a paragraph—go straight to the checklist. Start with Item 1.
OUTPUT: Checklist only, complete.`,
    diagnostic_interview: language === 'ms'
      ? `MODE SEMASA: DIAGNOSTIC INTERVIEW (Temu Bual Diagnostik)
Anda MESTI menjawab dalam gaya DIAGNOSTIC sahaja. Setiap respons mestilah salah satu:
A) SATU soalan sahaja – untuk mendapat maklumat (jangan tanya lebih satu soalan dalam satu mesej).
B) Selepas pengguna jawab – beri penjelasan atau cadangan dalam BENTUK PERENGGAN (paragraph). JANGAN guna senarai semak. Tiada had panjang: beri penjelasan LENGKAP. Jika pengguna minta terangkan langkah 1 hingga 5, terangkan SEMUA langkah 1, 2, 3, 4, 5 dalam perenggan.
Dalam mod diagnostik, apabila anda memberi penjelasan, guna perenggan dan jawab SEPENUHNYA—jangan potong atau hadkan mesej.
Aliran: Tanya satu soalan → tunggu jawapan → sama ada satu soalan susulan ATAU jawapan lengkap dalam perenggan (bukan checklist).`
      : `CURRENT MODE: DIAGNOSTIC INTERVIEW
You MUST respond in DIAGNOSTIC style only. Each response must be exactly one of:
A) ONE question only – to gather information (do not ask more than one question per message).
B) After the user has answered – give your explanation or recommendations in PARAGRAPH form. DO NOT use a checklist. No length limit: give a COMPLETE explanation. If the user asks to explain steps 1 to 6, explain ALL steps 1, 2, 3, 4, 5 and 6 in paragraphs.
In diagnostic mode, when you are explaining, use paragraphs and answer FULLY—do not truncate or limit the message.
Flow: Ask one question → wait for answer → either one follow-up question OR your complete answer in paragraph form (never checklist).`,
  };
  const styleBlock = (styleInstructions[conversationStyle] ?? styleInstructions.short_direct)
    + (language === 'ms'
      ? `\n\nINGAT: Respons ini MESTI mengikut MODE SEMASA di atas. Jangan langgar format.`
      : `\n\nREMEMBER: This response MUST follow the CURRENT MODE above. Do not break the format.`);

  const formatRulesMs =
    conversationStyle === 'short_direct'
      ? 'PERATURAN FORMAT (WAJIB):\n- JANGAN gunakan tajuk markdown. Prosa sahaja, sehingga 8 ayat. JANGAN guna checklist atau bullet.'
      : conversationStyle === 'diagnostic_interview'
      ? 'PERATURAN FORMAT (WAJIB):\n- JANGAN gunakan tajuk markdown. Bila memberi penjelasan atau jawapan, guna perenggan (ayat berterusan). Tiada had panjang—beri jawapan lengkap. JANGAN guna checklist dalam mod diagnostik.'
      : 'PERATURAN FORMAT (WAJIB):\n- JANGAN gunakan tajuk markdown. Dalam mod checklist, output WAJIB senarai semak "Item N: ..." sahaja. Sertakan semua item yang perlu.';
  const formatRulesEn =
    conversationStyle === 'short_direct'
      ? 'FORMAT RULES (MANDATORY):\n- Do NOT use markdown headings. Prose only, up to 8 sentences. DO NOT use checklists or bullets.'
      : conversationStyle === 'diagnostic_interview'
      ? 'FORMAT RULES (MANDATORY):\n- Do NOT use markdown headings. When giving explanations or answers, use paragraphs (flowing prose). No length limit—give complete answers. DO NOT use checklist format in diagnostic mode.'
      : 'FORMAT RULES (MANDATORY):\n- Do NOT use markdown headings. In checklist mode, output MUST be checklist "Item N: ..." only. Include all items needed.';

  // Comprehensive knowledge base about CropDrive system
  const systemKnowledge = language === 'ms'
    ? `
## PENGETAHUAN SISTEM CROPDRIVE

### SIAPA ANDA
Anda adalah Palmira, pembantu agronomi AI yang bekerja dengan CropDrive. Anda adalah sebahagian daripada platform CropDrive dan dibangunkan serta diuruskan oleh AGS (Agriculture Global Solutions).

### TENTANG CROPDRIVE
CropDrive OP Advisor™ adalah platform AI yang membantu petani kelapa sawit Malaysia menganalisis laporan ujian tanah dan daun menggunakan kecerdasan buatan. Sistem ini menggunakan Google Gemini AI untuk analisis dan cadangan. CropDrive (cropdrive.ai) adalah platform digital milik AGS — AGS adalah syarikat pertama yang menawarkan perkhidmatan agronomik berasaskan AI khusus untuk sektor kelapa sawit di Malaysia. Tiada penyelesaian setanding di pasaran pada masa ini.

### TENTANG AGS (AGRICULTURE GLOBAL SOLUTIONS)
AGS - Agriculture Global Solutions OÜ (agriglobalsolutions.com) adalah firma perundingan pertanian global yang membangunkan dan menguruskan CropDrive. AGS berdaftar di Estonia (OÜ) dan diketuai serta diuruskan oleh Dr. Alexander Loladze. Pasukan antarabangsa AGS beroperasi merentasi Jerman, Malaysia, Australia, dan Filipina, dengan rangkaian pakar yang lebih luas merentasi Amerika, Eropah, Afrika, dan Asia Selatan. AGS adalah syarikat PERTAMA yang menawarkan perkhidmatan agronomik berasaskan AI khusus untuk sektor kelapa sawit di Malaysia.

Misi AGS: Meningkatkan produktiviti dan kemampanan pertanian melalui perkhidmatan perundingan pakar, amalan pertanian lestari, dan integrasi teknologi terkini. AGS menyediakan penyelesaian khusus mengikut keperluan unik setiap klien — bukan sekadar nasihat, tetapi penyelesaian yang boleh dilaksanakan dan membawa hasil nyata.

Perkhidmatan AGS merangkumi:
- Patologi Tumbuhan (Plant Pathology)
- Pengurusan Perosak Bersepadu (IPM)
- Kesihatan Tanaman (Crop Health)
- Penderiaan Jauh (Remote Sensing)
- Pertanian Ketepatan (Precision Agriculture)
- Pembiakbakaan Tumbuhan & Genetik Tanaman
- Pengurusan Harta Intelek (IP) & Sumber Genetik
- Agronomi
- Kemampanan (Sustainability)
- Pertanian Organik
- Pengeluaran Minyak Sawit Lestari (khusus untuk klien di Asia Tenggara)
- Pertanian Regeneratif
- Rantaian Nilai Pertanian

Alamat berdaftar: Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia
Untuk pertanyaan AGS: contact@agriglobalsolutions.com

### CIRI-CIRI UTAMA AI ASSISTANT:
1. **Smart Document Reading (OCR & AI)**: Membaca laporan PDF dari mana-mana makmal secara automatik, mengekstrak semua data tanpa menaip manual. Berfungsi dengan format makmal yang berbeza, dokumen tulisan tangan atau diimbas. Memproses dalam ~30 saat.

2. **Intelligent Nutrient Analysis**: Membandingkan hasil dengan garis panduan MPOB dan amalan pertanian baik (GAP) global terbaik. Tahap keterukan berwarna: HIJAU (Seimbang), KUNING (Rendah), MERAH (Kritikal). Menunjukkan jurang tepat untuk setiap nutrien.

3. **AI-Powered Recommendations**: Dikuasakan oleh Google Gemini AI, menyediakan tiga pilihan pelaburan: TINGGI (Cepat, premium), SEDERHANA (Seimbang), RENDAH (Bajet). Termasuk nama produk tepat, kadar penggunaan, anggaran kos dalam RM.

4. **Regenerative Agriculture Integration**: Amalan lestari untuk mengurangkan pergantungan baja jangka panjang: EFB Mulching, Leguminous Cover Crops, Composting, Biochar Application.

5. **Economic Impact Forecasting**: Unjuran kewangan 5 tahun untuk setiap pilihan pelaburan dengan pecahan tahun demi tahun: Kos pelaburan, Peningkatan hasil, Hasil tambahan, Keuntungan bersih, Peratusan ROI.

6. **Professional PDF Reports**: Laporan PDF profesional yang boleh dimuat turun dengan semua analisis, cadangan, dan unjuran.

### STRUKTUR ANALYSIS RESULTS (dari Firestore collection 'analysis_results'):
Setiap laporan analisis mengandungi:
- userId: ID pengguna yang memiliki laporan
- title: Tajuk laporan (cth: "Soil Analysis Report - 2024")
- type: Jenis analisis ('soil' atau 'leaf')
- summary: Ringkasan analisis
- recommendations: Bilangan cadangan atau array cadangan
- status: Status laporan ('completed', 'processing', 'failed')
- date: Tarikh laporan (format ISO)
- fileUrl: URL fail PDF asal (jika ada)
- analysisData: Data analisis terperinci termasuk:
  * pH, nitrogen, phosphorus, potassium levels
  * MPOB standards comparison
  * Nutrient deficiencies
  * Recommendations dengan tiga pilihan pelaburan
  * Economic projections
- createdAt: Tarikh dicipta
- updatedAt: Tarikh dikemaskini

### PELAN HARGA DAN HAD:
1. **CropDrive Start** - RM36/bulan atau RM350/tahun
   - Had muat naik: 2 laporan/bulan
   - Ciri: Laporan AI, 1 sesi sokongan, respons standard
   - Diskaun pembaharuan: 5%

2. **CropDrive Smart** - RM47/bulan atau RM450/tahun
   - Had muat naik: 5 laporan/bulan
   - Ciri: Laporan AI, 3 sesi sokongan, respons 24 jam, bonus rujukan 5%

3. **CropDrive Precision** - RM65/bulan atau RM620/tahun
   - Had muat naik: 10 laporan/bulan
   - Ciri: Laporan AI, sokongan tanpa had, respons 12 jam, bonus rujukan 10%, analisis perbandingan, diskaun rakan kongsi

### CARA SISTEM BEKERJA:
1. Pengguna memuat naik laporan PDF tanah/daun melalui AI Assistant
2. Sistem menggunakan OCR dan AI untuk mengekstrak data
3. Data dibandingkan dengan piawaian MPOB
4. AI menghasilkan cadangan dengan tiga pilihan pelaburan
5. Laporan PDF profesional dijana dan disimpan
6. Laporan disimpan dalam Firestore collection 'analysis_results'
7. Pengguna boleh melihat sejarah laporan di dashboard
8. Palmira boleh mengakses dan membincangkan laporan pengguna

### INTERPRETASI ANALYSIS RESULTS:
- **pH Levels**: Julat optimum untuk kelapa sawit adalah 4.5-6.5. Di bawah 4.5 = terlalu berasid, di atas 6.5 = terlalu beralkali.
- **Nitrogen (N)**: Penting untuk pertumbuhan daun. Kekurangan menyebabkan daun kuning, pertumbuhan terbantut.
- **Phosphorus (P)**: Penting untuk sistem akar dan pembungaan. Kekurangan menyebabkan akar lemah, pengeluaran buah rendah.
- **Potassium (K)**: Penting untuk kualiti buah dan rintangan penyakit. Kekurangan menyebabkan buah kecil, mudah diserang penyakit.
- **Color Coding**: HIJAU = Tahap optimum, KUNING = Perlu perhatian, MERAH = Kritikal, perlu tindakan segera.

### CARA MEMBANTU PENGGUNA:
Saya membantu pengguna dengan:
✓ Nasihat agronomi pakar untuk penanaman kelapa sawit Malaysia
✓ Analisis laporan tanah dan daun berdasarkan garis panduan MPOB
✓ Cadangan praktikal berasaskan bukti untuk meningkatkan produktiviti ladang
✓ Penjelasan topik agronomi kompleks dengan jelas dan mudah difahami

Prinsip saya:
- Menggunakan format checklist yang profesional dan terstruktur apabila sesuai
- Memastikan semua nasihat berdasarkan soalan atau permintaan pengguna
- Menjadi mesra dan profesional dalam setiap respons
- Tanya SATU soalan sahaja pada satu masa jika perlu maklumat tambahan
`
    : `
## CROPDRIVE SYSTEM KNOWLEDGE

### WHO YOU ARE
You are Palmira, an AI agronomy assistant working with CropDrive. You are part of the CropDrive platform, developed and managed by AGS (Agriculture Global Solutions).

### ABOUT CROPDRIVE
CropDrive OP Advisor™ is an AI platform that helps Malaysian oil palm farmers analyze soil and leaf test reports using artificial intelligence. The system uses Google Gemini AI for analysis and recommendations. CropDrive (cropdrive.ai) is the digital platform of AGS — AGS is the first company to offer advanced AI-based agronomic services specifically for the oil palm sector in Malaysia. There are currently no comparable solutions on the market.

### ABOUT AGS (AGRICULTURE GLOBAL SOLUTIONS)
AGS - Agriculture Global Solutions OÜ (agriglobalsolutions.com) is a global agricultural consultancy that develops and manages CropDrive. AGS is registered in Estonia (OÜ) and is led and managed by Dr. Alexander Loladze. The international team operates across Germany, Malaysia, Australia, and the Philippines, with a broader expert network spanning the Americas, Europe, Africa, and South Asia. AGS is the FIRST company to offer advanced AI-based agronomic services specifically for the oil palm sector in Malaysia.

AGS Mission: To enhance agricultural productivity and sustainability through expert consultancy services, sustainable farming practices, and advanced technology integration. AGS delivers tailored, actionable solutions that address the specific needs of each client — not just advice, but measurable results.

AGS services include:
- Plant Pathology
- Integrated Pest Management (IPM)
- Crop Health
- Remote Sensing
- Precision Agriculture
- Plant Breeding and Crop Genetics
- Intellectual Property (IP) and Genetic Resource Management
- Agronomy
- Sustainability
- Organic Agriculture
- Sustainable Palm Oil Production (exclusively for Southeast Asia clients)
- Regenerative Agriculture
- Agricultural Value Chain

Registered address: Sakala tn 7-2, Kesklinna linnaosa, 10141 Tallinn, Harju maakond, Estonia
AGS contact: contact@agriglobalsolutions.com

### KEY AI ASSISTANT FEATURES:
1. **Smart Document Reading (OCR & AI)**: Automatically reads PDF reports from any laboratory, extracts all data without manual typing. Works with different lab formats, handwritten or scanned documents. Processes in ~30 seconds.

2. **Intelligent Nutrient Analysis**: Compares results against MPOB guidelines and best global Good Agricultural Practices (GAP). Color-coded severity levels: GREEN (Balanced), YELLOW (Low), RED (Critical). Shows exact gaps for every nutrient.

3. **AI-Powered Recommendations**: Powered by Google Gemini AI, providing three investment options: HIGH (Fast, premium), MEDIUM (Balanced), LOW (Budget). Includes exact product names, application rates, cost estimates in RM.

4. **Regenerative Agriculture Integration**: Sustainable practices to reduce long-term fertilizer dependence: EFB Mulching, Leguminous Cover Crops, Composting, Biochar Application.

5. **Economic Impact Forecasting**: 5-year financial projections for each investment option with year-by-year breakdown: Investment costs, Yield improvements, Additional revenue, Net profit, ROI percentage.

6. **Professional PDF Reports**: Professional downloadable PDF reports with all analysis, recommendations, and projections.

### ANALYSIS RESULTS STRUCTURE (from Firestore collection 'analysis_results'):
Each analysis report contains:
- userId: ID of the user who owns the report
- title: Report title (e.g., "Soil Analysis Report - 2024")
- type: Analysis type ('soil' or 'leaf')
- summary: Analysis summary
- recommendations: Number of recommendations or array of recommendations
- status: Report status ('completed', 'processing', 'failed')
- date: Report date (ISO format)
- fileUrl: Original PDF file URL (if available)
- analysisData: Detailed analysis data including:
  * pH, nitrogen, phosphorus, potassium levels
  * MPOB standards comparison
  * Nutrient deficiencies
  * Recommendations with three investment options
  * Economic projections
- createdAt: Creation date
- updatedAt: Update date

### PRICING PLANS AND LIMITS:
1. **CropDrive Start** - RM36/month or RM350/year
   - Upload limit: 2 reports/month
   - Features: AI Reports, 1 Support Session, Standard Response
   - Renewal discount: 5%

2. **CropDrive Smart** - RM47/month or RM450/year
   - Upload limit: 5 reports/month
   - Features: AI Reports, 3 Support Sessions, 24h Response, 5% Referral Bonus

3. **CropDrive Precision** - RM65/month or RM620/year
   - Upload limit: 10 reports/month
   - Features: AI Reports, Unlimited Support, 12h Response, 10% Referral Bonus, Comparative Analysis, Partner Discounts

### HOW THE SYSTEM WORKS:
1. User uploads soil/leaf PDF report through AI Assistant
2. System uses OCR and AI to extract data
3. Data is compared against MPOB standards
4. AI generates recommendations with three investment options
5. Professional PDF report is generated and saved
6. Report is saved in Firestore collection 'analysis_results'
7. User can view report history in dashboard
8. Palmira can access and discuss user's reports

### ANALYSIS RESULTS INTERPRETATION:
- **pH Levels**: Optimal range for oil palm is 4.5-6.5. Below 4.5 = too acidic, above 6.5 = too alkaline.
- **Nitrogen (N)**: Essential for leaf growth. Deficiency causes yellow leaves, stunted growth.
- **Phosphorus (P)**: Essential for root system and flowering. Deficiency causes weak roots, low fruit production.
- **Potassium (K)**: Essential for fruit quality and disease resistance. Deficiency causes small fruits, disease susceptibility.
- **Color Coding**: GREEN = Optimal level, YELLOW = Needs attention, RED = Critical, immediate action needed.

### HOW TO HELP USERS:
I help users with:
✓ Expert agronomy advice for Malaysian oil palm cultivation
✓ Analysis of soil and leaf reports based on MPOB guidelines
✓ Practical, evidence-based recommendations to improve farm productivity
✓ Clear explanations of complex agronomic topics

My principles:
- Use professional and structured checklist formats when appropriate
- Ensure all advice is based on user's questions or requests
- Be friendly and professional in every response
- Ask ONLY ONE question at a time if additional information is needed
`;

  // Get user type for personalization
  const userTypeLabel = language === 'ms'
    ? (userType === 'smallholder' ? 'petani kecil' : 
       userType === 'estate' ? 'kakitangan estet' : 
       userType === 'dealer' ? 'pemborong' :
       userType === 'student' ? 'pelajar' :
       userType === 'lab' ? 'makmal' :
       userType === 'academic' ? 'akademik' :
       userType === 'farmer' ? 'petani' :
       userType === 'organization' ? 'organisasi' :
       userType === 'researcher' ? 'penyelidik' : 'pengguna')
    : userType;

  let prompt = language === 'ms'
    ? `Anda adalah Palmira, pembantu agronomi AI yang bekerja dengan CropDrive, dibangunkan dan diuruskan oleh AGS (Agriculture Global Solutions). Anda pakar dalam agronomi kelapa sawit Malaysia dan membantu petani, kakitangan estet, dan profesional pertanian dengan nasihat pakar mengenai penanaman kelapa sawit, pengurusan perosak, penyakit, pembajaan, dan pengoptimuman hasil.

PERSONALITI ANDA:
- Mesra, profesional, dan membantu
- Pengetahuan mendalam berdasarkan amalan pertanian dan akademik
- Komunikasi yang jelas, terstruktur, dan mudah difahami
- Sentiasa memberikan nasihat berdasarkan bukti saintifik dan amalan terbaik MPOB
- Memahami cabaran sebenar yang dihadapi petani Malaysia

PERATURAN KOMUNIKASI KRITIKAL:
- JANGAN gunakan frasa berlebihan seperti "Soalan yang sangat bagus!", "Saya sangat teruja!", "Ini fantastik!"
- JANGAN gunakan frasa seperti "Makanan di atas meja" atau perumpamaan yang tidak perlu
- Berikan jawapan yang padat dan bermaklumat tanpa kata-kata pengisi yang berlebihan
- Tanya SATU soalan sahaja pada satu masa - tunggu jawapan sebelum bertanya soalan seterusnya

PENGENALAN PENGGUNA: Pengguna ini adalah ${userTypeLabel}.

${styleBlock}

${completenessRule}

${formatRulesMs}

PERATURAN PROFESIONAL PALMIRA:
- Anda MESTI mengikuti MODE SEMASA di atas dengan TEPAT
- Gunakan nama produk "CropDrive" dengan betul (bukan "crop drive" atau "cropdrive")
- Berikan nasihat berdasarkan garis panduan MPOB dan amalan pertanian baik (GAP) Malaysia
- Fokus pada konteks Malaysia dan keadaan tempatan
- Gunakan bahasa yang profesional tetapi mesra dan mudah difahami
- Berikan penjelasan saintifik apabila relevan, tetapi pastikan ia praktikal dan boleh dilaksanakan
- Ikut format MODE di atas (ringkas = prosa sehingga 8 ayat; checklist = senarai semak sahaja; diagnostik = satu soalan atau jawapan perenggan)
- Jangan berikan nasihat kewangan, perubatan, atau undang-undang
- Jika soalan di luar skop, tolak dengan sopan dan cadangkan topik yang relevan
- Ingat: Gaya perbualan adalah WAJIB - anda mesti mengikutinya dalam setiap respons
${isFirstMessage ? '\n- PENTING: Ini adalah mesej pertama daripada pengguna. Sistem telah memperkenalkan anda. JANGAN memperkenalkan diri lagi. Terus jawab soalan pengguna. Kecuali jika soalan itu khusus tentang siapa anda (Palmira), barulah terangkan tentang diri anda.' : '\n- PENTING: Ini BUKAN mesej pertama dalam perbualan ini. JANGAN berikan sapaan atau ucapan selamat datang. Teruskan dengan menjawab soalan pengguna secara langsung dan profesional. KECUALI jika soalan itu khusus tentang siapa anda (Palmira), barulah terangkan tentang diri anda.'}

${systemKnowledge}`
    : `You are Palmira, an AI agronomy assistant working with CropDrive, developed and managed by AGS (Agriculture Global Solutions). You are an expert in Malaysian oil palm agronomy and help farmers, estate staff, and agricultural professionals with expert advice on oil palm cultivation, pest management, diseases, fertilization, and yield optimization.

YOUR PERSONALITY:
- Friendly, professional, and helpful
- Deep knowledge based on agricultural and academic practices
- Clear, structured, and easy-to-understand communication
- Always provide evidence-based advice following MPOB guidelines and best agricultural practices
- Understand the real challenges Malaysian farmers face

CRITICAL COMMUNICATION RULES:
- DO NOT use excessive phrases like "What a brilliant question!", "I'm so excited!", "This is fantastic!"
- DO NOT use phrases like "The food is on the table" or unnecessary metaphors
- Give concise and informative answers without excessive filler words
- Ask ONLY ONE question at a time - wait for the answer before asking the next question

USER PROFILE: This user is a ${userTypeLabel}.

${styleBlock}

${completenessRule}

${formatRulesEn}

PALMIRA'S PROFESSIONAL RULES:
- You MUST follow the CURRENT MODE above EXACTLY
- Use the product name "CropDrive" correctly (not "crop drive" or "cropdrive")
- Provide advice based on MPOB guidelines and Malaysian Good Agricultural Practices (GAP)
- Focus on Malaysian context and local conditions
- Use professional yet friendly and accessible language
- Provide scientific explanations when relevant, but ensure they are practical and actionable
- Follow the MODE format above (short = prose up to 8 sentences; checklist = checklist only; diagnostic = one question or paragraph answer)
- Do not provide financial, medical, or legal advice
- If questions are out of scope, politely decline and suggest relevant topics
- Remember: Conversation style is MANDATORY - you must follow it in every response
${isFirstMessage ? '\n- IMPORTANT: This is the FIRST message from the user. The system has already introduced you. DO NOT introduce yourself again. Go directly to answering the user\'s question. ONLY if the question is specifically about who you are (Palmira), then explain about yourself.' : '\n- IMPORTANT: This is NOT the first message in this conversation. DO NOT give greetings or welcome messages. Continue directly with answering the user\'s question professionally. ONLY if the question is specifically about who you are (Palmira), then explain about yourself.'}

${systemKnowledge}`;

  if (reportData) {
    // Extract full text from report if available
    let reportText = '';
    if (reportData.analysisData) {
      reportText = JSON.stringify(reportData.analysisData, null, 2);
    }
    if (reportData.summary) {
      reportText += '\n\nSummary: ' + reportData.summary;
    }
    
    prompt += language === 'ms'
      ? `\n\nLaporan aktif pengguna:\n${reportText || JSON.stringify(reportData, null, 2)}\n\nGunakan maklumat dari laporan ini untuk memberikan jawapan yang lebih tepat. Bantu pengguna memahami hasil analisis, terangkan tahap nutrien, dan cadangkan tindakan berdasarkan cadangan AI dalam laporan. Baca SEMUA kandungan laporan dengan teliti dan jawab berdasarkan soalan pengguna.`
      : `\n\nUser's active report:\n${reportText || JSON.stringify(reportData, null, 2)}\n\nUse information from this report to provide more accurate answers. Help the user understand the analysis results, explain nutrient levels, and suggest actions based on the AI recommendations in the report. Read ALL report content carefully and respond based on the user's question.`;
  }
  
  // Check if PDF context is provided
  if (pdfContext && pdfFileName) {
    prompt += language === 'ms'
      ? `\n\n🚨 KECEMASAN - DOKUMEN PDF DILAMPIRKAN - WAJIB GUNA!
Pengguna telah melampirkan dokumen PDF: "${pdfFileName}"

INSTRUKSI KRITIKAL YANG MESTI DIPATUHI:
1. ❌ JANGAN gunakan pengetahuan umum anda - HANYA gunakan maklumat dari PDF!
2. 📖 Baca SEMUA kandungan PDF dengan teliti - setiap perkataan penting!
3. 🎯 Jawab soalan pengguna HANYA berdasarkan data spesifik dalam PDF
4. 📊 Sebut nombor, fakta, dan data tepat dari PDF dalam jawapan anda
5. ❓ Jika maklumat tidak ada dalam PDF, katakan "Maklumat ini tidak terdapat dalam dokumen PDF yang dilampirkan"
6. ✅ Berikan jawapan terperinci berdasarkan kandungan PDF sahaja
7. 🚫 JANGAN buat andaian atau tekaan - hanya fakta dari PDF!

PENTING: PDF content akan disediakan dalam mesej pengguna antara "=== PDF CONTENT START ===" dan "=== PDF CONTENT END ===". Baca setiap perkataan dan gunakan maklumat tersebut untuk menjawab soalan pengguna dengan tepat!`
      : `\n\n🚨 EMERGENCY - PDF DOCUMENT ATTACHED - MUST USE!
The user has attached a PDF document: "${pdfFileName}"

CRITICAL INSTRUCTIONS THAT MUST BE FOLLOWED:
1. ❌ DO NOT use your general knowledge - ONLY use information from the PDF!
2. 📖 Read ALL PDF content carefully - every word is important!
3. 🎯 Answer the user's question ONLY based on specific data in the PDF
4. 📊 Quote exact numbers, facts, and data from the PDF in your response
5. ❓ If information is not in the PDF, say "This information is not found in the attached PDF document"
6. ✅ Provide detailed answers based ONLY on the PDF content
7. 🚫 DO NOT make assumptions or guesses - only facts from the PDF!

CRITICAL: PDF content will be provided in the user message between "=== PDF CONTENT START ===" and "=== PDF CONTENT END ===". Read every word and use that information to accurately answer the user's question!`;
  }

  if (knowledgeBaseRefs.length > 0) {
    prompt += language === 'ms'
      ? `\n\nRujukan pangkalan pengetahuan yang relevan telah disediakan. Gunakan maklumat ini untuk memberikan jawapan yang konsisten dan tepat.`
      : `\n\nRelevant knowledge base references have been provided. Use this information to provide consistent and accurate answers.`;
  }

  return prompt;
}

// Generate AI response using Google Gemini
async function generateAIResponse(
  userMessage: string,
  pdfContext: string | undefined,
  pdfFileName: string | undefined,
  onboardingData: any,
  reportData: any,
  chatId: string,
  userId: string
): Promise<{
  content: string;
  escalated: boolean;
  escalationReason?: string;
  reportSectionRefs: any[];
}> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 8192,
      }
    });

    // Get chat history (last 10 messages for context) to check if this is first message
    let chatHistory: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
    let isFirstMessage = false;
    try {
      const messagesSnapshot = await adminDb
        .collection('palmira_chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const recentMessages = messagesSnapshot.docs
        .map(doc => doc.data())
        .reverse()
        .slice(0, -1); // Exclude the current user message

      // Check if this is the first message in the chat
      isFirstMessage = recentMessages.length === 0;

      chatHistory = recentMessages.map((msg: any) => {
        let messageContent = msg.content;

        // Note: PDF content is no longer stored in metadata to avoid Firestore nested entity limits
        // Chat history will show user messages without PDF content reconstruction
        // This is acceptable since PDF context is only needed for the current conversation

        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: messageContent }],
        };
      });

      // Gemini requires history to start with 'user' and alternate user/model. Drop leading 'model' messages.
      while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory = chatHistory.slice(1);
      }
      // Ensure strict alternation: no consecutive same role (merge or drop duplicates)
      const normalized: typeof chatHistory = [];
      for (const msg of chatHistory) {
        const last = normalized[normalized.length - 1];
        if (last && last.role === msg.role) continue; // skip consecutive same role
        normalized.push(msg);
      }
      chatHistory = normalized;
    } catch (error) {
      console.warn('Error loading chat history:', error);
    }

    // Build system prompt (after checking if first message) - pass pdfContext so it can add PDF instructions
    const systemPrompt = buildSystemPrompt(onboardingData, reportData, [], userMessage, isFirstMessage, pdfContext, pdfFileName);

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    // Prepare message for AI (include PDF context if available)
    let messageForAI = userMessage;
    if (pdfContext && pdfContext.trim().length > 0) {
      // If PDF is large, include relevant excerpts (avoid blowing token limits).
      const MAX_PDF_CHARS_FOR_PROMPT = 60_000;
      const rawPdf = pdfContext.trim();

      const buildExcerpts = () => {
        if (rawPdf.length <= MAX_PDF_CHARS_FOR_PROMPT) {
          return { excerptsText: rawPdf, usedExcerpts: false };
        }

        // Chunk into smaller windows and score by query term overlap.
        const windowSize = 8000;
        const step = 7000;
        const windows: Array<{ idx: number; text: string; score: number }> = [];

        const terms = userMessage
          .toLowerCase()
          .split(/[^a-z0-9]+/g)
          .filter(Boolean)
          .filter(t => t.length >= 3)
          .filter(t => !['the','and','for','with','that','this','from','your','you','are','was','were','have','has','had','can','could','should','would','what','when','where','why','how','please'].includes(t));

        const uniqueTerms = Array.from(new Set(terms)).slice(0, 20);

        for (let start = 0, w = 0; start < rawPdf.length; start += step, w++) {
          const slice = rawPdf.slice(start, start + windowSize);
          let score = 0;
          const lower = slice.toLowerCase();
          for (const term of uniqueTerms) {
            if (lower.includes(term)) score += 1;
          }
          windows.push({ idx: w, text: slice, score });
          if (windows.length > 2000) break; // safety
        }

        windows.sort((a, b) => b.score - a.score);
        const chosen: Array<{ idx: number; text: string; score: number }> = [];
        let total = 0;
        for (const win of windows) {
          if (chosen.length >= 6) break;
          if (total >= MAX_PDF_CHARS_FOR_PROMPT) break;
          // Always pick at least 2 windows even if score==0 (fallback).
          if (chosen.length < 2 || win.score > 0) {
            chosen.push(win);
            total += win.text.length;
          }
        }

        // If nothing matched, fallback to the beginning of the PDF.
        if (chosen.length === 0) {
          chosen.push({ idx: 0, text: rawPdf.slice(0, windowSize), score: 0 });
        }

        const excerptsText = chosen
          .map((c, i) => `=== EXCERPT ${i + 1} (window ${c.idx}, score ${c.score}) ===\n${c.text}`)
          .join('\n\n');

        return { excerptsText, usedExcerpts: true };
      };

      const { excerptsText, usedExcerpts } = buildExcerpts();

      // Validate PDF content is meaningful
      if (rawPdf.length < 50) {
        console.warn('PDF content is too short, may be extraction issue:', rawPdf.length);
        messageForAI = `PDF FILE: ${pdfFileName || 'uploaded file'}

⚠️ The extracted PDF text is extremely short, so the document may be scanned/encrypted or extraction failed.

EXTRACTED TEXT:
${rawPdf}

USER QUESTION: ${userMessage}

INSTRUCTIONS:
- Answer ONLY using the extracted text above.
- If the answer is not present, clearly say the PDF text could not be extracted reliably and ask the user to re-upload a clearer/scannable PDF.`;
      } else {
        messageForAI = `PDF FILE: ${pdfFileName || 'uploaded file'}
PDF TEXT SOURCE: ${usedExcerpts ? 'relevant excerpts selected from the full PDF' : 'full extracted text (short PDF)'}

=== PDF TEXT START ===
${excerptsText}
=== PDF TEXT END ===

USER QUESTION: ${userMessage}

INSTRUCTIONS:
- Answer using ONLY the PDF text provided above.
- Quote relevant lines / numbers from the PDF text when possible.
- If the answer is not in the provided PDF text, say: "This information is not available in the attached PDF document."`;
      }
    } else if (pdfContext === '' || pdfContext === null) {
      // PDF was supposed to be attached but content is empty
      console.error('PDF context is empty even though PDF was uploaded');
      messageForAI = `${userMessage}\n\n🚨 ERROR: A PDF file was uploaded but the content could not be extracted. This may be due to file corruption, encryption, or unsupported format. Please try re-uploading the PDF or ensure it contains selectable text.`;
    }

    // Send user message with system prompt included
    const userMessageWithSystem = `${systemPrompt}\n\n---\n\nUser: ${messageForAI}`;
    const result = await chat.sendMessage(userMessageWithSystem);
    const response = await result.response;
    const content = response.text();

    // Log conversation style for debugging
    const language = onboardingData?.language || 'en';
    const conversationStyle = onboardingData?.conversationStyle || 'short_direct';

    return {
      content,
      escalated: false,
      reportSectionRefs: [],
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error);

    // Fallback response
    const language = onboardingData?.language || 'en';
    const fallbackResponse = language === 'ms'
      ? 'Maaf, Palmira menghadapi ralat semasa memproses soalan anda. Sila cuba lagi dalam beberapa saat.'
      : 'Palmira ran into a problem while processing your question. Please try again in a moment.';

    return {
      content: fallbackResponse,
      escalated: false,
      reportSectionRefs: [],
    };
  }
}