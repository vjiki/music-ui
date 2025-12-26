import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  HeartOff,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Info
} from 'lucide-react';
import SafeImage from '../components/SafeImage';

export default function SongDetail() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUserId } = useAuth();
  const {
    currentSong,
    queue,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextSong,
    previousSong,
    playSong,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
    toggleLike,
    toggleDislike,
    seekTo,
  } = usePlayer();

  const [isHovering, setIsHovering] = useState(false);
  
  // Determine which view to show based on query parameter
  const view = searchParams.get('view') || 'detailed';
  const isMinimalView = view === 'minimal';

  // Always use currentSong if available, otherwise try to find by songId
  const song = currentSong || queue.find(s => s.id === songId) || null;

  // Update URL when currentSong changes (e.g., when next song starts playing)
  useEffect(() => {
    if (currentSong && currentSong.id !== songId) {
      // Update the URL to match the currently playing song
      const viewParam = searchParams.get('view') || 'detailed';
      navigate(`/song/${currentSong.id}?view=${viewParam}`, { replace: true });
    }
  }, [currentSong, songId, navigate, searchParams]);

  useEffect(() => {
    // If we have a songId but no matching song, navigate back
    if (songId && !song) {
      navigate(-1);
    }
  }, [songId, song, navigate]);

  if (!song) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-gray-400">Song not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayClick = () => {
    if (song.id !== currentSong?.id) {
      playSong(song, queue.length > 0 ? queue : [song]);
    } else {
      togglePlayPause();
    }
  };

  // Check if the current song is playing - use currentSong.id to ensure it matches
  const isCurrentSongPlaying = isPlaying && currentSong && song.id === currentSong.id;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      seekTo(newTime);
    }
  };

  // Minimal/Centered View
  if (isMinimalView) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-900 text-white">
        {/* Navigation */}
        <div className="sticky z-10 bg-gray-900 bg-opacity-80 backdrop-blur-sm px-6 py-4" style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Main Content - Centered Layout */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12">
          {/* Album Art with Hover Effects - Large and Centered */}
          <div
            className="relative w-full max-w-[600px] aspect-square mb-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {song.cover ? (
              <SafeImage
                src={song.cover}
                alt={song.title}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-6xl">🎵</span>
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
            )}

            {/* Hover Overlay with Controls */}
            {isHovering && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300">
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Top Right Controls */}
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Bottom Left Controls */}
                  <div className="absolute bottom-4 left-4">
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Bottom Right Controls */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song) {
                          toggleLike(currentUserId);
                        }
                      }}
                      className={`p-2 rounded-full hover:bg-opacity-30 transition-colors ${
                        song.isLiked ? 'bg-red-500 bg-opacity-30 text-red-500' : 'bg-white bg-opacity-20 text-white'
                      }`}
                    >
                      <Heart size={20} fill={song.isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song) {
                          toggleDislike(currentUserId);
                        }
                      }}
                      className={`p-2 rounded-full hover:bg-opacity-30 transition-colors ${
                        song.isDisliked ? 'bg-blue-500 bg-opacity-30 text-blue-500' : 'bg-white bg-opacity-20 text-white'
                      }`}
                    >
                      <HeartOff size={20} fill={song.isDisliked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Center Controls - Main Playback */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        previousSong();
                      }}
                      className="p-3 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                    >
                      <SkipBack size={24} fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                      }}
                      className="p-5 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
                    >
                      {isCurrentSongPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSong();
                      }}
                      className="p-3 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                    >
                      <SkipForward size={24} fill="currentColor" />
                    </button>
                  </div>

                  {/* Bottom Center Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShuffle();
                      }}
                      className={`p-2 rounded-full hover:bg-opacity-30 transition-colors ${
                        isShuffled ? 'bg-yellow-500 bg-opacity-30 text-yellow-500' : 'bg-white bg-opacity-20 text-white'
                      }`}
                    >
                      <Shuffle size={20} fill={isShuffled ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRepeat();
                      }}
                      className={`p-2 rounded-full hover:bg-opacity-30 transition-colors ${
                        repeatMode !== 'off' ? 'bg-yellow-500 bg-opacity-30 text-yellow-500' : 'bg-white bg-opacity-20 text-white'
                      }`}
                    >
                      <Repeat size={20} fill={repeatMode === 'one' ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Track Information - Centered */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-semibold mb-1">{song.title}</h1>
            <p className="text-base text-gray-400">{song.artist}</p>
          </div>

          {/* Progress Bar - Centered */}
          <div className="w-full max-w-[600px] mb-2">
            <div 
              className="h-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed View (default)
  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      {/* Navigation */}
      <div className="sticky z-10 bg-black bg-opacity-80 backdrop-blur-sm px-6 py-4" style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Track Type */}
        <div className="mb-2">
          <span className="text-sm text-gray-400">Сингл</span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Album Art - No hover effects in detailed view */}
          <div className="relative flex-shrink-0 w-full md:w-96 aspect-square">
            {song.cover ? (
              <SafeImage
                src={song.cover}
                alt={song.title}
                className="w-full h-full rounded-lg object-cover"
                fallback={
                  <div className="w-full h-full rounded-lg bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-6xl">🎵</span>
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{song.title}</h1>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-lg text-gray-300">{song.artist}</p>
              <span className="text-gray-500">•</span>
              <p className="text-lg text-gray-500">2023</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={handlePlayClick}
                className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center gap-2"
              >
                {isCurrentSongPlaying ? (
                  <>
                    <Pause size={20} fill="currentColor" />
                    <span>Пауза</span>
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    <span>Слушать</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (song) {
                    toggleLike(currentUserId);
                  }
                }}
                className={`p-3 rounded-lg hover:bg-opacity-20 transition-colors ${
                  song.isLiked ? 'bg-red-500 bg-opacity-20 text-red-500' : 'bg-white bg-opacity-10 text-white'
                }`}
              >
                <Heart size={20} fill={song.isLiked ? 'currentColor' : 'none'} />
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (song) {
                    toggleDislike(currentUserId);
                  }
                }}
                className={`p-3 rounded-lg hover:bg-opacity-20 transition-colors ${
                  song.isDisliked ? 'bg-blue-500 bg-opacity-20 text-blue-500' : 'bg-white bg-opacity-10 text-white'
                }`}
              >
                <HeartOff size={20} fill={song.isDisliked ? 'currentColor' : 'none'} />
              </button>
              <button 
                type="button"
                className="p-3 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button 
                type="button"
                className="p-3 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Track Info Line */}
            <div className="flex items-center gap-2 mb-4">
              <Play size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">{song.title}</span>
              <button 
                type="button"
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-10"
              >
                <Info size={14} className="text-gray-400" />
              </button>
            </div>

            {/* Label Info */}
            <div className="text-sm text-gray-400">
              Лейбл: Gorky Records
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="h-1 bg-gray-800 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-yellow-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button 
            type="button"
            onClick={toggleShuffle}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              isShuffled ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle size={20} fill={isShuffled ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={previousSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={handlePlayClick}
            className="p-4 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
          >
            {isPlaying && song.id === currentSong?.id ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={nextSong}
            className="p-2 rounded hover:bg-white hover:bg-opacity-10 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button 
            type="button"
            onClick={toggleRepeat}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors ${
              repeatMode !== 'off' ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat size={20} fill={repeatMode === 'one' ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}

