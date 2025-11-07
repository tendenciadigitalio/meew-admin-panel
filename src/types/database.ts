import { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type User = Tables<"users">;
export type Category = Tables<"categories">;
export type ProductVariant = Tables<"product_variants">;
export type ProductImage = Tables<"product_images">;

export type OrderWithItems = Order & {
  order_items: OrderItem[];
  user: User;
};

export type ProductWithRelations = Product & {
  category: Category | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};
