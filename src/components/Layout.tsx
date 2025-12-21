import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Search, ListMusic, User, MessageCircle } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import Player from './Player';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { currentSong } = usePlayer();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/playlists', icon: ListMusic, label: 'Playlists' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-900 z-50">
        {currentSong && (
          <div className="px-4 pt-2 pb-1">
            <Player />
          </div>
        )}
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={24} fill={isActive ? 'currentColor' : 'none'} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
