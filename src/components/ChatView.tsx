import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { ChatListItem, Message } from '../types';
import { ChevronLeft, Camera, Video, Mic, Send } from 'lucide-react';

interface ChatViewProps {
  chat: ChatListItem;
  onClose: () => void;
}

export default function ChatView({ chat, onClose }: ChatViewProps) {
  const { currentUserId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = chat.participants.find((p) => p.userId !== currentUserId);
  const chatTitle = chat.title || otherParticipant?.userNickname || 'Chat';
  const chatAvatar = chat.avatarUrl || otherParticipant?.userAvatarUrl;

  useEffect(() => {
    loadMessages();
  }, [chat.chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!otherParticipant) return;
    try {
      setIsLoading(true);
      const fetchedMessages = await serviceContainer.messagesService.getMessages(
        chat.chatId,
        currentUserId,
        otherParticipant.userId
      );
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Implement send message API call
    setMessageText('');
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          {chatAvatar && (
            <img src={chatAvatar} alt={chatTitle} className="w-8 h-8 rounded-full object-cover" />
          )}
          <h1 className="text-lg font-semibold flex-1">{chatTitle}</h1>
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <Video size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white border-opacity-20 border-t-white rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-white bg-opacity-10 flex items-center justify-center flex-shrink-0">
                      {message.senderAvatarUrl ? (
                        <img
                          src={message.senderAvatarUrl}
                          alt={message.senderNickname || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">👤</span>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!isCurrentUser && message.senderNickname && (
                      <span className="text-xs text-gray-400 mb-1">{message.senderNickname}</span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-white bg-opacity-15 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-black border-t border-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-white hover:bg-opacity-10">
            <Camera size={20} className="text-gray-400" />
          </button>
          <input
            type="text"
            placeholder="Message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            className="flex-1 px-4 py-2 bg-white bg-opacity-10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
          />
          {messageText.trim() ? (
            <button
              onClick={sendMessage}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          ) : (
            <button className="p-2 rounded hover:bg-white hover:bg-opacity-10">
              <Mic size={20} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

