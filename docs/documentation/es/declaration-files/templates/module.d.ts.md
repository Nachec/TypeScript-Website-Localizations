---
title: Módulos .d.ts
layout: docs
permalink: /docs/handbook/declaration-files/templates/module-d-ts.html
---

## Comparación de *JavaScript* con un *DTS* de ejemplo

## Patrones *CommonJS* comunes

Un módulo que usa patrones *CommonJS* usa `module.exports` para describir los valores exportados. Por ejemplo, aquí hay un módulo que exporta una función y una constante numérica:

```js
const maxInterval = 12;

function getArrayLength(arr) {
  return arr.length;
}

module.exports = {
  getArrayLength,
  maxInterval,
};
```

Esto se puede describir mediante el siguiente `.d.ts`:

```ts
export function getArrayLength(arr: any[]): number;
export const maxInterval: 12;
```

El *playground* de *TypeScript* te puede mostrar el `.d.ts` equivalente para el código *JavaScript*. Puedes [probarlo tú mismo aquí](/play?useJavaScript=true#code/GYVwdgxgLglg9mABAcwKZQIICcsEMCeAMqmMlABYAUuOAlIgN6IBQiiW6IWSNWAdABsSZcswC+zCAgDOURAFtcADwAq5GKUQBeRAEYATM2by4AExBC+qJQAc4WKNO2NWKdNjxFhFADSvFquqk4sxAA).

La sintaxis `.d.ts` se parece intencionalmente a la sintaxis de [Módulos ES](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
Los módulos *ES* fueron ratificados por *TC39* en 2019, mientras que han estado disponibles a través de transpiladores durante mucho tiempo, sin embargo, si tienes una base de código *JavaScript* utilizando módulos *ES*:

```js
export function getArrayLength(arr) {
  return arr.length;
}
```

Esto tendría el siguiente equivalente de `.d.ts`:

```ts
export function getArrayLength(arr: any[]): number;
```

### Exportaciones predeterminadas

En *CommonJS* puedes exportar cualquier valor como exportación predeterminada, por ejemplo, aquí hay un módulo de expresión regular:

```js
module.exports = /hello( world)?/;
```

Que se puede describir con los siguientes `.d.ts`:

```ts
declare const helloWorld: RegExp;
export default helloWorld;
```

O un número:

```js
module.exports = 3.142;
```

```ts
declare const pi: number;
export default pi;
```

Un estilo de exportación en *CommonJS* es exportar una función.
Dado que una función también es un objeto, se pueden agregar campos adicionales y se incluyen en la exportación.

```js
function getArrayLength(arr) {
  return arr.length;
}
getArrayLength.maxInterval = 12;

module.exports = getArrayLength;
```

Que se puede describir con:

```ts
export default function getArrayLength(arr: any[]): number;
export const maxInterval: 12;
```

Ten en cuenta que el uso de `export default` en tus archivos `.d.ts` requiere [`esModuleInterop: true`](/tsconfig#esModuleInterop) para trabajar.
Si no puedes tener `esModuleInterop: true` en tu proyecto, como cuando estás enviando una `SE` a `Definitely Typed`, tendrás que usar la sintaxis `export =` en su lugar. Esta sintaxis anterior es más difícil de usar pero funciona en todas partes.
Así es como se debería escribir el ejemplo anterior usando `export =`:

```ts
declare function getArrayLength(arr: any[]): number;
declare namespace getArrayLength {
  declare const maxInterval: 12;
}

export = getArrayLength;
```

Ve la página del [Módulo: *Functions*](/docs/handbook/statement-files/templates/module-function-d-ts.html) para obtener detalles de cómo funciona, y la página [Referencia de módulos](/docs/handbook/modules.html).

## Manejo del consumo de muchas importaciones

Hay muchas formas de importar un módulo en un código de consumo moderno:

```ts
const fastify = require("fastify");
const { fastify } = require("fastify");
import fastify = require("fastify");
import * as Fastify from "fastify";
import { fastify, FastifyInstance } from "fastify";
import fastify from "fastify";
import fastify, { FastifyInstance } from "fastify";
```

Cubrir todos estos casos requiere que el código *JavaScript* sea compatible con todos estos patrones.
Para admitir muchos de estos patrones, un módulo *CommonJS* deberías tener un aspecto similar a:

```js
class FastifyInstance {}

function fastify() {
  return new FastifyInstance();
}

fastify.FastifyInstance = FastifyInstance;

// Permite {fastify}
fastify.fastify = fastify;
// Permite un soporte estricto del módulo ES
fastify.default = fastify;
// Establece la exportación 'default'
module.exports = fastify;
```

## Tipos en módulos

Es posible que desees proporcionar un tipo de código *JavaScript* que no existe

```js
function getArrayMetadata(arr) {
  return {
    length: getArrayLength(arr),
    firstObject: arr[0],
  };
}

module.exports = {
  getArrayMetadata,
};
```

Esto se puede describir con:

```ts
export type ArrayMetadata = {
  length: number;
  firstObject: any | undefined;
};
export function getArrayMetadata(arr: any[]): ArrayMetadata;
```

Este ejemplo es un buen caso para [usar genéricos](/docs/handbook/generics.html#generic-types) para proporcionar información de tipo más completa:

```ts
export type ArrayMetadata<ArrType> = {
  length: number;
  firstObject: ArrType | undefined;
};

export function getArrayMetadata<ArrType>(
  arr: ArrType[]
): ArrayMetadata<ArrType>;
```

Ahora el tipo de el arreglo se propaga al tipo `ArrayMetadata`.

Los tipos que se exportan se pueden reutilizar en los consumidores de los módulos usando `import` o `import type` en el código *TypeScript* o [imports *JSDoc*](/docs/handbook/jsdoc-supported-types.html#import-tipos).

### Espacios de nombres en el módulo *Code*

Intentar describir la relación en el entorno de ejecución del código *JavaScript* puede resultar complicado.
Cuando la sintaxis similar al módulo *ES* no proporciona suficientes herramientas para describir las exportaciones, entonces puedes usar "espacios de nombres".

Por ejemplo, puedes tener tipos lo suficientemente complejos como para describir que eliges colocarlos dentro de tu `.d.ts`:

```ts
// Esto representa la clase JavaScript que estaría disponible en el entorno de ejecución
export class API {
  constructor(baseURL: string);
  getInfo(opts: API.InfoRequest): API.InfoResponse;
}

// Este espacio de nombres se fusiona con la clase API y permite a los consumidores, y este archivo
// tener tipos que están anidados en sus propias secciones.
declare namespace API {
  export interface InfoRequest {
    id: string;
  }

  export interface InfoResponse {
    width: number;
    height: number;
  }
}
```

Para comprender cómo funcionan los espacios de nombres en los archivos `.d.ts`, lee el [análisis profundo de `.d.ts`](/docs/handbook/statement-files/deep-dive.html).

### Uso global opcional

Puedes usar `export as namespace` para declarar que tu módulo estará disponible en el alcance global en contextos *UMD*:

```ts
export as namespace moduleName;
```

## Ejemplo de referencia

Para darte una idea de cómo se pueden unir todas estas piezas, aquí tienes una referencia `.d.ts` para comenzar cuando creas un nuevo módulo.

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Este es el archivo de plantilla del módulo. Debes cambiarle el nombre a index.d.ts
 *~ y colócalo en un directorio con el mismo nombre que el módulo.
 *~ Por ejemplo, si estabas escribiendo un archivo para "super-greeter", este
 *~ archivo debe ser 'super-greeter/index.d.ts'
 */

/*~ Si este módulo es un módulo UMD que expone una variable global 'myLib' cuando
 *~ se carga fuera de un entorno cargador de módulos, declara que aquí es global.
 *~ De lo contrario, elimina esta declaración.
 */
export as namespace myLib;

/*~ Si este módulo exporta funciones, decláralas así.
 */
export function myFunction(a: string): string;
export function myOtherFunction(a: number): number;

/*~ Puedes declarar tipos que están disponibles mediante la importación del módulo */
export interface SomeType {
  name: string;
  length: number;
  extras?: string[];
}

/*~ Puedes declarar propiedades del módulo usando const, let o var */
export const myField: number;
```

### Diseño del archivo de biblioteca

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

### Probar tus tipos

Si planeas enviar estos cambios a `DefinitelyTyped` para que todos los usen también, te recomendamos:

> 1. Crea una nuevo directorio en `node_modules/@types/[libname]`
> 2. Crea un `index.d.ts` en ese directorio y copia el ejemplo en él
> 3. Ve dónde se interrumpe tu uso del módulo y comienza a completar el `index.ts`.
> 4. Cuando estés satisfecho, clona [`DefinitelyTyped`/`DefinitelyTyped`](https://github.com/DefinitelyTyped) y sigue las instrucciones del archivo `README`. 

De otra manera

> 1. Crea un nuevo archivo en la raíz de tu árbol fuente: `[libname].d.ts`
> 2. Agrega `declare module "[libname]" {  }`
> 3. Agrega la plantilla dentro de las llaves de declaración del módulo y ve dónde se interrumpe tu uso. 
