import React, { useState, useEffect } from 'react';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';
import { RoutePath } from '../types';
import { getAllOrders, updateOrderStatus, deleteOrder, updatePaymentStatus } from '../../services/orderService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatIDR } from '../../utils/format';
import { InvoicePage } from '../../components/InvoicePage';
import { Order as AppOrder, CartItem } from '../../types';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AppOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    } catch (error) {
      alert('Failed to update payment status');
    }
  };

  const confirmDelete = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete);
        setOrders(orders.filter(o => o.id !== orderToDelete));
      } catch (error) {
        alert('Failed to delete order');
      }
      setOrderToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
    { label: 'Orders', isLast: true, icon: 'receipt_long' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (showInvoice && selectedOrderForInvoice) {
    return (
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark pb-20">
        <InvoicePage 
          order={selectedOrderForInvoice} 
          onBack={() => setShowInvoice(false)} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-text-main-light dark:text-white tracking-tight">
              Manage Orders
            </h3>
            <p className="text-text-sub-light dark:text-text-sub-dark text-sm">
              View, update status, and track all incoming orders.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark text-xl pointer-events-none">search</span>
                <input 
                  type="text"
                  placeholder="Search order # or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-sub-light/50 dark:placeholder:text-text-sub-dark/30"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
             </div>

             <div className="flex items-center gap-2 w-full sm:w-auto">
               <span className="text-sm font-bold text-text-sub-light dark:text-text-sub-dark hidden sm:inline">Filter:</span>
               <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
               >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
               </select>
             </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-light/50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Order Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Table</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider hidden lg:table-cell">Items</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-light/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-primary font-['Outfit']">{order.order_number}</span>
                      <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark opacity-70">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-black">
                        {order.table_number || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-text-main-light dark:text-white uppercase tracking-tight">{order.customer_name}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        {order.order_items?.map((item: any, idx: number) => (
                          <p key={idx} className="text-xs text-text-sub-light dark:text-text-sub-dark truncate max-w-[200px]">
                            {item.quantity}x {item.products?.name}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-text-main-light dark:text-white">{formatIDR(Number(order.total_amount))}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.payment_status || 'Unpaid'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full border-none appearance-none cursor-pointer transition-all shadow-sm ${
                          order.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                          order.payment_status === 'Refunded' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full border-none appearance-none cursor-pointer transition-all shadow-sm ${
                          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                          order.status === 'Cooking' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const appOrder: AppOrder = {
                                id: order.order_number,
                                date: order.created_at,
                                total: Number(order.total_amount),
                                status: order.status,
                                paymentStatus: order.payment_status || 'Unpaid',
                                customerName: order.customer_name,
                                tableNumber: order.table_number,
                                items: order.order_items.map((oi: any) => ({
                                  id: oi.product_id,
                                  name: oi.products?.name || 'Unknown Product',
                                  description: oi.products?.description || '',
                                  price: Number(oi.price_at_time),
                                  quantity: oi.quantity,
                                  image: oi.products?.image_url || '',
                                  categoryId: oi.products?.category_id || ''
                                }))
                              };
                              setSelectedOrderForInvoice(appOrder);
                              setShowInvoice(true);
                            }}
                            className="p-2 text-text-sub-light dark:text-text-sub-dark hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="View Invoice"
                          >
                            <span className="material-symbols-outlined text-[20px]">description</span>
                          </button>
                          <button
                            onClick={() => confirmDelete(order.id)}
                            className="p-2 text-text-sub-light dark:text-text-sub-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-sub-light dark:text-text-sub-dark italic">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
