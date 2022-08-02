---
title: TypeScript 1.5
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-5.html
oneline: Notas de la versión de TypeScript 1.5
---

## Módulos *ES6*

*TypeScript 1.5* admite módulos *ECMAScript 6* (*ES6*).
Los módulos *ES6* efectivamente son módulos externos de *TypeScript* con una nueva sintaxis: Los módulos *ES6* son archivos fuente cargados por separado que posiblemente importan otros módulos y proporcionan una serie de exportaciones accesibles desde el exterior.
Los módulos *ES6* cuentan con varias declaraciones de importación y exportación nuevas.
Se recomienda que las bibliotecas y aplicaciones de *TypeScript* se actualicen para usar la nueva sintaxis, pero esto no es un requisito.
La nueva sintaxis del módulo *ES6* coexiste con las construcciones de módulos internos y externos originales de *TypeScript* y las construcciones se pueden mezclar y combinar a voluntad.

#### Declaraciones `export`

Además del soporte existente de *TypeScript* para decorar declaraciones con `export`, los miembros del módulo también se pueden exportar usando declaraciones de exportación separadas, especificando opcionalmente diferentes nombres para las exportaciones usando cláusulas `as`.

```ts
interface Stream { ... }
function writeToStream(stream: Stream, data: string) { ... }
export { Stream, writeToStream as write };  // writeToStream exportado como escritura
```

Las declaraciones `import`, también, pueden usar opcionalmente cláusulas `as` para especificar diferentes nombres locales para las importaciones. Por ejemplo:

```ts
import { read, write, standardOutput as stdout } from "./inout";
var s = read(stdout);
write(stdout, s);
```

Como alternativa a las importaciones individuales, se puede utilizar una importación de espacio de nombres para importar un módulo completo:

```ts
import * as io from "./inout";
var s = io.read(io.standardOutput);
io.write(io.standardOutput, s);
```

#### Reexportar

Al usar la cláusula `from`, un módulo puede copiar las exportaciones de un módulo dado al módulo actual sin introducir nombres locales.

```ts
export { read, write, standardOutput as stdout } from "./inout";
```

puede utilizar `export *` para reexportar todas las exportaciones de otro módulo. Esto es útil para crear módulos que agreguen las exportaciones de varios otros módulos.

```ts
export function transform(s: string): string { ... }
export * from "./mod1";
export * from "./mod2";
```

#### Exportación predeterminada

Una declaración `export default` especifica una expresión que se convierte en la exportación predeterminada de un módulo:

```ts
export default class Greeter {
  sayHello() {
    console.log("Greetings!");
  }
}
```

Que a su vez se pueden importar usando `import default`:

```ts
import Greeter from "./greeter";
var g = new Greeter();
g.sayHello();
```

#### Importación simple

Se puede utilizar una "importación simple" para importar un módulo solo por sus efectos secundarios.

```ts
import "./polyfills";
```

