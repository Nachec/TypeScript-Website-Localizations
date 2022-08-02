---
display: "Comprobación JS"
oneline: "Habilita el informe de errores en la comprobación de tipo de archivos JavaScript."
---

Funciona en conjunto con [`allowJs`](#allowJs). Cuando `checkJs` está habilitado, los errores se reportan en archivos *JavaScript*. Este es
el equivalente de incluir `//@ts-check` en la parte superior de todos los archivos *JavaScript* que se incluyen en tu proyecto.

Por ejemplo, esto es *JavaScript* incorrecto de acuerdo con la definición de tipo `parseFloat` que viene con *TypeScript*:

```js
// parseFloat solo toma una cadena
module.exports.pi = parseFloat(3.124);
```

Cuando se importa a un módulo de *TypeScript*:

```ts twoslash
// @allowJs
// @filename: constants.js
module.exports.pi = parseFloat(3.124);

// @filename: index.ts
import { pi } from "./constants";
console.log(pi);
```

No obtendrás ningún error. Sin embargo, si activas `checkJs`, obtendrás mensajes de error del archivo *JavaScript*.

```ts twoslash
// @errors: 2345
// @allowjs: true
// @checkjs: true
// @filename: constants.js
module.exports.pi = parseFloat(3.124);

// @filename: index.ts
import { pi } from "./constants";
console.log(pi);
```
