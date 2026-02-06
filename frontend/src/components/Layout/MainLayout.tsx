import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Truck,
  RotateCcw,
  LogOut,
  ShoppingBag,
  User,
  DollarSign,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/orders', icon: Truck, label: 'Orders' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    { path: '/returns', icon: RotateCcw, label: 'Returns' },
    { path: '/accounting', icon: DollarSign, label: 'Accounting' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/users', icon: User, label: 'Users' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EZShop</h1>
              <p className="text-xs text-gray-500">Shop Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.type}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
