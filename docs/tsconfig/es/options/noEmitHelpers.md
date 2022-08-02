---
display: "No Emitir ayudantes"
oneline: "Deshabilita la generación de funciones auxiliares personalizadas como `__extends` en la salida compilada."
---

En lugar de importar ayudantes con [`importHelpers`](#importHelpers), puede proporcionar implementaciones en el ámbito global para los ayudantes que usa y desactivar por completo la emisión de funciones auxiliares.

Por ejemplo, el uso de esta función `async` en *ES5* requiere una función similar a `await` y una función similar a `generator` para ejecutarse:

```ts twoslash
const getAPI = async (url: string) => {
  // Obtener API
  return {};
};
```

Lo que crea bastante *JavaScript*:

```ts twoslash
// @showEmit
// @target: ES5
const getAPI = async (url: string) => {
  // Obtener API
  return {};
};
```

Que se puede cambiar con tus propios globales a través de esta bandera:

```ts twoslash
// @showEmit
// @target: ES5
// @noEmitHelpers
const getAPI = async (url: string) => {
  // Obtener API
  return {};
};
```
