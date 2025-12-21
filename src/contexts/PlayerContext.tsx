import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import type { Song } from '../types';
import { transformAudioUrl } from '../utils/urlUtils';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  librarySongs: Song[];
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  isLiked: boolean;
  isDisliked: boolean;
  toggleLike: () => void;
  toggleDislike: () => void;
  setLibrarySongs: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Memoize setLibrarySongs to prevent infinite re-renders
  const setLibrarySongsMemoized = useCallback((songs: Song[]) => {
    setLibrarySongs(songs);
  }, []);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setQueue((prevQueue) => {
        setCurrentSong((prevSong) => {
          if (prevQueue.length > 0 && prevSong) {
            const currentIndex = prevQueue.findIndex((s) => s.id === prevSong.id);
            const nextIndex = (currentIndex + 1) % prevQueue.length;
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
          } else {
            setIsPlaying(false);
            return prevSong;
          }
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
  }, []);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    if (newQueue) {
      setQueue(newQueue);
    }
    if (audioRef.current && song.audio_url) {
      // Transform Google Drive URLs to ensure they work
      const transformedUrl = transformAudioUrl(song.audio_url);
      audioRef.current.src = transformedUrl;
      audioRef.current.crossOrigin = 'anonymous'; // Allow CORS for audio
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        console.error('Audio URL:', transformedUrl);
        setIsPlaying(false);
        // Try alternative URL format if first attempt fails
        const audio = audioRef.current;
        if (audio && transformedUrl.includes('drive.google.com') && transformedUrl.includes('export=view')) {
          // Try download format as fallback
          const idMatch = transformedUrl.match(/id=([a-zA-Z0-9_-]+)/);
          if (idMatch) {
            const fileId = idMatch[1];
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            audio.src = downloadUrl;
            audio.load();
            audio.play().catch((fallbackError) => {
              console.error('Fallback audio URL also failed:', fallbackError);
            });
          }
        }
      });
    }
  }, []);

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
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      playSong(queue[nextIndex], queue);
    }
  };

  const previousSong = () => {
    if (queue.length > 0 && currentSong) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      playSong(queue[prevIndex], queue);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const toggleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
        playSong,
        togglePlayPause,
        setCurrentTime,
        setVolume,
        nextSong,
        previousSong,
        isLiked,
        isDisliked,
        toggleLike,
        toggleDislike,
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

