import { Suspense, useEffect, useRef, useState } from 'react';
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
  const { playSong, setLibrarySongs, currentSong, isPlaying } = usePlayer();
  const lastSongsRef = useRef<string>('');
  const lastUserIdRef = useRef<string>('');
  const [showRainbowFlag, setShowRainbowFlag] = useState(false);
  
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

  // Show rainbow flag when the specific song is playing
  const isSergeyGeyPlaying = currentSong?.id === '16274f6c-0668-417a-bc38-5aa09a511372' && isPlaying;
  
  useEffect(() => {
    if (isSergeyGeyPlaying) {
      setShowRainbowFlag(true);
    } else {
      setShowRainbowFlag(false);
    }
  }, [isSergeyGeyPlaying]);

  const handlePlayMyVibe = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Specific song for "Сергей Гей" button
    const sergeyGeySong = {
      id: '16274f6c-0668-417a-bc38-5aa09a511372',
      title: 'Гей Порно',
      artist: 'Sero4ka',
      audio_url: 'https://drive.google.com/uc?export=download&id=1oswRezoZooJrbpnJ2TRMIaeT__5MbJ1g',
      cover: 'https://drive.google.com/uc?export=download&id=1-4NAB-WD2BSfde0F7Aeay0M0fqAiRVXU',
      isLiked: false,
      isDisliked: false,
      likesCount: 0,
      dislikesCount: 0,
    };
    
    // Use librarySongs as queue if available, otherwise just the single song
    const queue = librarySongs.length > 0 ? librarySongs : [sergeyGeySong];
    // Don't navigate to song detail view - just play the song
    playSong(sergeyGeySong, queue, false);
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
        {/* Rainbow Flag Background Animation */}
        {showRainbowFlag ? (
          <div className="absolute inset-0 animate-rainbow-flag">
            {/* Rainbow stripes with softer colors */}
            <div className="absolute inset-0 flex flex-col animate-rainbow-wave">
              <div className="flex-1 bg-[#FFB3BA]"></div>
              <div className="flex-1 bg-[#FFDFBA]"></div>
              <div className="flex-1 bg-[#FFFFBA]"></div>
              <div className="flex-1 bg-[#BAFFC9]"></div>
              <div className="flex-1 bg-[#BAE1FF]"></div>
              <div className="flex-1 bg-[#E0BAFF]"></div>
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(250, 82, 186, 0.8) 0%, rgba(158, 46, 240, 0.8) 50%, rgba(33, 5, 51, 1) 100%)',
            }}
          />
        )}
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <button
            onClick={handlePlayMyVibe}
            className="flex flex-col items-center gap-7"
          >
            <div className="flex items-center gap-3">
              {/* Sound waves animation when playing */}
              {isSergeyGeyPlaying ? (
                <div className="flex items-center gap-1 h-5">
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-1"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-2"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-3"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-4"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-3"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-2"></div>
                  <div className="w-1 bg-pink-400 rounded-full animate-sound-wave-1"></div>
                </div>
              ) : (
                <Play size={20} fill="currentColor" className={showRainbowFlag ? 'text-pink-400' : 'text-white'} />
              )}
              <span className={`text-[36px] font-bold tracking-[1.4px] transition-colors ${showRainbowFlag ? 'text-pink-400' : 'text-white'}`}>
                Сергей Гей
              </span>
            </div>
            <span className={`px-6 py-2.5 bg-white bg-opacity-[0.22] rounded-full text-base transition-colors ${showRainbowFlag ? 'text-pink-400' : 'text-white'}`}>
              С днюхой Гей
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

