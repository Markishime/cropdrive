const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
function isValidVideoId(id: string): boolean {
  return typeof id === 'string' && VIDEO_ID_REGEX.test(id.trim());
}

/**
 * Extract YouTube video ID from a URL string.
 * Handles: watch?v=, watch?si=...&v=, youtu.be/ID, embed/ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  try {
    const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch && isValidVideoId(youtuBeMatch[1])) return youtuBeMatch[1];

    if (trimmed.includes('youtube.com/watch')) {
      const u = new URL(trimmed);
      const v = u.searchParams.get('v');
      if (v && isValidVideoId(v)) return v;
    }

    const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vParamMatch && isValidVideoId(vParamMatch[1])) return vParamMatch[1];

    const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch && isValidVideoId(embedMatch[1])) return embedMatch[1];
  } catch {
    const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vParamMatch) return vParamMatch[1];
  }
  return null;
}

/**
 * Find first YouTube video ID in any text (e.g. description). Use when URL field is missing.
 */
export function extractYouTubeVideoIdFromText(text: string): string | null {
  if (!text || typeof text !== 'string') return null;
  const s = String(text);
  const youtuBe = s.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtuBe && isValidVideoId(youtuBe[1])) return youtuBe[1];
  const vParam = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParam && isValidVideoId(vParam[1])) return vParam[1];
  const embed = s.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embed && isValidVideoId(embed[1])) return embed[1];
  return null;
}

export function getYouTubeEmbedUrl(videoId: string, options?: { start?: number; autoplay?: boolean }): string {
  const params = new URLSearchParams();
  if (options?.start) params.set('start', String(options.start));
  if (options?.autoplay) params.set('autoplay', '1');
  const qs = params.toString();
  return `https://www.youtube.com/embed/${videoId}${qs ? `?${qs}` : ''}`;
}
