---
title: TypeScript para programadores funcionales
short: TS para programadores funcionales
layout: docs
permalink: /docs/handbook/typescript-in-5-minutes-func.html
oneline: Aprende TypeScript si tienes experiencia en programación funcional
---

*TypeScript* comenzó su vida como un intento de traer tipos tradicionales orientados a objetos
a *JavaScript* para que los programadores de *Microsoft* pudieran traer
a la web programas orientados a objetos tradicionales. A medida que se ha desarrollado, el sistema de tipos de *TypeScript*
ha evolucionado para modelar el código escrito por *JavaScript*ers nativos. El
sistema resultante es poderoso, interesante y desordenado.

Esta introducción está diseñada para programadores de *Haskell* o *ML*
que quieran aprender *TypeScript*. Describe cómo el sistema de tipos de
*TypeScript* se diferencia del sistema de tipos de *Haskell*. También describe
características únicas del sistema de tipos de *TypeScript* que surgen de su
modelado de código *JavaScript*.

Esta introducción no cubre la programación orientada a objetos. En
la práctica, los programas orientados a objetos en *TypeScript* son similares a los
de otros lenguajes populares con funciones *OO*.

## Requisitos previos

En esta introducción, supongo que sabes lo siguiente:

- Cómo programar en *JavaScript*, las partes buenas.
- La sintaxis de tipos de un lenguaje descendiente de *C*.

