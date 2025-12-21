import type { Song } from '../types';
import SafeImage from './SafeImage';

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

export default function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col gap-3 min-w-[180px] p-4 bg-white bg-opacity-5 rounded-3xl hover:bg-opacity-10 transition-colors"
    >
      {song.cover ? (
        <SafeImage
          src={song.cover}
          alt={song.title}
          className="w-full aspect-square rounded-2xl object-cover"
          fallback={
            <div className="w-full aspect-square rounded-2xl bg-white bg-opacity-10 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          }
        />
      ) : (
        <div className="w-full aspect-square rounded-2xl bg-white bg-opacity-10 flex items-center justify-center">
          <span className="text-2xl">🎵</span>
        </div>
      )}
      <div className="text-left">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </button>
  );
}

