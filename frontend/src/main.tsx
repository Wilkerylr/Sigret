import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./componentes/Global.css"
import EstadisticasPage from "./pages/Estadisticas_page.tsx"
//import App from './App.tsx'
import BusquedaReportesPage from './pages/Busqueda_reportes_page.tsx'
import LoginPage from './pages/Login_page.tsx'
import Layout from "./componentes/layout/mainlayout.tsx";
import RegistroReportesPage from "./pages/Registro_reportes.tsx";
import GestionRegistrosPage from "./pages/Gestion_registros.tsx";
import GestionUsuariosPage from "./pages/Gestion_usuarios.tsx";
// Define las rutas de la aplicación

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <EstadisticasPage />,
      },
      {
        path: "busqueda-reportes",
        element: <BusquedaReportesPage />,
      }
      ,
      {
        path: "registro-reportes",
        element: <RegistroReportesPage />,
      } ,
      {
        path: "gestion-registros",
        element: <GestionRegistrosPage />,
      },
      {
        path: "gestion-usuarios",
        element: <GestionUsuariosPage />,
      },
      {
        path: "*",
        element: <LoginPage />
      }
    ],

  },
]);

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
