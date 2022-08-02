---
title: Entender los errores
layout: docs
permalink: /docs/handbook/2/understanding-errors.html
oneline: "Cómo leer errores de TypeScript."
---

# Entender los errores

Siempre que *TypeScript* encuentra un error, intenta explicar qué salió mal con el mayor detalle posible.
Debido a que su sistema de tipos es estructural, esto a menudo significa proporcionar descripciones algo largas de dónde encontró un problema.

## Terminología

Existe cierta terminología que verás con frecuencia en los mensajes de error que es útil comprender.

#### *asignable a*

*TypeScript* considera un tipo *asignable a* otro tipo si uno es un sustituto aceptable del otro.
En otras palabras, un `Gato` es *asignable a* un `Animal` porque un `Gato` es un sustituto aceptable de un `Animal`.

Como su nombre lo indica, esta relación se usa para comprobar la validez de una asignación `t = s;` examinando los tipos de `t` y `s`.
También se usa para revisar la mayoría de los otros lugares donde interactúan dos tipos.
Por ejemplo, al llamar a una función, el tipo de cada argumento debe ser *asignable al* tipo declarado del parámetro.

De manera informal, si ves que `T no se puede asignar a S`, puedes pensar que *TypeScript* dice "*`T` y `S` no son compatibles*".
Sin embargo, ten en cuenta que esta es una relación *direccional*: El hecho de que `S` sea asignable a `T` no implica que `T` sea asignable a `S`.

## Ejemplos

Veamos algunos ejemplos de mensajes de error y comprendamos qué está pasando.

### Elaboración de errores

Cada error comienza con un mensaje inicial, a veces seguido de más submensajes.
Puedes pensar en cada mensaje secundario como una respuesta a una pregunta "¿por qué?" sobre el mensaje de arriba.
Analicemos algunos ejemplos para ver cómo funcionan en la práctica.

Aquí hay un ejemplo que produce un mensaje de error más largo que el propio ejemplo:

```ts twoslash
// @errors: 2322
let a: { m: number[] };
let b = { m: [""] };
a = b;
```

*TypeScript* encontró un error al revisar la última línea.
Su lógica para emitir un error se deriva de su lógica para determinar si la asignación es correcta:

1. ¿El tipo de `b` se puede asignar a `a`? No. ¿Por qué?
2. Porque el tipo de la propiedad `m` es incompatible. ¿Por qué?
3. Porque la propiedad `m` de `b` (`string[]`) no se puede asignar a la propiedad `m` de `a` (`number[]`). ¿Por qué?
4. Debido a que el tipo de elemento de un arreglo (`string`) no se puede asignar al otro (`number`)

### Propiedades extra

```ts twoslash
// @errors: 2322
type A = { m: number };
const a: A = { m: 10, n: "" };
```

### Asignaciones de unión

```ts twoslash
// @errors: 2322
type Thing = "none" | { name: string };

const a: Thing = { name: 0 };
```
