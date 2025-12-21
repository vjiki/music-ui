import type { ChatListItem } from '../../types';

/**
 * Interface for chats service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IChatsService {
  getChats(userId: string): Promise<ChatListItem[]>;
}

