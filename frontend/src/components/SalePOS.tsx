import { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, Trash, CreditCard, ShoppingCart } from 'lucide-react';
import { Sale, ProductType } from '../types/api';
import { salesService } from '../services/salesService';
import { productsService } from '../services/productsService';

interface SalePOSProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: () => void;
}

export const SalePOS = ({ sale: initialSale, onClose, onUpdate }: SalePOSProps) => {
  const [currentSale, setCurrentSale] = useState<Sale>(initialSale);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productDetails, setProductDetails] = useState<Record<string, ProductType>>({});

  useEffect(() => {
    loadSale();
  }, [initialSale.id]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!currentSale.lines) return;
      
      const missingBarcodes = currentSale.lines
        .map(l => l.product_barcode)
        .filter(b => !productDetails[b]);
      
      const uniqueBarcodes = [...new Set(missingBarcodes)];

      if (uniqueBarcodes.length === 0) return;

      const newDetails = { ...productDetails };
      await Promise.all(uniqueBarcodes.map(async (barcode) => {
        try {
            const product = await productsService.getByBarcode(barcode);
            newDetails[barcode] = product;
        } catch (e) {
            console.warn(`Failed to fetch product details for ${barcode}`);
        }
      }));
      setProductDetails(newDetails);
    };

    fetchProductDetails();
  }, [currentSale.lines]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadSale = async () => {
    try {
      const data = await salesService.getById(initialSale.id!);
      setCurrentSale(data);
    } catch (err) {
      console.error('Failed to load sale:', err);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      if (/^\d{8,}$/.test(searchTerm)) {
        try {
            const product = await productsService.getByBarcode(searchTerm);
            setSearchResults([product]);
        } catch (e) {
            const results = await productsService.search(searchTerm);
            setSearchResults(results);
        }
      } else {
        const results = await productsService.search(searchTerm);
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = async (product: ProductType) => {
    try {
      setLoading(true);
      await salesService.addProduct(currentSale.id!, product.barcode, 1);
      await loadSale();
      setSearchTerm('');
      setSearchResults([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (barcode: string, delta: number) => {
    try {
      setLoading(true);
      if (delta > 0) {
        await salesService.addProduct(currentSale.id!, barcode, delta);
      } else {
        await salesService.deleteProduct(currentSale.id!, barcode, Math.abs(delta));
      }
      await loadSale();
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update quantity');
        setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!paymentAmount) return;
    try {
      setLoading(true);
      if (currentSale.status === 'OPEN') {
          await salesService.closeSale(currentSale.id!);
      }
      
      await salesService.paySale(currentSale.id!, parseFloat(paymentAmount));
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
      setTimeout(() => setError(''), 3000);
      await loadSale();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!currentSale.lines) return 0;
    const subtotal = currentSale.lines.reduce((sum, line) => {
      return sum + (line.quantity * line.price_per_unit * (1 - line.discount_rate));
    }, 0);
    return subtotal * (1 - currentSale.discount_rate);
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden shadow-2xl">
        
        {/* Left Panel: Search & Products */}
        <div className="w-1/2 p-6 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5" />
              Product Search
            </h2>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Scan barcode or search by name..."
              className="input input-bordered w-full pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isSearching && (
              <span className="loading loading-spinner loading-sm absolute right-3 top-1/2 -translate-y-1/2 text-primary"></span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {searchResults.map((product) => (
              <div 
                key={product.id} 
                className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-primary"
                onClick={() => handleAddItem(product)}
              >
                <div className="card-body p-4 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{product.description}</h3>
                    <div className="text-sm text-gray-500 gap-2 flex">
                      <span className="font-mono bg-gray-100 px-1 rounded">{product.barcode}</span>
                      <span>• stock: {product.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${product.price_per_unit.toFixed(2)}</p>
                    <button className="btn btn-sm btn-circle btn-ghost text-primary">
                        <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
                <div className="text-center text-gray-500 mt-10">
                    No products found
                </div>
            )}
          </div>
        </div>

        {/* Right Panel: Cart / Sale Details */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Sale #{currentSale.id}
                </h2>
                <span className={`badge mt-1 ${
                    currentSale.status === 'PAID' ? 'badge-success' : 
                    currentSale.status === 'PENDING' ? 'badge-warning' : 'badge-ghost'
                }`}>
                    {currentSale.status}
                </span>
            </div>
            <button className="btn btn-ghost btn-circle" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {error && (
                 <div className="alert alert-error shadow-lg animate-pulse mb-4">
                     <div><X className="w-4 h-4"/> <span>{error}</span></div>
                 </div>
             )}
             
             {(!currentSale.lines || currentSale.lines.length === 0) ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                     <p>Cart is empty</p>
                     <p className="text-sm">Scan items to start</p>
                 </div>
             ) : (
                 currentSale.lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 line-clamp-1">{productDetails[line.product_barcode]?.description || line.product_barcode}</p>
                            <p className="text-sm text-gray-500">${line.price_per_unit.toFixed(2)} x {line.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                                <button 
                                    className="btn btn-xs btn-ghost btn-square"
                                    onClick={() => updateQuantity(line.product_barcode, -1)}
                                    disabled={loading}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-bold text-sm">{line.quantity}</span>
                                <button 
                                    className="btn btn-xs btn-ghost btn-square"
                                    onClick={() => updateQuantity(line.product_barcode, 1)}
                                    disabled={loading}
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="text-right min-w-[3rem]">
                                <p className="font-bold">${(line.price_per_unit * line.quantity).toFixed(2)}</p>
                            </div>
                             <button 
                                className="btn btn-xs btn-ghost btn-square text-error"
                                onClick={() => updateQuantity(line.product_barcode, -line.quantity)}
                                disabled={loading}
                                title="Remove Item"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                 ))
             )}
          </div>

          {/* Footer / Total */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
             <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-gray-600">
                     <span>Subtotal</span>
                     <span>${total.toFixed(2)}</span>
                 </div>
                 {currentSale.discount_rate > 0 && (
                     <div className="flex justify-between text-success">
                         <span>Discount ({(currentSale.discount_rate * 100).toFixed(0)}%)</span>
                         <span>-${(total * currentSale.discount_rate).toFixed(2)}</span>
                     </div>
                 )}
                 <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                     <span>Total</span>
                     <span>${total.toFixed(2)}</span>
                 </div>
             </div>

             {showPayment ? (
                 <div className="space-y-4">
                     <div className="form-control">
                         <label className="label cursor-pointer justify-start gap-4">
                             <span className="label-text font-bold">Cash Received</span> 
                         </label>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                             <input 
                                type="number" 
                                className="input input-bordered w-full pl-8 text-lg font-bold" 
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                autoFocus
                             />
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <button className="btn btn-ghost" onClick={() => setShowPayment(false)}>Cancel</button>
                         <button 
                            className="btn btn-success text-white" 
                            disabled={!paymentAmount || parseFloat(paymentAmount) < total || loading}
                            onClick={handlePay}
                         >
                            {loading ? <span className="loading loading-spinner"></span> : 'Complete Payment'}
                         </button>
                     </div>
                 </div>
             ) : (
                <button 
                    className="btn btn-primary w-full h-14 text-lg gap-2"
                    disabled={!currentSale.lines || currentSale.lines.length === 0 || loading || currentSale.status === 'PAID'}
                    onClick={() => setShowPayment(true)}
                >
                    <CreditCard className="w-5 h-5" />
                    Process Payment
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
