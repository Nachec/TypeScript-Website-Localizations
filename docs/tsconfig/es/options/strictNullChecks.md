---
display: "Comprobación estricta de Null"
oneline: "Cuando la comprobación de tipo, tenga en cuenta `null` y `undefined`."
---

Cuando `strictNullChecks` es `false`, el lenguaje ignora efectivamente los valores `null` y `undefined`.
Esto puede provocar errores inesperados en el entorno de ejecución.

Cuando `strictNullChecks` es `true`, `null` y `undefined` tienen sus propios tipos distintos y obtendrás un error de tipo si intentas usarlos donde se espera un valor concreto.

Por ejemplo, con este código *TypeScript*, `users.find` no tiene garantía de que realmente encontrará un usuario, pero puedes
escribir código como si fuera a:

```ts twoslash
// @strictNullChecks: false
// @target: ES2015
declare const loggedInUsername: string;

const users = [
  { name: "Oby", age: 12 },
  { name: "Heera", age: 32 },
];

const loggedInUser = users.find((u) => u.name === loggedInUsername);
console.log(loggedInUser.age);
```

Establecer `estricNullChecks` en `true` generará un error que indica que no ha garantizado que el `logInUser` exista antes de intentar usarlo.

```ts twoslash
// @errors: 2339 2532
// @target: ES2020
// @strictNullChecks
declare const loggedInUsername: string;

const users = [
  { name: "Oby", age: 12 },
  { name: "Heera", age: 32 },
];

const loggedInUser = users.find((u) => u.name === loggedInUsername);
console.log(loggedInUser.age);
```

El segundo ejemplo falló porque la función `find` del arreglo se parece un poco a esta simplificación:

```ts
// Cuando StrictNullChecks: true
type Array = {
  find(predicate: (value: any, index: number) => boolean): S | undefined;
};

// Cuando StrictNullChecks: false el undefined se elimina del sistema de tipos,
// permitiéndote escribir código que asume que siempre encontró un resultado
type Array = {
  find(predicate: (value: any, index: number) => boolean): S;
};
```
