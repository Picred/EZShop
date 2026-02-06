import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Check } from 'lucide-react';
import { productsService } from '../services/productsService';
import { ProductType } from '../types/api';

export const InventoryPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [editingPosition, setEditingPosition] = useState<{id: number, value: string} | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsService.delete(id);
        loadProducts();
      } catch (error: any) {
        console.error('Failed to delete product:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to delete product.';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;
    try {
      await productsService.updatePosition(editingPosition.id, editingPosition.value);
      setEditingPosition(null);
      loadProducts();
    } catch (err) {
      alert("Failed to update position");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or barcode..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>BARCODE</th>
                <th>DESCRIPTION</th>
                <th>PRICE</th>
                <th>QUANTITY</th>
                <th>POSITION</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover">
                    <td className="font-mono">{product.barcode}</td>
                    <td className="font-medium">{product.description}</td>
                    <td>${product.price_per_unit.toFixed(2)}</td>
                    <td>{product.quantity || 0}</td>
                    <td>
                      {editingPosition?.id === product.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            className="input input-xs input-bordered w-24"
                            value={editingPosition?.value || ''}
                            onChange={(e) => editingPosition && setEditingPosition({...editingPosition, value: e.target.value})}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdatePosition();
                                if (e.key === 'Escape') setEditingPosition(null);
                            }}
                          />
                          <button 
                            className="btn btn-xs btn-circle btn-success text-white"
                            onClick={handleUpdatePosition}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span>{product.position || '-'}</span>
                          <button 
                            className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle"
                            onClick={() => {
                                if (product.id) {
                                    setEditingPosition({id: product.id, value: product.position || ''});
                                }
                            }}
                          >
                            <MapPin className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                          }}
                          className="btn btn-ghost btn-xs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <ProductForm
              product={editingProduct}
              onSave={async (product) => {
                try {
                  if (editingProduct && editingProduct.id) {
                    await productsService.update(editingProduct.id, product);
                  } else {
                    await productsService.create(product);
                  }
                  await loadProducts();
                  setShowModal(false);
                  setEditingProduct(null);
                } catch (error: any) {
                  console.error('Failed to save product:', error);
                  const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to save product. Please try again.';
                  alert(`Error: ${errorMessage}`);
                }
              }}
              onCancel={() => {
                setShowModal(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductFormProps {
  product: ProductType | null;
  onSave: (product: Omit<ProductType, 'id'>) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState<Omit<ProductType, 'id'>>({
    description: product?.description || '',
    barcode: product?.barcode || '',
    price_per_unit: product?.price_per_unit || 0,
    note: product?.note || '',
    quantity: product?.quantity || 0,
    position: product?.position || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barcode is required';
    }

    if (formData.price_per_unit <= 0) {
      newErrors.price_per_unit = 'Price must be greater than 0';
    }

    if (formData.quantity !== undefined && formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Barcode */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Barcode *</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.barcode ? 'input-error' : ''}`}
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            placeholder="Enter product barcode"
          />
          {errors.barcode && <span className="text-error text-sm mt-1">{errors.barcode}</span>}
        </div>

        {/* Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description *</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.description ? 'input-error' : ''}`}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
          />
          {errors.description && <span className="text-error text-sm mt-1">{errors.description}</span>}
        </div>

        {/* Price */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Price per Unit *</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`input input-bordered ${errors.price_per_unit ? 'input-error' : ''}`}
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          {errors.price_per_unit && <span className="text-error text-sm mt-1">{errors.price_per_unit}</span>}
        </div>

        {/* Quantity */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Quantity</span>
          </label>
          <input
            type="number"
            min="0"
            className={`input input-bordered ${errors.quantity ? 'input-error' : ''}`}
            value={formData.quantity || 0}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
          {errors.quantity && <span className="text-error text-sm mt-1">{errors.quantity}</span>}
        </div>

        {/* Position */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Position</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={formData.position || ''}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="e.g., A1, Shelf 3, etc."
          />
        </div>

        {/* Note */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Note</span>
          </label>
          <textarea
            className="textarea textarea-bordered"
            value={formData.note || ''}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Additional notes (optional)"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="modal-action">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};
