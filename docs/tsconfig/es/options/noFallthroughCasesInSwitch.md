---
display: "Sin casos fallidos en Switch"
oneline: "Habilita el informe de errores para casos fallidos en declaraciones switch."
---

Reportar errores para casos fallidos en declaraciones switch.
Garantiza que cualquier caso que no esté vacío dentro de una declaración switch incluya `break` o `return`.
Esto significa que no enviará accidentalmente un error de caso de fallo.

```ts twoslash
// @noFallthroughCasesInSwitch
// @errors: 7029
const a: number = 6;

switch (a) {
  case 0:
    console.log("par");
  case 1:
    console.log("impar");
    break;
}
```
