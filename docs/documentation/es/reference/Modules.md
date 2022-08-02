---
title: Módulos
layout: docs
permalink: /docs/handbook/modules.html
oneline: Cómo funcionan los módulos en TypeScript
translatable: true
---

A partir de *ECMAScript 2015*, *JavaScript* tiene un concepto de módulos. *TypeScript* comparte este concepto.

Los módulos se ejecutan dentro de su propio ámbito, no en el ámbito global; esto significa que las variables, funciones, clases, etc. declaradas en un módulo no son visibles fuera del módulo a menos que se exporten explícitamente usando una de las [formas `export`](#export).
Por el contrario, para consumir una variable, función, clase, interfaz, etc. exportada desde un módulo diferente, se debe importar utilizando una de las formas [`import`](#import).

Los módulos son declarativos; las relaciones entre los módulos se especifican en términos de importaciones y exportaciones a nivel de archivo.

Los módulos se importan entre sí mediante un cargador de módulos.
En el entorno de ejecución, el cargador de módulos es responsable de localizar y ejecutar todas las dependencias de un módulo antes de ejecutarlo.
Los cargadores de módulos más conocidos que se utilizan en *JavaScript* son el cargador de `Node.js` para los módulos [`CommonJS`](https://wikipedia.org/wiki/CommonJS) y el cargador [`RequireJS`](http://requirejs.org/) para módulos [`AMD`](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) en aplicaciones web.

En *TypeScript*, al igual que en *ECMAScript 2015*, cualquier archivo que contenga una `import` o `export` de nivel superior se considera un módulo.
Por el contrario, un archivo sin declaraciones `import` o `export` de nivel superior se trata como un script cuyo contenido está disponible en el ámbito global (y, por lo tanto, también en los módulos).

## `Export`

## Exportar una declaración

Cualquier declaración (como una variable, función, clase, alias de tipo o interfaz) se puede exportar agregando la palabra clave `export`.

##### `StringValidator.ts`

```ts
export interface StringValidator {
  isAcceptable(s: string): boolean;
}
```

##### `ZipCodeValidator.ts`

```ts
import { StringValidator } from "./StringValidator";

export const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}
```

## Declaraciones `export`

Las declaraciones `export` son útiles cuando es necesario cambiar el nombre de las exportaciones para los consumidores, por lo que el ejemplo anterior se puede escribir como:

```ts
class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}
export { ZipCodeValidator };
export { ZipCodeValidator as mainValidator };
```

## Reexportar

A menudo, los módulos extienden otros módulos y exponen parcialmente algunas de sus características.
Una reexportación no lo importa localmente ni introduce una variable local.

##### `ParseIntBasedZipCodeValidator.ts`

```ts
export class ParseIntBasedZipCodeValidator {
  isAcceptable(s: string) {
    return s.length === 5 && parseInt(s).toString() === s;
  }
}

// Exporta el validador original pero le cambia el nombre
export { ZipCodeValidator as RegExpBasedZipCodeValidator } from "./ZipCodeValidator";
```

Opcionalmente, un módulo puede envolver uno o más módulos y combinar todas sus exportaciones usando la sintaxis `export * from "module"`.

##### `AllValidators.ts`

```ts
export * from "./StringValidator"; // exports 'StringValidator' interface
export * from "./ZipCodeValidator"; // exports 'ZipCodeValidator' class and 'numberRegexp' constant value
export * from "./ParseIntBasedZipCodeValidator"; //  exporta la clase 'ParseIntBasedZipCodeValidator'
// y reexporta 'RegExpBasedZipCodeValidator' como alias
// de la clase 'ZipCodeValidator' del módulo
// 'ZipCodeValidator.ts'.
```

## `Import`

Importar es tan fácil como exportar desde un módulo.
La importación de una declaración exportada se realiza mediante el uso de una de las siguientes formas `import`:

## `Import`ar una sola `export`ación de un módulo

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";

let myValidator = new ZipCodeValidator();
```

las importaciones también se pueden renombrar

```ts
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
let myValidator = new ZCV();
```

## Importa todo el módulo en una sola variable y utilízala para acceder a las `export`s del módulo

```ts
import * as validator from "./ZipCodeValidator";
let myValidator = new validator.ZipCodeValidator();
```

## `Import`ar un módulo solo por los efectos secundarios

Aunque no es una práctica recomendada, algunos módulos configuran un estado global que pueden utilizar otros módulos.
Estos módulos pueden no tener `export`s o el consumidor no está interesado en ninguna de sus exportaciones.
Para importar esos módulos, usa:

```ts
import "./my-module.js";
```

## Importar tipos

Antes de *TypeScript 3.8*, puedes importar un tipo usando `import`.
Con *TypeScript 3.8*, puedes importar un tipo usando la instrucción `import` o usando `import type`.

```ts
// Reutilizar la misma import
import { APIResponseType } from "./api";

// Usar explícitamente el tipo de import
import type { APIResponseType } from "./api";
```

`import type` siempre está garantizado para ser eliminado de tu *JavaScript*, y herramientas como `Babel` pueden hacer mejores suposiciones sobre tu código a través del indicador del compilador [`isolatedModules`](/tsconfig#isolatedModules).
Puedes leer más en las [notas de la versión 3.8](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#type-only-imports-exports).

## Exportaciones predeterminadas

Cada módulo puede exportar opcionalmente una exportación `default`.
Las exportaciones predeterminadas están marcadas con la palabra clave `default`; y solo puede haber una exportación `default` por módulo.
Las exportaciones `default` se importan utilizando una forma de importación diferente.

Las exportaciones `default` realmente son útiles.
Por ejemplo, una biblioteca como *jQuery* podría tener una exportación predeterminada `jQuery` o `$`, que probablemente también importaríamos con el nombre `$` o `jQuery`.

##### [`JQuery.d.ts`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jquery/JQuery.d.ts)

```ts
declare let $: JQuery;
export default $;
```

##### `App.ts`

```ts
import $ from "jquery";

$("button.continue").html("Next Step...");
```

Las clases y declaraciones de función se pueden crear directamente como exportaciones `default`.
Los nombres de declaración de funciones y clases de exportación predeterminados son opcionales.

##### `ZipCodeValidator.ts`

```ts
export default class ZipCodeValidator {
  static numberRegexp = /^[0-9]+$/;
  isAcceptable(s: string) {
    return s.length === 5 && ZipCodeValidator.numberRegexp.test(s);
  }
}
```

##### `Test.ts`

```ts
import validator from "./ZipCodeValidator";

let myValidator = new validator();
```

o

##### `StaticZipCodeValidator.ts`

```ts
const numberRegexp = /^[0-9]+$/;

export default function (s: string) {
  return s.length === 5 && numberRegexp.test(s);
}
```

##### `Test.ts`

```ts
import validate from "./StaticZipCodeValidator";

let strings = ["Hello", "98052", "101"];

// Usa function validate
strings.forEach((s) => {
  console.log(`"${s}" ${validate(s) ? "matches" : "does not match"}`);
});
```

Las exportaciones `default` también pueden ser solo valores:

##### `OneTwoThree.ts`

```ts
export default "123";
```

##### `Log.ts`

```ts
import num from "./OneTwoThree";

console.log(num); // "123"
```

## `Export todo as x`

Con `TypeScript 3.8`, puedes usar `export * as ns` como forma abreviada de volver a exportar otro módulo con un nombre:

```ts
export * as utilities from "./utilities";
```

Esto toma todas las dependencias de un módulo y lo convierte en un campo exportado, lo podrías importar así:

```ts
import { utilities } from "./index";
```

## `export =` e `import = require()`

Tanto `CommonJS` como `AMD` generalmente tienen el concepto de un objeto `exports` que contiene todas las exportaciones de un módulo.

También admiten la sustitución del objeto `exports` por un único objeto personalizado.
Las exportaciones predeterminadas están destinadas a reemplazar este comportamiento; sin embargo, las dos son incompatibles.
*TypeScript* admite `export =` para modelar el flujo de trabajo tradicional de `CommonJS` y `AMD`.

La sintaxis `export =` especifica un único objeto que se exporta desde el módulo.
Puede ser una clase, interfaz, espacio de nombres, función o enumeración.

Al exportar un módulo usando `export =`, se debe usar `import module = require("module")` específico de *TypeScript* para importar el módulo.

##### `ZipCodeValidator.ts`

```ts
let numberRegexp = /^[0-9]+$/;
class ZipCodeValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}
export = ZipCodeValidator;
```

##### `Test.ts`

```ts
import zip = require("./ZipCodeValidator");

// Algunas muestras para probar
let strings = ["Hello", "98052", "101"];

// Validadores a utilizar
let validator = new zip();

// Muestra si cada cadena pasó cada validador
strings.forEach((s) => {
  console.log(
    `"${s}" - ${validator.isAcceptable(s) ? "matches" : "does not match"}`
  );
});
```

## Generación de código para módulos

Dependiendo del destino del módulo especificado durante la compilación, el compilador generará el código apropiado para `Node.js` ([`CommonJS`](http://wiki.commonjs.org/wiki/CommonJS)), `require.js` ([`AMD`](https://github.com/amdjs/amdjs-api/wiki/AMD)), [`UMD`](https://github.com/umdjs/umd), [`SystemJS`](https://github.com/systemjs/systemjs ) o [módulos nativos *ECMAScript 2015*](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) (*ES6*) sistemas de carga de módulos.
Para obtener más información sobre lo que hacen las llamadas `define`, `require` y `register` en el código generado, consulta la documentación de cada cargador de módulo.

Este sencillo ejemplo muestra cómo los nombres utilizados durante la importación y exportación se traducen al código cargado del módulo.

##### `SimpleModule.ts`

```ts
import m = require("mod");
export let t = m.something + 1;
```

##### *AMD* / `RequireJS SimpleModule.js`

```js
define(["require", "exports", "./mod"], function (require, exports, mod_1) {
  exports.t = mod_1.something + 1;
});
```

##### `CommonJS` / `Node SimpleModule.js`

```js
var mod_1 = require("./mod");
exports.t = mod_1.something + 1;
```

##### `UMD SimpleModule.js`

```js
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./mod"], factory);
  }
})(function (require, exports) {
  var mod_1 = require("./mod");
  exports.t = mod_1.something + 1;
});
```

##### `System SimpleModule.js`

```js
System.register(["./mod"], function (exports_1) {
  var mod_1;
  var t;
  return {
    setters: [
      function (mod_1_1) {
        mod_1 = mod_1_1;
      },
    ],
    execute: function () {
      exports_1("t", (t = mod_1.something + 1));
    },
  };
});
```

##### Módulos nativos de *ECMAScript 2015* `SimpleModule.js`

```js
import { something } from "./mod";
export var t = something + 1;
```

## Ejemplo simple

A continuación, consolidamos las implementaciones de `Validator` utilizadas en ejemplos anteriores para exportar solo una `exporta` con nombre de cada módulo.

Para compilar, debemos especificar un destino de módulo en la línea de comandos. Para `Node.js`, usa `--module commonjs`;
para `require.js`, usa `--module amd`. Por ejemplo:

```shell
tsc --module commonjs Test.ts
```

Cuando se compile, cada módulo se convertirá en un archivo `.js` separado.
Al igual que con las etiquetas de referencia, el compilador seguirá las instrucciones `import` para compilar archivos dependientes.

##### `Validation.ts`

```ts
export interface StringValidator {
  isAcceptable(s: string): boolean;
}
```

##### `LettersOnlyValidator.ts`

```ts
import { StringValidator } from "./Validation";

