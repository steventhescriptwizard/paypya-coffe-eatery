import React from 'react';
import { CartItem } from '../types';
import { formatIDR } from '../utils/format';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onBackToMenu: () => void;
  onCheckout: (items: CartItem[], total: number, customerName: string, tableNumber: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ items, onUpdateQuantity, onRemoveItem, onBackToMenu, onCheckout }) => {
  const [customerName, setCustomerName] = React.useState('');
  const [tableNumber, setTableNumber] = React.useState('');
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  React.useEffect(() => {
    const savedName = localStorage.getItem('paypya_customer_name');
    const savedTable = localStorage.getItem('paypya_table_number');
    if (savedName) setCustomerName(savedName);
    if (savedTable) setTableNumber(savedTable);
  }, []);

  const handleCheckout = () => {
    if (!customerName || !tableNumber) {
      alert('Please enter your name and table number');
      return;
    }

    // Save to localStorage
    localStorage.setItem('paypya_customer_name', customerName);
    localStorage.setItem('paypya_table_number', tableNumber);

    // Replace with your actual WhatsApp number
    const whatsappNumber = "6282324093711"; 
    
    let message = `*PESANAN BARU - MEJA ${tableNumber}*\n`;
    message += `Nama: ${customerName}\n`;
    message += `----------------------------\n\n`;
    
    items.forEach(item => {
      message += `${item.quantity}x ${item.name} - ${formatIDR(item.price * item.quantity)}\n`;
    });
    
    message += `\n----------------------------\n`;
    message += `Subtotal: ${formatIDR(subtotal)}`;
    message += `\n*Total: ${formatIDR(total)}*`;
    message += `\n\nMohon segera di proses ya Kaka, Terima Kasih! 🙏`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    onCheckout(items, total, customerName, tableNumber);
    
    window.open(url, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-full mb-6">
            <span className="material-symbols-outlined text-6xl text-primary opacity-50">shopping_cart_off</span>
        </div>
        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">Your cart is empty</h2>
        <p className="text-text-secondary dark:text-gray-400 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our menu to find something delicious!</p>
        <button 
          onClick={onBackToMenu}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">restaurant_menu</span>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 lg:px-40 py-8 animate-fade-in">
      <button 
        onClick={onBackToMenu}
        className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium mb-8 transition-colors group"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Menu
      </button>

      <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-[#2c241b] rounded-2xl border border-[#f4f2f0] dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="w-full sm:w-32 aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden shrink-0 relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col flex-1 justify-between gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight mb-1">{item.name}</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-1">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-text-secondary dark:text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center bg-background-light dark:bg-white/5 rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="size-7 flex items-center justify-center rounded-md bg-white dark:bg-white/10 text-text-main dark:text-white shadow-sm hover:text-primary dark:hover:text-primary active:scale-95 disabled:opacity-50 transition-all"
                            disabled={item.quantity <= 1}
                        >
                            <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-text-main dark:text-white">{item.quantity}</span>
                        <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="size-7 flex items-center justify-center rounded-md bg-white dark:bg-white/10 text-text-main dark:text-white shadow-sm hover:text-primary dark:hover:text-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                        </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary dark:text-gray-400 mb-0.5">{formatIDR(item.price)} / unit</p>
                    <p className="text-lg font-bold text-primary">{formatIDR(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#2c241b] rounded-2xl border border-[#f4f2f0] dark:border-white/5 shadow-lg p-6 sticky top-28">
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-6">Order Summary</h3>
            
            {/* Customer Info Form */}
            <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#f4f2f0] dark:border-white/10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-wider">Customer Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">person</span>
                  <input 
                    type="text" 
                    placeholder="E.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-background-light dark:bg-white/5 border border-[#f4f2f0] dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-text-main dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all underline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-wider">Table Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">table_restaurant</span>
                  <input 
                    type="text" 
                    placeholder="E.g. 12"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-background-light dark:bg-white/5 border border-[#f4f2f0] dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-text-main dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all underline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-[#f4f2f0] dark:border-white/10">
              <div className="flex justify-between text-text-secondary dark:text-gray-400 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-text-main dark:text-white">{formatIDR(subtotal)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-text-main dark:text-white">Total</span>
              <span className="text-2xl font-black text-primary">{formatIDR(total)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!customerName.trim() || !tableNumber.trim()}
              className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-green-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.248-.57-.397M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c.93.509 1.693.803 2.805.803 3.181 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.784-5.767-5.784zm9.391 3.66c-.366-1.055-.957-2.005-1.713-2.768a8.312 8.312 0 0 0-2.825-1.742c-1.11-.383-2.288-.582-3.486-.582-5.462 0-9.92 4.195-9.92 9.429 0 1.956.574 3.737 1.547 5.385l-1.026 3.864 3.998-1.055c1.474.832 3.129 1.295 4.888 1.295 5.925 0 10.748-4.819 10.748-10.744 0-1.08-.2-2.115-.561-3.082h-1.65v.001z"/>
              </svg>
              Checkout via WhatsApp
            </button>
            <p className="text-center text-xs text-text-secondary dark:text-gray-400 mt-3">
              Proceed to send your order details directly to our staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};