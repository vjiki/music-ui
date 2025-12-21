import type { Playlist, PlaylistWithSongs } from '../../types';

/**
 * Interface for playlists service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IPlaylistsService {
  getPlaylists(userId: string): Promise<Playlist[]>;
  getPlaylistWithSongs(playlistId: string): Promise<PlaylistWithSongs>;
}

