---
display: "Sin controles genéricos estrictos"
oneline: "Desactiva la comprobación estricta de firmas genéricas en tipos de `function`."
---

*TypeScript* unificará los parámetros de tipo al comparar dos funciones genéricas.

```ts twoslash
// @errors: 2322

type A = <T, U>(x: T, y: U) => [T, U];
type B = <S>(x: S, y: S) => [S, S];

function f(a: A, b: B) {
  b = a; // Bien
  a = b; // Error
}
```

Esta bandera se puede utilizar para eliminar esa marca.
