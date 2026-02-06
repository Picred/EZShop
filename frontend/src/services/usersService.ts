import { api } from './api';
import { User, UserCreateRequest, UserUpdateRequest } from '../types/api';

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },

  async create(user: UserCreateRequest): Promise<User> {
    const response = await api.post<User>('/users/', user);
    return response.data;
  },

  async update(id: number, user: UserUpdateRequest): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
