import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { salesService } from '../services/salesService';
import { ordersService } from '../services/ordersService';
import { productsService } from '../services/productsService';
import { accountingService } from '../services/accountingService';

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalRevenue: { value: 0, change: 0 },
    totalSales: { value: 0, change: 0 },
    activeOrders: { value: 0, change: 0 },
    totalProducts: { value: 0, change: 0 },
  });


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sales, orders, products, balance] = await Promise.all([
        salesService.getAll(),
        ordersService.getAll(),
        productsService.getAll(),
        accountingService.getBalance(),
      ]);

      setKpis({
        totalRevenue: { value: balance, change: 0 },
        totalSales: { value: sales.length, change: 0 },
        activeOrders: { value: orders.filter(o => o.status === 'ISSUED' || o.status === 'PAID').length, change: 0 },
        totalProducts: { value: products.length, change: 0 },
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
        <button className="btn btn-primary gap-2">
          <TrendingUp className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={`$${kpis.totalRevenue.value.toFixed(2)}`}
          change={kpis.totalRevenue.change}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <KPICard
          title="Total Sales"
          value={kpis.totalSales.value.toString()}
          change={kpis.totalSales.change}
          icon={ShoppingCart}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <KPICard
          title="Active Orders"
          value={kpis.activeOrders.value.toString()}
          change={kpis.activeOrders.change}
          icon={Package}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <KPICard
          title="Total Products"
          value={kpis.totalProducts.value.toString()}
          change={kpis.totalProducts.change}
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
              <p className="text-sm text-gray-600">Revenue performance over the last 6 months</p>
            </div>
            <select className="select select-bordered select-sm">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Chart data coming soon...</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            <p className="text-sm text-gray-600">By sales volume</p>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Product data coming soon...</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Analytics Reports</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View History
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>REPORT NAME</th>
                <th>GENERATED DATE</th>
                <th>DATA PERIOD</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Q3 Sales Performance.pdf</td>
                <td>Oct 12, 2023</td>
                <td>Jul - Sep 2023</td>
                <td><span className="badge badge-success">COMPLETED</span></td>
                <td><button className="btn btn-ghost btn-xs">Download</button></td>
              </tr>
              <tr>
                <td>Inventory Forecast_Oct.csv</td>
                <td>Oct 08, 2023</td>
                <td>Oct - Dec 2023</td>
                <td><span className="badge badge-success">COMPLETED</span></td>
                <td><button className="btn btn-ghost btn-xs">Download</button></td>
              </tr>
              <tr>
                <td>Monthly Audit Log_Sep.pdf</td>
                <td>Oct 01, 2023</td>
                <td>Sep 01 - Sep 30</td>
                <td><span className="badge badge-warning">ARCHIVED</span></td>
                <td><button className="btn btn-ghost btn-xs">Download</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
