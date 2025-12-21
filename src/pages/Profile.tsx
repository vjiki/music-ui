import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn({ email, password });
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {isAuthenticated && user ? (
          <div className="bg-white bg-opacity-5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname || user.email}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {user.nickname || user.email}
                </h2>
                {user.email && user.nickname && (
                  <p className="text-sm text-gray-400">{user.email}</p>
                )}
                {user.accessLevel && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs bg-gradient-to-r from-pink-500 to-orange-500 rounded-full">
                    Plus
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-gray-400">User ID</label>
                <p className="text-sm">{user.id}</p>
              </div>
              {user.createdAt && (
                <div>
                  <label className="text-xs text-gray-400">Member since</label>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400">Status</label>
                <p className="text-sm">
                  {user.isActive ? 'Active' : 'Inactive'} •{' '}
                  {user.isVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="bg-white bg-opacity-5 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

