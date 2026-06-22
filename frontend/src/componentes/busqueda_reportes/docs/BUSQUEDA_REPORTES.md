# Módulo de Búsqueda de Reportes

## Descripción
Componente para buscar y visualizar reportes del sistema SGRT (Sistema de Gestión de Reportes Técnicos).
Permite buscar por texto libre en todas las propiedades del reporte, aplicar filtros avanzados,
visualizar el detalle completo de cada reporte y editarlo si es necesario.

## Estructura de Archivos

```
busqueda_reportes/
├── Busqueda_reportes.tsx        # Componente principal de la página
├── busqueda_reportes.css         # Estilos específicos del módulo
├── index.ts                      # Punto de exportación
├── components/
│   ├── FiltrosBusqueda.tsx       # Panel de filtros desplegable
│   ├── ResultadosBusqueda.tsx    # Sección de resultados con paginación
│   ├── DetalleReporte.tsx        # Vista detallada de un reporte con botón de edición
│   └── Paginacion.tsx            # Componente de paginación reutilizable
├── constants/
│   └── opcionesBusqueda.ts       # Opciones para los filtros
├── types/
│   └── index.ts                  # Definiciones de tipos e interfaz FiltrosBusqueda
└── docs/
    └── BUSQUEDA_REPORTES.md      # Esta documentación
```

## Flujo de la Página

```
[Input de búsqueda libre] + [Botón Buscar] + [Botón Filtros]
                          |
                    [Panel de filtros avanzados] (colapsable)
                          |
              [Resultados con paginación]
                          |
              [Expandir detalle → Botón Editar]
```

## Componentes

### Busqueda_reportes.tsx (Principal)
- **Buscador por texto libre**: Input que busca en **todas las propiedades** del reporte:
  número de reporte, cliente, equipo, descripción de falla, trabajo realizado,
  etiquetas, técnicos, repuestos, plantilla, declaración.
- **Botón "Buscar"**: Ejecuta la búsqueda. También funciona con la tecla **Enter**.
- **Botón "Filtros"**: Despliega/oculta el panel de filtros avanzados.
- **Paginación**: Administra el estado de página actual, items por página y
  particiona los resultados para mostrar solo la página activa.
- **Datos de prueba**: Genera 100 reportes con combinaciones aleatorias de
  clientes reales, equipos, técnicos, etiquetas y repuestos.

### FiltrosBusqueda.tsx
Panel colapsable con las siguientes opciones de filtrado:
| Filtro | Tipo | Descripción |
|--------|------|-------------|
| N° Reporte | Texto | Búsqueda parcial por número de reporte |
| Etiqueta | Select | Mantenimiento, Reparación, Inspección, Mantenimiento esporádico |
| Cantidad de Reportes | Select | 10, 25, 50, 100 reportes |
| Repuesto | Select | Batería, Disco Duro SSD, Memoria RAM, Fuente de Poder, Ventilador, Cable HDMI, Teclado, Mouse, Monitor, Router |
| Fecha Desde | Date | Fecha inicial del rango |
| Fecha Hasta | Date | Fecha final del rango |
| Técnico | Select | Victor, Wilker, Alexis |

Incluye botones **"Aplicar filtros"** y **"Limpiar filtros"**.

### ResultadosBusqueda.tsx
- Muestra el total de reportes encontrados (ej: "Se encontraron 100 reportes").
- Lista de tarjetas con información resumida: número de reporte, cliente, equipo,
  fecha, etiquetas y técnicos.
- Botón para expandir/colapsar el detalle completo del reporte.
- Integra el componente `<Paginacion />` al final de los resultados.

### DetalleReporte.tsx
- Información completa del reporte en un grid responsivo (1/2/3 columnas).
- Campos mostrados: N° Reporte, Cliente, Equipo, Plantilla, Fecha Reporte,
  Fecha Atención, Hora Inicio, Hora Finalización, Declaración, Repuestos,
  Etiquetas, Técnicos, Descripción de la Falla, Trabajo Realizado.
- Los campos de descripción ocupan el ancho completo con fondo diferenciado.
- **Botón "Editar Reporte"** al final del detalle (conectable al formulario de edición).

### Paginacion.tsx
- Selector de **items por página**: 10, 20 o 30 reportes.
- Texto informativo: "Mostrando X–Y de Z reportes".
- Botones **anterior/siguiente** con íconos ChevronLeft/ChevronRight.
- Números de página con **puntos suspensivos** para navegación compacta.
- Página activa resaltada con color de fondo oscuro.
- Al cambiar la cantidad de items por página, se reinicia a la página 1.

## Tipos (types/index.ts)

```typescript
interface ReporteResumen {
  id: string;
  numeroReporte: string;
  cliente: string;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiquetas: string[];
  tecnicos: string[];
  repuestos: string[];
  declaracion: string;
  plantilla: string;
}

interface FiltrosBusqueda {
  numeroReporte: string;
  etiqueta: string;
  cantidadReportes: string;
  repuesto: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnico: string;
}
```

## Variables CSS Utilizadas

Todas las variables se heredan de `Global.css`:
- `--color-fondo-oscuro`, `--color-texto-claro`, `--color-fondo-claro`
- `--color-fondo-card`, `--color-borde-claro`, `--color-input-fondo`
- `--color-input-borde`, `--color-input-focus-sombra`
- `--color-texto-oscuro`, `--color-texto-secundario`, `--color-texto-terciario`
- `--border-radius1`, `--border-radius2`
- `--color-sombra-card`, `--color-sombra-hover`
- `--color-boton-secundario-fondo`, `--color-boton-secundario-texto`
- `--color-boton-hover`

## Dependencias
- `@/componentes/ui/combobox-con-buscador` - Componente Combobox reutilizable con buscador (custom, sin dependencias externas)
- `lucide-react` - Iconos (Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Edit3, X)
- `react` - Framework

## Datos de Prueba
Se generan 100 reportes con:
- **8 clientes reales**: Admin 951, Parking paraiso, Admin maralva, Condominio torre la noria, Altamira tennis club, Inv kk 2002, Admin omiwi, Inv clamarxui
- **12 equipos**: Servidores, switches, UPS, routers, cámaras, PCs, impresoras, NAS, access points, monitores, laptops, firewalls
- **4 etiquetas**: Mantenimiento, Reparación, Inspección, Mantenimiento esporádico
- **3 técnicos**: Victor, Wilker, Alexis
- **10 repuestos**: Batería, Disco Duro SSD, Memoria RAM, Fuente de Poder, Ventilador, Cable HDMI, Teclado, Mouse, Monitor, Router
- Fechas distribuidas entre enero 2025 y junio 2026