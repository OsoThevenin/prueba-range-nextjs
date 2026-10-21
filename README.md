# Prueba técnica · Componente Range

Componente `<Range />` hecho a medida (sin `<input type="range">`) con Next.js 16 (App Router), React 19 y TypeScript.

## Resumen

| | |
|---|---|
| **Ejercicio 1** · `/exercise1` | Rango normal. `min` y `max` vienen de un servicio mock. Los dos tiradores se arrastran, y las etiquetas se pueden editar para cambiar los límites del rango. |
| **Ejercicio 2** · `/exercise2` | Rango de valores fijos. Los valores vienen de un servicio mock. Los tiradores solo se colocan sobre esos valores, y las etiquetas, en euros, son de solo lectura. |
| **Interacción** | Ratón y táctil (Pointer Events), teclado (flechas) y accesible (`role="slider"` con atributos ARIA). |
| **Tests** | 100 tests unitarios y de componente (Vitest + Testing Library) y 11 tests E2E (Playwright). |

### Puesta en marcha

```bash
pnpm install
cp .env.example .env      # APP_BASE_URL=http://localhost:8080
pnpm dev                  # http://localhost:8080
```

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 8080 |
| `pnpm test` | Vitest |
| `pnpm test:coverage` | Vitest con cobertura |
| `pnpm test:e2e` | Playwright |

## Arquitectura

```
app/
  page.tsx                  Portada con enlaces a los dos ejercicios
  exercise1/                page.tsx (Server Component) + error.tsx
  exercise2/                page.tsx (Server Component) + error.tsx
  api/range/route.ts        Mock: GET → { min, max }
  api/range-values/route.ts Mock: GET → { rangeValues: number[] }
components/
  range.tsx                 Componente Range (interacción y render)
  range-label.tsx           Etiqueta: texto, o input si es editable
  range-error.tsx           UI de error compartida por las dos rutas
  range.css                 Estilos del componente (BEM)
hooks/
  use-range.ts              Estado y reglas del rango
  use-body-cursor.ts        Cursor global mientras se arrastra
lib/
  schemas.ts                Esquemas zod y tipos inferidos del modelo de datos
  range.utils.ts            Funciones puras: clamp, valor ↔ porcentaje
services/
  range-service.ts          Cliente HTTP de los mocks, con validación
e2e/                        Tests Playwright
```

Los tests unitarios y de componente están junto al archivo que prueban (`*.test.ts(x)`). Los E2E viven en `e2e/` (`*.spec.ts`).

### Flujo de datos

```
Route Handler (mock) ──HTTP──▶ range-service (valida con zod) ──▶ page.tsx (Server Component)
                                                                      │  <Suspense>
                                                                      ▼
                                                               <Range /> (Client Component)
```

## Implementación del Range

- **Una escala interna para los dos modos.** En el modo normal, la posición de cada tirador es el valor real. En el modo de valores fijos es el índice de la opción (`0 … n-1`), así que las opciones quedan equidistantes en la pista y el «encaje» a un valor válido sale solo al redondear. `toValue()` traduce un índice a su valor real.
- **Arrastre con Pointer Events.** `setPointerCapture` hace que el tirador siga al puntero aunque este salga del elemento. La coordenada X se convierte en un valor con `positionToValue()`, una función pura de `lib/range.utils.ts`.
- **Los tiradores no se cruzan.** Cada tirador se limita (`clamp`) entre el límite de la escala y la posición del otro.
- **Etiquetas editables (solo en el modo normal).** Al pulsar una etiqueta, aparece un input numérico. Enter o perder el foco confirma el valor, y Escape lo cancela. Un valor nuevo puede ampliar o reducir la escala, y el otro tirador se reajusta si queda fuera. Los valores inválidos (vacío, o `min ≥ max`) se ignoran.
- **Feedback visual.** El tirador crece al pasar el ratón por encima y el cursor pasa a `grab`/`grabbing`. Mientras se arrastra, `useBodyCursor` mantiene `grabbing` en toda la página, para que el cursor no parpadee cuando el puntero sale del tirador.
- **Accesibilidad.** Cada tirador es un `role="slider"` enfocable, con `aria-valuemin`, `aria-valuemax`, `aria-valuenow` y `aria-valuetext` (este último en euros en el modo fijo). Las flechas mueven el tirador un paso. Al confirmar o cancelar la edición con el teclado, el foco vuelve a la etiqueta.

## Testing

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unitario | Vitest | `range.utils`, `range-service` (contrato HTTP, errores, payloads inválidos, `APP_BASE_URL`), hooks (`renderHook`) y Route Handlers |
| Componente | Vitest + Testing Library + user-event | `<Range />` en los dos modos: arrastre, teclado, edición de etiquetas, límites y accesibilidad. También `<RangeError />` |
| E2E | Playwright (Chromium) | Los dos ejercicios en un navegador real contra los mocks reales: render, arrastre, que los tiradores no se crucen, edición y teclado |

## Decisiones

### Componentes: `Range` y `RangeLabel`

He dividido la UI siguiendo las best practices de React

1. **Separar la UI en componentes con una sola responsabilidad.** `Range` coordina la pista, los tiradores y las etiquetas. `RangeLabel` solo sabe mostrar un valor o editarlo. `RangeError` es la UI de error compartida.
2. **Estado mínimo.** El estado se reduce a los límites editables (`bounds`) y la posición de los tiradores (`position`). Todo lo demás se calcula al renderizar: la escala, los porcentajes de la pista y el texto formateado.
3. **Dónde vive el estado.** El rango vive en `Range` (a través de `useRange`), porque lo necesitan tanto los tiradores como las etiquetas. El borrador del input es local de `RangeLabel`, porque solo le importa a ella.
4. **Flujo de datos inverso.** `RangeLabel` no cambia el rango por su cuenta: avisa con `onCommit(value)` y `Range` decide si el valor es válido.

### Hooks extraídos: `useRange` y `useBodyCursor`

- **`useRange`** reúne las reglas del rango: la escala, el `clamp` entre tiradores, la traducción entre índice y valor, y el reajuste al editar un límite. Separarlo de la interacción (eventos de puntero y teclado) y del render permite **probar la lógica de forma aislada** con `renderHook`, sin DOM ni eventos simulados. Además, se puede **reutilizar** con otra UI, por ejemplo un rango vertical o un input con otro aspecto.
- **`useBodyCursor`** es genérico: aplica un cursor a toda la página mientras está activo y restaura el anterior al desactivarse o desmontarse. **Se puede reutilizar** en cualquier interacción de arrastre.

### Validación con zod

Todo lo que llega por HTTP se trata como dato no fiable. He usado **zod** porque es el estándar de facto para validar datos en TypeScript y porque **el esquema es la única fuente de verdad del modelo de datos**: los tipos (`RangeType`, `RangeValuesType`) se infieren de los esquemas, así que el tipo y la validación en tiempo de ejecución no pueden desincronizarse. Los esquemas también recogen las reglas del dominio:

- El rango necesita `min < max`, con números finitos.
- Los valores fijos son una lista no vacía, en orden estrictamente ascendente.

`APP_BASE_URL` también se valida antes de cada petición. Si falta o no es una URL http(s), falla con un mensaje claro en lugar de intentar hacer fetch a `undefined/api/range`.
