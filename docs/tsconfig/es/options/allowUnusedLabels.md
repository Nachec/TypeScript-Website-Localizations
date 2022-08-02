---
display: "Permitir etiquetas no utilizadas"
oneline: "Deshabilita el informe de errores para las etiquetas no utilizadas."
---

Cuando:

- `undefined` (predeterminado) proporciona sugerencias como advertencias a los editores
- `true` las etiquetas no utilizadas se ignoran
- `false` genera errores del compilador sobre etiquetas no utilizadas

Las etiquetas son muy raras en *JavaScript* y normalmente indican un intento de escribir un objeto literal:

```ts twoslash
// @errors: 7028
// @allowUnusedLabels: false
function verifyAge(age: number) {
  // Se olvidó la declaración 'return'
  if (age > 18) {
    verified: true;
  }
}
```
