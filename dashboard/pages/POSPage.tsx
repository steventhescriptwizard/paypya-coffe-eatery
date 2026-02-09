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
                payment_method: 'cashier',
                payment_status: 'Unpaid'
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
        <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark relative font-display">
            {/* LEFT SIDE: Product Grid */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden border-r border-border-light dark:border-border-dark w-full ${showCartOnMobile ? 'hidden lg:flex' : 'flex'}`}>
                
                {/* Header Section */}
                <div className="p-4 md:p-6 pb-2 space-y-4 bg-surface-light dark:bg-surface-dark/30 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex flex-col gap-0.5 mb-2">
                        <Breadcrumbs items={breadcrumbItems} />
                        <h1 className="text-xl lg:text-2xl font-black text-text-main dark:text-white">Point of Sale</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white dark:bg-white/5 shadow-sm text-text-main dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary transition-all outline-none"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeCategory === 'all'
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-white dark:bg-surface-dark text-text-sub-light dark:text-text-sub-dark hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            SEMUA MENU
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeCategory === cat.id
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'bg-white dark:bg-surface-dark text-text-sub-light dark:text-text-sub-dark hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                {cat.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 pb-24 lg:pb-6 min-h-0">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-text-sub-light dark:text-text-sub-dark opacity-60">
                            <span className="material-symbols-outlined text-6xl mb-2">fastfood</span>
                            <p>No products found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => {
                                const cartItem = cart.find(c => c.id === product.id);
                                const quantityInCart = cartItem ? cartItem.quantity : 0;
                                const isSelected = quantityInCart > 0;

                                return (
                                    <div 
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className={`
                                            relative rounded-xl p-3 shadow-sm cursor-pointer transition-all hover:shadow-md group flex flex-row sm:flex-col h-full
                                            bg-white dark:bg-surface-dark min-h-[100px] sm:min-h-[200px]
                                            ${isSelected 
                                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' 
                                                : 'border border-transparent hover:border-primary dark:hover:border-primary'}
                                        `}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 z-10 bg-primary text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                                                {quantityInCart}
                                            </div>
                                        )}

                                        <div className="w-[80px] sm:w-full aspect-square rounded-lg bg-background-light dark:bg-white/5 bg-center bg-cover mb-0 sm:mb-3 relative overflow-hidden shrink-0" style={{backgroundImage: `url('${product.image_url}')`}}>
                                            {!product.image_url && (
                                                <div className="w-full h-full flex items-center justify-center text-text-sub-light">
                                                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white text-primary rounded-full p-1 shadow-sm">
                                                        <span className="material-symbols-outlined text-lg">add</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 pl-3 sm:pl-0 justify-center sm:justify-start">
                                            <h3 className="font-bold text-text-main dark:text-white text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                                            <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark mb-2 limit-1">{product.description || 'No description'}</p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="font-black text-primary text-sm lg:text-base">{formatIDR(product.price)}</span>
                                                <button className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                                    <span className="material-symbols-outlined text-sm lg:text-lg">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Backdrop */}
            {showCartOnMobile && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden"
                    onClick={() => setShowCartOnMobile(false)}
                />
            )}

            {/* RIGHT SIDE: Cart Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col shadow-2xl transition-transform duration-300 ease-out
                lg:relative lg:translate-x-0 lg:z-auto lg:shadow-xl lg:w-[380px] lg:flex-shrink-0
                ${showCartOnMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                
                {/* Cart Header */}
                <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-surface-dark z-10">
                    <div>
                        <h2 className="text-xl font-black text-text-main dark:text-white">Pesanan Baru</h2>
                        <p className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Transaksi Aktif</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCart([])}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors flex items-center justify-center"
                            title="Clear Cart"
                        >
                            <span className="material-symbols-outlined">delete_sweep</span>
                        </button>
                        <button 
                            onClick={() => setShowCartOnMobile(false)}
                            className="lg:hidden text-text-sub-light dark:text-text-sub-dark hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Cart Items (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-sub-light dark:text-text-sub-dark opacity-20 py-20 grayscale">
                            <span className="material-symbols-outlined text-6xl mb-4">shopping_basket</span>
                            <p className="text-sm font-bold">Belum ada item</p>
                            <p className="text-[10px] mt-1">Pilih menu untuk memulai pesanan.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="group flex gap-3 bg-background-light dark:bg-white/5 p-3 rounded-xl border border-transparent hover:border-primary/30 transition-all shadow-sm">
                                <div className="size-16 rounded-lg bg-background-light dark:bg-slate-700 bg-center bg-cover flex-shrink-0 relative overflow-hidden" style={{backgroundImage: `url('${item.image_url}')`}}>
                                    {!item.image_url && (
                                        <div className="w-full h-full flex items-center justify-center text-text-sub-light">
                                            <span className="material-symbols-outlined text-xl">restaurant</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-text-main dark:text-white text-xs line-clamp-1">{item.name}</h4>
                                        <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-text-sub-light opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-black text-primary">{formatIDR(item.price * item.quantity)}</span>
                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-0.5 shadow-sm border border-border-light dark:border-slate-700">
                                            <button 
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="size-6 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-text-main dark:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center text-text-main dark:text-white">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="size-6 flex items-center justify-center rounded-md hover:bg-primary hover:text-white text-text-main dark:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Footer / Checkout */}
                <div className="p-5 bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark space-y-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Customer</label>
                            <input 
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Nama..."
                                className="w-full px-3 py-2 bg-background-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Meja</label>
                            <input 
                                type="text"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="Nomor..."
                                className="w-full px-3 py-2 bg-background-light dark:bg-white/5 border border-border-light dark:border-border-dark rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 py-2">
                        <div className="flex justify-between items-center text-text-sub-light dark:text-text-sub-dark text-xs">
                            <span className="font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                            <span className="font-bold">{formatIDR(total)}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-dashed border-slate-300 dark:border-slate-600 pt-3">
                            <span className="text-sm font-black text-text-main dark:text-white uppercase tracking-widest">Total</span>
                            <span className="text-2xl font-black text-primary leading-none">{formatIDR(total)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={isSubmitting || cart.length === 0 || !customerName.trim()}
                        className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
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
                    <div className="flex flex-col items-start leading-tight">
                        <span className="font-black text-[10px] uppercase tracking-wider opacity-80">Lihat Pesanan</span>
                        <span className="font-black text-sm">{formatIDR(total)}</span>
                    </div>
                </button>
            )}
        </div>
    );
};
