/**
 * Utility functions for handling URLs, especially Google Drive URLs
 */

/**
 * Converts Google Drive download URLs to viewable format
 * Note: Google Drive often blocks direct browser access due to CORS
 * For production, implement a backend proxy endpoint
 */
export function transformGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const fileId = extractFileId(url);
  if (fileId) {
    // Try uc?id format (sometimes works)
    return `https://drive.google.com/uc?id=${fileId}`;
  }

  return url;
}

/**
 * Transforms Google Drive URL specifically for images
 * Uses backend proxy to avoid CORS/403 errors
 */
export function transformImageUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (url.includes('drive.google.com')) {
    const fileId = extractFileId(url);
    if (fileId) {
      // Use backend proxy endpoint to serve Google Drive images
      // This avoids CORS and 403 errors
      const API_BASE_URL = 'https://music-bird.up.railway.app';
      return `${API_BASE_URL}/api/v1/proxy/image?fileId=${encodeURIComponent(fileId)}`;
    }
  }

  return url;
}

/**
 * Helper to extract file ID from various Google Drive URL formats
 */
function extractFileId(url: string): string | null {
  // Format: https://drive.google.com/uc?export=download&id=FILE_ID
  const downloadMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (downloadMatch) {
    return downloadMatch[1];
  }

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/open[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return openMatch[1];
  }

  return null;
}

/**
 * Transforms Google Drive URL specifically for audio
 * Uses backend proxy to avoid CORS/403 errors
 */
export function transformAudioUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (url.includes('drive.google.com')) {
    const fileId = extractFileId(url);
    if (fileId) {
      // Use backend proxy endpoint to serve Google Drive audio
      // This avoids CORS and 403 errors
      const API_BASE_URL = 'https://music-bird.up.railway.app';
      return `${API_BASE_URL}/api/v1/proxy/audio?fileId=${encodeURIComponent(fileId)}`;
    }
  }

  return url;
}

