import api from './api';
import { ProductType } from '../types/api';

export const productsService = {
  async getAll(): Promise<ProductType[]> {
    const response = await api.get<ProductType[]>('/products/');
    return response.data;
  },

  async getById(id: number): Promise<ProductType> {
    const response = await api.get<ProductType>(`/products/${id}`);
    return response.data;
  },

  async create(product: Omit<ProductType, 'id'>): Promise<ProductType> {
    const response = await api.post<ProductType>('/products/', product);
    return response.data;
  },

  async update(id: number, product: Partial<ProductType>): Promise<ProductType> {
    const response = await api.put<ProductType>(`/products/${id}`, product);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async search(query: string): Promise<ProductType[]> {
    const response = await api.get<ProductType[]>('/products/search', {
      params: { query }
    });
    return response.data;
  },

  async getByBarcode(barcode: string): Promise<ProductType> {
    const response = await api.get<ProductType>(`/products/barcode/${barcode}`);
    return response.data;
  },

  async updatePosition(id: number, position: string): Promise<void> {
    await api.patch(`/products/${id}/position`, null, {
      params: { position }
    });
  },
};
