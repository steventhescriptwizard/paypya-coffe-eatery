import React, { useState, useEffect } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, deleteProductImage } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import type { DbProduct, DbCategory } from '../../lib/database.types';
import { formatIDR } from '../../utils/format';

export function ProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    image_url: '',
    badge: '',
    rating: null as number | null,
    calories: null as number | null,
    tags: [] as string[],
    is_available: true,
  });

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
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(product?: DbProduct) {
    if (product) {
      setEditingProduct(product);
      setFormData({
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        badge: product.badge || '',
        rating: product.rating,
        calories: product.calories,
        tags: product.tags || [],
        is_available: product.is_available,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        price: 0,
        image_url: '',
        badge: '',
        rating: null,
        calories: null,
        tags: [],
        is_available: true,
      });
    }
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadProductImage(file);
      setFormData({ ...formData, image_url: imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        badge: formData.badge || null,
        rating: formData.rating || null,
        calories: formData.calories || null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  }

  async function handleDelete(product: DbProduct) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // Delete image from storage if it exists
      if (product.image_url) {
        await deleteProductImage(product.image_url);
      }
      
      await deleteProduct(product.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

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
          <h1 className="text-3xl font-black text-text-main dark:text-white">Products</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Manage menu items</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Add Product
        </button>
      </div>

      {/* Filter by category */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-[#2c241b] text-text-main dark:text-white border border-[#e6e0db] dark:border-white/10'
          }`}
        >
          All ({products.length})
        </button>
        {categories.map((category) => {
          const count = products.filter(p => p.category_id === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-[#2c241b] text-text-main dark:text-white border border-[#e6e0db] dark:border-white/10'
              }`}
            >
              {category.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const category = categories.find(c => c.id === product.category_id);
          return (
            <div key={product.id} className="bg-white dark:bg-[#2c241b] rounded-xl border border-[#e6e0db] dark:border-white/10 overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                    {product.badge}
                  </div>
                )}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Unavailable</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-text-main dark:text-white">{product.name}</h3>
                  <span className="text-primary font-bold">{formatIDR(product.price)}</span>
                </div>
                
                <p className="text-sm text-text-secondary dark:text-gray-400 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-text-secondary dark:text-gray-400">
                    {category?.name}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-yellow-500" style={{ fontSize: '16px' }}>star</span>
                      <span className="text-text-secondary dark:text-gray-400">{product.rating}</span>
                    </div>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-[#e6e0db] dark:border-white/10">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span className="text-sm font-semibold">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span className="text-sm font-semibold">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-text-secondary dark:text-gray-500 opacity-20">restaurant_menu</span>
          <p className="text-text-secondary dark:text-gray-400 mt-4">No products found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#2c241b] rounded-xl max-w-3xl w-full my-8">
            <div className="p-6 border-b border-[#e6e0db] dark:border-white/10">
              <h2 className="text-2xl font-black text-text-main dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Product Image
                  </label>
                  <div className="flex gap-4">
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
                      <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                        Max 5MB. Supported: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
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

                <div className="col-span-2">
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
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Best Seller, New"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Rating (optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Calories (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2 rounded-lg border border-[#e6e0db] dark:border-white/10 bg-white dark:bg-[#1a1410] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Spicy, Vegan, Gluten-Free"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
                    />
                    <span className="text-sm font-bold text-text-main dark:text-white">
                      Available for order
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || !formData.image_url}
                  className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingProduct ? 'Update' : 'Create'}
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
