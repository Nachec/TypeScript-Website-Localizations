---
title: Proyectos JavaScript que utilizan TypeScript
layout: docs
permalink: /docs/handbook/intro-to-js-ts.html
oneline: Cómo agregar comprobación de tipo a archivos JavaScript usando TypeScript
translatable: true
---

El sistema de tipos en *TypeScript* tiene diferentes niveles de rigor cuando se trabaja con un código base:

- Un sistema de tipos basado solo en inferencia con código *JavaScript*
- Tipado incremental en *JavaScript* [a través de *JSDoc*](/docs/handbook/jsdoc-supported-types.html)
- Usar `// @ts-check` en un archivo *JavaScript*
- Código *TypeScript*
- *TypeScript* con [`strict`](/tsconfig#strict) enabled

Cada paso representa un movimiento hacia un sistema de tipos más seguro, pero no todos los proyectos necesitan ese nivel de comprobación.

## *TypeScript* con *JavaScript*

Esto es cuando usas un editor que usa *TypeScript* para proporcionar herramientas como autocompleción, saltar al símbolo y herramientas de refactorización como `rename`.
La [página de inicio](/) tiene una lista de editores que tienen complementos de *TypeScript*.

## Proporcionar sugerencias de tipo en *JS* a través de *JSDoc*

En un archivo `.js`, los tipos a menudo se pueden inferir. Cuando no se pueden inferir tipos, se pueden especificar utilizando la sintaxis *JSDoc*.

Las anotaciones *JSDoc* vienen antes de que se use una declaración para establecer el tipo de esa declaración. Por ejemplo:

```js twoslash
/** @type {number} */
var x;

x = 0; // Bien
x = false; // Bien?!
```

Puedes encontrar la lista completa de patrones *JSDoc* compatibles [en Tipos compatibles con *JSDoc*](/docs/handbook/jsdoc-supported-types.html).

## `@ts-check`

La última línea del código de ejemplo anterior generaría un error en *TypeScript*, pero no lo hace de forma predeterminada en un proyecto *JS*.
Para habilitar errores en tus archivos *JavaScript* agrega: `// @ts-check` a la primera línea de tus archivos `.js` para que *TypeScript* lo genere como un error.

```js twoslash
// @ts-check
// @errors: 2322
/** @type {number} */
var x;

x = 0; // Bien
x = false; // No está bien
```

Si tienes muchos archivos *JavaScript* a los que deseas agregar errores, puedes cambiar a usar un [`jsconfig.json`](/docs/handbook/tsconfig-json.html).
Puedes omitir la comprobación de algunos archivos agregando un comentario ``/@ts-nocheck` a los archivos.

*TypeScript* te puede ofrecer errores con los que no estás de acuerdo; en esos casos, puedes ignorar errores en líneas específicas agregando ``/@ts-ignore` o  `//(@ts-expect-error` en la línea anterior.

```js twoslash
// @ts-check
/** @type {number} */
var x;

x = 0; // Bien
// @ts-expect-error
x = false; // No está bien
```

Para obtener más información sobre cómo *TypeScript* interpreta *JavaScript*, lee [Cómo *TypeScript* comprueba los tipos *JavaScript*](/ocs/handbook/type-check-javascript-files.html)
