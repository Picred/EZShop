import { useState, useEffect } from 'react';
import { X, Search, Plus, Trash, RotateCcw, CheckCircle, DollarSign } from 'lucide-react';
import { Return, ReturnLine, Sale, SaleLine } from '../types/api';
import { returnsService } from '../services/returnsService';
import { salesService } from '../services/salesService';

interface ReturnDetailsModalProps {
  returnTransaction: Return;
  onClose: () => void;
  onUpdate: () => void;
}

export const ReturnDetailsModal = ({ returnTransaction, onClose, onUpdate }: ReturnDetailsModalProps) => {
  const [currentReturn, setCurrentReturn] = useState<Return>(returnTransaction);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [retData, saleData] = await Promise.all([
        returnsService.getById(returnTransaction.id!),
        salesService.getById(returnTransaction.sale_id)
      ]);
      setCurrentReturn(retData);
      setSale(saleData);
    } catch (err: any) {
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (line: SaleLine) => {
    try {
      setLoading(true);
      await returnsService.addProduct(currentReturn.id!, line.product_barcode, 1);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (line: ReturnLine) => {
    try {
      setLoading(true);
      await returnsService.deleteProduct(currentReturn.id!, line.product_barcode, 1);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReturn = async () => {
    try {
      setLoading(true);
      await returnsService.closeReturn(currentReturn.id!);
      onUpdate();
      onClose();
    } catch (err: any) {
      setError('Failed to close return');
    } finally {
      setLoading(false);
    }
  };

  const handleReimburse = async () => {
    try {
      setLoading(true);
      await returnsService.reimburseReturn(currentReturn.id!);
      onUpdate();
      onClose();
    } catch (err: any) {
        setError(err.response?.data?.message || 'Reimbursement failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRefund = () => {
    if (!currentReturn.lines) return 0;
    return currentReturn.lines.reduce((sum, line) => sum + (line.quantity * line.price_per_unit), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl">
        
        {/* Left: Original Sale Items */}
        <div className="w-1/2 p-6 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5" />
              Items from Sale #{currentReturn.sale_id}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {sale?.lines?.map((line) => (
              <div key={line.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{line.product_barcode}</p>
                  <p className="text-sm text-gray-500">
                    Purchased: {line.quantity} units @ ${line.price_per_unit.toFixed(2)}
                  </p>
                </div>
                <button 
                  className="btn btn-sm btn-circle btn-primary"
                  onClick={() => handleAddItem(line)}
                  disabled={currentReturn.status !== 'OPEN' || loading}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Return Items & Summary */}
        <div className="w-1/2 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Return Transaction #{currentReturn.id}
            </h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentReturn.lines?.map((line) => (
              <div key={line.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{line.product_barcode}</p>
                  <p className="text-sm text-gray-500">
                    {line.quantity} units x ${line.price_per_unit.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-ghost btn-xs btn-circle text-error"
                    onClick={() => handleRemoveItem(line)}
                    disabled={currentReturn.status !== 'OPEN' || loading}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <p className="font-bold text-gray-900 w-20 text-right">
                    ${(line.quantity * line.price_per_unit).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            
            {(!currentReturn.lines || currentReturn.lines.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No items added to return yet</p>
              </div>
            )}
          </div>

          {/* Footer: Summary & Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            {error && (
              <div className="alert alert-error py-2 text-sm rounded-lg mb-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Refund</span>
              <span className="text-3xl font-bold text-primary">
                ${calculateTotalRefund().toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentReturn.status === 'OPEN' && (
                <button 
                  className="btn btn-primary w-full gap-2"
                  disabled={!currentReturn.lines?.length || loading}
                  onClick={handleCloseReturn}
                >
                  <CheckCircle className="w-5 h-5" />
                  Close Return
                </button>
              )}
              {currentReturn.status === 'CLOSED' && (
                <button 
                  className="btn btn-success text-white w-full gap-2"
                  disabled={loading}
                  onClick={handleReimburse}
                >
                  <DollarSign className="w-5 h-5" />
                  Issue Refund
                </button>
              )}
              {currentReturn.status === 'REIMBURSED' && (
                <div className="col-span-2 flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl font-bold">
                  <CheckCircle className="w-5 h-5" />
                  Refund Processed Successfully
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
