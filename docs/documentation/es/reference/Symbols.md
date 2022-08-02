---
title: Símbolos
layout: docs
permalink: /docs/handbook/symbols.html
oneline: Uso del primitivo Symbol de JavaScript en TypeScript
translatable: true
---

A partir de *ECMAScript 2015*, `symbol` es un tipo de datos primitivo, como `number` y `string`.

Los valores `symbol` se crean llamando al constructor `Symbol`.

```ts
let sym1 = Symbol();

let sym2 = Symbol("key"); // key cadena opcional
```

Los símbolos son inmutables y únicos.

```ts
let sym2 = Symbol("key");
let sym3 = Symbol("key");

sym2 === sym3; // falso, los símbolos son únicos
```

Al igual que las cadenas, los símbolos se pueden utilizar como claves para las propiedades de los objetos.

```ts
const sym = Symbol();

let obj = {
  [sym]: "value",
};

console.log(obj[sym]); // "value"
```

Los símbolos también se pueden combinar con declaraciones de propiedades calculadas para declarar propiedades de objeto y miembros de clase.

```ts
const getClassNameSymbol = Symbol();

class C {
  [getClassNameSymbol]() {
    return "C";
  }
}

let c = new C();
let className = c[getClassNameSymbol](); // "C"
```

## `unique symbol`

Para permitir el tratamiento de símbolos como literales únicos, está disponible un nuevo tipo `unique symbol`. El `unique symbol` es un subtipo de `symbol` y se produce únicamente a partir de la llamada a `Symbol()` o `Symbol.for()`, o de anotaciones explícitas de tipo. El nuevo tipo solo está permitido en declaraciones `const` y propiedades `readonly static`, y para hacer referencia a un símbolo único específico, tendrás que usar el operador `typeof`. Cada referencia a un `unique symbol` implica una identidad completamente única que está vinculada a una determinada declaración.

```ts twoslash
// @errors: 1332
declare const sym1: unique symbol;

// sym2 solo puede ser una referencia constante.
let sym2: unique symbol = Symbol();

// ¡Funciona! - se refiere a un símbolo único, pero su identidad está ligada a 'sym1'.
let sym3: typeof sym1 = sym1;

// También funciona.
class C {
  static readonly StaticSymbol: unique symbol = Symbol();
}
```

Debido a que cada `unique symbol` tiene una identidad completamente separada, no hay dos tipos de `unique symbol` asignables o comparables entre sí.

```ts twoslash
// @errors: 2367
const sym2 = Symbol();
const sym3 = Symbol();

if (sym2 === sym3) {
  // ...
}
```

## Símbolos conocidos

Además de los símbolos definidos por el usuario, hay símbolos integrados bien conocidos.
Los símbolos incorporados se utilizan para representar el comportamiento del lenguaje interno.

A continuación, se muestra una lista de símbolos conocidos:

## `Symbol.hasInstance`

Un método que determina si un objeto constructor reconoce un objeto como una de las instancias del constructor. Llamado por la semántica del operador `instanceof`.

## `Symbol.isConcatSpreadable`

Un valor booleano que indica que `Array.prototype.concat` debe acoplar un objeto a sus elementos del arreglo.

## `Symbol.iterator`

Un método que devuelve el iterador predeterminado para un objeto. Llamado por la semántica de la instrucción `for-of`.

## `Symbol.match`

Un método de expresión regular que compara la expresión regular con una cadena. Llamado por el método `String.prototype.match`.

## `Symbol.replace`

Un método de expresión regular que reemplaza subcadenas coincidentes de una cadena. Llamado por el método `String.prototype.replace`.

## `Symbol.search`

Un método de expresión regular que devuelve el índice dentro de una cadena que coincide con la expresión regular. Llamado por el método `String.prototype.search`.

## `Symbol.species`

Una propiedad con valor de función que es la función constructora que se utiliza para crear objetos derivados.

## `Symbol.split`

Un método de expresión regular que divide una cadena en los índices que coinciden con la expresión regular.
Llamado por el método `String.prototype.split`.

## `Symbol.toPrimitive`

Un método que convierte un objeto en un valor primitivo correspondiente.
Llamado por la operación abstracta `ToPrimitive`.

## `Symbol.toStringTag`

Un valor de cadena que se utiliza en la creación de la descripción de cadena predeterminada de un objeto.
Llamado por el método incorporado `Object.prototype.toString`.

## `Symbol.unscopables`

Un Objeto cuyos nombres de propiedad son nombres de propiedad que están excluidos de los enlaces de entorno `'with'` de los objetos asociados.
