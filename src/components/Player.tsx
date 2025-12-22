import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, HeartOff, MoreHorizontal } from 'lucide-react';
import SafeImage from './SafeImage';

export default function Player() {
  const navigate = useNavigate();
  const { currentUserId } = useAuth();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextSong,
    previousSong,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
    toggleLike,
    toggleDislike,
    seekTo,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to minimal/centered view when clicking on cover image
    navigate(`/song/${currentSong.id}?view=minimal`);
  };

  const handlePlayerBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only seek if clicking on the bar itself (not on buttons or cover)
    // Check if the click target is the progress bar or the player content area
    const target = e.target as HTMLElement;
    // If clicking on a button, input, or the cover image, don't seek
    if (target.closest('button') || target.closest('img') || target.closest('[class*="w-14"]')) {
      return;
    }
    // Otherwise, seek to that position
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      seekTo(newTime);
    }
  };

  return (
    <div 
      className="relative h-20 bg-black border-t border-gray-900 cursor-pointer"
      onClick={handlePlayerBarClick}
    >
      {/* Full-width Progress Bar Background - fills entire sidebar */}
      <div 
        className="absolute inset-0 z-0"
      >
        {/* Progress fill - fills from left to right across entire bar height */}
        <div
          className="absolute inset-0 bg-yellow-500 bg-opacity-20 transition-all origin-left"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player Content */}
      <div 
        className="w-full px-2 sm:px-4 h-full flex items-center hover:bg-white hover:bg-opacity-5 transition-colors relative z-10"
      >
        {/* Left Section - Album Art and Song Info (Mobile: smaller, Desktop: full) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0 w-auto sm:w-[200px]">
          {/* Album Art - Clickable */}
          <button
            onClick={handleCoverClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {currentSong.cover ? (
              <SafeImage
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded object-cover"
                fallback={
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-sm sm:text-lg">🎵</span>
                  </div>
                }
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-sm sm:text-lg">🎵</span>
              </div>
            )}
          </button>

          {/* Song Info - Hidden on very small screens, shown on mobile+ */}
          <div className="min-w-0 text-left flex-1 hidden min-[375px]:block max-w-[120px] sm:max-w-none">
            <p className="text-xs sm:text-sm font-medium truncate text-white">{currentSong.title}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Main Controls - Mobile: simplified, Desktop: full */}
        {/* Mobile Layout: Only essential controls */}
        <div 
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 md:hidden" 
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={previousSong}
            className="p-1.5 sm:p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-2.5 sm:p-3 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={nextSong}
            className="p-1.5 sm:p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (currentSong && currentUserId && currentUserId !== 'guest') {
                try {
                  await toggleLike(currentUserId);
                } catch (error) {
                  console.error('Error toggling like:', error);
                }
              }
            }}
            className={`p-1.5 sm:p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              currentSong?.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
            disabled={!currentSong || currentUserId === 'guest'}
          >
            <Heart size={18} fill={currentSong?.isLiked ? 'currentColor' : 'none'} strokeWidth={currentSong?.isLiked ? 0 : 2} />
          </button>
        </div>

        {/* Desktop Layout: Full controls centered */}
        <div 
          className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-2" 
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (currentSong && currentUserId && currentUserId !== 'guest') {
                try {
                  await toggleDislike(currentUserId);
                } catch (error) {
                  console.error('Error toggling dislike:', error);
                }
              }
            }}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              currentSong?.isDisliked ? 'text-blue-500' : 'text-gray-400 hover:text-white'
            }`}
            title={currentSong?.isDisliked ? 'Remove dislike' : 'Dislike'}
            disabled={!currentSong || currentUserId === 'guest'}
          >
            <HeartOff size={20} fill={currentSong?.isDisliked ? 'currentColor' : 'none'} strokeWidth={currentSong?.isDisliked ? 0 : 2} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleShuffle();
            }}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              isShuffled ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle size={20} fill={isShuffled ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={previousSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-3.5 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
          </button>
          <button
            onClick={nextSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleRepeat();
            }}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              repeatMode !== 'off' ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat size={20} fill={repeatMode === 'one' ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (currentSong && currentUserId && currentUserId !== 'guest') {
                try {
                  await toggleLike(currentUserId);
                } catch (error) {
                  console.error('Error toggling like:', error);
                }
              }
            }}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              currentSong?.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
            title={currentSong?.isLiked ? 'Unlike' : 'Like'}
            disabled={!currentSong || currentUserId === 'guest'}
          >
            <Heart size={20} fill={currentSong?.isLiked ? 'currentColor' : 'none'} strokeWidth={currentSong?.isLiked ? 0 : 2} />
          </button>
        </div>

        {/* Right Section - Time and More (Mobile: time only, Desktop: time + more) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
          {/* Time Display - Always visible */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 min-w-[50px] sm:min-w-[70px] justify-end">
            <span>{formatTime(currentTime)}</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline">{formatTime(duration)}</span>
          </div>

          {/* Right Controls - Hidden on mobile, shown on desktop */}
          <button className="hidden md:block p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
