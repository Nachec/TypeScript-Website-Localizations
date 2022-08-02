---
display: "Sin returns implícitos"
oneline: "Habilita el reporte de errores para las rutas de código que explícitamente no tienen `return` en una función."
---

Cuando está habilitado, *TypeScript* verificará todas las rutas de código en una función para asegurarse de que devuelvan un valor.

```ts twoslash
// @errors: 2366 2322
function lookupHeadphonesManufacturer(color: "blue" | "black"): string {
  if (color === "blue") {
    return "beats";
  } else {
    "bose";
  }
}
```
