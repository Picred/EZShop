import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, CreditCard, User } from 'lucide-react';
import { customersService } from '../services/customersService';
import { Customer } from '../types/api';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customersService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer && editingCustomer.id) {
        await customersService.update(editingCustomer.id, formData.name);
      } else {
        await customersService.create(formData.name);
      }
      loadCustomers();
      setIsModalOpen(false);
      setFormData({ name: '' });
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customersService.delete(id);
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    }
  };
  
  const handleAttachCard = async (customer: Customer) => {
      if (!customer.id) return;
      const cardId = prompt("Enter Card ID to attach (or leave empty to generate new):");
      try {
          let targetCardId = cardId;
          if (!targetCardId) {
             const newCard = await customersService.createCard();
             targetCardId = newCard.card_id;
             alert(`New card generated: ${targetCardId}`);
          }
          if (targetCardId) {
            await customersService.attachCard(customer.id, targetCardId);
            loadCustomers();
          }
      } catch (error: any) {
          const message = error.response?.data?.message || error.message || "Failed to attach card";
          console.error("Failed to attach card", error);
          alert(message);
      }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer profiles and loyalty cards</p>
        </div>
        <button 
          className="btn btn-primary gap-2"
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-12">
             <span className="loading loading-spinner loading-lg"></span>
           </div>
        ) : filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => {
                    setEditingCustomer(customer);
                    setFormData({ name: customer.name });
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  className="btn btn-ghost btn-sm btn-square text-error"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{customer.name}</h3>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
                {customer.card ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                        <span>Card: {customer.card.card_id} ({customer.card.points} pts)</span>
                    </div>
                ) : (
                    <button 
                        className="btn btn-outline btn-sm w-full gap-2"
                        onClick={() => handleAttachCard(customer)}
                    >
                        <CreditCard className="w-4 h-4" />
                        Attach Loyalty Card
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCustomer ? 'Edit Customer' : 'New Customer'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Customer Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
