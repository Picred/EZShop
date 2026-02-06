import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { SalesPage } from './pages/SalesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { AccountingPage } from './pages/AccountingPage';
import { CustomersPage } from './pages/CustomersPage';
import { UsersPage } from './pages/UsersPage';

function App() {
  // Auth is now initialized when the store is created, no need for useEffect

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="accounting" element={<AccountingPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
