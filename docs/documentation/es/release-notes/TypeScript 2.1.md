---
title: TypeScript 2.1
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-1.html
oneline: Notas de la versión de TypeScript 2.1
---

## `keyof` y tipos de búsqueda

En *JavaScript*, es bastante común tener *API*s que esperan nombres de propiedad como parámetros, pero hasta ahora no ha sido posible expresar las relaciones de tipos que ocurren en esas *API*s.

Ingresa el índice de la Consulta de tipo o `keyof`;
Una consulta de tipo indexado `keyof T` produce el tipo de nombres de propiedad permitidos para `T`.
Un tipo `keyof T` se considera un subtipo de `string`.

##### Ejemplo

```ts
interface Person {
  name: string;
  age: number;
  location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[]; // "length" | "push" | "pop" | "concat" | ...
type K3 = keyof { [x: string]: Person }; // string
```

El dual de esto es *tipos de acceso indexados*, también llamados *tipos de búsqueda*.
Sintácticamente, se ven exactamente como un acceso a elementos, pero están escritos como tipos:

##### Ejemplo

```ts
type P1 = Person["name"]; // string
type P2 = Person["name" | "age"]; // string | number
type P3 = string["charAt"]; // (pos: number) => string
type P4 = string[]["push"]; // (...items: string[]) => number
type P5 = string[][0]; // string
```

Puedes utilizar este patrón con otras partes del sistema de tipos para obtener búsquedas con seguridad de tipos.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]; // El tipo inferido es T[K]
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value;
}

let x = { foo: 10, bar: "hello!" };

let foo = getProperty(x, "foo"); // number
let bar = getProperty(x, "bar"); // string

let oops = getProperty(x, "wargarbl"); // ¡Error! "wargarbl" no es "foo" | "bar"

setProperty(x, "foo", "string"); // Error!, cadena esperada número
```

## Tipos mapeados

Una tarea común es tomar un tipo existente y hacer que cada una de sus propiedades sea completamente opcional.
Digamos que tenemos una interfaz `Person`:

```ts
interface Person {
  name: string;
  age: number;
  location: string;
}
```

Una versión parcial sería:

```ts
interface PartialPerson {
  nombre?: string;
  age?: number;
  location?: string;
}
```

con tipos asignados, `PartialPerson` se puede escribir como una transformación generalizada en el tipo `Person` como:

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type PartialPerson = Partial<Person>;
```

