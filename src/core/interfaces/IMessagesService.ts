import type { Message } from '../../types';

/**
 * Interface for messages service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IMessagesService {
  getMessages(chatId: string, userId1: string, userId2: string): Promise<Message[]>;
}

