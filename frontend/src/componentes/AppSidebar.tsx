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
} from "@/componentes/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"
import { Home, Search } from "lucide-react"
//documentacion completa https://ui.shadcn.com/docs/components/radix/sidebar#composition

// Define los elementos del menú de navegación

const menuItems = [
  // Agrega más elementos de menú según sea necesario
  // Elementos de titulo, icono y ruta
  {
    title: "Inicio",
    icon: Home,
    path: "/home",
  },
  {
    title: "Búsqueda de Reportes",
    icon: Search,
    path: "/home/busqueda-reportes",
  },
]

export function AppSidebar() {
  // Obtiene la función de navegación y la ubicación actual
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // Renderiza la barra lateral con los elementos de menú
    <Sidebar>
      <SidebarHeader className="p-4 font-bold text-lg">Sigret</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
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
      <SidebarFooter />
    </Sidebar>
  );
}