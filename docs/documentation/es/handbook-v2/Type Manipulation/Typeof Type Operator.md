---
title: Operador de tipo Typeof
layout: docs
permalink: /docs/handbook/2/typeof-types.html
oneline: "Usar el operador typeof en contextos de tipo."
---

## El operador de tipo `typeof`

*JavaScript* ya tiene un operador `typeof` que puedes usar en un contexto de *expresión*:

```ts twoslash
// Imprime "string"
console.log(typeof "Hello World");
```

*TypeScript* agrega un operador `typeof` que puedes usar en un contexto `type` para referirte al *tipo* de una variable o propiedad:

```ts twoslash
let s = "hola";
let n: typeof s;
//  ^?
```

Esto no es muy útil para tipos básicos, pero combinado con otros operadores de tipo, puedes usar `typeof` para expresar convenientemente muchos patrones.
Para un ejemplo, comencemos mirando el tipo predefinido `ReturnType<T>`.
Este toma un *tipo* `function` y produce su tipo de retorno:

```ts twoslash
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>;
//   ^?
```

Si intentamos usar `ReturnType` en el nombre de una función, vemos un error instructivo:

```ts twoslash
// @errors: 2749
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>;
```

Recuerda que *valores* y *tipos* no son lo mismo.
Para referirnos al *tipo* que tiene el *valor `f`*, usamos `typeof`:

```ts twoslash
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
//   ^?
```

### Limitaciones:

*TypeScript* limita intencionalmente el tipo de expresiones en las que puede usar `typeof`.

Específicamente, solo es legal usar `typeof` en identificadores (es decir, nombres de variables) o sus propiedades.
Esto ayuda a evitar la confusa trampa de escribir código que cree que se está ejecutando, pero no es así:

```ts twoslash
// @errors: 1005
declare const msgbox: () => boolean;
// tipo msgbox = any;
// ---cut---
// Destinado a usar = ReturnType <typeof msgbox>
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
```
