import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CategoryList } from './pages/CategoryList';
import { CategoryCreate } from './pages/CategoryCreate';
import { CategoryEdit } from './pages/CategoryEdit';
import { MenuGrid } from './pages/MenuGrid';
import { ProductCreate } from './pages/ProductCreate';
import { ProductEdit } from './pages/ProductEdit';
import { OrderList } from './pages/OrderList';
import { POSPage } from './pages/POSPage';
import { QRGenerator } from './pages/QRGenerator';
import { RoutePath } from './types';
import { useAuth } from '../components/AuthProvider';
import { User } from '@supabase/supabase-js';

// --- Protected Layout Wrapper ---
const ProtectedLayout: React.FC<{ 
  user: User | null; 
  theme: 'light' | 'dark'; 
  onToggleTheme: () => void; 
}> = ({ user, theme, onToggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-theme flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display antialiased overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          theme={theme} 
          onToggleTheme={onToggleTheme} 
        />
        <Outlet />
      </div>
    </div>
  );
};

export function AdminApp() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Protected Routes Wrapper - All routes here are relative to /dashboard */}
      <Route element={<ProtectedLayout user={user} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />}>
        {/* The index route for /dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Sub-routes under /dashboard */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<CategoryCreate />} />
        <Route path="categories/:id/edit" element={<CategoryEdit />} />
        <Route path="products" element={<MenuGrid />} />
        <Route path="products/new" element={<ProductCreate />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="qr-generator" element={<QRGenerator />} />
        
        {/* Fallback within dashboard redirects to dashboard home */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
}
