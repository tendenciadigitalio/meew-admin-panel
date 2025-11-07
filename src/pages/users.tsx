import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tight">Usuarios</h1>
        <p className="mt-2 text-muted-foreground">
          Listado de todos los usuarios registrados
        </p>
      </div>

      <div className="rounded-sm border-2">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="font-bold uppercase">Nombre</TableHead>
              <TableHead className="font-bold uppercase">Email</TableHead>
              <TableHead className="font-bold uppercase">Rol</TableHead>
              <TableHead className="font-bold uppercase">Total Pedidos</TableHead>
              <TableHead className="font-bold uppercase">Fecha Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay usuarios
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id} className="border-b">
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role || "customer"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.total_orders || 0}</TableCell>
                  <TableCell>
                    {new Date(user.created_at!).toLocaleDateString("es-ES")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
