import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/profile');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-semibold flex-1">Settings and activity</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
            />
          </div>
        </div>

        {/* Your Account Section */}
        <SettingsSection title="Your account">
          <SettingsRow
            icon="👤"
            title="Accounts Centre"
            subtitle="Password, security, personal details, ad preferences"
            trailing={<span className="text-xs text-gray-400">∞ Meta</span>}
          />
          <p className="text-xs text-gray-400 px-4 py-2">
            Manage your connected experiences and account settings across Meta technologies. Learn more
          </p>
        </SettingsSection>

        {/* How You Use Music Section */}
        <SettingsSection title="How you use Music">
          <SettingsRow icon="🔖" title="Saved" />
          <SettingsRow icon="↩️" title="Archive" />
          <SettingsRow icon="📊" title="Your activity" />
          <SettingsRow icon="🔔" title="Notifications" />
          <SettingsRow icon="⏰" title="Time management" />
          <SettingsRow
            icon="🎵"
            title="Update Music"
            trailing={<div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          />
        </SettingsSection>

        {/* Who Can See Section */}
        <SettingsSection title="Who can see your content">
          <SettingsRow
            icon="🔒"
            title="Account privacy"
            trailing={<span className="text-xs text-gray-400">Public</span>}
          />
          <SettingsRow
            icon="⭐"
            title="Close Friends"
            trailing={<span className="text-xs text-gray-400">0</span>}
          />
          <SettingsRow icon="📱" title="Crossposting" />
          <SettingsRow
            icon="🚫"
            title="Blocked"
            trailing={<span className="text-xs text-gray-400">0</span>}
          />
          <SettingsRow icon="📍" title="Story and location" />
          <SettingsRow icon="👥" title="Activity in Friends tab" />
        </SettingsSection>

        {/* How Others Interact Section */}
        <SettingsSection title="How others can interact with you">
          <SettingsRow icon="💬" title="Messages and story replies" />
          <SettingsRow icon="@" title="Tags and mentions" />
          <SettingsRow icon="💭" title="Comments" />
          <SettingsRow icon="🔄" title="Sharing and reuse" />
          <SettingsRow
            icon="🚫"
            title="Restricted"
            trailing={<span className="text-xs text-gray-400">0</span>}
          />
          <SettingsRow
            icon="⚠️"
            title="Limit interactions"
            trailing={<span className="text-xs text-gray-400">Off</span>}
          />
          <SettingsRow icon="🔤" title="Hidden words" />
          <SettingsRow icon="👤" title="Follow and invite friends" />
        </SettingsSection>

        {/* What You See Section */}
        <SettingsSection title="What you see">
          <SettingsRow
            icon="⭐"
            title="Favourites"
            trailing={<span className="text-xs text-gray-400">0</span>}
          />
          <SettingsRow
            icon="🔕"
            title="Muted accounts"
            trailing={<span className="text-xs text-gray-400">0</span>}
          />
          <SettingsRow icon="🎬" title="Content preferences" />
          <SettingsRow icon="❤️" title="Like and share counts" />
          <SettingsRow icon="👑" title="Subscriptions" />
        </SettingsSection>

        {/* Your App and Media Section */}
        <SettingsSection title="Your app and media">
          <SettingsRow icon="📱" title="Device permissions" />
          <SettingsRow icon="⬇️" title="Archiving and downloading" />
          <SettingsRow
            icon="💾"
            title="Data and Storage"
            iconColor="green"
          />
          <SettingsRow icon="♿" title="Accessibility" />
          <SettingsRow icon="🌐" title="Language and translations" />
          <SettingsRow icon="📊" title="Media quality" />
          <SettingsRow icon="💻" title="App website permissions" />
        </SettingsSection>

        {/* Family Centre Section */}
        <SettingsSection title="Family Centre">
          <SettingsRow icon="🏠" title="Supervision for Teen Accounts" />
        </SettingsSection>

        {/* Your Insights Section */}
        <SettingsSection title="Your insights and tools">
          <SettingsRow icon="⭐" title="Your dashboard" />
          <SettingsRow icon="📊" title="Account type and tools" />
          <SettingsRow
            icon="✅"
            title="Music Verified"
            trailing={<span className="text-xs text-gray-400">Not subscribed</span>}
          />
        </SettingsSection>

        {/* Your Orders Section */}
        <SettingsSection title="Your orders and fundraisers">
          <SettingsRow icon="📄" title="Orders and payments" />
        </SettingsSection>

        {/* More Info Section */}
        <SettingsSection title="More info and support">
          <SettingsRow icon="❓" title="Help" />
          <SettingsRow icon="🛡️" title="Privacy Centre" />
          <SettingsRow icon="👥" title="Account Status" />
          <SettingsRow icon="ℹ️" title="About" />
        </SettingsSection>

        {/* Also From Meta Section */}
        <SettingsSection title="Also from Meta">
          <SettingsRow
            icon="💬"
            title="WhatsApp"
            subtitle="Message privately with friends and family"
          />
          <SettingsRow
            icon="🎬"
            title="Edits"
            subtitle="Create videos with powerful editing tools"
            trailing={<div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
          />
          <SettingsRow
            icon="@"
            title="Threads"
            subtitle="Share ideas and join conversations"
          />
          <SettingsRow
            icon="f"
            title="Facebook"
            subtitle="Explore things that you love"
          />
          <SettingsRow
            icon="⚡"
            title="Messenger"
            subtitle="Chat and share seamlessly with friends"
          />
        </SettingsSection>

        {/* Login Section */}
        <SettingsSection title="Login">
          {isAuthenticated && user ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname || user.email}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{user.nickname || user.email}</p>
                  {user.email && user.nickname && (
                    <p className="text-xs text-gray-400">{user.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowLogoutConfirmation(true)}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-white hover:bg-opacity-5"
              >
                Log out
              </button>
            </>
            ) : (
            <button
              onClick={() => {
                // Navigate to profile which will show login
                navigate('/profile');
              }}
              className="w-full px-4 py-3 text-left text-blue-500 hover:bg-white hover:bg-opacity-5"
            >
              Add account
            </button>
          )}
        </SettingsSection>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bird-dark rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-800">
            <h2 className="text-xl font-bold mb-2">Log Out</h2>
            <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="flex-1 px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold px-4 pt-4 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  trailing,
  iconColor = 'white',
}: {
  icon: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white hover:bg-opacity-5 transition-colors">
      <span className="text-xl" style={{ color: iconColor === 'green' ? '#10b981' : 'inherit' }}>
        {icon}
      </span>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {trailing ? (
        <div className="flex items-center gap-2">
          {trailing}
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      ) : (
        <ChevronRight size={16} className="text-gray-400" />
      )}
    </button>
  );
}

