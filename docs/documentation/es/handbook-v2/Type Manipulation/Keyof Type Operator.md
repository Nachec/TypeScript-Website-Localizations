---
title: Operador de tipo Keyof
layout: docs
permalink: /docs/handbook/2/keyof-types.html
oneline: "Usar el operador keyof en contextos de tipo."
---

## Operador de tipo `Keyof`

El operador `keyof` toma un tipo de objeto y produce una cadena o unión literal numérica de sus claves.
El siguiente tipo `P` es del mismo tipo que `"x" | "y"`:

```ts twoslash
type Point = { x: number; y: number };
type P = keyof Point;
//   ^?
```

Si el tipo tiene un índice de firma `string` o `number`, `keyof` devolverá esos tipos en su lugar:

```ts twoslash
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
//   ^?

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
//   ^?
```

Ten en cuenta que en este ejemplo, `M` es `string | number` - esto se debe a que las claves de objetos *JavaScript* siempre están forzadas a una cadena, por lo que `obj[0]` siempre es lo mismo que `obj["0"]`.

Los tipos `keyof` se vuelven especialmente útiles cuando se combinan con tipos asignados, sobre los que aprenderemos más adelante.
