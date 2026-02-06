import api from './api';
import { Order } from '../types/api';

export const ordersService = {
  async getAll(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders/');
    return response.data;
  },

  async getById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async create(order: Order): Promise<Order> {
    const response = await api.post<Order>('/orders/', order);
    return response.data;
  },

  async pay(id: number): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/orders/${id}/pay`);
    return response.data;
  },

  async recordArrival(id: number): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/orders/${id}/arrival`);
    return response.data;
  },
};
