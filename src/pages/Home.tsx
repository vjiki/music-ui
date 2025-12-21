import { Suspense, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useSongs } from '../hooks/useSongs';
import { useStoriesSafe } from '../hooks/useStoriesSafe';
import { Play, MessageCircle } from 'lucide-react';
import StoryCircle from '../components/StoryCircle';
import SongCard from '../components/SongCard';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

function HomeContent() {
  const { currentUserId, isAuthenticated } = useAuth();
  const { playSong, setLibrarySongs } = usePlayer();
  
  // Use React 19's use() hook with cached repositories
  const librarySongs = useSongs(currentUserId);
  const stories = useStoriesSafe(isAuthenticated ? currentUserId : null);

  // Update player context with songs when they load
  useEffect(() => {
    if (librarySongs.length > 0) {
      setLibrarySongs(librarySongs);
    }
  }, [librarySongs, setLibrarySongs]);

  const handlePlayMyVibe = () => {
    if (librarySongs.length > 0) {
      playSong(librarySongs[0], librarySongs);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bird</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white">
              <MessageCircle size={20} />
            </button>
          </div>
        </div>

        {/* Stories */}
        {stories.length > 0 && (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
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
        )}
      </div>

      {/* Hero Section */}
      <div className="relative mx-4 mt-6 mb-8 rounded-3xl overflow-hidden" style={{ height: '420px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(250, 82, 186, 0.8) 0%, rgba(158, 46, 240, 0.8) 50%, rgba(33, 5, 51, 1) 100%)',
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <button
            onClick={handlePlayMyVibe}
            className="flex flex-col items-center gap-4 text-white"
          >
            <div className="flex items-center gap-3">
              <Play size={24} fill="currentColor" />
              <span className="text-4xl font-bold tracking-wide">My Vibe</span>
            </div>
            <span className="px-6 py-2 bg-white bg-opacity-20 rounded-full text-sm">
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
            <button className="text-sm text-gray-400 hover:text-white">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {librarySongs.slice(0, 10).map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, librarySongs)}
                className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-5 rounded-2xl hover:bg-opacity-10 transition-colors min-w-fit"
              >
                {song.cover && (
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium">{song.title}</p>
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
              onClick={handlePlayMyVibe}
              className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white"
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
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

