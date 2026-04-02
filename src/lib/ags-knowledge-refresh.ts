import admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';

const AGS_BASE_URL = 'https://www.agriglobalsolutions.com';
const AGS_HOSTNAME = 'www.agriglobalsolutions.com';
const AGS_SEED_PATHS = ['/', '/about', '/services', '/faqs', '/contact', '/updates-insights'];
const DEFAULT_MAX_PAGES = 24;
const MAX_DOC_CONTENT_CHARS = 14_000;

type Category =
  | 'ags_general'
  | 'ags_about'
  | 'ags_services'
  | 'ags_faqs'
  | 'ags_contact'
  | 'ags_updates';

export interface AgsRefreshResult {
  startedAt: string;
  finishedAt: string;
  pagesFetched: number;
  docsUpserted: number;
  docsDeactivated: number;
  errors: string[];
  syncedUrls: string[];
}

interface AgsScrapedPage {
  url: string;
  title: string;
  content: string;
  category: Category;
  tags: string[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeWhitespace(text: string): string {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return lines.join('\n').trim();
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const raw = titleMatch?.[1] || 'AGS - Agriculture Global Solutions';
  return normalizeWhitespace(decodeHtmlEntities(raw));
}

function stripHtmlToText(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|h6|li|tr|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  return normalizeWhitespace(decodeHtmlEntities(cleaned));
}

function toAbsoluteInternalUrl(href: string, currentUrl: string): string | null {
  try {
    const url = new URL(href, currentUrl);
    if (url.hostname !== AGS_HOSTNAME) return null;
    url.hash = '';
    url.search = '';

    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.origin}${normalizedPath}`;
  } catch {
    return null;
  }
}

function shouldIncludePath(pathname: string): boolean {
  if (!pathname.startsWith('/')) return false;
  if (pathname.startsWith('/api/')) return false;

  const excludedPrefixes = [
    '/impressum',
    '/cookie-policy',
    '/data-protection',
    '/terms-and-conditions',
    '/rights-of-withdrawal',
    '/dispute-resolution',
    '/legal-notice',
    '/accessibility-notice',
    '/consumer-information',
    '/subscribe',
  ];

  if (excludedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  const allowedPrefixes = ['/', '/about', '/services', '/faqs', '/contact', '/updates-insights', '/portfolio'];
  return allowedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function extractInternalLinks(html: string, currentUrl: string): string[] {
  const links: string[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null = null;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    const absolute = toAbsoluteInternalUrl(href, currentUrl);
    if (!absolute) continue;

    const path = new URL(absolute).pathname;
    if (!shouldIncludePath(path)) continue;

    links.push(absolute);
  }

  return Array.from(new Set(links));
}

function categoryFromPath(pathname: string): Category {
  if (pathname.startsWith('/about')) return 'ags_about';
  if (pathname.startsWith('/services') || pathname.startsWith('/portfolio')) return 'ags_services';
  if (pathname.startsWith('/faqs')) return 'ags_faqs';
  if (pathname.startsWith('/contact')) return 'ags_contact';
  if (pathname.startsWith('/updates-insights')) return 'ags_updates';
  return 'ags_general';
}

function tagsFromPath(pathname: string): string[] {
  const tags = ['ags', 'agriculture-global-solutions'];

  if (pathname.startsWith('/updates-insights')) tags.push('updates-insights');
  if (pathname.startsWith('/services') || pathname.startsWith('/portfolio')) tags.push('services');
  if (pathname.startsWith('/faqs')) tags.push('faqs');
  if (pathname.startsWith('/about')) tags.push('about');
  if (pathname.startsWith('/contact')) tags.push('contact');

  return Array.from(new Set(tags));
}

function buildDocId(url: string): string {
  const { pathname } = new URL(url);
  const slug = (pathname === '/' ? 'home' : pathname.slice(1))
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return `ags_${slug || 'home'}`.slice(0, 120);
}

async function scrapeAgsPages(maxPages: number): Promise<{ pages: AgsScrapedPage[]; errors: string[] }> {
  const queue = AGS_SEED_PATHS.map(path => `${AGS_BASE_URL}${path}`);
  const visited = new Set<string>();
  const pages: AgsScrapedPage[] = [];
  const errors: string[] = [];

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CropDrive-Palmira-KnowledgeSync/1.0 (+https://www.cropdrive.ai)',
          Accept: 'text/html,application/xhtml+xml',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        errors.push(`Failed to fetch ${url}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const title = extractTitle(html);
      const text = stripHtmlToText(html);
      const trimmed = text.slice(0, MAX_DOC_CONTENT_CHARS);

      if (trimmed.length < 120) {
        errors.push(`Skipped ${url}: extracted content too short`);
      } else {
        const path = new URL(url).pathname;
        pages.push({
          url,
          title,
          content: trimmed,
          category: categoryFromPath(path),
          tags: tagsFromPath(path),
        });
      }

      const links = extractInternalLinks(html, url);
      for (const link of links) {
        if (!visited.has(link) && !queue.includes(link) && visited.size + queue.length < maxPages * 2) {
          queue.push(link);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown fetch error';
      errors.push(`Failed to fetch ${url}: ${message}`);
    }
  }

  return { pages, errors };
}

export async function refreshAgsKnowledgeBase(options?: { maxPages?: number; triggeredBy?: string }): Promise<AgsRefreshResult> {
  const startedAt = new Date().toISOString();
  const now = admin.firestore.Timestamp.now();
  const maxPages = options?.maxPages ?? DEFAULT_MAX_PAGES;

  const { pages, errors } = await scrapeAgsPages(maxPages);
  const collectionRef = adminDb.collection('palmira_knowledge_base');

  let docsUpserted = 0;
  const syncedIds = new Set<string>();
  const syncedUrls: string[] = [];

  for (const page of pages) {
    const docId = buildDocId(page.url);
    syncedIds.add(docId);
    syncedUrls.push(page.url);

    try {
      const docRef = collectionRef.doc(docId);
      const existing = await docRef.get();
      const createdAt = existing.exists ? existing.data()?.createdAt ?? now : now;

      await docRef.set(
        {
          title: page.title,
          content: page.content,
          category: page.category,
          tags: page.tags,
          language: 'both',
          isActive: true,
          source: 'ags_website',
          sourceUrl: page.url,
          autoSynced: true,
          syncMetadata: {
            triggeredBy: options?.triggeredBy || 'system',
            lastSuccessfulSyncAt: now,
          },
          createdAt,
          updatedAt: now,
        },
        { merge: true }
      );

      docsUpserted += 1;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Firestore write error';
      errors.push(`Failed upsert for ${page.url}: ${message}`);
    }
  }

  let docsDeactivated = 0;
  try {
    const autoSyncedSnapshot = await collectionRef
      .where('source', '==', 'ags_website')
      .where('autoSynced', '==', true)
      .get();

    for (const doc of autoSyncedSnapshot.docs) {
      if (!syncedIds.has(doc.id) && doc.data().isActive !== false) {
        await doc.ref.update({
          isActive: false,
          updatedAt: now,
          deactivatedAt: now,
        });
        docsDeactivated += 1;
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown deactivation error';
    errors.push(`Failed stale-doc deactivation step: ${message}`);
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    pagesFetched: pages.length,
    docsUpserted,
    docsDeactivated,
    errors,
    syncedUrls,
  };
}