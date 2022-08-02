---
display: "Fábrica JSX"
oneline: "Especifica la función JSX de fábrica que se utiliza al apuntar a React JSX emit, por ejemplo, 'React.createElement' o 'h'."
---

Cambia la función llamada en archivos `.js` al compilar elementos *JSX* usando el entorno de ejecución *JSX* clásico.
El cambio más común es usar `"h"` o `"preact.h"` en lugar del `"React.createElement"` predeterminado si se usa `preact`.

Por ejemplo, este archivo *TSX*:

```tsx
import { h } from "preact";

const HelloWorld = () => <div>Hello</div>;
```

Con `jsxFactory: "h"` se parece a:

```tsx twoslash
// @showEmit
// @showEmittedFile: index.js
// @jsxFactory: h
// @noErrors
// @target: esnext
// @module: commonjs

import { h, Fragment } from "preact";

const HelloWorld = () => <div>Hello</div>;
```

Esta opción se puede utilizar por archivo, demasiado similar a [*Babel*'s directiva `/**@jsx h */`](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#custom).

```tsx twoslash
/** @jsx h */
import { h } from "preact";

const HelloWorld = () => <div>Hello</div>;
```

La fábrica elegida también afectará dónde se busca el espacio de nombres `JSX` (para obtener información de verificación de tipo) antes de volver al global.

Si la fábrica se define como `React.createElement` (el valor predeterminado), el compilador buscará `React.JSX` antes de buscar un `JSX` global. Si la fábrica se define como `h`, buscará `h.JSX` antes de un `JSX` global.
