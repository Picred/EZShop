import api from './api';

export const accountingService = {
  async getBalance(): Promise<number> {
    const response = await api.get<{ balance: number }>('/accounting/');
    return response.data.balance;
  },

  async setBalance(amount: number): Promise<boolean> {
    const response = await api.post<{ success: boolean }>('/accounting/set/', { amount });
    return response.data.success;
  },

  async resetBalance(): Promise<void> {
    await api.post('/accounting/reset/');
  },
};
