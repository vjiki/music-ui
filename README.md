# Bird Music - Web Application

A modern React-based music streaming web application similar to Yandex Music, built with **SOLID principles**, **React 19 features**, and **React Cache** for optimal performance.

## 🏗️ Architecture

This project follows **SOLID principles** and modern React patterns:

### SOLID Principles Implementation

1. **Single Responsibility Principle (SRP)**
   - Each service handles one specific domain (Auth, Songs, Playlists, etc.)
   - Repositories handle data access only
   - Components have focused responsibilities

2. **Open/Closed Principle (OCP)**
   - Services implement interfaces, allowing extension without modification
   - New service implementations can be added without changing existing code

3. **Liskov Substitution Principle (LSP)**
   - All service implementations are interchangeable through their interfaces

4. **Interface Segregation Principle (ISP)**
   - Focused interfaces: `IAuthService`, `ISongsService`, `IPlaylistsService`, etc.
   - Clients depend only on methods they use

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions (interfaces)
   - Dependency Injection Container manages service creation
   - Repositories depend on service interfaces, not concrete implementations

### React 19 Features

- **React Cache**: Automatic request deduplication using `cache()` function
- **use() Hook**: Modern promise handling for async operations
- **Suspense Boundaries**: Declarative loading states
- **Error Boundaries**: Graceful error handling

## Features

- 🎵 Music streaming with full player controls
- 🔍 Search functionality for songs and artists
- 📚 Playlist management
- 👤 User authentication and profiles
- 📱 Responsive design with dark theme
- 🎨 Modern UI inspired by Yandex Music
- ⚡ Optimized with React Cache for performance
- 🛡️ Error boundaries for robust error handling

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons
- **React Cache** for request deduplication

## Project Structure

```
src/
├── core/
│   ├── interfaces/        # Service interfaces (SOLID - ISP, DIP)
│   │   ├── IAuthService.ts
│   │   ├── ISongsService.ts
│   │   ├── IPlaylistsService.ts
│   │   ├── IStoriesService.ts
│   │   └── ISongLikesService.ts
│   ├── repositories/      # Data access layer (SOLID - SRP)
│   │   ├── AuthRepository.ts
│   │   ├── SongsRepository.ts
│   │   ├── PlaylistsRepository.ts
│   │   └── StoriesRepository.ts
│   └── di/                # Dependency Injection (SOLID - DIP)
│       └── ServiceContainer.ts
├── services/              # Concrete service implementations
│   ├── AuthService.ts
│   ├── SongsService.ts
│   ├── PlaylistsService.ts
│   ├── StoriesService.ts
│   └── SongLikesService.ts
├── hooks/                 # Custom hooks using React 19 features
│   ├── useSongs.ts        # Uses use() hook + React Cache
│   ├── usePlaylists.ts
│   ├── useStories.ts
│   └── usePlaylistWithSongs.ts
├── components/            # UI components
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── SuspenseFallback.tsx
│   └── ...
├── contexts/              # React contexts
│   ├── AuthContext.tsx
│   └── PlayerContext.tsx
└── pages/                 # Page components with Suspense
    ├── Home.tsx
    ├── Search.tsx
    ├── Playlists.tsx
    └── Profile.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

**Important:** Make sure you're in the project root directory (`music-ui/music-ui/`).

1. Navigate to the project directory:
```bash
cd music-ui  # if you're in the parent directory
```

2. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

Make sure you're in the project root directory (`music-ui/music-ui/`):

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

The project includes comprehensive tests to prevent API flooding issues. Run tests with:

```bash
npm test
```

### Test Coverage

The test suite includes:

1. **Service Layer Tests** (`src/services/__tests__/`)
   - Request deduplication tests
   - Verifies that multiple simultaneous requests for the same userId only make one API call
   - Tests error handling and cache clearing

2. **Hook Tests** (`src/hooks/__tests__/`)
   - React Cache deduplication
   - Guest user handling
   - Multiple userId scenarios

3. **Component Tests** (`src/pages/__tests__/`)
   - Prevents infinite re-render loops
   - Verifies no API flooding on component mount
   - Tests rapid re-render scenarios

4. **Integration Tests** (`src/__tests__/api-flooding.test.ts`)
   - **Critical test**: Simulates 30,000 requests to the same endpoint
   - Verifies only ONE API call is made despite thousands of requests
   - Tests rapid-fire and concurrent request scenarios

### Running Specific Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- api-flooding.test.ts
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Import your project in Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect Vite and configure the build settings

3. (Optional) Set environment variables:
   - The API URL is hardcoded to `https://music-back-g2u6.onrender.com` in all service files

4. Deploy:
   - Vercel will automatically deploy on every push to your main branch

The `vercel.json` file is already configured for optimal deployment.

## Backend Integration

The application connects to the same backend as the iOS app:
- Base URL: `https://music-back-g2u6.onrender.com`
- API endpoints follow the same structure as the iOS app

### Main API Endpoints:
- `GET /api/v1/songs/{userId}` - Get user's songs
- `POST /api/v1/auth/authenticate` - Authenticate user
- `GET /api/v1/users/{userId}` - Get user info
- `GET /api/v1/playlists/user/{userId}` - Get user playlists
- `GET /api/v1/playlists/{playlistId}` - Get playlist with songs
- `GET /api/v1/stories/user/{userId}` - Get user stories
- `POST /api/v1/song-likes/like` - Like a song
- `POST /api/v1/song-likes/dislike` - Dislike a song

## Design

- **Theme**: Black/dark theme throughout
- **Icon**: Custom bird icon used in branding
- **Layout**: Sidebar navigation similar to Yandex Music
- **Player**: Fixed bottom player bar with full controls

## Performance Optimizations

- **React Cache**: Automatic request deduplication prevents duplicate API calls
- **Suspense Boundaries**: Declarative loading states improve UX
- **Error Boundaries**: Graceful error handling prevents app crashes
- **Repository Pattern**: Centralized data access with caching

## License

See LICENSE file for details.
