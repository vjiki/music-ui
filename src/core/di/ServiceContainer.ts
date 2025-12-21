import { AuthService } from '../../services/AuthService';
import { SongsService } from '../../services/SongsService';
import { PlaylistsService } from '../../services/PlaylistsService';
import { StoriesService } from '../../services/StoriesService';
import { SongLikesService } from '../../services/SongLikesService';
import { AuthRepository } from '../repositories/AuthRepository';
import { SongsRepository } from '../repositories/SongsRepository';
import { PlaylistsRepository } from '../repositories/PlaylistsRepository';
import { StoriesRepository } from '../repositories/StoriesRepository';
import type { IAuthService } from '../interfaces/IAuthService';
import type { ISongsService } from '../interfaces/ISongsService';
import type { IPlaylistsService } from '../interfaces/IPlaylistsService';
import type { IStoriesService } from '../interfaces/IStoriesService';
import type { ISongLikesService } from '../interfaces/ISongLikesService';

/**
 * Dependency Injection Container
 * Follows Dependency Inversion Principle (DIP)
 * Centralizes service creation and dependency management
 */
class ServiceContainer {
  // Services (concrete implementations)
  private readonly _authService: IAuthService;
  private readonly _songsService: ISongsService;
  private readonly _playlistsService: IPlaylistsService;
  private readonly _storiesService: IStoriesService;
  private readonly _songLikesService: ISongLikesService;

  // Repositories
  private readonly _authRepository: AuthRepository;
  private readonly _songsRepository: SongsRepository;
  private readonly _playlistsRepository: PlaylistsRepository;
  private readonly _storiesRepository: StoriesRepository;

  constructor() {
    // Initialize services
    this._authService = new AuthService();
    this._songsService = new SongsService();
    this._playlistsService = new PlaylistsService();
    this._storiesService = new StoriesService();
    this._songLikesService = new SongLikesService();

    // Initialize repositories with services
    this._authRepository = new AuthRepository(this._authService);
    this._songsRepository = new SongsRepository(this._songsService);
    this._playlistsRepository = new PlaylistsRepository(this._playlistsService);
    this._storiesRepository = new StoriesRepository(this._storiesService);
  }

  // Service getters
  get authService(): IAuthService {
    return this._authService;
  }

  get songsService(): ISongsService {
    return this._songsService;
  }

  get playlistsService(): IPlaylistsService {
    return this._playlistsService;
  }

  get storiesService(): IStoriesService {
    return this._storiesService;
  }

  get songLikesService(): ISongLikesService {
    return this._songLikesService;
  }

  // Repository getters
  get authRepository(): AuthRepository {
    return this._authRepository;
  }

  get songsRepository(): SongsRepository {
    return this._songsRepository;
  }

  get playlistsRepository(): PlaylistsRepository {
    return this._playlistsRepository;
  }

  get storiesRepository(): StoriesRepository {
    return this._storiesRepository;
  }
}

// Singleton instance
export const serviceContainer = new ServiceContainer();

