import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

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
const Transport = lazy(() => import('./pages/Transport').then(module => ({ default: module.Transport })));
const Activities = lazy(() => import('./pages/Activities').then(module => ({ default: module.Activities })));
const Inclusions = lazy(() => import('./pages/Inclusions').then(module => ({ default: module.Inclusions })));
const Exclusions = lazy(() => import('./pages/Exclusions').then(module => ({ default: module.Exclusions })));
const MealPlans = lazy(() => import('./pages/MealPlans').then(module => ({ default: module.MealPlans })));
const EditProfile = lazy(() => import('./pages/admin/EditProfile').then(module => ({ default: module.EditProfile })));

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
              <Route path="settings" element={<ProtectedRoute requireAdmin={true}><Settings /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
