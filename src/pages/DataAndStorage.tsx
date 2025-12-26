import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronUp, ChevronDown, Trash2, X } from 'lucide-react';
import { cacheService } from '../services/CacheService';
import SafeImage from '../components/SafeImage';
import SuspenseFallback from '../components/SuspenseFallback';
import { useSongs } from '../hooks/useSongs';
import { useAuth } from '../contexts/AuthContext';

interface CacheCategory {
  name: string;
  size: number;
  percentage: number;
  color: string;
}

interface CacheData {
  totalSize: number;
  categories: CacheCategory[];
}

function DataAndStorageContent() {
  const navigate = useNavigate();
  const { currentUserId } = useAuth();
  const songs = useSongs(currentUserId || '');
  const [cacheData, setCacheData] = useState<CacheData>({ totalSize: 0, categories: [] });
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cachedImageMetadata, setCachedImageMetadata] = useState<any[]>([]);
  const [cachedAudioMetadata, setCachedAudioMetadata] = useState<any[]>([]);
  const [cachedVideoMetadata, setCachedVideoMetadata] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showSongs, setShowSongs] = useState(false);
  const [showVideos, setShowVideos] = useState(false);

  useEffect(() => {
    loadCacheData();
  }, []);

  const loadCacheData = async () => {
    setIsLoading(true);
    try {
      const stats = await cacheService.getCacheStatistics();
      setCacheData(stats);
      
      const images = await cacheService.getCachedImageMetadata();
      const audio = await cacheService.getCachedAudioMetadata();
      const videos = await cacheService.getCachedVideoMetadata();
      
      setCachedImageMetadata(images);
      setCachedAudioMetadata(audio);
      setCachedVideoMetadata(videos);
    } catch (error) {
      console.error('Failed to load cache data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllCache = async () => {
    setIsClearingCache(true);
    try {
      await cacheService.clearAllCache();
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearingCache(false);
      setShowClearConfirmation(false);
    }
  };

  const handleClearImage = async (url: string) => {
    try {
      await cacheService.clearCachedImage(url);
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear image:', error);
    }
  };

  const handleClearAudio = async (url: string) => {
    try {
      await cacheService.clearCachedAudio(url);
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear audio:', error);
    }
  };

  const handleClearVideo = async (url: string) => {
    try {
      await cacheService.clearCachedVideo(url);
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear video:', error);
    }
  };

  const formatSize = (size: number): string => {
    if (size >= 1.0) {
      return `${size.toFixed(1)} GB`;
    } else {
      return `${(size * 1024).toFixed(1)} MB`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky z-10 bg-black border-b border-gray-900 px-4 py-3" style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold flex-1">Data and Storage</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {cacheData.totalSize > 0 ? (
          <>
            {/* Donut Chart */}
            <div className="flex justify-center py-5">
              <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="30"
                  />
                  {/* Segments */}
                  {cacheData.categories.map((category, index) => {
                    const previousTotal = cacheData.categories
                      .slice(0, index)
                      .reduce((sum, cat) => sum + cat.percentage, 0);
                    const startAngle = (previousTotal / 100) * 360 - 90;
                    const endAngle = ((previousTotal + category.percentage) / 100) * 360 - 90;
                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = (endAngle * Math.PI) / 180;
                    const largeArcFlag = category.percentage > 50 ? 1 : 0;
                    const radius = 85;
                    const innerRadius = 70;
                    const x1 = 100 + radius * Math.cos(startAngleRad);
                    const y1 = 100 + radius * Math.sin(startAngleRad);
                    const x2 = 100 + radius * Math.cos(endAngleRad);
                    const y2 = 100 + radius * Math.sin(endAngleRad);
                    const x3 = 100 + innerRadius * Math.cos(endAngleRad);
                    const y3 = 100 + innerRadius * Math.sin(endAngleRad);
                    const x4 = 100 + innerRadius * Math.cos(startAngleRad);
                    const y4 = 100 + innerRadius * Math.sin(startAngleRad);

                    return (
                      <path
                        key={category.name}
                        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                        fill={category.color}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{cacheData.totalSize.toFixed(1)} GB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory Usage Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Memory Usage</h2>
              <p className="text-sm text-white/70">
                Music occupies {((cacheData.totalSize * 0.278) / 100).toFixed(1)}% of free space on the device.
              </p>
              <div className="h-px bg-blue-500/30 mt-2" />
            </div>

            {/* Cache Categories List */}
            <div className="bg-white/5 rounded-xl mb-6 overflow-hidden">
              {cacheData.categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/10 last:border-0"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-white">{category.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">{category.percentage.toFixed(1)}%</span>
                    <span className="text-sm text-white/60">{formatSize(category.size)}</span>
                  </div>
                </div>
              ))}

              {/* Cached Images Section */}
              <div className="border-t border-white/10">
                <button
                  onClick={() => setShowImages(!showImages)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                    <span className="text-white text-xs">📷</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base text-white">Cached Images</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">{cachedImageMetadata.length}</span>
                    {showImages ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                  </div>
                </button>

                {showImages && (
                  <div className="px-4 pb-4">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="text-white/60">Loading...</div>
                      </div>
                    ) : cachedImageMetadata.length === 0 ? (
                      <div className="text-sm text-white/50 py-4">No cached images</div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {cachedImageMetadata.map((metadata) => (
                          <div key={metadata.url} className="relative flex-shrink-0">
                            <SafeImage
                              src={metadata.url}
                              alt="Cached image"
                              className="w-15 h-15 rounded-lg object-cover"
                              fallback={
                                <div className="w-15 h-15 rounded-lg bg-white/10 flex items-center justify-center">
                                  <span className="text-xs">🖼️</span>
                                </div>
                              }
                            />
                            <button
                              onClick={() => handleClearImage(metadata.url)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cached Songs Section */}
              <div className="border-t border-white/10">
                <button
                  onClick={() => setShowSongs(!showSongs)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">🎵</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base text-white">Cached Songs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">{cachedAudioMetadata.length}</span>
                    {showSongs ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                  </div>
                </button>

                {showSongs && (
                  <div className="px-4 pb-4">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="text-white/60">Loading...</div>
                      </div>
                    ) : cachedAudioMetadata.length === 0 ? (
                      <div className="text-sm text-white/50 py-4">No cached songs</div>
                    ) : (
                      <div className="space-y-2 py-2">
                        {cachedAudioMetadata.map((metadata) => {
                          const song = songs.find((s) => s.audio_url === metadata.url);
                          return (
                            <div key={metadata.url} className="flex items-center gap-3">
                              {song?.cover ? (
                                <SafeImage
                                  src={song.cover}
                                  alt={song.title}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  fallback={
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                      <span className="text-xs">🎵</span>
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                  <span className="text-xs">🎵</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {metadata.title || song?.title || 'Unknown Song'}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                  {metadata.artist || song?.artist || 'Unknown Artist'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleClearAudio(metadata.url)}
                                className="p-2 text-red-500 hover:bg-white/10 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cached Videos Section */}
              {cachedVideoMetadata.length > 0 && (
                <div className="border-t border-white/10">
                  <button
                    onClick={() => setShowVideos(!showVideos)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs">🎬</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base text-white">Cached Videos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">{cachedVideoMetadata.length}</span>
                      {showVideos ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                    </div>
                  </button>

                  {showVideos && (
                    <div className="px-4 pb-4">
                      {isLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="text-white/60">Loading...</div>
                        </div>
                      ) : (
                        <div className="space-y-2 py-2">
                          {cachedVideoMetadata.map((metadata) => (
                            <div key={metadata.url} className="flex items-center gap-3">
                              {metadata.coverURL ? (
                                <SafeImage
                                  src={metadata.coverURL}
                                  alt={metadata.title || 'Video'}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  fallback={
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                      <span className="text-xs">🎬</span>
                                    </div>
                                  }
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                  <span className="text-xs">🎬</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {metadata.title || 'Unknown Video'}
                                </p>
                                <p className="text-xs text-white/60 truncate">
                                  {metadata.artist || 'Unknown Artist'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleClearVideo(metadata.url)}
                                className="p-2 text-red-500 hover:bg-white/10 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clear Cache Button */}
            <button
              onClick={() => setShowClearConfirmation(true)}
              disabled={isClearingCache}
              className="w-full py-3.5 bg-blue-500 text-white font-semibold rounded-xl mb-4 disabled:opacity-50"
            >
              {isClearingCache ? 'Clearing...' : `Clear All Cache ${formatSize(cacheData.totalSize)}`}
            </button>

            {/* Cloud Storage Note */}
            <p className="text-xs text-white/60 text-center px-4">
              All media will remain in the cloud; you can download them again if needed.
            </p>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4 opacity-30">📦</div>
            <h2 className="text-lg font-semibold mb-2">No cached data</h2>
            <p className="text-sm text-white/60 text-center">
              Cached songs and images will appear here
            </p>
          </div>
        )}
      </div>

      {/* Clear Cache Confirmation */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-2">Clear Cache</h2>
            <p className="text-white/70 mb-6">
              This will clear {formatSize(cacheData.totalSize)} of cached data. All media will remain in the cloud and can be downloaded again if needed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAllCache}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear All Cache
              </button>
              <button
                onClick={() => setShowClearConfirmation(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataAndStorage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <DataAndStorageContent />
    </Suspense>
  );
}

