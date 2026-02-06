import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { createCategory } from '../../services/categoryService';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';

export const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'category',
    description: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Auto-generate slug if empty
      const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      await createCategory({
        ...formData,
        slug,
      });
      navigate(RoutePath.CATEGORIES);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
    { label: 'Categories', path: RoutePath.CATEGORIES, icon: 'category' },
    { label: 'Create Category', isLast: true }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth bg-background-light dark:bg-background-dark">
      <div className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-10">
        <header className="flex flex-col gap-4 mb-8">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl md:text-4xl font-black text-text-main-light dark:text-white tracking-tight">
            Create New Category
          </h1>
          <p className="text-text-sub-light dark:text-text-sub-dark text-base md:text-lg">
            Add a new category to organize your menu items efficiently.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Category Name</span>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Appetizers, Main Course"
                  type="text"
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Slug (Optional)</span>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., appetizers"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Icon Name (Material Symbol)</span>
                <div className="flex gap-2">
                   <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined">{formData.icon}</span>
                   </div>
                   <input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., category, lunch_dining"
                    type="text"
                  />
                </div>
              </label>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <label className="flex flex-col gap-2 h-full">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Description</span>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full flex-1 min-h-[140px] px-4 py-3 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  placeholder="Describe what kind of items belong in this category..."
                />
                <span className="text-xs text-text-sub-light dark:text-text-sub-dark text-right">{formData.description.length}/200 characters</span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Display Order</span>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., 0"
                />
              </label>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={() => navigate(RoutePath.CATEGORIES)}
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
