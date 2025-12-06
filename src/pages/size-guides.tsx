import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Ruler, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSizeGuides,
  useCreateSizeGuide,
  useUpdateSizeGuide,
  useDeleteSizeGuide,
  useToggleSizeGuideStatus,
  SizeGuide,
  SizeGuideFormData,
} from "@/hooks/use-size-guides";
import { useCategories } from "@/hooks/use-categories";

export default function SizeGuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<SizeGuide | null>(null);
  const [deleteGuideId, setDeleteGuideId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [formSizes, setFormSizes] = useState<string[]>([]);
  const [formMeasurements, setFormMeasurements] = useState<Record<string, Record<string, string>>>({});
  const [formIsActive, setFormIsActive] = useState(true);
  const [newSize, setNewSize] = useState("");
  const [newMeasurement, setNewMeasurement] = useState("");

  const { data: guides = [], isLoading } = useSizeGuides();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateSizeGuide();
  const updateMutation = useUpdateSizeGuide();
  const deleteMutation = useDeleteSizeGuide();
  const toggleMutation = useToggleSizeGuideStatus();

  // Filter guides
  const filteredGuides = guides.filter((guide) => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
      (categoryFilter === "none" && !guide.category_id) ||
      guide.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormCategoryId(null);
    setFormSizes([]);
    setFormMeasurements({});
    setFormIsActive(true);
    setNewSize("");
    setNewMeasurement("");
    setEditingGuide(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (guide: SizeGuide) => {
    setEditingGuide(guide);
    setFormName(guide.name);
    setFormDescription(guide.description || "");
    setFormCategoryId(guide.category_id);
    setFormSizes(Array.isArray(guide.sizes) ? guide.sizes : []);
    setFormMeasurements(typeof guide.measurements === 'object' ? guide.measurements : {});
    setFormIsActive(guide.is_active);
    setIsDialogOpen(true);
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formSizes.includes(newSize.trim())) {
      const updatedSizes = [...formSizes, newSize.trim()];
      setFormSizes(updatedSizes);
      // Add the new size to all existing measurements
      const updatedMeasurements = { ...formMeasurements };
      Object.keys(updatedMeasurements).forEach(key => {
        updatedMeasurements[key] = { ...updatedMeasurements[key], [newSize.trim()]: "" };
      });
      setFormMeasurements(updatedMeasurements);
      setNewSize("");
    }
  };

  const handleRemoveSize = (size: string) => {
    const updatedSizes = formSizes.filter(s => s !== size);
    setFormSizes(updatedSizes);
    // Remove the size from all measurements
    const updatedMeasurements = { ...formMeasurements };
    Object.keys(updatedMeasurements).forEach(key => {
      const { [size]: _, ...rest } = updatedMeasurements[key];
      updatedMeasurements[key] = rest;
    });
    setFormMeasurements(updatedMeasurements);
  };

  const handleAddMeasurement = () => {
    if (newMeasurement.trim() && !formMeasurements[newMeasurement.trim()]) {
      const initialValues: Record<string, string> = {};
      formSizes.forEach(size => {
        initialValues[size] = "";
      });
      setFormMeasurements({ ...formMeasurements, [newMeasurement.trim()]: initialValues });
      setNewMeasurement("");
    }
  };

  const handleRemoveMeasurement = (measurement: string) => {
    const { [measurement]: _, ...rest } = formMeasurements;
    setFormMeasurements(rest);
  };

  const handleMeasurementValueChange = (measurement: string, size: string, value: string) => {
    setFormMeasurements({
      ...formMeasurements,
      [measurement]: { ...formMeasurements[measurement], [size]: value }
    });
  };

  const handleSubmit = async () => {
    if (!formName.trim() || formSizes.length === 0) return;

    const data: SizeGuideFormData = {
      name: formName,
      description: formDescription || undefined,
      category_id: formCategoryId,
      sizes: formSizes,
      measurements: formMeasurements,
      is_active: formIsActive,
    };

    if (editingGuide) {
      await updateMutation.mutateAsync({ id: editingGuide.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteGuideId) {
      await deleteMutation.mutateAsync(deleteGuideId);
      setDeleteGuideId(null);
    }
  };

  const handleToggleStatus = async (guide: SizeGuide) => {
    await toggleMutation.mutateAsync({ id: guide.id, isActive: !guide.is_active });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground uppercase">
            Guías de Tallas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las guías de tallas para tus productos
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Guía
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total de Guías
            </CardTitle>
            <Ruler className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guides.length}</div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Guías Activas
            </CardTitle>
            <Ruler className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {guides.filter(g => g.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Categorías con Guía
            </CardTitle>
            <Ruler className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(guides.filter(g => g.category_id).map(g => g.category_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="none">General (sin categoría)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase">Nombre</TableHead>
                <TableHead className="uppercase">Categoría</TableHead>
                <TableHead className="uppercase">Tallas</TableHead>
                <TableHead className="uppercase">Actualizado</TableHead>
                <TableHead className="uppercase">Estado</TableHead>
                <TableHead className="uppercase text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredGuides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron guías de tallas
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell className="font-medium">{guide.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {guide.category?.name || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(guide.sizes) ? guide.sizes : []).slice(0, 5).map((size) => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                        {(Array.isArray(guide.sizes) ? guide.sizes : []).length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{guide.sizes.length - 5}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(guide.updated_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={guide.is_active}
                        onCheckedChange={() => handleToggleStatus(guide)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(guide)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteGuideId(guide.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase">
              {editingGuide ? "Editar Guía de Tallas" : "Nueva Guía de Tallas"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Guía de Tallas Mujer"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={formCategoryId || "none"} 
                  onValueChange={(v) => setFormCategoryId(v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General (sin categoría)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General (sin categoría)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la guía de tallas..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Sizes Section */}
            <div className="space-y-3">
              <Label className="uppercase text-sm font-semibold">Tallas Disponibles *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar talla (ej: XS, S, M...)"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                />
                <Button type="button" variant="secondary" onClick={handleAddSize}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formSizes.map((size) => (
                  <Badge key={size} variant="secondary" className="gap-1 px-3 py-1">
                    {size}
                    <button onClick={() => handleRemoveSize(size)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formSizes.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No hay tallas agregadas
                  </span>
                )}
              </div>
            </div>

            {/* Measurements Section */}
            <div className="space-y-3">
              <Label className="uppercase text-sm font-semibold">Tabla de Medidas</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar medida (ej: Pecho, Cintura...)"
                  value={newMeasurement}
                  onChange={(e) => setNewMeasurement(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMeasurement())}
                />
                <Button type="button" variant="secondary" onClick={handleAddMeasurement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Object.keys(formMeasurements).length > 0 && formSizes.length > 0 && (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Medida</TableHead>
                        {formSizes.map((size) => (
                          <TableHead key={size} className="text-center min-w-[80px]">
                            {size}
                          </TableHead>
                        ))}
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(formMeasurements).map(([measurement, values]) => (
                        <TableRow key={measurement}>
                          <TableCell className="font-medium">{measurement}</TableCell>
                          {formSizes.map((size) => (
                            <TableCell key={size} className="p-1">
                              <Input
                                value={values[size] || ""}
                                onChange={(e) => handleMeasurementValueChange(measurement, size, e.target.value)}
                                className="h-8 text-center text-sm"
                                placeholder="-"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="p-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMeasurement(measurement)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {Object.keys(formMeasurements).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Agrega tallas y medidas para crear la tabla
                </p>
              )}
            </div>

            {/* Preview */}
            {Object.keys(formMeasurements).length > 0 && formSizes.length > 0 && (
              <Card className="border-2 bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medida</TableHead>
                          {formSizes.map((size) => (
                            <TableHead key={size} className="text-center">
                              {size}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(formMeasurements).map(([measurement, values]) => (
                          <TableRow key={measurement}>
                            <TableCell className="font-medium">{measurement}</TableCell>
                            {formSizes.map((size) => (
                              <TableCell key={size} className="text-center">
                                {values[size] || "-"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="is_active">Guía activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formName.trim() || formSizes.length === 0 || createMutation.isPending || updateMutation.isPending}
            >
              {editingGuide ? "Guardar Cambios" : "Crear Guía"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGuideId} onOpenChange={() => setDeleteGuideId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar guía de tallas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La guía de tallas será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
