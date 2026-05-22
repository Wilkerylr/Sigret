import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/componentes/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  ChartArea, 
  Search, 
  StickyNotePlus,
  DatabaseSearch,
  UserSearch,
  LogOut,
 } from "lucide-react"
import "./AppSidebar.css"
//documentacion completa https://ui.shadcn.com/docs/components/radix/sidebar#composition

// Define los elementos del menú de navegación

const menuItems = [
  // Agrega más elementos de menú según sea necesario
  // Elementos de titulo, icono y ruta
  {
    title: "Inicio",
    icon: ChartArea,
    path: "/home",
  },
    {
    title: "Registrar Reportes",
    icon: StickyNotePlus,
    path: "/home/registro-reportes",
  },
  {
    title: "Búsqueda de Reportes",
    icon: Search,
    path: "/home/busqueda-reportes",
  },
  {
    title: "Gestion de Registros",
    icon: DatabaseSearch,
    path: "/home/gestion-registros",
  },
  {
    title: "Gestion de Usuarios",
    icon: UserSearch,
    path: "/home/gestion-usuarios",
  }
]

export function AppSidebar() {
  // Obtiene la función de navegación y la ubicación actual
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // Renderiza la barra lateral con los elementos de menú

    <Sidebar className="sidebar-container">
      <SidebarHeader className="sidebar-header">Sigret</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sidebar-group-label">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path} className="sidebar-menu-item">
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  tooltip={item.title}
                  className={`sidebar-menu-button${location.pathname === item.path ? " active" : ""}`}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem className="sidebar-menu-item sidebar-logout-item">
            <SidebarMenuButton
              onClick={() => navigate("/")}
              tooltip="Cerrar sesión"
              className="sidebar-menu-button sidebar-logout-button"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()
 
  return <button onClick={toggleSidebar}>Toggle Sidebar</button>
}