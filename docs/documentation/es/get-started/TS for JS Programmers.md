---
title: TypeScript para programadores JavaScript
short: TypeScript para programadores JS
layout: docs
permalink: /docs/handbook/typescript-in-5-minutes.html
oneline: Descubre cómo TypeScript amplía JavaScript
---

*TypeScript* tiene una inusual relación con *JavaScript*. *TypeScript* ofrece todas las funciones de *JavaScript* y una capa adicional además de estas: Sistema de tipos de *TypeScript*.

Por ejemplo, *JavaScript* proporciona primitivos del lenguaje como `string` y `number`, pero no comprueba que los hayas asignado de forma coherente. *TypeScript* lo hace.

Esto significa que tu código *JavaScript* existente también es código *TypeScript*. El principal beneficio de *TypeScript* es que puede resaltar el comportamiento inesperado en tu código, reduciendo la posibilidad de errores.

Este tutorial proporciona una breve descripción general de *TypeScript*, centrándose en su sistema de tipos.

## Tipos por inferencia

*TypeScript* conoce el lenguaje *JavaScript* y generará tipos para ti en muchos casos.
Por ejemplo, al crear una variable y asignarle un valor particular, *TypeScript* usará el valor como su tipo.

```ts twoslash
let holaMundo = "Hello World";
//  ^?
```

Al comprender cómo funciona *JavaScript*, *TypeScript* puede construir un sistema de tipos que acepta código *JavaScript* pero tiene tipos. Esto ofrece un sistema de tipos sin necesidad de agregar caracteres adicionales para hacer que los tipos sean explícitos en tu código. Así es como *TypeScript* sabe que `holaMundo` es un `string` en el ejemplo anterior.

Es posible que hayas escrito *JavaScript* en *Visual Studio Code* y el editor haya completado automáticamente. *Visual Studio Code* usa *TypeScript* bajo el capó para facilitar el trabajo con *JavaScript*.

## Definición de tipos

Puedes utilizar una amplia variedad de patrones de diseño en *JavaScript*. Sin embargo, algunos patrones de diseño dificultan que los tipos se infieran automáticamente (por ejemplo, patrones que utilizan programación dinámica). Para cubrir estos casos, *TypeScript* admite una extensión del lenguaje *JavaScript*, que ofrece lugares para que le diga a *TypeScript* cuáles deberían ser los tipos.

Por ejemplo, para crear un objeto con un tipo inferido que incluye `name: string` e `id: number`, puedes escribir:

```ts twoslash
const user = {
  name: "Hayes",
  id: 0,
};
```

Puedes describir explícitamente la forma de este objeto usando una declaración `interface`:

```ts twoslash
interface User {
  name: string;
  id: number;
}
```

Luego puedes declarar que un objeto *JavaScript* se ajusta a la forma de tu nueva `interface` usando una sintaxis como `: NombreTipo` después de una declaración de variable:

```ts twoslash
interface User {
  name: string;
  id: number;
}
// ---cut---
const user: User = {
  name: "Hayes",
  id: 0,
};
```

Si proporcionas un objeto que no coincide con la interfaz que haz proporcionado, *TypeScript* te advertirá:

```ts twoslash
// @errors: 2322
interface User {
  name: string;
  id: number;
}

const user: User = {
  username: "Hayes",
  id: 0,
};
```

Dado que *JavaScript* admite clases y programación orientada a objetos, también lo hace *TypeScript*. Puedes usar una declaración de interfaz con clases:

```ts twoslash
interface User {
  name: string;
  id: number;
}

class UserAccount {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

const user: User = new UserAccount("Murphy", 1);
```

Puedes utilizar interfaces para anotar parámetros y devolver valores a funciones:

```ts twoslash
// @noErrors
interface User {
  name: string;
  id: number;
}
// ---cut---
function getAdminUser(): User {
  //...
}

function deleteUser(user: User) {
  // ...
}
```

