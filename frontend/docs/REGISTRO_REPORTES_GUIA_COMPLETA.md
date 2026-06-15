# 📋 Guía Completa: Registro de Reportes - Paso a Paso

> **Versión:** 1.0  
> **Propósito:** Documentar el funcionamiento del formulario de registro de reportes para desarrolladores juniors.  
> **Última actualización:** Junio 2026

---

## 📑 Índice

1. [¿Qué hace esta funcionalidad?](#1-qué-hace-esta-funcionalidad)
2. [Arquitectura del Formulario](#2-arquitectura-del-formulario)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Flujo de Datos Paso a Paso](#4-flujo-de-datos-paso-a-paso)
5. [Sección 1: Datos del Cliente](#5-sección-1-datos-del-cliente)
6. [Sección 2: Datos del Servicio](#6-sección-2-datos-del-servicio)
7. [Sección 3: Repuestos Empleados](#7-sección-3-repuestos-empleados)
8. [Sección 4: Declaración](#8-sección-4-declaración)
9. [Sección 5: Etiquetas y Técnicos](#9-sección-5-etiquetas-y-técnicos)
10. [Sección 6: Datos de Control](#10-sección-6-datos-de-control)
11. [Validaciones al Guardar](#11-validaciones-al-guardar)
12. [Componentes Reutilizables](#12-componentes-reutilizables)
13. [Diagrama de Flujo Completo](#13-diagrama-de-flujo-completo)

---

## 1. ¿Qué hace esta funcionalidad?

El **Formulario de Registro de Reportes** permite a los usuarios crear un reporte de servicio técnico. El reporte captura información como:

- **¿Quién?** → El cliente que solicitó el servicio y el equipo que recibió el servicio.
- **¿Qué pasó?** → Descripción de la falla, trabajo realizado, posible causa y anotaciones.
- **¿Qué repuestos se usaron?** → Lista de repuestos empleados con sus cantidades.
- **Estado del equipo** → Declaración de si el equipo quedó operativo o inoperativo.
- **¿Quiénes participaron?** → Etiquetas de tipo de servicio y técnicos asignados.
- **¿Cuándo?** → Fechas y horas del servicio, número de reporte y plantilla.

---

## 2. Arquitectura del Formulario

El formulario sigue una arquitectura **modular**. Esto significa que el código está dividido en archivos pequeños y especializados, en lugar de tener todo en un solo archivo gigante.

```
form_registro_reportes.tsx  ← Componente principal (orquesta todo)
       │
       ├── sections/        ← Cada sección visual del formulario
       │
       ├── components/      ← Componentes reutilizables (inputs, botones, tablas)
       │
       ├── hooks/           ← Lógica del estado y comportamiento
       │
       ├── constants/       ← Datos fijos (listas de opciones)
       │
       ├── types/           ← Definiciones de TypeScript
       │
       └── utils/           ← Funciones de validación
```

### Principio clave: "Cada archivo hace una sola cosa"

| Archivo | Responsabilidad |
|---------|----------------|
| `form_registro_reportes.tsx` | Unir todas las piezas y renderizar el formulario completo |
| `hooks/useFormReporte.ts` | Manejar todo el estado del formulario (lo que el usuario escribe) |
| `constants/opciones.ts` | Proveer las listas de opciones para selects y radios |
| `utils/validaciones.ts` | Validar que los datos ingresados sean correctos |
| `types/index.ts` | Definir las formas de los datos (interfaces TypeScript) |

---

## 3. Estructura de Archivos

```
registro_reportes/
│
├── form_registro_reportes.tsx     ← 🟢 COMPONENTE PRINCIPAL
├── form_registro_reportes.css     ← Estilos del formulario (usa variables globales)
│
├── types/
│   └── index.ts                   ← Interfaces y tipos de datos
│
├── constants/
│   └── opciones.ts                ← Listas de opciones (clientes, repuestos, etc.)
│
├── utils/
│   └── validaciones.ts            ← Funciones para validar datos
│
├── hooks/
│   └── useFormReporte.ts          ← 🟢 HOOK PRINCIPAL (lógica y estado)
│
├── components/
│   ├── index.ts                   ← Exporta todos los componentes
│   ├── CampoFormulario.tsx        ← Input/Select/Textarea genérico
│   ├── SelectConBotones.tsx       ← Select con botones Add/New + tabla
│   ├── GrupoRadio.tsx             ← Grupo de botones de radio
│   └── BotonesAccion.tsx          ← Botones Guardar/Cancelar
│
└── sections/
    ├── index.ts                   ← Exporta todas las secciones
    ├── DatosCliente.tsx           ← Sección: Cliente + Equipo
    ├── DatosServicio.tsx          ← Sección: Falla + Trabajo + Causa + Anotaciones
    ├── RepuestosEmpleados.tsx     ← Sección: Repuestos con cantidad
    ├── EtiquetasTecnicos.tsx      ← Sección: Etiquetas + Técnicos
    ├── DeclaracionRadio.tsx       ← Sección: Declaración (radio buttons)
    └── DatosControl.tsx           ← Sección: Fechas, horas, número, plantilla
```

### 📁 Archivo de estilos globales (fuera de `registro_reportes/`)

El CSS del formulario (`form_registro_reportes.css`) **NO define sus propios colores**, sino que usa **variables globales** definidas en:

```
frontend/src/componentes/Global.css    ← Archivo con todas las variables CSS del proyecto
```

Esto significa que todos los colores, sombras y bordes del formulario hacen referencia a variables como `var(--color-fondo-oscuro)`, `var(--color-input-fondo)`, etc. Si necesitas cambiar el tema de colores del proyecto completo, solo modificas `Global.css`.

### 🎨 Variables globales que usa el formulario

| Variable | Valor | ¿Para qué se usa en el formulario? |
|----------|-------|------------------------------------|
| `--color-fondo-oscuro` | `#021F54` | Fondo de botones principales, color de textos importantes |
| `--color-texto-claro` | `#FFFFFF` | Texto de botones sobre fondo oscuro |
| `--color-fondo-card` | `#ffffff` | Fondo de las tarjetas (columnas del formulario) |
| `--color-borde-claro` | `#e5e7eb` | Bordes de tarjetas, tablas y grupos |
| `--color-input-fondo` | `#f9fafb` | Fondo de inputs, selects y textareas |
| `--color-input-borde` | `#d1d5db` | Borde de inputs y selects |
| `--color-input-focus-sombra` | `rgba(2, 31, 84, 0.12)` | Sombra de enfoque al hacer clic en inputs |
| `--color-texto-secundario` | `#374151` | Texto de etiquetas de radio, botón cancelar |
| `--color-fondo-tabla-head` | `#f3f4f6` | Fondo de cabeceras de tabla |
| `--color-boton-hover` | `#034088` | Color al pasar el mouse sobre botones principales |
| `--color-boton-secundario-fondo` | `#e5e7eb` | Fondo de botones "New" |
| `--color-boton-secundario-texto` | `#374151` | Texto de botones "New" |
| `--color-error` | `#e74c3c` | Asterisco de campos requeridos, bordes inválidos |
| `--color-error-fondo` | `#fee2e2` | Fondo del botón eliminar (✕) |
| `--color-error-fondo-hover` | `#fecaca` | Fondo del botón eliminar al pasar el mouse |
| `--color-error-texto` | `#991b1b` | Color del icono ✕ |
| `--color-error-borde` | `#fca5a5` | Borde del botón ✕ |
| `--color-error-sombra` | `rgba(231, 76, 60, 0.2)` | Sombra de inputs inválidos al enfocar |
| `--color-sombra-card` | `rgba(0, 0, 0, 0.08)` | Sombra de tarjetas y contenedor de botones |
| `--color-sombra-hover` | `rgba(0, 0, 0, 0.15)` | Sombra de botones al pasar el mouse |
| `--color-sombra-boton` | `rgba(0, 0, 0, 0.2)` | Sombra del botón Guardar |
| `--color-sombra-sutil` | `rgba(0, 0, 0, 0.04)` | Fondo hover de las etiquetas de radio |
| `--border-radius2` | `10px` | Bordes redondeados en inputs, botones y tarjetas |

---

## 4. Flujo de Datos Paso a Paso

### ¿Cómo viaja la información desde que el usuario escribe hasta que se guarda?

```
 PASO 1                          PASO 2                          PASO 3
┌──────────────┐            ┌──────────────────┐            ┌──────────────────┐
│  USUARIO     │  escribe   │  useFormReporte  │  actualiza  │  formData        │
│  escribe en  │ ──────────→│  (hook)          │ ──────────→│  (estado central)│
│  un input    │            │  handleChange()  │            │  {cliente: '...',│
│              │            │  recibe el evento│            │   equipo: '...', │
│              │            │  y extrae        │            │   descripcion... }│
│              │            │  name + value    │            │                  │
└──────────────┘            └──────────────────┘            └──────────────────┘
                                                                     │
 PASO 6                          PASO 5                          PASO 4
┌──────────────┐            ┌──────────────────┐            ┌──────────────────┐
│  formData    │  muestra   │  Secciones       │  reciben    │  formData        │
│  se pasa     │ ──────────→│  (DatosCliente,  │ ←──────────│  (desde el hook) │
│  como props  │            │   DatosServicio, │            │                  │
│  a cada      │            │   etc.)          │            │                  │
│  sección     │            │  renderizan los  │            │                  │
│              │            │  valores actuales│            │                  │
└──────────────┘            └──────────────────┘            └──────────────────┘

 PASO 7                          PASO 8
┌──────────────┐            ┌──────────────────┐
│  USUARIO     │  hace clic │  handleSubmit()  │
│  hace clic   │ ──────────→│  1. Valida fechas│
│  en "Guardar"│            │  2. Valida horas │
│              │            │  3. Valida número│
│              │            │  4. Si todo ok → │
│              │            │     alert("✅ Re- │
│              │            │     porte guar-  │
│              │            │     dado")       │
└──────────────┘            └──────────────────┘
```

### Explicación detallada del flujo:

1. **El usuario escribe** en un campo del formulario (input, select, textarea).
2. **El componente `CampoFormulario`** detecta el cambio y ejecuta `onChange`.
3. **La función `handleChange`** del hook recibe el evento, extrae `name` (nombre del campo) y `value` (valor escrito).
4. **`handleChange` actualiza el estado** `formData` usando `setFormData`.
5. **React re-renderiza** el componente con los nuevos valores.
6. **Cuando el usuario hace clic en "Guardar Reporte"**:
   - Se ejecuta `handleGuardar()` en el componente principal.
   - `handleGuardar()` llama a `handleSubmit()` del hook.
   - `handleSubmit()` ejecuta las validaciones una por una.
   - Si todas pasan, muestra un mensaje de éxito.
7. **Si el usuario hace clic en "Cancelar"**, se ejecuta `limpiarFormulario()` que restablece todos los valores a su estado inicial.

---

## 5. Sección 1: Datos del Cliente

**Archivo:** `sections/DatosCliente.tsx`

### ¿Qué hace?
Muestra dos campos:
- **Cliente**: Un `<select>` (lista desplegable) para elegir el cliente.
- **Equipo**: Un `<input type="text">` para escribir el nombre del equipo.

### ¿Cómo funciona?
```typescript
// Recibe 3 props (propiedades):
interface DatosClienteProps {
  cliente: string;          // El valor actual del campo cliente
  equipo: string;           // El valor actual del campo equipo
  onChange: function;       // Función que se ejecuta cuando el usuario escribe/selecciona algo
}

// Renderiza usando el componente genérico CampoFormulario:
<CampoFormulario
  label="Cliente"
  name="cliente"              // → name = "cliente"
  value={cliente}             // → Muestra el valor actual
  onChange={onChange}
  type="select"               // → Renderiza un <select>
  opciones={CLIENTES}         // → Las opciones vienen de constants/opciones.ts
  required={true}             // → Campo obligatorio
/>

<CampoFormulario
  label="Equipo"
  name="equipo"
  value={equipo}
  onChange={onChange}
  placeholder="Equipo que recibe el servicio"
  required={true}
/>
```

### ¿Qué pasa cuando el usuario selecciona un cliente?
1. El `<select>` detecta el cambio.
2. Ejecuta `onChange` con `{ target: { name: 'cliente', value: 'cliente1' } }`.
3. El hook `useFormReporte` actualiza `formData.cliente = 'cliente1'`.
4. El componente se re-renderiza mostrando el cliente seleccionado.

### Datos de ejemplo (vienen de `constants/opciones.ts`):
```typescript
export const CLIENTES = [
  { value: '', label: 'Selecciona un cliente' },
  { value: 'cliente1', label: 'Cliente 1' },
  { value: 'cliente2', label: 'Cliente 2' },
  { value: 'cliente3', label: 'Cliente 3' },
];
```

> **🔑 Importante:** El primer elemento siempre tiene `value: ''` y funciona como placeholder. `required={true}` evita que se guarde si no se selecciona un cliente real.

---

## 6. Sección 2: Datos del Servicio

**Archivo:** `sections/DatosServicio.tsx`

### ¿Qué hace?
Muestra cuatro campos de texto largos (textarea):

| Campo | Obligatorio | ¿Qué se debe escribir? |
|-------|:-----------:|------------------------|
| **Descripción de la falla** | ✅ Sí | Lo que el cliente reportó que fallaba |
| **Trabajo realizado** | ✅ Sí | Qué se hizo durante el servicio |
| **Posible causa** | ❌ No | Solo si hay pruebas suficientes (circuitos quemados, etc.) |
| **Anotaciones** | ❌ No | Voltaje de alimentación + cualquier observación adicional |

### Detalle técnico
Cada campo usa el componente `CampoFormulario` con `type="textarea"`:
```typescript
<CampoFormulario
  label="Descripción de la falla"
  name="descripcionFalla"
  value={descripcionFalla}
  onChange={onChange}
  placeholder="Descripción de la falla reportada por el cliente"
  type="textarea"
  required={true}
/>
```

Cuando el usuario escribe, el `onChange` captura el texto y actualiza `formData.descripcionFalla`.

---

## 7. Sección 3: Repuestos Empleados

**Archivo:** `sections/RepuestosEmpleados.tsx`

### ¿Qué hace?
Permite seleccionar repuestos, asignarles una cantidad y agregarlos a una lista.

### Paso a paso:

```
1. USUARIO SELECCIONA UN REPUESTO del <select>
       │
       ▼
2. ESCRIBE UNA CANTIDAD en el input numérico
       │
       ▼
3. HACE CLIC EN "Add"
       │
       ▼
4. Se ejecuta agregarRepuesto() en el hook
       │
       ├── ¿repuestoSeleccionado tiene valor? → NO → no hace nada
       │    ¿cantidad es mayor a 0?
       │
       ├── SÍ → Crea un objeto { repuesto: '...', cantidad: '...' }
       │         Lo agrega al array repuestos[]
       │         Limpia los campos de selección
       │
       ▼
5. EL REPUESTO APARECE EN UNA TABLA debajo del select
       │
       ▼
6. USUARIO PUEDE ELIMINARLO haciendo clic en ✕
```

### ¿Cómo se ve en el código?

```typescript
// En useFormReporte.ts
const agregarRepuesto = () => {
  // Solo agrega si hay un repuesto seleccionado Y cantidad válida
  if (formData.repuestoSeleccionado && formData.cantidad && parseInt(formData.cantidad) > 0) {
    const nuevoRepuesto: Repuesto = {
      repuesto: formData.repuestoSeleccionado,  // Ej: "repuesto1"
      cantidad: formData.cantidad                // Ej: "3"
    };
    setFormData(prev => ({
      ...prev,
      repuestos: [...prev.repuestos, nuevoRepuesto],  // Agrega al array
      repuestoSeleccionado: '',                         // Limpia selección
      cantidad: ''                                      // Limpia cantidad
    }));
  }
};

```

### El componente `SelectConBotones` con tipo `"conCantidad"`
Cuando `tipo="conCantidad"`, el componente muestra:
- Un `<select>` para elegir el repuesto.
- Un botón "Add" para agregarlo.
- Un botón "New" (para crear nuevo repuesto, funcionalidad futura).
- Un `<input>` para escribir la cantidad.
- Una tabla con columnas: **Repuesto** | **Cantidad** | **Acciones**

### Estructura del dato `Repuesto` (definido en `types/index.ts`):
```typescript
export interface Repuesto {
  repuesto: string;   // El valor del repuesto seleccionado
  cantidad: string;   // La cantidad (se guarda como string por el input)
}
```

### IMPORTANTE sobre `handleNumericInput`
Para la cantidad se usa una función especial `handleNumericInput` que:
- Solo permite números positivos (enteros o decimales).
- Usa una expresión regular: `/^\d*\.?\d*$/` (solo dígitos y un punto decimal).
- No permite números negativos.

---

## 8. Sección 4: Declaración

**Archivo:** `sections/DeclaracionRadio.tsx`

### ¿Qué hace?
Muestra 4 opciones de radio button para declarar el estado final del equipo:

```typescript
export const DECLARACIONES = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'inoperativo', label: 'Inoperativo' },
  { value: 'no aplica', label: 'No aplica' },
  { value: 'operativo bajo observacion', label: 'Operativo, bajo observación' },
];
```

### Funcionamiento:
- Solo se puede seleccionar una opción (radio button).
- Es un campo **obligatorio** para poder guardar.
- Se renderiza mediante el componente `GrupoRadio`.

```typescript
<GrupoRadio
  label="Declaración"
  name="declaracion"
  valor={declaracion}
  onChange={onChange}
  opciones={DECLARACIONES}
/>
```

### ¿Cómo se comporta un radio button?
Cuando el usuario selecciona "Operativo", el estado se actualiza a:
```typescript
formData.declaracion = 'operativo'
```

---

## 9. Sección 5: Etiquetas y Técnicos

**Archivo:** `sections/EtiquetasTecnicos.tsx`

### ¿Qué hace?
Muestra dos secciones similares:
1. **Etiquetas**: Permite seleccionar etiquetas que categorizan el servicio.
2. **Técnicos**: Permite seleccionar los técnicos que realizaron el servicio.

### ¿Cómo funciona?

```
ETIQUETAS                       TÉCNICOS
┌─────────────────────┐        ┌─────────────────────┐
│ [Select ▼]   Add New│        │ [Select ▼]   Add    │
│                     │        │                     │
│ Tabla:              │        │ Tabla:              │
│ Etiqueta | Acciones │        │ Técnico  | Acciones │
│ ─────────────────── │        │ ─────────────────── │
│ Mantenim. |   ✕     │        │ Técnico 1 |   ✕     │
│ Reparación |   ✕    │        │ Técnico 3 |   ✕     │
└─────────────────────┘        └─────────────────────┘
```

### Agregar una etiqueta (paso a paso en el código):
```typescript
// En useFormReporte.ts
const agregarEtiqueta = () => {
  // Solo agrega si hay una etiqueta seleccionada
  if (formData.etiquetaSeleccionada) {
    setFormData(prev => ({
      ...prev,
      etiquetas: [...prev.etiquetas, formData.etiquetaSeleccionada],  // Agrega al array
      etiquetaSeleccionada: ''  // Limpia la selección
    }));
  }
};
```

### Agregar un técnico (es idéntico al de etiquetas):
```typescript
const agregarTecnico = () => {
  if (formData.tecnicoSeleccionado) {
    setFormData(prev => ({
      ...prev,
      tecnicos: [...prev.tecnicos, formData.tecnicoSeleccionado],
      tecnicoSeleccionado: ''
    }));
  }
};
```

### Eliminar:
```typescript
const eliminarEtiqueta = (index: number) => {
  setFormData(prev => ({
    ...prev,
    etiquetas: prev.etiquetas.filter((_, i) => i !== index)  // Filtra el elemento por su índice
  }));
};
```

> **🔑 Dato importante:** `filter((_, i) => i !== index)` crea un nuevo array con todos los elementos **excepto** el que está en la posición `index`. El `_` significa "ignoramos el valor del elemento, solo nos importa su índice".

---

## 10. Sección 6: Datos de Control

**Archivo:** `sections/DatosControl.tsx`

### ¿Qué hace?
Muestra los campos de control del reporte:

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| **Número del reporte** | `number` | ✅ | Identificador único del reporte |
| **Plantilla** | `select` | ✅ | Plantilla a usar para el reporte |
| **Fecha reporte** | `date` | ✅ | Fecha en que se crea el reporte |
| **Fecha atención** | `date` | ✅ | Fecha en que se realizó el servicio |
| **Hora de inicio** | `time` | ✅ | Hora de inicio del servicio |
| **Hora de finalización** | `time` | ✅ | Hora en que terminó el servicio |

### Comportamiento especial del número de reporte
El campo "Número del reporte" usa `onNumberChange` en lugar de `onChange` normal:
```typescript
const handleNumberChange = (e) => {
  const { name, value } = e.target;
  // Solo permite: vacío O números enteros >= 0
  if (value === '' || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};
```

---

## 11. Validaciones al Guardar

**Archivo:** `utils/validaciones.ts`

Cuando el usuario hace clic en "Guardar Reporte", se ejecuta un proceso de validación en cadena:

### Paso 1: Verificar campos requeridos

La función `validarCamposRequeridos()` verifica que los siguientes campos tengan valor:

```typescript
const validarCamposRequeridos = () => {
  return (
    formData.cliente &&           // Cliente seleccionado
    formData.descripcionFalla &&  // Descripción de falla escrita
    formData.trabajoRealizado &&  // Trabajo realizado escrito
    formData.equipo &&            // Equipo escrito
    formData.declaracion &&       // Declaración seleccionada
    formData.etiquetas.length > 0 &&  // Al menos 1 etiqueta
    formData.tecnicos.length > 0 &&   // Al menos 1 técnico
    formData.numeroReporte &&     // Número de reporte escrito
    formData.fechaReporte &&      // Fecha reporte seleccionada
    formData.fechaAtencion &&     // Fecha atención seleccionada
    formData.horaInicio &&        // Hora inicio seleccionada
    formData.horaFinalizacion     // Hora finalización seleccionada
  );
};
```

> **⚠️ Nota:** Si esta función retorna `false`, el botón "Guardar Reporte" se **deshabilita** (no se puede hacer clic).

### Paso 2: Validar fechas
```typescript
const validarFechas = (fechaReporte, fechaAtencion) => {
  // Si fechaAtencion es anterior a fechaReporte → ERROR
  // Ej: Si el reporte es del 10 de junio pero la atención es del 5 de junio
  if (fechaAtencion < fechaReporte) {
    return { valido: false, mensaje: '❌ Error: La fecha de atención no puede ser anterior a la fecha del reporte' };
  }
  return { valido: true };
};
```

### Paso 3: Validar horas
```typescript
const validarHoras = (horaInicio, horaFinalizacion) => {
  // Validación 1: La hora final no puede ser menor a la inicial
  if (horaFinalizacion < horaInicio) {
    return { valido: false, mensaje: '❌ Error: La hora de finalización no puede ser anterior a la hora de inicio' };
  }
  
  // Validación 2: La duración mínima debe ser de 15 minutos
  // Calcula la diferencia en minutos
  const minutosInicio = horaInicio.split(':').map(Number);  // "09:30" → [9, 30]
  const minutosFin = horaFinalizacion.split(':').map(Number);
  const duracion = (minutosFin[0] * 60 + minutosFin[1]) - (minutosInicio[0] * 60 + minutosInicio[1]);
  
  if (duracion < 15) {
    return { valido: true, mensaje: '⚠️ Advertencia: La duración mínima del servicio debe ser de 15 minutos' };
  }
  return { valido: true };
};
```

### Paso 4: Validar número de reporte
```typescript
const validarNumeroPositivo = (valor) => {
  const num = parseFloat(valor);
  if (valor && (isNaN(num) || num < 0)) {
    return { valido: false, mensaje: '❌ Error: El valor debe ser un número positivo' };
  }
  return { valido: true };
};
```

### Paso 5: Si todo está bien
```typescript
// handleSubmit() en useFormReporte.ts
if (todasLasValidacionesSonCorrectas) {
  console.log('Formulario enviado:', formData);  // Muestra los datos en consola
  alert('✅ Reporte guardado correctamente');    // Mensaje al usuario
  return true;
}
```

> **🔑 Estado actual:** Por ahora el guardado solo muestra un `alert()` y un `console.log()`. En una versión futura, aquí se haría una llamada a una API para guardar en base de datos.

---

## 12. Componentes Reutilizables

### 12.1. `CampoFormulario` (`components/CampoFormulario.tsx`)

**¿Qué hace?** Es un componente "inteligente" que renderiza diferentes tipos de campos según la prop `type`:

| Prop `type` | Renderiza |
|:-----------:|-----------|
| `'text'` | `<input type="text">` |
| `'number'` | `<input type="number">` |
| `'date'` | `<input type="date">` |
| `'time'` | `<input type="time">` |
| `'textarea'` | `<textarea>` |
| `'select'` | `<select>` con opciones |

**Props que recibe:**
```typescript
interface CampoFormularioProps {
  label: string;     // Texto que aparece arriba del campo
  name: string;      // Nombre del campo (clave en formData)
  value: string;     // Valor actual
  onChange: function;// Función que se ejecuta al cambiar
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select';
  opciones?: Array<{ value: string; label: string }>;  // Solo para selects
  min?: string | number;  // Valor mínimo (para number, date)
}
```

### 12.2. `SelectConBotones` (`components/SelectConBotones.tsx`)

**¿Qué hace?** Renderiza un `<select>` con botones "Add" y "New", y una tabla debajo que muestra los items agregados.

**Tiene dos modos:**
- `tipo='simple'`: Para etiquetas y técnicos (solo texto).
- `tipo='conCantidad'`: Para repuestos (incluye columna de cantidad).

**Props clave:**
```typescript
{
  label: string;                  // Título del campo
  name: string;                   // Nombre del select
  seleccionado: string;           // Valor actual seleccionado
  opciones: Array<{...}>;         // Opciones del select
  onAgregar: () => void;          // Función al hacer clic en Add
  onEliminar: (index) => void;    // Función al hacer clic en ✕
  items: string[] | Repuesto[];   // Lista de items agregados
  botonNuevo: boolean;            // Si muestra o no el botón "New"
  tipo: 'simple' | 'conCantidad'; // Modo de visualización
  inputCantidad?: {               // Solo para modo conCantidad
    name: string;
    value: string;
    onChange: function;
  };
}
```

### 12.3. `GrupoRadio` (`components/GrupoRadio.tsx`)

**¿Qué hace?** Renderiza un grupo de radio buttons.

```typescript
interface GrupoRadioProps {
  label: string;
  name: string;
  valor: string;
  onChange: function;
  opciones: Array<{ value: string; label: string }>;
}
```

### 12.4. `BotonesAccion` (`components/BotonesAccion.tsx`)

**¿Qué hace?** Renderiza los botones "Cancelar" y "Guardar Reporte" fijos en la parte inferior.

```typescript
interface BotonesAccionProps {
  onCancelar: () => void;       // Limpia el formulario
  onGuardar: () => void;        // Ejecuta validaciones y guarda
  deshabilitado: boolean;       // Deshabilita "Guardar" si hay campos requeridos vacíos
}
```

> **🔑 Importante:** El botón "Guardar Reporte" se deshabilita (no se puede hacer clic) cuando `validarCamposRequeridos()` retorna `false`, es decir, cuando faltan campos obligatorios.

---

## 13. Diagrama de Flujo Completo

```
                    ┌─────────────────────────────────────┐
                    │     form_registro_reportes.tsx      │
                    │  (Componente Principal)             │
                    │                                     │
                    │  Llama a: useFormReporte()          │
                    │  Obtiene: formData + funciones      │
                    └──────────┬──────────────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              │                │                     │
              ▼                ▼                     ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   Secciones     │ │   Componentes   │ │   Botones       │
    │  (Sections/)    │ │  (Components/)  │ │  (Acción)       │
    │                 │ │                 │ │                 │
    │ • DatosCliente  │ │ • CampoFormulario│ │ • Guardar      │
    │ • DatosServicio │ │ • SelectConBot. │ │ • Cancelar      │
    │ • RepuestosEmp  │ │ • GrupoRadio    │ │                 │
    │ • DeclaracionR  │ │ • BotonesAccion │ │                 │
    │ • EtiquetasTec  │ │                 │ │                 │
    │ • DatosControl  │ │                 │ │                 │
    └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
             │                   │                    │
             │                   │                    │
             ▼                   ▼                    ▼
    ┌──────────────────────────────────────────────────────┐
    │              useFormReporte (Hook)                    │
    │                                                      │
    │  formData = {                                        │
    │    cliente, equipo, descripcionFalla,                │
    │    trabajoRealizado, repuestos[],                    │
    │    posibleCausa, anotaciones, declaracion,           │
    │    etiquetas[], tecnicos[], numeroReporte,           │
    │    plantilla, fechaReporte, fechaAtencion,           │
    │    horaInicio, horaFinalizacion                      │
    │  }                                                   │
    │                                                      │
    │  Funciones:                                          │
    │  • handleChange() → actualiza cualquier campo        │
    │  • handleNumberChange() → solo números positivos     │
    │  • handleNumericInput() → solo números con decimales │
    │  • agregarRepuesto() → agrega a repuestos[]          │
    │  • eliminarRepuesto() → quita de repuestos[]         │
    │  • agregarEtiqueta() → agrega a etiquetas[]          │
    │  • eliminarEtiqueta() → quita de etiquetas[]         │
    │  • agregarTecnico() → agrega a tecnicos[]            │
    │  • eliminarTecnico() → quita de tecnicos[]           │
    │  • handleSubmit() → valida y guarda                  │
    │  • limpiarFormulario() → reinicia todo               │
    │  • validarCamposRequeridos() → check obligatorios    │
    └──────────┬───────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────────┐
    │              Validaciones (utils/validaciones.ts)     │
    │                                                      │
    │  • validarFechas() → fechaAtencion >= fechaReporte   │
    │  • validarHoras() → horaFin > horaInicio, mín 15min │
    │  • validarNumeroPositivo() → número >= 0            │
    │  • validarCampoRequerido() → campo no vacío          │
    └──────────────────────────────────────────────────────┘
```

---

## 🔄 Resumen del Ciclo de Vida del Formulario

```
1. CARGA INICIAL
   ├── Se importa useFormReporte
   ├── Se inicializa formData con valores vacíos (estadoInicial)
   └── Se renderizan todas las secciones con valores vacíos

2. INTERACCIÓN DEL USUARIO (Se repite por cada cambio)
   ├── Usuario escribe/selecciona en un campo
   ├── onChange → handleChange (o función específica)
   ├── setFormData actualiza el estado
   └── React re-renderiza el componente con nuevo valor

3. AGREGAR ITEMS DINÁMICOS (Repuestos, Etiquetas, Técnicos)
   ├── Usuario selecciona un valor y hace clic en "Add"
   ├── Se ejecuta agregarRepuesto/agregarEtiqueta/agregarTecnico
   ├── Se agrega al array correspondiente en formData
   └── Aparece en la tabla con opción de eliminar (✕)

4. GUARDAR (Hacer clic en "Guardar Reporte")
   ├── handleGuardar() → handleSubmit()
   ├── ¿validarCamposRequeridos()? → Si no, botón deshabilitado
   ├── validarFechas() → OK?
   ├── validarHoras() → OK?
   ├── validarNumeroPositivo() → OK?
   ├── Sí: alert("✅ Reporte guardado correctamente")
   └── No: alert("❌ Error: ...") y se cancela el guardado

5. CANCELAR (Hacer clic en "Cancelar")
   └── limpiarFormulario() → formData = estadoInicial (todo vacío)
```

---

## 📝 Notas para Desarrolladores Juniors

### ¿Qué es `useState`?
Es una función de React que permite almacenar datos que pueden cambiar con el tiempo. Cuando los datos cambian, React automáticamente actualiza la pantalla.

```typescript
const [formData, setFormData] = useState(estadoInicial);
// formData → el valor actual
// setFormData → función para actualizar el valor
```

### ¿Qué es el operador spread `...`?
Crea una copia de un objeto o array:
```typescript
const nuevoEstado = {
  ...prev,                    // Copia todas las propiedades actuales
  cliente: 'nuevo valor'      // Solo cambia esta propiedad
};
```

### ¿Qué es `filter`?
Crea un nuevo array con los elementos que cumplan una condición:
```typescript
[1, 2, 3, 4].filter(num => num > 2)  // Resultado: [3, 4]
// En el código: elimina el elemento en la posición 'index'
repuestos.filter((_, i) => i !== index)  // Quita el elemento en 'index'
```

### ¿Dónde se conecta con el backend?
Actualmente **NO hay conexión con backend**. El guardado solo muestra un mensaje en pantalla y en la consola. Para conectarlo a una API, se debe modificar la función `handleSubmit()` en `useFormReporte.ts`.

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué el botón Guardar está deshabilitado?**
R: Porque falta llenar algún campo obligatorio. Revisa: Cliente, Equipo, Descripción de falla, Trabajo realizado, Declaración, al menos 1 etiqueta, al menos 1 técnico, Número de reporte, Fecha reporte, Fecha atención, Hora inicio y Hora finalización.

**P: ¿Cómo agrego una nueva opción al select de clientes?**
R: Ve a `constants/opciones.ts` y agrega un nuevo objeto al array `CLIENTES`:
```typescript
{ value: 'cliente4', label: 'Cliente 4' },
```

**P: ¿Cómo cambio el mensaje de validación?**
R: Ve a `utils/validaciones.ts` y modifica el string en la validación correspondiente.

**P: ¿Dónde se muestran los datos guardados?**
R: Actualmente solo en la consola del navegador (F12 → Console) y en un mensaje `alert()`. No hay persistencia en base de datos todavía.

---

> **📌 Estado del proyecto:** Junio 2026 - Funcionalidad de frontend completa. Pendiente integración con backend API.