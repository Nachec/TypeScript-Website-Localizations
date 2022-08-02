---
display: "noPropertyAccessFromIndexSignature"
oneline: "Exige el uso de descriptores de acceso indexado para las claves declaradas con un tipo indexado."
---

Esta configuración garantiza la coherencia entre el acceso a un campo a través de la sintaxis "punto" (`obj.key`) e "indexado" (`obj["key"]`) y la forma en que se declara la propiedad en el tipo.

Sin esta marca, *TypeScript* te permitirá usar la sintaxis de punto para acceder a campos que no están definidos:

```ts twoslash
// @errors: 4111
declare function getSettings(): GameSettings;
// ---cut---
interface GameSettings {
  // Known up-front properties
  speed: "fast" | "medium" | "slow";
  quality: "high" | "low";

  // Asume cualquier cosa desconocida para la interfaz
  // es una cadena.
  [key: string]: string;
}

const settings = getSettings();
settings.speed;
//       ^?
settings.quality;
//       ^?

// Se permiten accesos de clave desconocidos en
// este objeto, y son `string`
settings.username;
//       ^?
```

Activar la bandera generará un error porque el campo desconocido usa sintaxis de punto en lugar de sintaxis indexada.

```ts twoslash
// @errors: 4111
// @noPropertyAccessFromIndexSignature
declare function getSettings(): GameSettings;
interface GameSettings {
  speed: "fast" | "medium" | "slow";
  quality: "high" | "low";
  [key: string]: string;
}
// ---cut---
const settings = getSettings();
settings.speed;
settings.quality;

// Esto debería ser la configuración ["username"];
settings.username;
//       ^?
```

El objetivo de esta bandera es señalar la intención en la sintaxis de la llamada sobre qué tan seguro estás de que existe esta propiedad.
