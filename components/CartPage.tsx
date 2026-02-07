import React from 'react';
import { CartItem } from '../types';
import { formatIDR } from '../utils/format';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onBackToMenu: () => void;
  onCheckout: (items: CartItem[], total: number, customerName: string, tableNumber: string, paymentMethod: 'cashier' | 'wa_checkout') => Promise<void>;
}

export const CartPage: React.FC<CartPageProps> = ({ items, onUpdateQuantity, onRemoveItem, onBackToMenu, onCheckout }) => {
  const [customerName, setCustomerName] = React.useState('');
  const [tableNumber, setTableNumber] = React.useState('');
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [isTableLocked, setIsTableLocked] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<'cashier' | 'wa_checkout'>('cashier');
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  React.useEffect(() => {
    const savedName = localStorage.getItem('paypya_customer_name'); // Keep this for now, as the input still uses it
    const savedTable = localStorage.getItem('paypya_table_number');
    const tableLocked = localStorage.getItem('paypya_table_locked') === 'true';
    if (savedName) setCustomerName(savedName); // Keep this for now
    if (savedTable) setTableNumber(savedTable);
    setIsTableLocked(tableLocked);
  }, []);

  const handleCheckout = async () => {
    if (!customerName.trim() || !tableNumber.trim()) {
      alert('Tolong isi Nama dan Nomor Meja Anda');
      return;
    }

    try {
      setIsCheckingOut(true);
      
      // Pass all data to onCheckout in App.tsx
      await onCheckout(items, subtotal, customerName, tableNumber, paymentMethod);

      if (paymentMethod === 'wa_checkout') {
        const whatsappNumber = "6282324093711"; 
        
        let message = `*PESANAN BARU*\n`;
        message += `Nama: ${customerName}\n`;
        message += `Meja: ${tableNumber}\n`;
        message += `Metode: WhatsApp Checkout\n`;
        message += `----------------------------\n\n`;
        
        items.forEach(item => {
          message += `${item.quantity}x ${item.name} - ${formatIDR(item.price * item.quantity)}\n`;
        });
        
        message += `\n----------------------------\n`;
        message += `*Total: ${formatIDR(subtotal)}*`;
        message += `\n\nMohon segera diproses ya Kaka, Terima Kasih! 🙏`;
        
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } else {
        alert('Pemesanan Berhasil! Silakan tunjukkan Invoice Anda ke kasir untuk melakukan pembayaran.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Gagal memproses pesanan. Silakan coba lagi.');
    } finally {
      setIsCheckingOut(false);
    }
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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-text-secondary dark:text-gray-400 uppercase tracking-wider">Table Number</label>
                  {isTableLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                      <span className="material-symbols-outlined text-xs">lock</span>
                      Locked by QR
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">table_restaurant</span>
                  <input 
                    type="text" 
                    placeholder="E.g. 12"
                    value={tableNumber}
                    onChange={(e) => !isTableLocked && setTableNumber(e.target.value)}
                    readOnly={isTableLocked}
                    className={`w-full bg-background-light dark:bg-white/5 border border-[#f4f2f0] dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-text-main dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all underline-none ${isTableLocked ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-white/5' : ''}`}
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

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-text-main dark:text-white">Total</span>
              <span className="text-2xl font-black text-primary">{formatIDR(total)}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="flex flex-col gap-3 mb-6">
              <label className="text-[10px] font-black text-text-secondary dark:text-gray-400 uppercase tracking-[0.2em] ml-1">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cashier')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'cashier' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-background-light dark:bg-white/5 border-[#f4f2f0] dark:border-white/10 text-text-secondary dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">payments</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">Kasir</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('wa_checkout')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'wa_checkout' 
                      ? 'bg-[#25D366]/10 border-[#25D366] text-[#25D366] shadow-sm' 
                      : 'bg-background-light dark:bg-white/5 border-[#f4f2f0] dark:border-white/10 text-text-secondary dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">chat</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">WhatsApp</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || !customerName.trim() || !tableNumber.trim()}
              className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 ${
                paymentMethod === 'wa_checkout' 
                  ? 'bg-[#25D366] hover:bg-[#20bd5a] shadow-[#25D366]/20' 
                  : 'bg-primary hover:bg-primary-dark shadow-primary/20'
              } ${isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isCheckingOut ? (
                'Memproses...'
              ) : paymentMethod === 'wa_checkout' ? (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Checkout via WA
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">receipt_long</span>
                  Pesan Sekarang
                </>
              )}
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