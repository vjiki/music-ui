import { Suspense, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useSongs } from '../hooks/useSongs';
import { useStoriesSafe } from '../hooks/useStoriesSafe';
import { Play, MessageCircle } from 'lucide-react';
import StoryCircle from '../components/StoryCircle';
import SongCard from '../components/SongCard';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SafeImage from '../components/SafeImage';

function HomeContent() {
  const { currentUserId, isAuthenticated } = useAuth();
  const { playSong, setLibrarySongs } = usePlayer();
  const lastSongsRef = useRef<string>('');
  const lastUserIdRef = useRef<string>('');
  
  // Use React 19's use() hook with cached repositories
  // Only fetch if userId actually changed to prevent unnecessary re-renders
  const librarySongs = useSongs(currentUserId);
  const stories = useStoriesSafe(isAuthenticated ? currentUserId : null);

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

  const handlePlayMyVibe = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (librarySongs.length > 0) {
      playSong(librarySongs[0], librarySongs);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Music</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Navigate to messages - will be handled by routing
                window.location.href = '/messages';
              }}
              className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-white"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {/* Stories */}
        <div className="mt-4 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 px-4 scrollbar-hide">
          <StoryCircle
            isCreate
            userName="Your story"
            onClick={() => {
              // Handle story creation
            }}
          />
          {stories.map((story) => (
            <StoryCircle
              key={story.id}
              userName={story.userName}
              profileImageURL={story.profileImageURL}
              isViewed={story.isViewed}
              onClick={() => {
                playSong(story.song, [story.song]);
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative mx-4 mt-3 mb-6 rounded-[42px] overflow-hidden" style={{ height: '420px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(250, 82, 186, 0.8) 0%, rgba(158, 46, 240, 0.8) 50%, rgba(33, 5, 51, 1) 100%)',
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <button
            onClick={handlePlayMyVibe}
            className="flex flex-col items-center gap-7 text-white"
          >
            <div className="flex items-center gap-3">
              <Play size={20} fill="currentColor" />
              <span className="text-[36px] font-bold tracking-[1.4px]">My Vibe</span>
            </div>
            <span className="px-6 py-2.5 bg-white bg-opacity-[0.22] rounded-full text-base">
              Breathe with me
            </span>
          </button>
        </div>
      </div>

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
              onClick={handlePlayMyVibe}
              className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white"
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
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

