import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SongDetail from './pages/SongDetail';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/song/:songId" element={<SongDetail />} />
              </Routes>
            </Layout>
          </Router>
        </PlayerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

