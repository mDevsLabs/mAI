/**
 * Rendu d'un média d'article : image ou vidéo selon l'extension de l'URL.
 * Les vidéos sont déléguées à `NewsVideo` (lecture auto en boucle, son
 * configurable, bouton muet) ; les images restent de simples `<img>`.
 */

import { isVideoUrl, type MediaKind } from '@/lib/media';
import { NewsVideo } from './news-video';

export function NewsMedia({
  src,
  kind,
  alt,
  className = 'w-full h-full object-cover',
  fill = false,
  priority = false,
  sound = false,
}: {
  src: string;
  /** Force le type de média (sinon détection par extension). */
  kind?: MediaKind;
  alt: string;
  className?: string;
  /** Étire le média sur son conteneur (position absolute). */
  fill?: boolean;
  priority?: boolean;
  /** Vidéos : tente une lecture avec son (couvertures), repli muet sinon. */
  sound?: boolean;
}) {
  if (kind === 'video' || isVideoUrl(src)) {
    return <NewsVideo src={src} alt={alt} className={className} fill={fill} sound={sound} />;
  }

  const layout = fill ? 'absolute inset-0 h-full w-full' : '';

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${layout} ${className}`}
    />
  );
}

/** Indique si le média est une vidéo (utile pour afficher un repère visuel). */
export function mediaIsVideo(src?: string, kind?: MediaKind): boolean {
  return kind === 'video' || isVideoUrl(src);
}
