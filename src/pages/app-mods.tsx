import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, RotateCcw, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useAppMenuIcons,
  useUpdateAppMenuIcon,
  useBatchUpdateAppMenuIcons,
  useResetAppMenuIcon,
  uploadMenuIcon,
  type AppMenuIcon,
  type AppMenuIconUpdate,
} from "@/hooks/use-app-menu-icons";

export default function AppMods() {
  const { data: menuIcons = [], isLoading } = useAppMenuIcons();
  const updateIcon = useUpdateAppMenuIcon();
  const batchUpdate = useBatchUpdateAppMenuIcons();
  const resetIcon = useResetAppMenuIcon();

  const [localChanges, setLocalChanges] = useState<
    Record<string, AppMenuIconUpdate>
  >({});
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<{
    id: string;
    menuKey: string;
    type: "active" | "inactive";
  } | null>(null);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);

  const [iconUrl, setIconUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalChange = (id: string, updates: AppMenuIconUpdate) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const getMergedIcon = (icon: AppMenuIcon): AppMenuIcon => {
    if (localChanges[icon.id]) {
      return { ...icon, ...localChanges[icon.id] };
    }
    return icon;
  };

  const handleOpenIconModal = (
    id: string,
    menuKey: string,
    type: "active" | "inactive"
  ) => {
    setSelectedIcon({ id, menuKey, type });
    setIconUrl("");
    setPreviewUrl(null);
    setIconModalOpen(true);
  };

  const handleSaveIconUrl = () => {
    if (!selectedIcon || !iconUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      });
      return;
    }

    const field =
      selectedIcon.type === "active" ? "active_icon_url" : "icon_url";
    handleLocalChange(selectedIcon.id, { [field]: iconUrl.trim() });
    setIconModalOpen(false);
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedIcon) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      toast({
        title: "Formato inválido",
        description: "Solo se permiten archivos PNG y SVG",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500 KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo es 500 KB",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    try {
      const publicUrl = await uploadMenuIcon(
        file,
        selectedIcon.menuKey,
        selectedIcon.type
      );

      const field =
        selectedIcon.type === "active" ? "active_icon_url" : "icon_url";
      handleLocalChange(selectedIcon.id, { [field]: publicUrl });

      toast({
        title: "Ícono subido",
        description: "El archivo se subió correctamente",
      });

      setIconModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al subir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleResetConfirm = () => {
    if (resetTargetId) {
      resetIcon.mutate(resetTargetId);
      setResetDialogOpen(false);
      setResetTargetId(null);
    }
  };

  const handleSaveAll = () => {
    const updates = Object.entries(localChanges).map(([id, updates]) => ({
      id,
      updates,
    }));

    if (updates.length === 0) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios para guardar",
      });
      return;
    }

    // Validate at least one item is visible
    const allIcons = menuIcons.map((icon) => getMergedIcon(icon));
    const visibleCount = allIcons.filter((icon) => icon.is_visible).length;

    if (visibleCount === 0) {
      toast({
        title: "Error de validación",
        description: "Al menos un ítem debe estar visible",
        variant: "destructive",
      });
      return;
    }

    // Validate no duplicate order_index
    const orderIndexes = allIcons.map((icon) => icon.order_index);
    const hasDuplicates = orderIndexes.length !== new Set(orderIndexes).size;

    if (hasDuplicates) {
      toast({
        title: "Error de validación",
        description: "No puede haber órdenes duplicados",
        variant: "destructive",
      });
      return;
    }

    batchUpdate.mutate(updates, {
      onSuccess: () => {
        setLocalChanges({});
      },
    });
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Mods</h1>
        <p className="text-muted-foreground">
          Personaliza los iconos del menú de navegación de la app
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Orden
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Menú
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ícono Inactivo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ícono Activo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Etiqueta
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Visible
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {menuIcons.map((icon) => {
                const merged = getMergedIcon(icon);
                return (
                  <tr key={icon.id} className="border-b">
                    <td className="p-4 align-middle">
                      <Input
                        type="number"
                        min="0"
                        value={merged.order_index}
                        onChange={(e) =>
                          handleLocalChange(icon.id, {
                            order_index: parseInt(e.target.value),
                          })
                        }
                        className="w-20"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium">{merged.menu_key}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {merged.icon_url ? (
                          <img
                            src={merged.icon_url}
                            alt="Inactive icon"
                            className="h-6 w-6 rounded border"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded border border-dashed flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              M
                            </span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenIconModal(icon.id, icon.menu_key, "inactive")
                          }
                        >
                          Cambiar
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {merged.active_icon_url ? (
                          <img
                            src={merged.active_icon_url}
                            alt="Active icon"
                            className="h-6 w-6 rounded border"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded border border-dashed flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              M
                            </span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenIconModal(icon.id, icon.menu_key, "active")
                          }
                        >
                          Cambiar
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Input
                        value={merged.label}
                        onChange={(e) =>
                          handleLocalChange(icon.id, { label: e.target.value })
                        }
                        className="w-full max-w-[200px]"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <Switch
                        checked={merged.is_visible}
                        onCheckedChange={(checked) =>
                          handleLocalChange(icon.id, { is_visible: checked })
                        }
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResetTargetId(icon.id);
                          setResetDialogOpen(true);
                        }}
                        disabled={resetIcon.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAll}
          disabled={
            Object.keys(localChanges).length === 0 || batchUpdate.isPending
          }
        >
          {batchUpdate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar todos los cambios
            </>
          )}
        </Button>
      </div>

      {/* Icon Change Modal */}
      <Dialog open={iconModalOpen} onOpenChange={setIconModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cambiar Ícono</DialogTitle>
            <DialogDescription>
              Selecciona una URL directa o sube un archivo PNG/SVG
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">URL Directa</TabsTrigger>
              <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="icon-url">URL del Ícono</Label>
                <Input
                  id="icon-url"
                  type="url"
                  placeholder="https://ejemplo.com/icono.png"
                  value={iconUrl}
                  onChange={(e) => {
                    setIconUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-12 w-12"
                      onError={() => setPreviewUrl(null)}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra un archivo aquí o haz click para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG o SVG • Máximo 500 KB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>

              {uploadingFile && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm">Subiendo archivo...</span>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIconModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveIconUrl} disabled={uploadingFile}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Volver a iconos por defecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará los iconos personalizados y la app usará Material
              Icons automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm}>
              Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
