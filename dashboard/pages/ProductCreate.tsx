import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { createProduct, uploadProductImage } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { DbCategory } from '../../lib/database.types';
import { Breadcrumbs, BreadcrumbItem } from '../../components/Breadcrumbs';

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getAllCategories();
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
      }

      await createProduct({
        ...formData,
        image_url: finalImageUrl,
      });
      
      navigate(RoutePath.PRODUCTS);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Admin', path: RoutePath.DASHBOARD, icon: 'home' },
    { label: 'Products', path: RoutePath.PRODUCTS, icon: 'restaurant_menu' },
    { label: 'Add Product', isLast: true }
  ];

  if (fetchingCategories) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth bg-background-light dark:bg-background-dark">
      <div className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-10">
        <header className="flex flex-col gap-4 mb-8">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl md:text-4xl font-black text-text-main-light dark:text-white tracking-tight">
            Create New Product
          </h1>
          <p className="text-text-sub-light dark:text-text-sub-dark text-base md:text-lg">
            Add a new item to your menu.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-sm border border-border-light dark:border-border-dark">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Product Name</span>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  placeholder="e.g., Spicy Chicken Wings"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Description</span>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all shadow-sm"
                  placeholder="Ingredients, allergies, etc."
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-text-main-light dark:text-white text-sm font-semibold">Price (IDR)</span>
                  <input
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-12 px-4 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-text-main-light dark:text-white text-sm font-semibold">Category</span>
                  <div className="relative">
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-light dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 material-symbols-outlined">expand_more</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Product Image</span>
                <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 hover:border-primary dark:hover:border-primary transition-all duration-300 overflow-hidden shadow-sm">
                   {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <span className="material-symbols-outlined text-3xl mb-1">edit</span>
                          <span className="text-xs font-bold">Change Image</span>
                        </div>
                      </>
                   ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                      <span className="text-sm font-medium">Upload Image</span>
                    </div>
                   )}
                   <input 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-text-main-light dark:text-white text-sm font-semibold">Availability</span>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-main-light dark:text-white">Active on Menu</span>
                    <span className="text-xs text-slate-500">Enable/disable this product.</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => navigate(RoutePath.PRODUCTS)}
              type="button"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
