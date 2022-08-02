---
display: "preserveValueImports"
oneline: "Conservar los valores importados no utilizados en la salida JavaScript que de otro modo se eliminarían."
---

Hay algunos casos en los que *TypeScript* no puede detectar que está utilizando una importación. Por ejemplo, toma el siguiente código:

```ts
import { Animal } from "./animal.js";

eval("console.log(new Animal().isDangerous())");
```

o código usando lenguajes 'Compila a HTML' como *Svelte* o *Vue*.

Cuando se combina con [`isolatedModules`](#isolatedModules): los tipos importados *deben* estar marcados como de solo tipo porque los compiladores que procesan archivos individuales a la vez no tienen forma de saber si las importaciones son valores que parecen no utilizados o un tipo que se debe eliminar para evitar un bloqueo en el entorno de ejecución.

Por ejemplo, en el siguiente código, `TitleComponent` es una función y `TitleComponentProps` es un tipo con `isolatedModules` y `preserveValueImports` están habilitados:

```ts twoslash
// @errors: 1444
// @preserveValueImports: true
// @isolatedModules: true
// @module: es2015

// @filename: TitleComponent.ts
export function TitleComponent() {}
export interface TitleComponentProps {}
// @filename: index.ts
// ---cut---
import { TitleComponent, TitleComponentProps } from "./TitleComponent.js";
```

Lo cual se puede arreglar colocando el prefijo `TitleComponentProps` con `type` para marcarlo como una importación de solo tipo:

```ts twoslash
// @preserveValueImports: true
// @isolatedModules: true
// @module: es2015

// @filename: TitleComponent.ts
export function TitleComponent() {}
export interface TitleComponentProps {}
// @filename: index.ts
// ---cut---
import { TitleComponent, type TitleComponentProps } from "./TitleComponent.js";
```
