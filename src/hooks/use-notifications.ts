import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PromoNotification = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  target_audience: string;
  target_gender: string | null;
  action_type: string;
  action_value: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: string;
  total_recipients: number | null;
  successful_sends: number | null;
  failed_sends: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
};

export function useNotifications() {
  return useQuery({
    queryKey: ["promo-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PromoNotification[];
    },
  });
}

export type CreateNotificationData = {
  title: string;
  body: string;
  image_url?: string | null;
  target_audience: string;
  target_gender?: string | null;
  action_type: string;
  action_value?: string | null;
  scheduled_at?: string | null;
  status: string;
};

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: CreateNotificationData) => {
      const { data, error } = await supabase
        .from("promo_notifications")
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data as PromoNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-notifications"] });
      toast.success("Notificación creada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear notificación: " + error.message);
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...notification
    }: Partial<PromoNotification> & { id: string }) => {
      const { data, error } = await supabase
        .from("promo_notifications")
        .update(notification)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-notifications"] });
      toast.success("Notificación actualizada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar notificación: " + error.message);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("promo_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-notifications"] });
      toast.success("Notificación eliminada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar notificación: " + error.message);
    },
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "send-promo-notification",
        {
          body: { notification_id: notificationId },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-notifications"] });
      toast.success("Notificación enviada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al enviar notificación: " + error.message);
    },
  });
}
