import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const DEFAULT_TRAVEL_FALLBACK =
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&auto=format&fit=crop&q=80';

export default function SafeImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  placeholderText = 'Travel Image',
  fallbackSrc = DEFAULT_TRAVEL_FALLBACK,
  ...props
}) {
  const initial = src || fallbackSrc || DEFAULT_TRAVEL_FALLBACK;
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    const next = src || fallbackSrc || DEFAULT_TRAVEL_FALLBACK;
    setCurrentSrc(next);
    setHasError(false);
    setTriedFallback(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
      const nextSrc =
        fallbackSrc && fallbackSrc !== currentSrc
          ? fallbackSrc
          : DEFAULT_TRAVEL_FALLBACK;
      if (nextSrc && nextSrc !== currentSrc) {
        setCurrentSrc(nextSrc);
        return;
      }
    }
    setHasError(true);
  };

  if (hasError || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100/95 text-slate-400 p-1 select-none overflow-hidden ${className} ${containerClassName}`}
        title={alt || placeholderText}
        role="img"
        aria-label={alt || placeholderText}
      >
        <ImageIcon className="w-4 h-4 text-slate-400 mb-0.5 shrink-0 stroke-[1.5]" />
        <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight line-clamp-1 px-0.5">
          {placeholderText}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
