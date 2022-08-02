---
display: "Permite importaciones predeterminadas sintéticas"
oneline: "Permite 'import x from y' cuando un módulo no tiene una 'export' predeterminada."
---

Cuando se establece en true, `allowSyntheticDefaultImports` te permite escribir una importación como:

```ts
import React from "react";
```

en lugar de:

```ts
import * as React from "react";
```

Cuando el módulo **no** especifica explícitamente una exportación predeterminada.

Por ejemplo, sin `allowSyntheticDefaultImports` como `true`:

```ts twoslash
// @errors: 1259 1192
// @checkJs
// @allowJs
// @esModuleInterop: false
// @filename: utilFunctions.js
// @noImplicitAny: false
const getStringLength = (str) => str.length;

module.exports = {
  getStringLength,
};

// @filename: index.ts
import utils from "./utilFunctions";

const count = utils.getStringLength("Check JS");
```

Este código genera un error porque no hay un objeto `default` que puedas importar. Aunque se sienta como debería.
Para mayor comodidad, los transpiladores como *Babel* crearán automáticamente un valor predeterminado si no se crea uno. Haciendo que el módulo se parezca un poco más a:

```js
// @filename: utilFunctions.js
const getStringLength = (str) => str.length;
const allFunctions = {
  getStringLength,
};

module.exports = allFunctions;
module.exports.default = allFunctions;
```

Esta bandera no afecta el *JavaScript* emitido por *TypeScript*, solo para la comprobación de tipos.
Esta opción trae el comportamiento de *TypeScript* en línea con *Babel*, donde se emite código adicional para hacer que el uso de una exportación predeterminada de un módulo sea más ergonómica.
