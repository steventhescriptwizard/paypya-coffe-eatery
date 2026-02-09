import type { Database } from './lib/database.types';

export type ViewType = 'menu' | 'cart' | 'locations' | 'contact' | 'orders' | 'invoice';

// Database types
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbProduct = Database['public']['Tables']['products']['Row'];

// Legacy type for backward compatibility
export type CategoryId = string;

export interface Category {
  id: string;
  label: string;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  rating?: number;
  calories?: number;
  tags?: string[];
  badge?: string;
  isAvailable?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'sent' | 'Pending' | 'Cooking' | 'Completed' | 'Cancelled';
  customerName?: string;
  tableNumber?: string;
  paymentMethod?: 'cashier' | 'wa_checkout';
  order_number?: string;
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';
}

// Helper functions to convert database types to app types
export function dbCategoryToCategory(dbCat: DbCategory): Category {
  return {
    id: dbCat.id,
    label: dbCat.name,
    slug: dbCat.slug,
    icon: dbCat.icon,
    description: dbCat.description,
    displayOrder: dbCat.display_order,
  };
}

export function dbProductToMenuItem(dbProd: DbProduct): MenuItem {
  return {
    id: dbProd.id,
    name: dbProd.name,
    description: dbProd.description,
    price: dbProd.price,
    image: dbProd.image_url,
    categoryId: dbProd.category_id,
    rating: dbProd.rating ?? undefined,
    calories: dbProd.calories ?? undefined,
    tags: dbProd.tags ?? undefined,
    badge: dbProd.badge ?? undefined,
    isAvailable: dbProd.is_available,
  };
}
