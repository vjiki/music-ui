import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serviceContainer } from '../core/di/ServiceContainer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SuspenseFallback from '../components/SuspenseFallback';
import type { ChatListItem, Follower } from '../types';
import { Search, ChevronLeft, SquarePen, Camera, RefreshCw } from 'lucide-react';
import ChatView from '../components/ChatView';

function MessagesContent() {
  const { currentUserId, user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [showChatView, setShowChatView] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
      loadFollowers();
    }
  }, [currentUserId, isAuthenticated]);

  const loadChats = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const fetchedChats = await serviceContainer.chatsService.getChats(currentUserId);
      // Sort by last message time (newest first)
      const sorted = fetchedChats.sort((a, b) => {
        const date1 = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const date2 = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return date2 - date1;
      });
      setChats(sorted);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFollowers = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingFollowers(true);
      const fetchedFollowers = await serviceContainer.followersService.getFollowers(currentUserId);
      setFollowers(fetchedFollowers);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const openChatWithFollower = (follower: Follower) => {
    const existingChat = chats.find((chat) =>
      chat.participants.some((p) => p.userId === follower.followerId)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      setShowChatView(true);
    } else {
      // Create a temporary chat for the follower
      const newChat: ChatListItem = {
        chatId: `temp-${follower.followerId}`,
        chatType: 'DIRECT',
        title: follower.followerNickname,
        avatarUrl: follower.followerAvatarUrl,
        participants: [
          {
            userId: follower.followerId,
            userNickname: follower.followerNickname,
            userAvatarUrl: follower.followerAvatarUrl,
          },
        ],
        unreadCount: 0,
        isMuted: false,
      };
      setSelectedChat(newChat);
      setShowChatView(true);
    }
  };

  const filteredChats = searchText
    ? chats.filter(
        (chat) =>
          chat.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          chat.participants.some((p) =>
            p.userNickname.toLowerCase().includes(searchText.toLowerCase())
          )
      )
    : chats;

  const timeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const currentUserNickname = user?.nickname || user?.email || 'Guest';

  if (showChatView && selectedChat) {
    return (
      <ChatView
        chat={selectedChat}
        onClose={() => {
          setShowChatView(false);
          setSelectedChat(null);
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{currentUserNickname}</span>
            <ChevronLeft size={12} className="text-gray-400" />
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <div className="flex-1" />
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <SquarePen size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
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

      {/* Followers/Notes Section */}
      {followers.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex gap-4 overflow-x-auto">
            {isLoadingFollowers ? (
              <div className="flex items-center justify-center w-20 h-20">
                <div className="w-6 h-6 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              followers.map((follower) => (
                <button
                  key={follower.followerId}
                  onClick={() => openChatWithFollower(follower)}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  <div className="relative">
                    {follower.followerAvatarUrl ? (
                      <img
                        src={follower.followerAvatarUrl}
                        alt={follower.followerNickname}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-white truncate w-full text-center">
                    {follower.followerNickname}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Messages</h2>
            <RefreshCw size={14} className="text-gray-400" />
          </div>
          <button className="text-blue-500 text-sm font-medium">Requests (0)</button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => {
              const otherParticipant = chat.participants.find((p) => p.userId !== currentUserId);
              const chatTitle = chat.title || otherParticipant?.userNickname || 'Chat';
              const chatAvatar = chat.avatarUrl || otherParticipant?.userAvatarUrl;

              return (
                <button
                  key={chat.chatId}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowChatView(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
                >
                  {chatAvatar ? (
                    <img
                      src={chatAvatar}
                      alt={chatTitle}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                  )}

                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{chatTitle}</p>
                    <div className="flex items-center gap-2">
                      {chat.lastMessagePreview && (
                        <>
                          <p className="text-xs text-gray-400 truncate">
                            {chat.lastMessagePreview}
                          </p>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-gray-400">· {timeAgo(chat.lastMessageAt)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {chat.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <button className="p-2 rounded hover:bg-white hover:bg-opacity-10">
                      <Camera size={18} className="text-gray-400" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ErrorBoundary>
        <MessagesContent />
      </ErrorBoundary>
    </Suspense>
  );
}

