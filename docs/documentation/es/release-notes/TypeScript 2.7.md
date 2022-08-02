---
title: TypeScript 2.7
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-7.html
oneline: Notas de la versión de TypeScript 2.7
---

## Propiedades con nombre constante

*TypeScript 2.7* agrega soporte para declarar propiedades con nombre constante en tipos, incluidos los símbolos *ECMAScript*.

##### Ejemplo

```ts
// Lib
export const SERIALIZE = Symbol("serialize-method-key");

export interface Serializable {
  [SERIALIZE](obj: {}): string;
}
```

```ts
// consumidor

import { SERIALIZE, Serializable } from "lib";

class JSONSerializableItem implements Serializable {
  [SERIALIZE](obj: {}) {
    return JSON.stringify(obj);
  }
}
```

Esto también se aplica a literales numéricos y de cadena.

##### Ejemplo

```ts
const Foo = "Foo";
const Bar = "Bar";

let x = {
  [Foo]: 100,
  [Bar]: "hello"
};

let a = x[Foo]; // tiene tipo 'number'
let b = x[Bar]; // tiene tipo 'string'
```

## `unique symbol`

Para permitir el tratamiento de símbolos como literales únicos, está disponible un nuevo tipo `unique symbol`.
El `unique symbol` es un subtipo de `symbol` y se produce únicamente a partir de la llamada a `Symbol()` o `Symbol.for()`, o de anotaciones explícitas de tipo.
El nuevo tipo solo está permitido en declaraciones `const` y propiedades `readonly static`, y para hacer referencia a un símbolo único específico, tendrás que usar el operador `typeof`.
Cada referencia a un `unique symbol` implica una identidad completamente única que está vinculada a una determinada declaración.

##### Ejemplo

```ts
// ¡Funciona!
declare const Foo: unique symbol;

// ¡Error! 'Bar' no es una constante.
let Bar: unique symbol = Symbol();

// ¡Funciona! - se refiere a un símbolo único, pero su identidad está ligada a 'Foo'.
let Baz: typeof Foo = Foo;

// También funciona.
class C {
  static readonly StaticSymbol: unique symbol = Symbol();
}
```

Debido a que cada `unique symbol` tiene una identidad completamente separada, no hay dos tipos de `unique symbol` asignables o comparables entre sí.

##### Ejemplo

```ts
const Foo = Symbol();
const Bar = Symbol();

// Error: no se pueden comparar dos símbolos únicos.
if (Foo === Bar) {
  // ...
}
```

## Iniciación de clase estricta

*TypeScript 2.7* introduce una nueva marca llamada [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization).
Este indicador realiza comprobaciones para garantizar que cada propiedad de instancia de una clase se inicie en el cuerpo del constructor o mediante un iniciador de propiedad.
Por ejemplo

```ts
class C {
  foo: number;
  bar = "hello";
  baz: boolean;
  //  ~~~
  //  ¡Error! La propiedad 'baz' no tiene iniciador y definitivamente no está asignada en el
  //         constructor.

  constructor() {
    this.foo = 42;
  }
}
```

En lo anterior, si realmente queríamos que `baz` potencialmente fuera `undefined`, deberíamos haberlo declarado con el tipo `boolean | undefined`.

Hay ciertos escenarios en los que las propiedades se pueden iniciar indirectamente (tal vez mediante un método auxiliar o una biblioteca de inyección de dependencias), en cuyo caso puedes usar los nuevos *modificadores de aserción de asignación definida* para tus propiedades (que se describen a continuación).

```ts
class C {
  foo!: number;
  // ^
  // Nota este '!' modificador.
  // Esta es la "aserción de asignación definida"

  constructor() {
    this.initialize();
  }

  initialize() {
    this.foo = 0;
  }
}
```

