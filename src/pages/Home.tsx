import { Suspense, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useSongs } from '../hooks/useSongs';
import { Play } from 'lucide-react';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SafeImage from '../components/SafeImage';
import SongCard from '../components/SongCard';

function HomeContent() {
  const { currentUserId } = useAuth();
  const { playSong, setLibrarySongs } = usePlayer();
  const lastSongsRef = useRef<string>('');
  const lastUserIdRef = useRef<string>('');
  
  // Use React 19's use() hook with cached repositories
  // Only fetch if userId actually changed to prevent unnecessary re-renders
  const librarySongs = useSongs(currentUserId);

  // Update player context with songs when they load (only if different)
  // Also check if userId changed to prevent unnecessary updates
  useEffect(() => {
    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId;
      lastSongsRef.current = ''; // Reset songs ref when user changes
    }
    
    const songsKey = librarySongs.map(s => s.id).join(',');
    if (librarySongs.length > 0 && lastSongsRef.current !== songsKey) {
      lastSongsRef.current = songsKey;
      setLibrarySongs(librarySongs);
    }
  }, [librarySongs, setLibrarySongs, currentUserId]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
      {/* Quick Play */}
      {librarySongs.length > 0 && (
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Quick Play</h2>
            <button className="text-xs text-gray-400 hover:text-white">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
            {librarySongs.slice(0, 10).map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  playSong(song, librarySongs);
                }}
                className="flex items-center gap-3.5 px-4.5 py-3.5 bg-white bg-opacity-[0.08] rounded-[22px] hover:bg-opacity-10 transition-colors min-w-fit"
              >
                {song.cover ? (
                  <SafeImage
                    src={song.cover}
                    alt={song.title}
                    className="w-[60px] h-[60px] rounded-xl object-cover"
                    fallback={
                      <div className="w-[60px] h-[60px] rounded-xl bg-white bg-opacity-10 flex items-center justify-center">
                        <span className="text-xs">🎵</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="w-[60px] h-[60px] rounded-xl bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-xs">🎵</span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-base font-medium">{song.title}</p>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Mixes Section */}
      {librarySongs.length > 0 && (
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Mixes</h2>
            <button
              type="button"
              onClick={() => {
                if (librarySongs.length > 0) {
                  playSong(librarySongs[0], librarySongs);
                }
              }}
              className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white"
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>
          <div className="flex gap-4.5 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
            {librarySongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => playSong(song, librarySongs)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary>
        <HomeContent />
      </ErrorBoundary>
    </Suspense>
  );
}

