import { Category, MenuItem } from "./types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Burgers",
    description: "Juicy beef, chicken, and vegan burger options.",
    imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop",
    status: "Active"
  },
  {
    id: "2",
    name: "Pizzas",
    description: "Authentic Italian wood-fired pizzas.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
    status: "Active"
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "#MB-001",
    name: "Classic Cheeseburger",
    description: "Premium beef patty, cheddar cheese, fresh lettuce, tomatoes, and house sauce.",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
    category: "Burgers",
    status: "In Stock"
  }
];
