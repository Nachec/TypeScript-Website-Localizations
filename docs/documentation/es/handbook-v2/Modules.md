---
title: Módulos
layout: docs
permalink: /docs/handbook/2/modules.html
oneline: "Cómo gestiona JavaScript la comunicación a través de los límites de los archivos."
---

*JavaScript* tiene una larga historia de diferentes formas de manejar el código modularizado.
*TypeScript*, que existe desde 2012, ha implementado soporte para muchos de estos formatos, pero con el tiempo la comunidad y la especificación de *JavaScript* han convergido en un formato llamado *Módulos ES* (o módulos *ES6*). Es posible que lo conozcas como la sintaxis de `importación`/`exportación`.

Los *módulos ES* se agregaron a la especificación de *JavaScript* en 2015, y para 2020 tenían un amplio soporte en la mayoría de los navegadores web y entornos de ejecución de *JavaScript*.

Para enfocarte, el manual cubrirá tanto los *Módulos ES* como su popular sintaxis *CommonJS* `module.exports =` anterior al cursor, y puedes encontrar información sobre los otros patrones de módulo en la sección de referencia en [Módulos](/docs/handbook/modules .html).

## Cómo se definen los módulos de *JavaScript*

En *TypeScript*, al igual que en *ECMAScript 2015*, cualquier archivo que contenga una `import` o `export` de nivel superior se considera un módulo.

Por el contrario, un archivo sin declaraciones de importación o exportación de nivel superior se trata como un script cuyo contenido está disponible en el ámbito global (y, por lo tanto, también en los módulos).

Los módulos se ejecutan dentro de su propio ámbito, no en el ámbito global.
Esto significa que las variables, funciones, clases, etc. declaradas en un módulo no son visibles fuera del módulo a menos que se exporten explícitamente utilizando una de las formas de exportación.
Por el contrario, para consumir una variable, función, clase, interfaz, etc. exportada desde un módulo diferente, se debe importar utilizando una de las formas de importación.

## No módulos

Antes de comenzar, es importante comprender qué considera *TypeScript* un módulo.
La especificación de *JavaScript* declara que cualquier archivo *JavaScript* sin una `export` o `await` de nivel superior se debe considerar un script y no un módulo.

Dentro de un archivo de script, las variables y los tipos se declaran en el alcance global compartido, y se asume que usarás la opción del compilador [`outFile`](/tsconfig#outFile) para unir múltiples archivos de entrada en un archivo de salida, o uses múltiples etiquetas `<script>` en tu *HTML* para cargar estos archivos (¡en el orden correcto!).

Si tienes un archivo que actualmente no tiene ninguna `import` o `export`, pero deseas sea tratado como un módulo, agrega la línea:

```ts twoslash
export {};
```

que cambiará el archivo para que sea un módulo que no exporta nada. Esta sintaxis funciona independientemente del destino del módulo.

## Módulos en *TypeScript*

<blockquote class='bg-reading'>
   <p>Lectura adicional:<br/>
   <a href='https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules'>JS para impacientes (Módulos)</a><br/>
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Guide/Modules'>MDN: Módulos JavaScript</a><br/>
   </p>
</blockquote>

Hay tres cosas principales a considerar al escribir código basado en módulos en *TypeScript*:

- **Sintaxis**: ¿Qué sintaxis quiero usar para importar y exportar cosas?
- **Resolución de módulo**: ¿Cuál es la relación entre los nombres de los módulos (o rutas) y los archivos en el disco?
- **Objetivo de salida del módulo**: ¿Cómo debería verse mi módulo *JavaScript* emitido?

### Sintaxis de *módulo ES*

Un archivo puede declarar una exportación principal a través de `export default`:

```ts twoslash
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

Esto luego se importa a través de:

```ts twoslash
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
// @filename: index.ts
// ---cut---
import helloWorld from "./hello.js";
helloWorld();
```

Además de la exportación predeterminada, puedes tener más de una exportación de variables y funciones a través de `export` omitiendo `default`:

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export class RandomNumberGenerator {}

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
```

Estos se pueden usar en otro archivo a través de la sintaxis `import`:

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;
export class RandomNumberGenerator {}
export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
// @filename: app.ts
// ---cut---
import { pi, phi, absolute } from "./maths.js";

console.log(pi);
const absPhi = absolute(phi);
//    ^?
```

### Sintaxis de importación adicional

Se puede cambiar el nombre de una importación usando un formato como `import {old as new}`:

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
// @filename: app.ts
// ---cut---
import { pi as π } from "./maths.js";

console.log(π);
//          ^?
```

Puedes mezclar y combinar la sintaxis anterior en una sola `import`:

```ts twoslash
// @filename: maths.ts
export const pi = 3.14;
export default class RandomNumberGenerator {}

// @filename: app.ts
import RandomNumberGenerator, { pi as π } from "./maths.js";

RandomNumberGenerator;
// ^?

console.log(π);
//          ^?
```

Puedes tomar todos los objetos exportados y ponerlos en un solo espacio de nombres usando `* as name`:

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
// ---cut---
// @filename: app.ts
import * as math from "./maths.js";

console.log(math.pi);
const positivePhi = math.absolute(math.phi);
//    ^?
```

Puedes importar un archivo y *no* incluir ninguna variable en tu módulo actual a través de `import "./file"`:

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
// ---cut---
// @filename: app.ts
import "./maths.js";

console.log("3.14");
```

En este caso, la `import` no hace nada. Sin embargo, se evaluó todo el código en `maths.ts`, lo que podría desencadenar efectos secundarios que afecten a otros objetos.

#### Sintaxis del *módulo ES* específica de *TypeScript*

Los tipos se pueden exportar e importar utilizando la misma sintaxis que los valores de *JavaScript*:

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };

