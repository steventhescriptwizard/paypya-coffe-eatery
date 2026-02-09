import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { createOrder } from '../../services/orderService';
import { DbProduct, DbCategory } from '../../lib/database.types';
import { formatIDR } from '../../utils/format';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';

interface POSItem extends DbProduct {
    quantity: number;
}

export const POSPage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<POSItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCartOnMobile, setShowCartOnMobile] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [prodData, catData] = await Promise.all([
                    getAllProducts(),
                    getAllCategories()
                ]);
                setProducts(prodData);
                setCategories(catData);
            } catch (error) {
                console.error('Error loading POS data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch && p.is_available;
        });
    }, [products, activeCategory, searchQuery]);

    const addToCart = (product: DbProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!customerName.trim()) {
            alert('Please enter customer name');
            return;
        }

        try {
            setIsSubmitting(true);
            const orderData = {
                customer_name: customerName,
                table_number: tableNumber,
                total_amount: total,
                status: 'Cooking', // POS orders usually go straight to kitchen
                payment_method: 'cashier'
            };

            const orderItems = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            await createOrder(orderData, orderItems);
            
            alert('Order created successfully!');
            setCart([]);
            setCustomerName('');
            setTableNumber('');
            navigate(RoutePath.ORDERS);
        } catch (error) {
            console.error('Error creating POS order:', error);
            alert('Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
        { label: 'POS', isLast: true, icon: 'point_of_sale' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Header / Breadcrumbs */}
            <div className="p-4 md:p-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <Breadcrumbs items={breadcrumbItems} />
                        <h1 className="text-2xl font-black text-text-main dark:text-white">Point of Sale</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark">search</span>
                            <input 
                                type="text"
                                placeholder="Cari menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-border-light dark:border-border-dark rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-64 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Product Selection Area */}
                <div className={`flex-1 flex flex-col overflow-hidden ${showCartOnMobile ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Categories Strip */}
                    <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-border-light dark:border-border-dark">
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-bold whitespace-nowrap transition-all ${
                                activeCategory === 'all' 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-white dark:bg-white/5 text-text-sub-light dark:text-text-sub-dark hover:bg-gray-100 dark:hover:bg-white/10'
                            }`}
                        >
                            SEMUA MENU
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 lg:gap-2 ${
                                    activeCategory === cat.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-white dark:bg-white/5 text-text-sub-light dark:text-text-sub-dark hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm lg:text-base">{cat.icon}</span>
                                {cat.name.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                        {filteredProducts.map(product => (
                            <button 
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="group flex flex-row sm:flex-col bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden hover:border-primary transition-all text-left shadow-sm active:scale-95 h-[100px] sm:h-auto"
                            >
                                <div className="w-[100px] sm:w-full aspect-square relative overflow-hidden shrink-0">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-background-light dark:bg-white/5 text-text-sub-light">
                                            <span className="material-symbols-outlined text-3xl">restaurant</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-end p-3">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">+ Tambahkan</span>
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-center sm:justify-start">
                                    <h3 className="font-bold text-sm text-text-main dark:text-white line-clamp-2 sm:line-clamp-1 mb-1">{product.name}</h3>
                                    <p className="text-primary font-black text-xs">{formatIDR(product.price)}</p>
                                    <div className="mt-2 sm:hidden">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">+ Tambah</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart / Checkout Area */}
                <div className={`w-full lg:w-[380px] border-l border-border-light dark:border-border-dark bg-white dark:bg-surface-dark flex flex-col shadow-2xl z-10 ${showCartOnMobile ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                        <div className="flex items-center gap-2 lg:block">
                            <button 
                                onClick={() => setShowCartOnMobile(false)}
                                className="lg:hidden size-8 flex items-center justify-center rounded-full bg-background-light dark:bg-white/10 text-text-main dark:text-white"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <h2 className="font-black text-xl text-text-main dark:text-white">Pesanan Baru</h2>
                        </div>
                        <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold hover:underline">Hapus Semua</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 grayscale">
                                <span className="material-symbols-outlined text-6xl">shopping_basket</span>
                                <p className="text-sm font-bold mt-2">Belum ada item</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-3 p-3 bg-background-light dark:bg-white/5 rounded-2xl border border-border-light dark:border-white/5 group">
                                    <div className="size-16 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-bold text-text-main dark:text-white line-clamp-1">{item.name}</h4>
                                            <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-text-sub-light opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center bg-white dark:bg-white/10 rounded-lg p-0.5 border border-border-light dark:border-white/5">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="size-5 flex items-center justify-center rounded text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="w-6 text-center text-[10px] font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="size-5 flex items-center justify-center rounded text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <p className="text-xs font-black text-primary">{formatIDR(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Nama Customer</label>
                                <input 
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Nama..."
                                    className="w-full px-3 py-2 bg-background-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Nomor Meja</label>
                                <input 
                                    type="text"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    placeholder="Meja..."
                                    className="w-full px-3 py-2 bg-background-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 py-2">
                            <div className="flex justify-between items-center text-text-sub-light dark:text-text-sub-dark text-xs">
                                <span>Subtotal</span>
                                <span className="font-bold">{formatIDR(total)}</span>
                            </div>
                            <div className="flex justify-between items-center text-text-main dark:text-white font-black">
                                <span className="text-sm">Total</span>
                                <span className="text-xl text-primary">{formatIDR(total)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={isSubmitting || cart.length === 0 || !customerName.trim()}
                            className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    BUAT PESANAN
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Floating Cart Button */}
                {!showCartOnMobile && cart.length > 0 && (
                    <button 
                        onClick={() => setShowCartOnMobile(true)}
                        className="lg:hidden fixed bottom-6 right-6 z-30 bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-3 animate-bounce-in active:scale-90 transition-all"
                    >
                        <div className="relative">
                            <span className="material-symbols-outlined">shopping_basket</span>
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black size-5 flex items-center justify-center rounded-full border-2 border-primary">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        </div>
                        <span className="font-black text-sm">Lihat Pesanan</span>
                    </button>
                )}
            </div>
        </div>
    );
};
