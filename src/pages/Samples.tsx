import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useShorts } from '../hooks/useShorts';
import { serviceContainer } from '../core/di/ServiceContainer';
import { Heart, ThumbsDown } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import SuspenseFallback from '../components/SuspenseFallback';
import { transformAudioUrl, transformImageUrl } from '../utils/urlUtils';
import type { Short } from '../types';

function SamplesContent() {
  const { currentUserId } = useAuth();
  const fetchedShorts = useShorts(currentUserId || '');
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastPlayedIndex, setLastPlayedIndex] = useState(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [playingShortId, setPlayingShortId] = useState<string | null>(null);
  const [updatingShorts, setUpdatingShorts] = useState<Set<string>>(new Set());

  // Update local shorts when fetched shorts change
  useEffect(() => {
    if (fetchedShorts.length > 0) {
      setShorts(fetchedShorts);
      // Reset to first short when new shorts are loaded
      setCurrentIndex(0);
      setLastPlayedIndex(-1);
    }
  }, [fetchedShorts]);

  // Auto-play short when index changes
  useEffect(() => {
    if (shorts.length === 0 || currentIndex < 0 || currentIndex >= shorts.length) {
      return;
    }

    const short = shorts[currentIndex];
    if (currentIndex !== lastPlayedIndex) {
      playShort(short);
      setLastPlayedIndex(currentIndex);
    }
  }, [currentIndex, shorts, lastPlayedIndex]);

  // Auto-play first short when shorts are loaded
  useEffect(() => {
    if (shorts.length > 0 && lastPlayedIndex === -1) {
      setCurrentIndex(0);
      const firstShort = shorts[0];
      playShort(firstShort);
      setLastPlayedIndex(0);
    }
  }, [shorts.length, lastPlayedIndex]);

  // Play short function - just sets the playing short ID
  // The ShortCard component will handle actual playback via isPlaying prop
  const playShort = (short: Short) => {
    // Stop all currently playing media
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Set the playing short ID - ShortCard will handle playback
    setPlayingShortId(short.id);
  };

  // Handle scroll to detect which short is in view
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const viewportCenter = scrollTop + containerHeight / 2;

    // Find which short is at the center
    const shortElements = container.querySelectorAll('[data-short-index]');
    let newIndex = currentIndex;
    let minDistance = Infinity;

    shortElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const elementTop = rect.top - containerRect.top + scrollTop;
      const elementCenter = elementTop + rect.height / 2;
      const distance = Math.abs(viewportCenter - elementCenter);

      if (distance < minDistance) {
        minDistance = distance;
        const index = parseInt(element.getAttribute('data-short-index') || '0', 10);
        if (index >= 0 && index < shorts.length) {
          newIndex = index;
        }
      }
    });

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < shorts.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Handle like
  const handleLike = async (short: Short) => {
    if (!currentUserId || updatingShorts.has(short.id)) return;

    setUpdatingShorts((prev) => new Set(prev).add(short.id));

    // Optimistic update - update local state immediately
    const updatedShort: Short = {
      ...short,
      isLiked: !short.isLiked,
      isDisliked: false,
      likesCount: short.isLiked ? short.likesCount - 1 : short.likesCount + 1,
      dislikesCount: short.isDisliked ? Math.max(0, short.dislikesCount - 1) : short.dislikesCount,
    };

    setShorts((prevShorts) =>
      prevShorts.map((s) => (s.id === short.id ? updatedShort : s))
    );

    try {
      await serviceContainer.songLikesService.likeSong({
        userId: currentUserId,
        songId: short.id,
      });
    } catch (error) {
      console.error('Failed to like short:', error);
      // Revert on error
      setShorts((prevShorts) =>
        prevShorts.map((s) => (s.id === short.id ? short : s))
      );
    } finally {
      setUpdatingShorts((prev) => {
        const next = new Set(prev);
        next.delete(short.id);
        return next;
      });
    }
  };

  // Handle dislike
  const handleDislike = async (short: Short) => {
    if (!currentUserId || updatingShorts.has(short.id)) return;

    setUpdatingShorts((prev) => new Set(prev).add(short.id));

    // Optimistic update - update local state immediately
    const updatedShort: Short = {
      ...short,
      isDisliked: !short.isDisliked,
      isLiked: false,
      dislikesCount: short.isDisliked ? short.dislikesCount - 1 : short.dislikesCount + 1,
      likesCount: short.isLiked ? Math.max(0, short.likesCount - 1) : short.likesCount,
    };

    setShorts((prevShorts) =>
      prevShorts.map((s) => (s.id === short.id ? updatedShort : s))
    );

    try {
      await serviceContainer.songLikesService.dislikeSong({
        userId: currentUserId,
        songId: short.id,
      });
    } catch (error) {
      console.error('Failed to dislike short:', error);
      // Revert on error
      setShorts((prevShorts) =>
        prevShorts.map((s) => (s.id === short.id ? short : s))
      );
    } finally {
      setUpdatingShorts((prev) => {
        const next = new Set(prev);
        next.delete(short.id);
        return next;
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        video.pause();
        video.src = '';
      });
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  if (shorts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <p className="text-white/70 text-lg">No shorts available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-scroll snap-y snap-mandatory bg-black pb-20"
      onScroll={handleScroll}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {shorts.map((short, index) => {
        // Only load media for the current short (but all shorts use proxy URLs)
        const shouldLoadMedia = index === currentIndex;
        return (
          <ShortCard
            key={short.id}
            short={short}
            index={index}
            isPlaying={playingShortId === short.id}
            shouldLoadMedia={shouldLoadMedia}
            videoRefs={videoRefs}
            audioRefs={audioRefs}
            onLike={() => handleLike(short)}
            onDislike={() => handleDislike(short)}
            isUpdating={updatingShorts.has(short.id)}
          />
        );
      })}
    </div>
  );
}

interface ShortCardProps {
  short: Short;
  index: number;
  isPlaying: boolean;
  shouldLoadMedia: boolean;
  videoRefs: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  audioRefs: React.MutableRefObject<Map<string, HTMLAudioElement>>;
  onLike: () => void;
  onDislike: () => void;
  isUpdating: boolean;
}

function ShortCard({
  short,
  index,
  isPlaying,
  shouldLoadMedia,
  videoRefs,
  audioRefs,
  onLike,
  onDislike,
  isUpdating,
}: ShortCardProps) {
  const isVideo = short.type === 'SHORT_VIDEO';
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Always transform URLs to use proxy (for all shorts)
  const videoUrl = short.video_url ? transformAudioUrl(short.video_url) : '';
  const audioUrl = short.audio_url ? transformAudioUrl(short.audio_url) : '';
  const coverUrl = short.cover ? transformImageUrl(short.cover) : '';

  // Only set src when shouldLoadMedia is true (current short only)
  // This prevents browser from fetching all media files at once
  const activeVideoUrl = shouldLoadMedia ? videoUrl : '';
  const activeAudioUrl = shouldLoadMedia ? audioUrl : '';
  const activeCoverUrl = shouldLoadMedia ? coverUrl : '';

  // Register refs
  useEffect(() => {
    if (videoRef.current) {
      videoRefs.current.set(short.id, videoRef.current);
    }
    if (audioRef.current) {
      audioRefs.current.set(short.id, audioRef.current);
    }
    return () => {
      videoRefs.current.delete(short.id);
      audioRefs.current.delete(short.id);
    };
  }, [short.id, videoRefs, audioRefs]);

  // Auto-play when this card becomes active
  useEffect(() => {
    if (isPlaying && shouldLoadMedia) {
      // Small delay to ensure refs are registered and src is set
      const timeoutId = setTimeout(() => {
        if (isVideo && videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error('Error playing video:', error);
          });
        } else if (!isVideo && audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error('Error playing audio:', error);
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, shouldLoadMedia, isVideo]);

  return (
    <div
      data-short-index={index}
      className="w-full h-screen snap-start snap-always flex items-center justify-center relative bg-black"
    >
      {/* Video or Cover Image */}
      {isVideo && activeVideoUrl ? (
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src={activeVideoUrl}
            loop
            playsInline
            className="w-full h-full object-cover"
            muted={false}
            preload="auto"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          {activeCoverUrl ? (
            <SafeImage
              src={activeCoverUrl}
              alt={short.title || 'Short'}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
                  <div className="text-white/50 text-2xl">🎵</div>
                </div>
              }
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
              <div className="text-white/50 text-2xl">🎵</div>
            </div>
          )}
        </div>
      )}

      {/* Audio element for non-video shorts - only create if shouldLoadMedia */}
      {!isVideo && shouldLoadMedia && activeAudioUrl && (
        <audio
          ref={audioRef}
          src={activeAudioUrl}
          loop
          className="hidden"
          preload="auto"
        />
      )}

      {/* Dark overlay for better text readability */}
      {!isVideo && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 z-10">
        <div className="flex items-end gap-4">
          {/* Album art thumbnail */}
          {short.cover && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {activeCoverUrl ? (
                <SafeImage
                  src={activeCoverUrl}
                  alt={short.title || 'Cover'}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
                      <div className="text-white/50">🎵</div>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
                  <div className="text-white/50">🎵</div>
                </div>
              )}
            </div>
          )}

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg mb-1 truncate">
              {short.title || 'Unknown Title'}
            </h3>
            {short.artist && (
              <p className="text-white/70 text-sm truncate">{short.artist}</p>
            )}
          </div>

          {/* Like/Dislike buttons */}
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={onLike}
              disabled={isUpdating}
              className={`p-3 rounded-full transition-all ${
                short.isLiked
                  ? 'bg-white/20 text-red-500'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              } ${isUpdating ? 'opacity-50' : ''}`}
            >
              {short.isLiked ? (
                <Heart size={24} fill="currentColor" />
              ) : (
                <Heart size={24} />
              )}
            </button>
            <span className="text-white text-xs font-medium">{short.likesCount}</span>

            <button
              onClick={onDislike}
              disabled={isUpdating}
              className={`p-3 rounded-full transition-all ${
                short.isDisliked
                  ? 'bg-white/20 text-blue-500'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              } ${isUpdating ? 'opacity-50' : ''}`}
            >
              <ThumbsDown size={24} fill={short.isDisliked ? 'currentColor' : 'none'} />
            </button>
            <span className="text-white text-xs font-medium">{short.dislikesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Samples() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <SamplesContent />
    </Suspense>
  );
}

