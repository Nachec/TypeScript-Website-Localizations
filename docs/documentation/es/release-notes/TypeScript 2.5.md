---
title: TypeScript 2.5
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-5.html
oneline: Notas de la versión de TypeScript 2.5
---

## Variables opcionales de cláusula `catch`

Gracias al trabajo realizado por [`@tinganho`](https://github.com/tinganho), *TypeScript 2.5* implementa una nueva función *ECMAScript* que permite a los usuarios omitir la variable en las cláusulas `catch`.
Por ejemplo, al usar `JSON.parse`, es posible que debas envolver las llamadas a la función con un `try`/`catch`, pero es posible que no termines usando el `SyntaxError` que aparece cuando la entrada es errónea.

```ts
let input = "...";
try {
  JSON.parse(input);
} catch {
  // ^ Observa que nuestra cláusula `catch` no declara una variable.
  console.log("Invalid JSON given\n\n" + input);
}
```

## Escribe la sintaxis de aserción/transmisión en el modo `checkJs`/`@ts-check`

*TypeScript 2.5* introduce la capacidad de [acertar el tipo de expresiones cuando se usa *JavaScript* simple en tus proyectos](https://github.com/Microsoft/TypeScript/issues/5158).
La sintaxis es un comentario `/**@type {...} */` de anotación seguido de una expresión entre paréntesis cuyo tipo se necesita reevaluar.
Por ejemplo:

```ts
var x = /** @type {SomeType} */ AnyParenthesizedExpression;
```

## Paquetes duplicados y redirigidos

Al importar usando la estrategia de resolución del módulo `Node` en *TypeScript 2.5*, el compilador ahora verificará si los archivos se originan en paquetes "idénticos".
Si un archivo se origina en un paquete con un `package.json` que contiene los mismos campos de `name` y `versión` que un paquete encontrado anteriormente, *TypeScript* se redirigirá al paquete superior.
Esto ayuda a resolver problemas donde dos paquetes pueden contener declaraciones de clases idénticas, pero que contienen miembros `private` que hacen que sean estructuralmente incompatibles.

Como una buena ventaja, esto también puede reducir la huella de memoria y el entorno de ejecución del compilador y el servicio de lenguaje al evitar cargar archivos `.d.ts` de paquetes duplicados.

## La bandera del compilador `--preserveSymlinks`

*TypeScript 2.5* trae el indicador [`preserveSymlinks`](/tsconfig#preserveSymlinks), que es paralelo al comportamiento de [el indicador `--preserve-symlinks` en *Node.js*](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
Esta bandera también exhibe el comportamiento opuesto a la opción `resolve.symlinks` de *Webpack* (es decir, configurando [`preserveSymlinks`](/tsconfig#preserveSymlinks) de *TypeScript* en `true` paralelos configurando `resolve.symlinks` de *Webpack* en `false`, y viceversa al revés).

En este modo, las referencias a módulos y paquetes (por ejemplo, las directivas `import`s y `/// <reference type = "..." />`) se resuelven en relación con la ubicación del archivo de enlace simbólico, en lugar de relativo a la ruta a la que se resuelve el enlace simbólico.
Para un ejemplo más concreto, nos remitiremos a [la documentación en el sitio web de *Node.js*](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
