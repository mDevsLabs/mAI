"use client";

import { useState } from "react";

export function isVideoMedia(url?: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v')
  );
}

interface NewsMediaProps {
  src?: string;
  poster?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  isArticlePage?: boolean;
}

export function NewsMedia({
  src,
  poster,
  alt,
  className = "",
  containerClassName = "",
  isArticlePage = false,
}: NewsMediaProps) {
  const [hasError, setHasError] = useState(false);
  const fallbackImage = "https://upload.fs.fr/6iSzjnfokS.png";

  const mediaSrc = hasError || !src ? fallbackImage : src;
  const isVideo = !hasError && isVideoMedia(mediaSrc);
  const posterSrc = poster || (mediaSrc.includes("android-app") ? "/news/android-app.jpg" : undefined);

  if (isVideo) {
    if (isArticlePage) {
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-black/95 ${containerClassName}`}>
          <video
            src={mediaSrc}
            poster={posterSrc}
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHasError(true)}
            className={`w-full max-h-[520px] object-contain rounded-2xl ${className}`}
          >
            Votre navigateur ne prend pas en charge la lecture de vidéos.
          </video>
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full overflow-hidden bg-black/90 ${containerClassName}`}>
        <video
          src={mediaSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover pointer-events-none ${className}`}
        />
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/90 uppercase tracking-widest pointer-events-none">
          Vidéo
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      <img
        src={mediaSrc}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-500 ${className}`}
      />
    </div>
  );
}
