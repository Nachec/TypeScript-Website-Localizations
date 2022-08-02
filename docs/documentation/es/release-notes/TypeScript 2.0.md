---
title: TypeScript 2.0
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-0.html
oneline: Notas de la versión de TypeScript 2.0
---

## `Null-` y tipos conocidos `undefined`

*TypeScript* tiene dos tipos especiales, `Null` y `Undefined`, que tienen los valores `null` y `undefined` respectivamente.
Anteriormente, no era posible nombrar explícitamente estos tipos, pero ahora se pueden usar `null` y `undefined` como nombres de tipos independientemente del modo de verificación de tipos.

El verificador de tipos anteriormente se consideraba `null` e `undefined` asignable a cualquier cosa.
Efectivamente, `null` y `undefined` eran valores válidos de *todo* tipo y no era posible excluirlos específicamente (y por lo tanto no era posible detectar un uso erróneo de ellos).

## `--strictNullChecks`

[`strictNullChecks`](/tsconfig#strictNullChecks) cambia a un nuevo modo de comprobación nulo estricto.

En el modo de comprobación `null` estricto, los valores `null` y `undefined` *no* son en el dominio de todos los tipos y solo se pueden asignar a ellos mismos y a `any` (la única excepción es que `undefined` también se puede asignar a `void`) .
Entonces, mientras que `T` y `T | undefined` se consideran sinónimos en el modo de verificación de tipo normal (porque `undefined` se considera un subtipo de cualquier `T`), son tipos diferentes en el modo de comprobación de tipo estricto, y solo `T | undefined` permite valores `undefined`. Lo mismo es cierto para la relación de `T` a `T | null`.

##### Ejemplo

```ts
// Compilado con --strictNullChecks
let x: number;
let y: number | undefined;
let z: number | null | undefined;
x = 1; // Bien
y = 1; // Bien
z = 1; // Bien
x = undefined; // Error
y = undefined; // Bien
z = undefined; // Bien
x = null; // Error
y = null; // Error
z = null; // Bien
x = y; // Error
x = z; // Error
y = x; // Bien
y = z; // Error
z = x; // Bien
z = y; // Bien
```

## Comprobación asignada antes del uso

En el modo de comprobación estricta de `null`, el compilador requiere que cada referencia a una variable local de un tipo que no incluya `undefined` esté precedida por una asignación a esa variable en cada posible ruta de código anterior.

##### Ejemplo

```ts
// Compilado con --strictNullChecks
let x: number;
let y: number | null;
let z: number | undefined;
x; // Error, referencia no precedida por asignación
y; // Error, referencia no precedida por asignación
z; // Bien
x = 1;
y = null;
x; // Bien
y; // Bien
```

El compilador verifica que las variables estén definitivamente asignadas realizando *análisis de tipo basado en el control de flujo*. Consulta más adelante para obtener más detalles sobre este tema.

## Parámetros y propiedades opcionales

Los parámetros y propiedades opcionales automáticamente tienen `undefined` agregado a sus tipos, incluso cuando sus anotaciones de tipo no incluyan a `undefined` específicamente.
Por ejemplo, los dos siguientes tipos son idénticos:

```ts
// Compilado con --strictNullChecks
type T1 = (x?: number) => string; // x tiene tipo number | undefined
type T2 = (x?: number | undefined) => string; // x tiene tipo number | undefined
```

## Guardias de tipo no `null` y no `undefined`

Un acceso a la propiedad o una llamada a una función produce un error en tiempo de compilación si el objeto o la función es de un tipo que incluye `null` o `undefined`.
Sin embargo, las protecciones de tipos se amplían para admitir comprobaciones no nulas ni indefinidas.

##### Ejemplo

```ts
// Compilado con --strictNullChecks
declare function f(x: number): string;
let x: number | null | undefined;
if (x) {
  f(x); // Bien, aquí el tipo de x es number
} else {
  f(x); // Error, ¿el tipo de x es number? aquí
}
let a = x != null ? f(x) : ""; // El tipo de a es string
let b = x && f(x); // El tipo de b es string | 0 | null | undefined
```

Los guardias de tipos no nulos y no indefinidos pueden usar el operador `==`, `!=`, `===` o `!==` para comparar con `null` o `undefined`, como en `x != null` o `x === undefined`.
Los efectos sobre los tipos de variables de sujeto reflejan con precisión la semántica de *JavaScript* (por ejemplo, los operadores de doble igual comprueban ambos valores sin importar cuál se especifique, mientras que triple igual solo comprueba el valor especificado).

## Nombres punteados en protectores de tipo

Los protectores de tipos anteriormente solo admitían la verificación de variables y parámetros locales.
Los protectores de tipo ahora admiten la comprobación de "nombres con puntos" que consisten en un nombre de parámetro o variable seguido de uno o más accesos a la propiedad.

##### Ejemplo

```ts
interface Options {
  location?: {
    x?: number;
    y?: number;
  };
}

function foo(options?: Options) {
  if (options && options.location && options.location.x) {
    const x = options.location.x; // El tipo de x es number
  }
}
```

Los protectores de tipo para nombres con puntos también trabajan con las funciones de protección de tipos definidas por el usuario y los operadores `typeof` e `instanceof` y no dependen de la opción del compilador [`strictNullChecks`](/tsconfig#strictNullChecks).

Un protector de tipo para un nombre con puntos no tiene ningún efecto después de una asignación a cualquier parte del nombre con puntos.
Por ejemplo, un protector de tipo para `x.y.z` no tendrá ningún efecto después de una asignación a `x`, `x.y` o `x.y.z`.

## Expresión de operadores

La expresión de operadores permiten que los tipos de operandos incluyan `null` y/o `undefined`, pero siempre producen valores de tipos no nulos y no indefinidos.

```ts
// Compilado con --strictNullChecks
function sum(a: number | null, b: number | null) {
  return a + b; // Produce valor de tipo number
}
```

El operador `&&` agrega `null` y/o `undefined` al tipo de operando derecho dependiendo de cuáles estén presentes en el tipo del operando izquierdo, y el operador `||` elimina tanto `null` como `undefined` del tipo del operando izquierdo en el tipo de unión resultante.

```ts
// Compilado con --strictNullChecks
interface Entity {
  name: string;
}
let x: Entity | null;
let s = x && x.name; // s es de tipo string | null
let y = x || { name: "test" }; // y es de tipo Entity
```

## Tipo `widening`

Los tipos `null` y `undefined` *no* se amplían a `any` en el modo de comprobación estricto de `null`.

```ts
let z = null; // El tipo de z es null
```

En el modo de verificación de tipo regular, el tipo inferido de `z` es `any` debido al ensanchamiento, pero en el modo de verificación estricta de `null`, el tipo inferido de `z` es `null` (y por lo tanto, en ausencia de una anotación de tipo, `null` es el único valor posible para `z`).

## Operador de aserción no nula

Se puede usar un nuevo operador `!` de expresión a la posterior corrección para afirmar que su operando no es nulo y no está definido en contextos donde el verificador de tipos no puede concluir ese hecho.
Específicamente, la operación `x!` produce un valor del tipo de `x` con `null` y `undefined` excluidos.
Similar a las afirmaciones de tipo de las formas `<T>x` y `x as T`, el operador de aserción no nula `!` simplemente se elimina en el código *JavaScript* emitido.

```ts
// Compilado con --strictNullChecks
function validateEntity(e?: Entity) {
  // Lanza una excepción si e es una entidad nula o inválida
}

function processEntity(e?: Entity) {
  validateEntity(e);
  let s = e!.name; // Acierta que e no es null y el nombre de acceso
}
```

## Compatibilidad

Las nuevas funciones están diseñadas de modo que se puedan utilizar tanto en el modo de comprobación nulo estricto como en el modo de comprobación de tipo regular.
En particular, los tipos `null` e `undefined` se borran automáticamente de los tipos de unión en el modo de verificación de tipos normal (porque son subtipos de todos los demás tipos), y el operador de expresión de aserción no nulo `!` está permitido pero no tiene efecto en el modo de verificación de tipo regular. Por lo tanto, los archivos de declaración que se actualizan para usar nulos y los tipos con reconocimiento de indefinidos todavía se pueden usar en el modo de verificación de tipos normal para compatibilidad con versiones anteriores.

En términos prácticos, el modo de comprobación nulo estricto requiere que todos los archivos de una compilación sean nulos- e indefinido-consciente.

## Análisis de tipo basado en control de flujo

*TypeScript 2.0* implementa un análisis de tipo basado en control de flujo para variables y parámetros locales.
Anteriormente, el análisis de tipos realizado para los protectores de tipo se limitaba a declaraciones `if` y `?:` expresiones condicionales y no incluía efectos de asignaciones y construcciones de control de flujo como declaraciones `return` y `break`.
Con *TypeScript 2.0*, el verificador de tipos analiza todos los posibles flujos de control en declaraciones y expresiones para producir el tipo más específico posible (el *tipo reducido*) en cualquier ubicación dada para una variable o parámetro local en que se declara que tiene un tipo unión.

##### Ejemplo

```ts
function foo(x: string | number | boolean) {
  if (typeof x === "string") {
    x; // aquí el tipo de x es string
    x = 1;
    x; // aquí el tipo de x es number
  }
  x; // aquí el tipo de x es number | boolean
}

function bar(x: string | number) {
  if (typeof x === "number") {
    return;
  }
  x; // aquí el tipo de x es string
}
```

El análisis de tipos basado en el control de flujo es particularmente relevante en el modo [`strictNullChecks`](/tsconfig#strictNullChecks) porque los tipos que aceptan valores `NULL` se representan mediante tipos unión:

```ts
function test(x: string | null) {
  if (x === null) {
    return;
  }
  x; // el tipo de x es string en el resto de la función
}
```

Además, en el modo [`strictNullChecks`](/tsconfig#strictNullChecks), el análisis de tipo basado en el control de flujo incluye *análisis de asignación definida* para variables locales de tipos que no permiten el valor `undefined`.

```ts
function mumble(check: boolean) {
  let x: number; // El tipo no permite undefined
  x; // Error, x is undefined
  if (check) {
    x = 1;
    x; // Bien
  }
  x; // Error, x posiblemente es undefined
  x = 2;
  x; // Bien
}
```

## Tipos unión etiquetados

*TypeScript 2.0* implementa soporte para tipos unión etiquetados (o discriminados).
Específicamente, el compilador de *TS* ahora admite protecciones de tipos que reducen los tipos de unión en función de las pruebas de una propiedad discriminante y, además, amplían esa capacidad a las declaraciones `switch`.

##### Ejemplo

```ts
interface Square {
  kind: "square";
  size: number;
}

interface Rectángulo {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Forma = Cuadro | Rectángulo | Círculo;

function area(s: Shape) {
  // En la siguiente declaración `switch`, el tipo de `s` se reduce en cada cláusula `case`
  // de acuerdo con el valor de la propiedad discriminante, permitiendo así que las otras propiedades
  // de esa variante para acceder sin una aserción de tipo.
  switch (f.clase) {
    case "square":
      return s.size * s.size;
    case "rectangle":
      return s.width * s.height;
    case "circle":
      return Math.PI * s.radius * s.radius;
  }
}

function test1(s: Shape) {
  if (s.kind === "square") {
    s; // Square
  } else {
    s; // Rectangle | Circle
  }
}

function test2(s: Shape) {
  if (s.kind === "square" || s.kind === "rectangle") {
    return;
  }
  s; // Circle
}
```

Un tipo de propiedad *guardia discriminante* es una expresión de la forma `x.p == v`, `xp === v`, `x.p != v`, o `x.p !== v`, donde `p` y `v` son una propiedad y una expresión de un tipo literal de cadena o una unión de tipos de cadenas literales.
La protección de tipo de propiedad discriminante reduce el tipo de `x` a los tipos constituyentes de `x` que tienen una propiedad discriminante `p` con uno de los valores posibles de `v`.

Ten en cuenta que actualmente solo admitimos propiedades discriminantes de tipos de cadenas literales.
Tenemos la intención de agregar más adelante soporte para tipos literales booleanos y numéricos.

## El tipo `never`

*TypeScript 2.0* introduce un nuevo tipo primitivo `never`.
El tipo `never` representa el tipo de valores que nunca ocurren.
Específicamente, `never` es el tipo de retorno para funciones que nunca regresan y `never` es el tipo de variables bajo protecciones de tipo que nunca son `true`.

El tipo `never` tiene las siguientes características:

- `never` es un subtipo y se puede asignar a todos los tipos.
- Ningún tipo es un subtipo de o asignable a `never` (excepto `never` en sí mismo).
- En una expresión de función o función de flecha sin anotación de tipo de retorno, si la función no tiene declaraciones `return`, o solo declaraciones `return` con expresiones de tipo `never`, y si el punto final de la función no es accesible (como determinado por el análisis de control de flujo ), el tipo de retorno inferido para la función es `never`.
- En una función con una anotación explícita de tipo de retorno `never`, todas las declaraciones de `return` (si las hay) deben tener expresiones de tipo `never` y el punto final de la función no debe ser accesible.

Debido a que `never` es un subtipo de todos los tipos, siempre se omite de los tipos unión y se ignora en la inferencia del tipo de retorno de la función siempre que se devuelvan otros tipos.

Algunos ejemplos de funciones que regresan `never`:

```ts
// La función que regresa never debe tener un punto final inalcanzable
function error(message: string): never {
  throw new Error(message);
}

// El tipo de retorno inferido es never
function fail() {
  return error("Algo falló");
}

// La función que regresa never debe tener un punto final inalcanzable
function infiniteLoop(): never {
  while (true) {}
}
```

Algunos ejemplos de uso de funciones que devuelven `never`:

```ts
// El tipo de retorno inferido es number
function move1(direction: "up" | "down") {
  switch (direction) {
    case "up":
      return 1;
    case "down":
      return -1;
  }
  return error("Should never get here");
}

// El tipo de retorno inferido es number
function move2(direction: "up" | "down") {
  return direction === "up"
    ? 1
    : direction === "down"
    ? -1
    : error("Should never get here");
}

// El tipo de retorno inferido es T
function check<T>(x: T | undefined) {
  return x || error("Undefined value");
}
```

Debido a que `never` se puede asignar a todos los tipos, se puede usar una función que devuelva `never` cuando se requiera una devolución de llamada que devuelva un tipo más específico:

```ts
function test(cb: () => string) {
  let s = cb();
  return s;
}

test(() => "hello");
test(() => fail());
test(() => {
  throw new Error();
});
```

## Propiedades de solo lectura e índice de firmas

Ahora se puede declarar una propiedad o un índice de firma con el modificador `readonly` que se considera de solo lectura.

Las propiedades de solo lectura pueden tener iniciadores y se pueden asignar en constructores dentro de la misma declaración de clase, pero de lo contrario no se permiten las asignaciones a propiedades de solo lectura.

Además, las entidades *implícitamente* son de solo lectura en varias situaciones:

- Una propiedad declarada con un descriptor de acceso `get` y sin descriptor de acceso `set` se considera de solo lectura.
- En el tipo de un objeto `enum`, los miembros `enum` se consideran propiedades de solo lectura.
- En el tipo de objeto `module`, las variables `const` exportadas se consideran propiedades de solo lectura.
- Una entidad declarada en una declaración de `import` se considera de solo lectura.
- Una entidad a la que se accede a través de una importación de espacio de nombres *ES2015* se considera de solo lectura (por ejemplo, `foo.x` es de solo lectura cuando `foo` se declara como `import * as foo from "foo"`).

##### Ejemplo

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}

var p1: Point = { x: 10, y: 20 };
p1.x = 5; // Error, p1.x es de solo lectura

var p2 = { x: 1, y: 1 };
var p3: Point = p2; // Bien, alias de solo lectura para p2
p3.x = 5; // Error, p3.x es de solo lectura
p2.x = 5; // Bien, pero también cambia p3.x debido al alias
```

```ts
class Foo {
  readonly a = 1;
  readonly b: string;
  constructor() {
    this.b = "hello"; // Asignación permitida en constructor
  }
}
```

```ts
let a: Array<number> = [0, 1, 2, 3, 4];
let b: ReadonlyArray<number> = a;
b[5] = 5; // Error, los elementos son de solo lectura
b.push(5); // Error, no hay método de inserción (porque muta el arreglo)
b.length = 3; // Error, length es de solo lectura
a = b; // Error, faltan métodos mutantes
```

## Especificar el tipo de `this` para funciones

Después de especificar el tipo de `this` en una clase o interfaz, las funciones y los métodos ahora pueden declarar el tipo de `this` que esperan.

De manera predeterminada, el tipo de `this` dentro de una función es `any`.
A partir de *TypeScript 2.0*, puedes proporcionar un parámetro `this` explícito.
Los parámetros `this` son parámetros falsos que aparecen primero en la lista de parámetros de una función:

```ts
function f(this: void) {
  // asegúrate de que `this` no se pueda usar en esta función independiente
}
```

## Parámetros `this` en devoluciones de llamada

Las bibliotecas también pueden usar los parámetros `this` para declarar cómo se invocarán las devoluciones de llamada.

##### Ejemplo

```ts
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

`this: void` significa que `addClickListener` espera que `onclick` sea una función que no requiera un tipo `this`.

Ahora, si anotas el código de llamada con `this`:

```ts
class Handler {
  info: string;
  onMalClic(this: Controlador, e: Event) {
    // oops, usé `this` aquí. el uso de esta devolución de llamada se bloqueará en el entorno de ejecución
    this.info = e.message;
  }
}
let h = new Handler();
uiElement.addClickListener(h.onClickBad); // ¡error!
```

## `--noImplicitThis`

También se agrega una nueva marca en *TypeScript 2.0* para marcar todos los usos de `this` en funciones sin una anotación de tipo explícita.

## Soporte global en `tsconfig.json`

¡¡El soporte global está aquí!! El soporte global ha sido [una de las características más solicitadas](https://github.com/Microsoft/TypeScript/issues/1927).

Los patrones de archivo tipo globo son compatibles con dos propiedades [`include`](/tsconfig#include) y `exclude`.

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true,
    "outFile": "../../built/local/tsc.js",
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

Los comodines admitidos de `glob` son:

- `*` coincide con cero o más caracteres (excluyendo los separadores de directorio)
- `?` coincide con cualquier carácter (excluyendo los separadores de directorio)
- `**/` coincide de forma recursiva con cualquier subdirectorio

Si un segmento de un patrón `glob` incluye solo `*` o `.*`, entonces solo se incluyen archivos con extensiones compatibles (por ejemplo, `.ts`, `.tsx` y `.d.ts` de manera predeterminada con `. js` y `.jsx` si [`allowJs`](/tsconfig#allowJs) se establece en `true`).

Si [`files`](/tsconfig#files) e [`include`](/tsconfig#include) se dejan sin especificar, el compilador de manera predeterminada incluye todos los *TypeScript* (`.ts`, `.d.ts` y `.tsx`) en el directorio y subdirectorios que los contienen, excepto los excluidos mediante la propiedad `exclude`. Los archivos *JS* (`.js` y `.jsx`) también se incluyen si [`allowJs`](/tsconfig#allowJs) se establece en `true`.

Si se especifican las propiedades [`files`](/tsconfig#files) o [`include`](/tsconfig#include), el compilador incluirá en su lugar la unión de los archivos incluidos por esas dos propiedades.
Los archivos en el directorio especificado usando la opción del compilador [`outDir`](/tsconfig#outDir) siempre se excluyen a menos que se incluyan explícitamente a través de la propiedad [`files`](/tsconfig#files) (incluso cuando se especifica la propiedad `exclude` ).

Los archivos incluidos usando [`include`](/tsconfig#include) se pueden filtrar usando la propiedad `exclude`.
Sin embargo, los archivos incluidos explícitamente usando la propiedad [`files`](/tsconfig#files) siempre se incluyen independientemente de `exclude`.
La propiedad `exclude` de manera predeterminada excluye los directorios `node_modules`, `bower_components` y `jspm_packages` cuando no se especifican.

## Mejoras en la resolución de módulos: `BaseUrl`, mapeo de rutas, `rootDirs` y rastreo

*TypeScript 2.0* proporciona un conjunto de botones de resolución de módulo adicionales para *informar* al compilador dónde encontrar declaraciones para un módulo determinado.

Consulta la documentación de [Resolución de módulo](http://www.typescriptlang.org/docs/handbook/module-resolution.html) para obtener más detalles.

## *URL* base

El uso de [`baseUrl`](/tsconfig#baseUrl) es una práctica común en aplicaciones que usan cargadores de módulos *AMD* donde los módulos se "implementan" en un solo directorio en el entorno de ejecución.
Se supone que todas las importaciones de módulos con nombres no relativos son relativas a [`baseUrl`](/tsconfig#baseUrl).

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": "./modules"
  }
}
```

Ahora las importaciones a `"moduleA"` se buscarían en `./Modules/moduleA`

```ts
import A from "moduleA";
```

## Mapeo de rutas

A veces, los módulos no se encuentran directamente en `baseUrl`.
Los cargadores utilizan una configuración de mapeo para asignar nombres de módulos a archivos en el entorno de ejecución, consulta la [documentación de `RequireJS`](http://requirejs.org/docs/api.html#config-paths) y la [documentación de `SystemJS`](https://github.com/systemjs/systemjs/blob/main/docs/import-maps.md).

El compilador `TypeScript` admite la declaración de tales mapeos usando la propiedad [`path`(/tsconfig#path) en los archivos `tsconfig.json`.

##### Ejemplo

Por ejemplo, una importación a un módulo `"jquery"` se traduciría en el entorno de ejecución a `"node_modules/jquery/dist/jquery.slim.min.js"`.

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": "./node_modules",
    "paths": {
      "jquery": ["jquery/dist/jquery.slim.min"]
    }
}
```

El uso de [`paths`](/tsconfig#paths) también permite mapeos más sofisticados que incluyen múltiples ubicaciones alternativas.
Considera una configuración de proyecto en la que solo algunos módulos están disponibles en una ubicación y el resto en otra.

## Directorios virtuales con `rootDirs`

Usar `'rootDirs'`, puede informar al compilador de las `roots` que componen este directorio "virtual";
y así el compilador puede resolver las importaciones de módulos relativos dentro de estos directorios "virtuales" *como si* estuvieran fusionados en un directorio.

##### Ejemplo

Dada esta estructura de proyecto:

```tree
 src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

Un paso de compilación copiará los archivos en `/src/views` y `/generated/templates/views` en el mismo directorio en la salida.
En el entorno de ejecución, una vista puede esperar que su plantilla exista junto a ella y, por lo tanto, debería importarla usando un nombre relativo como `"./template"`.

[`rootDirs`[(/tsconfig#rootDirs) especifica una lista de `roots` cuyo contenido se espera que se fusionen en el entorno de ejecución.
Entonces, siguiendo nuestro ejemplo, el archivo `tsconfig.json` se debería ver así:

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src/views", "generated/templates/views"]
  }
}
```

## Seguimiento de la resolución de módulo

[`traceResolution`](/tsconfig#traceResolution) ofrece una forma práctica de comprender cómo el compilador ha resuelto los módulos.

```shell
tsc --traceResolution
```

## Declaración de módulos ambientales abreviados

Si no deseas tomarte el tiempo para escribir declaraciones antes de usar un nuevo módulo, ahora puedes usar una declaración abreviada para comenzar rápidamente.

##### `declarations.d.ts`

```ts
declare module "hot-new-module";
```

Todas las importaciones de una declaración abreviada de módulo tendrán el tipo `any`.

```ts
import x, { y } from "hot-new-module";
x(y);
```

## Carácter comodín en los nombres de los módulos

Importar recursos sin código utilizando la extensión de cargadores de módulos (por ejemplo, [*AMD*](https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md) o [*SystemJS*](https://github.com/systemjs/systemjs/blob/master/docs/module-types.md)) no ha sido fácil antes;
previamente se tenía que definir una declaración de módulo ambiental para cada recurso.

*TypeScript 2.0* admite el uso del carácter comodín (`*`) para declarar una "familia" de nombres de módulo;
de esta manera, solo se requiere una declaración una vez para una extensión y no para cada recurso.

##### Ejemplo

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

Los nombres de los módulos comodín pueden ser incluso más útiles cuando se migra desde un código base sin tipar.
Combinado con declaraciones de módulos ambientales abreviados, un conjunto de módulos se puede declarar fácilmente como `any`.

##### Ejemplo

```ts
declare module "myLibrary/*";
```

Todas las importaciones a cualquier módulo bajo `myLibrary` serían consideradas como de tipo `any` por el compilador;
por lo tanto, cerrando cualquier control sobre las formas o tipos de estos módulos.

```ts
import { readFile } from "myLibrary/fileSystem/readFile`;

readFile(); // readFile es 'any'
```

## Soporte para definiciones de módulos *UMD*

Algunas bibliotecas están diseñadas para usarse en muchos cargadores de módulos o sin carga de módulos (variables globales).
Estos se conocen como módulos [*UMD*](https://github.com/umdjs/umd) o [*Isomorphic*](http://isomorphic.net).
Se puede acceder a estas bibliotecas mediante una importación o una variable global.

Por ejemplo:

##### math-lib.d.ts

```ts
export const isPrime(x: number): boolean;
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

## Propiedades de clase opcionales

Las propiedades y métodos opcionales ahora se pueden declarar en clases, de manera similar a lo que ya está permitido en las interfaces.

##### Ejemplo

```ts
class Bar {
  a: number;
  b?: number;
  f() {
    return 1;
  }
  g?(): number; // El cuerpo del método opcional se puede omitir
  h?() {
    return 2;
  }
}
```

Cuando se compilan en modo [`strictNullChecks`](/tsconfig#strictNullChecks), las propiedades y métodos opcionales tienen automáticamente incluido `undefined` en su tipo. Por lo tanto, la propiedad `b` anterior es de tipo `number | undefined` y el método `g` anterior es de tipo `(() => number) | undefined`.
Los protectores de tipos se pueden utilizar para eliminar la parte `undefined` del texto:

```ts
function test(x: Bar) {
  x.a; // number
  x.b; // number | undefined
  x.f; // () => number
  x.g; // (() => number) | undefined
  let f1 = x.f(); // number
  let g1 = x.g && x.g(); // number | undefined
  let g2 = x.g ? x.g() : 0; // number
}
```

## Constructores privados y protegidos

Un constructor de clase puede estar marcado como `private` o `protected`.
No se puede crear una instancia de una clase con un constructor privado fuera del cuerpo de la clase y no se puede extender.
No se puede crear una instancia de una clase con un constructor protegido fuera del cuerpo de la clase, pero se puede extender.

##### Ejemplo

```ts
class Singleton {
  private static instance: Singleton;

  private constructor() {}

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

let e = new Singleton(); // Error: El constructor de 'Singleton' es privado.
let v = Singleton.getInstance();
```

## Propiedades abstractas y descriptores de acceso

Una clase abstracta puede declarar propiedades abstractas y/o descriptores de acceso.
Cualquier subclase deberá declarar las propiedades abstractas o marcarse como abstracta.
Las propiedades abstractas no pueden tener un iniciador.
Los descriptores de acceso abstractos no pueden tener cuerpo.

##### Ejemplo

```ts
abstract class Base {
  abstract name: string;
  abstract get value();
  abstract set value(v: number);
}

class Derived extends Base {
  name = "derived";

  value = 1;
}
```

## Índice de firmas implícito

Un tipo literal de objeto ahora se puede asignar a un tipo con un índice de firma si todas las propiedades conocidas en el objeto literal se pueden asignar a ese índice de firmas. Esto hace posible pasar una variable que se inició con un objeto literal como parámetro a una función que espera un mapa o diccionario:

```ts
function httpService(path: string, headers: { [x: string]: string }) {}

const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
};

httpService("", { "Content-Type": "application/x-www-form-urlencoded" }); // Bien
httpService("", headers); // Ahora bien, antes no
```

## Incluyendo declaraciones de tipo integradas con `--lib`

Llegar a las declaraciones de *API*s incorporadas de *ES6*/*ES2015* solo se limitaron a `target: ES6`.
Ingresa [`lib`](/tsconfig#lib); con [`lib`](/tsconfig#lib) puedes especificar una lista de grupos de declaración de *API*s incorporados que puedes elegir incluir en tu proyecto.
Por ejemplo, si esperas que tu entorno de ejecución sea compatible con `Map`, `Set` y `Promise` (por ejemplo, la mayoría de los navegadores perenne de la actualidad), solo incluyen `--lib es2015.collection, es2015.promise`.
Del mismo modo, puedes excluir declaraciones que no deseas incluir en tu proyecto, p. ej. *DOM* si estás trabajando en un proyecto de nodo usando `--lib es5, es6`.

Aquí hay una lista de grupos *API* disponibles:

- `dom`
- `webworker`
- `es5`
- `es6/es2015`
- `es2015.core`
- `es2015.collection`
- `es2015.iterable`
- `es2015.promise`
- `es2015.proxy`
- `es2015.reflect`
- `es2015.generator`
- `es2015.symbol`
- `es2015.symbol.wellknown`
- `es2016`
- `es2016.array.include`
- `es2017`
- `es2017.object`
- `es2017.sharedmemory`
- `scripthost`

##### Ejemplo

```bash
tsc --target es5 --lib es5,es2015.promise
```

```json tsconfig
"compilerOptions": {
    "lib": ["es5", "es2015.promise"]
}
```

## Marca las declaraciones no utilizadas con `--noUnusedParameters` y `--noUnusedLocals`

*TypeScript 2.0* tiene dos nuevos indicadores para ayudarte a mantener una código base limpio.
[`noUnusedParameters`](/tsconfig#noUnusedParameters) marca cualquier función no utilizada o errores de parámetros de método.
[`noUnusedLocals`](/tsconfig#noUnusedLocals) marca cualquier declaración local no utilizada (no exportada) como variables, funciones, clases, importaciones, etc.
Además, los miembros privados no utilizados de una clase se marcarían como errores en [`noUnusedLocals`](/tsconfig#noUnusedLocals).

##### Ejemplo

```ts
import B, { readFile } from "./b";
//     ^ Error: `B` declarado pero nunca usado
readFile();

export function write(message: string, args: string[]) {
  //                                 ^^^^  Error: 'arg' declarado pero nunca usado.
  console.log(message);
}
```

La declaración de parámetros con nombres que comienzan con `_` están exentas de la verificación de parámetros no utilizados.
p.ej.:

```ts
function returnNull(_a) {
  // Bien
  return null;
}
```

## Los identificadores de módulo permiten la extensión `.js`

Antes de *TypeScript 2.0*, siempre se suponía que un identificador de módulo no tenía extensión;
por ejemplo, dada una importación como `import d from "./moduleA.js"`, el compilador buscó la definición de `"moduleA.js"` en `./moduleA.js.ts` o `./moduleA.js.d.ts`.
Esto dificultó el uso de herramientas de agrupación/carga como [*SystemJS*](https://github.com/systemjs/systemjs) que esperan *URI* en su identificador de módulo.

Con *TypeScript 2.0*, el compilador buscará la definición de `"moduleA.js"` en `./moduleA.ts` o en `./moduleA.d.ts`.

## Soporte de `'target`: es5'` con `'module: es6'`

Anteriormente marcado como una combinación de banderas no válida, `target: es5` y `'module: es6'` ahora es compatible.
Esto debería facilitar el uso de vibradores de árboles basados ​​en *ES2015* como [`rollup`](https://github.com/rollup/rollup).

## Comas finales en listas de parámetros y argumentos de funciones

Ahora se permiten las comas finales en las listas de parámetros y argumentos de la función.
Esta es una implementación para una [propuesta de *ECMAScript* de etapa 3](https://jeffmo.github.io/es-trailing-function-commas/) que emite hasta un *ES3*/*ES5*/*ES6* válido.

##### Ejemplo

```ts
function foo(
  bar: Bar,
  baz: Baz // las comas finales están bien en las listas de parámetros
) {
  // Implementación...
}

foo(
  bar,
  baz // y en listas de argumentos
);
```

## Nuevo `--skipLibCheck`

*TypeScript 2.0* agrega una nueva opción de compilador [`skipLibCheck`](/tsconfig#skipLibCheck) que hace que se omita la verificación de tipos de archivos de declaración (archivos con extensión `.d.ts`).
Cuando un programa incluye archivos de declaración grandes, el compilador pasa mucho tiempo verificando declaraciones que ya se sabe que no contienen errores, y los tiempos de compilación se pueden reducir significativamente al omitir las verificaciones del tipo de archivo de declaración.

Dado que las declaraciones en un archivo pueden afectar la verificación de tipos en otros archivos, es posible que algunos errores no se detecten cuando se especifica [`skipLibCheck`](/tsconfig#skipLibCheck).
Por ejemplo, si un archivo de no declaración aumenta un tipo declarado en un archivo de declaración, se pueden producir errores que solo se informan cuando se comprueba el archivo de declaración.
Sin embargo, en la práctica estas situaciones son raras.

## Permitir identificadores duplicados en declaraciones

Esta ha sido una fuente común de errores de definición duplicados.
Múltiples archivos de declaración que definen los mismos miembros en interfaces.

*TypeScript 2.0* relaja esta restricción y permite identificadores duplicados en bloques, siempre que tengan tipos *idénticos*.

Dentro del mismo bloque, las definiciones duplicadas aún no están permitidas.

##### Ejemplo

```ts
interface Error {
  stack?: string;
}

interface Error {
  code?: string;
  path?: string;
  stack?: string; // Bien
}
```

## Nueva `--declarationDir`

[`declarationDir`](/tsconfig#declarationDir) permite generar archivos de declaración en una ubicación diferente a los archivos *JavaScript*.
