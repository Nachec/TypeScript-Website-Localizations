---
title: "Global: Complementos"
layout: docs
permalink: /docs/handbook/declaration-files/templates/global-plugin-d-ts.html
---

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

Hay tres plantillas disponibles para módulos,
[`module.d.ts`](/docs/handbook/declaration-files/templates/module-d-ts.html), [`module-class.d.ts`](/docs/handbook/declaration-files/templates/module-class-d-ts.html) y [`module-function.d.ts`](/docs/handbook/declaration-files/templates/module-function-d-ts.html).

Luego usa la plantilla [`module-function.d.ts`](/docs/handbook/statement-files/templates/module-function-d-ts.html) si tu módulo puede ser llamando (`called`) como una función:

```js
var x = require("foo");
// Nota: llama a 'x' como una función
var y = x(42);
```

Asegúrate de leer la [nota al pie de página "El impacto de *ES6* en las firmas de llamada de módulo"](#el-impacto-de-es6-en-el-modulo-plugins)

Usa [`module-class.d.ts`](/docs/handbook/statement-files/templates/module-class-d-ts.html) si tu módulo se puede *construir* usando `new`:

```js
var x = require("bar");
// Nota: usando el operador 'new' en la variable importada
var y = new x("hola");
```

La misma [nota al pie](#el-impacto-de-es6-en-el-modulo-plugins) se aplica a estos módulos.

Si tu módulo no es invocable o construible, usa el archivo [`module.d.ts`](/docs/handbook/statement-files/templates/module-d-ts.html).

## *Módulo Plugin* o *Complemento UMD*

Un *módulo plugin* cambia la forma de otro módulo (ya sea *UMD* o módulo).
Por ejemplo, en `Moment.js`, `moment-range` agrega un nuevo método `range` al objeto `moment`.

A los efectos de escribir un archivo de declaración, escribirás el mismo código si el módulo que estás modificando es un módulo simple o un módulo *UMD*.

### Plantilla

Utiliza la plantilla [`module-plugin.d.ts`](/docs/handbook/statement-files/templates/module-plugin-d-ts.html).

## *Plugin global*

Un *plugin global* es un código global que cambia la forma de algunos globales.
Al igual que con los *módulos de modificación global*, estos aumentan la posibilidad de un conflicto en el entorno de ejecución.

Por ejemplo, algunas bibliotecas agregan nuevas funciones a `Array.prototype` o `String.prototype`.

### Identificación de complementos globales

Los complementos globales generalmente son fáciles de identificar desde su documentación.

Verás ejemplos que se ven así:

```js
var x = "hello, world";
// Crea nuevos métodos en tipos integrados
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Crea nuevos métodos en tipos integrados
console.log(y.reverseAndSort());
```

### Plantilla

Usa la plantilla [`global-plugin.d.ts`](/docs/handbook/declaration-files/templates/global-plugin-d-ts.html).

## Módulos `global-modifying`

Un *módulo `global-modifying`* altera los valores existentes en el ámbito global cuando se importan.
Por ejemplo, podría existir una biblioteca que agregue nuevos miembros a `String.prototype` cuando se importe.
Este patrón es algo peligroso debido a la posibilidad de conflictos en el entorno de ejecución,
pero aún podemos escribir un archivo de declaración para ello.

### Identificación de módulos de modificación global

Los módulos de modificación global generalmente son fáciles de identificar desde su documentación.
En general, son similares a los complementos globales, pero necesitan una llamada `require` para activar sus efectos.

Es posible que veas documentación como esta:

```js
// llamada 'require' que no usa su valor de retorno
var unused = require("magic-string-time");
/* o */
require("magic-string-time");

var x = "hello, world";
// Crea nuevos métodos en tipos integrados
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Crea nuevos métodos en tipos integrados
console.log(y.reverseAndSort());
```

### Plantilla

Utilice la plantilla [`global-modifying-module.d.ts`](./templates/global-modifying-module.d.ts.md).

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

## El impacto de *ES6* en el módulo *Plugins*

Algunos complementos agregan o modifican las exportaciones de alto nivel en módulos existentes.
Aunque esto es legal en `CommonJS` y otros cargadores, los módulos *ES6* se consideran inmutables y el patrón no será posible.
Debido a que *TypeScript* es independiente del cargador, no existe una aplicación en tiempo de compilación de esta política, pero los desarrolladores que tengan la intención de realizar una transición a un cargador de módulos *ES6* deben tenerlo en cuenta.

## El impacto de *ES6* en las firmas de llamadas al módulo

Muchas bibliotecas populares, como `Express`, se exponen a sí mismas como una función invocable cuando se importan.
Por ejemplo, el uso típico de `Express` se ve así:

```ts
import exp = require("express");
var app = exp();
```

En los cargadores de módulos *ES6*, el objeto de nivel superior (aquí importado como `exp`) solo puede tener propiedades;
el objeto del módulo de nivel superior *nunca* es invocable.
La solución más común aquí es definir una exportación `default` para un objeto invocable/construible;
algunas calzas para el cargador de módulos detectarán automáticamente esta situación y reemplazarán el objeto de nivel superior por la exportación `predeterminada`.

## Diseño del archivo de biblioteca

El diseño de tus archivos de declaración debe reflejar el diseño de la biblioteca.

Una biblioteca puede constar de varios módulos, como

```
myLib
  +---- index.js
  +---- foo.js
  +---- bar
         +---- index.js
         +---- baz.js
```

Estos se pueden importar como

```js
var a = require("myLib");
var b = require("myLib/foo");
var c = require("myLib/bar");
var d = require("myLib/bar/baz");
```

Por lo tanto, tus archivos de declaración deben ser

```
@types/myLib
  +---- index.d.ts
  +---- foo.d.ts
  +---- bar
         +---- index.d.ts
         +---- baz.d.ts
```

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Esta plantilla muestra cómo escribir un complemento global. */

/*~ Escribe una declaración para el tipo original y agrega nuevos miembros.
 *~ Por ejemplo, esto agrega un método 'toBinaryString' con sobrecargas a
 *~ el tipo number incorporado.
 */
interface Number {
  toBinaryString(opts?: MyLibrary.BinaryFormatOptions): string;

  toBinaryString(
    callback: MyLibrary.BinaryFormatCallback,
    opts?: MyLibrary.BinaryFormatOptions
  ): string;
}

/*~ Si necesitas declarar varios tipos, colócalos dentro de un espacio de nombres
 *~ para evitar agregar demasiadas cosas al espacio de nombres global.
 */
declare namespace MyLibrary {
  type BinaryFormatCallback = (n: number) => string;
  interface BinaryFormatOptions {
    prefix?: string;
    padding: number;
  }
}
```
