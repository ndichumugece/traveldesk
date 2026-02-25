import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { Documents } from './pages/Documents';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Transport } from './pages/Transport';
import { Activities } from './pages/Activities';
import { Summertides } from './pages/Summertides';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="invoice" element={<Documents />} />
            <Route path="confirmation-voucher" element={<Documents />} />
            <Route path="booking-voucher" element={<Documents />} />
            <Route path="quotation" element={<Documents />} />
            <Route path="users" element={<Users />} />
            <Route path="transport" element={<Transport />} />
            <Route path="activities" element={<Activities />} />
            <Route path="summertides" element={<Summertides />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
