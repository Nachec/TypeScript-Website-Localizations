---
title: Estructura de bibliotecas
layout: docs
permalink: /docs/handbook/declaration-files/library-structures.html
oneline: Cómo estructurar tus archivos d.ts
---

En términos generales, la forma en que *estructuras* tu archivo de declaración depende de cómo se consuma la biblioteca.
Hay muchas maneras de ofrecer una biblioteca para consumo en *JavaScript*, y deberás escribir tu archivo de declaración para que coincida.
Esta guía cubre cómo identificar patrones de biblioteca comunes y cómo escribir archivos de declaración que corresponden con ese patrón.

Cada tipo de patrón de estructuración de la biblioteca principal tiene un archivo correspondiente en la sección [Plantillas](/docs/handbook/statement-files/templates.html).
Puedes comenzar con estas plantillas para ayudarte a comenzar más rápido.

## Identificar los tipos de bibliotecas

Primero, revisaremos los tipos de biblioteca que pueden representar los archivos de declaración *TypeScript*.
Mostraremos brevemente cómo se *utiliza* cada tipo de biblioteca, cómo se *escribe* y enumeraremos algunos ejemplos de bibliotecas del mundo real.

Identificar la estructura de una biblioteca es el primer paso para escribir tu archivo de declaración.
Daremos pistas sobre cómo identificar la estructura tanto en función de su *uso* como de su *código*.
Dependiendo de la documentación y organización de la biblioteca, uno podría ser más fácil que el otro.
Recomendamos usar lo que sea más cómodo para ti.

## ¿Qué debes buscar?

Pregunta que se debe hacer mientras miras una biblioteca que estás tratando de escribir.

1. ¿Cómo se obtiene la biblioteca?

   Por ejemplo, ¿la puedes obtener *solo* a través de `npm` o solo de un CDN?

2. ¿Cómo la importarías?

   ¿Agrega un objeto global? ¿Utiliza declaraciones `require` o `import`/`export`?

## Pequeños ejemplos para diferentes tipos de bibliotecas

## Bibliotecas modulares

Casi todas las bibliotecas modernas de *Node.js* pertenecen a la familia de módulos.
Este tipo de bibliotecas solo funcionan en un entorno *JavaScript* con un cargador de módulos.
Por ejemplo, `express` solo funciona en *Node.js* y se debe cargar usando la función `require` de *CommonJS*.

*ECMAScript 2015* (también conocido como *ES2015*, *ECMAScript 6* y *ES6*), *CommonJS* y *RequireJS* tienen nociones similares de *importar* un *módulo*.
En *JavaScript* *CommonJS* (`Node.js`), por ejemplo, escribirías

```js
var fs = require("fs");
```

En *TypeScript* o *ES6*, la palabra clave `import` cumple la misma función:

```ts
import * as fs from "fs";
```

Por lo general, verás que las bibliotecas modulares incluyen una de estas líneas en su documentación:

```js
var someLib = require("someLib");
```

o

```js
define(..., ['someLib'], function(someLib) {

});
```

