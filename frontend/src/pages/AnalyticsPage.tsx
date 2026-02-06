import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Activity } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardDTO } from '../types/api';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export const AnalyticsPage = () => {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const stats = await dashboardService.getStats();
      setData(stats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed performance metrics and trends</p>
        </div>
        <button className="btn btn-outline btn-sm gap-2" onClick={loadStats}>
          <Activity className="w-4 h-4" />
          Live Update
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Gross Revenue" 
          value={`$${data.total_revenue.value.toLocaleString()}`} 
          change={data.total_revenue.change} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Sales Volume" 
          value={data.total_sales.value.toLocaleString()} 
          change={data.total_sales.change} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Open Orders" 
          value={data.active_orders.value.toLocaleString()} 
          change={data.active_orders.change} 
          icon={Package} 
        />
        <StatCard 
          title="Product Catalog" 
          value={data.total_products.value.toLocaleString()} 
          change={data.total_products.change} 
          icon={Activity} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Growth Trend
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.earnings_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Monthly Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Sales Volume Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.earnings_trend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                  name="Transactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Top Performing Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-gray-500 font-semibold">PRODUCT</th>
                <th className="text-gray-500 font-semibold">SKU / BARCODE</th>
                <th className="text-gray-500 font-semibold text-center">UNITS SOLD</th>
                <th className="text-gray-500 font-semibold text-right">GROSS REVENUE</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((product) => (
                <tr key={product.barcode} className="hover:bg-gray-50 transition-colors">
                  <td>
                    <div className="font-bold text-gray-900">{product.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-ghost font-mono text-xs">{product.barcode}</span>
                  </td>
                  <td className="text-center font-medium">{product.quantity_sold}</td>
                  <td className="text-right font-bold text-primary">
                    ${product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon: Icon }: any) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );
};
