---
display: "Suprimir errores de índice implícitos"
oneline: "Suprime los errores `noImplicitAny` al indexar objetos que carecen de índice de firmas."
---

Al activar `suppressImplicitAnyIndexErrors`, se suprime la notificación del error sobre `any`s implícitos al indexar en objetos, como se muestra en el siguiente ejemplo:

```ts twoslash
// @noImplicitAny: true
// @suppressImplicitAnyIndexErrors: false
// @strict: true
// @errors: 7053
const obj = { x: 10 };
console.log(obj["foo"]);
```

El uso de `suppressImplicitAnyIndexErrors` es un enfoque bastante drástico. Se recomienda utilizar un comentario `@ts-ignore` en su lugar:

```ts twoslash
// @noImplicitAny: true
// @strict: true
const obj = { x: 10 };
// @ts-ignore
console.log(obj["foo"]);
```