Al igual que con los módulos globales, es posible que veas estos ejemplos en la documentación del módulo [a *UMD*](#umd), así que asegúrate de consultar el código o la documentación.

### Identificar un módulo de biblioteca a partir del código

Las bibliotecas modulares generalmente tendrán al menos alguna de las siguientes:

- Llamadas incondicionales a `require` o `define`
- Declaraciones como `import * as a from 'b';` o `export c;`
- Asignaciones a `export` o `module.exports`

Raramente tendrán:

- Asignaciones a propiedades de `window` o `global`

### Plantillas para módulos

Hay cuatro plantillas disponibles para módulos,
[`module.d.ts`](/docs/handbook/declaration-files/templates/module-d-ts.html), [`module-class.d.ts`](/docs/handbook/declaration-files/templates/module-class-d-ts.html), [`module-function.d.ts`](/docs/handbook/declaration-files/templates/module-function-d-ts.html) and [`module-plugin.d.ts`](/docs/handbook/declaration-files/templates/module-plugin-d-ts.html).

Primero debes leer [`module.d.ts`](/docs/handbook/statement-files/templates/module-d-ts.html) para obtener una descripción general de la forma en que funcionan.

Luego usa la plantilla [`module-function.d.ts`](/docs/handbook/statement-files/templates/module-function-d-ts.html) si tu módulo puede ser llamando (`called`) como una función:

```js
const x = require("foo");
// Nota: llama a 'x' como una función
const y = x(42);
```

Usa la plantilla [`module-class.d.ts`](/docs/handbook/statement-files/templates/module-class-d-ts.html) si tu módulo se puede *construir* usando `new`:

```js
const x = require("bar");
// Nota: usando el operador 'new' en la variable importada
const y = new x("hola");
```

Si tienes un módulo que cuando se importa, realiza cambios en otros módulos, usa la plantilla [`module-plugin.d.ts`](/docs/handbook/statement-files/templates/module-plugin-d-ts.html):

```js
const jest = require("jest");
require("jest-matchers-files");
```

## Bibliotecas globales

Una biblioteca *global* es aquella a la que se puede acceder desde el ámbito global (es decir, sin utilizar ninguna forma de `import`ación).
Muchas bibliotecas simplemente exponen una o más variables globales para su uso.
Por ejemplo, si usabas [`jQuery`](https://jquery.com/), la variable `$` se puede usar simplemente refiriéndose a ella:

```ts
$(() => {
  console.log("¡hola!");
});
```

Por lo general, verás una guía en la documentación de una biblioteca global sobre cómo usar la biblioteca en una etiqueta `script` de *HTML*:

```HTML
<script src="http://a.great.cdn.for/algunaBib.js"></script>
```

En la actualidad, las bibliotecas más populares y de acceso global se escriben en realidad como bibliotecas *UMD* (ve a continuación).
La documentación de la biblioteca *UMD* es difícil de distinguir de la documentación de la biblioteca global.
Antes de escribir un archivo de declaración global, asegúrate de que la biblioteca no sea realmente *UMD*.

### Identificar una biblioteca global a partir del código

El código de la biblioteca global suele ser extremadamente simple.
Una biblioteca global "Hola, mundo" se podría ver así:

```js
function createGreeting(s) {
  return "Hello, " + s;
}
```

o así:

```js
// Web.config
window.createGreeting = function (s) {
  return "Hello, " + s;
};

// Node
global.createGreeting = function (s) {
  return "Hello, " + s;
};

// Potencialmente cualquier entorno de ejecución
globalThis.createGreeting = function (s) {
  return "Hello, " + s;
};
```

Al mirar el código de una biblioteca global, generalmente verás:

- Declaraciones `var` de nivel superior o declaraciones `function`
- Una o más asignaciones a `window.someName`
- Supuestos de que existen *DOM* primitivos como `document` o `window`

*No* verás:

- Comprueba o utiliza cargadores de módulos como `require` o `define`
- Importaciones al estilo *CommonJS*/*Node.js* de la forma `var fs = require ("fs");`
- Llamadas a `define(...)`
- Documentación que describe cómo `require` o importar la biblioteca

### Ejemplos de bibliotecas globales

Debido a que generalmente es fácil convertir una biblioteca global en una biblioteca *UMD*, muy pocas bibliotecas populares todavía se escriben en el estilo global.
Sin embargo, las bibliotecas que son pequeñas y requieren *DOM* (o *no* tienen dependencias) pueden seguir siendo globales.

### Plantilla de biblioteca global

El archivo de plantilla [`global.d.ts`](/docs/handbook/statement-files/templates/global-plugin-d-ts.html) define una biblioteca de ejemplo `myLib`.
Asegúrate de leer la [nota al pie de la página "Prevención de conflictos de nombre"](#prevencion-de-conflictos-de-nombre).

## *UMD*

Un módulo *UMD* es uno que se puede usar como módulo (a través de una `import`ación) o como módulo global (cuando se ejecuta en un entorno sin un cargador de módulos).
Muchas bibliotecas populares, como [`Moment.js`](http://momentjs.com/), están escritas de esta manera.
Por ejemplo, en *Node.js* o usando *RequireJS*, podrías escribir:

```ts
import moment = require("moment");
console.log(moment.format());
```

mientras que en un entorno de navegador puro escribirías:

```js
console.log(moment.format());
```

### Identificar una biblioteca *UMD*

[módulos *UMD*](https://github.com/umdjs/umd) comprueba la existencia de un entorno de cargador de módulos.
Este es un patrón fácil de detectar que se ve así:

```js
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["libName"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("libName"));
    } else {
        root.returnExports = factory(root.libName);
    }
}(this, function (b) {
```

Si ves pruebas para `typeof define`, `typeof window`, o `typeof module` en el código de una biblioteca, especialmente en la parte superior del archivo, casi siempre es una biblioteca *UMD*.

La documentación para las bibliotecas *UMD* también suele mostrar un ejemplo de "Usando en `Node.js`" que muestra `require`,
y un ejemplo de "Usando en el navegador" que muestra el uso de la etiqueta `<script>` para cargar el script.

### Ejemplos de bibliotecas *UMD*

La mayoría de las bibliotecas populares ahora están disponibles como paquetes *UMD*.
Los ejemplos incluyen [`jQuery`](https://jquery.com/), [`Moment.js`](http://momentjs.com/), [`lodash`](https://lodash.com/) y muchos más.

### Plantilla

Utiliza la plantilla [`module-plugin.d.ts`](/docs/handbook/statement-files/templates/module-plugin-d-ts.html).

## Consumir dependencias

Hay varios tipos de dependencias que puede tener tu biblioteca.
Esta sección muestra cómo importarlas al archivo de declaración.

## Dependencias de bibliotecas globales

Si tu biblioteca depende de una biblioteca global, usa una directiva `/// <reference types="..."/>`:

```ts
/// <reference types="someLib" />

function getThing(): someLib.thing;
```

## Dependencias en módulos

Si tu biblioteca depende de un módulo, usa una declaración `import`:

```ts
import * as moment from "moment";

function getThing(): moment;
```

## Dependencias de bibliotecas *UMD*

### Desde una biblioteca global

Si tu biblioteca global depende de un módulo *UMD*, usa una directiva `/// <reference types`:

```ts
/// <reference types="moment" />

function getThing(): moment;
```

### Desde un módulo o biblioteca *UMD*

Si tu módulo o biblioteca *UMD* depende de una biblioteca *UMD*, usa una instrucción `import`:

```ts
import * as someLib from "someLib";
```

¡*No* uses una directiva `/// <reference` para declarar una dependencia a una biblioteca *UMD*!

## Notas al pie

## Prevención de conflictos de nombre

Ten en cuenta que es posible definir muchos tipos en el ámbito global al escribir un archivo de declaración global.
Recomendamos encarecidamente esto ya que conduce a posibles conflictos de nombre no resueltos cuando muchos archivos de declaración están en un proyecto.

Una simple regla a seguir es declarar solo los tipos de *espacios de nombres* por cualquier variable global que defina la biblioteca.
Por ejemplo, si la biblioteca define el valor global '`cats`', debes escribir:

```ts
declare namespace cats {
  interface KittySettings {}
}
```

Pero *no*

```ts
// en el nivel superior
interface CatsKittySettings {}
```

Esta guía además asegura que una biblioteca se puede transferir a *UMD* sin romper los usuarios de archivos de declaración.

## El impacto de *ES6* en las firmas de llamadas al módulo

Muchas bibliotecas populares, como `Express`, se exponen a sí mismas como una función invocable cuando se importan.
Por ejemplo, el uso típico de `Express` se ve así:

```ts
import exp = require("express");
var app = exp();
```

En los cargadores de módulos compatibles con *ES6*, el objeto de nivel superior (aquí importado como `exp`) solo puede tener propiedades;
el objeto `module` de nivel superior *nunca* puede ser invocable.

La solución más común aquí es definir una exportación `default` para un objeto invocable/construible;
Los cargadores de módulos comúnmente detectan esta situación automáticamente y reemplazan el objeto de nivel superior con la exportación `default`.
*TypeScript* puede manejar esto por ti, si tienes [`"esModuleInterop": true`](/tsconfig/#esModuleInterop) en tu `tsconfig.json`.
