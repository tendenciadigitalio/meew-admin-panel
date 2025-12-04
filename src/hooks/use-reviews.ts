import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  title: string | null;
  status: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  moderation_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  helpful_count: number | null;
  order_item_id: string | null;
  // Joined fields
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  product_image?: string | null;
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      // First get reviews with product info
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select(`
          *,
          product:products(id, name, slug)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Now fetch user info and product images
      const reviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          // Get user info
          let userInfo = null;
          if (review.user_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("id, email, full_name")
              .eq("id", review.user_id)
              .maybeSingle();
            userInfo = userData;
          }
          
          // Get product image
          let productImage = null;
          if (review.product?.id) {
            const { data: images } = await supabase
              .from("product_images")
              .select("image_url")
              .eq("product_id", review.product.id)
              .eq("is_primary", true)
              .limit(1);
            
            if (images && images.length > 0) {
              productImage = images[0].image_url;
            }
          }
          
          return {
            ...review,
            user: userInfo,
            product_image: productImage
          } as Review;
        })
      );
      
      return reviews;
    },
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["reviews", "stats"],
    queryFn: async () => {
      // Get pending count
      const { count: pendingCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get all approved reviews for average rating
      const { data: approvedReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("status", "approved");

      const avgRating = approvedReviews && approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

      // Get reviews this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      return {
        pendingCount: pendingCount || 0,
        averageRating: avgRating,
        monthCount: monthCount || 0,
      };
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("reviews")
        .update({
          status: "approved",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
        })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Reseña aprobada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al aprobar la reseña: " + error.message);
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("reviews")
        .update({
          status: "rejected",
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
          moderation_notes: reason,
        })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Reseña rechazada");
    },
    onError: (error) => {
      toast.error("Error al rechazar la reseña: " + error.message);
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Reseña eliminada");
    },
    onError: (error) => {
      toast.error("Error al eliminar la reseña: " + error.message);
    },
  });
}
