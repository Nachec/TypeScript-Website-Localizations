---
display: "noUncheckedIndexedAccess"
oneline: "Agrega `undefined` a un tipo cuando se acceda mediante un índice ."
---

*TypeScript* tiene una forma de describir objetos que tienen claves desconocidas pero valores conocidos en un objeto, a través de índice de firmas.

```ts twoslash
interface EnvironmentVars {
  NAME: string;
  OS: string;

  // Las propiedades desconocidas están cubiertas por este índice de firma.
  [nombrePropiedad: string]: string;
}

declare const env: EnvironmentVars;

// Declarado como existente
const sysName = env.NAME;
const os = env.OS;
//    ^?

// No declarado, pero debido al índice
// de firma, entonces se considera una cadena
const nodeEnv = env.NODE_ENV;
//    ^?
```

Activar `noUncheckedIndexedAccess` agregará `undefined` a cualquier campo no declarado en el tipo.

```ts twoslash
interface EnvironmentVars {
  NAME: string;
  OS: string;

  // Las propiedades desconocidas están cubiertas por este índice de firma.
  [nombrePropiedad: string]: string;
}
// @noUncheckedIndexedAccess
// ---cut---
declare const env: EnvironmentVars;

// Declarado como existente
const sysName = env.NAME;
const os = env.OS;
//    ^?

// No declarado, pero debido al índice
// de firma, entonces se considera una cadena
const nodeEnv = env.NODE_ENV;
//    ^?
```
