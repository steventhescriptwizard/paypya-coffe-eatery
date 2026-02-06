import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RoutePath } from '../types';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';
import { getAllOrders, getOrderStats } from '../../services/orderService';
import { dbCategoryToCategory, dbProductToMenuItem, Category, MenuItem } from '../../types';
import { formatIDR } from '../../utils/format';

export const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState({
    categoriesCount: 0,
    productsCount: 0,
    unavailableCount: 0,
    totalRevenue: 0,
    totalOrders: 0
  });
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [dbCats, dbProds, dbOrders, stats] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          getAllOrders(),
          getOrderStats()
        ]);

        const cats = dbCats.map(dbCategoryToCategory);
        const prods = dbProds.map(dbProductToMenuItem);

        setStatsData({
          categoriesCount: cats.length,
          productsCount: prods.length,
          unavailableCount: prods.filter(p => !p.isAvailable).length,
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders
        });

        // Use top 3 as "popular" for now
        setPopularItems(prods.slice(0, 3));
        
        // Map recent orders for display
        setRecentOrders(dbOrders.slice(0, 5).map(order => ({
          id: order.order_number,
          customer: order.customer_name,
          items: order.order_items.map((oi: any) => `${oi.quantity}x ${oi.products.name}`).join(', '),
          total: formatIDR(Number(order.total_amount)),
          status: order.status,
          time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));

      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Revenue',
      value: formatIDR(statsData.totalRevenue),
      trend: '0%',
      isPositive: true,
      icon: 'payments',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Orders',
      value: statsData.totalOrders.toString(),
      trend: '0%',
      isPositive: true,
      icon: 'shopping_bag',
      color: 'bg-purple-500',
    },
    {
      label: 'Menu Items',
      value: statsData.productsCount.toString(),
      trend: '+0',
      isPositive: true,
      icon: 'restaurant_menu',
      color: 'bg-emerald-500',
    },
    {
      label: 'Active Categories',
      value: statsData.categoriesCount.toString(),
      trend: '+0',
      isPositive: true,
      icon: 'category',
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black text-text-main-light dark:text-white">Dashboard Overview</h1>
          <p className="text-text-sub-light dark:text-text-sub-dark">Welcome back, here is what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-start justify-between group hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark">{stat.label}</p>
                <h3 className="text-2xl font-bold text-text-main-light dark:text-white">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-text-sub-light dark:text-text-sub-dark">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Chart / Table */}
          <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="font-bold text-text-main-light dark:text-white">Recent Orders</h3>
              <Link to={RoutePath.ORDERS} className="text-sm text-primary hover:text-blue-600 font-medium">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background-light/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase hidden sm:table-cell">Items</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-background-light dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-text-main-light dark:text-white">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">
                        <div className="flex flex-col">
                          <span className="text-text-main-light dark:text-white font-medium">{order.customer}</span>
                          <span className="text-xs opacity-70">{order.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark hidden sm:table-cell truncate max-w-xs">{order.items}</td>
                      <td className="px-6 py-4 text-sm font-bold text-text-main-light dark:text-white">{order.total}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                          ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                            order.status === 'Cooking' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular / Quick Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-primary rounded-xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-white/10">
                <span className="material-symbols-outlined text-[150px]">inventory_2</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Add New Product</h3>
                <p className="text-blue-100 mb-6 text-sm">Expand your menu by adding new dishes, drinks or desserts.</p>
                <Link 
                  to={RoutePath.PRODUCT_CREATE}
                  className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Product
                </Link>
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 flex-1">
              <h3 className="font-bold text-text-main-light dark:text-white mb-4">Popular Items</h3>
              <div className="flex flex-col gap-4">
                {popularItems.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0">
                     <div className="size-12 rounded-lg bg-gray-100 bg-center bg-cover flex-shrink-0" style={{backgroundImage: `url('${item.image}')`}}></div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-semibold text-text-main-light dark:text-white line-clamp-1">{item.name}</h4>
                       <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Available</p>
                     </div>
                     <div className="text-sm font-bold text-text-main-light dark:text-white flex-shrink-0">
                        {formatIDR(item.price)}
                     </div>
                  </div>
                ))}
                {popularItems.length === 0 && (
                  <p className="text-sm text-text-sub-light dark:text-text-sub-dark italic">No products yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
