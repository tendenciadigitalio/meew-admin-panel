import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy, Trash2, Eye, Search } from "lucide-react";
import { useCloudFiles, useDeleteFile, useBatchDeleteFiles, type CloudFile } from "@/hooks/use-cloud-files";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function MyAssetsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CloudFile | null>(null);

  const { data: files = [], isLoading } = useCloudFiles({
    category: categoryFilter,
    search: searchTerm,
  });

  const deleteFile = useDeleteFile();
  const batchDelete = useBatchDeleteFiles();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "La URL se copió al portapapeles",
    });
  };

  const handleDeleteClick = (file: CloudFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteFile.mutate(fileToDelete);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleBatchDelete = () => {
    const filesToDelete = files.filter((f) => selectedFiles.has(f.id));
    batchDelete.mutate(filesToDelete, {
      onSuccess: () => {
        setSelectedFiles(new Set());
      },
    });
  };

  const handleCopySelectedUrls = () => {
    const urls = files
      .filter((f) => selectedFiles.has(f.id))
      .map((f) => `- [${f.file_name}](${f.public_url})`)
      .join("\n");
    navigator.clipboard.writeText(urls);
    toast({
      title: "URLs copiadas",
      description: `${selectedFiles.size} URLs copiadas al portapapeles`,
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileThumbnail = (file: CloudFile) => {
    if (file.mime_type?.startsWith("image/")) {
      return (
        <img
          src={file.public_url || ""}
          alt={file.file_name}
          className="w-12 h-12 object-cover rounded"
        />
      );
    }
    if (file.mime_type?.startsWith("video/")) {
      return (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
          🎥
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
        📄
      </div>
    );
  };

  const getCategoryBadge = (category: string | null) => {
    const colors: Record<string, string> = {
      images: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      videos: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      docs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      misc: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };

    return (
      <Badge className={colors[category || "misc"] || colors.misc}>
        {category || "misc"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="images">Imágenes</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="docs">Documentos</SelectItem>
            <SelectItem value="misc">Otros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch Actions */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedFiles.size} archivo(s) seleccionado(s)
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySelectedUrls}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar URLs
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={batchDelete.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle">
                  <Checkbox
                    checked={
                      files.length > 0 && selectedFiles.size === files.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Preview
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nombre
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tamaño
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Fecha
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No hay archivos para mostrar
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => handleSelectFile(file.id)}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      {getFileThumbnail(file)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium">{file.file_name}</span>
                    </td>
                    <td className="p-4 align-middle">
                      {getCategoryBadge(file.category)}
                    </td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {format(new Date(file.created_at), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(file.public_url || "", "_blank")
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(file.public_url || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo{" "}
              <strong>{fileToDelete?.file_name}</strong> será eliminado
              permanentemente del almacenamiento y la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
