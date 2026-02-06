// User types
export type UserType = 'Administrator' | 'Cashier' | 'ShopManager';

export interface User {
  id: number;
  username: string;
  type: UserType;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  type: UserType;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  type?: UserType;
}

export interface TokenResponse {
  token: string;
}

// Product types
export interface ProductType {
  id?: number;
  description: string;
  barcode: string;
  price_per_unit: number;
  note?: string;
  quantity?: number;
  position?: string;
}

// Order types
export type OrderStatus = 'ISSUED' | 'PAID' | 'COMPLETED';

export interface Order {
  id?: number;
  product_barcode: string;
  quantity: number;
  price_per_unit: number;
  status?: OrderStatus;
  issue_date?: string;
}

// Customer types
export interface CustomerCard {
  card_id: string;
  points: number;
}

export interface Customer {
  id?: number;
  name: string;
  card?: CustomerCard;
}

// Sale types
export type SaleStatus = 'OPEN' | 'PENDING' | 'PAID';

export interface SaleLine {
  id?: number;
  sale_id: number;
  product_barcode: string;
  quantity: number;
  price_per_unit: number;
  discount_rate: number;
}

export interface Sale {
  id?: number;
  status: SaleStatus;
  discount_rate: number;
  created_at?: string;
  closed_at?: string | null;
  lines?: SaleLine[];
}

// Return types
export type ReturnStatus = 'OPEN' | 'CLOSED' | 'REIMBURSED';

export interface ReturnLine {
  id?: number;
  return_id: number;
  product_barcode: string;
  quantity: number;
  price_per_unit: number;
}

export interface Return {
  id?: number;
  sale_id: number;
  status: ReturnStatus;
  created_at?: string;
  closed_at?: string | null;
  lines?: ReturnLine[];
}

// Supplier types (for frontend use)
export interface Supplier {
  id?: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Error response
export interface ErrorResponse {
  code: number;
  message: string;
  name: string;
}

// Dashboard types
export interface KPIDTO {
  value: number;
  change: number;
}

export interface ChartDataPointDTO {
  label: string;
  value: number;
}

export interface ProductStatDTO {
  barcode: string;
  description: string;
  quantity_sold: number;
  revenue: number;
}

export interface DashboardDTO {
  total_revenue: KPIDTO;
  total_sales: KPIDTO;
  active_orders: KPIDTO;
  total_products: KPIDTO;
  earnings_trend: ChartDataPointDTO[];
  top_products: ProductStatDTO[];
}
