import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, CheckCircle, DollarSign } from 'lucide-react';
import { ordersService } from '../services/ordersService';
import { productsService } from '../services/productsService';
import { Order, OrderStatus, ProductType } from '../types/api';

type TabType = 'all' | 'issued' | 'paid' | 'completed';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_barcode: '',
    quantity: 1,
    price_per_unit: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        ordersService.getAll(),
        productsService.getAll()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ordersService.create({
        product_barcode: formData.product_barcode,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit)
      } as Order);
      
      setIsModalOpen(false);
      setFormData({ product_barcode: '', quantity: 1, price_per_unit: 0 });
      loadData();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    }
  };

  const handlePayOrder = async (id: number | undefined) => {
      if (!id) return;
      try {
          await ordersService.pay(id);
          loadData();
      } catch (error: any) {
          const message = error.response?.data?.message || error.message || "Failed to pay order";
          console.error("Failed to pay order", error);
          alert(message);
      }
  }

  const handleRecordArrival = async (id: number | undefined) => {
      if (!id) return;
      try {
          await ordersService.recordArrival(id);
          loadData();
      } catch (error: any) {
          const message = error.response?.data?.message || error.message || "Failed to record arrival";
          console.error("Failed to record arrival", error);
          alert(message);
      }
  }

  const filteredOrders = orders.filter((order) => {
    // 1. Tab Filter
    const matchesTab =
      activeTab === 'all' ||
      order.status?.toLowerCase() === activeTab.toLowerCase();
    
    // 2. Search Filter (ID, Barcode)
    const normalizedSearch = searchTerm.toLowerCase();
    const orderIdMatch = order.id?.toString() === normalizedSearch || `#${order.id}` === normalizedSearch;
    const barcodeMatch = order.product_barcode.includes(searchTerm);
    const matchesSearch = searchTerm === '' || orderIdMatch || barcodeMatch;

    // 3. Status Extra Filter
    const matchesStatusFilter = 
      statusFilter === 'ALL' || 
      order.status === statusFilter;

    return matchesTab && matchesSearch && matchesStatusFilter;
  });

  const handleExport = () => {
    if (filteredOrders.length === 0) return;
    
    const headers = ['Order ID', 'Product', 'Quantity', 'Status', 'Total Price', 'Issue Date'];
    const rows = filteredOrders.map(o => [
        o.id,
        o.product_barcode,
        o.quantity,
        o.status,
        (o.quantity * o.price_per_unit).toFixed(2),
        o.issue_date
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status?: OrderStatus) => {
    const badges = {
      ISSUED: 'badge-ghost',
      PAID: 'badge-info',
      COMPLETED: 'badge-success',
    };
    return badges[status || 'ISSUED'];
  };

  const handleProductChange = (barcode: string) => {
      const product = products.find(p => p.barcode === barcode);
      setFormData({
          ...formData,
          product_barcode: barcode,
          price_per_unit: product ? product.price_per_unit : 0
      });
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and manage procurement orders with your suppliers</p>
        </div>
        <button 
            className="btn btn-primary gap-2"
            onClick={() => setIsModalOpen(true)}
        >
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
        <div className="dropdown">
            <button tabIndex={0} className="btn btn-outline gap-2">
                <Filter className="w-4 h-4" />
                {statusFilter === 'ALL' ? 'Filter' : statusFilter}
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li onClick={() => setStatusFilter('ALL')}><a>All Statuses</a></li>
                <li onClick={() => setStatusFilter('ISSUED')}><a>ISSUED</a></li>
                <li onClick={() => setStatusFilter('PAID')}><a>PAID</a></li>
                <li onClick={() => setStatusFilter('COMPLETED')}><a>COMPLETED</a></li>
            </ul>
        </div>
        <button 
            className="btn btn-outline gap-2"
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
        >
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
                <th>QUANTITY</th>
                <th>STATUS</th>
                <th>TOTAL PRICE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.id}</td>
                    <td>{order.product_barcode}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status || 'ISSUED'}
                      </span>
                    </td>
                    <td>${(order.quantity * order.price_per_unit).toFixed(2)}</td>
                    <td className="flex gap-2">
                        {order.status === 'ISSUED' && (
                             <button 
                                className="btn btn-xs btn-info" 
                                onClick={() => handlePayOrder(order.id)}
                                title="Mark as Paid"
                             >
                                <DollarSign className="w-3 h-3" /> Pay
                             </button>
                        )}
                        {order.status === 'PAID' && (
                            <button 
                                className="btn btn-xs btn-success" 
                                onClick={() => handleRecordArrival(order.id)}
                                title="Record Arrival"
                            >
                                <CheckCircle className="w-3 h-3" /> Receive
                            </button>
                        )}
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
              <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ISSUED').length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ISSUED').length}
              </p>
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
              <p className="text-sm text-gray-600">COMPLETED</p>
              <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

       {/* Create Order Modal */}
       {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Order</h3>
            <form onSubmit={handleCreateOrder}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Product</span>
                </label>
                <select 
                    className="select select-bordered w-full"
                    value={formData.product_barcode}
                    onChange={(e) => handleProductChange(e.target.value)}
                    required
                >
                    <option value="">Select a product</option>
                    {products.map(p => (
                        <option key={p.id} value={p.barcode}>{p.description} ({p.barcode})</option>
                    ))}
                </select>
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Price per Unit</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