Ya hay un pequeño conjunto de tipos primitivos disponible en *JavaScript*: `boolean`, `bigint`, `null`, `number`, `string`, `symbol` y `undefined`, que puedes usar en una interfaz. *TypeScript* amplía esta lista con algunos más, como `any` (permite cualquier cosa), [`unknown`](/play#example/unknown-and-never) (se asegura de que alguien que usa este tipo declare cuál es el tipo), [`never`](/play#example/unknown-and-never) (no es posible que suceda este tipo), y `void` (una función que devuelve `undefined` o no tiene valor de retorno).

Verás que hay dos sintaxis para la construcción de tipos: [Interfaces y `Types`](/play/?e=83#example/types-vs-interfaces). Deberías preferir la `interface`. Utiliza `type` cuando necesites funciones específicas.

## Composición de tipos

Con *TypeScript*, puedes crear tipos complejos combinando tipos simples. Hay dos formas populares de hacerlo: con uniones y con genéricos.

### Uniones

Con una unión, puedes declarar que un tipo podría ser uno de muchos tipos. Por ejemplo, puedes describir un tipo `boolean` como `true` o `false`:

```ts twoslash
type MyBool = true | false;
```

*Nota*: Si pasas el cursor sobre `MyBool` arriba, verás que está clasificado como `boolean`. Esa es una propiedad del Sistema estructural de tipo. Más sobre esto a continuación.

Un caso de uso popular para los tipos unión es describir el conjunto de `string` o `number` [literales](/docs/handbook/2/everyday-types.html#tipos-literales) que un valor puede tener:

```ts twoslash
type WindowStates = "open" | "closed" | "minimized";
type LockStates = "locked" | "unlocked";
type PositiveOddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
```

Las uniones también brindan una forma de manejar diferentes tipos. Por ejemplo, puedes tener una función que tome un `array` o un `string`:

```ts twoslash
function getLength(obj: string | string[]) {
  return obj.length;
}
```

Para obtener el tipo de una variable, usa `typeof`:

| Tipo | Predicado |
| ---- | ----------------- |
| `string`    | `typeof s === "string"`            |
| `number`    | `typeof n === "number"`            |
| `boolean`   | `typeof b === "boolean"`           |
| `undefined` | `typeof undefined === "undefined"` |
| `function`  | `typeof f === "function"`          |
| `array`     | `Array.isArray(a)`                 |

Por ejemplo, puedes hacer que una función devuelva valores diferentes dependiendo de si se le pasa una cadena o un arreglo:

<!-- prettier-ignore -->
```ts twoslash
function wrapInArray(obj: string | string[]) {
  if (typeof obj === "string") {
    return [obj];
//          ^?
  }
  return obj;
}
```

### Genéricos

Los genéricos proporcionan variables a los tipos. Un ejemplo común es un arreglo. Un arreglo sin genéricos podría contener cualquier cosa. Un arreglo con genéricos puede describir los valores que contiene el arreglo.

```ts
type StringArray = Array<string>;
type NumberArray = Array<number>;
type ObjectWithNameArray = Array<{ name: string }>;
```

Puedes declarar tus propios tipos que usan genéricos:

```ts twoslash
// @errors: 2345
interface Backpack<Type> {
  add: (obj: Type) => void;
  get: () => Type;
}

// Esta línea es un atajo para decirle a TypeScript que hay una
// constante llamada `backpack`, y no preocuparte por su
// procedencia.
declare const backpack: Backpack<string>;

// El objeto es una cadena, porque lo declaramos arriba como la parte variable de Backpack.
const object = backpack.get();

// Dado que la variable `backpack` es una cadena, no puedes pasar
// un número a la función `add`.
backpack.add(23);
```

## Sistema de tipo estructural

Uno de los principios básicos de *TypeScript* es que la comprobación de tipos se centra en la *forma* que tienen los valores. Esto a veces se denomina "tipado pato" o "tipado estructural".

En un sistema de tipo estructural, si dos objetos tienen la misma forma, se considera que son del mismo tipo.

```ts twoslash
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}

// registra "12, 26"
const point = { x: 12, y: 26 };
logPoint(point);
```

La variable `point` nunca se declara como tipo `Point`. Sin embargo, *TypeScript* compara la forma de `point` con la forma de `Point` en la comprobación de tipo. Tienen la misma forma, por lo que el código pasa.

La coincidencia de formas solo requiere que coincida un subconjunto de los campos del objeto.

```ts twoslash
// @errors: 2345
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
// ---cut---
const point3 = { x: 12, y: 26, z: 89 };
logPoint(point3); // registra "12, 26"

const rect = { x: 33, y: 3, width: 30, height: 80 };
logPoint(rect); // registra "33, 3"

const color = { hex: "#187ABF" };
logPoint(color);
```

No hay diferencia entre cómo las clases y los objetos se ajustan a las formas:

```ts twoslash
// @errors: 2345
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
// ---cut---
class VirtualPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const newVPoint = new VirtualPoint(13, 56);
logPoint(newVPoint); // registra "13, 56"
```

Si el objeto o la clase tiene todas las propiedades requeridas, *TypeScript* dirá que coinciden, independientemente de los detalles de implementación.

## Próximos pasos

Esta fue una breve descripción general de la sintaxis y las herramientas que se utilizan todos los días en *TypeScript*. A partir de aquí puedes:

- Leer el manual completo [de principio a fin](/docs/handbook/intro.html) (30 min)
- Explorar los [ejemplos en *Playground*](/play#show-examples)
