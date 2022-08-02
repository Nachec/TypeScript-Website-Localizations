---
display: "Sin this implícito"
oneline: "Habilita el reporte de errores cuando a `this` se le asigne el tipo `any`."
---

Genera un error en las expresiones 'this' con un tipo 'any' implícito.

Por ejemplo, la siguiente clase devuelve una función que intenta acceder a `this.width` y a `this.height`, pero el contexto
porque `this` dentro de la función dentro de `getAreaFunction` no es la instancia del `Rectangle`.

```ts twoslash
// @errors: 2683
class Rectangle {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getAreaFunction() {
    return function () {
      return this.width * this.height;
    };
  }
}
```
