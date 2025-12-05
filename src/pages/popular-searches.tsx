import { useState } from "react";
import { TrendingUp, Search, Award, BarChart, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  usePopularSearches,
  usePopularSearchStats,
  useAddPopularSearch,
  useUpdatePopularSearch,
  useDeletePopularSearch,
  PopularSearch,
  PopularSearchFormData,
} from "@/hooks/use-popular-searches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PopularSearchesPage() {
  const [search, setSearch] = useState("");
  const [minCount, setMinCount] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<PopularSearch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formQuery, setFormQuery] = useState("");
  const [formCount, setFormCount] = useState(1);

  const filters = {
    search: search || undefined,
    minCount: minCount !== "all" ? parseInt(minCount) : undefined,
  };

  const { data: searches = [], isLoading } = usePopularSearches(filters);
  const { data: stats } = usePopularSearchStats();
  const addSearch = useAddPopularSearch();
  const updateSearch = useUpdatePopularSearch();
  const deleteSearch = useDeletePopularSearch();

  const handleOpenDialog = (item?: PopularSearch) => {
    if (item) {
      setEditingSearch(item);
      setFormQuery(item.query);
      setFormCount(item.total_count);
    } else {
      setEditingSearch(null);
      setFormQuery("");
      setFormCount(1);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSearch(null);
    setFormQuery("");
    setFormCount(1);
  };

  const handleSubmit = async () => {
    if (!formQuery.trim()) return;

    try {
      if (editingSearch) {
        await updateSearch.mutateAsync({
          id: editingSearch.id,
          data: { total_count: formCount },
        });
      } else {
        await addSearch.mutateAsync({
          query: formQuery.trim(),
          total_count: formCount,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSearch.mutateAsync(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setMinCount("all");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Tendencias de Búsqueda
          </h1>
          <p className="text-muted-foreground">
            Gestiona las búsquedas populares mostradas en la app
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="uppercase">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tendencia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Total de Términos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTerms || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Búsquedas Totales
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSearches?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Término Más Buscado
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {stats?.topSearch?.query || "-"}
            </div>
            {stats?.topSearch && (
              <p className="text-xs text-muted-foreground">
                {stats.topSearch.total_count.toLocaleString()} búsquedas
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase">
              Promedio de Búsquedas
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageSearches?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">por término</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por término..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2"
              />
            </div>
            <Select value={minCount} onValueChange={setMinCount}>
              <SelectTrigger className="w-[180px] border-2">
                <SelectValue placeholder="Cantidad mínima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="10">&gt; 10 búsquedas</SelectItem>
                <SelectItem value="50">&gt; 50 búsquedas</SelectItem>
                <SelectItem value="100">&gt; 100 búsquedas</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-2 uppercase"
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase">Término</TableHead>
                <TableHead className="uppercase">Cantidad</TableHead>
                <TableHead className="uppercase">Última Actualización</TableHead>
                <TableHead className="text-right uppercase">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : searches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No se encontraron tendencias
                  </TableCell>
                </TableRow>
              ) : (
                searches.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium uppercase">
                      {item.query}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {item.total_count.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(item.updated_at), "dd MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(item.id)}
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
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle className="uppercase">
              {editingSearch ? "Editar Tendencia" : "Nueva Tendencia"}
            </DialogTitle>
            <DialogDescription>
              {editingSearch
                ? "Modifica la cantidad de búsquedas"
                : "Agrega un nuevo término de búsqueda popular"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="query" className="uppercase">
                Término de Búsqueda
              </Label>
              <Input
                id="query"
                value={formQuery}
                onChange={(e) => setFormQuery(e.target.value)}
                placeholder="Ej: vestidos, zapatos, bolsos..."
                disabled={!!editingSearch}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="count" className="uppercase">
                Cantidad de Búsquedas
              </Label>
              <Input
                id="count"
                type="number"
                min={1}
                value={formCount}
                onChange={(e) => setFormCount(parseInt(e.target.value) || 1)}
                className="border-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="border-2 uppercase"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formQuery.trim() || addSearch.isPending || updateSearch.isPending}
              className="uppercase"
            >
              {editingSearch ? "Guardar Cambios" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase">
              ¿Eliminar Tendencia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El término será eliminado de las
              tendencias de búsqueda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 uppercase">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
