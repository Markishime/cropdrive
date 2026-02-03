/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?si=xxx&v=VIDEO_ID&feature=youtu.be
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?si=xxx
 * - https://youtube.com/embed/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // youtu.be/ID or youtu.be/ID?anything - capture 11-char ID
  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];
  // youtube.com/watch with v= anywhere in query string (v=ID or &v=ID)
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*[?&]v=|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // Simpler: just look for v= followed by 11-char ID in any youtube URL
  const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParamMatch) return vParamMatch[1];
  // embed URL
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export function getYouTubeEmbedUrl(videoId: string, options?: { start?: number; autoplay?: boolean }): string {
  const params = new URLSearchParams();
  if (options?.start) params.set('start', String(options.start));
  if (options?.autoplay) params.set('autoplay', '1');
  const qs = params.toString();
  return `https://www.youtube.com/embed/${videoId}${qs ? `?${qs}` : ''}`;
}
