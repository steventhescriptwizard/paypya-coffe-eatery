export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: 'Active' | 'Inactive' | 'Draft' | 'Archived';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export enum RoutePath {
  DASHBOARD = '/dashboard',
  CATEGORIES = '/dashboard/categories',
  CATEGORY_CREATE = '/dashboard/categories/new',
  CATEGORY_EDIT = '/dashboard/categories/:id/edit',
  PRODUCTS = '/dashboard/products',
  PRODUCT_CREATE = '/dashboard/products/new',
  PRODUCT_EDIT = '/dashboard/products/:id/edit',
  ORDERS = '/dashboard/orders',
  QR_GENERATOR = '/dashboard/qr-generator',
  SETTINGS = '/dashboard/settings',
  LOGIN = '/login',
  REGISTER = '/register',
}
