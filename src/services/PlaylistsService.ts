import axios from 'axios';
import type { Playlist, PlaylistWithSongs } from '../types';
import type { IPlaylistsService } from '../core/interfaces/IPlaylistsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Concrete implementation of IPlaylistsService
 * Follows Dependency Inversion Principle (DIP)
 */
export class PlaylistsService implements IPlaylistsService {
  async getPlaylists(userId: string): Promise<Playlist[]> {
    const response = await api.get<Playlist[]>(`/api/v1/playlists/user/${userId}`);
    return response.data;
  }

  async getPlaylistWithSongs(playlistId: string): Promise<PlaylistWithSongs> {
    const response = await api.get<PlaylistWithSongs>(`/api/v1/playlists/${playlistId}`);
    return response.data;
  }
}

