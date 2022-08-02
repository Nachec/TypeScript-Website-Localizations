---
display: "exactOptionalPropertyTypes"
oneline: "Interpreta los tipos de propiedad opcionales tal como están escritos, en lugar de agregar `undefined`."
---

Con `exactOptionalPropertyTypes` habilitado, *TypeScript* aplica reglas más estrictas sobre cómo maneja las propiedades en `type` o `interfaces` que tienen un prefijo `?`.

Por ejemplo, esta interfaz declara que hay una propiedad que puede ser una de dos cadenas: `'dark'` o `'light'` o no debería estar en el objeto.

```ts
interface UserDefaults {
  // La ausencia de un valor representa 'system'
  colorThemeOverride?: "dark" | "light";
}
```

Sin esta bandera habilitada, hay tres valores que puedes establecer en `colorThemeOverride` para que sean: `"dark"`, `"light"` y `undefined`.

Establecer el valor en `undefined` permitirá que la mayoría de las comprobaciones en el entorno de ejecución de *JavaScript* para la existencia fallen, lo cual es efectivamente falso. Sin embargo, esto no es del todo exacto `colorThemeOverride: undefined` no es lo mismo que `colorThemeOverride` no está definido. Por ejemplo, `"colorThemeOverride" in the settings` tendría un comportamiento diferente con `undefined` como clave en comparación con no estar definido.

`exactOptionalPropertyTypes` hace que *TypeScript* realmente aplique la definición proporcionada como una propiedad opcional:

```ts twoslash
// @exactOptionalPropertyTypes
// @errors: 2322 2412
interface UserDefaults {
  colorThemeOverride?: "dark" | "light";
}
declare function getUserSettings(): UserDefaults;
// ---cut---
const settings = getUserSettings();
settings.colorThemeOverride = "dark";
settings.colorThemeOverride = "light";

// Pero no:
settings.colorThemeOverride = undefined;
```
