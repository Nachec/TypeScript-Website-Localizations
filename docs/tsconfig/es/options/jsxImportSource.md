---
display: "jsxImportSource"
oneline: "Especifica el especificador de módulo utilizado para importar las funciones de fábrica JSX cuando se usa `jsx: react-jsx*`."
---

Declara el especificador de módulo que se utilizará para importar las funciones de fábrica `jsx` y `jsxs` cuando se utilice [`jsx`](#jsx) como `"react-jsx"` o `"react-jsxdev"`que se introdujeron en *TypeScript 4.1*.

Con [*React 17*](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) la biblioteca admite una nueva forma de transformación *JSX* a través de una importación separada.

Por ejemplo con este código:

```tsx
import React from "react";

function App() {
  return <h1>Hello World</h1>;
}
```

Usando este `TSConfig`:

```json tsconfig
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react-jsx"
  }
}
```

El *JavaScript* emitido por *TypeScript* es:

```tsx twoslash
// @showEmit
// @noErrors
// @jsx: react-jsx
// @module: commonjs
// @target: esnext
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
import React from "react";

function App() {
  return <h1>Hello World</h1>;
}
```

Por ejemplo, si deseas utilizar "jsxImportSource": "preact"`, necesitas un `tsconfig` como:

```json tsconfig
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "tipos": ["preact"]
  }
}
```

Que genera código como:

```tsx twoslash
// @showEmit
// @jsxImportSource: preact
// @types: preact
// @jsx: react-jsx
// @target: esnext
// @module: commonjs
// @noErrors

export function App() {
  return <h1>Hello World</h1>;
}
```

Alternativamente, puedes usar un pragma por archivo para configurar esta opción, por ejemplo:

```tsx
/** @jsxImportSource preact */

export function App() {
  return <h1>Hello World</h1>;
}
```

Agregaría `preact/jsx-runtime` como una importación para la fábrica `_jsx`.

*Nota*: Para que esto funcione como es de esperar, tu archivo `tsx` debe incluir una `export` o una `import` para que se considere un módulo.
