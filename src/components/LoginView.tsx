import { useState } from 'react';
import { ChevronLeft, Mail, Globe } from 'lucide-react';
import ManualSignInView from './ManualSignInView';

interface LoginViewProps {
  onClose: () => void;
}

export default function LoginView({ onClose }: LoginViewProps) {
  const [showManualSignIn, setShowManualSignIn] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningInWithGoogle(true);
    setError(null);
    try {
      // TODO: Implement Google Sign-In
      // For now, show a message that it's not implemented
      setError('Google Sign-In is not yet implemented in the web version');
      setShowError(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setShowError(true);
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

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
            <h2 className="text-3xl font-bold">Sign in to Music</h2>
            <p className="text-gray-400">Choose how you want to sign in</p>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningInWithGoogle}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningInWithGoogle ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin" />
                <span className="flex-1 text-left">Continue with Google</span>
              </>
            ) : (
              <>
                <Globe size={20} />
                <span className="flex-1 text-left">Continue with Google</span>
              </>
            )}
          </button>

          {/* Email Sign-In Button */}
          <button
            onClick={() => setShowManualSignIn(true)}
            disabled={isSigningInWithGoogle}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors disabled:opacity-50"
          >
            <Mail size={20} />
            <span className="flex-1 text-left">Sign in with Email</span>
            <ChevronLeft size={16} className="text-gray-400 rotate-180" />
          </button>
        </div>
      </div>

      {/* Manual Sign-In Modal */}
      {showManualSignIn && (
        <ManualSignInView
          onClose={() => setShowManualSignIn(false)}
          onSignInSuccess={() => {
            setShowManualSignIn(false);
            onClose();
          }}
        />
      )}

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

