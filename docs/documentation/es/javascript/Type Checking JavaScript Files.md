---
title: Comprobación de tipos de archivos JavaScript
layout: docs
permalink: /docs/handbook/type-checking-javascript-files.html
oneline: Cómo agregar comprobación de tipo a archivos JavaScript usando TypeScript
---

Aquí hay algunas diferencias notables sobre cómo funciona la comprobación en archivos `.js` en comparación con los archivos `.ts`.

## Las propiedades se infieren de las asignaciones en los cuerpos de la clase.

*ES2015* no tiene un medio para declarar propiedades en clases. Las propiedades se asignan dinámicamente, al igual que los objetos literales.

En un archivo `.js`, el compilador infiere propiedades de las asignaciones de propiedades dentro del cuerpo de la clase.
El tipo de una propiedad es el tipo dado en el constructor, a menos que no esté definido allí, o el tipo en el constructor no esté definido o sea `null`.
En ese caso, el tipo es la unión de los tipos de todos los valores de la derecha en estas asignaciones.
Las propiedades definidas en el constructor siempre se asume que existen, mientras que las definidas solo en métodos, captadores o definidores se consideran opcionales.

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    this.constructorOnly = 0;
    this.constructorUnknown = undefined;
  }
  method() {
    this.constructorOnly = false;
    this.constructorUnknown = "plunkbat"; // ok, constructorUnknown es una cadena | undefined
    this.methodOnly = "ok"; // ok, pero methodOnly también podría ser undefined
  }
  method2() {
    this.methodOnly = true; // también, ok, el tipo de methodOnly es string | boolean | undefined
  }
}
```

Si las propiedades nunca se establecen en el cuerpo de la clase, se consideran desconocidas.
Si tu clase tiene propiedades de las que solo se lee, agrega y luego anota una declaración en el constructor con *JSDoc* para especificar el tipo.
Ni siquiera tienes que dar un valor si se iniciará más tarde:

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    /** @type {number | undefined} */
    this.prop = undefined;
    /** @type {number | undefined} */
    this.count;
  }
}

let c = new C();
c.prop = 0; // Bien
c.count = "string";
```

## Las funciones constructor son equivalentes a las clases

Antes de *ES2015*, *JavaScript* usaba funciones constructor en lugar de clases.
El compilador admite este patrón y entiende las funciones constructor como equivalentes a las clases de *ES2015*.
Las reglas de inferencia de propiedades descritas anteriormente funcionan exactamente de la misma manera.

```js twoslash
// @checkJs
// @errors: 2683 2322
function C() {
  this.constructorOnly = 0;
  this.constructorUnknown = undefined;
}
C.prototype.method = function () {
  this.constructorOnly = false;
  this.constructorUnknown = "plunkbat"; // OK, el tipo es string | undefined
};
```

## Los módulos *CommonJS* son compatibles

En un archivo `.js`, *TypeScript* comprende el formato del módulo *CommonJS*.
Las asignaciones a `export` y `module.exports` se reconocen como declaraciones `export`.
De manera similar, las llamadas a la función `require` se reconocen como importación de módulos. Por ejemplo:

```js
// igual que `import module "fs"`
const fs = require("fs");

// igual que `export function readFile`
module.exports.readFile = function (f) {
  return fs.readFileSync(f);
};
```

La compatibilidad de módulos en *JavaScript* es mucho más tolerante desde el punto de vista sintáctico que el soporte de módulos de *TypeScript*.
Se admiten la mayoría de combinaciones de asignaciones y declaraciones.

## Las clases, funciones y literales de objeto son espacios de nombres

Las clases son espacios de nombres en archivos `.js`.
Esto se puede usar para anidar clases, por ejemplo:

```js twoslash
class C {}
C.D = class {};
```

Y, para el código anterior a *ES2015*, se puede utilizar para simular métodos estáticos:

```js twoslash
function Outer() {
  this.y = 2;
}

Outer.Inner = function () {
  this.yy = 2;
};

Outer.Inner();
```

También se puede utilizar para crear espacios de nombres simples:

```js twoslash
var ns = {};
ns.C = class {};
ns.func = function () {};

ns;
```

También se permiten otras variantes:

```js twoslash
// IIFE
var ns = (function (n) {
  return n || {};
})();
ns.CONST = 1;

// de manera predeterminada global
var assign =
  assign ||
  function () {
    // ...el código va aquí
  };
assign.extra = 1;
```

## Los objeto literales son de final abierto

En un archivo `.ts`, un objeto literal que inicia una declaración de variable da su tipo a la declaración.
No se pueden agregar nuevos miembros que no se hayan especificado en el literal original.
Esta regla está relajada en un archivo `.js`; los literales de objeto tienen un tipo de final abierto (un índice de firma) que permite agregar y buscar propiedades que no se definieron originalmente.
Por ejemplo:

```js twoslash
var obj = { a: 1 };
obj.b = 2; // Permitido
```

Los objetos literales se comportan como si tuvieran un índice de firma `[x:string]: any` que les permita ser tratados como mapas abiertos en lugar de objetos cerrados.

Al igual que otros comportamientos especiales de verificación de *JS*, este comportamiento se puede cambiar especificando un tipo *JSDoc* para la variable. Por ejemplo:

```js twoslash
// @checkJs
// @errors: 2339
/** @type {{a: number}} */
var obj = { a: 1 };
obj.b = 2;
```

## Los iniciadores de arreglos `null`, `undefined` y vacíos son de tipo `any` o `any[]`

Cualquier variable, parámetro o propiedad que se inicie con `null` o `undefined` tendrá el tipo `any`, incluso si las comprobaciones estrictas de `null` están activadas.
Cualquier variable, parámetro o propiedad que se inicie con `null` o `undefined` tendrá el tipo `any`, incluso si las comprobaciones estrictas de `null` están activadas.
La única excepción es para las propiedades que tienen varios iniciadores como se describe arriba.

```js twoslash
function Foo(i = null) {
  if (!i) i = 1;
  var j = undefined;
  j = 2;
  this.l = [];
}

var foo = new Foo();
foo.l.push(foo.i);
foo.l.push("end");
```

## Los parámetros de función son opcionales por omisión

Dado que no hay forma de especificar la opcionalidad de los parámetros en *JavaScript* anterior a *ES2015*, todos los parámetros de función en el archivo `.js` se consideran opcionales.
Se permiten llamadas con menos argumentos que el número declarado de parámetros.

Es importante notar que es un error llamar a una función con demasiados argumentos.

Por ejemplo:

```js twoslash
// @checkJs
// @strict: false
// @errors: 7006 7006 2554
function bar(a, b) {
  console.log(a + " " + b);
}

bar(1); // Bien, el segundo argumento se considera opcional
bar(1, 2);
bar(1, 2, 3); // Error, demasiados argumentos
```

Las funciones *JSDoc* anotadas están excluidas de esta regla.
Utilice la sintaxis de parámetro opcional *JSDoc* (`[` `]`) para expresar la opcionalidad. p.ej.:

```js twoslash
/**
 * @param {string} [somebody] ⏤ El nombre de alguien.
 */
function sayHello(somebody) {
  if (!somebody) {
    somebody = "John Doe";
  }
  console.log("Hello " + somebody);
}

sayHello();
```

## Declaración de parámetros `var-args` inferidos del uso de `arguments`

Una función cuyo cuerpo tiene una referencia a la referencia de `arguments` se considera implícitamente que tiene un parámetro `var-arg` (es decir,`(...arg: any[]) => any`). Usa la sintaxis `var-arg`de *JSDoc* para especificar el tipo de argumentos.

```js twoslash
/** @param {...number} args */
function sum(/* numbers */) {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
```

## Los parámetros de tipo no especificado se establecen de forma predeterminada en `any`

Dado que no existe una sintaxis natural para especificar parámetros de tipo genérico en *JavaScript*, un parámetro de tipo no especificado toma el valor predeterminado `any`.

### En la cláusula `extends`

Por ejemplo, `React.Component` se define para tener dos parámetros de tipo,`Props` y `State`.
En un archivo `.js`, no existe una forma legal de especificarlos en la cláusula `extends`. De manera predeterminada, los argumentos de tipo serán `any`:

```js
import { Component } from "react";

class MyComponent extends Component {
  render() {
    this.props.b; // Permitido, ya que this.props es de tipo any
  }
}
```

Usa `@augments` de *JSDoc* para especificar los tipos explícitamente. por ejemplo:

```js
import { Component } from "react";

/**
 * @augments {Component<{a: number}, State>}
 */
class MyComponent extends Component {
  render() {
    this.props.b; // Error: b no existe en {a: number}
  }
}
```

### En referencias *JSDoc*

Un argumento de tipo no especificado en *JSDoc* tiene como valor predeterminado `any`:

```js twoslash
/** @type{Array} */
var x = [];

x.push(1); // Bien
x.push("string"); // OK, x es de tipo Array<any>

/** @type{Array.<number>} */
var y = [];

y.push(1); // Bien
y.push("string"); // Error, la cadena no se puede asignar a un número
```

### En llamadas a funciones

Una llamada a una función genérica usa los argumentos para inferir los parámetros de tipo. A veces, este proceso no logra inferir ningún tipo, principalmente debido a la falta de fuentes de inferencia; en estos casos, los parámetros de tipo se establecerán de forma predeterminada en `any`. Por ejemplo:

```js
var p = new Promise((resolve, reject) => {
  reject();
});

p; // Promise<any>;
```

Para conocer todas las funciones disponibles en *JSDoc*, consulta [la referencia](/docs/handbook/jsdoc-supported-types.html).