Los tipos mapeados se producen tomando una unión de tipos literales y calculando un conjunto de propiedades para un nuevo tipo de objeto.
Son como [listas por comprensión en *Python*](https://docs.python.org/2/tutorial/datastructures.html#nested-list-comprehensions), pero en lugar de producir nuevos elementos en una lista, producen nuevas propiedades en un tipo.

Además de `Partial`, los tipos asignados pueden expresar muchas transformaciones útiles en los tipos:

```ts
// Mantiene los tipos iguales, pero hace que cada propiedad sea de solo lectura.
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Los mismos nombres de propiedad, pero hacen que el valor sea una promesa en lugar de una concreta
type Deferred<T> = {
  [P in keyof T]: Promise<T[P]>;
};

// Envuelve proxies alrededor de las propiedades de T
type Proxify<T> = {
  [P in keyof T]: { get(): T[P]; set(v: T[P]): void };
};
```

## `Partial`, `Readonly`, `Record`, y `Pick`

`Parcial` y `Readonly`, como se describió anteriormente, son construcciones muy útiles.
Puedes usarlos para describir algunas rutinas *JS* comunes como:

```ts
function assign<T>(obj: T, props: Partial<T>): void;
function freeze<T>(obj: T): Readonly<T>;
```

Por eso, ahora se incluyen de forma predeterminada en la biblioteca estándar.

También incluimos otros dos tipos de servicios públicos: `Record` y `Pick`.

```ts
// A partir de T elige un conjunto de propiedades K
declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

const nameAndAgeOnly = pick(person, "name", "age"); // { name: string, age: number }
```

```ts
// Para cada propiedad K de tipo T, transfórmala en U
function mapObject<K extends string, T, U>(
  obj: Record<K, T>,
  f: (x: T) => U
): Record<K, U>;

const names = { foo: "hello", bar: "world", baz: "bye" };
const lengths = mapObject(names, s => s.length); // { foo: number, bar: number, baz: number }
```

## Propagación de objetos y `rest`

*TypeScript 2.1* ofrece soporte para [`ESnext Spread` y `Rest`](https://github.com/sebmarkbage/ecmascript-rest-spread).

De manera similar a la distribución de arreglo, la distribución de un objeto puede ser útil para obtener una copia superficial:

```ts
let copy = { ...original };
```

Del mismo modo, puedes fusionar varios objetos diferentes.
En el siguiente ejemplo, `merged` tendrá propiedades de `foo`, `bar` y `baz`.

```ts
let merged = { ...foo, ...bar, ...baz };
```

También puedes redefinir propiedades existentes y agregar nuevas:

```ts
let obj = { x: 1, y: "string" };
var newObj = { ...obj, z: 3, y: 4 }; // { x: number, y: number, z: number }
```

El orden de especificar las operaciones de propagación determina qué propiedades terminan en el objeto resultante;
las propiedades de los diferenciales posteriores "ganan" sobre las propiedades creadas previamente.

Los restos de objetos son el doble de las extensiones de objetos, ya que pueden extraer cualquier propiedad adicional que no se recoja al desestructurar un elemento:

```ts
let obj = { x: 1, y: 1, z: 1 };
let { z, ...obj1 } = obj;
obj1; // {x: number, y:number};
```

## Funciones asincrónicas de nivel inferior

Esta característica era compatible antes de *TypeScript 2.1*, pero solo cuando estaba dirigida a *ES6*/*ES2015*.
*TypeScript 2.1* brinda la capacidad a los entornos de ejecución de *ES3* y *ES5*, lo cual significa que la podrás aprovechar sin importar el entorno que estés utilizando.

> Nota: Primero, debemos asegurarnos de que nuestro entorno de ejecución tenga una `Promise` compatible con *ECMAScript* disponible a nivel global.
> Eso podría implicar tomar [un `polyfill`](https://github.com/stefanpenner/es6-promise) para `Promise`, o confiar en uno que pueda tener en el entorno de ejecución al que está apuntando.
> También nos debemos asegurar de que *TypeScript* sabe que existe `Promise` configurando la opción [`lib`](/tsconfig#lib) en algo como `"dom", "es2015"` o `"dom", "es2015".promise", "es5"`

##### Ejemplo

##### tsconfig.json

```json tsconfig
{
  "compilerOptions": {
    "lib": ["dom", "es2015.promise", "es5"]
  }
}
```

##### `dramaticWelcome.ts`

```ts
function delay(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

async function dramaticWelcome() {
  console.log("Hello");

  for (let i = 0; i < 3; i++) {
    await delay(500);
    console.log(".");
  }

  console.log("World!");
}

dramaticWelcome();
```

La compilación y ejecución de la salida debería dar como resultado el comportamiento correcto en un motor *ES3*/*ES5*.

## Soporte para biblioteca auxiliares externas (`tslib`)

*TypeScript* inyecta un puñado de funciones auxiliares como `__extends` para la herencia, `__assign` para el operador de propagación en literales de objeto y elementos *JSX*, y `__awaiter` para funciones asíncronas.

Anteriormente había dos opciones:

1.  inyectar auxiliares en *cada* archivo que los necesite, o
2.  ningún ayudante con [`noEmitHelpers`](/tsconfig#noEmitHelpers).

Las dos opciones dejaban más que desear;
agrupar los ayudantes en cada archivo era un problema para los clientes que intentaban mantener pequeño el tamaño de su paquete.
Y sin incluir ayudantes, significaba que los clientes tenían que mantener su propia biblioteca de ayudantes.

*TypeScript 2.1* permite incluir estos archivos en tu proyecto una vez en un módulo separado, y el compilador emitirá importaciones a ellos según sea necesario.

Primero, instala la biblioteca de utilidades [`tslib`](https://github.com/Microsoft/tslib):

```sh
npm install tslib
```

Segundo, compila tus archivos usando [`importHelpers`](/tsconfig#importHelpers):

```sh
tsc --module commonjs --importHelpers a.ts
```

Entonces, dada la siguiente entrada, el archivo `.js` resultante incluirá una importación a `tslib` y usará el ayudante `__assign` en lugar de incluirlo.

```ts
export const o = { a: 1, name: "o" };
export const copy = { ...o };
```

```js
"use strict";
var tslib_1 = require("tslib");
exports.o = { a: 1, name: "o" };
exports.copy = tslib_1.__assign({}, exports.o);
```

## Importaciones sin tipo

*TypeScript* tradicionalmente ha sido demasiado estricto sobre cómo importar módulos.
Esto fue para evitar errores tipográficos y evitar que los usuarios utilicen los módulos incorrectamente.

Sin embargo, muchas veces, es posible que desees importar un módulo existente que no tenga su propio archivo `.d.ts`.
Anteriormente, esto era un error.
Comenzar con *TypeScript 2.1* ahora es mucho más fácil.

Con *TypeScript 2.1*, puedes importar un módulo *JavaScript* sin necesidad de una declaración de tipo.
Una declaración de tipo (como `declare module "foo" {...}` o `node_modules/@types/foo`) todavía tiene prioridad si existe.

Una importación a un módulo sin un archivo de declaración todavía se marcará como un error en [`noImplicitAny`](/tsconfig#noImplicitAny).

##### Ejemplo

```ts
// Tiene éxito si existe `node_modules/asdf/index.js`
import { x } from "asdf";
```

## Soporte para `--target ES2016`, `--target ES2017` y `--target ESNext`

*TypeScript 2.1* admite tres nuevos valores de destino `--target ES2016`, `--target ES2017` y `--target ESNext`.

El uso de target `--target ES2016` indicará al compilador que no transforme las características específicas de *ES2016*, p. ej. el operador `**`.

De manera similar, `--target ES2017` indicará al compilador que no transforme características específicas de *ES2017* como `async`/`await`.

`--target ESNext` apunta a las últimas [características propuestas de *ES* admitidas](https://github.com/tc39/proposals).

## Inferencia `any` mejorada

Anteriormente, si `TypeScript` no podía averiguar el tipo de una variable, elegiría el tipo `any`.

```ts
let x; // implícitamente 'any'
let y = []; // implícitamente 'any[]'

let z: any; // explícitamente 'any'.
```

Con *TypeScript 2.1*, en lugar de simplemente elegir `any`, *TypeScript* inferirá los tipos en función de lo que termines asignando más adelante.

Esto solo está habilitado si se establece [`noImplicitAny`](/tsconfig#noImplicitAny).

##### Ejemplo

```ts
let x;

// Aún puedes asignar cualquier cosa que desees a 'x'.
x = () => 42;

// Después de esa última asignación, TypeScript 2.1 sabe que 'x' tiene tipo '() => number'.
let y = x();

// ¡Gracias a eso, ahora te dirá que no puedes agregar un número a una función!
console.log(x + y);
//          ~~~~~
// ¡Error! El operador '+' no se puede aplicar a los tipos '() => number' y 'number'.

// TypeScript todavía te permite asignar cualquier cosa que desees a 'x'.
x = "Hello world!";

// ¡Pero ahora también sabe que 'x' es una 'string'!
x.toLowerCase();
```

El mismo tipo de seguimiento ahora también se realiza para arreglos vacíos.

Una variable declarada sin anotación de tipo y un valor inicial de `[]` se considera una variable implícita `any[]`.
Sin embargo, cada operación posterior de `x.push(value)`, `x.unshift(value)` o `x[n] = value` *evoluciona* el tipo de variable de acuerdo con los elementos que se le agregan.

```ts
function f1() {
  let x = [];
  x.push(5);
  x[1] = "hello";
  x.unshift(true);
  return x; // (string | number | boolean)[]
}

function f2() {
  let x = null;
  if (cond()) {
    x = [];
    while (cond()) {
      x.push("hello");
    }
  }
  return x; // string[] | null
}
```

## Cualquier error implícito

Un gran beneficio de esto es que verás *mucho menos* errores implícitos de `any` cuando se ejecute con [`noImplicitAny`](/tsconfig#noImplicitAny).
Los errores `any` implícitos solo se informan cuando el compilador no puede saber el tipo de una variable sin una anotación de tipo.

##### Ejemplo

```ts
function f3() {
  let x = []; // Error: La variable 'x' implícitamente tiene el tipo 'any[]' en algunas ubicaciones donde no se puede determinar su tipo.
  x.push(5);
  function g() {
    x; // Error: La variable 'x' tiene implícitamente un tipo 'any[]'.
  }
}
```

## Mejor inferencia para tipos literales

Los tipos literales de cadena, numéricos y booleanos (p. ej., `"abc"`, `1` y `true`) se infirieron anteriormente solo en presencia de una anotación de tipo explícita.
A partir de *TypeScript 2.1*, los tipos literales *siempre* se infieren para las variables `const` y las propiedades `readonly`.

El tipo inferido para una variable `const` o propiedad `readonly` sin una anotación de tipo es el tipo del iniciador literal.
El tipo inferido para una variable `let`, una variable `var`, un parámetro o una propiedad que no sea `readonly` con un iniciador y sin una anotación de tipo es el tipo literal ampliado del iniciador.
Donde el tipo ampliado para un tipo de literal de cadena es `string`, `number` para los tipos de literal numérico, `boolean`o para `true` o `false` y la enumeración que lo contiene para los tipos de enumeración literal.

##### Ejemplo

```ts
const c1 = 1; // Tipo 1
const c2 = c1; // Tipo 1
const c3 = "abc"; // Tipo "abc"
const c4 = true; // Tipo true
const c5 = cond ? 1 : "abc"; // Tipo 1 | "abc"

let v1 = 1; // Tipo number
let v2 = c2; // Tipo number
let v3 = c3; // Tipo string
let v4 = c4; // Tipo boolean
let v5 = c5; // Tipo number | string
```

El ensanchamiento de tipo literal se puede controlar mediante anotaciones de tipo explícitas.
Específicamente, cuando se infiere una expresión de un tipo literal para una ubicación constante sin una anotación de tipo, esa variable `const` obtiene un tipo de literal ampliado inferido.
Pero cuando una ubicación `const` tiene una anotación de tipo literal explícita, la variable `const` obtiene un tipo literal que no se ensancha.

##### Ejemplo

```ts
const c1 = "hello"; // Ampliación de tipo "hola"
let v1 = c1; // Tipo string

const c2: "hello" = "hello"; // Tipo "hello"
let v2 = c2; // Tipo "hello"
```

## Usa valores devueltos de super llamadas como `this`

En *ES2015*, los constructores que devuelven un objeto sustituyen implícitamente el valor de `this` por cualquier llamador de `super()`.
Como resultado, es necesario capturar cualquier valor de retorno potencial de `super()` y reemplazarlo con `this`.
Este cambio permite trabajar con [Elementos personalizados](https://www.w3.org/TR/custom-elements/), que aprovecha esto para iniciar elementos asignados al navegador con constructores escritos por el usuario.

##### Ejemplo

```ts
class Base {
  x: number;
  constructor() {
    // devuelve un nuevo objeto que no sea "this"
    return {
      x: 1
    };
  }
}

class Derived extends Base {
  constructor() {
    super();
    this.x = 2;
  }
}
```

Genera:

```js
var Derived = (function(_super) {
  __extends(Derived, _super);
  function Derived() {
    var _this = _super.call(this) || this;
    _this.x = 2;
    return _this;
  }
  return Derived;
})(Base);
```

> Este cambio implica una ruptura en el comportamiento de extender clases integradas como `Error`, `Array`, `Map`, etc. Consulta la [extensión de la documentación de cambios de ruptura incorporados](https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and -map-may-no-longer-work) para obtener más detalles.

## Herencia de la configuración

A menudo, un proyecto tiene varios objetivos de resultados, p. ej. `ES5` y `ES2015`, depuración y producción o `CommonJS` y `System`;
Solo unas pocas opciones de configuración cambian entre estos dos destinos, y mantener varios archivos `tsconfig.json` puede ser una molestia.

*TypeScript 2.1* admite la configuración heredada usando `extends`, donde:

- `extends` es una nueva propiedad de nivel superior en `tsconfig.json` (junto con `compilerOptions`, [`files`](/tsconfig#files), [`include`](/tsconfig#include) y `exclude` ).
- El valor de `extends` debe ser una cadena que contenga una ruta a otro archivo de configuración del que heredar.
- La configuración del archivo base se carga primero y luego se reemplaza por las del archivo de configuración heredado.
- No se permite la circularidad entre archivos de configuración.
- [`files`](/tsconfig#files), [`include`](/tsconfig#include) y `exclude` del archivo de configuración heredado *sobrescribe* los del archivo de configuración base.
- Todas las rutas relativas que se encuentren en el archivo de configuración se resolverán en relación con el archivo de configuración en el que se originaron.

##### Ejemplo

`configs/base.json`:

```json tsconfig
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

`tsconfig.json`:

```json tsconfig
{
  "extends": "./configs/base",
  "files": ["main.ts", "supplemental.ts"]
}
```

`tsconfig.nostrictnull.json`:

```json tsconfig
{
  "extends": "./tsconfig",
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

## Nuevo `--alwaysStrict`

Invocar el compilador con [`alwaysStrict`](/tsconfig#alwaysStrict) causa:

1. Analiza todo el código en modo estricto.
2. Escribe la directiva `"use strict";` encima de cada archivo generado.

Los módulos, automáticamente, se analizan en modo estricto.
La nueva bandera se recomienda para código que no es de módulo.
