import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';
import { LocationsPage } from './components/LocationsPage';
import { ContactPage } from './components/ContactPage';
import { OrderHistoryPage } from './components/OrderHistoryPage';
import { InvoicePage } from './components/InvoicePage';
import { Breadcrumbs, BreadcrumbItem } from './components/Breadcrumbs';
import { Category, MenuItem, CartItem, Order, dbCategoryToCategory, dbProductToMenuItem, ViewType } from './types';
import { getAllCategories } from './services/categoryService';
import { getAllProducts, searchProducts as searchProductsService } from './services/productService';
import { createOrder } from './services/orderService';

const ITEMS_PER_PAGE = 8;

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load categories and products from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const dbCategories = await getAllCategories();
        const appCategories = dbCategories.map(dbCategoryToCategory);
        setCategories(appCategories);

        // Set first category as active
        if (appCategories.length > 0 && !activeCategory) {
          setActiveCategory(appCategories[0].id);
        }

        // Fetch all products
        const dbProducts = await getAllProducts({ isAvailable: true });
        const appProducts = dbProducts.map(dbProductToMenuItem);
        setMenuItems(appProducts);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load menu data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Detect table number from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableId = params.get('table');
    if (tableId) {
      localStorage.setItem('paypya_table_number', tableId);
      localStorage.setItem('paypya_table_locked', 'true');
      console.log('Detected table number from URL:', tableId);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const currentCategory = categories.find(c => c.id === activeCategory);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isSearching = searchQuery.trim().length > 0;

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (query.length > 0) {
      return menuItems.filter(item => {
        return item.name.toLowerCase().includes(query) || 
               item.description.toLowerCase().includes(query) ||
               item.tags?.some(tag => tag.toLowerCase().includes(query));
      });
    }

    return menuItems.filter(item => item.categoryId === activeCategory);
  }, [activeCategory, searchQuery, menuItems]);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const handleUpdateCartQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handlePlaceOrder = async (items: CartItem[], total: number, customerName: string, tableNumber: string, paymentMethod: 'cashier' | 'wa_checkout') => {
    try {
      setLoading(true);
      
      // Save order to Supabase
      const order = await createOrder(
        { 
          total_amount: total,
          customer_name: customerName,
          table_number: tableNumber,
          payment_method: paymentMethod
        },
        items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        }))
      );

      // Save to local history using REAL order number
      const newOrder: Order = {
        id: order.id, // ID from Supabase
        order_number: order.order_number,
        date: new Date().toISOString(),
        items: items,
        total: total,
        status: 'Pending',
        customerName,
        tableNumber,
        paymentMethod
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('paypya_orders') || '[]');
      localStorage.setItem('paypya_orders', JSON.stringify([newOrder, ...existingOrders]));
      
      setCartItems([]);
      setSelectedOrder(newOrder);
      setCurrentView('invoice');
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const homeItem: BreadcrumbItem = { label: 'Home', icon: 'home', onClick: () => {
      setCurrentView('menu');
      setSearchQuery('');
    }};
    
    if (currentView === 'cart') {
      return [homeItem, { label: 'Your Cart', active: true, icon: 'shopping_cart' }];
    }
    if (currentView === 'locations') {
      return [homeItem, { label: 'Locations', active: true, icon: 'storefront' }];
    }
    if (currentView === 'contact') {
      return [homeItem, { label: 'Contact', active: true, icon: 'mail' }];
    }
    if (currentView === 'orders') {
      return [homeItem, { label: 'Orders', active: true, icon: 'receipt_long' }];
    }
    
    const items: BreadcrumbItem[] = [homeItem, { label: 'Menu', onClick: () => {
      setCurrentView('menu');
      setSearchQuery('');
    }}];

    if (isSearching) {
       items.push({ label: `Search: "${searchQuery}"`, active: true, icon: 'search' });
    } else if (currentCategory) {
       items.push({ label: currentCategory.label, active: true, icon: currentCategory.icon });
    } else {
       items[1].active = true;
    }
    return items;
  };

  const renderContent = () => {
    if (currentView === 'locations') {
      return <LocationsPage />;
    }

    if (currentView === 'contact') {
      return <ContactPage />;
    }

    if (currentView === 'orders') {
      return (
        <OrderHistoryPage 
          onBackToMenu={() => setCurrentView('menu')} 
          onViewInvoice={(order) => {
            setSelectedOrder(order);
            setCurrentView('invoice');
          }}
        />
      );
    }

    if (currentView === 'invoice' && selectedOrder) {
      return (
        <InvoicePage 
          order={selectedOrder} 
          onBack={() => setCurrentView('orders')}
        />
      );
    }

    if (currentView === 'cart') {
      return (
        <CartPage 
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onBackToMenu={() => {
            setCurrentView('menu');
            setSearchQuery('');
          }}
          onCheckout={handlePlaceOrder}
        />
      );
    }

    // Loading state
    if (loading) {
      return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-text-secondary dark:text-gray-400 text-lg">Loading menu...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-red-500">error</span>
            <p className="text-xl font-semibold text-text-main dark:text-white mb-2">Oops! Something went wrong</p>
            <p className="text-text-secondary dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8">
        
        <Breadcrumbs items={getBreadcrumbs()} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-text-main dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                {isSearching ? 'Search Results' : currentCategory?.label}
              </h1>
              <span className="bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
                {filteredItems.length} Items
              </span>
            </div>
            <p className="text-text-secondary dark:text-gray-400 text-lg font-normal leading-normal max-w-2xl">
              {isSearching 
                ? `Found ${filteredItems.length} results for "${searchQuery}"` 
                : currentCategory?.description}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2c241b] border border-[#e6e0db] dark:border-white/5 rounded-lg text-sm font-bold text-text-main dark:text-white hover:border-primary dark:hover:border-primary transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#2c241b] border border-[#e6e0db] dark:border-white/5 rounded-lg text-sm font-bold text-text-main dark:text-white hover:border-primary dark:hover:border-primary transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">sort</span>
                Sort
            </button>
          </div>
        </div>

        <div className="mb-10 border-b border-[#e6e0db] dark:border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchQuery(''); 
                }}
                className={`group flex flex-col items-center justify-center min-w-[80px] pb-4 pt-2 border-b-[3px] transition-all duration-300 ${
                  activeCategory === category.id && !isSearching
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-text-secondary dark:text-gray-500 hover:text-primary dark:hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined mb-1 text-2xl group-hover:scale-110 transition-transform ${
                    activeCategory === category.id && !isSearching ? 'font-variation-settings-fill' : ''
                }`}>
                  {category.icon}
                </span>
                <p className="text-sm font-bold tracking-wide whitespace-nowrap">{category.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-white dark:bg-[#2c241b] border border-[#e6e0db] dark:border-white/5 px-4 shadow-sm hover:border-primary dark:hover:border-primary transition-colors group">
              <span className="text-text-main dark:text-white text-sm font-medium">Price Range</span>
              <span className="material-symbols-outlined text-lg text-text-secondary dark:text-gray-400 group-hover:text-primary">expand_more</span>
          </button>
          <button className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/30 px-4 shadow-sm hover:bg-primary/20 transition-colors">
              <span className="text-primary text-sm font-bold">In Stock</span>
              <span className="material-symbols-outlined text-lg text-primary">check</span>
          </button>
          <button className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-white dark:bg-[#2c241b] border border-[#e6e0db] dark:border-white/5 px-4 shadow-sm hover:border-primary dark:hover:border-primary transition-colors group">
              <span className="text-text-main dark:text-white text-sm font-medium">Dietary</span>
              <span className="material-symbols-outlined text-lg text-text-secondary dark:text-gray-400 group-hover:text-primary">expand_more</span>
          </button>
        </div>

        {paginatedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {paginatedItems.map(item => (
              <ProductCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary dark:text-gray-500 animate-fade-in">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">search_off</span>
            <p className="text-xl font-semibold">No items found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
            {isSearching && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!isSearching && filteredItems.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-8 gap-2 animate-fade-in">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`size-10 rounded-lg flex items-center justify-center border border-[#e6e0db] dark:border-white/5 bg-white dark:bg-[#2c241b] transition-colors ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : 'hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary text-text-secondary dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-10 rounded-lg flex items-center justify-center font-bold transition-all ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110'
                    : 'border border-[#e6e0db] dark:border-white/5 bg-white dark:bg-[#2c241b] hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary text-text-secondary dark:text-gray-400'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`size-10 rounded-lg flex items-center justify-center border border-[#e6e0db] dark:border-white/5 bg-white dark:bg-[#2c241b] transition-colors ${
                currentPage === totalPages 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : 'hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary text-text-secondary dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display transition-colors duration-300">
      <Header 
        cartCount={cartCount} 
        onSearch={setSearchQuery} 
        onNavigate={setCurrentView}
        currentView={currentView}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
      />
      
      <main className="flex-1 w-full">
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;