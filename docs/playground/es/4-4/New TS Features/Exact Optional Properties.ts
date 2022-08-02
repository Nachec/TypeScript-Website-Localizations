//// { "compiler": { "ts": "4.4.2", "exactOptionalPropertyTypes": true } }
// Con exactOptionalPropertyTypes habilitado, TypeScript
// tiene reglas más estrictas sobre lo que puedes establecer en una
// propiedad opcional.

// Por ejemplo, esta interfaz declara que hay una
// propiedad que puede ser una de dos cadenas: 'dark' o 'light'
// o no debería estar en el objeto.

interface UserDefaults {
  // La ausencia de un valor representa 'system'
  colorThemeOverride?: "dark" | "light";
}

// Sin esta bandera habilitada, hay tres valores que puedes
// establecer `colorThemeOverride` en: `"dark"`, `"light"` y `undefined`.

// Establecer el valor en `undefined` permitirá la mayor parte del entorno de ejecución de JavaScript
// comprueba que la existencia falle, lo cual efectivamente es falso.
// Sin embargo, hay una confusión en este comportamiento. La definición
// para `colorThemeOverride` *no* incluye `undefined`.

// La marca `exactOptionalPropertyTypes` hace que TypeScript sea preciso
// al coincidir con la definición proporcionada como una propiedad opcional.

declare function getUserSettings(): UserDefaults;

const settings = getUserSettings();
settings.colorThemeOverride = "dark";
settings.colorThemeOverride = "light";

// Pero no:
settings.colorThemeOverride = undefined;

// Antes de la marca `exactOptionalPropertyTypes`, esto no era posible.
