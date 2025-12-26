import { ReactNode, useEffect, useState, Suspense } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Search, ListMusic, User, MessageCircle, Video } from 'lucide-react';
import { usePlayer, setNavigateToSong } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useStoriesSafe } from '../hooks/useStoriesSafe';
import { useSongs } from '../hooks/useSongs';
import Player from './Player';
import StoryCircle from './StoryCircle';
import SuspenseFallback from './SuspenseFallback';

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentSong, playSong, isPlaying, librarySongs, setLibrarySongs } = usePlayer();
  const { currentUserId, isAuthenticated } = useAuth();
  const [showRainbowFlag, setShowRainbowFlag] = useState(false);
  
  // Fetch stories
  const stories = useStoriesSafe(isAuthenticated ? currentUserId : null);
  
  // Fetch songs for rainbow flag button
  const songs = useSongs(currentUserId);
  
  // Update librarySongs when songs load
  useEffect(() => {
    if (songs.length > 0) {
      setLibrarySongs(songs);
    }
  }, [songs, setLibrarySongs]);
  
  // Show rainbow flag when the specific song is playing
  const isSergeyGeyPlaying = currentSong?.id === '16274f6c-0668-417a-bc38-5aa09a511372' && isPlaying;
  
  useEffect(() => {
    if (isSergeyGeyPlaying) {
      setShowRainbowFlag(true);
    } else {
      setShowRainbowFlag(false);
    }
  }, [isSergeyGeyPlaying]);
  
  const handlePlaySergeyGey = () => {
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
  
  // Set up navigation helper for PlayerContext - navigate to detailed view
  useEffect(() => {
    setNavigateToSong((songId: string) => {
      navigate(`/song/${songId}?view=detailed`);
    });
  }, [navigate]);
  
  // Debug: Log when currentSong changes (only in dev mode)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      if (currentSong) {
        console.log('🎵 Player should be visible - currentSong:', currentSong.title);
      } else {
        console.log('🎵 Player hidden - no currentSong');
      }
    }
  }, [currentSong]);

  const bottomNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/samples', icon: Video, label: 'Samples' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const topNavItems = [
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/playlists', icon: ListMusic, label: 'Playlists' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
  ];

  // Hide player bar when on song detail page
  const isSongDetailPage = location.pathname.startsWith('/song/');
  const isSamplesPage = location.pathname === '/samples';

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/10 z-40" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between gap-2 px-4 py-3 min-h-[56px]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Bird</h1>
            {/* Stories - smaller size */}
            <div className="flex items-center gap-2">
              <StoryCircle
                isCreate
                userName=""
                onClick={() => {
                  // Story creation functionality can be added here
                }}
                size="small"
              />
              {stories.slice(0, 5).map((story) => (
                <StoryCircle
                  key={story.id}
                  userName=""
                  profileImageURL={story.profileImageURL}
                  isViewed={story.isViewed}
                  onClick={() => {
                    playSong(story.song, [story.song]);
                  }}
                  size="small"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Rainbow Flag Button */}
            <button
              onClick={handlePlaySergeyGey}
              className={`p-2 rounded-full transition-all ${
                showRainbowFlag
                  ? 'bg-white/20 scale-110'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              title="Сергей Гей"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex flex-col">
                <div className="flex-1 bg-[#FFB3BA]"></div>
                <div className="flex-1 bg-[#FFDFBA]"></div>
                <div className="flex-1 bg-[#FFFFBA]"></div>
                <div className="flex-1 bg-[#BAFFC9]"></div>
                <div className="flex-1 bg-[#BAE1FF]"></div>
                <div className="flex-1 bg-[#E0BAFF]"></div>
              </div>
            </button>
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} fill={isActive ? 'currentColor' : 'none'} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main 
        className={`flex-1 overflow-y-auto ${isSongDetailPage || isSamplesPage ? 'pb-0' : 'pb-20'}`}
        style={{ 
          paddingTop: isSongDetailPage || isSamplesPage
            ? '0' 
            : 'calc(56px + env(safe-area-inset-top, 0px))'
        }}
      >
        {children}
      </main>
      
      {/* Bottom Tab Bar with Player - hide player on samples page, but show navigation */}
      {!isSongDetailPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 z-50">
          {/* Player - render when currentSong exists, but hide on samples page */}
          {currentSong && !isSamplesPage ? (
            <Player />
          ) : null}
          <nav className="flex items-center justify-around px-2 py-2.5">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon size={24} fill={isActive ? 'currentColor' : 'none'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
