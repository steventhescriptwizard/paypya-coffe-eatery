import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { getCategoryById, updateCategory } from '../../services/categoryService';
import { DbCategory } from '../../lib/database.types';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';

export const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DbCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCategory() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getCategoryById(id);
        if (data) {
          setFormData(data);
        } else {
          navigate(RoutePath.CATEGORIES);
        }
      } catch (error) {
        console.error('Error loading category:', error);
        navigate(RoutePath.CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;
    
    try {
      setSaving(true);
      const { id: _, created_at, updated_at, ...updates } = formData;
      await updateCategory(id, updates);
      navigate(RoutePath.CATEGORIES);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!formData) return null;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
    { label: 'Categories', path: RoutePath.CATEGORIES, icon: 'category' },
    { label: `Edit ${formData.name}`, isLast: true }
  ];

  return (
    <div className="flex-1 p-8 bg-background-light dark:bg-background-dark overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <Breadcrumbs items={breadcrumbItems} />
    
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-text-main-light dark:text-white tracking-tight">Edit Category</h1>
          <p className="text-text-sub-light dark:text-text-sub-dark text-base">
            Update the details for the '{formData.name}' category. Changes will reflect immediately on the customer menu.
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-8 shadow-sm">
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-main-light dark:text-white" htmlFor="categoryName">Category Name</label>
                  <input
                    id="categoryName"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark outline-none transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-main-light dark:text-white" htmlFor="slug">Slug</label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-main-light dark:text-white">Icon Name (Material Symbol)</label>
                  <div className="flex gap-2">
                     <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined">{formData.icon || 'category'}</span>
                     </div>
                     <input
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark outline-none transition-all"
                      placeholder="e.g., category, lunch_dining"
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text-main-light dark:text-white">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark outline-none transition-all"
                    />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-main-light dark:text-white" htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark outline-none resize-none transition-all"
              />
            </div>

            <hr className="border-border-light dark:border-border-dark" />

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => navigate(RoutePath.CATEGORIES)}
                className="px-6 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-main-light dark:text-white font-semibold hover:bg-background-light dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                {saving ? 'Saving...' : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
