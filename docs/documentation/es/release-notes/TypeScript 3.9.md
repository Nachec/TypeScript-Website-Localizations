---
title: TypeScript 3.9
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-9.html
oneline: Notas de la versión de TypeScript 3.9
---

## Mejoras en `Inference` y `Promise.all`

Las versiones recientes de *TypeScript* (alrededor de 3.7) han actualizado las declaraciones de funciones como `Promise.all` y `Promise.race`.
Desafortunadamente, eso introdujo algunas regresiones, especialmente cuando se mezclan valores con `null` o `undefined`.

```ts
interface Lion {
  roar(): void;
}

interface Seal {
  singKissFromARose(): void;
}

async function visitZoo(
  lionExhibit: Promise<Lion>,
  sealExhibit: Promise<Seal | undefined>
) {
  let [lion, seal] = await Promise.all([lionExhibit, sealExhibit]);
  lion.roar(); // uh oh
  //  ~~~~
  // El objeto posiblemente sea 'undefined'.
}
```

¡Este es un comportamiento extraño!
El hecho de que `sealExhibit` contenía un tipo de `lion` `undefined` de alguna manera envenenado para incluir `undefined`.

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/34501) de [Jack Bates](https://github.com/jablko), esto se ha solucionado con mejoras en nuestra inferencia proceso en *TypeScript 3.9*.
Lo anterior ya no son errores.
Si se ha quedado atascado en versiones anteriores de *TypeScript* debido a problemas relacionados con `Promise`s, ¡te recomendamos que pruebes 3.9!

### ¿Qué pasa con el tipo `awaited`?

Si has estado siguiendo nuestro rastreador de problemas y las notas de la reunión de diseño, es posible que tengas en cuenta algunas soluciones en torno a [un nuevo operador de tipo llamado `awaited`](https://github.com/microsoft/TypeScript/pull/35998).
El objetivo de este operador de tipo es modelar con precisión la forma en que funciona el desenvolvimiento de `Promise` en *JavaScript*.

Inicialmente anticipamos el envío `awaited` en *TypeScript 3.9*, pero como hemos ejecutado las primeras compilaciones de *TypeScript* con bases de código existente, nos hemos dado cuenta de que la función necesita más trabajo de diseño antes de que podamos implementarla para todos sin problemas.
Como resultado, hemos decidido retirar la función de nuestra rama principal hasta que nos sintamos más seguros.
Experimentaremos más con la función, pero no la enviaremos como parte de esta versión.

## Mejoras de velocidad

*TypeScript 3.9* incluye muchas mejoras de velocidad nuevas.
Nuestro equipo se ha centrado en el rendimiento después de observar una velocidad de edición/compilación extremadamente baja con paquetes como material-ui y styled-components.
Hemos profundizado aquí, con una serie de diferentes solicitudes de extracción que optimizan ciertos casos patológicos que involucran grandes uniones, intersecciones, tipos condicionales y tipos mapeados.

- https://github.com/microsoft/TypeScript/pull/36576
- https://github.com/microsoft/TypeScript/pull/36590
- https://github.com/microsoft/TypeScript/pull/36607
- https://github.com/microsoft/TypeScript/pull/36622
- https://github.com/microsoft/TypeScript/pull/36754
- https://github.com/microsoft/TypeScript/pull/36696

Cada una de estas solicitudes de extracción obtiene una reducción de aproximadamente un 5-10% en los tiempos de compilación en ciertos códigos base.
En total, creemos que hemos logrado una reducción de alrededor del 40% en el tiempo de compilación de material-ui.

También tenemos algunos cambios en la funcionalidad de cambio de nombre de archivos en escenarios del editor.
Escuchamos del equipo de *Visual Studio Code* que cuando se cambia el nombre de un archivo, solo averiguar qué declaraciones de importación se deben actualizar puede llevar entre 5 y 10 segundos.
*TypeScript 3.9* soluciona este problema al [cambiar los aspectos internos de cómo el compilador y el servicio de lenguaje almacenan en caché las búsquedas de archivos](https://github.com/microsoft/TypeScript/pull/37055).

Si bien todavía hay margen de mejora, esperamos que este trabajo se traduzca en una experiencia más ágil para todos.

## `// @ts-expect-error` Comentarios

Imagina que estamos escribiendo una biblioteca en *TypeScript* y exportamos una función llamada `doStuff` como parte de nuestra *API* pública.
Los tipos `function` declaran que se necesitan dos `string`s para que otros usuarios de *TypeScript* puedan obtener errores de verificación de tipos, pero también realiza una verificación en el entorno de ejecución (tal vez solo en compilaciones de desarrollo) para dar a los usuarios de *JavaScript* un error útil.

```ts
function doStuff(abc: string, xyz: string) {
  assert(typeof abc === "string");
  assert(typeof xyz === "string");

  // hace algunas cosas
}
```

Por lo tanto, los usuarios de *TypeScript* obtendrán un útil garabato rojo y un mensaje de error cuando hagan un mal uso de esta función, y los usuarios de *JavaScript* obtendrán un error de aserción.
Nos gustaría probar este comportamiento, así que escribiremos una prueba unitaria.

```ts
expect(() => {
  doStuff(123, 456);
}).toThrow();
```

Desafortunadamente, si nuestras pruebas están escritas en *TypeScript*, ¡*TypeScript* nos dará un error!

```ts
doStuff(123, 456);
//          ~~~
// error: El tipo 'number' no se puede asignar al tipo 'string'.
```

Es por eso que *TypeScript 3.9* trae una nueva característica: `// @ts-expect-error`.
Cuando una línea está precedida por un `//@ts-expect-error` TypeScript evitará que se reporte ese error;
pero si no hay ningún error, *TypeScript* informará que `//@ts-expect-error` no era necesario.

Como ejemplo rápido, el siguiente código está bien

```ts
// @ts-expect-error
console.log(47 * "octopus");
```

mientras que el siguiente código

```ts
// @ts-expect-error
console.log(1 + 1);
```

da como resultado el error

```
Directiva '@ts-expect-error' no utilizada.
```

Nos gustaría extender un gran agradecimiento a [Josh Goldberg](https://github.com/JoshuaKGoldberg), el colaborador que implementó esta característica.
Para obtener más información, puedes echar un vistazo a [la solicitud de extracción `ts-expect-error`](https://github.com/microsoft/TypeScript/pull/36014).

### ¿`ts-ignore` o `ts-expect-error`?

De alguna manera `//@ts-expect-error` puede actuar como una supresión de comentario, similar a `// `//@ts-ignore`.
La diferencia es que `//@ts-ignore` no hará nada si la siguiente línea no tiene errores.

Puedes tener la tentación de cambiar los comentarios `//@ts-ignore` sobre `//@ ts-expect-error`, y es posible que te preguntes cuál es el apropiado para tu código futuro.
Si bien depende completamente de ti y tu equipo, tenemos algunas ideas para elegir en ciertas situaciones.

Elige `ts-expect-error` si:

- estás escribiendo un código de prueba donde realmente deseas que el sistema de tipos produzca un error en una operación
- esperas que una solución llegue con bastante rapidez y solo necesitas una solución rápida
- estás en un proyecto de tamaño razonable con un equipo proactivo que desea eliminar la supresión de comentarios tan pronto como el código afectado vuelva a ser válido

Elige `ts-ignore` si:

- tienes un proyecto más grande y han aparecido nuevos errores en el código sin un propietario claro
- estás en medio de una actualización entre dos versiones diferentes de *TypeScript* y una línea de errores de código en una versión pero no en otra.
- honestamente, no tienes tiempo para decidir cuál de estas opciones es mejor.

## Comprobación de funciones no llamadas en expresiones condicionales

En *TypeScript 3.7* introdujimos la *comprobación de funciones no llamadas* para informar un error cuando te olvidaste de llamar a una función.

```ts
function hasImportantPermissions(): boolean {
  // ...
}

// Oops!
if (hasImportantPermissions) {
  //  ~~~~~~~~~~~~~~~~~~~~~~~
  // Esta condición siempre devolverá true ya que la función siempre está definida.
  // ¿Querías llamarla en su lugar?
  deleteAllTheImportantFiles();
}
```

Sin embargo, este error solo se aplica a las condiciones en las declaraciones `if`.
Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36402) de [Alexander Tarasyuk](https://github.com/a-tarasyuk), esta característica ahora también es compatible con la sintaxis de condicionales ternarios (es decir, `cond ? trueExpr : falseExpr`).

```ts
declare function listFilesOfDirectory(dirPath: string): string[];
declare function isDirectory(): boolean;

function getAllFiles(startFileName: string) {
  const result: string[] = [];
  traverse(startFileName);
  return result;

  function traverse(currentPath: string) {
    return isDirectory
      ? //     ~~~~~~~~~~~
        // Esta condición siempre devolverá true
        // debido a que la función siempre está definida.
        // ¿Querías llamarla en su lugar?
        listFilesOfDirectory(currentPath).forEach(traverse)
      : result.push(currentPath);
  }
}
```

https://github.com/microsoft/TypeScript/issues/36048

## Mejoras del editor

El compilador de *TypeScript* no solo potencia la experiencia de edición de *TypeScript* en la mayoría de los principales editores, sino que también potencia la experiencia de *JavaScript* en la familia de editores de *Visual Studio* y más.
El uso de la nueva funcionalidad de *TypeScript*/*JavaScript* en tu editor será diferente según tu editor, pero

- *Visual Studio Code* admite [seleccionar diferentes versiones de *TypeScript*](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Alternativamente, existe la [Extensión nocturna de *JavaScript*/*TypeScript*](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) para mantenerte a la vanguardia (que generalmente es muy estable).
- *Visual Studio 2017/2019* tiene [los instaladores de *SDK* anteriores] y [instalación de *MSBuild*](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild).
- *Sublime Text 3* admite [seleccionar diferentes versiones de *TypeScript*](https://github.com/microsoft/TypeScript-Sublime-Plugin#note-using-different-versions-of-typescript)

### Importaciones automáticas de *CommonJS* en *JavaScript*

Una gran mejora nueva es la importación automática de archivos *JavaScript* mediante módulos *CommonJS*.

En versiones anteriores, *TypeScript* siempre asumió que, independientemente de tu archivo, deseabas una importación de estilo *ECMAScript* como

```js
import * as fs from "fs";
```

Sin embargo, no todo el mundo está apuntando a módulos de estilo *ECMAScript* al escribir archivos *JavaScript*.
Muchos usuarios todavía usan el estilo de importaciones `require(...)` de *CommonJS* tal como

```js
const fs = require("fs");
```

*TypeScript* ahora detecta automáticamente los tipos de importaciones que estás utilizando para mantener el estilo de tu archivo limpio y consistente.

<video src="https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/ERkaliGU0AA5anJ1.mp4"></video>

Para obtener más detalles sobre el cambio, consulta [la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/37027).

### Las acciones de código conservan las líneas nuevas

Las refactorizaciones y las correcciones rápidas de *TypeScript* a menudo no hicieron un gran trabajo a la hora de preservar las nuevas líneas.
Como ejemplo realmente básico, toma el siguiente código.

```ts
const maxValue = 100;

/*start*/
for (let i = 0; i <= maxValue; i++) {
  // Primero obtiene el valor al cuadrado.
  let square = i ** 2;

  // Ahora imprime el valor al cuadrado.
  console.log(square);
}
/*end*/
```

Si resaltamos el rango desde `/* start */` hasta `/* end */` en nuestro editor para extraer una nueva función, terminaríamos con un código como el siguiente.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
  for (let i = 0; i <= maxValue; i++) {
    // Primero obtiene el valor al cuadrado.
    let square = i ** 2;
    // Ahora imprime el valor al cuadrado.
    console.log(square);
  }
}
```

![Extraer el bucle for a una función en versiones anteriores de TypeScript. No se conserva una nueva línea](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithoutNewlines-3.9.gif.gif).

Eso no es ideal ⏤ teníamos una línea en blanco entre cada declaración en nuestro bucle `for`, ¡pero la refactorización se deshizo de ella!
*TypeScript 3.9* hace un poco más de trabajo para preservar lo que escribimos.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
  for (let i = 0; i <= maxValue; i++) {
    // Primero obtiene el valor al cuadrado.
    let square = i ** 2;

    // Ahora imprime el valor al cuadrado.
    console.log(square);
  }
}
```

![Extraer el bucle for a una función en TypeScript 3.9. Se conserva una nueva línea.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithNewlines-3.9.gif.gif)

Puedes ver más sobre la implementación [en esta solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36688)

### Soluciones rápidas para expresiones de retorno faltantes

Hay ocasiones en las que podríamos olvidarnos de devolver el valor de la última declaración en una función, especialmente cuando agregamos llaves a las funciones de flecha.

```ts
// antes
let f1 = () => 42;

// Oops - ¡no es el mismo!
let f1 = () => 42;
  42;
};
```

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/26434) del miembro de la comunidad [Wenlu Wang](https://github.com/Kingwl), *TypeScript* puede proporcionar una solución rápida para agregar declaraciones `return` faltantes, eliminar llaves o agregar paréntesis a los cuerpos de las funciones de flecha que, sospechosamente, se parecen a objetos literales.

![TypeScript corrige un error en el que no se devuelve ninguna expresión agregando una declaración `return` o quitando llaves](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/04/missingReturnValue-3-9.gif)

### Archivos de "Solución de estilo" `tsconfig.json`

Los editores deben averiguar a qué archivo de configuración pertenece un archivo para que puedan aplicar las opciones adecuadas y averiguar qué otros archivos están incluidos en el "proyecto" actual.
De forma predeterminada, los editores con tecnología del servidor de lenguaje *TypeScript* hacen esto recorriendo cada directorio principal para encontrar un `tsconfig.json`.

Un caso en el que esto se derrumbó ligeramente es cuando un `tsconfig.json` simplemente existía para hacer referencia a otros archivos `tsconfig.json`.

```jsonc tsconfig
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.shared.json" },
    { "path": "./tsconfig.frontend.json" },
    { "path": "./tsconfig.backend.json" }
  ]
}
```

Este archivo que realmente no hace nada más que administrar otros archivos de proyecto a menudo se denomina "solución" en algunos entornos.
Aquí, ninguno de estos archivos `tsconfig.*.json` es recogido por el servidor, pero realmente nos gustaría que el lenguaje del servidor entendiera que el archivo `.ts` actual probablemente pertenece a uno de los proyectos mencionados en este `tsconfig.json` raíz.

*TypeScript 3.9* agrega soporte para editar escenarios para esta configuración.
Para obtener más detalles, echa un vistazo a [la solicitud de extracción que agregó esta funcionalidad](https://github.com/microsoft/TypeScript/pull/37239).

## Ruptura por cambios

### Análisis de las diferencias en el encadenamiento opcional y las aserciones no nulas

*TypeScript* implementó recientemente el operador de encadenamiento opcional, pero hemos recibido comentarios de los usuarios de que el comportamiento del encadenamiento opcional (`?.`) con el operador de aserción no nulo (`!`) es extremadamente contrario a la intuición.

Específicamente, en versiones anteriores, el código

```ts
foo?.bar!.baz;
```

se interpretó como equivalente al siguiente *JavaScript*.

```js
(foo?.bar).baz;
```

En el código anterior, los paréntesis detienen el comportamiento de "cortocircuito" del encadenamiento opcional, por lo que si `foo` es `undefined`, acceder a `baz` provocará un error en el entorno de ejecución.

El equipo de *Babel* que señaló este comportamiento, y la mayoría de los usuarios que nos proporcionaron comentarios, creen que este comportamiento es incorrecto.
¡Nosotros también!
Lo que más escuchamos fue que el operador `!` simplemente debería "desaparecer" ya que la intención era eliminar `null` y `undefined` del tipo `bar`.

En otras palabras, la mayoría de las personas consideró que el fragmento original se debería interpretar como

```js
foo?.bar.baz;
```

que solo se evalúa como `undefined` cuando `foo` es `undefined`.

Este es un cambio importante, pero creemos que la mayor parte del código se escribió con la nueva interpretación en mente.
Los usuarios que deseen volver al comportamiento anterior pueden agregar paréntesis explícitos alrededor del lado izquierdo del operador `!`.

```ts
foo?.bar!.baz;
```

### `}` y `>` ahora son caracteres de texto *JSX* no válidos

La Especificación *JSX* prohíbe el uso de los caracteres `}` y `>` en las posiciones de texto.
*TypeScript* y *Babel* han decidido hacer cumplir esta regla para ser más congruentes.
La nueva forma de insertar estos caracteres es utilizar un código de escape *HTML* (por ejemplo, `<span>2 &gt; 1</div>`) o insertar una expresión con una cadena literal (por ejemplo, `<span>2 {">"} 1</div>`).

Afortunadamente, gracias a la [solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36636) que aplica esto de [Brad Zacher](https://github.com/bradzacher), obtendrá un mensaje de error en la línea de

```
Unexpected token. Did you mean `{'>'}` or `&gt;`?
Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

Por ejemplo:

```tsx
let directions = <span>Navigate to: Menu Bar > Tools > Options</span>;
//                                           ~       ~
// Unexpected token. Did you mean `{'>'}` or `&gt;`?
```

Ese mensaje de error vino con una práctica solución rápida, y gracias a [Alexander Tarasyuk](https://github.com/a-tarasyuk), [puedes aplicar estos cambios de forma masiva](https://github.com/microsoft/TypeScript/pull/37436) si tienes muchos errores.

### Controles más estrictos en intersecciones y propiedades opcionales

Generalmente, un tipo de intersección como `A & B` se puede asignar a `C` si `A` o `B` se pueden asignar a `C`; sin embargo, a veces eso tiene problemas con las propiedades opcionales.
Por ejemplo, toma lo siguiente:

```ts
interface A {
  a: number; // nota que este es el 'number'
}

interface B {
  b: string;
}

interface C {
  a?: boolean; // nota que esto es 'boolean'
  b: string;
}

declare let x: A & B;
declare let y: C;

y = x;
```

En versiones anteriores de *TypeScript*, esto estaba permitido porque mientras que `A` era totalmente incompatible con `C`, `B` *era* compatible con `C`.

En *TypeScript 3.9*, siempre que cada tipo en una intersección sea un tipo de objeto concreto, el sistema de tipos considerará todas las propiedades a la vez.
Como resultado, *TypeScript* verá que la propiedad `a` de `A & B` es incompatible con la de `C`:

```
El tipo 'A & B' no se puede asignar al tipo 'C'.
  Los tipos de la propiedad 'a' son incompatibles.
    El tipo 'number' no se puede asignar al tipo 'boolean | undefined'.
```

Para obtener más información sobre este cambio, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/37195).

### Intersecciones reducidas por propiedades discriminantes

Hay algunos casos en los que puedes terminar con tipos que describen valores que simplemente no existen.
Por ejemplo

```ts
declare function smushObjects<T, U>(x: T, y: U): T & U;

interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

declare let x: Circle;
declare let y: Square;

let z = smushObjects(x, y);
console.log(z.kind);
```

Este código es un poco extraño porque realmente no hay forma de crear una intersección de un `Circle` y un `Square` ⏤ tienen dos campos de `kind` incompatibles.
En versiones anteriores de *TypeScript*, este código estaba permitido y el tipo de `kind` en sí mismo era `never` porque `"circle" & "square"` describía un conjunto de valores que nunca (`never`) podrían existir.

En *TypeScript 3.9*, el sistema de tipos es más agresivo aquí ⏤ se da cuenta de que es imposible intersecar `Circle` y `Square` debido a sus propiedades `kind`.
Entonces, en lugar de contraer el tipo de `z.kind` a `never`, colapsa el tipo de `z` en sí mismo (`Circle & Square`) a `never`.
Eso significa que el código anterior ahora tiene errores con:

```
La propiedad 'kind' no existe en el tipo 'never'.
```

La mayoría de las rupturas que observamos parecen corresponder con declaraciones de tipo ligeramente incorrectas.
Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/36696).

### Los Captadores/Definidores ya no son enumerables

En versiones anteriores de *TypeScript*, los descriptores de acceso `get` y `set` en las clases se emitían de una manera que los hacía enumerables; sin embargo, esto no cumplía con la especificación *ECMAScript* que establece que deben ser no enumerables.
Como resultado, el código *TypeScript* dirigido a *ES5* y *ES2015* podría diferir en su comportamiento.

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32264) del usuario de *GitHub* [*pathurs*](https://github.com/pathurs), *TypeScript 3.9* ahora se ajusta mejor a *ECMAScript* a este respecto.

### Parámetros de tipo que extienden a `any` ya no actúan como `any`

En versiones anteriores de *TypeScript*, un parámetro de tipo restringido a `any` se podía tratar como `any`.

```ts
function foo<T extends any>(arg: T) {
  arg.spfjgerijghoied; // ¡No hay error!
}
```

Esto fue un descuido, por lo que *TypeScript 3.9* adopta un enfoque más conservador y emite un error en estas operaciones cuestionables.

```ts
function foo<T extends any>(arg: T) {
  arg.spfjgerijghoied;
  //  ~~~~~~~~~~~~~~~
  // La propiedad 'spfjgerijghoied' no existe en el tipo 'T'.
}
```

### `export *` se conserva siempre

En versiones anteriores de *TypeScript*, declaraciones como `export * from "foo"` se eliminarían en nuestra salida de *JavaScript* si `foo` no exportara ningún valor.
Este tipo de emisión es problemático porque está dirigido por tipos y *Babel* no lo puede emular.
*TypeScript 3.9* siempre emitirá estas declaraciones `export *`.
En la práctica, no esperamos que esto rompa gran parte del código existente.

### Más mejoras de `libdom.d.ts`

Continuamos moviendo más de la biblioteca `.d.ts` incorporada de *TypeScript* (`lib.d.ts` y familia) para que se generen a partir de archivos *Web IDL* directamente desde la especificación *DOM*.
Como resultado, se han eliminado algunos tipos específicos de proveedores relacionados con el acceso a los medios.

Agregar este archivo a un ambiente `*.d.ts` a tu proyecto los traerá de vuelta:

<!-- prettier-ignore -->
```ts
interface AudioTrackList {
     [Symbol.iterator](): IterableIterator<AudioTrack>;
 }

interface HTMLVideoElement {
  readonly audioTracks: AudioTrackList

  msFrameStep(forward: boolean): void;
  msInsertVideoEffect(activatableClassId: string, effectRequired: boolean, config?: any): void;
  msSetVideoRectangle(left: number, top: number, right: number, bottom: number): void;
  webkitEnterFullScreen(): void;
  webkitEnterFullscreen(): void;
  webkitExitFullScreen(): void;
  webkitExitFullscreen(): void;

  msHorizontalMirror: boolean;
  readonly msIsLayoutOptimalForPlayback: boolean;
  readonly msIsStereo3D: boolean;
  msStereo3DPackingMode: string;
  msStereo3DRenderMode: string;
  msZoom: boolean;
  onMSVideoFormatChanged: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onMSVideoFrameStepCompleted: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onMSVideoOptimalLayoutChanged: ((this: HTMLVideoElement, ev: Event) => any) | null;
  webkitDisplayingFullscreen: boolean;
  webkitSupportsFullscreen: boolean;
}

interface MediaError {
  readonly msExtendedCode: number;
  readonly MS_MEDIA_ERR_ENCRYPTED: number;
}
```
