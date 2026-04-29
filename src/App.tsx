import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Properties = lazy(() => import('./pages/Properties').then(module => ({ default: module.Properties })));
const Documents = lazy(() => import('./pages/Documents').then(module => ({ default: module.Documents })));
const Users = lazy(() => import('./pages/Users').then(module => ({ default: module.Users })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const SignupSuccess = lazy(() => import('./pages/SignupSuccess').then(module => ({ default: module.SignupSuccess })));
const Transport = lazy(() => import('./pages/Transport').then(module => ({ default: module.Transport })));
const Activities = lazy(() => import('./pages/Activities').then(module => ({ default: module.Activities })));
const Inclusions = lazy(() => import('./pages/Inclusions').then(module => ({ default: module.Inclusions })));
const Exclusions = lazy(() => import('./pages/Exclusions').then(module => ({ default: module.Exclusions })));
const MealPlans = lazy(() => import('./pages/MealPlans').then(module => ({ default: module.MealPlans })));
const Calendar = lazy(() => import('./pages/Calendar').then(module => ({ default: module.Calendar })));
const EditProfile = lazy(() => import('./pages/admin/EditProfile').then(module => ({ default: module.EditProfile })));
const Clients = lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const TopProperties = lazy(() => import('./pages/TopProperties').then(module => ({ default: module.TopProperties })));

// Finance Routes
const FinanceOverview = lazy(() => import('./pages/finance/Overview').then(module => ({ default: module.Overview })));
const FinanceInvoices = lazy(() => import('./pages/finance/Invoices').then(module => ({ default: module.Invoices })));
const FinancePayments = lazy(() => import('./pages/finance/Payments').then(module => ({ default: module.Payments })));
const FinanceExpenses = lazy(() => import('./pages/finance/Expenses').then(module => ({ default: module.Expenses })));
const FinanceAccounts = lazy(() => import('./pages/finance/Accounts').then(module => ({ default: module.Accounts })));
const FinanceReports = lazy(() => import('./pages/finance/Reports').then(module => ({ default: module.Reports })));
const SalesPerformance = lazy(() => import('./pages/SalesPerformance').then(module => ({ default: module.SalesPerformance })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const LeadSourcePerformance = lazy(() => import('./pages/LeadSourcePerformance').then(module => ({ default: module.LeadSourcePerformance })));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup-success" element={<SignupSuccess />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProtectedRoute requireAdmin={true}><Dashboard /></ProtectedRoute>} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="properties" element={<Properties />} />
              <Route path="invoice" element={<Documents />} />
              <Route path="confirmation-voucher" element={<Documents />} />
              <Route path="booking-voucher" element={<Documents />} />
              <Route path="quotation" element={<Documents />} />
              <Route path="users" element={<ProtectedRoute requireAdmin={true}><Users /></ProtectedRoute>} />
              <Route path="transport" element={<Transport />} />
              <Route path="activities" element={<Activities />} />
              <Route path="inclusions" element={<Inclusions />} />
              <Route path="exclusions" element={<Exclusions />} />
              <Route path="meal-plans" element={<MealPlans />} />
              <Route path="users/:id/edit" element={<ProtectedRoute requireAdmin={true}><EditProfile /></ProtectedRoute>} />
              <Route path="settings" element={<Settings />} />
              <Route path="clients" element={<Clients />} />
              <Route path="top-properties" element={<TopProperties />} />
              
              {/* Finance Routes */}
              <Route path="finance" element={<FinanceOverview />} />
              <Route path="finance/invoices" element={<FinanceInvoices />} />
              <Route path="finance/payments" element={<FinancePayments />} />
              <Route path="finance/expenses" element={<FinanceExpenses />} />
              <Route path="finance/accounts" element={<FinanceAccounts />} />
              <Route path="finance/reports" element={<FinanceReports />} />
              <Route path="sales-performance" element={<ProtectedRoute requireAdmin={true}><SalesPerformance /></ProtectedRoute>} />
              <Route path="lead-sources" element={<ProtectedRoute requireAdmin={true}><LeadSourcePerformance /></ProtectedRoute>} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
