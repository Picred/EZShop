import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardDTO } from '../types/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await dashboardService.getStats();
      setData(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <TrendingDown className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
      return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">LIVE DATA</span>
          </div>
        </div>
        <button className="btn btn-primary gap-2" onClick={loadDashboardData}>
          <TrendingUp className="w-4 h-4" />
          Refresh Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={`$${data.total_revenue.value.toFixed(2)}`}
          change={data.total_revenue.change}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <KPICard
          title="Total Sales"
          value={data.total_sales.value.toString()}
          change={data.total_sales.change}
          icon={ShoppingCart}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <KPICard
          title="Active Orders"
          value={data.active_orders.value.toString()}
          change={data.active_orders.change}
          icon={Package}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <KPICard
          title="Total Products"
          value={data.total_products.value.toString()}
          change={data.total_products.change}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly Earnings Trend</h2>
              <p className="text-sm text-gray-600">Revenue performance over time</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.earnings_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            <p className="text-sm text-gray-600">By sales volume</p>
          </div>
          <div className="space-y-4">
              {data.top_products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sales data yet.</p>
              ) : (
                  data.top_products.map((product) => (
                    <div key={product.barcode} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                                {product.barcode.slice(-2)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 truncate w-32" title={product.description}>{product.description}</p>
                                <p className="text-xs text-gray-500">{product.quantity_sold} sold</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900">${product.revenue.toFixed(2)}</p>
                        </div>
                    </div>
                  ))
              )}
          </div>
        </div>
      </div>

      {/* Recent Reports (Backend part not implemented yet, using placeholder or could remove) */}
       {/* Keeping it as static for now as requested by user "dashboard must show real data" - I will hide it or put a note? 
           User request "tutti i dati" (all data) implies real data. 
           Since I don't have real reports, maybe I should remove this section to avoid showing fake data.
           I will remove it to be safe and strictly follow "real data". 
       */}
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const KPICard = ({ title, value, change, icon: Icon, iconColor, iconBg }: KPICardProps) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};
