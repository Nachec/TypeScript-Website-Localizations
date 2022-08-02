---
display: "Fuentes en línea"
oneline: "Incluye el código fuente en los mapas fuente dentro del JavaScript emitido."
---

Cuando se establece, *TypeScript* incluirá el contenido original del archivo `.ts` como una cadena incrustada en el mapa fuente (usando la propiedad del map fuente `sourceContent`).
Esto suele ser útil en los mismos casos que [`inlineSourceMap`](#inlineSourceMap).

Requiere que se establezca [`sourceMap`](#sourceMap) o [`inlineSourceMap`](#inlineSourceMap).

Por ejemplo, con este *TypeScript*:

```ts twoslash
const helloWorld = "hi";
console.log(helloWorld);
```

De forma predeterminada, se convierte a este *JavaScript*:

```ts twoslash
// @showEmit
const helloWorld = "hi";
console.log(helloWorld);
```

Luego habilita la construcción con `inlineSources` y [`inlineSourceMap`](#inlineSourceMap) habilitado; hay un comentario en la parte inferior del archivo que incluye
un mapa fuente para el archivo.
Ten en cuenta que el final es diferente del ejemplo en [`inlineSourceMap`](#inlineSourceMap) porque el mapa fuente ahora también contiene el código fuente original.

```ts twoslash
// @inlineSources
// @inlineSourceMap
// @showEmit
const helloWorld = "hi";
console.log(helloWorld);
```
