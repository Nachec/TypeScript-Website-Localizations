---
title: Módulos ECMAScript en Node.js
layout: docs
permalink: /docs/handbook/esm-node.html
oneline: Usar módulos ECMAScript en Node.js
---

Durante los últimos años, *Node.js* ha estado trabajando para admitir la ejecución de *módulos ECMAScript* (*MES*).
Esta ha sido una característica muy difícil de soportar, ya que la base del ecosistema *Node.js* se basa en un sistema de módulos diferente llamado *CommonJS* (*CJS*).

Interoperar entre los dos sistemas de módulos trae grandes desafíos, con muchas características nuevas para hacer malabares;
sin embargo, el soporte para *ESM* en *Node.js* ahora se implementa en gran medida en *Node.js*, y el polvo ha comenzado a asentarse.

Es por eso que *TypeScript* trae dos nuevas configuraciones de `module` y `moduleResolution`: `node16` y `nodenext`.

```json tsconfig
{
    "compilerOptions": {
        "module": "nodenext",
    }
}
```

Estos nuevos modos traen algunas características de alto nivel que exploraremos aquí.

### `type` en `package.json` y nuevas extensiones

*Node.js* admite [una nueva configuración en `package.json`](https://nodejs.org/api/packages.html#packages_package_json_and_file_extensions) llamado `type`.
`"type"` se puede configurar como `"module"` o `"commonjs"`.

```json tsconfig
{
    "name": "my-package",
    "type": "module",

    "//": "...",
    "dependencies": {
    }
}
```

Esta configuración controla si los archivos `.js` se interpretan como *módulos ES* o módulos *CommonJS*, y los valores predeterminados son *CommonJS* cuando no se configuran.
Cuando un archivo se considera un *módulo ES*, entran en juego algunas reglas diferentes en comparación con *CommonJS*:

* Se pueden usar declaraciones `import`/`export` y `await` de nivel superior
* las rutas de importación relativas necesitan extensiones completas (tenemos que escribir `import "./foo.js"` en lugar de `import "./foo"`)
* las importaciones se pueden resolver de manera diferente a las dependencias en `node_modules`
* ciertos valores de tipo global como `require()` y `__dirname` no se pueden usar directamente
* Los módulos *CommonJS* se importan bajo ciertas reglas especiales

Volveremos a algunos de estos.

Para superponer la forma en que *TypeScript* funciona en este sistema, los archivos `.ts` y `.tsx` ahora funcionan de la misma manera.
Cuando *TypeScript* encuentra un archivo `.ts`, `.tsx`, `.js` o `.jsx`, buscará un `package.json` para ver si ese archivo es un *módulo ES* y que usará para determinar:

* cómo encontrar otros módulos que importan ese archivo
* y cómo transformar ese archivo si produce resultados

Cuando un archivo `.ts` se compila como un *módulo ES*, la sintaxis de *ECMAScript* `import`/ `export` se deja sola en la salida de `.js`;
cuando se compila como un *módulo CommonJS*, producirá el mismo resultado que obtienes hoy en [`module`](/tsconfig#module); `commonjs`.

Esto también significa que las rutas se resuelven de manera diferente entre los archivos `.ts` que son *módulos ES* y los que son módulos *CJS*.
Por ejemplo, digamos que tiene el siguiente código hoy:

```ts
// ./foo.ts
export function helper() {
    // ...
}

// ./bar.ts
import { helper } from "./foo"; // solo trabaja en CJS

helper();
```

Este código funciona en los *módulos CommonJS*, pero fallará en los *módulos ES* porque las rutas de importación relativas necesitan usar extensiones.
Como resultado, se tendrá que reescribir para usar la extensión *output* de `foo.ts` ⏤ así que `bar.ts` tendrá que importar desde `./foo.js`.

```ts
// ./bar.ts
import { helper } from "./foo.js"; // trabaja en MES y CJS

helper();
```

Esto puede parecer un poco engorroso al principio, pero las herramientas de *TypeScript*, como las importaciones automáticas y el completado de la ruta, normalmente lo harán por ti.

Otra cosa a mencionar es el hecho de que esto también se aplica a los archivos `.d.ts`.
Cuando *TypeScript* encuentra un archivo `.d.ts` en el paquete, se interpreta como un archivo `ESM`  o `CommonJS` según el paquete que lo contiene.

### Nuevas extensiones de archivo

El campo `type` en `package.json` es bueno porque nos permite continuar usando las extensiones de archivo `.ts` y `.js` que pueden ser convenientes;
sin embargo, ocasionalmente necesitarás escribir un archivo que difiera de lo que especifica `type`.
También es posible que prefieras ser explícito siempre.

*Node.js* admite dos extensiones para ayudar con esto: `.mjs` y `.cjs`.
Los archivos `.mjs` siempre son *módulos ES*, y los archivos `.cjs` siempre son *módulos CommonJS*, y no hay forma de anularlos.

A su vez, *TypeScript* admite dos nuevas extensiones de archivo fuente: `.mts` y `.cts`.
Cuando *TypeScript* los emite a archivos *JavaScript*, los emitirá a `.mjs` y `.cjs` respectivamente.

Además, *TypeScript* también admite dos nuevas extensiones de archivo de declaración: `.d.mts` y `.d.cts`.
Cuando *TypeScript* genera archivos de declaración para `.mts` y `.cts`, sus extensiones correspondientes serán `.d.mts` y `.d.cts`.

El uso de estas extensiones es completamente opcional, pero a menudo será útil incluso si eliges no usarlas como parte de tu flujo de trabajo principal.

### Interoperabilidad *CommonJS*

*Node.js* permite a los *módulos ES* importar *módulos CommonJS* como si fueran *módulos ES* con una exportación predeterminada.

```ts twoslash
// @module: nodenext
// @filename: helper.cts
export function helper() {
    console.log("hello world!");
}

// @filename: index.mts
import foo from "./helper.cjs";

// imprime "¡hello world!"
foo.helper();
```

En algunos casos, *Node.js* también sintetiza exportaciones con nombre de *módulos CommonJS*, lo que puede ser más conveniente.
En estos casos, los *módulos ES* pueden utilizar una importación al "estilo de espacio de nombres" (es decir, `import * as foo from "..."`), o importaciones con nombre (es decir,`import { helper } from "..."`).

```ts twoslash
// @module: nodenext
// @filename: helper.cts
export function helper() {
    console.log("hello world!");
}

// @filename: index.mts
import { helper } from "./helper.cjs";

// imprime "¡hello world!"
helper();
```

No siempre hay una forma de que *TypeScript* sepa si estas importaciones con nombre se sintetizarán, pero *TypeScript* se equivocará al ser permisivo y usará algunas heurísticas al importar desde un archivo que definitivamente es un *módulo CommonJS*.

Una nota específica de *TypeScript* sobre la interoperabilidad es la siguiente sintaxis:

```ts
import foo = require("foo");
```

En un *módulo CommonJS*, esto se reduce a una llamada `require()`, y en un *módulo ES*, esto importa [`createRequire`](https://nodejs.org/api/module.html#module_module_createrequire_filename) para lograr la misma cosa.
Esto hará que el código sea menos portátil en entornos de ejecución como el navegador (que no admite `require()`), pero a menudo será útil para la interoperabilidad.
A su vez, puedes escribir el ejemplo anterior usando esta sintaxis de la siguiente manera:

```ts twoslash
// @module: nodenext
// @filename: helper.cts
export function helper() {
    console.log("hello world!");
}

// @filename: index.mts
import foo = require("./foo.cjs");

foo.helper()
```

Finalmente, vale la pena señalar que la única forma de importar archivos *MES* desde un *módulo CJS* es usando llamadas dinámicas `import()`.
Esto puede presentar desafíos, pero es el comportamiento en *Node.js* hoy.

Puedes [leer más sobre la interoperabilidad de *MES*/*CommonJS* en *Node.js* aquí](https://nodejs.org/api/esm.html#esm_interoperability_with_commonjs).

### `package.json` Exportaciones, importaciones y autorreferencia

*Node.js* admite [un nuevo campo para definir puntos de entrada en `package.json` llamado `"exports"`](https://nodejs.org/api/packages.html#packages_exports).
Este campo es una alternativa más poderosa para definir `"main"` en `package.json`, y puede controlar qué partes de tu paquete están expuestas a los consumidores.

Aquí hay un `package.json` que admite puntos de entrada separados para `CommonJS` y `ESM`:

```json5
// `package.json`
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Punto de entrada para `import "mi-paquete"` en *MES*
            "import": "./esm/index.js",

            // Punto de entrada para `require("my-package")` en CJS
            "require": "./commonjs/index.cjs",
        },
    },

    // Recurso de CJS para versiones anteriores de Node.js
    "principal": "./commonjs/index.cjs",
}
```

Hay mucho en esta característica, [sobre la que puedes leer más en la documentación de *Node.js*](https://nodejs.org/api/packages.html).
Aquí intentaremos centrarnos en cómo lo admite *TypeScript*.

Con el soporte de *Node* original de *TypeScript*, buscaría un campo `"main"` y luego buscaría archivos de declaración que correspondieran a esa entrada.
Por ejemplo, si `"main"` apunta a `./lib/index.js`, *TypeScript* buscará un archivo llamado `./lib/index.d.ts`.
El autor de un paquete podría anular esto especificando un campo separado llamado `"types"` (por ejemplo, `"types"`: "./types/index.d.ts"`).

El nuevo soporte funciona de manera similar con [condiciones de importación](https://nodejs.org/api/packages.html).
De forma predeterminada, *TypeScript* superpone las mismas reglas con las condiciones de importación: si escribes una `import` desde un *módulo ES*, buscará el campo `import` y, desde un *módulo CommonJS*, buscará el campo `require`.
Si los encuentra, buscará el archivo de declaración correspondiente.
Si necesitas apuntar a una ubicación diferente para tus declaraciones de tipo, puedes agregar una condición de importación `"types"`.

```json5
// `package.json`
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Punto de entrada para la resolución de TypeScript - ¡debe ocurrir primero!
            "tipos": "./types/index.d.ts",

            // Punto de entrada para `import "mi-paquete"` en *MES*
            "import": "./esm/index.js",

            // Punto de entrada para `require("my-package")` en CJS
            "require": "./commonjs/index.cjs",
        },
    },

    // Recurso de CJS para versiones anteriores de Node.js
    "principal": "./commonjs/index.cjs",

    // Respaldo para versiones anteriores de TypeScript
    "tipos": "./types/index.d.ts"
}
```

*TypeScript* también admite [el campo `"imports"` de `package.json`](https://nodejs.org/api/packages.html#packages_imports) de manera similar (buscando archivos de declaración junto con los archivos correspondientes), y admite [paquetes que se autoreferencian a sí mismos](https://nodejs.org/api/packages.html#packages_self_referencing_a_package_using_its_name).
Estas características generalmente no son tan complicadas, pero son compatibles.
