import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  Upload, Loader2, Trash2, GripVertical, Image as ImageIcon, Plus,
  Smartphone, Play, FileJson, Info, Move, Maximize2, Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useAppBranding, useCreateBranding, useUpdateBranding, useDeleteBranding,
  useBatchUpdateOrder, uploadBrandingImage, type AppBranding,
} from "@/hooks/use-app-branding";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMediaType(url: string): "video" | "lottie" | "image" {
  const lower = url.toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".mov")) return "video";
  if (lower.endsWith(".json") || lower.endsWith(".lottie")) return "lottie";
  return "image";
}

function defaultLayout() {
  return { media_x: 0, media_y: 0, media_width: 100, media_height: 100, media_opacity: 1, media_fit: "cover" as const };
}

function resolveLayout(item: AppBranding) {
  return {
    media_x:       item.media_x       ?? 0,
    media_y:       item.media_y       ?? 0,
    media_width:   item.media_width   ?? 100,
    media_height:  item.media_height  ?? 100,
    media_opacity: item.media_opacity ?? 1,
    media_fit:     item.media_fit     ?? "cover",
  };
}

// ── Phone Canvas Preview ──────────────────────────────────────────────────────

function PhonePreview({
  url, x, y, width, height, opacity, fit,
}: {
  url: string | null; x: number; y: number; width: number; height: number;
  opacity: number; fit: string;
}) {
  const type = url ? getMediaType(url) : null;

  return (
    <div className="relative w-[120px] flex-shrink-0">
      {/* Phone frame */}
      <div className="aspect-[9/16] rounded-[18px] border-4 border-foreground/20 bg-black overflow-hidden relative">
        {/* Media positioned on canvas */}
        {url && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}%`,
              height: `${height}%`,
              opacity,
            }}
          >
            {type === "video" ? (
              <video src={url} className="w-full h-full" style={{ objectFit: fit as any }} autoPlay loop muted playsInline />
            ) : type === "lottie" ? (
              <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
            ) : (
              <img src={url} className="w-full h-full" style={{ objectFit: fit as any }} alt="preview" />
            )}
          </div>
        )}
        {!url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white/30" />
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1">Preview</p>
    </div>
  );
}

// ── Layout Controls ───────────────────────────────────────────────────────────

interface LayoutState {
  media_x: number;
  media_y: number;
  media_width: number;
  media_height: number;
  media_opacity: number;
  media_fit: "cover" | "contain" | "fill";
}

function LayoutControls({
  layout,
  onChange,
}: {
  layout: LayoutState;
  onChange: (updates: Partial<LayoutState>) => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      {/* Position */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Move className="h-3 w-3" /> Posición
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">X (izquierda)</Label>
              <span className="text-xs font-mono text-muted-foreground">{layout.media_x}%</span>
            </div>
            <Slider min={0} max={100} step={1} value={[layout.media_x]}
              onValueChange={([v]) => onChange({ media_x: v })} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Y (arriba)</Label>
              <span className="text-xs font-mono text-muted-foreground">{layout.media_y}%</span>
            </div>
            <Slider min={0} max={100} step={1} value={[layout.media_y]}
              onValueChange={([v]) => onChange({ media_y: v })} />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Maximize2 className="h-3 w-3" /> Tamaño
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Ancho</Label>
              <span className="text-xs font-mono text-muted-foreground">{layout.media_width}%</span>
            </div>
            <Slider min={5} max={100} step={1} value={[layout.media_width]}
              onValueChange={([v]) => onChange({ media_width: v })} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Alto</Label>
              <span className="text-xs font-mono text-muted-foreground">{layout.media_height}%</span>
            </div>
            <Slider min={5} max={100} step={1} value={[layout.media_height]}
              onValueChange={([v]) => onChange({ media_height: v })} />
          </div>
        </div>
      </div>

      {/* Opacity + Fit */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1"><Eye className="h-3 w-3" /> Opacidad</Label>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(layout.media_opacity * 100)}%</span>
          </div>
          <Slider min={0} max={1} step={0.01} value={[layout.media_opacity]}
            onValueChange={([v]) => onChange({ media_opacity: v })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Ajuste</Label>
          <Select value={layout.media_fit} onValueChange={(v: any) => onChange({ media_fit: v })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (recortar)</SelectItem>
              <SelectItem value="contain">Contain (encajar)</SelectItem>
              <SelectItem value="fill">Fill (estirar)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground h-7"
        onClick={() => onChange(defaultLayout())}
      >
        Resetear posición
      </Button>
    </div>
  );
}

// ── Media Preview (thumbnail) ─────────────────────────────────────────────────

function MediaPreview({ url, alt }: { url: string; alt: string }) {
  const type = getMediaType(url);
  if (type === "video") {
    return (
      <div className="relative w-full h-full">
        <video src={url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
        <div className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5">
          <Play className="h-3 w-3 text-white" />
        </div>
      </div>
    );
  }
  if (type === "lottie") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50">
        <FileJson className="h-8 w-8 text-primary mb-1" />
        <span className="text-[10px] text-muted-foreground font-mono">Lottie</span>
      </div>
    );
  }
  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
}

// ── File validation ───────────────────────────────────────────────────────────

const FILE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,video/mp4,application/json,.lottie";
const SIZE_LIMITS: Record<string, number> = {
  "video/mp4": 5 * 1024 * 1024,
  "application/json": 500 * 1024,
  default: 2 * 1024 * 1024,
};

function validateFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const isLottie = ext === ".lottie" || ext === ".json";
  const accepted = ["image/jpeg","image/png","image/gif","image/webp","video/mp4","application/json"];
  if (!accepted.includes(file.type) && !isLottie) {
    toast({ title: "Formato inválido", description: "Acepta: JPG, PNG, WebP, GIF, MP4, Lottie (.json/.lottie)", variant: "destructive" });
    return false;
  }
  const maxSize = file.type === "video/mp4" ? SIZE_LIMITS["video/mp4"]
    : isLottie ? SIZE_LIMITS["application/json"] : SIZE_LIMITS.default;
  if (file.size > maxSize) {
    toast({ title: "Archivo muy grande", description: `Máximo: ${(maxSize / 1024 / 1024).toFixed(1)} MB`, variant: "destructive" });
    return false;
  }
  return true;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AppBrandingTab() {
  const { data: allBranding = [], isLoading } = useAppBranding();
  const createBranding = useCreateBranding();
  const updateBranding = useUpdateBranding();
  const deleteBranding = useDeleteBranding();
  const batchUpdateOrder = useBatchUpdateOrder();

  const [uploadingSplash, setUploadingSplash] = useState(false);
  const [uploadingOnboarding, setUploadingOnboarding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Local layout state for splash (not yet saved)
  const splashInputRef = useRef<HTMLInputElement>(null);
  const onboardingInputRef = useRef<HTMLInputElement>(null);

  const splashItem = allBranding.find((item) => item.type === "splash");
  const onboardingItems = allBranding
    .filter((item) => item.type === "onboarding")
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // ── Splash layout local state ──
  const [splashLayout, setSplashLayout] = useState<LayoutState | null>(null);
  const activeSplashLayout: LayoutState = splashLayout ?? (splashItem ? resolveLayout(splashItem) : defaultLayout());

  const handleSplashLayoutChange = (updates: Partial<LayoutState>) => {
    setSplashLayout((prev) => ({ ...(prev ?? activeSplashLayout), ...updates }));
  };

  const handleSplashLayoutSave = () => {
    if (!splashItem || !splashLayout) return;
    updateBranding.mutate({ id: splashItem.id, updates: splashLayout });
    setSplashLayout(null);
  };

  // ── Upload handlers ──
  const handleSplashUpload = async (file: File) => {
    if (!validateFile(file)) return;
    setUploadingSplash(true);
    try {
      const imageUrl = await uploadBrandingImage(file, "splash");
      if (splashItem) {
        await updateBranding.mutateAsync({ id: splashItem.id, updates: { image_url: imageUrl } });
      } else {
        await createBranding.mutateAsync({ type: "splash", image_url: imageUrl, display_order: 0, is_active: true });
      }
    } catch (e: any) {
      toast({ title: "Error al subir", description: e.message, variant: "destructive" });
    } finally {
      setUploadingSplash(false);
    }
  };

  const handleOnboardingUpload = async (file: File) => {
    if (!validateFile(file)) return;
    if (onboardingItems.length >= 5) {
      toast({ title: "Límite alcanzado", description: "Máximo 5 slides", variant: "destructive" });
      return;
    }
    setUploadingOnboarding(true);
    try {
      const imageUrl = await uploadBrandingImage(file, "onboarding");
      await createBranding.mutateAsync({
        type: "onboarding", image_url: imageUrl,
        display_order: onboardingItems.length + 1, is_active: true,
      });
    } catch (e: any) {
      toast({ title: "Error al subir", description: e.message, variant: "destructive" });
    } finally {
      setUploadingOnboarding(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(onboardingItems);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    batchUpdateOrder.mutate(items.map((item, i) => ({ id: item.id, display_order: i + 1 })));
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) { deleteBranding.mutate(itemToDelete); setDeleteDialogOpen(false); setItemToDelete(null); }
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-[400px] w-full" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  const splashHasUnsavedLayout = splashLayout !== null;

  return (
    <div className="space-y-8">

      {/* Format Guide */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" /> GUÍA DE FORMATOS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { fmt: "Lottie (.json/.lottie)", desc: "Ideal para splash", note: "Vector, <50 KB" },
              { fmt: "WebP animado", desc: "Ideal para banners", note: "Transparencia, <500 KB" },
              { fmt: "MP4 (H.264)", desc: "Videos de producto", note: "Alta fidelidad, <5 MB" },
              { fmt: "PNG / JPG", desc: "Imágenes estáticas", note: "Fotos, fondos, <2 MB" },
            ].map(({ fmt, desc, note }) => (
              <div key={fmt} className="space-y-0.5">
                <p className="font-semibold text-foreground">{fmt}</p>
                <p className="text-muted-foreground">{desc}</p>
                <p className="text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── SPLASH SCREEN ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> SPLASH SCREEN
          </CardTitle>
          <CardDescription>Pantalla de inicio · Acepta imagen, MP4 o Lottie</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="media">
            <TabsList className="mb-4">
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="layout" disabled={!splashItem}>Posición y tamaño</TabsTrigger>
            </TabsList>

            <TabsContent value="media">
              <div className="flex gap-6 items-start">
                <PhonePreview
                  url={splashItem?.image_url ?? null}
                  x={activeSplashLayout.media_x}
                  y={activeSplashLayout.media_y}
                  width={activeSplashLayout.media_width}
                  height={activeSplashLayout.media_height}
                  opacity={activeSplashLayout.media_opacity}
                  fit={activeSplashLayout.media_fit}
                />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Estado</Label>
                      <p className="text-sm text-muted-foreground">{splashItem?.is_active ? "Activo" : "Inactivo"}</p>
                    </div>
                    {splashItem && (
                      <Switch
                        checked={splashItem.is_active ?? true}
                        onCheckedChange={(v) => updateBranding.mutate({ id: splashItem.id, updates: { is_active: v } })}
                      />
                    )}
                  </div>
                  <div>
                    <Button variant="outline" className="w-full" disabled={uploadingSplash} onClick={() => splashInputRef.current?.click()}>
                      {uploadingSplash ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</> : <><Upload className="mr-2 h-4 w-4" />{splashItem ? "Cambiar media" : "Subir media"}</>}
                    </Button>
                    <input ref={splashInputRef} type="file" accept={FILE_ACCEPT} className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSplashUpload(f); e.target.value = ""; }} />
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP, MP4, Lottie (.json/.lottie)</p>
                  </div>
                  {splashItem && (
                    <Button variant="destructive" size="sm"
                      onClick={() => { setItemToDelete(splashItem.id); setDeleteDialogOpen(true); }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout">
              {splashItem && (
                <div className="flex gap-6 items-start">
                  <PhonePreview
                    url={splashItem.image_url}
                    x={activeSplashLayout.media_x}
                    y={activeSplashLayout.media_y}
                    width={activeSplashLayout.media_width}
                    height={activeSplashLayout.media_height}
                    opacity={activeSplashLayout.media_opacity}
                    fit={activeSplashLayout.media_fit}
                  />
                  <div className="flex-1">
                    <LayoutControls layout={activeSplashLayout} onChange={handleSplashLayoutChange} />
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={handleSplashLayoutSave} disabled={!splashHasUnsavedLayout || updateBranding.isPending}>
                        {updateBranding.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar posición
                      </Button>
                      {splashHasUnsavedLayout && (
                        <Button size="sm" variant="ghost" onClick={() => setSplashLayout(null)}>Descartar</Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ── ONBOARDING SLIDES ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> ONBOARDING SLIDES</CardTitle>
              <CardDescription>Hasta 5 slides · Imagen, MP4 o Lottie</CardDescription>
            </div>
            <Button onClick={() => onboardingInputRef.current?.click()} disabled={uploadingOnboarding || onboardingItems.length >= 5}>
              {uploadingOnboarding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</> : <><Plus className="mr-2 h-4 w-4" />Agregar</>}
            </Button>
            <input ref={onboardingInputRef} type="file" accept={FILE_ACCEPT} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOnboardingUpload(f); e.target.value = ""; }} />
          </div>
        </CardHeader>
        <CardContent>
          {onboardingItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Sin slides de onboarding</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="onboarding-list">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                    {onboardingItems.map((item, index) => (
                      <OnboardingItem
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={(id, updates) => updateBranding.mutate({ id, updates })}
                        onDelete={(id) => { setItemToDelete(id); setDeleteDialogOpen(true); }}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── OnboardingItem ────────────────────────────────────────────────────────────

interface OnboardingItemProps {
  item: AppBranding;
  index: number;
  onUpdate: (id: string, updates: Partial<AppBranding>) => void;
  onDelete: (id: string) => void;
}

function OnboardingItem({ item, index, onUpdate, onDelete }: OnboardingItemProps) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [layout, setLayout] = useState<LayoutState | null>(null);

  const activeLayout: LayoutState = layout ?? resolveLayout(item);
  const hasUnsaved = layout !== null;

  const handleBlur = (field: "title" | "description", value: string) => {
    const original = field === "title" ? item.title : item.description;
    if (value !== original) onUpdate(item.id, { [field]: value });
  };

  const handleLayoutSave = () => {
    if (!layout) return;
    onUpdate(item.id, layout);
    setLayout(null);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border rounded-lg bg-card ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
        >
          {/* Header row */}
          <div className="flex gap-3 p-4">
            <div {...provided.dragHandleProps} className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
              {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="w-[80px] flex-shrink-0">
              <div className="aspect-[9/16] rounded border overflow-hidden bg-muted/30">
                <MediaPreview url={item.image_url} alt={`Slide ${index + 1}`} />
              </div>
            </div>

            {/* Text fields */}
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <Label htmlFor={`title-${item.id}`} className="text-xs">Título</Label>
                <Input id={`title-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur("title", title)} placeholder="Título del slide" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`desc-${item.id}`} className="text-xs">Descripción</Label>
                <Textarea id={`desc-${item.id}`} value={description} onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur("description", description)} placeholder="Descripción" rows={2} className="text-sm" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Activo</Label>
                <Switch checked={item.is_active ?? true} onCheckedChange={(v) => onUpdate(item.id, { is_active: v })} />
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Layout controls — collapsible */}
          <div className="border-t mx-4 mb-4 pt-3">
            <div className="flex gap-4 items-start">
              <PhonePreview
                url={item.image_url}
                x={activeLayout.media_x}
                y={activeLayout.media_y}
                width={activeLayout.media_width}
                height={activeLayout.media_height}
                opacity={activeLayout.media_opacity}
                fit={activeLayout.media_fit}
              />
              <div className="flex-1">
                <LayoutControls layout={activeLayout} onChange={(u) => setLayout((prev) => ({ ...(prev ?? activeLayout), ...u }))} />
                {hasUnsaved && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleLayoutSave}>Guardar posición</Button>
                    <Button size="sm" variant="ghost" onClick={() => setLayout(null)}>Descartar</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
