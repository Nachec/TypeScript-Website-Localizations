---
display: "Sin any implícito"
oneline: "Habilita el informe de errores para expresiones y declaraciones con un tipo `any` implícito."
---

En algunos casos en los que no hay anotaciones de tipo, *TypeScript* recurrirá a un tipo `any` para una variable cuando no pueda inferir el tipo.

Esto puede hacer que se pierdan algunos errores, por ejemplo:

```ts twoslash
// @noImplicitAny: false
function fn(s) {
  // ¿No hay error?
  console.log(s.subtr(3));
}
fn(42);
```

Sin embargo, al activar `noImplicitAny`, *TypeScript* emitirá un error siempre que haya inferido `any`:

```ts twoslash
// @errors: 7006
function fn(s) {
  console.log(s.subtr(3));
}
```
