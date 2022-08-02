---
display: "jsxFragmentFactory"
oneline: "Especifica la referencia de fragmento JSX utilizada para los fragmentos al apuntar a la emisión de React JSX, por ejemplo, 'React.Fragment' o 'Fragment'."
---

Especifica la función de fábrica de fragmentos *JSX* que se utilizará cuando se especifique la opción del compilador [`jsxFactory`](#jsxFactory), p. ej. `Fragment`.

Por ejemplo, con este `TSConfig`:

```json tsconfig
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

Este archivo *TSX*:

```tsx
import { h, Fragment } from "preact";

const HelloWorld = () => (
  <>
    <div>Hello</div>
  </>
);
```

Se vería así:

```tsx twoslash
// @showEmit
// @showEmittedFile: index.js
// @jsxFactory: h
// @jsxFragmentFactory: Fragment
// @noErrors
// @target: esnext
// @module: commonjs

import { h, Fragment } from "preact";

const HelloWorld = () => (
  <>
    <div>Hello</div>
  </>
);
```

Esta opción se puede utilizar por archivo demasiado similar a la [directiva *Babel*'s `/* @jsxFrag h */ `](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#fragments).

Por ejemplo:

```tsx twoslash
/** @jsx h */
/** @jsxFrag Fragment */

import { h, Fragment } from "preact";

const HelloWorld = () => (
  <>
    <div>Hello</div>
  </>
);
```
