import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, DollarSign, Eye } from 'lucide-react';
import { returnsService } from '../services/returnsService';
import { Return } from '../types/api';
import { ReturnDetailsModal } from '../components/ReturnDetailsModal';

export const ReturnsPage = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const data = await returnsService.getAll();
      setReturns(data);
    } catch (error) {
      console.error('Failed to load returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReturn = async () => {
      const saleIdStr = prompt("Enter Sale ID to return items from:");
      if (!saleIdStr) return;
      const saleId = parseInt(saleIdStr);
      if (isNaN(saleId)) {
          alert("Invalid Sale ID");
          return;
      }

      try {
          const newReturn = await returnsService.create(saleId);
          await loadReturns();
          setSelectedReturn(newReturn);
      } catch (error: any) {
          console.error("Failed to create return", error);
          alert(error.response?.data?.message || "Failed to create return");
      }
  };

  const handleCloseQuick = async (id: number) => {
    try {
        await returnsService.closeReturn(id);
        loadReturns();
    } catch (err) {
        alert("Failed to close return");
    }
  };

  const handleReimburseQuick = async (id: number) => {
    try {
        await returnsService.reimburseReturn(id);
        loadReturns();
    } catch (err: any) {
        alert(err.response?.data?.message || "Reimbursement failed");
    }
  };


  const filteredReturns = returns.filter((r) => 
    r.id?.toString().includes(searchTerm) || 
    r.sale_id.toString().includes(searchTerm)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-gray-600 mt-1">Process and track product returns</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={handleCreateReturn}>
          <Plus className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Return ID or Sale ID..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>RETURN ID</th>
                <th>SALE ID</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover">
                    <td className="font-mono">#{ret.id}</td>
                    <td className="font-mono">#{ret.sale_id}</td>
                    <td>{ret.created_at ? new Date(ret.created_at).toLocaleString() : '-'}</td>
                    <td>
                      <span className={`badge ${
                        ret.status === 'CLOSED' ? 'badge-info' : 
                        ret.status === 'REIMBURSED' ? 'badge-success' : 'badge-ghost'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => setSelectedReturn(ret)}
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        {ret.status === 'OPEN' && (
                            <button 
                                className="btn btn-ghost btn-xs btn-circle text-primary"
                                onClick={() => handleCloseQuick(ret.id!)}
                                title="Close Return"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                        {ret.status === 'CLOSED' && (
                            <button 
                                className="btn btn-ghost btn-xs btn-circle text-success"
                                onClick={() => handleReimburseQuick(ret.id!)}
                                title="Reimburse"
                            >
                                <DollarSign className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReturn && (
        <ReturnDetailsModal 
          returnTransaction={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onUpdate={loadReturns}
        />
      )}
    </div>
  );
};