export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}

// @filename: app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

*TypeScript* ha extendido la sintaxis `import` con dos conceptos para declarar una `import`ación de un tipo:

###### `import type`

Es una declaración de `import`ación que *solo* puede importar tipos:

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";

// @filename: valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;

// @filename: app.ts
// @errors: 1361
import type { createCatName } from "./animal.js";
const name = createCatName();
```

###### Importaciones de `type` en línea

*TypeScript 4.5* también permite que las importaciones individuales tengan el prefijo `type` para indicar que la referencia importada es un tipo:

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";
// ---cut---
// @filename: app.ts
import { createCatName, type Cat, type Dog } from "./animal.js";

export type Animals = Cat | Dog;
const name = createCatName();
```

Juntos, estos permiten que un transpilador que no sea de *TypeScript* tal como *Babel*, `swc` o `esbuild` para que sepa cuáles importaciones se pueden eliminar de forma segura.

#### Sintaxis de *módulo ES* con comportamiento *CommonJS*

*TypeScript* tiene una sintaxis de *módulo ES* que *directamente* se correlaciona con `require` de *CommonJS* y *AMD*. Las importaciones que utilizan el *módulo ES* son *en la mayoría de los casos* iguales que el `require` de esos entornos, pero esta sintaxis garantiza que tenga una coincidencia 1 a 1 en tu archivo *TypeScript* con la salida *CommonJS*:

```ts twoslash
/// <reference types="node" />
// @module: commonjs
// ---cut---
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

Puedes obtener más información sobre esta sintaxis en la [página de referencia de módulos](/docs/handbook/modules.html#export-and-import-require).

## Sintaxis *CommonJS*

*CommonJS* es el formato en el que se entregan la mayoría de los módulos en `npm`. Incluso si estás escribiendo utilizando la sintaxis de los *módulos ES* anterior, tener una breve comprensión de cómo funciona la sintaxis de *CommonJS* te ayudará a depurar más fácilmente.

#### Exportar

Los identificadores se exportan estableciendo la propiedad `export` en un global llamado `module`.

```ts twoslash
/// <reference types="node" />
// ---cut---
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

Luego, estos archivos se pueden importar a través de una declaración `require`:

```ts twoslash
// @module: commonjs
// @filename: maths.ts
/// <reference types="node" />
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
// @filename: index.ts
// ---cut---
const maths = require("maths");
maths.pi;
//    ^?
```

O puedes simplificar un poco usando la función de desestructuración en *JavaScript*:

