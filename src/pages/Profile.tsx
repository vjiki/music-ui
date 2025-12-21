import { Suspense, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useSongs } from '../hooks/useSongs';
import { List } from 'lucide-react';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoginView from '../components/LoginView';
import SafeImage from '../components/SafeImage';

function ProfileContent() {
  const navigate = useNavigate();
  const { currentUserId, user, isAuthenticated } = useAuth();
  const { playSong, librarySongs, setLibrarySongs } = usePlayer();
  const [showLogin, setShowLogin] = useState(false);
  const lastSongsRef = useRef<string>('');
  
  // Use React 19's use() hook with cached repositories
  const songs = useSongs(currentUserId);
  
  // Update player context with songs when they load (only if different)
  useEffect(() => {
    const songsKey = songs.map(s => s.id).join(',');
    if (songs.length > 0 && lastSongsRef.current !== songsKey) {
      lastSongsRef.current = songsKey;
      setLibrarySongs(songs);
    }
  }, [songs, setLibrarySongs]);

  const likedSongs = librarySongs.filter((s) => s.isLiked);
  const dislikedSongs = librarySongs.filter((s) => s.isDisliked);

  const displayName = user?.nickname || user?.email || 'Music Lover';
  const displayEmail = isAuthenticated && user?.email ? user.email : 'Guest';

  // Close login view when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showLogin) {
      setShowLogin(false);
    }
  }, [isAuthenticated, showLogin]);

  // Show login view if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex-1 overflow-y-auto bg-black px-5 pt-6 pb-24">
          {/* Header with Settings button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded hover:bg-white hover:bg-opacity-10"
            >
              <List size={24} className="text-white" />
            </button>
          </div>

          {/* Guest Profile */}
          <div className="flex flex-col items-center gap-4 mb-6 py-8">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-1">Music Lover</h2>
              <p className="text-sm text-gray-400">Guest</p>
            </div>
          </div>

          {/* Login Button */}
          <div className="px-5">
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-3.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {showLogin && (
          <div className="fixed inset-0 z-50">
            <LoginView
              onClose={() => {
                setShowLogin(false);
              }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black px-5 pt-6 pb-24">
      {/* Header with Settings button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded hover:bg-white hover:bg-opacity-10"
        >
          <List size={24} className="text-white" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 mb-6 py-8">
        {user?.avatarUrl ? (
          <SafeImage
            src={user.avatarUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-white border-opacity-20"
            fallback={
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            }
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">{displayName}</h2>
          <p className="text-sm text-gray-400">{displayEmail}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title={likedSongs.length.toString()} subtitle="Liked" />
        <StatCard title={dislikedSongs.length.toString()} subtitle="Disliked" />
        <StatCard title={librarySongs.length.toString()} subtitle="Total" />
      </div>

      {/* Recently Liked Section */}
      <div className="bg-white bg-opacity-5 rounded-2xl p-5">
        <h3 className="text-lg font-bold mb-4">Recently Liked</h3>
        {likedSongs.length === 0 ? (
          <p className="text-gray-400 text-sm py-5">No liked songs yet</p>
        ) : (
          <div className="space-y-4">
                   {likedSongs.slice(0, 5).map((song) => (
                     <button
                       key={song.id}
                       type="button"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         playSong(song, likedSongs);
                       }}
                       className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
                     >
                {song.cover ? (
                  <SafeImage
                    src={song.cover}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    fallback={
                      <div className="w-12 h-12 rounded-lg bg-white bg-opacity-10 flex items-center justify-center">
                        <span className="text-xs">🎵</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-xs">🎵</span>
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white bg-opacity-5 rounded-2xl p-4 text-center">
      <p className="text-2xl font-bold mb-1">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary>
        <ProfileContent />
      </ErrorBoundary>
    </Suspense>
  );
}