const lettersRegexp = /^[A-Za-z]+$/;

export class LettersOnlyValidator implements StringValidator {
  isAcceptable(s: string) {
    return lettersRegexp.test(s);
  }
}
```

##### `ZipCodeValidator.ts`

```ts
import { StringValidator } from "./Validation";

const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}
```

##### `Test.ts`

```ts
import { StringValidator } from "./Validation";
import { ZipCodeValidator } from "./ZipCodeValidator";
import { LettersOnlyValidator } from "./LettersOnlyValidator";

// Algunas muestras para probar
let strings = ["Hello", "98052", "101"];

// Validadores a utilizar
let validators: { [s: string]: StringValidator } = {};
validators["ZIP code"] = new ZipCodeValidator();
validators["Letters only"] = new LettersOnlyValidator();

// Muestra si cada cadena pasó cada validador
strings.forEach((s) => {
  for (let name in validators) {
    console.log(
      `"${s}" - ${
        validators[name].isAcceptable(s) ? "matches" : "does not match"
      } ${name}`
    );
  }
});
```

## Carga de módulos opcionales y otros escenarios de carga avanzados

En algunos casos, es posible que desees cargar un módulo solo en determinadas condiciones.
En *TypeScript*, podemos usar el patrón que se muestra a continuación para implementar este y otros escenarios de carga avanzados para invocar directamente los cargadores de módulos sin perder la seguridad de los tipos.

El compilador detecta si cada módulo se utiliza en el *JavaScript* emitido.
Si un identificador de módulo solo se usa como parte de anotaciones de tipo y nunca como una expresión, entonces no se emite ninguna llamada `require` para ese módulo.
Esta elisión de referencias no utilizadas es una buena optimización del rendimiento y también permite la carga opcional de esos módulos.

La idea central del patrón es que la instrucción `import id = require("...")` nos da acceso a los tipos expuestos por el módulo.
El cargador de módulos se invoca (a través de `require`) dinámicamente, como se muestra en los bloques `if` a continuación.
Esto aprovecha la optimización de elisión de referencia para que el módulo solo se cargue cuando sea necesario.
Para que este patrón funcione, es importante que el símbolo definido a través de una `import` solo se use en posiciones de tipo (es decir, nunca en una posición que se emitiría en *JavaScript*).

Para mantener la seguridad de los tipos, podemos usar la palabra clave `typeof`.
La palabra clave `typeof`, cuando se usa en una posición de tipo, produce el tipo de un valor, en este caso el tipo del módulo.

##### Carga de módulos dinámicos en `Node.js`

```ts
declare function require(moduleName: string): any;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
  let ZipCodeValidator: typeof Zip = require("./ZipCodeValidator");
  let validator = new ZipCodeValidator();
  if (validator.isAcceptable("...")) {
    /* ... */
  }
}
```

##### Ejemplo: Carga dinámica del módulo en `require.js`

```ts
declare function require(
  moduleNames: string[],
  onLoad: (...args: any[]) => void
): void;

