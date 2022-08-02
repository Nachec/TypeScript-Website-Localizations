---
display: "Eliminar comentarios"
oneline: "Desactivar la emisión de comentarios."
---

Elimina todos los comentarios de los archivos *TypeScript* al convertirlos a *JavaScript*. El valor predeterminado es `false`.

Por ejemplo, este es un archivo *TypeScript* que tiene un comentario *JSDoc*:

```ts
/** La traducción de 'Hello world' al portugués */
export const helloWorldPTBR = "Olá Mundo";
```

Cuando `removeComments` se establece en `true`:

```ts twoslash
// @showEmit
// @removeComments: true
/** La traducción de 'Hello world' al portugués */
export const helloWorldPTBR = "Olá Mundo";
```

Sin establecer `removeComments` o tenerlo como `false`:

```ts twoslash
// @showEmit
// @removeComments: false
/** La traducción de 'Hello world' al portugués */
export const helloWorldPTBR = "Olá Mundo";
```

Esto significa que tus comentarios aparecerán en el código *JavaScript*.
