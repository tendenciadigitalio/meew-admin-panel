import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CloudFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  category: string | null;
  public_url: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface UploadFileParams {
  file: File;
  category: string;
  saveToDatabase: boolean;
}

// Fetch all cloud files with filters
export function useCloudFiles(filters?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["cloud-files", filters],
    queryFn: async () => {
      let query = supabase
        .from("meew_cloud_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.search) {
        query = query.ilike("file_name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CloudFile[];
    },
  });
}

// Upload file to storage
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, category, saveToDatabase }: UploadFileParams) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${category}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("meew_cloud")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("meew_cloud").getPublicUrl(filePath);

      // Save to database if requested
      if (saveToDatabase) {
        const { data: user } = await supabase.auth.getUser();
        
        const { error: dbError } = await supabase
          .from("meew_cloud_files")
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            category,
            public_url: publicUrl,
            uploaded_by: user.user?.id,
          });

        if (dbError) throw dbError;
      }

      return { publicUrl, filePath, fileName: file.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-files"] });
    },
  });
}

// Delete file from storage and database
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: CloudFile) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("meew_cloud")
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("meew_cloud_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-files"] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo se eliminó correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Batch delete files
export function useBatchDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: CloudFile[]) => {
      // Delete from storage
      const filePaths = files.map((f) => f.file_path);
      const { error: storageError } = await supabase.storage
        .from("meew_cloud")
        .remove(filePaths);

      if (storageError) throw storageError;

      // Delete from database
      const fileIds = files.map((f) => f.id);
      const { error: dbError } = await supabase
        .from("meew_cloud_files")
        .delete()
        .in("id", fileIds);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-files"] });
      toast({
        title: "Archivos eliminados",
        description: "Los archivos se eliminaron correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
