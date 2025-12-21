import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, HeartOff } from 'lucide-react';
import { useState } from 'react';

export default function Player() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    nextSong,
    previousSong,
    isLiked,
    isDisliked,
    toggleLike,
    toggleDislike,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = newTime;
    }
  };

  return (
    <div className="h-20 bg-bird-dark border-t border-gray-900 px-6 flex items-center gap-4">
      {/* Song Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {currentSong.cover && (
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-14 h-14 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDislike}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 ${
              isDisliked ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <HeartOff size={18} />
          </button>
          <button
            onClick={toggleLike}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 ${
              isLiked ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="flex items-center gap-4">
          <button
            onClick={previousSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={nextSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white"
          >
            <SkipForward size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <div
          className="relative"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white">
            <Volume2 size={20} />
          </button>
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 bg-bird-dark border border-gray-800 rounded p-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

