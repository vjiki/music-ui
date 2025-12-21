import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause } from 'lucide-react';
import SafeImage from './SafeImage';

export default function Player() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
  } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="h-16 bg-bird-dark rounded-lg px-4 flex items-center gap-3 mb-2">
      {/* Song Info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {currentSong.cover ? (
          <SafeImage
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-12 h-12 rounded object-cover"
            fallback={
              <div className="w-12 h-12 rounded bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-sm">🎵</span>
              </div>
            }
          />
        ) : (
          <div className="w-12 h-12 rounded bg-white bg-opacity-10 flex items-center justify-center">
            <span className="text-sm">🎵</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}

