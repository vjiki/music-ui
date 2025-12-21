import { useState, useMemo, Suspense, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useSongs } from '../hooks/useSongs';
import { Search as SearchIcon } from 'lucide-react';
import SuspenseFallback from '../components/SuspenseFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

function SearchContent() {
  const { currentUserId } = useAuth();
  const { playSong, setLibrarySongs } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use React 19's use() hook with cached repositories
  const librarySongs = useSongs(currentUserId);
  
  // Update player context with songs when they load
  useEffect(() => {
    if (librarySongs.length > 0) {
      setLibrarySongs(librarySongs);
    }
  }, [librarySongs, setLibrarySongs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return librarySongs;
    const query = searchQuery.toLowerCase();
    return librarySongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [librarySongs, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* Results */}
        {filteredSongs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">
              {searchQuery ? 'No songs found' : 'No songs available'}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, filteredSongs)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
              >
                {song.cover && (
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-14 h-14 rounded object-cover"
                  />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <button className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400">
                  <span className="text-lg">⋯</span>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary>
        <SearchContent />
      </ErrorBoundary>
    </Suspense>
  );
}

