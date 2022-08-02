---
display: "JSX"
oneline: "Especifica qué código JSX se genera."
---

Controla cómo se emiten las construcciones *JSX* en archivos *JavaScript*.
Esto solo afecta la salida de archivos *JS* que comenzaron en archivos `.tsx`.

- `react` ⏤ Emite archivos `.js` con *JSX* cambiado a las llamadas equivalentes a `React.createElement`
- `react-jsx` ⏤ Emite archivos `.js` con *JSX* cambiado a llamadas `_jsx`
- `react-jsxdev` ⏤ Emite archivos `.js` con *JSX* cambiado a llamadas `_jsx`
- `preserve` ⏤ Emite archivos `.jsx` con *JSX* sin cambios
- `react-native` ⏤ Emite archivos `.js` con el *JSX* sin cambios

### Por ejemplo

Este código de ejemplo:

```tsx
export const HelloWorld = () => <h1>Hello world</h1>;
```

Predefinido: `"react"`

```tsx twoslash
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// @showEmit
// @noErrors
export const HelloWorld = () => <h1>Hello world</h1>;
```

Preserve: `"preserve"`

```tsx twoslash
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// @showEmit
// @noErrors
// @jsx: preserve
export const HelloWorld = () => <h1>Hello world</h1>;
```

*React* nativo: `"react-native"`

```tsx twoslash
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// @showEmit
// @noErrors
// @jsx: react-native
export const HelloWorld = () => <h1>Hello world</h1>;
```

*React* 17 transforma: `"react-jsx"`<sup>[[1]](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)</sup>

```tsx twoslash
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// @showEmit
// @noErrors
// @jsx: react-jsx
export const HelloWorld = () => <h1>Hello world</h1>;
```

*React* 17 `dev` transforma: `"react-jsxdev"`<sup>[[1]](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)</sup>

```tsx twoslash
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// @showEmit
// @noErrors
// @jsx: react-jsxdev
export const HelloWorld = () => <h1>Hello world</h1>;
```
