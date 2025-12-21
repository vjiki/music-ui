import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ListMusic, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BirdIcon from './BirdIcon';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/playlists', icon: ListMusic, label: 'Playlists' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-bird-dark border-r border-gray-900 flex flex-col">
      <div className="p-6 border-b border-gray-900">
        <div className="flex items-center gap-3">
          <BirdIcon className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Bird</h1>
            <p className="text-xs text-gray-400">Music</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white bg-opacity-10 text-white'
                  : 'text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-900">
          <div className="flex items-center gap-3 px-4 py-2">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nickname || user.email}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <User size={16} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.nickname || user.email}
              </p>
              {user.accessLevel && (
                <p className="text-xs text-gray-400">Plus</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

