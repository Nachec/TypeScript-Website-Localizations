---
display: "Permitir código inalcanzable"
oneline: "Deshabilita el informe de errores para el código inalcanzable."
---

Cuando:

- `undefined` (predeterminado) proporciona sugerencias como advertencias a los editores
- `true` ignora el código inalcanzable
- `false` genera errores del compilador sobre el código inalcanzable

Estas advertencias solo son sobre el código que es demostrablemente inalcanzable debido al uso de la sintaxis de *JavaScript*, por ejemplo:

```ts
function fn(n: number) {
  if (n > 5) {
    return true;
  } else {
    return false;
  }
  return true;
}
```

Con `"allowUnreachableCode": false`:

```ts twoslash
// @errors: 7027
// @allowUnreachableCode: false
function fn(n: number) {
  if (n > 5) {
    return true;
  } else {
    return false;
  }
  return true;
}
```

Esto no afecta a los errores basados ​​en el código que *parece* no ser accesible debido al análisis de tipo.
