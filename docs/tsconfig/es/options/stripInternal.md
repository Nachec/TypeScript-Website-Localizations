---
display: "Quitar Internal"
oneline: "Deshabilita la emisión de declaraciones que tengan `@internal` en sus comentarios JSDoc."
---

No emite declaraciones para el código que tenga una anotación `@internal` en su comentario *JSDoc*.
Esta es una opción del compilador interno; úsala bajo tu propio riesgo, porque el compilador no verifica que el resultado sea válido.
Si estás buscando una herramienta para manejar niveles adicionales de visibilidad dentro de tus archivos `d.ts`, mira [`api-extractor`](https://api-extractor.com).

```ts twoslash
/**
 * Días disponibles en una semana
 * @internal
 */
export const daysInAWeek = 7;

/** Calcula cuánto gana alguien en una semana */
export function weeklySalary(dayRate: number) {
  return daysInAWeek * dayRate;
}
```

Con la bandera establecida en `false` (predeterminado):

```ts twoslash
// @showEmittedFile: index.d.ts
// @showEmit
// @declaration
/**
 * Días disponibles en una semana
 * @internal
 */
export const daysInAWeek = 7;

/** Calcula cuánto gana alguien en una semana */
export function weeklySalary(dayRate: number) {
  return daysInAWeek * dayRate;
}
```

Con `stripInternal` establecido en `true`, se redactarán los `d.ts` emitidos.

```ts twoslash
// @stripinternal
// @showEmittedFile: index.d.ts
// @showEmit
// @declaration
/**
 * Días disponibles en una semana
 * @internal
 */
export const daysInAWeek = 7;

/** Calcula cuánto gana alguien en una semana */
export function weeklySalary(dayRate: number) {
  return daysInAWeek * dayRate;
}
```

La salida de *JavaScript* sigue siendo la misma.
