import { api } from './api';
import { DashboardDTO } from '../types/api';

export const dashboardService = {
  async getStats(): Promise<DashboardDTO> {
    const response = await api.get<DashboardDTO>('/dashboard/stats');
    return response.data;
  },
};
