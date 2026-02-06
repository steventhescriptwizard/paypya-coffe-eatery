import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../../services/categoryService';
import type { DbCategory } from '../../lib/database.types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    display_order: 0,
  });

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
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(category?: DbCategory) {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
        display_order: category.display_order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        description: '',
        display_order: categories.length + 1,
      });
    }
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      display_order: 0,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category? All products in this category will also be deleted.')) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-white">Categories</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Manage menu categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-[#2c241b] rounded-xl border border-[#e6e0db] dark:border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-[#e6e0db] dark:border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-main dark:text-white">Order</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-main dark:text-white">Icon</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-main dark:text-white">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-main dark:text-white">Slug</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-main dark:text-white">Description</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-text-main dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e0db] dark:divide-white/10">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-text-secondary dark:text-gray-400">
                  {category.display_order}
                </td>
                <td className="px-6 py-4">
                  <span className="material-symbols-outlined text-primary text-2xl">{category.icon}</span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-text-main dark:text-white">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary dark:text-gray-400">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary dark:text-gray-400 max-w-md truncate">
                  {category.description}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="text-primary hover:text-primary-dark mr-3"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2c241b] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e6e0db] dark:border-white/10">
              <h2 className="text-2xl font-black text-text-main dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                  Icon (Material Symbol name)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., rice_bowl, coffee, restaurant_menu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-white/10 text-text-main dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
