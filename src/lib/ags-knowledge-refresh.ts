import admin from 'firebase-admin';
import { createHash } from 'crypto';
import { adminDb } from '@/lib/firebase-admin';

export interface AgsSourcePage {
  id: string;
  url: string;
  title: string;
  tags: string[];
}

export interface AgsRefreshResult {
  created: number;
  updated: number;
  unchanged: number;
  failed: Array<{ id: string; url: string; error: string }>;
  processedAt: string;
}

const AGS_SOURCE_PAGES: AgsSourcePage[] = [
  {
    id: 'ags-home',
    url: 'https://www.agriglobalsolutions.com/',
    title: 'AGS Official Website - Home',
    tags: ['ags', 'company', 'overview', 'official-website', 'auto-refresh'],
  },
  {
    id: 'ags-about',
    url: 'https://www.agriglobalsolutions.com/about',
    title: 'AGS Official Website - About',
    tags: ['ags', 'company', 'about', 'mission', 'official-website', 'auto-refresh'],
  },
  {
    id: 'ags-services',
    url: 'https://www.agriglobalsolutions.com/services',
    title: 'AGS Official Website - Services',
    tags: ['ags', 'services', 'consultancy', 'official-website', 'auto-refresh'],
  },
  {
    id: 'ags-contact',
    url: 'https://www.agriglobalsolutions.com/contact',
    title: 'AGS Official Website - Contact',
    tags: ['ags', 'contact', 'legal', 'official-website', 'auto-refresh'],
  },
  {
    id: 'ags-faqs',
    url: 'https://www.agriglobalsolutions.com/faqs',
    title: 'AGS Official Website - FAQs',
    tags: ['ags', 'faq', 'crop-science', 'official-website', 'auto-refresh'],
  },
  {
    id: 'ags-impressum',
    url: 'https://www.agriglobalsolutions.com/impressum',
    title: 'AGS Official Website - Impressum',
    tags: ['ags', 'impressum', 'legal', 'company-details', 'official-website', 'auto-refresh'],
  },
];

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/')
    .replace(/&#x27;/g, "'");
}

function stripHtmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ');

  const decoded = decodeHtmlEntities(withoutScripts);

  return decoded
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function extractTitle(html: string, fallback: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    const cleaned = decodeHtmlEntities(titleMatch[1]).replace(/\s+/g, ' ').trim();
    if (cleaned) return cleaned;
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]) {
    const cleaned = decodeHtmlEntities(h1Match[1])
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned) return cleaned;
  }

  return fallback;
}

function trimForPrompt(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[Truncated to fit knowledge document limits]`;
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CropDrivePalmiraKnowledgeBot/1.0 (+https://cropdrive.ai)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status})`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildKnowledgeContent(pageTitle: string, url: string, extractedText: string, fetchedAtIso: string): string {
  const normalized = extractedText
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const compact = trimForPrompt(normalized, 16000);

  return [
    `Source: ${url}`,
    `Fetched At (UTC): ${fetchedAtIso}`,
    `Title: ${pageTitle}`,
    '',
    'Official AGS website extracted content:',
    compact,
  ].join('\n');
}

export async function refreshAgsKnowledgeDocs(): Promise<AgsRefreshResult> {
  const now = new Date();
  const nowIso = now.toISOString();

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  const failed: Array<{ id: string; url: string; error: string }> = [];

  for (const page of AGS_SOURCE_PAGES) {
    try {
      const html = await fetchHtml(page.url);
      const title = extractTitle(html, page.title);
      const text = stripHtmlToText(html);

      if (!text || text.length < 200) {
        throw new Error('Extracted content too short; page may be blocked or malformed');
      }

      const content = buildKnowledgeContent(title, page.url, text, nowIso);
      const contentHash = createHash('sha256').update(content).digest('hex');

      const docRef = adminDb.collection('palmira_knowledge_base').doc(page.id);
      const existingDoc = await docRef.get();
      const existingData = existingDoc.exists ? existingDoc.data() : null;

      const baseData = {
        title: title || page.title,
        content,
        category: 'ags_official',
        tags: page.tags,
        language: 'both',
        isActive: true,
        sourceType: 'website',
        sourceProvider: 'ags',
        sourceUrl: page.url,
        sourceId: page.id,
        contentHash,
        lastFetchedAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      if (!existingDoc.exists) {
        await docRef.set({
          ...baseData,
          createdAt: admin.firestore.Timestamp.fromDate(now),
        });
        created += 1;
        continue;
      }

      if (existingData?.contentHash === contentHash) {
        await docRef.update({
          lastFetchedAt: admin.firestore.Timestamp.fromDate(now),
          updatedAt: admin.firestore.Timestamp.fromDate(now),
        });
        unchanged += 1;
        continue;
      }

      await docRef.update(baseData);
      updated += 1;
    } catch (error: any) {
      failed.push({
        id: page.id,
        url: page.url,
        error: error?.message || 'Unknown error',
      });
    }
  }

  return {
    created,
    updated,
    unchanged,
    failed,
    processedAt: nowIso,
  };
}
