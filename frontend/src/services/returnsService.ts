import api from './api';
import { Return } from '../types/api';

export const returnsService = {
  async getAll(): Promise<Return[]> {
    const response = await api.get<Return[]>('/returns/');
    return response.data;
  },

  async getById(id: number): Promise<Return> {
    const response = await api.get<Return>(`/returns/${id}`);
    return response.data;
  },

  async create(saleId: number): Promise<Return> {
    const response = await api.post<Return>('/returns/', null, {
        params: { sale_id: saleId }
    });
    return response.data;
  },

  async addProduct(returnId: number, productBarcode: string, quantity: number): Promise<void> {
    await api.post(`/returns/${returnId}/items`, null, {
      params: { barcode: productBarcode, amount: quantity }
    });
  },

  async deleteProduct(returnId: number, productBarcode: string, quantity: number): Promise<void> {
    await api.delete(`/returns/${returnId}/items`, {
      params: { barcode: productBarcode, amount: quantity }
    });
  },

  async closeReturn(returnId: number): Promise<void> {
    await api.patch(`/returns/${returnId}/close`);
  },

  async reimburseReturn(returnId: number): Promise<void> {
    await api.patch(`/returns/${returnId}/reimburse`);
  }
};
