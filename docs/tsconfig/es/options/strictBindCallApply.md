---
display: "Aplicar llamada de enlace estricto"
oneline: "Comprueba que los argumentos de los métodos `bind`, `call` y `apply` coincidan con la función original."
---

Cuando se establece, *TypeScript* comprobará que los métodos integrados de las funciones `call`, `bind` y `apply` se invocan con el argumento correcto para la función subyacente:

```ts twoslash
// @strictBindCallApply: true
// @errors: 2345

// Con StrictBindCallApply en
function fn(x: string) {
  return parseInt(x);
}

const n1 = fn.call(undefined, "10");

const n2 = fn.call(undefined, false);
```

De lo contrario, estas funciones aceptan cualquier argumento y devolverán `any`:

```ts twoslash
// @strictBindCallApply: false

// Con StrictBindCallApply desactivado
function fn(x: string) {
  return parseInt(x);
}

// Nota: No hay error; el tipo de retorno es 'any'
const n = fn.call(undefined, false);
```
