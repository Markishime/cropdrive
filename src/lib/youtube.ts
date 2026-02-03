/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|$)/);
  if (youtuBeMatch) return youtuBeMatch[1];
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
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
