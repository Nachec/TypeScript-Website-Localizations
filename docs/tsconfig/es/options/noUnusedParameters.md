---
display: "Sin parámetros no utilizados"
oneline: "Genera un error cuando no se lee un parámetro de función."
---

Informar errores sobre parámetros no utilizados en funciones.

```ts twoslash
// @noUnusedParameters
// @errors: 6133
const createDefaultKeyboard = (modelID: number) => {
  const defaultModelID = 23;
  return { type: "keyboard", modelID: defaultModelID };
};
```
