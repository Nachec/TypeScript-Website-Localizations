---
display: "Sin use strict implícito"
oneline: "Deshabilita la adición de directivas de 'use strict' en los archivos JavaScript emitidos."
---

No deberías necesitar esto. De forma predeterminada, cuando se emite un archivo de módulo a un destino que no es *ES6*, *TypeScript* emite un prólogo `"use strict";` en la parte superior del archivo.
Esta configuración desactiva el prólogo.

```ts twoslash
// @showEmit
// @target: ES3
// @module: AMD
// @noImplicitUseStrict
// @alwaysStrict: false
export function fn() {}
```

```ts twoslash
// @showEmit
// @target: ES3
// @module: AMD
export function fn() {}
```
