// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          description: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon: string
          description: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          description?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string
          price: number
          image_url: string
          badge: string | null
          rating: number | null
          calories: number | null
          tags: string[] | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description: string
          price: number
          image_url: string
          badge?: string | null
          rating?: number | null
          calories?: number | null
          tags?: string[] | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          badge?: string | null
          rating?: number | null
          calories?: number | null
          tags?: string[] | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          total_amount: number
          status: string
          table_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name?: string
          total_amount: number
          status?: string
          table_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          total_amount?: number
          status?: string
          table_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          phone: string
          email: string
          image_url: string
          map_url: string
          hours: Json
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          phone: string
          email: string
          image_url: string
          map_url: string
          hours?: Json
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          phone?: string
          email?: string
          image_url?: string
          map_url?: string
          hours?: Json
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}

// Convenience type exports
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbProduct = Database['public']['Tables']['products']['Row'];

