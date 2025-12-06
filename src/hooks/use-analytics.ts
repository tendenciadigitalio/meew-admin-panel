import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalesData {
  period_label: string;
  total_sales: number;
  order_count: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  product_image: string | null;
  total_sold: number;
  total_revenue: number;
}

export interface CategorySales {
  category_name: string;
  total_sales: number;
  percentage: number;
}

export interface ConversionMetrics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_today: number;
  revenue_today: number;
  pending_orders: number;
  processing_orders: number;
}

export interface RecentActivity {
  activity_type: 'order' | 'review';
  description: string;
  created_at: string;
  metadata: Record<string, any>;
}

export function useSalesByPeriod(period: 'week' | 'month' | 'year' = 'month') {
  const startDate = period === 'week'
    ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : period === 'month'
    ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  return useQuery({
    queryKey: ["sales-by-period", period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sales_by_period" as any, {
        p_period: period,
        p_start_date: startDate.toISOString().split('T')[0],
      });
      if (error) throw error;
      return (data || []) as unknown as SalesData[];
    },
  });
}

export function useTopSellingProducts(limit = 5) {
  return useQuery({
    queryKey: ["top-selling-products", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_top_selling_products" as any, {
        p_limit: limit,
      });
      if (error) throw error;
      return (data || []) as unknown as TopProduct[];
    },
  });
}

export function useSalesByCategory() {
  return useQuery({
    queryKey: ["sales-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sales_by_category" as any);
      if (error) throw error;
      return (data || []) as unknown as CategorySales[];
    },
  });
}

export function useConversionMetrics() {
  return useQuery({
    queryKey: ["conversion-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_conversion_metrics" as any);
      if (error) throw error;
      return data as unknown as ConversionMetrics;
    },
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_recent_activity" as any, {
        p_limit: limit,
      });
      if (error) throw error;
      return (data || []) as unknown as RecentActivity[];
    },
  });
}
