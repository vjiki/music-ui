import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';

interface ManualSignInViewProps {
  onClose: () => void;
  onSignInSuccess: () => void;
}

export default function ManualSignInView({ onClose, onSignInSuccess }: ManualSignInViewProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsSigningIn(true);
    setError(null);

    try {
      await signIn({ email: email.trim(), password });
      setIsSigningIn(false);
      onSignInSuccess();
    } catch (err) {
      setIsSigningIn(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
      setShowError(true);
    }
  };

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold flex-1">Sign In</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header Text */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold">Sign in with Email</h2>
            <p className="text-gray-400">Enter your email and password to continue</p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isFormValid && !isSigningIn) {
                  handleSignIn();
                }
              }}
              className="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isFormValid && !isSigningIn) {
                  handleSignIn();
                }
              }}
              className="w-full px-4 py-3 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
              autoComplete="current-password"
            />
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={!isFormValid || isSigningIn}
            className={`w-full py-3.5 rounded-lg font-semibold transition-colors ${
              !isFormValid || isSigningIn
                ? 'bg-white bg-opacity-20 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSigningIn ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {showError && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bird-dark rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Sign In Error</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => {
                setShowError(false);
                setError(null);
              }}
              className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

