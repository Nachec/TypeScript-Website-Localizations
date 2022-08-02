---
display: "Declaration"
oneline: "Genera archivos .d.ts a partir de archivos TypeScript y JavaScript en su proyecto."
---

Genera archivos `.d.ts` para cada archivo *TypeScript* o *JavaScript* dentro de tu proyecto.
Estos archivos `.d.ts` son archivos de definición de tipos que describen la *API* externa de tu módulo.
Con archivos `.d.ts`, herramientas como *TypeScript* pueden proporcionar tipos *intellisense* y precisos para código sin escribir.

Cuando `declaration` se establece en `true`, se ejecuta el compilador con este código *TypeScript*:

```ts twoslash
export let helloWorld = "hi";
```

Generará un archivo `index.js` como este:

```ts twoslash
// @showEmit
export let helloWorld = "hi";
```

Con un `helloWorld.d.ts` correspondiente:

```ts twoslash
// @showEmittedFile: index.d.ts
// @showEmit
// @declaration
export let helloWorld = "hi";
```

Cuando trabajes con archivos `.d.ts` para archivos *JavaScript*, puedes usar [`emitDeclarationOnly`](#emitDeclarationOnly) o usar [`outDir`](#outDir) para asegurarte de que los archivos *JavaScript* no se sobrescriban.
