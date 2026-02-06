import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RoutePath } from '../types';
import { getAllCategories, deleteCategory } from '../../services/categoryService';
import { DbCategory } from '../../lib/database.types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(categories.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setCategories(categories.filter(c => c.id !== categoryToDelete));
      } catch (error) {
        alert('Failed to delete category');
      }
      setCategoryToDelete(null);
    } else if (selectedIds.size > 0) {
      try {
        await Promise.all(Array.from(selectedIds).map(id => deleteCategory(id)));
        setCategories(categories.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
      } catch (error) {
        alert('Failed to delete some categories');
      }
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
    { label: 'Categories', isLast: true, icon: 'category' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 relative">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="w-full @container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-main-light dark:text-white">
                Manage Categories
              </h3>
              <p className="text-text-sub-light dark:text-text-sub-dark text-sm">
                View, edit, and organize your menu categories below.
              </p>
            </div>
            <Link
              to={RoutePath.CATEGORY_CREATE}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add New Category</span>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-light/50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
                  <th className="px-6 py-4 w-12">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={categories.length > 0 && selectedIds.size === categories.length}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider w-20">
                    Icon
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider hidden sm:table-cell">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-sub-light dark:text-text-sub-dark uppercase tracking-wider text-right w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`group transition-colors ${selectedIds.has(category.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-background-light dark:hover:bg-slate-800/50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={selectedIds.has(category.id)}
                          onChange={() => handleSelectOne(category.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-border-light dark:border-border-dark overflow-hidden">
                        {category.icon ? (
                          <span className="material-symbols-outlined">{category.icon}</span>
                        ) : (
                          <span className="material-symbols-outlined">category</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-text-main-light dark:text-white">
                        {category.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-text-sub-light dark:text-text-sub-dark">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/categories/${category.id}/edit`}
                          className="p-1.5 text-text-sub-light dark:text-text-sub-dark hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </Link>
                        <button
                          onClick={() => confirmDelete(category.id)}
                          className="p-1.5 text-text-sub-light dark:text-text-sub-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-sub-light dark:text-text-sub-dark italic">
                      No categories found. Click "Add New Category" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
                onClick={() => setIsDeleteModalOpen(true)}
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
          setCategoryToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Category"
        message={categoryToDelete ? "Are you sure you want to delete this category? This action cannot be undone." : `Are you sure you want to delete ${selectedIds.size} categories? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
