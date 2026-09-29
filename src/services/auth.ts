import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password || 'default_password');

    const res = await api.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    return res.data;
  },

  async register(data: { name: string; email: string; password?: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password || 'default_password'
    });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.name);
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const res = await api.get<User>('/profile');
      return res.data;
    } catch (err) {
      localStorage.removeItem('token');
      return null;
    }
  }
};
