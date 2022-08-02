---
title: Publicación
layout: docs
permalink: /docs/handbook/declaration-files/publishing.html
oneline: Cómo hacer llegar tus archivos d.ts a los usuarios
---

Ahora que has creado un archivo de declaración siguiendo los pasos de esta guía, es hora de publicarlo en `npm`.
Hay dos principales formas en que puedes publicar tus archivos de declaración en `npm`:

1. empaquetado con tu paquete `npm`
2. Publicando en la [organización de `@types`](https://www.npmjs.com/~types) en `npm`.

Si tus tipos son generados por tu código fuente, publica los tipos con tu código fuente. Ambos proyectos *TypeScript* y *JavaScript* pueden generar tipos a través de [`declaration`](/tsconfig#declaration).

De lo contrario, recomendamos enviar los tipos a `DefinitelyTyped`, que los publicará en la organización `@types` en `npm`.

## Incluir declaraciones en tu paquete `npm`

Si tu paquete tiene un archivo `.js` principal, también deberás indicar el archivo de declaración principal en tu archivo `package.json`.
Establece la propiedad `types` para que apunte a tu archivo de declaración empaquetado.
Por ejemplo:

```json
{
  "name": "awesome",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "principal": "./lib/main.js",
  "tipos": "./lib/main.d.ts"
}
```

Ten en cuenta que el campo `"typings"` es sinónimo de `"types"`, y también se podría usar.

También ten en cuenta que si tu archivo de declaración principal se llama `index.d.ts` y se encuentra en la raíz del paquete (junto a `index.js`), no es necesario marcar la propiedad `types`, aunque es aconsejable hacerlo.

## Dependencias

Todas las dependencias son administradas por `npm`.
Asegúrate de que todos los paquetes de declaración de los que depende estén marcados apropiadamente en la sección `"dependencies"` en tu `paquete.json`.
Por ejemplo, imagina que creamos un paquete que usa `Browserify` y *TypeScript*.

```json
{
  "name": "browserify-typescript-extension",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "principal": "./lib/main.js",
  "tipos": "./lib/main.d.ts",
  "dependencies": {
    "browserify": "latest",
    "@types/browserify": "latest",
    "typescript": "next"
  }
}
```

Aquí, nuestro paquete depende de los paquetes `browserify` y `typescript`.
`browserify` no agrupa sus archivos de declaración con sus paquetes `npm`, por lo que necesitamos depender de `@types/browserify` para sus declaraciones.
`typescript`, por otro lado, empaqueta tus archivos de declaración, por lo que no hubo necesidad de dependencias adicionales.

Nuestro paquete expone las declaraciones de cada uno de ellos, por lo que cualquier usuario de nuestro paquete `browserify-typescript-extension` necesita tener estas dependencias también.
Por esa razón, usamos `"dependencies"` y no `"devDependencies"`, porque de lo contrario nuestros consumidores tendrían que haber instalado manualmente esos paquetes.
Si acabáramos de escribir una aplicación de línea de comandos y no esperáramos que nuestro paquete se usara como biblioteca, podríamos haber usado `devDependencies`.

## Banderas rojas

### `/// <reference path="..." />`

*No* uses `/// <reference path="..."/>` en tus archivos de declaración.

```ts
/// <reference path="../typescript/lib/typescriptServices.d.ts" />
....
```

*Usa* `/// <reference types="..."/>` en su lugar.

```ts
/// <reference types="typescript" />
....
```

Asegúrate de volver a visitar la sección [Consumir dependencias](/docs/handbook/statement-files/library-structure.html#consumir-dependencias) para obtener más información.

### Declarar dependientes de paquetes

Si tus definiciones de tipo dependen de otro paquete:

- *No* lo combines con el tuyo, guarda cada uno en su propio archivo.
- *No* copies las declaraciones en tu paquete tampoco.
- Depende del paquete de declaración de tipo `npm` si no empaquetas tus archivos de declaración.

## Selección de versión con `typesVersions`

Cuando *TypeScript* abre un archivo `package.json` para averiguar qué archivos necesita leer, primero mira un campo llamado `typesVersions`.

#### Redirigir directorios (usando `*`)

Un `package.json` con un campo `typesVersions` se podría ver así:

```json
{
  "name": "nombre-paquete",
  "version": "1.0.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

Este `package.json` le dice a *TypeScript* que primero verifique la versión actual de *TypeScript*.
Si es 3.1 o posterior, determina la ruta que ha importado en relación con el paquete y lee desde el directorio `ts3.1` del paquete.

Eso es lo que `{"*": ["ts3.1/*"] }` significa ⏤ si estás familiarizado con el [mapeo de rutas](/tsconfig#rutas), funciona exactamente así.

En el ejemplo anterior, si estamos importando desde `"nombre-paquete"`, *TypeScript* intentará resolver desde `[...]/node_modules/nombre-paquete/ts3.1/index.d.ts` (y otras rutas relevantes) cuando se ejecuta en *TypeScript 3.1*.
Si importamos desde `nombre-paquete/foo`, intentaremos buscar `[...]/node_modules/nombre-paquete/ts3.1/foo.d.ts` y `[...]/node-modules/nombre-paquete/ts3.1/foo/index.d.ts`.

¿Qué pasa si no estamos ejecutando *TypeScript 3.1* en este ejemplo?
Bueno, si ninguno de los campos en `typesVersions` coincide, *TypeScript* vuelve al campo `types`, por lo que aquí *TypeScript 3.0* y versiones anteriores serán redirigidos a `[...]/node_modules/nombre-paquete/index.d.ts`.

#### Redirigir archivos

Cuando solo deseas cambiar la resolución de un solo archivo a la vez, puedes decirle a *TypeScript* que el archivo se resuelva de manera diferente pasando los nombres de archivo exactos:

```json
{
  "name": "nombre-paquete",
  "version": "1.0.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    "<4.0": { "index.d.ts": ["index.v3.d.ts"] }
  }
}
```

En *TypeScript 4.0* y superior, una importación para `"nombre-paquete"` se resolvería en `./index.d.ts` y para 3.9 y menor `"./Index.v3.d.ts`.

## Comportamiento coincidente

La forma en que *TypeScript* decide si una versión del compilador y el lenguaje coincide es utilizando los [rangos de `semver`](https://github.com/npm/node-semver#ranges) de *Node*.

## Varios campos

`typesVersions` puede admitir varios campos donde cada nombre de campo está especificado por el rango para coincidir.

```json tsconfig
{
  "name": "nombre-paquete",
  "version": "1.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    ">=3.2": { "*": ["ts3.2/*"] },
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

Dado que los rangos tienen el potencial de superponerse, determinar qué redirección se aplica es específico del orden.
Eso significa que en el ejemplo anterior, aunque tanto los comparadores `>=3.2` como `>=3.1` son compatibles con *TypeScript 3.2* y superior, invertir el orden podría tener un comportamiento diferente, por lo que el ejemplo anterior no sería equivalente al siguiente.

```jsonc tsconfig
{
  "name": "nombre-paquete",
  "version": "1.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    // **Nota**: ¡esto no funciona!
    ">=3.1": { "*": ["ts3.1/*"] },
    ">=3.2": { "*": ["ts3.2/*"] }
  }
}
```

## Publicar en [`@types`](https://www.npmjs.com/~types)

Los paquetes de la organización [`@types`](https://www.npmjs.com/~types) se publican automáticamente desde [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) mediante la [herramienta de publicación de tipos](https://github.com/microsoft/DefinitelyTyped-tools/tree/master/packages/publisher).
Para que tus declaraciones se publiquen como un paquete `@types`, envía una solicitud de extracción a [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped).
Puedes encontrar más detalles en la [página de pautas de contribución](http://definitelytyped.org/guides/contributing.html).
