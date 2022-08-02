---
display: "Suprimir el exceso de errores de propiedad"
oneline: "Deshabilita la notificación de errores de propiedad en exceso durante la creación de literales de objeto."
---

Esto inhabilita la notificación de errores de exceso de propiedad, como el que se muestra en el siguiente ejemplo:

```ts twoslash
// @errors: 2322
type Point = { x: number; y: number };
const p: Point = { x: 1, y: 3, m: 10 };
```

Esta marca se agregó para ayudar a las personas a migrar a la comprobación más estricta de nuevos objetos literales en [*TypeScript 1.6*](/docs/handbook/release-notes/typescript-1-6.html#stricter-object-literal-assign-checks).

No recomendamos usar esta bandera en un código base moderno, puedes suprimir los casos únicos en los que lo necesites usando `//@ts-ignore`.
