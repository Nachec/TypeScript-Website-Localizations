---
title: TypeScript 1.8
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-8.html
oneline: Notas de la versión de TypeScript 1.8
---

## Escribe parámetros como restricciones

Con *TypeScript 1.8* es posible que una restricción de parámetro de tipo haga referencia a parámetros de tipo de la misma lista de parámetros de tipo.
Anteriormente, esto era un error.
Esta capacidad generalmente se conoce como [Polimorfismo delimitado por `F`](https://wikipedia.org/wiki/Bounded_quantification#F-bounded_quantification).

##### Ejemplo

```ts
function assign<T extends U, U>(target: T, source: U): T {
  for (let id in source) {
    target[id] = source[id];
  }
  return target;
}

let x = { a: 1, b: 2, c: 3, d: 4 };
assign(x, { b: 10, d: 20 });
assign(x, { e: 0 }); // Error
```

## Controlar errores de análisis de flujo

*TypeScript 1.8* introduce el análisis de control de flujo para ayudar a detectar errores comunes con los que los usuarios tienden a encontrarse.
Sigue leyendo para obtener más detalles y ver estos errores en acción:

![cfa](https://cloud.githubusercontent.com/assets/8052307/5210657/c5ae0f28-7585-11e4-97d8-86169ef2a160.gif)

### Código inalcanzable

Las declaraciones que se garantiza que no se ejecutarán en entorno de ejecución ahora se marcan correctamente como errores de código inalcanzable.
Por ejemplo, las declaraciones que siguen a declaraciones incondicionales `return`, `throw`, `break` o `continue` se consideran inalcanzables.
Utiliza [`allowUnreachableCode`](/tsconfig#allowUnreachableCode) para deshabilitar la detección y los informes de código inaccesible.

##### Ejemplo

A continuación, se muestra un ejemplo sencillo de un error de código inalcanzable:

```ts
function f(x) {
  if (x) {
    return true;
  } else {
    return false;
  }

  x = 0; // Error: Código inaccesible detectado.
}
```

Un error más común que detecta esta característica es agregar una nueva línea después de una declaración `return`:

```ts
function f() {
  return; // Inserción automática de punto y coma activada en nueva línea
  {
    x: "string"; // Error: Código inaccesible detectado.
  }
}
```

Dado que *JavaScript* termina automáticamente la declaración `return` al final de la línea, el objeto literal se convierte en un bloque.

### Etiquetas no utilizadas

Las etiquetas no utilizadas también se marcan.
Al igual que las comprobaciones de código inalcanzable, están activadas de forma predeterminada;
usa [`allowUnusedLabels`](/tsconfig#allowUnusedLabels) para dejar de informar de estos errores.

##### Ejemplo

```ts
loop: while (x > 0) {
  // Error: Etiqueta no utilizada.
  x++;
}
```

### Devoluciones implícitas

Las funciones con rutas de código que no devuelven un valor en *JS* devuelven implícitamente `undefined`.
Ahora el compilador los puede marcar como devoluciones implícitas.
La verificación está desactivada de forma predeterminada; usa [`noImplicitReturns`](/tsconfig#noImplicitReturns) para activarla.

##### Ejemplo

```ts
function f(x) {
  // Error: No todas las rutas de código devuelven un valor.
  if (x) {
    return false;
  }

  // devuelve implícitamente "undefined"
}
```

### Fallos de la cláusula `case`

*TypeScript* puede informar errores para casos fallidos en la instrucción `switch` donde la cláusula `case` no está vacía.
Esta verificación está desactivada de forma predeterminada y se puede habilitar usando [`noFallthroughCasesInSwitch`](/tsconfig#noFallthroughCasesInSwitch).

##### Ejemplo

Con [`noFallthroughCasesInSwitch`](/tsconfig#noFallthroughCasesInSwitch), este ejemplo desencadenará un error:

```ts
switch (x % 2) {
  case 0: // Error: Caso de caída en el switch.
    console.log("par");

  case 1:
    console.log("impar");
    break;
}
```

Sin embargo, en el siguiente ejemplo, no se reportará ningún error porque el caso alternativo está vacío:

```ts
switch (x % 3) {
  case 0:
  case 1:
    console.log("Acceptable");
    break;

  case 2:
    console.log("This is *two much*!");
    break;
}
```

## Componentes de función en *React*

*TypeScript* ahora admite [Componentes de función](https://reactjs.org/docs/components-and-props.html#functional-and-class-components).
Estos son componentes ligeros que conforman fácilmente otros componentes:

```ts
// Utiliza la desestructuración de parámetros y los valores predeterminados para una fácil definición del tipo 'props'
const Greeter = ({ name = "world" }) => <div>Hello, {name}!</div>;

// Las propiedades se validan
let example = <Greeter name="TypeScript 1.8" />;
```

Para esta función y accesorios simplificados, asegúrate de utilizar la [última versión de `react.d.ts`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts).

## Gestión simplificada de tipos `props` en *React*

En *TypeScript 1.8* con la última versión de `react.d.ts` (ve arriba), también hemos simplificado enormemente la declaración de tipos `props`.

Específicamente:

- Ya no es necesario declarar explícitamente `ref` y `key` o `extend React.Props`
- Las propiedades `ref` y `key` aparecerán con los tipos correctos en todos los componentes
- La propiedad `ref` está correctamente prohibida en instancias de componentes de función sin estado

## Aumento del alcance (global/módulo) de los módulos

Los usuarios ahora pueden declarar cualquier aumento que quieran hacer, o que cualquier otro consumidor ya haya hecho, a un módulo existente.
Los aumentos de módulos se ven como declaraciones simples de módulos ambientales antiguos (es decir, la sintaxis `declare module "foo" {}`), y están anidados directamente en sus propios módulos o en otro módulo externo del ambiente de nivel superior.

Además, *TypeScript* también tiene la noción de aumentos *global*es de la forma `declare global {}`.
Esto permite que los módulos aumenten los tipos globales como `Array` si es necesario.

El nombre de un aumento de módulo se resuelve utilizando el mismo conjunto de reglas que los especificadores de módulo en las declaraciones de importación y exportación.
Las declaraciones en un aumento de módulo se fusionan con cualquier declaración existente de la misma manera que lo harían si estuvieran declaradas en el mismo archivo.

Ni los aumentos de módulo ni los aumentos globales pueden agregar nuevos elementos al alcance de nivel superior. sólo pueden "parchear" declaraciones existentes.

##### Ejemplo

Aquí, `map.ts` puede declarar que parcheará internamente el tipo `Observable` de `observable.ts` y le agregará el método `map`.

```ts
// observable.ts
export class Observable<T> {
  // ...
}
```

```ts
// map.ts
import { Observable } from "./observable";

// Crea un aumento para "./observable"
declare module "./observable" {

    // Aumenta la definición de la clase 'Observable' con la combinación de interfaces
    interface Observable<T> {
        map<U>(proj: (el: T) => U): Observable<U>;
    }

}

Observable.prototype.map = /*...*/;
```

```ts
// consumer.ts
import { Observable } from "./observable";
import "./map";

let o: Observable<number>;
o.map((x) => x.toFixed());
```

De manera similar, el alcance global se puede aumentar a partir de módulos usando declaraciones `declare global`:

##### Ejemplo

```ts
// Se asegura de que se trate como un módulo.
export {};

declare global {
  interface Array<T> {
    mapToNumbers(): number[];
  }
}

Array.prototype.mapToNumbers = function () {
  /* ... */
};
```

## Tipos de cadena literal

No es raro que una *API* espere un conjunto específico de cadenas para ciertos valores.
Por ejemplo, considera una biblioteca de la *IU* que puede mover elementos a través de la pantalla mientras controla la ["suavización" de la animación](https://wikipedia.org/wiki/Inbetweening).

```ts
declare class UIElement {
  animate(options: AnimationOptions): void;
}

interface AnimationOptions {
  deltaX: number;
  deltaY: number;
  easing: string; // Puede ser de "entrada fácil", "salida fácil", "fácil entrada y salida"
}
```

Sin embargo, esto es propenso a errores ⏤ no hay nada que impida que un usuario accidentalmente escriba mal uno de los valores de aceleración válidos:

```ts
// Sin errores
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

Con *TypeScript 1.8*, hemos introducido tipos de cadenas literales.
Estos tipos se escriben de la misma forma que las cadenas literales, pero en posiciones de tipo.

Los usuarios ahora se pueden asegurar de que el sistema de tipos detectará tales errores.
Aquí están nuestras nuevas `AnimationOptions` usando tipos de cadenas literales:

```ts
interface AnimationOptions {
  deltaX: number;
  deltaY: number;
  easing: "ease-in" | "ease-out" | "ease-in-out";
}

// Error: El tipo '"ease-inout"' no se puede asignar al tipo "ease-in" | "ease-out" | "ease-in-out"'
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

## Inferencia de tipo unión/intersección mejorada

*TypeScript 1.8* mejora la inferencia de tipos que involucran lados de origen y destino que son tipos unión o intersección.
Por ejemplo, al inferir `string | string[]` a `string | T`, reducimos los tipos a `string[]` y `T`, infiriendo así `string[]` para `T`.

##### Ejemplo

```ts
type Maybe<T> = T | void;

function isDefined<T>(x: Maybe<T>): x is T {
  return x !== undefined && x !== null;
}

function isUndefined<T>(x: Maybe<T>): x is void {
  return x === undefined || x === null;
}

function getOrElse<T>(x: Maybe<T>, defaultValue: T): T {
  return isDefined(x) ? x : defaultValue;
}

function test1(x: Maybe<string>) {
  let x1 = getOrElse(x, "Undefined"); // string
  let x2 = isDefined(x) ? x : "Undefined"; // string
  let x3 = isUndefined(x) ? "Undefined" : x; // string
}

function test2(x: Maybe<number>) {
  let x1 = getOrElse(x, -1); // number
  let x2 = isDefined(x) ? x : -1; // number
  let x3 = isUndefined(x) ? -1 : x; // number
}
```

## Concatenar los módulos `AMD` y `System` con `--outFile`

Especificar [`outFile`](/tsconfig#outFile) junto con `--module amd` o `--module system` concatenará todos los módulos en la compilación en un solo archivo de salida que contiene múltiples cierres de módulos.

Se calculará un nombre de módulo para cada módulo en función de su ubicación relativa a [`rootDir`](/tsconfig#rootDir).

##### Ejemplo

```ts
// file src/a.ts
import * as B from "./lib/b";
export function createA() {
  return B.createB();
}
```

```ts
// archivo src/lib/b.ts
export function createB() {
  return {};
}
```

Resultados en:

```js
define("lib/b", ["require", "exports"], function (require, exports) {
  "use strict";
  function createB() {
    return {};
  }
  exports.createB = createB;
});
define("a", ["require", "exports", "lib/b"], function (require, exports, B) {
  "use strict";
  function createA() {
    return B.createB();
  }
  exports.createA = createA;
});
```

## Soporte para la interoperabilidad de importación `default` con *SystemJS*

Los cargadores de módulos como *SystemJS* envuelven los módulos *CommonJS* y los exponen como una importación *ES6* `default`. Esto hace que sea imposible compartir los archivos de definición entre la implementación de *SystemJS* y *CommonJS* del módulo, ya que la forma del módulo se ve diferente según el cargador.

Establecer la nueva marca del compilador [`allowSyntheticDefaultImports`](/tsconfig#allowSyntheticDefaultImports) indica que el cargador del módulo realiza algún tipo de creación de miembros de importación predeterminados sintéticos no indicados en los `.ts` o `.d.ts` importados. El compilador inferirá la existencia de una exportación `default` que tiene la forma de todo el módulo.

Los módulos del sistema tienen esta bandera activada de forma predeterminada.

## Permite `let`/`const` capturados en bucles

Anteriormente un error, ahora compatible con *TypeScript 1.8*.
Las declaraciones `let`/`const` dentro de los bucles y capturadas en funciones ahora se emiten para coincidir correctamente con la fresca semántica de `let`/`const`.

##### Ejemplo

```ts
let list = [];
for (let i = 0; i < 5; i++) {
  list.push(() => i);
}

list.forEach((f) => console.log(f()));
```

is compiled to:

```js
var list = [];
var _loop_1 = function (i) {
  list.push(function () {
    return i;
  });
};
for (var i = 0; i < 5; i++) {
  _loop_1(i);
}
list.forEach(function (f) {
  return console.log(f());
});
```

Y resulta en

```Shell
0
1
2
3
4
```

## Comprobación mejorada de declaraciones `for..in`

Anteriormente, el tipo de una variable `for..in` se infería como `any`; que permitía al compilador ignorar los usos no válidos dentro del cuerpo `for..in`.

Comenzando con *TypeScript 1.8*:

- El tipo de una variable declarada en una instrucción `for..in` implícitamente es `string`.
- Cuando un objeto con un índice de firma numérico de tipo `T` (como un arreglo) es indexado por una variable `for..in` de una declaración que contiene `for..in` para un objeto *con* un índice de firma numérico y *sin* un índice de firma de cadena (nuevamente como un arreglo), el valor producido es de tipo `T`.

##### Ejemplo

```ts
var a: MyObject[];
for (var x in a) {
  // El tipo de x implícitamente es string
  var obj = a[x]; // El tipo de obj es MyObject
}
```

## Los módulos ahora se emiten con un prólogo `"use strict";`

Los módulos siempre se analizaron en modo estricto según *ES6*, pero para los objetivos que no son de *ES6*, esto no se respetó en el código generado. A partir de *TypeScript 1.8*, los módulos emitidos siempre están en modo estricto. Esto no debería tener ningún cambio visible en la mayoría del código, ya que *TS* considera los errores de modo más estrictos como errores en tiempo de compilación, pero significa que algunas cosas que solían fallar silenciosamente en el entorno de ejecución en tu código *TS*, como asignar a `NaN`, ahora falla en voz alta. Puedes consultar el [artículo de *MDN*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Strict_mode) en modo estricto para obtener una lista detallada de las diferencias entre el modo estricto y el modo regular.

## Incluyendo archivos `.js` con `--allowJs`

A menudo, hay archivos fuente externos en tu proyecto que pueden no estar creados en *TypeScript*.
Alternativamente, es posible que estés en medio de convertir un código *JS* base en *TS*, pero aún deseas agrupar todo tu código *JS* en un solo archivo con la salida de tu nuevo código *TS*.

Los archivos `.js` ahora se permiten como entrada a `tsc`.
El compilador de *TypeScript* comprueba los archivos de entrada `.js` en busca de errores de sintaxis y emite una salida válida basada en los indicadores [`target`](/tsconfig#target) y [`module`](/tsconfig#module).
La salida también se puede combinar con otros archivos `.ts`.
Los mapas de fuente se siguen generando para archivos `.js` al igual que con los archivos `.ts`.

## Fábricas *JSX* personalizadas usando `--reactNamespace`

Pasar `--reactNamespace<JSX factory Name>` junto con `--jsx react` permite usar una fábrica *JSX* diferente de la`React` predeterminada.

El nuevo nombre de fábrica se utilizará para llamar a las funciones `createElement` y `__spread`.

##### Ejemplo

```ts
import { jsxFactory } from "jsxFactory";

var div = <div>Hello JSX!</div>;
```

Compilado con:

```shell
tsc --jsx react --reactNamespace jsxFactory --m commonJS
```

Resultados en:

```js
"use strict";
var jsxFactory_1 = require("jsxFactory");
var div = jsxFactory_1.jsxFactory.createElement("div", null, "Hello JSX!");
```

## Guardias basados ​​en el tipo de `this`

*TypeScript 1.8* extiende [funciones protectoras de tipo definido por el usuario](#funciones-protectoras-de-tipo-definido-por-el-usuario) a métodos de clase e interfaz.

`this is T` ahora es una anotación de tipo de retorno válida para métodos en clases e interfaces.
Cuando se usa en una posición de reducción de tipo (por ejemplo, instrucción `if`), el tipo del objeto de destino de la expresión de llamada se reduciría a `T`.

##### Ejemplo

```ts
class FileSystemObject {
  isFile(): this is File {
    return this instanceof File;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}

class File extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}
class Directory extends FileSystemObject {
  children: FileSystemObject[];
}
interface Networked {
  host: string;
}

let fso: FileSystemObject = new File("foo/bar.txt", "foo");
if (fso.isFile()) {
  fso.content; // fso es archivo
} else if (fso.isDirectory()) {
  fso.children; // fso es directorio
} else if (fso.isNetworked()) {
  fso.host; // fso está en red
}
```

## Paquete *NuGet* oficial de *TypeScript*

A partir de *TypeScript 1.8*, los paquetes oficiales de *NuGet* están disponibles para el compilador de *TypeScript* (`tsc.exe`), así como para la integración de *MSBuild* (`Microsoft.TypeScript.targets` y `Microsoft.TypeScript.Tasks.dll`).

Los paquetes estables están disponibles aquí:

- [`Microsoft.TypeScript.Compiler`](https://www.nuget.org/packages/Microsoft.TypeScript.Compiler/)
- [`Microsoft.TypeScript.MSBuild`](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild/)

Además, un paquete *NuGet* nocturno para que coincida con el [paquete `npm` nocturno](http://blogs.msdn.com/b/typescript/archive/2015/07/27/introducing-typescript-nightlies.aspx) está disponible en https://myget.org:

- [`TypeScript-Preview`](https://www.myget.org/gallery/typescript-preview)

## Mensajes de error más bonitos de `tsc`

Entendemos que una tonelada de salida monocromática puede ser un poco difícil para la vista.
Los colores pueden ayudar a discernir dónde comienza y termina un mensaje, y estas pistas visuales son importantes cuando la salida de errores se vuelve abrumadora.

Con solo pasar la opción de línea de comando [`pretty`](/tsconfig#pretty), *TypeScript* ofrece una salida más colorida con contexto sobre dónde van mal las cosas.

![Muestra bonitos mensajes de error en ConEmu](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/pretty01.png)

## Coloración del código *JSX* en *VS 2015*

Con *TypeScript 1.8*, las etiquetas *JSX* ahora están clasificadas y coloreadas en *Visual Studio 2015*.

![jsx](https://cloud.githubusercontent.com/assets/8052307/12271404/b875c502-b90f-11e5-93d8-c6740be354d1.png)

La clasificación se puede personalizar aún más cambiando la configuración de fuente y color para la configuración de fuente y color de `VB XML` a través de la página `Herramientas` ▹ `Opciones` ▹ `Entorno` ▹ `Fuentes y colores`.

## El indicador `--project` (`-p`) ahora puede tomar cualquier ruta de archivo

La opción de línea de comando `--project` originalmente solo podía tomar rutas a un directorio que contenía un `tsconfig.json`.
Dados los diferentes escenarios para las configuraciones de compilación, tenía sentido permitir que `--project` apunte a cualquier otro archivo *JSON* compatible.
Por ejemplo, un usuario puede querer apuntar a *ES2015* con módulos *CommonJS* para el *Node 5*, pero *ES5* con módulos *AMD* para el navegador.
Con este nuevo trabajo, los usuarios pueden administrar fácilmente dos destinos de compilación separados usando solo `tsc` sin tener que realizar soluciones improvisadas como colocar archivos `tsconfig.json` en directorios separados.

El comportamiento anterior sigue siendo el mismo si se le da un directorio ⏤ el compilador intentará encontrar en el directorio un archivo llamado `tsconfig.json`.

## Permitir comentarios en `tsconfig.json`

¡Siempre es bueno poder documentar tu configuración!
`tsconfig.json` ahora acepta comentarios de una o varias líneas.

```json tsconfig
{
  "compilerOptions": {
    "target": "ES2015", // ejecutándose en el node v5, yaay!
    "sourceMap": true // facilita la depuración
  },
  /*
   * Archivos excluidos
   */
  "exclude": ["file.d.ts"]
}
```

## Soporte de salida a archivos controlados por *IPC*

*TypeScript 1.8* permite a los usuarios usar el argumento [`outFile`](/tsconfig#outFile) con entidades especiales del sistema de archivos como tuberías con nombre, dispositivos, etc.

Como ejemplo, en muchos sistemas similares a *Unix*, se puede acceder al flujo de salida estándar mediante el archivo `/dev/stdout`.

```shell
tsc foo.ts --outFile /dev/stdout
```

Esto también se puede usar para canalizar la salida entre comandos.

Como ejemplo, podemos canalizar nuestro *JavaScript* emitido a una impresora bonita como [`pretty-js`](https://www.npmjs.com/package/pretty-js):

```shell
tsc foo.ts --outFile /dev/stdout | pretty-js
```

## Soporte mejorado para `tsconfig.json` en *Visual Studio 2015*

*TypeScript 1.8* permite archivos `tsconfig.json` en todos los tipos de proyectos.
Esto incluye proyectos *ASP.NET v4*, *Console Application* y *Html Application con tipos de proyectos TypeScript*.
Además, ya no estás limitado a un solo archivo `tsconfig.json`, sino que puedes agregar varios, y cada uno se creará como parte del proyecto.
Esto te permite separar la configuración para diferentes partes de tu aplicación sin tener que usar varios proyectos diferentes.

![Mostrando tsconfig.json en Visual Studio](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/tsconfig-in-vs.png)

También deshabilitamos la página de propiedades del proyecto cuando agregas un archivo `tsconfig.json`.
Esto significa que todos los cambios de configuración se deben realizar en el propio archivo `tsconfig.json`.

### Un par de limitaciones

- Si agregas un archivo `tsconfig.json`, los archivos *TypeScript* que no se consideran parte de ese contexto no se compilan.
- Las aplicaciones de *Apache Cordova* todavía tienen la limitación existente de un solo archivo `tsconfig.json`, que debe estar en el directorio raíz o en el directorio `scripts`.
- No existe una plantilla para `tsconfig.json` en la mayoría de los tipos de proyectos.
