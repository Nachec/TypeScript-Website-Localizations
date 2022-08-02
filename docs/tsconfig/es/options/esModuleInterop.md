---
display: "Interoperabilidad del módulo ES"
oneline: "Emite JavaScript adicional para facilitar la compatibilidad con la importación de módulos CommonJS. Esto habilita [`allowSyntheticDefaultImports`](#allowSyntheticDefaultImports) para compatibilidad de tipos."
---

De forma predeterminada (con `esModuleInterop false` o no establecido), *TypeScript* trata los módulos *CommonJS*/*AMD*/*UMD* de forma similar a los módulos *ES6*. Al hacer esto, hay dos partes en particular que resultaron ser supuestos erróneos:

- una importación de espacio de nombres como `importa * as moment from "moment"` actúa de la misma forma que `constant moment = requiere("moment")`

- una importación predeterminada como `import moment from "moment"` actúa de la misma manera que `const moment = requiere("moment").default`

Esta falta de coincidencia provoca estos dos problemas:

- la especificación de módulos *ES6* establece que una importación de espacio de nombres (`import * as x`) solo puede ser un objeto, al tener *TypeScript*
  tratándolo de la misma manera que `= require("x")` entonces *TypeScript* permitió que la importación se tratara como una función y fuera invocable. Eso no es válido según la especificación.

- si bien son precisas para las especificaciones de los módulos *ES6*, la mayoría de las bibliotecas con módulos *CommonJS*/*AMD*/*UMD* no se ajustan tan estrictamente como la implementación de *TypeScript*.

Activar `esModuleInterop` solucionará ambos problemas en el código transpilado por *TypeScript*. El primero cambia el comportamiento en el compilador, el segundo está arreglado por dos nuevas funciones auxiliares que proporcionan una corrección para asegurar la compatibilidad en el *JavaScript* emitido:

```ts
import * as fs from "fs";
import _ from "lodash";

fs.readFileSync("file.txt", "utf8");
_.chunk(["a", "b", "c", "d"], 2);
```

Con `esModuleInterop` deshabilitado:

```ts twoslash
// @noErrors
// @showEmit
// @esModuleInterop: false
// @module: commonjs
import * as fs from "fs";
import _ from "lodash";

fs.readFileSync("file.txt", "utf8");
_.chunk(["a", "b", "c", "d"], 2);
```

Con `esModuleInterop` establecido en `true`:

```ts twoslash
// @noErrors
// @showEmit
// @esModuleInterop
// @module: commonjs
import * as fs from "fs";
import _ from "lodash";

fs.readFileSync("file.txt", "utf8");
_.chunk(["a", "b", "c", "d"], 2);
```

*Nota*: La importación del espacio de nombres `import * as fs from "fs"` solo cuenta para propiedades que [son propiedad](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) (básicamente propiedades establecidas en el objeto y no a través de la cadena de prototipos) en el objeto importado. Si el módulo que está importando define su *API* usando propiedades heredadas, necesitas usar la forma de importación predeterminada (`import fs from "fs"`), o deshabilitar `esModuleInterop`.

*Nota*: Puedes hacer que *JS* emita `terser` habilitando [`importHelpers`](#importHelpers):

```ts twoslash
// @noErrors
// @showEmit
// @esModuleInterop
// @importHelpers
// @module: commonjs
import * as fs from "fs";
import _ from "lodash";

fs.readFileSync("file.txt", "utf8");
_.chunk(["a", "b", "c", "d"], 2);
```

Habilitar `esModuleInterop` también habilitará [`allowSyntheticDefaultImports`](#allowSyntheticDefaultImports).