Si necesitas aprender las partes buenas de *JavaScript*, lee
[*JavaScript*: Las partes buenas](http://shop.oreilly.com/product/9780596517748.do).
Es posible que puedas omitir el libro si sabes cómo escribir programas en
un lenguaje de alcance léxico de llamada por valor con mucha mutabilidad y
no mucho más.
[*R<sup>4</sup>RS Scheme*](https://people.csail.mit.edu/jaffer/r4rs.pdf) es un buen ejemplo.

[El lenguaje de programación](http://www.stroustrup.com/4th.html) es
un buen lugar para aprender sobre la sintaxis de tipos al estilo C. A diferencia de C++,
*TypeScript* usa tipos posfijos, así: `x: string` en lugar de `string x`.

## Conceptos que no están en *Haskell*

## Tipos integrados

*JavaScript* define 8 tipos integrados:

| Tipo        | Explicación                                      |
| ----------- | ------------------------------------------- |
| `Number`    |  un coma flotante *IEEE 754* de doble precisión.  |
| `String`    | una cadena UTF-16 inmutable.                     |
| `BigInt`    | enteros en el formato de precisión arbitraria.   |
| `Boolean`   | `true` y `false`.                                |
| `Symbol`    | un valor único que se suele utilizar como clave.       |
| `Null`      | equivalente al tipo `unit`.                |
| `Undefined` | también equivalente al tipo `unit`.           |
| `Object`    | similar a los registros.                         |

[Ve la página MDN para más detalles](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures).

*TypeScript* tiene los tipos primitivos correspondientes para los tipos integrados:

- `number`
- `string`
- `bigint`
- `boolean`
- `symbol`
- `null`
- `undefined`
- `object`

### Otros tipos importantes de *TypeScript*

| Tipo           | Explicación                                                            |
| -------------- | ----------------------------------------------------------- |
| `unknown`      | el tipo superior.                                               |
| `never`        | el tipo inferior.                                             |
| objeto literal | ej. `{ propiedad: Tipo }`                                               |
| `void`         | un subtipo de `undefined` destinado a utilizarse como tipo de retorno. |
| `T[]`          | arreglos mutables, también escritos `Array<T>`                         |
| `[T, T]`       | tuplas, que son de longitud fija pero mutables                         |
| `(t: T) => U`  | funciones                                                              |

Notas:

1. La sintaxis de la función incluye nombres de parámetros. ¡Es bastante difícil acostumbrarse!

   ```ts
   let fst: (a: any, b: any) => any = (a, b) => a;

   // o con más precisión:

   let fst: <T, U>(a: T, b: U) => T = (a, b) => a;
   ```

2. La sintaxis del tipo objeto literal refleja de cerca la sintaxis del valor del objeto literal:

   ```ts
   let o: { n: number; xs: object[] } = { n: 1, xs: [] };
   ```

3. `[T, T]` es un subtipo de `T[]`. Esto es diferente a *Haskell*, donde las tuplas no están relacionadas con listas.

### Tipos empaquetados

*JavaScript* tiene equivalentes a tipos primitivos  empaquetados que contienen los
métodos que los programadores asocian con esos tipos. *TypeScript*:
refleja esto con, por ejemplo, la diferencia entre el tipo primitivo
`number` y el tipo empaquetado `Number`. Los tipos empaquetados rara vez son
necesarios, ya que sus métodos devuelven primitivos.

```ts
(1).toExponential();
// equivalente a
Number.prototype.toExponential.call(1);
```

Ten en cuenta que llamar a un método en un literal numérico requiere que esté entre
paréntesis para ayudar al analizador.

## Tipado gradual

*TypeScript* usa el tipo `any` siempre que no pueda decir de qué tipo
debería ser una expresión. En comparación con `Dynamic`, llamar a `any` un tipo
es una exageración. Simplemente apaga el comprobador de tipos
dondequiera que aparezca. Por ejemplo, puedes insertar cualquier valor en un
'any[]' sin marcar el valor de ninguna manera:

```ts twoslash
// con "noImplicitAny": falso en tsconfig.json, anys: any[]
const anys = [];
anys.push(1);
anys.push("oh no");
anys.push({ algo: "va" });
```

Y puedes usar una expresión de tipo `any` en cualquier lugar:

```ts
anys.map(anys[1]); // oh no, "oh no" no es una función
```

`any` también es contagioso ⏤ si inicias una variable con una
expresión de tipo `any`, la variable también tiene el tipo `any`.

```ts
let sepsis = anys[0] + anys[1]; // esto podría significar cualquier cosa
```

Para obtener un error cuando *TypeScript* produce un `any`, utiliza
`"noImplicitAny": true`, o `"strict": true` en `tsconfig.json`.

## Tipado estructural

El tipado estructural es un concepto familiar para la mayoría
de los programadores, aunque *Haskell* y la mayoría de los *ML* no son
tipados estructuralmente. Su forma básica es bastante simple:

```ts
// @strict: false
let o = { x: "hi", extra: 1 }; // Bien
let o2: { x: string } = o; // Bien
```

Aquí, el objeto literal `{ x: "hi", extra: 1 }` tiene una coincidencia
de tipo literal `{ x: string, extra: number }`. Ese
tipo se puede asignar a `{ x: string }` debido a que
tiene todas las propiedades requeridas y esas propiedades tienen
tipos asignables. La propiedad adicional no impide la asignación,
simplemente la convierte en un subtipo de `{ x: string }`.

Los tipos con nombre simplemente dan un nombre a un tipo; a efectos de asignabilidad
no hay diferencia entre el alias de tipo `One` y la interfaz
de tipo `Two` a continuación. Ambos tienen una propiedad `p: string`. (Los alias de tipo
se comportan de manera diferente de las interfaces con respecto a las definiciones
recursivas y tipo de parámetros, sin embargo).

```ts twoslash
// @errors: 2322
type One = { p: string };
interface Two {
  p: string;
}
class Three {
  p = "Hello";
}

let x: One = { p: "hi" };
let two: Two = x;
two = new Three();
```

## Uniones

En *TypeScript*, los tipos unión no están etiquetados. En otras palabras, no son
uniones discriminadas como `datos` en *Haskell*. Sin embargo, a menudo puedes
discriminar tipos en una unión usando etiquetas integradas u otras propiedades.

```ts twoslash
function start(
  arg: string | string[] | (() => string) | { s: string }
): string {
  // esto es muy común en JavaScript
  if (typeof arg === "string") {
    return commonCase(arg);
  } else if (Array.isArray(arg)) {
    return arg.map(commonCase).join(",");
  } else if (typeof arg === "function") {
    return commonCase(arg());
  } else {
    return commonCase(arg.s);
  }

  function commonCase(s: string): string {
    // por último, simplemente convierte una cadena en otra cadena
    return s;
  }
}
```

`string`, `Array` y `Function` tienen predicados de tipo integrados,
convenientemente dejando el tipo de objeto para la rama `else`. Es
posible, sin embargo, generar uniones que son difíciles de
diferenciar en el entorno de ejecución. Para código nuevo, es mejor compilar solo
uniones discriminadas.

Los siguientes tipos tienen predicados integrados:

| Tipo | Predicado |
| ---- | ----------------- |
| `string`    | `typeof s === "string"`            |
| `number`    | `typeof n === "number"`            |
| `bigint`    | `typeof m === "bigint"`            |
| `boolean`   | `typeof b === "boolean"`           |
| `symbol`    | `typeof g === "symbol"`            |
| `undefined` | `typeof undefined === "undefined"` |
| `function`  | `typeof f === "function"`          |
| `array`     | `Array.isArray(a)`                 |
| `object`    | `typeof o === "object"`            |

Ten en cuenta que las funciones y los arreglos son objetos en el entorno de ejecución, pero tienen sus
propios predicados.

### Intersecciones

Además de las uniones, *TypeScript* también tiene intersecciones:

```ts twoslash
type Combined = { a: number } & { b: string };
type Conflicting = { a: number } & { a: string };
```

`Combined` tiene dos propiedades, `a` y `b`, como si se hubieran
escrito como un tipo de objeto literal. Las intersecciones y la uniones son
recursivas en caso de conflictos, por lo que `Conflicting.a: number & string`.

## Tipos `unit`

Los tipos `unit` son subtipos de tipos primitivos que contienen exactamente un
valor primitivo. Por ejemplo, la cadena `"foo"` tiene el tipo
`"foo"`. Dado que *JavaScript* no tiene enumeraciones integradas, es común usar un conjunto de
cadenas bien conocidas en su lugar. Las uniones de tipos `string` literal permiten
que en *TypeScript* escribas este patrón:

```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
pad("hi", 10, "left");
```

Cuando sea necesario, el compilador `widens` &mdash; se convierte en
supertipo &mdash; el tipo `unit` al tipo primitivo, tal como `"foo"`
a `string`. Esto sucede cuando se usa la mutabilidad, que puede dificultar algunos
usos de variables mutables:

```ts twoslash
// @errors: 2345
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s = "right";
pad("hi", 10, s); // error: 'string' no se puede asignar a '"left" | "right"'
```

Así es como ocurre el error:

- `"right": "right"`
- `s: string` porque `"right"` se expande a `string` en la asignación a una variable mutable.
- `string` no se puede asignar a `"left" | "right"`

Puedes solucionar esto con una anotación de tipo para `s`, pero eso
a su vez evita asignaciones a `s` de variables que no son de tipo
`"left" | "right"`.

```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s: "left" | "right" = "right";
pad("hi", 10, s);
```

## Conceptos similares a *Haskell*

## Tipado contextual

*TypeScript* tiene algunos lugares obvios donde puede inferir tipos, como
declaraciones de variables:

```ts twoslash
let s = "¡Soy una cadena!";
```

Pero también infiere tipos en algunos otros lugares que quizás no esperes
si has trabajado con otros lenguajes de sintaxis C:

```ts twoslash
declare function map<T, U>(f: (t: T) => U, ts: T[]): U[];
let sns = map((n) => n.toString(), [1, 2, 3]);
```

Aquí, `n: number` en este ejemplo también, a pesar de que `T` y `U`
no se han inferido antes de la llamada. De hecho, después de `[1,2,3]`
se ha utilizado para inferir `T=number`, el tipo de retorno de `n => n.toString()`
se usa para inferir `U=string`, lo que hace que `sns` tenga el tipo
`string[]`.

Ten en cuenta que la inferencia funcionará en cualquier orden, pero intellisense solo
trabaja de izquierda a derecha, por lo que *TypeScript* prefiere declarar `map` con el
primer arreglo:

```ts twoslash
declare function map<T, U>(ts: T[], f: (t: T) => U): U[];
```

La escritura contextual también funciona de forma recursiva a través de objetos literales, y
en tipos de unidades que de otro modo se inferirían como `string` o
`number`. Y puede inferir tipos de retorno desde el contexto:

```ts twoslash
declare function run<T>(thunk: (t: T) => void): T;
let i: { inference: string } = run((o) => {
  o.inference = "INSERT STATE HERE";
});
```

Se determina que el tipo de `o` es `{ inference: string }` porque

1. Los iniciadores de declaración se escriben contextualmente por la
   declaración `type`: `{ inference: string }`.
2. El tipo de retorno de una llamada usa el tipo contextual para inferencias,
   por lo que el compilador infiere que `T={ inference: string }`.
3. Las funciones de flecha usan el tipo contextual para asignar el tipo a sus parámetros,
   entonces el compilador da `o: { inference: string }`.

Y lo hace mientras escribes, de modo que después de escribir `o`,
obtienes terminaciones para la propiedad `inference`, junto con cualquier otra
propiedad que tendrías en un programa real.
En total, esta característica puede hacer que la inferencia de *TypeScript* parezca un poco
como un motor de inferencia de tipo unificador, pero no lo es.

## Alias de tipo

Los alias de tipo son meros alias, como `type` en *Haskell*. El
compilador intentará utilizar el nombre de alias siempre que se haya utilizado en
el código fuente, pero no siempre tiene éxito.

```ts twoslash
type Size = [number, number];
let x: Size = [101.1, 999.9];
```

El equivalente más cercano a `newtype` es una *intersección etiquetada*:

```ts
type FString = string & { __compileTimeOnly: any };
```

Una `FString` es como una cadena normal, excepto que el compilador
cree que tiene una propiedad llamada `__compileTimeOnly` que no
existe realmente. Esto significa que `FString` todavía se puede asignar a
`string`, pero no al revés.

## Uniones discriminadas

El equivalente más cercano a `datos` es una unión de tipos con propiedades
discriminantes, normalmente llamadas uniones discriminadas en *TypeScript*:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
```

A diferencia de *Haskell*, la etiqueta, o discriminante, es solo una propiedad en cada
tipo de objeto. Cada variante tiene una propiedad idéntica con un
tipo `unit`. Este sigue siendo un tipo de unión normal; el `|` principal es
una parte opcional de la sintaxis del tipo unión. Puedes discriminar los
miembros de la unión usando código *JavaScript* normal:

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

function area(s: Shape) {
  if (s.kind === "circle") {
    return Math.PI * s.radius * s.radius;
  } else if (s.kind === "square") {
    return s.x * s.x;
  } else {
    return (s.x * s.y) / 2;
  }
}
```

Ten en cuenta que el tipo de retorno de `area` se infiere como `number` porque
*TypeScript* sabe que la función es total. Si alguna variante no está
cubierta, el tipo de retorno de `area` será `number | undefined` en su lugar.

Además, a diferencia de *Haskell*, las propiedades comunes aparecen en cualquier unión, por lo que
puedes discriminar de manera útil a varios miembros de la unión:

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };
// ---cut---
function height(s: Shape) {
  if (s.kind === "circle") {
    return 2 * s.radius;
  } else {
    // s.kind: "square" | "triangle"
    return s.x;
  }
}
```

## Tipo de los parámetros

Como la mayoría de los lenguajes descendientes de *C*, *TypeScript* requiere una declaración de
tipo de los parámetros

```ts
function liftArray<T>(t: T): Array<T> {
  return [t];
}
```

No hay un requisito de caso, pero el tipo de los parámetros convencionalmente son
letras mayúsculas individuales. Los parámetros de tipo también se pueden restringir a un
tipo, que se comporta un poco como restricciones de tipo clase:

```ts
function firstish<T extends { length: number }>(t1: T, t2: T): T {
  return t1.length > t2.length ? t1 : t2;
}
```

*TypeScript* generalmente puede inferir el tipo de los argumentos de una llamada basada en el
tipo de los argumentos, por lo que los tipos de los argumentos generalmente no son necesarios.

Dado que *TypeScript* es estructural, no necesita el tipo de los parámetros
tanto como sistemas nominales. Específicamente, no son necesarios para hacer una
función polimórfica. Los parámetros de tipo solo se deben usar para
*propagar* información de tipo, como la restricción de parámetros
del mismo tipo:

```ts
function length<T extends ArrayLike<unknown>>(t: T): number {}

function length(t: ArrayLike<unknown>): number {}
```

En la primera `length`, `T` no es necesaria; nota que solo es
referida una vez, por lo que no se utiliza para restringir el tipo del
valor de retorno u otros parámetros.

### Tipos superiores

*TypeScript* no tiene tipos superiores, por lo que lo siguiente no es legal:

```ts
function length<T extends ArrayLike<unknown>, U>(m: T<U>) {}
```

### Programación sin puntos

Programación sin puntos &mdash; uso intensivo de curado y composición de
función &mdash; es posible en *JavaScript*, pero puede ser detallado.
En *TypeScript*, la inferencia de tipos a menudo falla para los programas sin puntos, por lo que
terminarás especificando el tipo de los parámetros en lugar de el valor de los parámetros. El
el resultado es tan detallado que normalmente es mejor evitar
su programación.

## Sistema de módulos

La moderna sintaxis de módulo *JavaScript* es un poco como la de *Haskell*, excepto que
cualquier archivo con `import` o `export` implícitamente es un módulo:

```ts
import { value, Type } from "npm-package";
import { other, Types } from "./local-package";
import * as prefix from "../lib/tercer-paquete";
```

También puedes importar módulos `commonjs` &mdash; módulos escritos con
el sistema de módulos `node.js`:

```ts
import f = require("una-funcion-del-paquete");
```

Puedes exportar con una lista de exportación:

```ts
export { f };

function f() {
  return g();
}
function g() {} // g no se exporta
```

O marcando cada exportación individualmente:

```ts
export function f { return g() }
function g() { }
```

El último estilo es más común, pero ambos están permitidos, incluso en el mismo
archivo.

## `readonly` y `const`

En *JavaScript*, la mutabilidad es la predeterminada, aunque permite declaración
de variables con `const` para declarar qué *referencia* es
immutable. El referente sigue siendo mutable:

```js
const a = [1, 2, 3];
a.push(102); // ):
a[0] = 101; // D:
```

*TypeScript* también tiene un modificador `readonly` para las propiedades.

```ts
interface Rx {
  readonly x: number;
}
let rx: Rx = { x: 1 };
rx.x = 12; // error
```

También se envía con un tipo asignado `Readonly<T>` que hace
todas las propiedades `readonly`:

```ts
interface X {
  x: number;
}
let rx: Readonly<X> = { x: 1 };
rx.x = 12; // error
```

Y tiene un tipo `ReadonlyArray<T>` específico que elimina
métodos de afectación lateral y evita la escritura en índices del arreglo,
así como una sintaxis especial para este tipo:

```ts
let a: ReadonlyArray<number> = [1, 2, 3];
let b: readonly number[] = [1, 2, 3];
a.push(102); // error
b[0] = 101; // error
```

También puedes usar una aserción `const`, que opera en arreglos y
objetos literales:

```ts
let a = [1, 2, 3] as const;
a.push(102); // error
a[0] = 101; // error
```

Sin embargo, ninguna de estas opciones es la predeterminada, por lo que no
se utiliza constantemente en el código *TypeScript*.

## Próximos pasos

Este documento es una descripción general de alto nivel de la sintaxis y los tipos que diariamente usarás en tu código. A partir de aquí deberías:

- Leer el manual completo [de principio a fin](/docs/handbook/intro.html) (30 min)
- Explorar los [ejemplos en *Playground*](/play#show-examples)
