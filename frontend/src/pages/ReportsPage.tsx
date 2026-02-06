import { useState, useEffect } from 'react';
import { Download, Search, FileText, ShoppingCart, RotateCcw } from 'lucide-react';
import { salesService } from '../services/salesService';
import { returnsService } from '../services/returnsService';
import { Sale, Return } from '../types/api';

export const ReportsPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'returns'>('sales');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, returnsData] = await Promise.all([
        salesService.getAll(),
        returnsService.getAll()
      ]);
      setSales(salesData.sort((a, b) => (b.id || 0) - (a.id || 0)));
      setReturns(returnsData.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (sale: Sale) => {
    if (!sale.lines) return 0;
    const subtotal = sale.lines.reduce((sum, line) => {
      return sum + (line.quantity * line.price_per_unit * (1 - line.discount_rate));
    }, 0);
    return subtotal * (1 - sale.discount_rate);
  };

  const calculateReturnTotal = (ret: Return) => {
    if (!ret.lines) return 0;
    return ret.lines.reduce((sum, line) => sum + (line.quantity * line.price_per_unit), 0);
  };

  const exportToCSV = (type: 'sales' | 'returns') => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (type === 'sales') {
      headers = ['ID', 'Date', 'Status', 'Discount', 'Total'];
      rows = sales.map(s => [
        s.id,
        s.created_at,
        s.status,
        `${(s.discount_rate * 100).toFixed(0)}%`,
        calculateTotal(s).toFixed(2)
      ]);
      filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['ID', 'Sale ID', 'Date', 'Status', 'Total Refund'];
      rows = returns.map(r => [
        r.id,
        r.sale_id,
        r.created_at,
        r.status,
        calculateReturnTotal(r).toFixed(2)
      ]);
      filename = `returns_report_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSales = sales.filter(s => 
    s.id?.toString().includes(searchTerm) || 
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReturns = returns.filter(r => 
    r.id?.toString().includes(searchTerm) || 
    r.sale_id.toString().includes(searchTerm) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Detailed history and exportable data</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="btn btn-outline btn-sm gap-2" 
            onClick={() => exportToCSV(activeTab)}
            disabled={loading || (activeTab === 'sales' ? !sales.length : !returns.length)}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm gap-2" onClick={loadData} disabled={loading}>
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          className={`pb-4 px-4 font-semibold transition-colors relative ${
            activeTab === 'sales' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sales')}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Sales History
          </div>
        </button>
        <button 
          className={`pb-4 px-4 font-semibold transition-colors relative ${
            activeTab === 'returns' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('returns')}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Returns History
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="input input-bordered w-full max-w-md pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            {activeTab === 'sales' ? (
              <>
                <thead>
                  <tr className="bg-gray-50 uppercase text-xs tracking-wider">
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Discount</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12"><span className="loading loading-spinner"></span></td></tr>
                  ) : filteredSales.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No sales transactions found</td></tr>
                  ) : filteredSales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="font-mono text-xs text-gray-500">#{s.id}</td>
                      <td className="text-sm font-medium">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${
                          s.status === 'PAID' ? 'badge-success' : 'badge-ghost'
                        }`}>{s.status}</span>
                      </td>
                      <td className="text-sm">{(s.discount_rate * 100).toFixed(0)}%</td>
                      <td className="text-right font-bold">${calculateTotal(s).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr className="bg-gray-50 uppercase text-xs tracking-wider">
                    <th>ID</th>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Total Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12"><span className="loading loading-spinner"></span></td></tr>
                  ) : filteredReturns.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No return transactions found</td></tr>
                  ) : filteredReturns.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="font-mono text-xs text-gray-500">#{r.id}</td>
                      <td className="font-mono text-xs text-gray-500">#{r.sale_id}</td>
                      <td className="text-sm font-medium">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                      <td>
                        <span className={`badge badge-sm font-bold ${
                          r.status === 'REIMBURSED' ? 'badge-success' : 
                          r.status === 'CLOSED' ? 'badge-info' : 'badge-ghost'
                        }`}>{r.status}</span>
                      </td>
                      <td className="text-right font-bold">${calculateReturnTotal(r).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
