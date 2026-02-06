import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { salesService } from '../services/salesService';
import { Sale } from '../types/api';
import { SalePOS } from '../components/SalePOS.tsx'; // Import new component (ensure path is correct)

export const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await salesService.getAll();
      setSales(data.sort((a, b) => (b.id || 0) - (a.id || 0))); // Sort by ID desc
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = async () => {
    try {
        setLoading(true);
        const newSale = await salesService.create();
        setSelectedSale(newSale);
        setIsPOSOpen(true);
    } catch (error) {
        console.error('Failed to create sale:', error);
        alert('Failed to create new sale');
    } finally {
        setLoading(false);
    }
  };

  const handleViewSale = (sale: Sale) => {
      setSelectedSale(sale);
      setIsPOSOpen(true);
  };

  const handlePOSClose = () => {
      setIsPOSOpen(false);
      setSelectedSale(null);
      loadSales(); // Refresh list
  };

  const calculateTotal = (sale: Sale) => {
    if (!sale.lines) return 0;
    const subtotal = sale.lines.reduce((sum, line) => {
      return sum + (line.quantity * line.price_per_unit * (1 - line.discount_rate));
    }, 0);
    return subtotal * (1 - sale.discount_rate);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage sales transactions</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={handleNewSale} disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-xs"></span> : <Plus className="w-4 h-4" />}
          New Sale
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales..."
            className="input input-bordered w-full pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>SALE ID</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>DISCOUNT</th>
                <th>TOTAL</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && !isPOSOpen ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover">
                    <td className="font-mono">#{sale.id}</td>
                    <td>{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</td>
                    <td>
                      <span className={`badge ${
                        sale.status === 'PAID' ? 'badge-success' :
                        sale.status === 'PENDING' ? 'badge-warning' : 'badge-ghost'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td>{(sale.discount_rate * 100).toFixed(0)}%</td>
                    <td className="font-mono">${calculateTotal(sale).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleViewSale(sale)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPOSOpen && selectedSale && (
          <SalePOS 
            sale={selectedSale} 
            onClose={handlePOSClose} 
            onUpdate={loadSales}
          />
      )}
    </div>
  );
};
