import axios from 'axios';
import type { Message } from '../types';
import type { IMessagesService } from '../core/interfaces/IMessagesService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Concrete implementation of IMessagesService
 * Follows Dependency Inversion Principle (DIP)
 */
export class MessagesService implements IMessagesService {
  async getMessages(chatId: string, userId1: string, userId2: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/api/v1/messages/chat/${chatId}`, {
      params: { userId1, userId2 },
    });
    return response.data.filter((msg) => !msg.isDeleted);
  }
}

