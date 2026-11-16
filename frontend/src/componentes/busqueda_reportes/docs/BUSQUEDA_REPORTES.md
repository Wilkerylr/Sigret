# Módulo de Búsqueda de Reportes

## Descripción

Componente para buscar y visualizar reportes del sistema SGRT (Sistema de Gestión
de Reportes Técnicos). Permite buscar por texto libre en las propiedades del
reporte, aplicar filtros avanzados, paginar los resultados y consultar el detalle
resumido o la vista ampliada de cada reporte.

## Estructura de archivos

```
busqueda_reportes/
├── Busqueda_reportes.tsx        # Componente principal de la página
├── busqueda_reportes.css        # Estilos específicos del módulo
├── components/
│   ├── FiltrosBusqueda.tsx      # Panel de filtros desplegable
│   ├── ResultadosBusqueda.tsx   # Resultados, detalle y vista ampliada
│   ├── DetalleResumen.tsx       # Detalle resumido expandible
│   ├── VistaAmpliadaReporte.tsx # Vista ampliada con toda la información
│   └── Paginacion.tsx           # Componente de paginación reutilizable
├── constants/
│   └── opcionesBusqueda.ts      # Opciones estáticas de los filtros
├── hooks/
│   └── useOpcionesBusqueda.ts   # Carga de etiquetas, técnicos y repuestos
├── types/
│   └── index.ts                 # FiltrosBusqueda y re-export de tipos globales
└── docs/
    └── BUSQUEDA_REPORTES.md     # Esta documentación
```

## Flujo de la página

```
[Input de búsqueda libre] + [Botón Buscar] + [Botón Filtros]
                          |
                    [Panel de filtros avanzados] (colapsable)
                          |
              [Resultados con paginación]
                          |
        ┌─────────────────┴─────────────────┐
        |                                   |
[Expandir detalle]                  [Vista Ampliada]
  (DetalleResumen)              (VistaAmpliadaReporte)
```

## Componentes

### Busqueda_reportes.tsx (principal)

- **Buscador por texto libre**: busca en número de reporte, cliente, equipo,
  descripción de falla, trabajo realizado, etiquetas, técnicos, repuestos,
  plantilla y declaración.
- **Botón "Buscar"**: ejecuta la búsqueda. También funciona con **Enter**.
- **Botón "Filtros"**: despliega u oculta el panel de filtros avanzados.
- **Paginación**: administra página actual, items por página y particiona los
  resultados para mostrar solo la página activa.
- **Fuente de datos**: recibe los reportes ya cargados desde el padre mediante
  `datosIniciales`; no consulta la API por sí mismo.
- **`modoEmbebido`**: oculta el título cuando el componente se usa dentro de otra
  pantalla (por ejemplo, la gestión de registros).

### FiltrosBusqueda.tsx

Panel colapsable con filtros por número de reporte, etiqueta, cantidad de
reportes, repuesto, rango de fechas y técnico. Las opciones de etiquetas,
técnicos y repuestos se cargan desde la API mediante `useOpcionesBusqueda`.

Incluye los botones **"Aplicar filtros"** y **"Limpiar filtros"**.

### ResultadosBusqueda.tsx

- Muestra el total de reportes encontrados.
- Lista tarjetas con número de reporte, cliente, equipo, fecha, etiquetas y
  técnicos.
- Botón **"Vista Ampliada"** que abre `VistaAmpliadaReporte` en línea, dentro de
  la propia tarjeta.
- Botón de chevron que expande o colapsa `DetalleResumen`.
- Integra `<Paginacion />` al final de los resultados.

### DetalleResumen.tsx

Detalle resumido del reporte en un grid responsivo: número, cliente, equipo,
plantilla, fechas, horas, declaración, repuestos, etiquetas, técnicos,
descripción de la falla y trabajo realizado. No incluye acciones de edición.

### VistaAmpliadaReporte.tsx

Vista completa del reporte, estructurada por secciones igual que el formulario de
registro (cliente, servicio, repuestos, etiquetas/técnicos y control). Se abre en
línea dentro de la tarjeta y se cierra con el botón **"Cerrar"**.

### Paginacion.tsx

- Selector de items por página: 10, 20 o 30 reportes.
- Texto informativo: "Mostrando X–Y de Z reportes".
- Botones anterior/siguiente con iconos ChevronLeft/ChevronRight.
- Números de página con puntos suspensivos para navegación compacta.
- Al cambiar la cantidad de items por página se reinicia a la página 1.

## Tipos

El modelo de datos es único y vive en `@/types` (`ReporteResumen`). El módulo solo
define el tipo de los filtros:

```typescript
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

## Dependencias

- `lucide-react` — iconos.
- `@tanstack/react-query` — carga de opciones de filtros.
- `@/componentes/ui/combobox-con-buscador` — combobox reutilizable con buscador.
- `react` — framework.

## Variables CSS

Todas las variables se heredan de `Global.css`:

- `--color-fondo-oscuro`, `--color-texto-claro`, `--color-fondo-claro`
- `--color-fondo-card`, `--color-borde-claro`, `--color-input-fondo`
- `--color-input-borde`, `--color-input-focus-sombra`
- `--color-texto-oscuro`, `--color-texto-secundario`, `--color-texto-terciario`
- `--border-radius1`, `--border-radius2`
- `--color-sombra-card`, `--color-sombra-hover`
- `--color-boton-secundario-fondo`, `--color-boton-secundario-texto`
- `--color-boton-hover`
