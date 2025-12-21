import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, MoreHorizontal } from 'lucide-react';
import SafeImage from './SafeImage';

export default function Player() {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextSong,
    previousSong,
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayerClick = () => {
    // Navigate to minimal/centered view when clicking on player bar
    navigate(`/song/${currentSong.id}?view=minimal`);
  };

  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to minimal/centered view when clicking on cover image
    navigate(`/song/${currentSong.id}?view=minimal`);
  };

  return (
    <div className="relative h-20 bg-black border-t border-gray-900">
      {/* Progress Bar at top */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gray-800">
        <div
          className="h-full bg-yellow-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player Content - Entire bar is clickable */}
      <div 
        onClick={handlePlayerClick}
        className="w-full px-4 h-full flex items-center cursor-pointer hover:bg-white hover:bg-opacity-5 transition-colors relative"
      >
        {/* Left Section - Album Art and Song Info */}
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0 w-[200px]">
          {/* Album Art - Clickable */}
          <button
            onClick={handleCoverClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {currentSong.cover ? (
              <SafeImage
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-14 h-14 rounded object-cover"
                fallback={
                  <div className="w-14 h-14 rounded bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                }
              />
            ) : (
              <div className="w-14 h-14 rounded bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-lg">🎵</span>
              </div>
            )}
          </button>

          {/* Song Info */}
          <div className="min-w-0 text-left flex-1">
            <p className="text-sm font-medium truncate text-white">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Main Controls - Centered (Play button in exact center) */}
        <div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2" 
          onClick={(e) => e.stopPropagation()}
        >
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors">
            <Heart size={20} />
          </button>
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors">
            <Shuffle size={20} />
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
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors">
            <Repeat size={20} />
          </button>
        </div>

        {/* Right Section - Time and More */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
          {/* Time Display */}
          <div className="flex items-center gap-1 text-xs text-gray-400 min-w-[70px] justify-end">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Right Controls */}
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
