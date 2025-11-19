import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";

export function AdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 ml-[280px] overflow-y-auto h-screen">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
