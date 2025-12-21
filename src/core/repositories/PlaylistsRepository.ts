import { cache } from 'react';
import type { Playlist, PlaylistWithSongs } from '../../types';
import type { IPlaylistsService } from '../interfaces/IPlaylistsService';

/**
 * Repository pattern for playlists data access
 * Follows Single Responsibility Principle (SRP)
 * Uses React Cache for request deduplication
 */
export class PlaylistsRepository {
  constructor(private readonly playlistsService: IPlaylistsService) {}

  getPlaylists = cache(async (userId: string): Promise<Playlist[]> => {
    return this.playlistsService.getPlaylists(userId);
  });

  getPlaylistWithSongs = cache(async (playlistId: string): Promise<PlaylistWithSongs> => {
    return this.playlistsService.getPlaylistWithSongs(playlistId);
  });
}

