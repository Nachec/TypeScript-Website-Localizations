---
display: "No hay locales no utilizados"
oneline: "Habilita el informe de errores cuando no se lean las variables locales."
---

Reportar errores en variables locales no utilizadas.

```ts twoslash
// @noUnusedLocals
// @errors: 6133
const createKeyboard = (modelID: number) => {
  const defaultModelID = 23;
  return { type: "keyboard", modelID };
};
```
