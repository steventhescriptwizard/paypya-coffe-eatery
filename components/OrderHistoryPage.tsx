import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { formatIDR } from '../utils/format';

interface OrderHistoryPageProps {
  onBackToMenu: () => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBackToMenu, onViewInvoice }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('paypya_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-full mb-6">
            <span className="material-symbols-outlined text-6xl text-primary opacity-50">receipt_long</span>
        </div>
        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">No orders yet</h2>
        <p className="text-text-secondary dark:text-gray-400 mb-8 max-w-md">You haven't placed any orders yet. Once you do, they will show up here.</p>
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

      <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white mb-8">Order History</h1>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-[#2c241b] rounded-2xl border border-[#f4f2f0] dark:border-white/5 shadow-sm p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-[#f4f2f0] dark:border-white/5">
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-text-secondary dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <p className="text-2xl font-black text-primary">{formatIDR(order.total)}</p>
                 <button 
                    onClick={() => onViewInvoice(order)}
                    className="text-xs font-bold text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center gap-1 transition-colors"
                 >
                    <span className="material-symbols-outlined text-sm">description</span>
                    View Invoice
                 </button>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-bold text-text-main dark:text-white text-sm sm:text-base">
                            <span className="text-primary mr-2">{item.quantity}x</span> 
                            {item.name}
                        </p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 sm:hidden">
                            {formatIDR(item.price)} / unit
                        </p>
                    </div>
                  </div>
                  <p className="font-bold text-text-main dark:text-white text-sm sm:text-base">
                    {formatIDR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};