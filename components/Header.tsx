import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
type Theme = 'light' | 'dark';

interface HeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  theme: Theme;
  onToggleTheme: () => void;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onSearch, onNavigate, currentView, theme, onToggleTheme, searchQuery }) => {
  const [isBumping, setIsBumping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (cartCount === 0) return;
    setIsBumping(true);
    
    const timer = setTimeout(() => {
      setIsBumping(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [cartCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleNavigate = (view: ViewType) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-solid border-[#e6e0db] dark:border-white/5 bg-white dark:bg-[#2c241b]/95 backdrop-blur-md px-4 md:px-10 lg:px-40 py-3 transition-colors duration-300">
        <div className="flex items-center justify-between gap-4 md:gap-8 max-w-[1280px] mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Hamburger Button (Visible on Mobile/Tablet) */}
            <button 
              className="lg:hidden -ml-2 p-2 text-text-main dark:text-white rounded-lg hover:bg-background-light dark:hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl align-middle">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            <div className="flex items-center gap-3 text-text-main dark:text-white cursor-pointer group" onClick={() => onNavigate('menu')}>
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <span className="material-symbols-outlined text-2xl">restaurant</span>
              </div>
              <div className="flex flex-col -gap-1 hidden sm:flex">
                <span className="text-xl font-black leading-none tracking-tighter font-['Outfit'] group-hover:text-primary transition-colors">PAYPYA</span>
                <span className="text-[10px] font-bold leading-none tracking-[0.2em] text-primary uppercase ml-0.5">Coffee & Eatery</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-9">
              <button 
                onClick={() => onNavigate('menu')}
                className={`text-sm font-bold leading-normal pb-0.5 transition-colors ${
                  currentView === 'menu' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                Menu
              </button>
              <button 
                onClick={() => onNavigate('locations')}
                className={`text-sm font-bold leading-normal pb-0.5 transition-colors ${
                  currentView === 'locations' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                Locations
              </button>
              <button 
                onClick={() => onNavigate('orders')}
                className={`text-sm font-bold leading-normal pb-0.5 transition-colors ${
                  currentView === 'orders' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                Orders
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className={`text-sm font-bold leading-normal pb-0.5 transition-colors ${
                  currentView === 'contact' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex flex-1 justify-end gap-3 md:gap-6 items-center">
            {/* Desktop Search */}
            <label className="flex flex-col min-w-40 !h-10 max-w-64 hidden md:block group">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden bg-background-light dark:bg-white/5 border border-transparent focus-within:border-primary transition-colors">
                <div className="text-text-secondary dark:text-gray-400 flex border-none items-center justify-center pl-4">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-text-secondary dark:placeholder:text-gray-500 px-3 pl-2 text-sm font-normal leading-normal" 
                  placeholder="Search menu..." 
                />
              </div>
            </label>
            
            <button
              onClick={onToggleTheme}
              className="size-10 flex items-center justify-center rounded-lg text-text-secondary dark:text-gray-300 hover:bg-background-light dark:hover:bg-white/10 transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
               <span className="material-symbols-outlined text-xl">
                 {theme === 'light' ? 'dark_mode' : 'light_mode'}
               </span>
            </button>

            <button 
              onClick={() => onNavigate('cart')}
              className={`relative flex items-center justify-center gap-2 h-10 px-4 text-sm font-bold rounded-lg transition-all shadow-sm active:scale-95 ${
                currentView === 'cart' 
                  ? 'bg-primary-dark text-white' 
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className={`ml-1 bg-white text-primary text-xs px-1.5 py-0.5 rounded-full font-extrabold transition-transform duration-200 ${isBumping ? 'scale-150' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Menu Content */}
            <div className="absolute top-[65px] left-0 w-full bg-white dark:bg-[#2c241b] border-b border-[#e6e0db] dark:border-white/5 shadow-xl animate-slide-down p-4 flex flex-col gap-4">
                {/* Mobile Search (Hidden on tablet, shown on mobile) */}
                <div className="flex md:hidden items-center bg-background-light dark:bg-white/5 rounded-lg px-4 py-3 border border-transparent focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-text-secondary dark:text-gray-400 mr-3">search</span>
                    <input 
                        type="text" 
                        placeholder="Search menu..." 
                        className="bg-transparent border-none w-full text-text-main dark:text-white focus:ring-0 p-0 text-base placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                </div>

                <nav className="flex flex-col gap-1">
                    <button 
                        onClick={() => handleNavigate('menu')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
                            currentView === 'menu' 
                                ? 'bg-primary/10 text-primary dark:text-primary' 
                                : 'text-text-main dark:text-white hover:bg-background-light dark:hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined">restaurant_menu</span>
                        Menu
                    </button>
                    <button 
                        onClick={() => handleNavigate('locations')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
                            currentView === 'locations' 
                                ? 'bg-primary/10 text-primary dark:text-primary' 
                                : 'text-text-main dark:text-white hover:bg-background-light dark:hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined">storefront</span>
                        Locations
                    </button>
                    <button 
                        onClick={() => handleNavigate('orders')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
                            currentView === 'orders' 
                                ? 'bg-primary/10 text-primary dark:text-primary' 
                                : 'text-text-main dark:text-white hover:bg-background-light dark:hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                        Orders
                    </button>
                    <button 
                        onClick={() => handleNavigate('contact')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
                            currentView === 'contact' 
                                ? 'bg-primary/10 text-primary dark:text-primary' 
                                : 'text-text-main dark:text-white hover:bg-background-light dark:hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined">mail</span>
                        Contact
                    </button>
                </nav>
            </div>
        </div>
      )}
    </>
  );
};