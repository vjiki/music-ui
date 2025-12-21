import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import type { Song } from '../types';
import { transformAudioUrl } from '../utils/urlUtils';
import { serviceContainer } from '../core/di/ServiceContainer';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  librarySongs: Song[];
  isShuffled: boolean;
  repeatMode: RepeatMode;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (userId: string) => Promise<void>;
  toggleDislike: (userId: string) => Promise<void>;
  seekTo: (time: number) => void;
  setLibrarySongs: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Navigation helper - we'll use a ref to avoid issues with hooks in context
let navigateToSong: ((songId: string) => void) | null = null;

export function setNavigateToSong(navigate: (songId: string) => void) {
  navigateToSong = navigate;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]); // Store original queue order for shuffle
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Memoize setLibrarySongs to prevent infinite re-renders
  // Use a ref to track the last set songs to prevent unnecessary updates
  const lastLibrarySongsRef = useRef<string>('');
  const setLibrarySongsMemoized = useCallback((songs: Song[]) => {
    const songsKey = songs.map(s => s.id).join(',');
    // Only update if the songs actually changed
    if (lastLibrarySongsRef.current !== songsKey) {
      lastLibrarySongsRef.current = songsKey;
      setLibrarySongs(songs);
    }
  }, []);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setQueue((prevQueue) => {
        setCurrentSong((prevSong) => {
          if (!prevSong || prevQueue.length === 0) {
            setIsPlaying(false);
            return prevSong;
          }

          // Handle repeat one mode
          if (repeatMode === 'one') {
            if (audioRef.current && prevSong.audio_url) {
              const transformedUrl = transformAudioUrl(prevSong.audio_url);
              audioRef.current.src = transformedUrl;
              audioRef.current.crossOrigin = 'anonymous';
              audioRef.current.load();
              audioRef.current.play().catch((error) => {
                console.error('Error replaying song:', error);
                setIsPlaying(false);
              });
            }
            return prevSong;
          }

          // Handle repeat all or off mode
          const currentIndex = prevQueue.findIndex((s) => s.id === prevSong.id);
          const nextIndex = (currentIndex + 1) % prevQueue.length;
          
          // If repeat is off and we're at the last song, stop
          if (repeatMode === 'off' && nextIndex === 0) {
            setIsPlaying(false);
            return prevSong;
          }

          const nextSong = prevQueue[nextIndex];
          if (audioRef.current && nextSong && nextSong.audio_url) {
            const transformedUrl = transformAudioUrl(nextSong.audio_url);
            audioRef.current.src = transformedUrl;
            audioRef.current.crossOrigin = 'anonymous';
            audioRef.current.load();
            audioRef.current.play().catch((error) => {
              console.error('Error playing next song:', error);
              setIsPlaying(false);
            });
          }
          return nextSong;
        });
        return prevQueue;
      });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [repeatMode]);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    // Set song immediately to show player UI (synchronous, no delay)
    // Use functional updates to prevent unnecessary re-renders if same song
    const isNewSong = currentSong?.id !== song.id;
    
    setCurrentSong((prevSong) => {
      // Only update if it's actually a different song
      if (prevSong?.id === song.id) {
        return prevSong; // Return same reference to prevent re-render
      }
      return song;
    });
    if (newQueue) {
      setQueue((prevQueue) => {
        // Only update if queue actually changed (by comparing IDs)
        const prevIds = prevQueue.map(s => s.id).join(',');
        const newIds = newQueue.map(s => s.id).join(',');
        if (prevIds === newIds && prevQueue.length === newQueue.length) {
          return prevQueue; // Return same reference to prevent re-render
        }
        // Store original queue order for shuffle functionality
        setOriginalQueue([...newQueue]);
        return newQueue;
      });
    }

    // Navigate to detailed song detail view when a new song is played (from play button)
    if (isNewSong && navigateToSong) {
      navigateToSong(song.id);
    }
    
    // Load and play audio asynchronously (doesn't block UI)
    if (audioRef.current && song.audio_url) {
      // Transform Google Drive URLs to ensure they work
      const transformedUrl = transformAudioUrl(song.audio_url);
      const audio = audioRef.current;
      
      // Set source and attributes
      audio.src = transformedUrl;
      audio.crossOrigin = 'anonymous';
      
      // Load audio (this is async but doesn't block UI)
      audio.load();
      
      // Play audio (this is async)
      audio.play()
        .then(() => {
          // Audio started playing successfully
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          console.error('Audio URL:', transformedUrl);
          setIsPlaying(false);
          // Try alternative URL format if first attempt fails
          if (audio && transformedUrl.includes('drive.google.com') && transformedUrl.includes('export=view')) {
            // Try download format as fallback
            const idMatch = transformedUrl.match(/id=([a-zA-Z0-9_-]+)/);
            if (idMatch) {
              const fileId = idMatch[1];
              const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
              audio.src = downloadUrl;
              audio.load();
              audio.play()
                .then(() => setIsPlaying(true))
                .catch((fallbackError) => {
                  console.error('Fallback audio URL also failed:', fallbackError);
                });
            }
          }
        });
    }
  }, [currentSong]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const nextSong = () => {
    if (queue.length > 0 && currentSong) {
      let nextSong: Song;
      
      if (isShuffled && originalQueue.length > 0) {
        // Get next random song from original queue (excluding current)
        const availableSongs = originalQueue.filter(s => s.id !== currentSong.id);
        if (availableSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSongs.length);
          nextSong = availableSongs[randomIndex];
        } else {
          // Fallback to sequential if no other songs
          const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
          const nextIndex = (currentIndex + 1) % queue.length;
          nextSong = queue[nextIndex];
        }
      } else {
        // Sequential playback
        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        nextSong = queue[nextIndex];
      }
      
      playSong(nextSong, queue);
    }
  };

  const previousSong = () => {
    if (queue.length > 0 && currentSong) {
      // For shuffle, we'll just go to previous in current queue
      // For sequential, go to previous song
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      playSong(queue[prevIndex], queue);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLike = useCallback(async (userId: string) => {
    if (!currentSong) {
      console.log('toggleLike: No currentSong');
      return;
    }
    if (userId === 'guest') {
      console.log('toggleLike: User is guest, cannot like');
      return;
    }
    
    console.log('toggleLike: Current song:', currentSong.id, 'isLiked:', currentSong.isLiked, 'isDisliked:', currentSong.isDisliked, 'userId:', userId);
    const wasLiked = currentSong.isLiked || false;
    const wasDisliked = currentSong.isDisliked || false;
    
    // Optimistically update UI - backend will toggle the like state
    const updatedSong: Song = {
      ...currentSong,
      isLiked: !wasLiked,
      isDisliked: false, // Liking removes dislike
      likesCount: wasLiked ? Math.max(0, (currentSong.likesCount || 0) - 1) : (currentSong.likesCount || 0) + 1,
      dislikesCount: wasDisliked ? Math.max(0, (currentSong.dislikesCount || 0) - 1) : (currentSong.dislikesCount || 0),
    };
    
    console.log('toggleLike: Updating song to:', updatedSong.isLiked, 'likesCount:', updatedSong.likesCount);
    setCurrentSong(updatedSong);
    
    // Update in queue
    setQueue((prevQueue) =>
      prevQueue.map((s) => (s.id === currentSong.id ? updatedSong : s))
    );
    
    // Update in library
    setLibrarySongs((prevSongs) =>
      prevSongs.map((s) => (s.id === currentSong.id ? updatedSong : s))
    );
    
    try {
      console.log('toggleLike: Calling API with userId:', userId, 'songId:', currentSong.id);
      // Backend handles toggle - calling like on an already liked song will unlike it
      await serviceContainer.songLikesService.likeSong({
        userId,
        songId: currentSong.id,
      });
      console.log('toggleLike: API call successful');
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setCurrentSong(currentSong);
      setQueue((prevQueue) =>
        prevQueue.map((s) => (s.id === currentSong.id ? currentSong : s))
      );
      setLibrarySongs((prevSongs) =>
        prevSongs.map((s) => (s.id === currentSong.id ? currentSong : s))
      );
    }
  }, [currentSong]);

  const toggleDislike = useCallback(async (userId: string) => {
    if (!currentSong) {
      console.log('toggleDislike: No currentSong');
      return;
    }
    if (userId === 'guest') {
      console.log('toggleDislike: User is guest, cannot dislike');
      return;
    }
    
    console.log('toggleDislike: Current song:', currentSong.id, 'isLiked:', currentSong.isLiked, 'isDisliked:', currentSong.isDisliked, 'userId:', userId);
    const wasLiked = currentSong.isLiked || false;
    const wasDisliked = currentSong.isDisliked || false;
    
    // Optimistically update UI - backend will toggle the dislike state
    const updatedSong: Song = {
      ...currentSong,
      isLiked: false, // Disliking removes like
      isDisliked: !wasDisliked,
      likesCount: wasLiked ? Math.max(0, (currentSong.likesCount || 0) - 1) : (currentSong.likesCount || 0),
      dislikesCount: wasDisliked ? Math.max(0, (currentSong.dislikesCount || 0) - 1) : (currentSong.dislikesCount || 0) + 1,
    };
    
    console.log('toggleDislike: Updating song to:', updatedSong.isDisliked, 'dislikesCount:', updatedSong.dislikesCount);
    
    setCurrentSong(updatedSong);
    
    // Update in queue
    setQueue((prevQueue) =>
      prevQueue.map((s) => (s.id === currentSong.id ? updatedSong : s))
    );
    
    // Update in library
    setLibrarySongs((prevSongs) =>
      prevSongs.map((s) => (s.id === currentSong.id ? updatedSong : s))
    );
    
    try {
      // Backend handles toggle - calling dislike on an already disliked song will undislike it
      await serviceContainer.songLikesService.dislikeSong({
        userId,
        songId: currentSong.id,
      });
    } catch (error) {
      console.error('Error toggling dislike:', error);
      // Revert on error
      setCurrentSong(currentSong);
      setQueue((prevQueue) =>
        prevQueue.map((s) => (s.id === currentSong.id ? currentSong : s))
      );
      setLibrarySongs((prevSongs) =>
        prevSongs.map((s) => (s.id === currentSong.id ? currentSong : s))
      );
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audio.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        librarySongs,
        isShuffled,
        repeatMode,
        playSong,
        togglePlayPause,
        setCurrentTime,
        setVolume,
        nextSong,
        previousSong,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        toggleDislike,
        seekTo,
        setLibrarySongs: setLibrarySongsMemoized,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

