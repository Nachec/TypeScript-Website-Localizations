---
display: "Mapa fuente integrado"
oneline: "Incluir archivos de mapas fuente dentro del JavaScript emitido."
---

Cuando se establece, en lugar de escribir un archivo `.js.map` para proporcionar mapas fuente, *TypeScript* incrustará el contenido del mapa fuente en los archivos `.js`.
Aunque esto da como resultado archivos *JS* más grandes, puede ser conveniente en algunos escenarios.
Por ejemplo, es posible que desees depurar archivos *JS* en un servidor web que no permita que se sirvan archivos `.map`.

Mutuamente excluyente con [`sourceMap`](#sourceMap).

Por ejemplo, con este *TypeScript*:

```ts
const helloWorld = "hi";
console.log(helloWorld);
```

Convierte a este *JavaScript*:

```ts twoslash
// @showEmit
const helloWorld = "hi";
console.log(helloWorld);
```

Luego habilita la construcción con `inlineSourceMap` habilitado; hay un comentario en la parte inferior del archivo que incluye
un mapa fuente para el archivo.

```ts twoslash
// @inlineSourceMap
// @showEmit
const helloWorld = "hi";
console.log(helloWorld);
```
