import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react';
import { usersService } from '../services/usersService';
import { User } from '../types/api';

export const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ 
        username: '', 
        password: '', 
        type: 'Cashier' 
    });
    
    // Check if current user is admin? 
    // The route backend is protected, so getAll will fail if not admin.
    // But we should probably hide this page from non-admins in Layout.

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            // Optionally redirect or show error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                 // For update, password might be optional or handled differently. 
                 // Backend DTO for update might differ. Assuming simple update here.
                await usersService.update(editingUser.id, {
                    username: formData.username,
                    type: formData.type as any,
                    password: formData.password || undefined
                });
            } else {
                await usersService.create({
                    username: formData.username,
                    password: formData.password,
                    type: formData.type as any
                });
            }
            loadUsers();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('Failed to save user');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await usersService.delete(id);
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const resetForm = () => {
        setFormData({ username: '', password: '', type: 'Cashier' });
        setEditingUser(null);
    }

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage system access and roles</p>
                </div>
                <button 
                    className="btn btn-primary gap-2"
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4" />
                    New User
                </button>
            </div>

             <div className="mb-6">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users..."
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
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                user.type === 'Administrator' ? 'bg-purple-100 text-purple-600' : 
                                user.type === 'ShopManager' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="btn btn-ghost btn-sm btn-square"
                                    onClick={() => {
                                        setEditingUser(user);
                                        setFormData({ username: user.username, password: '', type: user.type });
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                </button>
                                <button 
                                    className="btn btn-ghost btn-sm btn-square text-error"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.username}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Shield className="w-3 h-3" />
                            {user.type}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal modal-open">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">
                    {editingUser ? 'Edit User' : 'New User'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                    <div className="form-control w-full mb-4">
                        <label className="label">
                        <span className="label-text">Username</span>
                        </label>
                        <input
                        type="text"
                        placeholder="Enter username"
                        className="input input-bordered w-full"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        />
                    </div>
                    <div className="form-control w-full mb-4">
                        <label className="label">
                        <span className="label-text">Password {editingUser && '(Leave blank to keep current)'}</span>
                        </label>
                        <input
                        type="password"
                        placeholder="Enter password"
                        className="input input-bordered w-full"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                        />
                    </div>
                    <div className="form-control w-full mb-4">
                        <label className="label">
                        <span className="label-text">Role</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Cashier">Cashier</option>
                            <option value="ShopManager">ShopManager</option>
                            <option value="Administrator">Administrator</option>
                        </select>
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
