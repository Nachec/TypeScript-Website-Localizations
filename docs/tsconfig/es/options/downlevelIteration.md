---
display: "Iteración de nivel inferior"
oneline: "Emite JavaScript más compatible, pero detallado y con menos rendimiento para la iteración."
---

*Degradar el nivel* es el término de *TypeScript* para transpilar a una versión anterior de *JavaScript*.
Esta marca es para permitir el soporte para una implementación más precisa de cómo *JavaScript* moderno itera a través de nuevos conceptos en entornos de ejecución de *JavaScript* más antiguos.

*ECMAScript 6* agregó varios primitivos de iteración nuevos: el bucle `for / of` (`for (el of arr)`), Array spread (`[a, ... b]`), argumento spread (`fn(...args)`) y `Symbol.iterator`.
`downlevelIteration` permite que estos primitivos de iteración se utilicen con mayor precisión en entornos *ES5* si existe una implementación de `Symbol.iterator`.

#### Ejemplo: Efectos sobre `for / of`

Con este código *TypeScript*:Código *TypeScript*

```ts twoslash
const str = "Hello!";
for (const s of str) {
  console.log(s);
}
```

Sin `downlevelIteration` habilitado, un bucle `for / of` en cualquier objeto se reduce a un bucle `for` tradicional:

```ts twoslash
// @target: ES5
// @showEmit
const str = "Hello!";
for (const s of str) {
  console.log(s);
}
```

Esto a menudo es lo que la gente espera, pero no es 100% compatible con el protocolo de iteración *ECMAScript*.
Ciertas cadenas, como emoji (😜), tienen un `.length` de 2 (¡o incluso más!), pero se deben repetir como 1 unidad en un bucle  for-of`.
Consulta [esta publicación del blog de Jonathan New](https://blog.jonnew.com/posts/poo-dot-length-equals-two) para obtener una explicación más detallada.

Cuando `downlevelIteration` está habilitado, *TypeScript* usará una función auxiliar que verifica una implementación de `Symbol.iterator` (ya sea nativa o `polyfill`).
Si falta esta implementación, recurrirá a la iteración basada en índices.

```ts twoslash
// @target: ES5
// @downlevelIteration
// @showEmit
const str = "Hello!";
for (const s of str) {
  console.log(s);
}
```

Puedes usar [`tslib`](https://www.npmjs.com/package/tslib) a través de [`importHelpers`](#importHelpers) para reducir la cantidad de *JavaScript* en línea también:

```ts twoslash
// @target: ES5
// @downlevelIteration
// @importHelpers
// @showEmit
const str = "Hello!";
for (const s of str) {
  console.log(s);
}
```

**Nota**: habilitar `downlevelIteration` no mejora el cumplimiento si `Symbol.iterator` no está presente en el entorno de ejecución.

#### Ejemplo: Efectos sobre la propagación de arreglo

Esta es una extensión de arreglo:

```js
// Hace una nuevo arreglo cuyos elementos sean 1 seguidos de los elementos de arr2
const arr = [1, ...arr2];
```

Según la descripción, parece fácil bajar de nivel a *ES5*:

```js
// Lo mismo, ¿cierto?
const arr = [1].concat(arr2);
```

Sin embargo, esto es notablemente diferente en algunos casos raros.
Por ejemplo, si un arreglo tiene un "agujero", el índice faltante creará una propiedad `own` si se extiende, pero no lo hará si se construye usando `concat`:

```js
// Hace un arreglo donde falta el elemento '1'
let missing = [0, , 1];
let spreaded = [...missing];
let concated = [].concat(missing);

// true
"1" in spreaded;
// false
"1" in concated;
```

Al igual que con `for / of`, `downlevelIteration` utilizará `Symbol.iterator` (si está presente) para emular con mayor precisión el comportamiento de *ES 6*.