```ts twoslash
// @module: commonjs
// @filename: maths.ts
/// <reference types="node" />
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
// @filename: index.ts
// ---cut---
const { squareTwo } = require("maths");
squareTwo;
// ^?
```

### Interoperabilidad de *CommonJS* y *módulos ES*

Existe una falta de coincidencia en las características entre *CommonJS* y los *módulos ES* con respecto a la distinción entre una importación predeterminada y una importación de objeto del espacio de nombres de módulo. *TypeScript* tiene un indicador de compilador para reducir la fricción entre los dos conjuntos diferentes de restricciones con [`esModuleInterop`](/tsconfig#esModuleInterop).

## Opciones de resolución de módulo de *TypeScript*

La resolución de módulo es el proceso de tomar una cadena de la declaración `import` o `require` y determinar a qué archivo se refiere esa cadena.

*TypeScript* incluye dos estrategias de resolución: Clásica y *Node*. *Classic*, el valor predeterminado cuando la opción del compilador [`module`](/tsconfig#module) no es `commonjs`, se incluye para compatibilidad con versiones anteriores.
La estrategia *Node* replica cómo funciona *Node.js* en el modo *CommonJS*, con comprobaciones adicionales para `.ts` y `.d.ts`.

Hay muchos indicadores *TSConfig* que influyen en la estrategia del módulo dentro de *TypeScript*: [`moduleResolution`](/tsconfig#moduleResolution), [`baseUrl`](/tsconfig#baseUrl), [`paths`](/tsconfig#paths), [`rootDirs`](/tsconfig#rootDirs).

Para conocer todos los detalles sobre cómo funcionan estas estrategias, puedes consultar la [Resolución de módulo](/docs/handbook/module-resolution.html).

## Opciones de salida del módulo de *TypeScript*

Hay dos opciones que afectan la salida de *JavaScript* emitida:

- [`target`](/tsconfig#target) que determina qué características de *JS* se rebajan (se convierten para ejecutarse en tiempos de ejecución de *JavaScript* más antiguos) y cuáles se dejan intactas 
- [`module`](/tsconfig#module) que determina qué código se utiliza para que los módulos interactúen entre sí

El [`target`](/tsconfig#target) que utilices está determinado por las funciones disponibles en el entorno de ejecución de *JavaScript* en el que esperas ejecutar el código *TypeScript*. Eso podría ser: el navegador web más antiguo que admite, la versión más baja de *Node.js* que espera ejecutar o podría provenir de restricciones únicas de su entorno de ejecución ⏤ como *Electron*, por ejemplo.

Toda la comunicación entre módulos ocurre a través de un cargador de módulos, la opción del compilador [`module`](/tsconfig#module) determina cuál se usa.
En el entorno de ejecución, el cargador de módulos es responsable de localizar y ejecutar todas las dependencias de un módulo antes de ejecutarlo.

Por ejemplo, aquí hay un archivo *TypeScript* que usa la sintaxis de los *módulos ES*, mostrando algunas opciones diferentes para [`module`](/tsconfig#module):

```ts twoslash
// @filename: constants.ts
export const valueOfPi = 3.142;
// @filename: index.ts
// ---cut---
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### *ES2020*

```ts twoslash
// @showEmit
// @module: es2020
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### *CommonJS*

```ts twoslash
// @showEmit
// @module: commonjs
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### *UMD*

```ts twoslash
// @showEmit
// @module: umd
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

> Ten en cuenta que *ES2020* efectivamente es el mismo que el `index.ts` original.

Puedes ver todas las opciones disponibles y cómo se ve su código *JavaScript* emitido en la [Referencia de `TSConfig` para `module`](/tsconfig#module).

## Espacios de nombres *TypeScript*

TypeScript tiene su propio formato de módulo llamado `namespaces` que es anterior al estándar de *módulos ES*. Esta sintaxis tiene muchas características útiles para la creación de archivos de definición complejos, y todavía tiene un uso activo [en *DefinitelyTyped*](/dt). Si bien no está en desuso, la mayoría de las funciones en los espacios de nombres existen en los *módulos ES* y te recomendamos que las uses para alinearte con la dirección de *JavaScript*. Puedes obtener más información sobre los espacios de nombres en [la página de referencia de espacios de nombres](/docs/handbook/namespaces.html).
