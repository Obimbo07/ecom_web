// Database types for Supabase
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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          phone: string | null
          image: string | null
          verified: boolean
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          phone?: string | null
          image?: string | null
          verified?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          phone?: string | null
          image?: string | null
          verified?: boolean
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          title: string
          description: string | null
          image: string | null
          slug: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          image?: string | null
          slug?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          image?: string | null
          slug?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          title: string
          description: string | null
          specifications: string | null
          price: number
          old_price: number | null
          image: string | null
          images: Json
          type: string | null
          stock_count: number
          life: string | null
          category_id: number | null
          slug: string | null
          is_active: boolean
          featured: boolean
          sku: string | null
          weight: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          specifications?: string | null
          price: number
          old_price?: number | null
          image?: string | null
          images?: Json
          type?: string | null
          stock_count?: number
          life?: string | null
          category_id?: number | null
          slug?: string | null
          is_active?: boolean
          featured?: boolean
          sku?: string | null
          weight?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          specifications?: string | null
          price?: number
          old_price?: number | null
          image?: string | null
          images?: Json
          type?: string | null
          stock_count?: number
          life?: string | null
          category_id?: number | null
          slug?: string | null
          is_active?: boolean
          featured?: boolean
          sku?: string | null
          weight?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          image: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          product_id: number
          image: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          image?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
        }
      }
      product_tags: {
        Row: {
          product_id: number
          tag_id: number
        }
        Insert: {
          product_id: number
          tag_id: number
        }
        Update: {
          product_id?: number
          tag_id?: number
        }
      }
      holiday_deals: {
        Row: {
          id: number
          name: string
          description: string | null
          banner_image: string | null
          start_date: string
          end_date: string
          discount_percentage: number
          is_active: boolean
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          banner_image?: string | null
          start_date: string
          end_date: string
          discount_percentage?: number
          is_active?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          banner_image?: string | null
          start_date?: string
          end_date?: string
          discount_percentage?: number
          is_active?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_deals: {
        Row: {
          deal_id: number
          product_id: number
          discounted_price: number
          created_at: string
        }
        Insert: {
          deal_id: number
          product_id: number
          discounted_price: number
          created_at?: string
        }
        Update: {
          deal_id?: number
          product_id?: number
          discounted_price?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          cart_id: number
          product_id: number
          quantity: number
          size: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          cart_id: number
          product_id: number
          quantity: number
          size?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          cart_id?: number
          product_id?: number
          quantity?: number
          size?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          user_id: string | null
          order_number: string
          status: string
          payment_status: string
          total_amount: number
          subtotal: number
          tax: number
          shipping_cost: number
          discount: number
          shipping_address_id: number | null
          payment_method_id: number | null
          notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          order_number?: string
          status?: string
          payment_status?: string
          total_amount: number
          subtotal: number
          tax?: number
          shipping_cost?: number
          discount?: number
          shipping_address_id?: number | null
          payment_method_id?: number | null
          notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          order_number?: string
          status?: string
          payment_status?: string
          total_amount?: number
          subtotal?: number
          tax?: number
          shipping_cost?: number
          discount?: number
          shipping_address_id?: number | null
          payment_method_id?: number | null
          notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          product_title: string
          product_image: string | null
          quantity: number
          price: number
          discount_applied: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id: number
          product_title: string
          product_image?: string | null
          quantity: number
          price: number
          discount_applied?: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          product_title?: string
          product_image?: string | null
          quantity?: number
          price?: number
          discount_applied?: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
      }
      shipping_addresses: {
        Row: {
          id: number
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string | null
          postal_code: string | null
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state?: string | null
          postal_code?: string | null
          country: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string | null
          postal_code?: string | null
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: number
          user_id: string
          method_type: string
          phone_number: string
          last_four: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          method_type: string
          phone_number: string
          last_four: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          method_type?: string
          phone_number?: string
          last_four?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      checkout_sessions: {
        Row: {
          id: number
          user_id: string | null
          session_data: Json
          expires_at: string
          completed: boolean
          order_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          session_data: Json
          expires_at: string
          completed?: boolean
          order_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          session_data?: Json
          expires_at?: string
          completed?: boolean
          order_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      promocodes: {
        Row: {
          id: number
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          min_purchase_amount: number | null
          max_discount_amount: number | null
          usage_limit: number | null
          used_count: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          code: string
          description?: string | null
          discount_type?: string
          discount_value: number
          min_purchase_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          min_purchase_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: number
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          message: string
          type?: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      products_with_deals: {
        Row: {
          id: number
          title: string
          price: number
          effective_price: number
          deal_id: number | null
          deal_name: string | null
          discount_percentage: number | null
          discounted_price: number | null
        }
      }
      cart_details: {
        Row: {
          cart_id: number
          user_id: string
          cart_item_id: number
          product_id: number
          product_title: string
          product_image: string | null
          quantity: number
          size: string | null
          color: string | null
          unit_price: number
          item_total: number
        }
      }
    }
    Functions: {
      calculate_cart_total: {
        Args: { cart_id_param: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