Para obtener más información sobre el módulo, consulta la [especificación de compatibilidad del módulo *ES6*](https://github.com/Microsoft/TypeScript/issues/2242).

## Desestructuración en declaraciones y asignaciones

*TypeScript 1.5* agrega compatibilidad con las declaraciones y asignaciones de desestructuración de *ES6*.

#### Declaración de variables

Una declaración de desestructuración introduce una o más variables con nombre y las inicia con valores extraídos de las propiedades de un objeto o elementos de un arreglo.

Por ejemplo, el siguiente ejemplo declara las variables `x`, `y` y `z`, y las inicia en `getSomeObject().x`, `getSomeObject().y` y `getSomeObject().z` respectivamente:

```ts
var { x, y, z } = getSomeObject();
```

Las declaraciones de desestructuración también funcionan para extraer valores de arreglos:

```ts
var [x, y, z = 10] = getSomeArray();
```

Del mismo modo, la desestructuración se puede utilizar en declaraciones de parámetros de función:

```ts
function drawText({ text = "", location: [x, y] = [0, 0], bold = false }) {
  // Dibuja texto
}

// Llama a drawText con un objeto literal
var item = { text: "someText", location: [1, 2, 3], style: "italics" };
drawText(item);
```

#### Asignaciones

Los patrones de desestructuración también se pueden utilizar en expresiones de asignación regulares.
Por ejemplo, el intercambio de dos variables se puede escribir como una sola asignación de desestructuración:

```ts
var x = 1;
var y = 2;
[x, y] = [y, x];
```

## Palabra clave `namespace`

*TypeScript* usó la palabra clave `module` para definir tanto "módulos internos" como "módulos externos";
esto ha sido un poco confuso para los desarrolladores nuevos en *TypeScript*.
Los "módulos internos" están más cerca de lo que la mayoría de la gente llamaría un espacio de nombres; del mismo modo, los "módulos externos" en *JS* ahora son realmente módulos.

> Nota: Aún se admite la sintaxis anterior que define los módulos internos.

**Antes**:

```ts
module Math {
    export function add(x, y) { ... }
}
```

**Después**:

```ts
namespace Math {
    export function add(x, y) { ... }
}
```

## Soporte para `let` y `const`

Las declaraciones `let` y `const` de *ES6* ahora son compatibles cuando se apunta a *ES3* y *ES5*.

#### `const`

```ts
const MAX = 100;

++MAX; // Error: El operando de un incremento o decremento
//        el operador no puede ser una constante.
```

#### Bloque de alcance

```ts
if (true) {
  let a = 4;
  // usa a
} else {
  let a = "string";
  // usa a
}

alert(a); // Error: a no está definido en este alcance.
```

## Soporte para `for..of`

*TypeScript 1.5* agrega soporte a *ES6* para bucles `for...of` en arreglos para *ES3*/*ES5*, así como soporte completo para interfaces `Iterator` cuando apunta a *ES6*.

##### Ejemplo

El compilador de *TypeScript* se transpilará para `for...of` de arreglos a *JavaScript* *ES3*/*ES5* idiomático cuando se dirige a esas versiones:

```ts
for (var v of expr) {
}
```

se emitirá como:

```js
for (var _i = 0, _a = expr; _i < _a.length; _i++) {
  var v = _a[_i];
}
```

## Decoradores

> Los decoradores de *TypeScript* se basan en la [propuesta de decorador de *ES7*](https://github.com/wycats/javascript-decorators).

Un decorador es:

- una expresión
- que evalúa a una función
- que toma el destino, el nombre y el descriptor de propiedad como argumentos
- y, opcionalmente, devuelve un descriptor de propiedad para instalar en el objeto destino

> Para obtener más información, consulta la propuesta de [Decoradores](https://github.com/Microsoft/TypeScript/issues/2249).

##### Ejemplo

Los decoradores `readonly` y `enumerable(false)` se aplicarán a la propiedad `method` antes de que se instale en la clase `C`.
Esto permite al decorador cambiar la implementación y, en este caso, aumentar el descriptor para que se pueda escribir: `false` y `enumerable`: `false`.

```ts
class C {
  @readonly
  @enumerable(false)
  method() { ... }
}

function readonly(target, key, descriptor) {
    descriptor.writable = false;
}

function enumerable(value) {
    return function (target, key, descriptor) {
        descriptor.enumerable = value;
    };
}
```

## Propiedades calculadas

Iniciar un objeto con propiedades dinámicas puede ser un poco complicado. Toma el siguiente ejemplo:

```ts
type NeighborMap = { [name: string]: Node };
type Node = { name: string; neighbors: NeighborMap };

function makeNode(name: string, initialNeighbor: Node): Node {
  var neighbors: NeighborMap = {};
  neighbors[initialNeighbor.name] = initialNeighbor;
  return { name: name, neighbors: neighbors };
}
```

Aquí necesitamos crear una variable para mantener el mapa de vecinos para que podamos iniciarlo.
Con *TypeScript 1.5*, podemos dejar que el compilador haga el trabajo pesado:

```ts
function makeNode(name: string, initialNeighbor: Node): Node {
  return {
    name: name,
    neighbors: {
      [initialNeighbor.name]: initialNeighbor,
    },
  };
}
```

## Soporte para salida de módulo `UMD` y `System`

Además de los cargadores de módulos `AMD` y `CommonJS`, *TypeScript* ahora admite módulos emisores `UMD` ([Definición de módulo universal](https://github.com/umdjs/umd)) y [`System`](https://github.com/systemjs/systemjs) formatos de módulo.

**Uso**:

> `tsc --module umd`

y

> `tsc --module system`

## El punto de código Unicode se escapa en cadenas

*ES6* introduce escapes que permiten a los usuarios representar un punto de código Unicode usando un solo escape.

Como ejemplo, considera la necesidad de escapar de una cadena que contiene el carácter '𠮷'.
En *UTF-16*/*UCS2*, '𠮷' se representa como un par sustituto, lo cual significa que se codifica utilizando un par de unidades de valores de código de 16 bits, específicamente `0xD842` y `0xDFB7`.
Anteriormente, esto significaba que tendrías que escapar del punto de código como `"\uD842\uDFB7"`.
Esto tiene la mayor desventaja de que es difícil distinguir dos caracteres independientes de una pareja sustituta.

Con los escapes de puntos de código de *ES6*, puedes representar claramente ese carácter exacto en cadenas y cadenas de plantillas con un solo escape: `"\u{20bb7}"`.
*TypeScript* emitirá la cadena en *ES3*/*ES5* como `" \uD842\uDFB7"`.

## Cadenas de plantilla etiquetadas en *ES3*/*ES5*

En *TypeScript 1.4*, agregamos soporte para cadenas de plantilla para todos los objetivos y plantillas etiquetadas solo para ES6.
Gracias a un trabajo considerable realizado por [*@ivogabe*](https://github.com/ivogabe), cerramos la brecha para las plantillas etiquetadas en *ES3* y *ES5*.

Al apuntar a *ES3*/*ES5*, el siguiente código

```ts
function oddRawStrings(strs: TemplateStringsArray, n1, n2) {
  return strs.raw.filter((raw, index) => index % 2 === 1);
}

oddRawStrings`Hello \n${123} \t ${456}\n world`;
```

será emitido como

```js
function oddRawStrings(strs, n1, n2) {
  return strs.raw.filter(function (raw, index) {
    return index % 2 === 1;
  });
}
(_a = ["Hello \n", " \t ", "\n world"]),
  (_a.raw = ["Hello \\n", " \\t ", "\\n world"]),
  oddRawStrings(_a, 123, 456);
var _a;
```

## Nombres opcionales de dependencia de *AMD*

`/// <amd-dependency path="x"/>` informa al compilador sobre una dependencia de un módulo que no es *TS* que se debe inyectar en la llamada `require` del módulo resultante.
sin embargo, no había forma de consumir este módulo en el código *TS*.

La nueva propiedad `amd-dependency name` permite pasar un nombre opcional para una dependencia `amd`:

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA: MyType;
moduleA.callStuff();
```

Código *JS* generado:

```js
define(["require", "exports", "legacy/moduleA"], function (
  require,
  exports,
  moduleA
) {
  moduleA.callStuff();
});
```

## Soporte de proyectos a través de `tsconfig.json`

Agrega un archivo `tsconfig.json` en un directorio indica que el directorio es la raíz de un proyecto de *TypeScript*.
El archivo `tsconfig.json` especifica los archivos raíz y las opciones de compilación requeridas para compilar el proyecto. Un proyecto se compila de una de las siguientes maneras:

- Invocar a `tsc` sin archivos de entrada, en cuyo caso el compilador busca el archivo `tsconfig.json` comenzando en el directorio actual y continuando hacia arriba en la cadena del directorio principal.
- Invocar `tsc` sin archivos de entrada y una opción de línea de comandos `-project` (o simplemente `-p`) que especifica la ruta de un directorio que contiene un archivo `tsconfig.json`.

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "sourceMap": true
  }
}
```

Consulta la [página *wiki* de `tsconfig.json`](https://github.com/Microsoft/TypeScript/wiki/tsconfig.json) para obtener más detalles.

## Opción de línea de comandos `--rootDir`

La opción [`outDir`](/tsconfig#outDir) duplica la jerarquía de entrada en la salida.
El compilador calcula la raíz de los archivos de entrada como la ruta común más larga de todos los archivos de entrada;
y luego lo usa para replicar toda su subestructura en la salida.

A veces esto no es deseable, por ejemplo, las entradas `FolderA\FolderB\1.ts` y `FolderA\FolderB\2.ts` darían como resultado una estructura de salida que reflejara `FolderA\FolderB\`.
Ahora, si se agrega un nuevo archivo `FolderA\3.ts` a la entrada, la estructura de salida aparecerá para reflejar `FolderA\`.

[`rootDir`](/tsconfig#rootDir) especifica el directorio de entrada que se reflejará en la salida en lugar de calcularlo.

## Opción de línea de comandos `--noEmitHelpers`

El compilador de *TypeScript* emite algunos ayudantes como `__extends` cuando es necesario.
Los ayudantes se emiten en cada archivo en el que se les hace referencia.
Si deseas consolidar todos los ayudantes en un solo lugar, o redefinir el comportamiento predeterminado, usa [`noEmitHelpers`](/tsconfig#noEmitHelpers) para indicar al compilador que no los emita.

## Opción de línea de comandos `--newLine`

De manera predeterminada, el carácter de nueva línea de salida es `\r\n` en sistemas basados ​​en *Windows* y `\n` en sistemas basados ​​en `\*nix`.
[`newLine`](/tsconfig#newLine) el indicador de línea de comandos permite redefinir este comportamiento y especificar el carácter de nueva línea que se utilizará en los archivos de salida generados.

## Opciones de línea de comandos `--inlineSourceMap` e `inlineSources`

[`inlineSourceMap`](/tsconfig#inlineSourceMap) hace que los archivos de mapas fuente se escriban en línea en los archivos `.js` generados en lugar de en un archivo `.js.map` independiente.
[`inlineSources`](/tsconfig#inlineSources) permite incluir adicionalmente el archivo `.ts` fuente en él.
