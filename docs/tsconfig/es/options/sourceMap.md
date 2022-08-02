---
display: "Mapa fuente"
oneline: "Crea archivos de mapas fuente para archivos JavaScript emitidos."
---

Habilita la generación de [archivos de mapa fuente](https://developer.mozilla.org/docs/Tools/Debugger/How_to/Use_a_source_map).
Estos archivos permiten a los depuradores y otras herramientas mostrar el código fuente original de *TypeScript* cuando realmente trabajan con los archivos *JavaScript* emitidos.
Los archivos de mapas fuente se emiten como archivos `.js.map` (o `.jsx.map`) junto al archivo de salida `.js` correspondiente.

Los archivos `.js`, a su vez, contendrán un comentario de mapa fuente para indicar dónde están los archivos para herramientas externas, por ejemplo:

```ts
// helloWorld.ts
export declare const helloWorld = "hi";
```

Compilar con `sourceMap` establecido en `true` crea el siguiente archivo *JavaScript*:

```js
// helloWorld.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = "hi";
//# sourceMappingURL=// helloWorld.js.map
```

Y esto también genera este mapa `json`:

```json
// helloWorld.js.map
{
  "version": 3,
  "file": "ex.js",
  "sourceRoot": "",
  "sources": ["../ex.ts"],
  "names": [],
  "mappings": ";;AAAa,QAAA,UAAU,GAAG,IAAI,CAAA"
}
```