import * as Zip from "./ZipCodeValidator";

if (needZipValidation) {
  require(["./ZipCodeValidator"], (ZipCodeValidator: typeof Zip) => {
    let validator = new ZipCodeValidator.ZipCodeValidator();
    if (validator.isAcceptable("...")) {
      /* ... */
    }
  });
}
```

##### Ejemplo: Carga dinámica del módulo en `System.js`

```ts
declare const System: any;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
  System.import("./ZipCodeValidator").then((ZipCodeValidator: typeof Zip) => {
    var x = new ZipCodeValidator();
    if (x.isAcceptable("...")) {
      /* ... */
    }
  });
}
```

## Trabajar con otras bibliotecas de *JavaScript*

Para describir la forma de las bibliotecas que no están escritas en *TypeScript*, debemos declarar la *API* que expone la biblioteca.

Llamamos "ambiente" a las declaraciones que no definen una implementación.
Normalmente, estas se definen en archivos `.d.ts`.
Si estás familiarizado con *C*/*C++*, los puedes considerar como archivos `.h`.
Veamos algunos ejemplos.

## Módulos ambientales

En `Node.js`, la mayoría de las tareas se realizan cargando uno o más módulos.
Podríamos definir cada módulo en su propio archivo `.d.ts` con declaraciones de exportación de nivel superior, pero es más conveniente escribirlas como un archivo `.d.ts` más grande.
Para hacerlo, usamos una construcción similar a los espacios de nombres ambientales, pero usamos la palabra clave `module` y el nombre entre comillas del módulo que estará disponible para una posterior importación.
Por ejemplo:

##### `node.d.ts` (extracto simplificado)

```ts
declare module "url" {
  export interface Url {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }

