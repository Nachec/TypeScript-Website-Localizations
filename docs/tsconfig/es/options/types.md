---
display: "Tipos"
oneline: "Especifica los nombres de los paquetes de tipo que se incluirán sin que se haga referencia a ellos en un archivo fuente."
---

De manera predeterminada, todos los paquetes *visibles* "`@types`" están incluidos en tu compilación.
Los paquetes en `node_modules/@types` de cualquier directorio adjunto se consideran *visibles*.
Por ejemplo, eso significa paquetes dentro de `./node_modules/@types/`, `../node_modules/@types/`, `../../node_modules/@types/`, y así sucesivamente.

Si se especifica `types`, solo los paquetes enumerados se incluirán en el alcance global. Por ejemplo:

```json tsconfig
{
  "compilerOptions": {
    "tipos": ["node", "jest", "express"]
  }
}
```

Este archivo `tsconfig.json` *sólo* incluirá `./node_modules/@types/node`, `./node_modules/@ types/jest` y `./node_modules/@ types/express`.
No se incluirán otros paquetes en `node_modules/@types/*`.

### ¿A qué afecta esto?

Esta opción no afecta la forma en que `@types/*` se incluyen en el código de tu aplicación, por ejemplo, si tienes el ejemplo anterior de `compilerOptions` con un código como:

```ts
import * as moment from "moment";

moment().format("MMMM Do YYYY, h:mm:ss a");
```

La importación de `moment` estaría completamente tipada.

Cuando tienes esta opción configurada, al no incluir un módulo en el arreglo `types`, esto:

- No agregará globales a tu proyecto (por ejemplo, `process` en el nodo o `expect` en `Jest`)
- Las exportaciones no aparecerán como recomendaciones de importación automática.

Esta característica se diferencia de [`typeRoots`](#typeRoots) en que se trata de especificar solo los tipos exactos que deseas incluir, mientras que [`typeRoots`](#typeRoots) admite decir que deseas directorios particulares.
