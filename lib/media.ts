/**
 * Helpers média partagés (client et serveur).
 * Volontairement sans dépendance Node : ce module est importé par des
 * composants clients autant que par la couche actualités.
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.ogg'];

export type MediaKind = 'image' | 'video';

export type MediaSource = { src: string; kind: MediaKind };

/** Détecte une vidéo à partir de l'extension de l'URL (ou du préfixe data:video/). */
export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  if (clean.startsWith('data:video/')) return true;
  return VIDEO_EXTENSIONS.some((extension) => clean.endsWith(extension));
}

/**
 * Détermine le type de média d'une source : une vidéo si l'URL en est une
 * (ou si le type est forcé), sinon une image.
 */
export function getMediaSource(
  source: { image?: string; imageType?: MediaKind } | null | undefined
): MediaSource | null {
  if (!source?.image) return null;
  const kind: MediaKind = source.imageType === 'video' || isVideoUrl(source.image) ? 'video' : 'image';
  return { src: source.image, kind };
}
