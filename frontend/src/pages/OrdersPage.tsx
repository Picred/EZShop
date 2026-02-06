import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye } from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { Order, OrderStatus } from '../types/api';

type TabType = 'all' | 'issued' | 'paid' | 'completed';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === 'all' ||
      order.status?.toLowerCase() === activeTab.toUpperCase();
    const matchesSearch = order.product_barcode.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status?: OrderStatus) => {
    const badges = {
      ISSUED: 'badge-ghost',
      PAID: 'badge-info',
      COMPLETED: 'badge-success',
    };
    return badges[status || 'ISSUED'];
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and manage procurement orders with your suppliers</p>
        </div>
        <button className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Create New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-white mb-6 p-1">
        <a
          className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
        </a>
        <a
          className={`tab ${activeTab === 'issued' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          Issued
        </a>
        <a
          className={`tab ${activeTab === 'paid' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('paid')}
        >
          Paid
        </a>
        <a
          className={`tab ${activeTab === 'completed' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </a>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Product, or Supplier..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="btn btn-outline gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>PRODUCT</th>
                <th>SUPPLIER</th>
                <th>QUANTITY</th>
                <th>STATUS</th>
                <th>TOTAL PRICE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.id}</td>
                    <td>{order.product_barcode}</td>
                    <td>-</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status || 'ISSUED'}
                      </span>
                    </td>
                    <td>${(order.quantity * order.price_per_unit).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-ghost btn-xs">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">ACTIVE ORDERS</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">PENDING PAYMENT</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">RECEIVED MONTHLY</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
