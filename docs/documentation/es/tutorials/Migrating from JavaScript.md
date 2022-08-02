---
title: Migrar desde JavaScript
layout: docs
permalink: /docs/handbook/migrating-from-javascript.html
oneline: Cómo migrar de JavaScript a TypeScript
---

*TypeScript* no existe en el vacío.
Fue construido con el ecosistema de *JavaScript* en mente, y hoy día existe una gran cantidad de *JavaScript*.
Convertir un código base de *JavaScript* en *TypeScript* es, aunque algo tedioso, por lo general no es un desafío.
En este tutorial, veremos cómo podrías comenzar.
Suponemos que has leído lo suficiente del manual para escribir un nuevo código *TypeScript*.

Si estás buscando convertir un proyecto de *React*, te recomendamos que  primero consultes la [Guía de conversión de *React*](https://github.com/Microsoft/TypeScript-React-Conversion-Guide#typescript-react-conversion-guide).

## Configurar tus directorios

Si estás escribiendo en *JavaScript* puro, es probable que estés ejecutando tu *JavaScript* directamente,
donde tus archivos `.js` están en un directorio `src`, `lib` o `dist`, y luego se ejecutan como se desee.

Si ese es el caso, los archivos que has escrito se usarán como entrada para *TypeScript* y ejecutarás la salida que produce.
Durante nuestra migración de *JS* a *TS*, necesitaremos separar nuestros archivos de entrada para evitar que *TypeScript* los sobrescriba.
Si tus archivos de salida necesitan residir en un directorio específico, entonces ese será tu directorio de salida.

Es posible que también estés ejecutando algunos pasos intermedios en tu *JavaScript*, tal como agrupar o usar otro transpilador como *Babel*.
En este caso, es posible que ya tengas configurada una estructura de directorios como esta.

A partir de este punto, asumiremos que tu directorio está configurado de esta manera:

```
projectRoot
├── src
│   ├── file1.js
│   └── file2.js
├── built
└── tsconfig.json
```

Si tienes un directorio `tests` fuera de tu directorio `src`, es posible que tengas un `tsconfig.json` en `src` y otro en `tests` también.

## Escribir un archivo de configuración

*TypeScript* usa un archivo llamado `tsconfig.json` para administrar las opciones de tu proyecto, como qué archivos deseas incluir y qué tipo de verificación deseas realizar.
Creemos uno básico para nuestro proyecto:

```json
{
  "compilerOptions": {
    "outDir": "./built",
    "allowJs": true,
    "target": "es5"
  },
  "include": ["./src/**/*"]
}
```

Aquí estamos especificando algunas cosas para *TypeScript*:

1. Lee cualquier archivo que entiendas en el directorio `src` (con [`include`](/tsconfig#include)).
2. Acepta archivos *JavaScript* como entradas (con [`allowJs`](/tsconfig#allowJs)).
3. Emite todos los archivos de salida en `built` (con [`outDir`](/tsconfig#outDir)).
4. Traduce las construcciones de *JavaScript* más recientes a una versión anterior como *ECMAScript 5* (usando [`target`](/tsconfig#target)).

En este punto, si intentas ejecutar `tsc` en la raíz de tu proyecto, deberías ver los archivos de salida en el directorio `built`.
El diseño de los archivos en `built` se debería ver idéntico al diseño de `src`.
Ahora deberías tener *TypeScript* trabajando con tu proyecto.

## Beneficios tempranos

Incluso en este punto, puedes obtener grandes beneficios de que *TypeScript* comprenda tu proyecto.
Si abres un editor como [*VS Code*](https://code.visualstudio.com) o [*Visual Studio*](https://visualstudio.com), verás que a menudo puedes obtener soporte de herramientas como completado.
También puedes detectar ciertos errores con opciones como:

- [`noImplicitReturns`](/tsconfig#noImplicitReturns) que evita que te olvides de regresar al final de una función.
- [`noFallthroughCasesInSwitch`](/tsconfig#noFallthroughCasesInSwitch) que es útil si nunca quieres olvidar una declaración `break` entre `case`s en un bloque `switch`.

*TypeScript* también advertirá sobre código y etiquetas inalcanzables, que puedes desactivar con [`allowUnreachableCode`](/tsconfig#allowUnreachableCode) y [`allowUnusedLabels`](/tsconfig#allowUnusedLabels) respectivamente.

## Integrar herramientas de compilación

Es posible que tengas algunos pasos de compilación más en tu canalización.
Quizás concatenas algo a cada uno de tus archivos.
Cada herramienta de construcción es diferente, pero haremos todo lo posible para cubrir la esencia de las cosas.

## Gulp

Si estás usando `Gulp` de alguna manera, tenemos un tutorial sobre [cómo usar `Gulp`](/docs/handbook/gulp.html) con *TypeScript* y cómo integrarse con herramientas de compilación comunes como `Browserify`, `Babelify` y `Uglify`.
Puedes leer más allí.

## `Webpack`

La integración de `Webpack` es bastante simple.
Puedes usar `ts-loader`, un cargador de *TypeScript*, combinado con `source-map-loader` para facilitar la depuración.
Simplemente corre

```shell
npm install ts-loader source-map-loader
```

y combina las siguientes opciones en tu archivo `webpack.config.js`:

```js
module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "./dist/bundle.js",
  },

  // Habilita `sourcemaps` para depurar la salida de `webpack`.
  devtool: "source-map",

  resolve: {
    // Agrega '.ts' y '.tsx' como extensiones que se pueden resolver.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      // Todos los archivos con una extensión '.ts' o '.tsx' serán manejados por 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },

      // Todos los archivos de salida '.js' tendrán `sourcemaps` reprocesados ​​por 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },

  // Otras opciones...
};
```

Es importante tener en cuenta que `ts-loader` se deberá ejecutar antes que cualquier otro cargador que se ocupe de archivos `.js`.

Lo mismo ocurre con [`awesome-typescript-loader`](https://github.com/TypeStrong/ts-loader), otro cargador de *TypeScript* para `Webpack`.
Puedes leer más sobre las diferencias entre los dos [aquí](https://github.com/s-panferov/awesome-typescript-loader#differences-between-ts-loader).

Puedes ver un ejemplo del uso de `Webpack` en nuestro [tutorial sobre *React* y `Webpack`](/docs/handbook/react-&-webpack.html).

## Pasar a archivos `TypeScript`

En este punto, probablemente estés listo para comenzar a usar archivos `TypeScript`.
El primer paso es cambiar el nombre de uno de tus archivos `.js` a `.ts`.
Si tu archivo usa *JSX*, deberás cambiarle el nombre a `.tsx`.

¿Terminaste con ese paso?
¡Excelente!
¡Has migrado correctamente un archivo de *JavaScript* a *TypeScript*!

Por supuesto, puede que eso no se sienta bien.
Si abres ese archivo en un editor compatible con *TypeScript* (o si ejecutas `tsc --pretty`), es posible que veas garabatos rojos en ciertas líneas.
Deberías pensar en ellos de la misma manera que pensarías en garabatos rojos en un editor como *Microsoft Word*.
*TypeScript* seguirá traduciendo tu código, al igual que *Word* te permitirá imprimir tus documentos.

Si eso te parece demasiado laxo, puedes endurecer ese comportamiento.
Si, por ejemplo, *no* deseas que *TypeScript* se compile en *JavaScript* ante errores, puedes usar la opción [`noEmitOnError`](/tsconfig#noEmitOnError).
En ese sentido, *TypeScript* tiene un dial en su rigurosidad, y puedes subir esa perilla tan alto como quieras.

Si planeas usar las configuraciones más estrictas que están disponibles, es mejor activarlas ahora (consulta [Cómo obtener comprobaciones más estrictas](#como-obtener-comprobaciones-mas-estrictas) a continuación).
Por ejemplo, si quieres que *TypeScript* nunca infiera silenciosamente `any` para un tipo sin que lo digas explícitamente, puedes usar [`noImplicitAny`](/tsconfig#noImplicitAny) antes de comenzar a modificar tus archivos.
Si bien puede parecer algo abrumador, las ganancias a largo plazo se hacen evidentes mucho más rápidamente.

## Eliminar errores

Como mencionamos, no es inesperado recibir mensajes de error después de la conversión.
Lo importante es revisarlos uno por uno y decidir cómo lidiar con los errores.
A menudo, estos serán errores legítimos, pero a veces tendrás que explicar un poco mejor lo que estás tratando de hacer con *TypeScript*.

### Importar desde módulos

Es posible que empieces a recibir un montón de errores como `No se puede encontrar el nombre 'requiere'` y `No se puede encontrar el nombre 'define'`.
En estos casos, es probable que estés utilizando módulos.
Si bien puedes convencer a *TypeScript* de que existen escribiendo

```ts
// para Node/CommonJS
declare function require(path: string): any;
```

o

```ts
// Para RequireJS/AMD
declare function define(...args: any[]): any;
```

es mejor deshacerse de esas llamadas y usar la sintaxis de *TypeScript* para las importaciones.

Primero, necesitarás habilitar algún sistema de módulos configurando la opción [`module`](/tsconfig#module) de *TypeScript*.
Las opciones válidas son `commonjs`, `amd`, `system` y `umd`.

Si tenías el siguiente código *Node*/*CommonJS*:

```js
var foo = require("foo");

foo.doStuff();
```

o el siguiente código *RequireJS*/*AMD*:

```js
define(["foo"], function (foo) {
  foo.doStuff();
});
```

entonces escribirías el siguiente código *TypeScript*:

```ts
import foo = require("foo");

foo.doStuff();
```

### Obtener archivos de declaración

Si comenzaste a realizar la conversión a importaciones de *TypeScript*, probablemente te encontrarás con errores como `No se puede encontrar el módulo 'foo'`.
El problema aquí es que probablemente no tengas *archivos de declaración* para describir tu biblioteca.
Afortunadamente, esto es bastante sencillo.
Si *TypeScript* se queja de un paquete como `lodash`, puedes escribir

```shell
npm install -S @types/lodash
```

Si estás utilizando una opción de módulo que no sea `commonjs`, deberás configurar tu opción [`moduleResolution`](/tsconfig#moduleResolution) en `node`.

Después de eso, podrás importar `lodash` sin problemas y obtener completado preciso.

### Exportar desde módulos

Normalmente, exportar desde un módulo implica agregar propiedades a un valor como `exports` o `mudule.exports`.
*TypeScript* te permite utilizar declaraciones de exportación de nivel superior.
Por ejemplo, si exportaste una función como esta:

```js
module.exports.feedPets = function (pets) {
  // ...
};
```

podrías escribir eso de la siguiente manera:

```ts
export function feedPets(pets) {
  // ...
}
```

A veces, sobrescribirás por completo el objeto de exportación.
Este es un patrón común que la gente usa para hacer que sus módulos se puedan llamar inmediatamente, como en este fragmento:

```js
var express = require("express");
var app = express();
```

Es posible que lo hayas escrito anteriormente así:

```js
function foo() {
  // ...
}
module.exports = foo;
```

En *TypeScript*, puedes modelar esto con la construcción `export =`.

```ts
function foo() {
  // ...
}
export = foo;
```

### Demasiados/muy pocos argumentos

A veces te encontrarás llamando a una función con demasiados/pocos argumentos.
Por lo general, esto es un error, pero en algunos casos, es posible que hayas declarado una función que usa el objeto `arguments` en lugar de escribir cualquier parámetro:

```js
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}

myCoolFunction(
  function (x) {
    console.log(x);
  },
  [1, 2, 3, 4]
);
myCoolFunction(
  function (x) {
    console.log(x);
  },
  1,
  2,
  3,
  4
);
```

En este caso, necesitamos usar *TypeScript* para decirle a cualquiera de nuestras invocantes sobre las formas en que se puede llamar a `myCoolFunction` usando sobrecarga de funciones.

```ts
function myCoolFunction(f: (x: number) => void, nums: number[]): void;
function myCoolFunction(f: (x: number) => void, ...nums: number[]): void;
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}
```

Agregamos dos firmas de sobrecarga a `myCoolFunction`.
La primera comprobación indica que "myCoolFunction" toma una función (que toma un `number`) y luego una lista de `number``.
El segundo dice que también tomará una función, y luego usa un parámetro `rest` (`...nums`) para indicar que cualquier número de argumentos después de ese debe ser `number`s.

### Propiedades agregadas secuencialmente

A algunas personas les resulta más agradable desde el punto de vista estético crear un objeto y agregar propiedades inmediatamente después, así:

```js
var options = {};
options.color = "red";
options.volume = 11;
```

*TypeScript* dirá que no puedes asignar a `color` y `volume` porque primero descubrió el tipo de `options` como `{}` que no tiene ninguna propiedad.
Si, en cambio, movieras las declaraciones al objeto literal, no obtendrías errores:

```ts
let options = {
  color: "red",
  volume: 11,
};
```

También puedes definir el tipo de `options` y agregar una aserción de tipo en el objeto literal.

```ts
interface Options {
  color: string;
  volume: number;
}

let options = {} as Options;
options.color = "red";
options.volume = 11;
```

Alternativamente, puedes decir que `options` tiene el tipo `any`, que es lo más fácil de hacer, pero lo que menos te beneficiará.

### `any`, `Object` y `{}`

Puedes tener la tentación de usar `Object` o `{}` para decir que un valor puede tener cualquier propiedad porque `Object` es, para la mayoría de los propósitos, el tipo más general.
Sin embargo, **`any` en realidad es el tipo que deseas usar** en esas situaciones, ya que es el tipo más *flexible*.

Por ejemplo, si tienes algo tipado como `Object`, no podrás llamar a métodos como `toLowerCase()` en él.
Por lo general, ser más general significa que puedes hacer menos con un tipo, pero `any` es especial porque es el tipo más general y, al mismo tiempo, te permite hacer cualquier cosa con él.
Eso significa que lo puedes llamar, construir, acceder a sus propiedades, etc.
Sin embargo, ten en cuenta que cada vez que usas `any`, pierdes la mayor parte de la comprobación de errores y la compatibilidad con el editor que *TypeScript* te brinda.

Si alguna vez una decisión se reduce a `Object` y `{}`, deberías preferir `{}`.
Si bien en su mayoría son iguales, técnicamente `{}` es un tipo más general que `Object` en ciertos casos esotéricos.

## Cómo obtener comprobaciones más estrictas

*TypeScript* viene con ciertas comprobaciones para brindarte más seguridad y análisis de tu programa.
Una vez que hayas convertido tu código base a *TypeScript*, puedes comenzar a habilitar estas comprobaciones para una mayor seguridad.

### Sin `any` implícito

Hay ciertos casos en los que *TypeScript* no puede determinar cuáles deberían ser ciertos tipos.
Para ser lo más indulgente posible, decidirá utilizar el tipo `any` en su lugar.
Si bien esto es excelente para la migración, usar `any` significa que no obtendrás ningún tipo de seguridad y no obtendrás el mismo soporte de herramientas que obtendrías en otros lugares.
Puedes decirle a *TypeScript* que marque estas ubicaciones y dé un error con la opción [`noImplicitAny`](/tsconfig#noImplicitAny).

### Comprobación  estricta de `null` y `undefined`

De forma predeterminada, *TypeScript* asume que `null` y `undefined` están en el dominio de todos los tipos.
Eso significa que cualquier cosa declarada con el tipo `number` podría ser `null` o `undefined`.
Dado que `null` y `undefined` son una fuente de errores tan frecuente en *JavaScript* y *TypeScript*, *TypeScript* tiene la opción [`strictNullChecks`](/tsconfig#strictNullChecks) para evitarte el estrés de preocuparte por estos problemas.

Cuando [`strictNullChecks`](/tsconfig#strictNullChecks) está habilitado, `null` y `undefined` obtienen sus propios tipos llamados `null` y `undefined` respectivamente.
Siempre que algo *posiblemente* sea `null`, puedes usar un tipo unión con el tipo original.
Entonces, por ejemplo, si algo pudiera ser un `number` o un `null`, escribirías el tipo como `number | null`.

Si alguna vez tienes un valor que *TypeScript* piensa que posiblemente es `null`/`undefined`, pero lo sabes mejor, puedes usar el operador `!` posfijo para indicar lo contrario.

```ts
declare var foo: string[] | null;

foo.length; // error - 'foo' posiblemente es  'null'

foo!.length; // bien - 'foo!' solo tiene el tipo 'string[]'
```

Como aviso, al usar [`strictNullChecks`](/tsconfig#strictNullChecks), es posible que sus dependencias deban actualizarse para usar [`strictNullChecks`](/tsconfig#strictNullChecks) también.

### No hay `any` implícito para `this`

Cuando usas la palabra clave `this` fuera de las clases, tienes el tipo `any` por omisión.
Por ejemplo, imagina una clase `Point` e imagina una función que deseamos agregar como método:

```ts
class Point {
  constructor(public x, public y) {}
  getDistance(p: Point) {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}
// ...

// Reabre la interfaz.
interface Point {
  distanceFromOrigin(): number;
}
Point.prototype.distanceFromOrigin = function () {
  return this.getDistance({ x: 0, y: 0 });
};
```

Esto tiene los mismos problemas que mencionamos anteriormente ⏤ fácilmente podríamos haber escrito mal `getDistance` y no haber obtenido un error.
Por esta razón, *TypeScript* tiene la opción [`noImplicitThis`](/tsconfig#noImplicitThis).
Cuando se establece esa opción, *TypeScript* emitirá un error cuando se use `this` sin un tipo explícito (o inferido).
La solución es usar un parámetro `this` para dar un tipo explícito en la interfaz o en la función misma:

```ts
Point.prototype.distanceFromOrigin = función (esto: Point) {
  return this.getDistance({ x: 0, y: 0 });
};
```
