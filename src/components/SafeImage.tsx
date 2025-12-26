import { useState, useEffect, useRef } from 'react';
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
  const cachedRef = useRef<Set<string>>(new Set());

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
          // Mark as cached to prevent duplicate cache operations
          cachedRef.current.add(transformedSrc);
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

  // Cache image only after it successfully loads (and only once)
  const handleImageLoad = () => {
    if (src) {
      const transformedSrc = transformImageUrl(src);
      // Only cache if we haven't already cached this image
      if (!cachedRef.current.has(transformedSrc)) {
        cachedRef.current.add(transformedSrc);
        // Cache in background only after successful load
        cacheService.cacheImage(transformedSrc).catch(() => {
          // Remove from set on error so we can retry
          cachedRef.current.delete(transformedSrc);
        });
      }
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

