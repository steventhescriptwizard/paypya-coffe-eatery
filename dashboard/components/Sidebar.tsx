import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { RoutePath } from '../types';
import { User } from '@supabase/supabase-js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === RoutePath.CATEGORIES) {
      return location.pathname.startsWith('/categories');
    }
    return location.pathname === path;
  };

  const navItemClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
      isActive(path)
        ? 'bg-primary/10 text-primary dark:text-blue-400 font-bold'
        : 'text-text-sub-light dark:text-text-sub-dark hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
    }`;

  const iconClass = (path: string) =>
    `material-symbols-outlined text-2xl transition-colors ${
      isActive(path) ? 'fill-1' : 'group-hover:text-primary'
    }`;

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex-shrink-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-3 items-center">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-lg size-10 shadow-sm"
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDw6Nbm04dEc5u32nWL3PFYexvLOFUX-UOVtJtd0PSc3mIMrAK761bDOJiyqYMEaiHShwI5nSiznc7eOUz09hIOeXS8zwUVa31m4bdKvxmv2irYSPPrkHmwVgNHBFPHtbbYf7tXn-TOeHRXEN7nWGa1Z8g9JCWW9q4_KHS0p07_semZqsmOGtWECIwgosik9aEI-ekwsomRPHW_7McEcuyexeZ7oLoMvRqkuOOwRKnHKAFpZvjxp38awJL2_WC5m80SyHLrRfbCrwsM")',
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-text-main-light dark:text-white text-lg font-bold leading-tight">
                  PAYPYA Cafe
                </h1>
                <p className="text-text-sub-light dark:text-text-sub-dark text-xs font-normal">
                  Management System
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-text-sub-light hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link to={RoutePath.DASHBOARD} onClick={handleNavClick} className={navItemClass(RoutePath.DASHBOARD)}>
              <span className={iconClass(RoutePath.DASHBOARD)}>dashboard</span>
              <p className="text-sm">Dashboard</p>
            </Link>
            <Link to={RoutePath.CATEGORIES} onClick={handleNavClick} className={navItemClass(RoutePath.CATEGORIES)}>
              <span className={iconClass(RoutePath.CATEGORIES)}>category</span>
              <p className="text-sm">Menu Categories</p>
            </Link>
            <Link to={RoutePath.PRODUCTS} onClick={handleNavClick} className={navItemClass(RoutePath.PRODUCTS)}>
              <span className={iconClass(RoutePath.PRODUCTS)}>inventory_2</span>
              <p className="text-sm">Products</p>
            </Link>
            <Link to={RoutePath.ORDERS} onClick={handleNavClick} className={navItemClass(RoutePath.ORDERS)}>
              <span className={iconClass(RoutePath.ORDERS)}>receipt_long</span>
              <p className="text-sm">Manage Orders</p>
            </Link>
            <Link to={RoutePath.QR_GENERATOR} onClick={handleNavClick} className={navItemClass(RoutePath.QR_GENERATOR)}>
              <span className={iconClass(RoutePath.QR_GENERATOR)}>qr_code_2</span>
              <p className="text-sm">QR Generator</p>
            </Link>
          </nav>
        </div>

        {/* User Mini Profile */}
        <div className="border-t border-border-light dark:border-border-dark pt-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-light dark:border-border-dark"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBT_1e8ecPhLYfBtAnsSR0uRyhh9iv_A_kP0rhKVH3HkXnaw_Ke6G4V-WqV09GRyX8eG6Ne625-Np8LuCtnAI5_m24uoup7OU0d1dBfoVt-MKxAMV9OgYrvhdA7Qmfwf1H6k0VbXFkmmF6TG4Zzw6ah6VvSUqplDA-DrVgDkBYY-J87V84_KLlC9rEKgmlqzObWS_Yz0F5OlObIJRE5KKxrS3uDGAGM5eaDDXEBltAZpc5CMG75cu7SMYpur_QEwNBe8fd-CdD4rSIS")',
              }}
            />
            <div className="flex flex-col overflow-hidden">
              <p className="text-text-main-light dark:text-white text-sm font-semibold truncate">
                {user?.user_metadata?.full_name || 'Admin User'}
              </p>
              <p className="text-text-sub-light dark:text-text-sub-dark text-xs truncate">
                {user?.email || 'admin@flavorhub.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