Ten en cuenta que [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization) se activará junto con otros indicadores de modo [`strict`](/tsconfig#strict), que pueden afectar tu proyecto.
Puedes establecer la configuración de [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization) en `false` en las `compilerOptions` de tu `tsconfig.json`, o en `--strictPropertyInitialization false` en la línea de comandos para desactivar esta comprobación.

## Aserciones de asignaciones definidas

La aserción de asignación definida es una característica que permite colocar un `!` después de la propiedad de instancia y las declaraciones de variables para transmitir a *TypeScript* que una variable está efectivamente asignada para todos los propósitos, incluso si los análisis de *TypeScript* no lo pueden detectar.

##### Ejemplo

```ts
let x: number;
initialize();
console.log(x + x);
//          ~   ~
// ¡Error! La variable 'x' se usa antes de ser asignada.

function initialize() {
  x = 10;
}
```

Con aserciones de asignación definidas, podemos acertar que `x` realmente se asigna agregando un `!` a su declaración:

```ts
// Observa el '!'
let x!: number;
initialize();

// ¡No hay error!
console.log(x + x);

function initialize() {
  x = 10;
}
```

En cierto sentido, el operador de aserción de asignación definida es el dual del operador de aserción no nula (en la que *expresiones* se fijan posteriormente con un `!`), que también podríamos haber usado en el ejemplo.

```ts
let x: number;
initialize();

// ¡No hay error!
console.log(x! + x!);

function initialize() {
    x = 10;

```

En nuestro ejemplo, sabíamos que todos los usos de `x` se inician, por lo que tiene más sentido usar aserciones de asignación definidas que aserciones no nulas.

## Tuplas de longitud fija

En *TypeScript 2.6* y versiones anteriores, `[number, string, string]` se consideraba un subtipo de `[number, string]`.
Esto fue motivado por la naturaleza estructural de *TypeScript*; el primer y segundo elementos de un `[number, string, string]` son respectivamente subtipos del primero y segundo elementos de `[number, string]`.
Sin embargo, después de examinar el uso de tuplas en el mundo real, notamos que la mayoría de las situaciones en las que esto estaba permitido normalmente eran indeseables.

En *TypeScript 2.7*, las tuplas de diferentes aridades ya no se pueden asignar entre sí.
Gracias a una solicitud de extracción de [Kiara Grouwstra](https://github.com/KiaraGrouwstra), los tipos de tuplas ahora codifican su aridad en el tipo de su respectiva propiedad de `length`.
Esto se logra aprovechando los tipos literales numéricos, que ahora permiten que las tuplas sean distintas de las tuplas de diferentes aridades.

Conceptualmente, podrías considerar que el tipo `[number, string]` es equivalente a la siguiente declaración de `NumStrTuple`:

```ts
interface NumStrTuple extends Array<number | string> {
  0: number;
  1: string;
  length: 2; // usando el tipo literal numérico '2'
}
```

Ten en cuenta que este es un cambio importante para algún código.
Si necesitas recurrir al comportamiento original en el que las tuplas solo imponen una longitud mínima, puedes usar una declaración similar que no defina explícitamente una propiedad `length`, volviendo a `number`.

```ts
interface MinimumNumStrTuple extends Array<number | string> {
  0: number;
  1: string;
}
```

Ten en cuenta que esto no implica que las tuplas representen arreglos inmutables, pero es una convención implícita.

## Inferencia de tipo mejorada para literales de objetos

*TypeScript 2.7* mejora la inferencia de tipos para múltiples literales de objetos que ocurren en el mismo contexto.
Cuando varios tipos de literales de objetos contribuyen a un tipo unión, ahora *normalizamos* los tipos literales de objetos de manera que todas las propiedades estén presentes en cada constituyente del tipo unión.

Considera:

```ts
const obj = test ? { text: "hello" } : {}; // { text: string } | { text?: undefined }
const s = obj.text; // string | undefined
```

Anteriormente, el tipo `{}` se infirió para `obj` y, posteriormente, la segunda línea provocó un error porque `obj` parecería no tener propiedades.
Eso obviamente, no fue lo ideal.

##### Ejemplo

```ts
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = [{ a: 1, b: 2 }, { a: "abc" }, {}][0];
obj.a; // string | number | undefined
obj.b; // number | undefined
```

Las inferencias de tipo literal de objeto múltiple para el mismo parámetro de tipo se contraen de manera similar en un solo tipo de unión normalizada:

```ts
declare function f<T>(...items: T[]): T;
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = f({ a: 1, b: 2 }, { a: "abc" }, {});
obj.a; // string | number | undefined
obj.b; // number | undefined
```

## Manejo mejorado de clases estructuralmente idénticas y expresiones `instanceof`

*TypeScript 2.7* mejora el manejo de clases estructuralmente idénticas en tipos unión y expresiones `instanceof`:

- Los tipos de clase estructuralmente idénticos, pero distintos, ahora se conservan en tipos unión (en lugar de eliminar todos menos uno).
- La reducción de subtipos del tipo unión solo elimina un tipo de clase si es una subclase de *y* deriva de otro tipo de clase en la unión.
- La comprobación de tipo del operador `instanceof` ahora se basa en si el tipo del operando izquierdo *deriva de* el tipo indicado por el operando derecho (a diferencia de una comprobación de subtipo estructural).

Esto significa que los tipos de unión e `instanceof` distinguen correctamente entre clases estructuralmente idénticas.

##### Ejemplo

```ts
class A {}
class B extends A {}
class C extends A {}
class D extends A {
  c: string;
}
class E extends D {}

let x1 = !true ? new A() : new B(); // A
let x2 = !true ? new B() : new C(); // B | C (previously B)
let x3 = !true ? new C() : new D(); // C | D (previously C)

let a1 = [new A(), new B(), new C(), new D(), new E()]; // A[]
let a2 = [new B(), new C(), new D(), new E()]; // (B | C | D)[] (previously B[])

function f1(x: B | C | D) {
  if (x instanceof B) {
    x; // B (previously B | D)
  } else if (x instanceof C) {
    x; // C
  } else {
    x; // D (previously never)
  }
}
```

## Guardias de tipo inferidos desde el operador `in`

El operador `in` ahora actúa como una expresión restrictiva para los tipos.

Para una expresión `n in x`, donde `n` es un tipo cadena literal o literal de cadena y `x` es un tipo unión, la rama `"true"` se restringe a tipos que tienen una propiedad `n` opcional o requerida, y la rama `"false"` se restringe a tipos que tienen una propiedad `n` opcional o faltante.

##### Ejemplo

```ts
interface A {
  a: number;
}
interface B {
  b: string;
}

function foo(x: A | B) {
  if ("a" in x) {
    return x.a;
  }
  return x.b;
}
```

## Soporte para `import d from "cjs"` de módulos *CommonJS* con `--esModuleInterop`

*TypeScript 2.7* actualiza la emisión del módulo *CommonJS*/*AMD*/*UMD* para sintetizar registros de espacio de nombres en función de la presencia de un indicador `__esModule` en [`esModuleInterop`](/tsconfig#esModuleInterop).
El cambio acerca la salida generada de *TypeScript* a la generada por *Babel*.

Anteriormente, los módulos *CommonJS*/*AMD*/*UMD* se trataban de la misma manera que los módulos *ES6*, lo que generaba un par de problemas. A saber:

- *TypeScript* trata una importación de espacio de nombres (es decir, `import * as foo from "foo"`) para un módulo *CommonJS*/*AMD*/*UMD* como equivalente a `const foo = require("foo")`. Las cosas son simples aquí, pero no funcionan si el objeto principal que se está importando es un primitivo o una clase o una función. La especificación *ECMAScript* estipula que un registro de espacio de nombres es un objeto simple y que una importación de espacio de nombres (`foo` en el ejemplo anterior) no es invocable, aunque *TypeScript* lo permite
- De manera similar, una importación predeterminada (es decir, `import d from "foo"`) para un módulo *CommonJS*/*AMD*/*UMD* como equivalente a `const d = require("foo").default`. La mayoría de los módulos *CommonJS*/*AMD*/*UMD* disponibles hoy en día no tienen una exportación `default`, lo que hace que este patrón de importación sea prácticamente inutilizable para importar módulos que no son de *ES* (es decir, *CommonJS*/*AMD*/*UMD*). Por ejemplo, `import fs from "fs"` o `import express from "express"` no están permitidos.

Bajo el nuevo [`esModuleInterop`](/tsconfig#esModuleInterop) se deben abordar estos dos problemas:

- Una importación de espacio de nombres (es decir, `import * as foo from "foo"`) ahora está correctamente marcado como `uncallable`. Llamarlo resultará en un error.
- Las importaciones predeterminadas a *CommonJS*/*AMD*/*UMD* ahora están permitidas (por ejemplo, `import fs from "fs"`) y deberían funcionar como se esperaba.

> Nota: El nuevo comportamiento se agrega bajo una bandera para evitar interrupciones injustificadas en las bases de código existentes. **Recomendamos encarecidamente aplicarlo tanto a proyectos nuevos como a proyectos existentes**.
> Para proyectos existentes, importaciones de espacio de nombres (`import * as express from "express"; express();`) deberá convertirse a importaciones predeterminadas (`import express from "express"; express();`).

##### Ejemplo

Con [`esModuleInterop`](/tsconfig#esModuleInterop) se generan dos nuevos ayudantes `__importStar` y `__importDefault` para importar `*` e importar `default` respectivamente.
Por ejemplo, ingresa como:

```ts
import * as foo from "foo";
import b from "bar";
```

Generará:

```js
"use strict";
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var foo = __importStar(require("foo"));
var bar_1 = __importDefault(require("bar"));
```

## Separadores numéricos

*TypeScript 2.7* ofrece soporte para [Separadores numéricos *ES*](https://github.com/tc39/proposal-numeric-separator).
Los literales numéricos ahora se pueden separar en segmentos usando `_`.

##### Ejemplo

```ts
const million = 1_000_000;
const phone = 555_734_2231;
const bytes = 0xff_0c_00_ff;
const word = 0b1100_0011_1101_0001;
```

## Salida más limpia en modo `--watch`

El modo `--watch` de *TypeScript* ahora borra la pantalla después de que se solicita una recompilación.

## Salida `--pretty` más bonita

El indicador [`pretty`](/tsconfig#pretty) de *TypeScript* puede hacer que los mensajes de error sean más fáciles de leer y administrar.
[`pretty`](/tsconfig#pretty) ahora usa colores para nombres de archivos, códigos de diagnóstico y números de línea.
Los nombres de archivo y las posiciones ahora también están formateados para permitir la navegación en terminales comunes (por ejemplo, terminal de *Visual Studio Code*).
