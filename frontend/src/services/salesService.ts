import api from './api';
import { Sale } from '../types/api';

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const response = await api.get<Sale[]>('/sales/');
    return response.data;
  },

  async getById(id: number): Promise<Sale> {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  async create(): Promise<Sale> {
    const response = await api.post<Sale>('/sales/');
    return response.data;
  },

  async addProduct(saleId: number, productBarcode: string, quantity: number): Promise<void> {
    await api.post(`/sales/${saleId}/items`, null, {
      params: { barcode: productBarcode, amount: quantity }
    });
  },

  async deleteProduct(saleId: number, productBarcode: string, quantity: number): Promise<void> {
    await api.delete(`/sales/${saleId}/items`, {
      params: { barcode: productBarcode, amount: quantity }
    });
  },

  async applyDiscountToSale(saleId: number, discountRate: number): Promise<void> {
    await api.patch(`/sales/${saleId}/discount`, null, { 
      params: { discount_rate: discountRate } 
    });
  },

  async applyDiscountToProduct(
    saleId: number,
    productBarcode: string,
    discountRate: number
  ): Promise<void> {
    await api.patch(`/sales/${saleId}/items/${productBarcode}/discount`, null, {
      params: { discount_rate: discountRate }
    });
  },

  async closeSale(saleId: number): Promise<void> {
    await api.patch(`/sales/${saleId}/close`);
  },

  async paySale(saleId: number, amount: number): Promise<void> {
    await api.patch(`/sales/${saleId}/pay`, null, {
      params: { cash_amount: amount }
    });
  },
};
