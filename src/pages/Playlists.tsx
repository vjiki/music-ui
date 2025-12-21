import { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlaylistsSafe } from '../hooks/usePlaylistsSafe';
import { usePlaylistWithSongs } from '../hooks/usePlaylistWithSongs';
import { Music } from 'lucide-react';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

function PlaylistCard({ name, description, cover, onPlay }: {
  name: string;
  description?: string;
  cover?: string;
  onPlay: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      className="flex flex-col gap-3 p-4 bg-white bg-opacity-5 rounded-2xl hover:bg-opacity-10 transition-colors"
    >
      {cover ? (
        <img
          src={cover}
          alt={name}
          className="w-full aspect-square rounded-xl object-cover"
        />
      ) : (
        <div className="w-full aspect-square rounded-xl bg-white bg-opacity-10 flex items-center justify-center">
          <Music size={48} className="text-gray-400" />
        </div>
      )}
      <div className="text-left">
        <p className="text-sm font-medium truncate">{name}</p>
        {description && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

function PlaylistItem({ playlistId, name, description, cover }: {
  playlistId: string;
  name: string;
  description?: string;
  cover?: string;
}) {
  const { playSong } = usePlayer();
  const playlistWithSongs = usePlaylistWithSongs(playlistId);

  const handleClick = () => {
    if (playlistWithSongs.songs.length > 0) {
      playSong(playlistWithSongs.songs[0], playlistWithSongs.songs);
    }
  };

  return (
    <PlaylistCard
      name={name}
      description={description}
      cover={cover}
      onPlay={handleClick}
    />
  );
}

function PlaylistsContent() {
  const { currentUserId, isAuthenticated } = useAuth();
  
  // Use React 19's use() hook with cached repositories
  const playlists = usePlaylistsSafe(isAuthenticated ? currentUserId : null);

  return (
    <div className="flex-1 overflow-y-auto bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>

        {!isAuthenticated ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Please sign in to view your playlists</div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">No playlists yet</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <Suspense key={playlist.id} fallback={<PlaylistCard name={playlist.name} description={playlist.description} cover={playlist.cover} onPlay={() => {}} />}>
                <PlaylistItem
                  playlistId={playlist.id}
                  name={playlist.name}
                  description={playlist.description}
                  cover={playlist.cover}
                />
              </Suspense>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Playlists() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary>
        <PlaylistsContent />
      </ErrorBoundary>
    </Suspense>
  );
}

