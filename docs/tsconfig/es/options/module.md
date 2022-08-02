---
display: "Módulo"
oneline: "Especifica qué código de módulo se genera."
---

Establece el sistema de módulos para el programa. Consulta la página de referencia de <a href='/docs/handbook/modules.html'>Módulos</a> para obtener más información. Es muy probable que desees `"CommonJS"` para proyectos `node`.

Cambiar `module` afecta a [`moduleResolution`](#moduleResolution) que [también tiene una página de referencia](/docs/handbook/module-resolution.html).

Aquí hay un ejemplo de salida para este archivo:

```ts twoslash
// @filename: constants.ts
export const valueOfPi = 3.142;
// ---cut---
// @filename: index.ts
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### *CommonJS*

```ts twoslash
// @showEmit
// @module: commonjs
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### *UMD*

```ts twoslash
// @showEmit
// @module: umd
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### `AMD`

```ts twoslash
// @showEmit
// @module: amd
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### `System`

```ts twoslash
// @showEmit
// @module: system
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### `ESNext`

```ts twoslash
// @showEmit
// @module: esnext
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### *ES2020*

```ts twoslash
// @showEmit
// @module: es2020
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

#### `ES2015`/`ES6`

```ts twoslash
// @showEmit
// @module: es2015
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```

Si te estás preguntando acerca de la diferencia entre `ES2015` (también conocido como `ES6`) y `ES2020`, `ES2020` agrega soporte para `import`s dinámicos e `import.meta`.

#### `node16`/`nodenext` (construcciones nocturnas)

Disponible a partir de 4.7+, los modos `node16` y `nodenext` se integran con el [soporte nativo del módulo *ECMAScript* de *Node*](https://nodejs.org/api/esm.html). El *JavaScript* emitido utiliza la salida `CommonJS` o `ES2020` según la extensión del archivo y el valor de la configuración `type` en el `package.json` más cercano. La resolución del módulo también funciona de manera diferente. Puedes obtener más información en el [manual](https://www.typescriptlang.org/docs/handbook/esm-node.html).

#### `None`

```ts twoslash
// @showEmit
// @module: none
// @noErrors
import { valueOfPi } from "./constants";

export const twoPi = valueOfPi * 2;
```
