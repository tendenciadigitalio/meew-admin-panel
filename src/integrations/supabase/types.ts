export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string | null
          delivery_instructions: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country: string
          created_at?: string | null
          delivery_instructions?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          delivery_instructions?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_menu_icons: {
        Row: {
          active_icon_url: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_visible: boolean | null
          label: string
          menu_key: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          active_icon_url?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          menu_key: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          active_icon_url?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          menu_key?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_type: string
          link_value: string | null
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_type?: string
          link_value?: string | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_type?: string
          link_value?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string | null
          color: string | null
          created_at: string | null
          id: string
          price_at_addition: number
          product_id: string
          quantity: number
          size: string | null
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          price_at_addition: number
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          price_at_addition?: number
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_category_ids: string[] | null
          applicable_product_ids: string[] | null
          applicable_to: string | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          maximum_uses: number | null
          min_purchase: number | null
          minimum_purchase: number | null
          updated_at: string | null
          uses_per_customer: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_category_ids?: string[] | null
          applicable_product_ids?: string[] | null
          applicable_to?: string | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          maximum_uses?: number | null
          min_purchase?: number | null
          minimum_purchase?: number | null
          updated_at?: string | null
          uses_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_category_ids?: string[] | null
          applicable_product_ids?: string[] | null
          applicable_to?: string | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          maximum_uses?: number | null
          min_purchase?: number | null
          minimum_purchase?: number | null
          updated_at?: string | null
          uses_per_customer?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      free_shipping_dates: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          min_amount: number | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          min_amount?: number | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          min_amount?: number | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meew_cloud_files: {
        Row: {
          category: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          public_url: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          public_url?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          error_message: string | null
          fcm_token: string | null
          id: string
          sent_at: string | null
          status: string | null
          template_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          fcm_token?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          template_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          fcm_token?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          template_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_template: string
          created_at: string | null
          data_schema: Json | null
          id: string
          is_active: boolean | null
          title_template: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body_template: string
          created_at?: string | null
          data_schema?: Json | null
          id?: string
          is_active?: boolean | null
          title_template: string
          type: string
          updated_at?: string | null
        }
        Update: {
          body_template?: string
          created_at?: string | null
          data_schema?: Json | null
          id?: string
          is_active?: boolean | null
          title_template?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_type: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          review_submitted: boolean | null
          subtotal: number
          unit_price: number
          variant_color: string | null
          variant_id: string | null
          variant_size: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          review_submitted?: boolean | null
          subtotal: number
          unit_price: number
          variant_color?: string | null
          variant_id?: string | null
          variant_size?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          review_submitted?: boolean | null
          subtotal?: number
          unit_price?: number
          variant_color?: string | null
          variant_id?: string | null
          variant_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          carrier: string | null
          coupon_code: string | null
          coupon_id: string | null
          created_at: string | null
          customer_notes: string | null
          delivered_at: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          id: string
          order_number: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_method_id: string | null
          refunded_at: string | null
          shipping_address_line_1: string
          shipping_address_line_2: string | null
          shipping_amount: number | null
          shipping_city: string
          shipping_country: string
          shipping_full_name: string
          shipping_instructions: string | null
          shipping_method: string | null
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          carrier?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          refunded_at?: string | null
          shipping_address_line_1: string
          shipping_address_line_2?: string | null
          shipping_amount?: number | null
          shipping_city: string
          shipping_country: string
          shipping_full_name: string
          shipping_instructions?: string | null
          shipping_method?: string | null
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          carrier?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          refunded_at?: string | null
          shipping_address_line_1?: string
          shipping_address_line_2?: string | null
          shipping_amount?: number | null
          shipping_city?: string
          shipping_country?: string
          shipping_full_name?: string
          shipping_instructions?: string | null
          shipping_method?: string | null
          shipping_phone?: string
          shipping_postal_code?: string
          shipping_state?: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string
          created_at: string | null
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean | null
          last_4: string
          stripe_payment_method_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand: string
          created_at?: string | null
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean | null
          last_4: string
          stripe_payment_method_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string
          created_at?: string | null
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean | null
          last_4?: string
          stripe_payment_method_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pop_ups: {
        Row: {
          created_at: string | null
          cta_text: string | null
          cta_type: string | null
          cta_value: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_full_screen_image: boolean | null
          priority: number | null
          start_date: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          cta_type?: string | null
          cta_value?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_full_screen_image?: boolean | null
          priority?: number | null
          start_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          cta_type?: string | null
          cta_value?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_full_screen_image?: boolean | null
          priority?: number | null
          start_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      popular_searches: {
        Row: {
          id: string
          query: string
          total_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          query: string
          total_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          query?: string
          total_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_hex: string | null
          color_name: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_override: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_override?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_override?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          brand: string | null
          care_instructions: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          gender: string | null
          height_cm: number | null
          id: string
          is_featured: boolean | null
          is_new: boolean | null
          keywords: string | null
          length_cm: number | null
          low_stock_threshold: number | null
          manage_stock: boolean | null
          material: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          regular_price: number
          sale_price: number | null
          sales_count: number | null
          season: string | null
          short_description: string | null
          sku: string
          slug: string
          status: string | null
          stock_quantity: number | null
          updated_at: string | null
          views_count: number | null
          weight_grams: number | null
          width_cm: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          brand?: string | null
          care_instructions?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          keywords?: string | null
          length_cm?: number | null
          low_stock_threshold?: number | null
          manage_stock?: boolean | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          regular_price: number
          sale_price?: number | null
          sales_count?: number | null
          season?: string | null
          short_description?: string | null
          sku: string
          slug: string
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          views_count?: number | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          brand?: string | null
          care_instructions?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          keywords?: string | null
          length_cm?: number | null
          low_stock_threshold?: number | null
          manage_stock?: boolean | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          regular_price?: number
          sale_price?: number | null
          sales_count?: number | null
          season?: string | null
          short_description?: string | null
          sku?: string
          slug?: string
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          views_count?: number | null
          weight_grams?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_notifications: {
        Row: {
          action_type: string
          action_value: string | null
          body: string
          created_at: string | null
          created_by: string | null
          failed_sends: number | null
          id: string
          image_url: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          successful_sends: number | null
          target_audience: string
          target_gender: string | null
          title: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          action_type?: string
          action_value?: string | null
          body: string
          created_at?: string | null
          created_by?: string | null
          failed_sends?: number | null
          id?: string
          image_url?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          successful_sends?: number | null
          target_audience?: string
          target_gender?: string | null
          title: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          action_value?: string | null
          body?: string
          created_at?: string | null
          created_by?: string | null
          failed_sends?: number | null
          id?: string
          image_url?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          successful_sends?: number | null
          target_audience?: string
          target_gender?: string | null
          title?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link_category_id: string | null
          link_external_url: string | null
          link_product_id: string | null
          link_type: string | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_category_id?: string | null
          link_external_url?: string | null
          link_product_id?: string | null
          link_type?: string | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_category_id?: string | null
          link_external_url?: string | null
          link_product_id?: string | null
          link_type?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_banners_link_category_id_fkey"
            columns: ["link_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_banners_link_product_id_fkey"
            columns: ["link_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      review_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_images_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          responded_by: string
          response: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          responded_by: string
          response: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          responded_by?: string
          response?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          helpful_count: number | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          order_item_id: string | null
          product_id: string
          rating: number
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          order_item_id?: string | null
          product_id: string
          rating: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          order_item_id?: string | null
          product_id?: string
          rating?: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          id: string
          query: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          shipment_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          shipment_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          shipment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          label_url: string | null
          order_id: string | null
          problem_notes: string | null
          problem_type: string | null
          shipped_at: string | null
          shipping_cost: number
          shipping_method: string
          status: string
          tracking_number: string | null
          updated_at: string | null
          warehouse: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          label_url?: string | null
          order_id?: string | null
          problem_notes?: string | null
          problem_type?: string | null
          shipped_at?: string | null
          shipping_cost?: number
          shipping_method: string
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          label_url?: string | null
          order_id?: string | null
          problem_notes?: string | null
          problem_type?: string | null
          shipped_at?: string | null
          shipping_cost?: number
          shipping_method?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      size_guides: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          measurements: Json
          name: string
          sizes: Json
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          measurements?: Json
          name: string
          sizes?: Json
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          measurements?: Json
          name?: string
          sizes?: Json
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "size_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_type: string | null
          fcm_token: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          fcm_token: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          fcm_token?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          language: string | null
          last_login_at: string | null
          marketing_emails_enabled: boolean | null
          notifications_enabled: boolean | null
          phone: string | null
          role: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          language?: string | null
          last_login_at?: string | null
          marketing_emails_enabled?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          marketing_emails_enabled?: boolean | null
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_active_fcm_tokens: {
        Args: never
        Returns: {
          device_type: string
          fcm_token: string
          user_id: string
        }[]
      }
      get_category_tree: {
        Args: never
        Returns: {
          children: Json
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string
          is_featured: boolean
          name: string
          parent_id: string
          slug: string
        }[]
      }
      get_conversion_metrics: { Args: never; Returns: Json }
      get_notification_recipients: {
        Args: { p_target_audience: string; p_target_gender?: string }
        Returns: {
          device_type: string
          fcm_token: string
          user_id: string
        }[]
      }
      get_product_rating_stats: {
        Args: { p_product_id: string }
        Returns: {
          average_rating: number
          rating_1: number
          rating_2: number
          rating_3: number
          rating_4: number
          rating_5: number
          total_reviews: number
        }[]
      }
      get_product_reviews: {
        Args: { p_limit?: number; p_offset?: number; p_product_id: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          rating: number
          title: string
          user_email: string
          user_name: string
        }[]
      }
      get_recent_activity: {
        Args: { p_limit?: number }
        Returns: {
          activity_type: string
          created_at: string
          description: string
          metadata: Json
        }[]
      }
      get_sales_by_category: {
        Args: never
        Returns: {
          category_name: string
          percentage: number
          total_sales: number
        }[]
      }
      get_sales_by_period: {
        Args: { p_period?: string; p_start_date?: string }
        Returns: {
          order_count: number
          period_label: string
          total_sales: number
        }[]
      }
      get_subcategories: {
        Args: { parent_category_id: string }
        Returns: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "categories"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_top_selling_products: {
        Args: { p_limit?: number }
        Returns: {
          product_id: string
          product_image: string
          product_name: string
          total_revenue: number
          total_sold: number
        }[]
      }
      get_user_fcm_tokens: {
        Args: { p_user_id: string }
        Returns: {
          device_type: string
          fcm_token: string
        }[]
      }
      increment_coupon_usage: {
        Args: { coupon_id: string }
        Returns: undefined
      }
      is_free_shipping_active: {
        Args: { cart_total: number }
        Returns: boolean
      }
      update_promo_notification_stats: {
        Args: {
          p_failed: number
          p_notification_id: string
          p_successful: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
