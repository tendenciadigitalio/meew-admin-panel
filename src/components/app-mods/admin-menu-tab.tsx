import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useAdminMenu,
  useBatchUpdateAdminMenu,
  type AdminMenuItem,
  type AdminMenuItemUpdate,
} from "@/hooks/use-admin-menu";

const ALL_ROLES = ["admin", "editor", "viewer"] as const;

const roleColors: Record<string, string> = {
  admin: "bg-red-600 text-white hover:bg-red-700",
  editor: "bg-blue-600 text-white hover:bg-blue-700",
  viewer: "bg-gray-500 text-white hover:bg-gray-600",
};

function RoleToggle({
  role,
  active,
  onToggle,
}: {
  role: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Badge
      className={`cursor-pointer select-none text-[10px] ${
        active ? roleColors[role] : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      onClick={onToggle}
    >
      {role}
    </Badge>
  );
}

function SortableMenuRow({
  item,
  merged,
  onLocalChange,
}: {
  item: AdminMenuItem;
  merged: AdminMenuItem;
  onLocalChange: (id: string, updates: AdminMenuItemUpdate) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleRole = (role: string) => {
    const current = merged.allowed_roles;
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    // At least admin must remain
    if (updated.length === 0 || !updated.includes("admin")) {
      toast({
        title: "Rol requerido",
        description: "El rol 'admin' siempre debe tener acceso",
        variant: "destructive",
      });
      return;
    }
    onLocalChange(item.id, { allowed_roles: updated });
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b bg-card">
      <td className="p-4 align-middle w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </td>
      <td className="p-4 align-middle">
        <span className="text-sm text-muted-foreground font-mono">
          {merged.order_index}
        </span>
      </td>
      <td className="p-4 align-middle">
        <span className="text-xs text-muted-foreground font-mono">
          {merged.menu_key}
        </span>
      </td>
      <td className="p-4 align-middle">
        <Input
          value={merged.label}
          onChange={(e) => onLocalChange(item.id, { label: e.target.value })}
          className="w-full max-w-[180px]"
        />
      </td>
      <td className="p-4 align-middle">
        <span className="text-xs text-muted-foreground">{merged.href}</span>
      </td>
      <td className="p-4 align-middle">
        <Switch
          checked={merged.is_visible}
          onCheckedChange={(checked) =>
            onLocalChange(item.id, { is_visible: checked })
          }
        />
      </td>
      <td className="p-4 align-middle">
        <div className="flex gap-1">
          {ALL_ROLES.map((role) => (
            <RoleToggle
              key={role}
              role={role}
              active={merged.allowed_roles.includes(role)}
              onToggle={() => toggleRole(role)}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

export function AdminMenuTab() {
  const { data: menuItems = [], isLoading } = useAdminMenu();
  const batchUpdate = useBatchUpdateAdminMenu();

  const [sortedIds, setSortedIds] = useState<string[] | null>(null);
  const [localChanges, setLocalChanges] = useState<
    Record<string, AdminMenuItemUpdate>
  >({});

  const sortedItems = (() => {
    if (!sortedIds) return menuItems;
    const map = new Map(menuItems.map((i) => [i.id, i]));
    return sortedIds.map((id) => map.get(id)!).filter(Boolean);
  })();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentIds = sortedIds || menuItems.map((i) => i.id);
      const oldIndex = currentIds.indexOf(active.id as string);
      const newIndex = currentIds.indexOf(over.id as string);
      const newIds = arrayMove(currentIds, oldIndex, newIndex);
      setSortedIds(newIds);

      newIds.forEach((id, index) => {
        const original = menuItems.find((i) => i.id === id);
        if (original && original.order_index !== index) {
          setLocalChanges((prev) => ({
            ...prev,
            [id]: { ...prev[id], order_index: index },
          }));
        }
      });
    },
    [sortedIds, menuItems]
  );

  const handleLocalChange = (id: string, updates: AdminMenuItemUpdate) => {
    setLocalChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const getMergedItem = (item: AdminMenuItem, index: number): AdminMenuItem => {
    const changes = localChanges[item.id];
    const merged = changes ? { ...item, ...changes } : { ...item };
    if (sortedIds) {
      merged.order_index = index;
    }
    return merged;
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

    // Dashboard must remain visible
    const allItems = sortedItems.map((item, i) => getMergedItem(item, i));
    const dashboard = allItems.find((i) => i.menu_key === "dashboard");
    if (dashboard && !dashboard.is_visible) {
      toast({
        title: "Error de validación",
        description: "Dashboard siempre debe estar visible",
        variant: "destructive",
      });
      return;
    }

    batchUpdate.mutate(updates, {
      onSuccess: () => {
        setLocalChanges({});
        setSortedIds(null);
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

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 w-12" />
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  #
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Key
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Etiqueta
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ruta
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Visible
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Roles
                </th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {sortedItems.map((item, index) => (
                    <SortableMenuRow
                      key={item.id}
                      item={item}
                      merged={getMergedItem(item, index)}
                      onLocalChange={handleLocalChange}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      {hasChanges && (
        <p className="text-sm text-muted-foreground">
          Arrastra las filas para reordenar. Haz click en los roles para
          activar/desactivar acceso. Los cambios no se guardan hasta que
          presiones el botón.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAll}
          disabled={!hasChanges || batchUpdate.isPending}
        >
          {batchUpdate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
