import api from './api';
import type { User } from './auth';

export const profileService = {
  async getProfile(): Promise<User> {
    const res = await api.get<User>('/profile');
    return res.data;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await api.put<User>('/profile', updates);
    return res.data;
  }
};
