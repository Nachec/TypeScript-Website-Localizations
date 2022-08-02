---
display: "Permite JS"
oneline: "Permite que los archivos JavaScript formen parte de tu programa. Utiliza la opción `checkJS` para obtener errores de estos archivos."
---

Permite que se importen archivos *JavaScript* dentro de tu proyecto, en lugar de solo archivos `.ts` y `.tsx`. Por ejemplo, este archivo *JS*:

```js twoslash
// @filename: card.js
export const defaultCardDeck = "Heart";
```

Cuando se importa a un archivo de *TypeScript* generará un error:

```ts twoslash
// @errors: 2307
// @filename: card.js
module.exports.defaultCardDeck = "Heart";
// ---cut---
// @filename: index.ts
import { defaultCardDeck } from "./card";

console.log(defaultCardDeck);
```

Importa bien con `allowJs` habilitado:

```ts twoslash
// @filename: card.js
module.exports.defaultCardDeck = "Heart";
// ---cut---
// @allowJs
// @filename: index.ts
import { defaultCardDeck } from "./card";

console.log(defaultCardDeck);
```

Esta marca se puede utilizar como una forma de agregar incrementalmente archivos *TypeScript* en proyectos *JS* permitiendo que los archivos `.ts` y `.tsx` vivan junto con los archivos *JavaScript* existentes.
