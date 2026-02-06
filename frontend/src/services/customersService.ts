import { api } from './api';
import { Customer } from '../types/api';

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/customers/');
    return response.data;
  },

  async create(name: string): Promise<Customer> {
    const response = await api.post<Customer>('/customers/', { name });
    return response.data;
  },

  async update(id: number, name: string): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, { name });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async createCard(): Promise<{ card_id: string }> {
      const response = await api.post<{ card_id: string }>('/customers/cards');
      return response.data;
  },

  async attachCard(customerId: number, cardId: string): Promise<void> {
      await api.patch(`/customers/${customerId}/attach-card/${cardId}`);
  }
};