  export function parse(
    urlStr: string,
    parseQueryString?,
    slashesDenoteHost?
  ): Url;
}

declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

Ahora podemos `/// <reference>` `node.d.ts` y luego cargar los módulos usando `import url = require("url");` o `import * as URL from "url"`.

```ts
/// <reference path="node.d.ts"/>
import * as URL from "url";
let myUrl = URL.parse("https://www.typescriptlang.org");
```

### Abreviar módulos ambientales

Si no deseas tomarte el tiempo para escribir declaraciones antes de usar un nuevo módulo, puedes usar una declaración abreviada para comenzar rápidamente.

##### `declarations.d.ts`

```ts
declare module "hot-new-module";
```

Todas las importaciones de una declaración abreviada de módulo tendrán el tipo `any`.

```ts
import x, { y } from "hot-new-module";
x(y);
```

### Declaraciones comodín de módulos

Algunos cargadores de módulos como [`SystemJS`](https://github.com/systemjs/systemjs/blob/master/docs/module-types.md)
y [`AMD`](https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md) permiten la importación de contenido que no es *JavaScript*.
Estos suelen utilizar un prefijo o sufijo para indicar la semántica de carga especial.
Las declaraciones comodín de módulos se pueden utilizar para cubrir estos casos.

```ts
declare module "*!text" {
  const content: string;
  export default content;
}
// Algunos lo hacen al revés.
declare module "json!*" {
  const value: any;
  export default value;
}
```

Ahora puedes importar cosas que coincidan con `"*!text"` o `"json!*"`.

```ts
import fileContent from "./xyz.txt!text";
import data from "json!http://example.com/data.json";
console.log(data, fileContent);
```

### Módulos `UMD`

Algunas bibliotecas están diseñadas para usarse en muchos cargadores de módulos o sin carga de módulos (variables globales).
Estas se conocen como módulos [`UMD`](https://github.com/umdjs/umd).
Se puede acceder a estas bibliotecas mediante una importación o una variable global.
Por ejemplo:

##### math-lib.d.ts

```ts
export function isPrime(x: number): boolean;
export as namespace mathLib;
```

Luego, la biblioteca se puede usar como una importación dentro de los módulos:

```ts
import { isPrime } from "math-lib";
isPrime(2);
mathLib.isPrime(2); // ERROR: no puedes usar la definición global desde dentro de un módulo
```

También se puede utilizar como variable global, pero solo dentro de un script.
(Un script es un archivo sin importaciones ni exportaciones).

```ts
mathLib.isPrime(2);
```

## Orientación para estructurar módulos

## Exportar lo más cerca posible del nivel superior

Los consumidores de tu módulo deben tener la menor fricción posible al usar los elementos que exportas.
Agregar demasiados niveles de anidación tiende a ser engorroso, así que piensa detenidamente cómo deseas estructurar las cosas.

Exportar un espacio de nombres desde tu módulo es un ejemplo de cómo agregar demasiadas capas de anidamiento.
Si bien los espacios de nombres a veces tienen sus usos, agregan un nivel adicional de direccionamiento indirecto cuando se usan módulos.
Esto rápidamente se puede convertir en un problema para los usuarios y, por lo general, no es necesario.

Los métodos estáticos en una clase exportada tienen un problema similar: la clase en sí misma agrega una capa de anidamiento.
A menos que aumentes la expresividad o la intención de una manera claramente útil, considera simplemente exportar una función auxiliar.

### Si solo estás exportando una sola `clase` o `function`, usa `export default`

Así como "exportar cerca del nivel superior" reduce la fricción en los consumidores de tu módulo, también lo hace la introducción de una exportación predeterminada.
Si el propósito principal de un módulo es albergar una exportación específica, entonces deberías considerar exportarlo como una exportación `default`.
Esto hace que tanto la importación como el uso real de la importación sean un poco más fáciles.
Por ejemplo:

#### `MyClass.ts`

```ts
export default class SomeType {
  constructor() { ... }
}
```

#### `MyFunc.ts`

```ts
export default function getThing() {
  return "thing";
}
```

#### `Consumer.ts`

```ts
import t from "./MyClass";
import f from "./MyFunc";
let x = new t();
console.log(f());
```

Esto es óptimo para los consumidores. Pueden nombrar tu tipo como quieran (`t` en este caso) y no tienen que utilizar demasiados puntos para encontrar tus objetos.

### Si estás exportando varios objetos, colócalos todos en el nivel superior

#### `MyThings.ts`

```ts
export class SomeType {
  /* ... */
}
export function someFunc() {
  /* ... */
}
```

A la inversa, al importar:

### Enumera explícitamente los nombres importados

#### `Consumer.ts`

```ts
import { SomeType, someFunc } from "./MyThings";
let x = new SomeType();
let y = someFunc();
```

### Utiliza el patrón de importación del espacio de nombres si estás importando una gran cantidad de cosas

#### `MyLargeModule.ts`

```ts
export class Dog { ... }
export class Cat { ... }
export class Tree { ... }
export class Flower { ... }
```

#### `Consumer.ts`

```ts
import * as myLargeModule from "./MyLargeModule.ts";
let x = new myLargeModule.Dog();
```

## Reexportar para extender

A menudo, necesitarás extender la funcionalidad de un módulo.
Un patrón *JS* común es extender el objeto original con `extensions`, similar a cómo funcionan las extensiones de `JQuery`.
Como mencionamos antes, los módulos no se *fusionan* como lo harían los objetos del espacio de nombres globales.
La solución recomendada es *no* mutar el objeto original, sino exportar una nueva entidad que proporcione la nueva funcionalidad.

Considera una implementación de calculadora simple definida en el módulo `Calculator.ts`.
El módulo también exporta una función auxiliar para probar la funcionalidad de la calculadora pasando una lista de cadenas de entrada y escribiendo el resultado al final.

#### `Calculator.ts`

```ts
export class Calculator {
  private current = 0;
  private memory = 0;
  private operator: string;

  protected processDigit(digit: string, currentValue: number) {
    if (digit >= "0" && digit <= "9") {
      return currentValue * 10 + (digit.charCodeAt(0) - "0".charCodeAt(0));
    }
  }

  protected processOperator(operator: string) {
    if (["+", "-", "*", "/"].indexOf(operator) >= 0) {
      return operator;
    }
  }

  protected evaluateOperator(
    operator: string,
    left: number,
    right: number
  ): number {
    switch (this.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
    }
  }

  private evaluate() {
    if (this.operator) {
      this.memory = this.evaluateOperator(
        this.operator,
        this.memory,
        this.current
      );
    } else {
      this.memory = this.current;
    }
    this.current = 0;
  }

  public handleChar(char: string) {
    if (char === "=") {
      this.evaluate();
      return;
    } else {
      let value = this.processDigit(char, this.current);
      if (value !== undefined) {
        this.current = value;
        return;
      } else {
        let value = this.processOperator(char);
        if (value !== undefined) {
          this.evaluate();
          this.operator = value;
          return;
        }
      }
    }
    throw new Error(`Unsupported input: '${char}'`);
  }

  public getResult() {
    return this.memory;
  }
}

export function test(c: Calculator, input: string) {
  for (let i = 0; i < input.length; i++) {
    c.handleChar(input[i]);
  }

  console.log(`result of '${input}' is '${c.getResult()}'`);
}
```

Aquí hay una prueba simple para la calculadora que usa la función `test` expuesta.

#### `TestCalculator.ts`

```ts
import { Calculator, test } from "./Calculator";

let c = new Calculator();
test(c, "1+2*33/11="); // prints 9
```

Ahora, para ampliar esto y agregar soporte para la entrada con números en bases distintas de 10, creemos `ProgrammerCalculator.ts`

#### `ProgrammerCalculator.ts`

```ts
import { Calculator } from "./Calculator";

class ProgrammerCalculator extends Calculator {
  static digits = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
  ];

  constructor(public base: number) {
    super();
    const maxBase = ProgrammerCalculator.digits.length;
    if (base <= 0 || base > maxBase) {
      throw new Error(`base has to be within 0 to ${maxBase} inclusive.`);
    }
  }

  protected processDigit(digit: string, currentValue: number) {
    if (ProgrammerCalculator.digits.indexOf(digit) >= 0) {
      return (
        currentValue * this.base + ProgrammerCalculator.digits.indexOf(digit)
      );
    }
  }
}

// Export the new extended calculator as Calculator
export { ProgrammerCalculator as Calculator };

// Además, exporta la función helper
export { test } from "./Calculator";
```

El nuevo módulo `ProgrammerCalculator` exporta una forma de *API* similar a la del módulo `Calculator` original, pero no aumenta ningún objeto en el módulo original.
Aquí hay una prueba para nuestra clase `ProgrammerCalculator`:

#### `TestProgrammerCalculator.ts`

```ts
import { Calculator, test } from "./ProgrammerCalculator";

let c = new Calculator(2);
test(c, "001+010="); // prints 3
```

## No uses espacios de nombres en módulos

Cuando se cambia por primera vez a una organización basada en módulos, una tendencia común es envolver las exportaciones en una capa adicional de espacios de nombres.
Los módulos tienen su propio alcance y solo las declaraciones exportadas son visibles desde fuera del módulo.
Teniendo esto en cuenta, el espacio de nombres proporciona muy poco valor, si es que lo hay, cuando se trabaja con módulos.

En el frente de la organización, los espacios de nombres son útiles para agrupar objetos y tipos relacionados lógicamente en el ámbito global.
Por ejemplo, en *C#*, encontrarás todos los tipos de colección en `System.Collections`.
Al organizar nuestros tipos en espacios de nombres jerárquicos, proporcionamos una buena experiencia de "descubrimiento" para los usuarios de esos tipos.
Los módulos, por otro lado, ya están presentes en un sistema de archivos, necesariamente.
Tenemos que resolverlos por ruta y nombre de archivo, por lo que hay un esquema de organización lógico que podemos usar.
Podemos tener un directorio `/collections/generic/` con un módulo de lista en ella.

Los espacios de nombres son importantes para evitar colisiones de nombres en el ámbito global.
Por ejemplo, puedes tener `My.Application.Customer.AddForm` y `My.Application.Order.AddForm` ⏤ dos tipos con el mismo nombre, pero con un espacio de nombres diferente.
Sin embargo, esto no es un problema con los módulos.
Dentro de un módulo, no hay ninguna razón plausible para tener dos objetos con el mismo nombre.
Desde el punto de vista del consumo, el consumidor de cualquier módulo puede elegir el nombre que usará para referirse al módulo, por lo que los conflictos de nombres accidentales son imposibles.

> Para obtener más información sobre los módulos y los espacios de nombres, consulta [Espacios de nombres y módulos](/docs/handbook/namespaces-and-modules.html).

## Banderas rojas

Todas las siguientes son señales de alerta para la estructuración de módulos. Vuelve a verificar que no estás intentando asignar un espacio de nombres a tus módulos externos si alguno de estos se aplica a tus archivos:

- Un archivo cuya única declaración de nivel superior es `export namespace Foo {...}` (elimina `Foo` y mueve todo 'hacia arriba' un nivel)
- Múltiples archivos que tienen el mismo `export namespace Foo {` en el nivel superior (¡no creas que estos se van a combinar en un solo `Foo`!)
