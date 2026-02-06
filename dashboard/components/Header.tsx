import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { signOut } from '../../services/authService';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';
import { RoutePath } from '../types';

interface HeaderProps {
  onMenuToggle: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, theme, onToggleTheme }) => {
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [
      { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' }
    ];

    if (path === RoutePath.DASHBOARD || path === '/') {
      items[0].isLast = true;
      return items;
    }

    if (path.includes('/categories')) {
      items.push({ label: 'Categories', path: RoutePath.CATEGORIES, icon: 'category' });
      if (path.includes('/new')) {
        items.push({ label: 'New Category', isLast: true });
      } else if (path.includes('/edit')) {
        items.push({ label: 'Edit Category', isLast: true });
      } else {
        items[items.length - 1].isLast = true;
      }
    } else if (path.includes('/products')) {
      items.push({ label: 'Products', path: RoutePath.PRODUCTS, icon: 'restaurant_menu' });
      if (path.includes('/new')) {
        items.push({ label: 'New Product', isLast: true });
      } else if (path.includes('/edit')) {
        items.push({ label: 'Edit Product', isLast: true });
      } else {
        items[items.length - 1].isLast = true;
      }
    } else if (path.includes('/orders')) {
      items.push({ label: 'Orders', path: RoutePath.ORDERS, icon: 'receipt_long', isLast: true });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbs();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex-shrink-0 z-10">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-lg text-text-main-light dark:text-white hover:bg-background-light dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark group-focus-within:text-primary">
              search
            </span>
          </div>
          <input
            className="block w-64 pl-10 pr-3 py-2 rounded-lg border-none bg-background-light dark:bg-slate-800 text-sm text-text-main-light dark:text-white placeholder-text-sub-light dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Search..."
            type="text"
          />
        </label>
        <div className="flex items-center gap-3 border-l border-border-light dark:border-border-dark pl-6">
          <button className="flex items-center justify-center p-2 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-slate-800 hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
          </button>
          <button 
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg text-text-sub-light dark:text-text-sub-dark hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
