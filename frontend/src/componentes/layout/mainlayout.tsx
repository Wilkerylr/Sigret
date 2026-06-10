import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import "./mainlayout.css";

const pageTitles: Record<string, string> = {
  "/home": "Inicio",
  "/home/registro-reportes": "Registrar Reportes",
  "/home/busqueda-reportes": "Búsqueda de Reportes",
  "/home/gestion-registros": "Gestión de Registros",
  "/home/gestion-usuarios": "Gestión de Usuarios",
};

export default function Layout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || "Sigret";

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="main-content">
        <div className="main-toolbar">
          <SidebarTrigger className="sidebar-trigger-custom" />
          <span className="main-toolbar-title">{currentTitle}</span>
        </div>
        <div className="main-outlet">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
