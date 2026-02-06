import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
  icon?: string;
  active?: boolean; 
  isLast?: boolean; 
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-2.5 px-3 rounded-xl transition-all duration-300 backdrop-blur-md bg-white/5 border border-white/10 shadow-sm ${className}`}
    >
      <ol className="flex items-center gap-2 m-0 p-0 list-none">
        {items.map((item, index) => {
          const isActuallyLast = item.isLast || item.active || index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2 group">
              {index > 0 && (
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[18px] select-none animate-in fade-in slide-in-from-left-1 duration-500 delay-150">
                  chevron_right
                </span>
              )}
              
              <div 
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-300 ${
                  isActuallyLast 
                    ? 'text-text-main-light dark:text-white font-bold bg-primary/10 dark:bg-primary/20 scale-105' 
                    : 'text-text-sub-light dark:text-text-sub-dark hover:text-primary dark:hover:text-blue-400 hover:bg-white/10'
                }`}
              >
                {item.icon && (
                  <span className={`material-symbols-outlined text-[18px] transition-all duration-300 group-hover:scale-110 ${isActuallyLast ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                    {item.icon}
                  </span>
                )}
                
                {item.path && !isActuallyLast ? (
                  <Link 
                    to={item.path} 
                    className="text-[14px] tracking-tight decoration-none outline-none font-medium"
                  >
                    {item.label}
                  </Link>
                ) : item.onClick && !isActuallyLast ? (
                  <button 
                    onClick={item.onClick}
                    className="text-[14px] tracking-tight decoration-none outline-none border-none bg-transparent p-0 cursor-pointer font-medium text-inherit"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-[14px] tracking-tight font-bold">
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};