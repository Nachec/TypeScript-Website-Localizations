---
title: Tipos de acceso indexado
layout: docs
permalink: /docs/handbook/2/indexed-access-types.html
oneline: "Usar la sintaxis Type['a'] para acceder a un subconjunto de un tipo."
---

Podemos usar un *tipo de acceso indexado* para buscar una propiedad específica en otro tipo:

```ts twoslash
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"];
//   ^?
```

El tipo de indexación en sí mismo es un tipo, por lo que podemos usar uniones, `keyof` u otros tipos completamente:

```ts twoslash
type Person = { age: number; name: string; alive: boolean };
// ---cut---
type I1 = Person["age" | "name"];
//   ^?

type I2 = Person[keyof Person];
//   ^?

type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName];
//   ^?
```

Incluso verás un error si intentas indexar una propiedad que no existe:

```ts twoslash
// @errors: 2339
type Person = { age: number; name: string; alive: boolean };
// ---cut---
type I1 = Person["alve"];
```

Otro ejemplo de indexación con un tipo arbitrario es usar `number` para obtener el tipo de los elementos de un arreglo.
Podemos combinar esto con `typeof` para capturar convenientemente el tipo de elemento de un arreglo literal:

```ts twoslash
const MyArray = [
  { name: "Alice", age: 15 },
  { name: "Bob", age: 23 },
  { name: "Eve", age: 38 },
];

type Person = typeof MyArray[number];
//   ^?
type Age = typeof MyArray[number]["age"];
//   ^?
// O
type Age2 = Person["age"];
//   ^?
```

Solo puedes usar tipos al indexar, lo que significa que no puedes usar una `const` para hacer una referencia de variable:

```ts twoslash
// @errors: 2538 2749
type Person = { age: number; name: string; alive: boolean };
// ---cut---
const key = "age";
type Age = Person[key];
```

Sin embargo, puedes usar un alias de tipo para un estilo similar de refactorización:

```ts twoslash
type Person = { age: number; name: string; alive: boolean };
// ---cut---
type key = "age";
type Age = Person[key];
```
