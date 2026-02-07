import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { DbProduct, DbCategory } from '../../lib/database.types';

const ITEMS_PER_PAGE = 8;

export const MenuGrid: React.FC = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Items');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const filteredItems = products.filter((item) => {
    const categoryName = categoryMap.get(item.category_id) || 'Uncategorized';
    const matchesFilter = filter === 'All Items' || categoryName === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase()) ||
                          categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const uniqueCategories = ['All Items', ...categories.map(c => c.name)];

  const getStatus = (item: DbProduct) => {
    if (!item.is_available) return 'Out of Stock';
    return 'In Stock';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Stock': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Out of Stock': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      filteredItems.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filteredItems.forEach(item => newSelected.delete(item.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const confirmSingleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete) {
        await deleteProduct(itemToDelete);
        setProducts(products.filter(p => p.id !== itemToDelete));
        const newSelected = new Set(selectedIds);
        newSelected.delete(itemToDelete);
        setSelectedIds(newSelected);
      } else {
        await Promise.all(Array.from(selectedIds).map(id => deleteProduct(id)));
        setProducts(products.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
      }
    } catch (error) {
      alert('Failed to delete items');
    }
    setItemToDelete(null);
  };

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id));

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
    { label: 'Products', isLast: true, icon: 'restaurant_menu' }
  ];

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 relative overflow-y-auto">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-main-light dark:text-white">Menu Items</h2>
          <p className="text-text-sub-light dark:text-text-sub-dark text-base">Manage your food and beverage catalog</p>
        </div>
        <Link 
          to={RoutePath.PRODUCT_CREATE}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors shadow-lg shadow-blue-500/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Menu</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="block w-full h-11 pl-10 pr-3 rounded-lg border-none bg-background-light dark:bg-slate-800 text-text-main-light dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all font-medium border border-border-light dark:border-border-dark"
            placeholder="Search menu items..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setCurrentPage(1); }}
              className={`shrink-0 h-10 px-4 rounded-lg font-medium text-sm transition-colors ${
                filter === cat 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold' 
                  : 'bg-background-light dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light/50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider w-20">Image</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-sub-light dark:text-text-sub-dark">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>No items found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const status = getStatus(item);
                  return (
                    <tr 
                      key={item.id} 
                      className={`group transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-background-light dark:hover:bg-slate-800/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectOne(item.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="size-12 rounded-lg bg-gray-100 dark:bg-slate-700 bg-center bg-cover border border-border-light dark:border-border-dark shadow-sm" style={{backgroundImage: `url('${item.image_url}')`}}></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-main-light dark:text-white">{item.name}</span>
                          <span className="text-xs text-text-sub-light dark:text-text-sub-dark font-mono opacity-50">{item.id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">
                         {categoryMap.get(item.category_id) || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-text-main-light dark:text-white">${item.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={RoutePath.PRODUCT_EDIT.replace(':id', item.id)}
                            className="p-1.5 text-text-sub-light dark:text-text-sub-dark hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                          <button 
                            onClick={() => confirmSingleDelete(item.id)}
                            className="p-1.5 text-text-sub-light dark:text-text-sub-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredItems.length > 0 && (
          <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-light dark:bg-surface-dark">
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              Showing <span className="font-medium text-text-main-light dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-medium text-text-main-light dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}</span> of{' '}
              <span className="font-medium text-text-main-light dark:text-white">{filteredItems.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center p-2 rounded-lg text-text-main-light dark:text-white hover:bg-background-light dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border-light dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center p-2 rounded-lg text-text-main-light dark:text-white hover:bg-background-light dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border-light dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

       <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out transform ${
          selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-text-main-light dark:bg-white text-white dark:text-text-main-light rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 min-w-[320px] justify-between border border-white/10 dark:border-slate-200">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center bg-white/20 dark:bg-black/10 rounded-full w-6 h-6 text-xs font-bold">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium">Items Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-sm font-medium text-gray-300 dark:text-slate-500 hover:text-white dark:hover:text-black px-3 py-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBulkDelete}
                className="flex items-center gap-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full transition-colors shadow-md shadow-red-500/30"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
            </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={itemToDelete ? 'Delete Product?' : 'Delete Selected Products?'}
        message={
          itemToDelete 
            ? 'Are you sure you want to delete this product? This action cannot be undone.'
            : `Are you sure you want to delete ${selectedIds.size} selected products? This action cannot be undone.`
        }
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
