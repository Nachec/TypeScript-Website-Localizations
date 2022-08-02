---
title: Gulp
layout: docs
permalink: /docs/handbook/gulp.html
oneline: Usar TypeScript con Gulp
deprecated: true
---

Esta guía de inicio rápido te enseñará cómo construir *TypeScript* con [`gulp`](http://gulpjs.com) y luego agrega [`Browserify`](http://browserify.org), [`terser`](http://terser.org) o [`Watchify`](https://github.com/substack/watchify) para la canalización de `gulp`.
Esta guía también muestra cómo agregar la funcionalidad [`Babel`](https://babeljs.io/) usando [`Babelify`](https://github.com/babel/babelify).

Suponemos que ya estás utilizando [*Node.js*](https://nodejs.org/) con [`npm`](https://www.npmjs.com/).

## Proyecto mínimo

Comencemos con un nuevo directorio.
Lo llamaremos `proj` por ahora, pero puedes cambiarlo a lo que quieras.

```shell
mkdir proj
cd proj
```

Para empezar, vamos a estructurar nuestro proyecto de la siguiente manera:

```
proj/
   ├─ src/
   └─ dist/
```

Los archivos de *TypeScript* comenzarán en tu directorio `src`, se ejecutarán a través del compilador de *TypeScript* y terminarán en `dist`.

Hagamos un andamio para esto:

```shell
mkdir src
mkdir dist
```

## Inicia el proyecto

Ahora convertiremos este directorio en un paquete `npm`.

```shell
npm init
```

Se te dará una serie de indicaciones.
Puedes utilizar los valores predeterminados excepto tu punto de entrada.
Para tu punto de entrada, usa `./dist/main.js`.
Siempre puedes volver atrás y cambiarlos en el archivo `package.json` que se generó para ti.

## Instala nuestras dependencias

Ahora podemos usar `npm install` para instalar paquetes.
Primero instala `gulp-cli` globalmente (si usas un sistema Unix, es posible que debas anteponer `sudo` a los comandos `npm install` en esta guía).

```shell
npm install -g gulp-cli
```

Luego instala `typescript`, `gulp` y `gulp-typescript` en las dependencias de desarrollo de tu proyecto.
[`Gulp-typescript`](https://www.npmjs.com/package/gulp-typescript) es un complemento de `gulp` para *TypeScript*.

```shell
npm install --save-dev typescript gulp@4.0.0 gulp-typescript
```

## Escribe un sencillo ejemplo

Escribamos un programa Hello World.
En `src`, crea el archivo `main.ts`:

```ts
function hola(compiler: string) {
  console.log(`Hola desde ${compiler}`);
}
hola("TypeScript");
```

En la raíz del proyecto, `proj`, crea el archivo `tsconfig.json`:

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

## Crea un `gulpfile.js`

En la raíz del proyecto, crea el archivo `gulpfile.js`:

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});
```

## Prueba la aplicación

```shell
gulp
node dist/main.js
```

El programa debería imprimir "¡Hola desde TypeScript!".

## Agregar módulos al código

Antes de llegar a `Browserify`, construyamos nuestro código y agreguemos módulos a la mezcla.
Esta es la estructura que es más probable que uses para una aplicación real.

Crea un archivo llamado `src/greet.ts`:

```ts
export function sayHello(name: string) {
  return `Hola desde ${name}`;
}
```

Ahora cambia el código en `src/main.ts` para importar `sayHello` de `greet.ts`:

```ts
import { sayHello } from "./greet";

console.log(sayHello("TypeScript"));
```

Finalmente, agrega `src/greet.ts` a `tsconfig.json`:

```json tsconfig
{
  "files": ["src/main.ts", "src/greet.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

Asegúrate de que los módulos funcionen ejecutando `gulp` y luego pruébalo en *Node*:

```shell
gulp
node dist/main.js
```

Ten en cuenta que aunque usamos la sintaxis del módulo *ES2015*, *TypeScript* emitió módulos *CommonJS* que usan *Node*.
Nos quedaremos con *CommonJS* para este tutorial, pero puedes establecer `module` en el objeto `options` para cambiar esto.

## `Browserify`

Ahora movamos este proyecto de *Node* al navegador.
Para hacer esto, nos gustaría agrupar todos nuestros módulos en un archivo *JavaScript*.
Afortunadamente, eso es exactamente lo que hace `Browserify`.
Aún mejor, nos permite usar el sistema de módulos `CommonJS` utilizado por *Node*, que es la emisión predeterminada de *TypeScript*.
Eso significa que nuestra configuración de *TypeScript* y *Node* se transferirá al navegador básicamente sin cambios.

Primero, instala `browserify`, [`tsify`](https://www.npmjs.com/package/tsify) y `vinyl-source-stream`.
`tsify` es un complemento de `Browserify` que, como `gulp-typescript`, da acceso al compilador de *TypeScript*.
`vinyl-source-stream` nos permite adaptar la salida del archivo de `Browserify` a un formato que `gulp` entiende llamado [`vinyl`](https://github.com/gulpjs/vinyl).

```shell
npm install --save-dev browserify tsify vinyl-source-stream
```

## Crea una pagina

Crea un archivo en `src` llamado `index.html`:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>¡Hello World!</title>
  </head>
  <body>
    <p id="greeting">Cargando...</p>
    <script src="bundle.js"></script>
  </body>
</html>
```

Ahora cambie `main.ts` para actualizar la página:

```ts
import { sayHello } from "./greet";

function showHello(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");
```

Llamar a `showHello` llama a `sayHello` para cambiar el texto del párrafo.
Ahora cambia tu archivo `gulp` a lo siguiente:

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(gulp.dest("dist"));
  })
);
```

Esto agrega la tarea `copy-html` y la agrega como una dependencia de `default`.
Eso significa que cada vez que se ejecutas `default`, `copy-html` se debe ejecutar primero.
También cambiamos `default` para llamar a `Browserify` con el complemento `tsify` en lugar de `gulp-typescript`.
Convenientemente, ambos nos permiten pasar el mismo objeto de opciones al compilador de *TypeScript*.

Después de llamar a `bundle` usamos `source` (nuestro alias para `vinyl-source-stream`) para nombrar nuestro paquete de salida `bundle.js`.

Prueba la página ejecutando gulp y luego abriendo `dist/index.html` en un navegador.
Deberías ver "Hola desde *TypeScript*" en la página.

Observa que especificamos `debug: true` a `Browserify`.
Esto hace que `tsify` emita `sourcemaps` dentro del archivo *JavaScript* incluido.
Los `sourcemaps` te permiten depurar tu código *TypeScript* original en el navegador en lugar del *JavaScript* incluido.
Puedes probar que los `sourcemaps` funcionan abriendo el depurador de tu navegador y poniendo un punto de interrupción dentro de `main.ts`.
Cuando actualizas la página, el punto de interrupción debe pausar la página y permitirte depurar `greet.ts`.

## Watchify, Babel y Terser

Ahora que estamos empaquetando nuestro código con `Browserify` y `tsify`, podemos agregar varias funciones a nuestra compilación con los complementos de `browserify`.

- `Watchify` comienza `gulp` y lo mantiene en ejecución, compilando de forma incremental cada vez que guardas un archivo.
  Esto te permite mantener un bucle de edición, guardado y actualización en el navegador.

- `Babel` es un compilador enormemente flexible que convierte *ES2015* y más allá en *ES5* y *ES3*.
  Esto te permite agregar transformaciones extensas y personalizadas que *TypeScript* no admite.

- `Terser` compacta tu código para que se lleve menos tiempo descargarlo.

## `Watchify`

Comenzaremos con `Watchify` para proporcionar una compilación en segundo plano:

```shell
npm install --save-dev watchify fancy-log
```

Ahora cambia tu archivo `gulp` a lo siguiente:

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var paths = {
  pages: ["src/*.html"],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

gulp.task("default", gulp.series(gulp.parallel("copy-html"), bundle));
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);
```

Básicamente, hay tres cambios aquí, pero requieren que refactorices un poco tu código.

1. Envolvimos nuestra instancia de `browserify` en una llamada a `watchify`, y luego mantuvimos el resultado.
2. Llamamos a `seenBrowserify.on('update', bundle);` para que `Browserify` ejecute la función `bundle` cada vez que cambie uno de tus archivos *TypeScript*.
3. Llamamos a `seenBrowserify.on('log', fancy_log);` para iniciar sesión en la consola.

Juntos (1) y (2) significan que tenemos que mover nuestra llamada a `browserify` fuera de la tarea `default`.
Y tenemos que darle un nombre a la función `default` ya que tanto `Watchify` como `Gulp` necesitan llamarla.
Agregar registro con (3) es opcional pero muy útil para depurar tu configuración.

Ahora, cuando ejecutes `Gulp`, debería comenzar y seguir funcionando.
Intenta cambiar el código de `showHello` en `main.ts` y guárdalo.
Deberías ver una salida que se ve así:

```shell
proj$ gulp
[10:34:20] Usando gulpfile ~/src/proj/gulpfile.js
[10:34:20] Iniciando 'copy-html'...
[10:34:20] 'copy-html' terminado después de 26 ms
[10:34:20] Iniciando 'default'...
[10:34:21] 2824 bytes escritos (0.13 segundos)
[10:34:21] Finalizado "default" después de 1.36 s
[10:35:22] 2261 bytes escritos (0.02 segundos)
[10:35:24] 2808 bytes escritos (0.05 segundos)
```

## `Terser`

Primero instala `Terser`.
Dado que el objetivo de `terser` es alterar tu código, también necesitamos instalar `vinyl-buffer` y `gulp-sourcemaps` para que los `sourcemaps` sigan funcionando.

```shell
npm install --save-dev gulp-terser vinyl-buffer gulp-sourcemaps
```

Ahora cambia tu archivo `gulp` a lo siguiente:

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var terser = require("gulp-terser");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true });
      .pipe(terser())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

Observa que `tercer` en sí mismo tiene una sola llamada ⏤ las llamadas a `buffer` y `sourcemaps` existen para asegurarse de que los `sourcemaps` sigan funcionando.
Estas llamadas nos dan un archivo `sourcemap` separado en lugar de usar `sourcemaps` en línea como antes.
Ahora puedes ejecutar `Gulp` y comprobar que `bundle.js` se reduce a un lío ilegible:

```shell
gulp
cat dist/bundle.js
```

## `Babel`

Primero instala `Babelify` y ajusta a lo preestablecido de `Babel` para `ES2015`.
Al igual que `Terser`, `Babelify` modifica el código, por lo que necesitaremos un `vinyl-buffer` y `gulp-sourcemaps`.
De forma predeterminada, `Babelify` solo procesará archivos con extensiones `.js`, `.es`, `.es6` y `.jsx`, por lo que debemos agregar la extensión `.ts` como una opción para `Babelify`.

```shell
npm install --save-dev babelify@8 babel-core babel-preset-es2015 vinyl-buffer gulp-sourcemaps
```

Ahora cambia tu archivo `gulp` a lo siguiente:

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .transform("babelify", {
        presets: ["es2015"],
        extensions: [".ts"],
      })
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true });
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

También necesitamos tener el objetivo de `TypeScript ES2015`.
Luego, `Babel` producirá `ES5` a partir del código `ES2015` que emite `TypeScript`.
Modifiquemos `tsconfig.json`:

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es2015"
  }
}
```

La salida `ES5` de `Babel` debería ser muy similar a la salida de *TypeScript* para un script tan simple.
