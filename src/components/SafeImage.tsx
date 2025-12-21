import { useState } from 'react';
import { transformImageUrl } from '../utils/urlUtils';

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
 */
export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return fallback || (
      <div className={`bg-white bg-opacity-10 flex items-center justify-center ${className || ''}`}>
        <span className="text-2xl">🖼️</span>
      </div>
    );
  }

  // Transform Google Drive URLs to use backend proxy
  const transformedSrc = transformImageUrl(src);

  return (
    <img
      src={transformedSrc}
      alt={alt}
      className={className}
      onError={() => {
        setHasError(true);
      }}
      loading="lazy"
    />
  );
}

