import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import DashboardApp from './dashboard/App';
import { AuthProvider } from './components/AuthProvider';
import { LoginPage } from './dashboard/pages/LoginPage';
import { RegisterPage } from './dashboard/pages/RegisterPage';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Explicit Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Dashboard routes go to DashboardApp */}
          <Route path="/dashboard/*" element={<DashboardApp />} />
          
          {/* Everything else goes to the landing page */}
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);