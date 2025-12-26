import { useState, useEffect } from 'react';
import { transformImageUrl } from '../utils/urlUtils';
import { cacheService } from '../services/CacheService';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Safe image component that handles loading errors gracefully
 * Prevents 500/403 errors from breaking the UI
 * Uses backend proxy for Google Drive URLs to avoid CORS issues
 * Caches images for offline use and faster loading
 */
export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      return;
    }

    const transformedSrc = transformImageUrl(src);
    
    // Check cache first, but don't cache until image is actually loaded
    const loadImage = async () => {
      try {
        const cachedBlob = await cacheService.getCachedImage(transformedSrc);
        if (cachedBlob) {
          // Use cached image
          const blobUrl = URL.createObjectURL(cachedBlob);
          setImageSrc(blobUrl);
        } else {
          // Not in cache, use original URL (will cache on successful load)
          setImageSrc(transformedSrc);
        }
      } catch (error) {
        // Fallback to original URL if cache fails
        setImageSrc(transformedSrc);
      }
    };

    loadImage();
  }, [src]);

  // Cache image only after it successfully loads
  const handleImageLoad = () => {
    if (src) {
      const transformedSrc = transformImageUrl(src);
      // Cache in background only after successful load
      cacheService.cacheImage(transformedSrc).catch(() => {
        // Ignore cache errors
      });
    }
  };

  if (!src || hasError || !imageSrc) {
    return fallback || (
      <div className={`bg-white bg-opacity-10 flex items-center justify-center ${className || ''}`}>
        <span className="text-2xl">🖼️</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={() => {
        setHasError(true);
      }}
      loading="lazy"
    />
  );
}

