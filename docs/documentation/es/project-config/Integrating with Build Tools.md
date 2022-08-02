---
title: Integrar herramientas de compilación
layout: docs
permalink: /docs/handbook/integrating-with-build-tools.html
oneline: Cómo usar *TypeScript* con otras herramientas de compilación
---

## `Babel`

### Instalar

```sh
npm install @babel/cli @babel/core @babel/preset-typescript --save-dev
```

### `.babelrc`

```js
{
  "presets": ["@babel/preset-typescript"]
}
```

### Usar la interfaz de línea de comandos

```sh
./node_modules/.bin/babel --out-file bundle.js src/index.ts
```

### `package.json`

```js
{
  "scripts": {
    "build": "babel --out-file bundle.js main.ts"
  },
}
```

### Ejecuta `Babel` desde la línea de comandos

```sh
npm run build
```

## `Browserify`

### Instalar

```sh
npm install tsify
```

### Usar la interfaz de línea de comandos

```sh
browserify main.ts -p [ tsify --noImplicitAny ] > bundle.js
```

### Usar la *API*

```js
var browserify = require("browserify");
var tsify = require("tsify");

browserify()
  .add("main.ts")
  .plugin("tsify", { noImplicitAny: true })
  .bundle()
  .pipe(process.stdout);
```

Más detalles: [smrq/tsify](https://github.com/smrq/tsify)

## `Grunt`

### Instalar

```sh
npm install grunt-ts
```

### `Gruntfile.js` básico

```js
module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ["**/*.ts", "!node_modules/**/*.ts"],
      },
    },
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.registerTask("default", ["ts"]);
};
```

Más detalles: [TypeStrong/grunt-ts](https://github.com/TypeStrong/grunt-ts)

## Gulp

### Instalar

```sh
npm install gulp-typescript
```

### `gulpfile.js` básico

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");

gulp.task("default", function () {
  var tsResult = gulp.src("src/*.ts").pipe(
    ts({
      noImplicitAny: true,
      out: "output.js",
    })
  );
  return tsResult.js.pipe(gulp.dest("built/local"));
});
```

Más detalles: [ivogabe/gulp-typescript](https://github.com/ivogabe/gulp-typescript)

## `Jspm`

### Instalar

```sh
npm install -g jspm@beta
```

*Nota: Actualmente, el soporte de TypeScript en `jspm` está en 0.16beta*

Más detalles: [TypeScriptSamples/jspm](https://github.com/Microsoft/TypeScriptSamples/tree/master/jspm)

## `MSBuild`

Actualiza el archivo del proyecto para incluir archivos `Microsoft.TypeScript.Default.props` (en la parte superior) y `Microsoft.TypeScript.targets` (en la parte inferior) instalados localmente:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="4.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <!-- Incluir accesorios predeterminados en la parte superior -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props')" />

  <!-- Las configuraciones de TypeScript van aquí -->
  <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
    <TypeScriptSourceMap>false</TypeScriptSourceMap>
  </PropertyGroup>

  <!-- Incluye objetivos predeterminados en la parte inferior -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets')" />
</Project>
```

Más detalles sobre cómo definir las opciones del compilador de *MSBuild*: [Configuración de las opciones del compilador en proyectos *MSBuild*](/docs/handbook/compiler-options-in-msbuild.html)

## `NuGet`

- Haz clic con el botón derecho ▹ Administrar paquetes *NuGet*
- Busca `Microsoft.TypeScript.MSBuild`
- Presiona `Instalar`
- Cuando la instalación esté completa, ¡reconstruye!

Puedes encontrar más detalles en [*Package Manager Dialog*](http://docs.nuget.org/Consume/Package-Manager-Dialog) y [uso de compilaciones nocturnas con *NuGet*](https://github.com/Microsoft/TypeScript/wiki/Nightly-drops#using-nuget-with-msbuild)

## Rollup

### Instalar

```
npm install @rollup/plugin-typescript --save-dev
```

Ten en cuenta que tanto `typescript` como `tslib` son dependencias de este complemento que se deben instalar por separado.

### Uso

Crea un [archivo de configuración] (https://www.rollupjs.org/guide/en/#configuration-files) `rollup.config.js` e importa el complemento:

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [typescript()]
};
```

## Compilador Svelte

### Instalar

```
npm install --save-dev svelte-preprocess
```

Ten en cuenta que `typescript` es una dependencia opcional de este complemento y se debe instalar por separado. `tslib` tampoco se proporciona.

También puedes considerar [`svelte-check`](https://www.npmjs.com/package/svelte-check) para verificar el tipo de CLI.

### Uso

Crea un archivo de configuración `svelte.config.js` e importa el complemento:

```js
// svelte.config.js
import preprocess from 'svelte-preprocess';

const config = {
  // Consulta https://github.com/sveltejs/svelte-preprocess
  // para más información sobre estos preprocesadores:
  preprocess: preprocess()
};

export default config;
```

Ahora puedes especificar que los bloques deñ script se escriban en *TypeScript*:

```
<script lang="ts">
```

## Vite

Vite admite la importación de archivos `.ts` listos para usar. Solo realiza transpilación sin verificación de tipos. También requiere que algunas `compilerOptions` tengan ciertos valores. Consulta la [documentación de Vite] (https://vitejs.dev/guide/features.html#typescript) para obtener más detalles.

## `Webpack`

### Instalar

```sh
npm install ts-loader --save-dev
```

### `webpack.config.js` básico cuando se usa `Webpack` 5 o 4

```js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

Consulta [más detalles sobre *ts-loader* aquí](https://www.npmjs.com/package/ts-loader).

Alternativas:

- [awesome-typescript-loader](https://www.npmjs.com/package/awesome-typescript-loader)
