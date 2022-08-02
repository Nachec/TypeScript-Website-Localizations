---
display: "useUnknownInCatchVariables"
oneline: "Variables predeterminadas de la cláusula `catch` como `unknown` en lugar de `any`."
---
 
En *TypeScript 4.0*, se agregó soporte para permitir cambiar el tipo de variable en una cláusula `catch` de `any` a `unknown`. Permitiendo código como:

```ts twoslash
// @useUnknownInCatchVariables
try {
  // ...
} catch (err: unknown) {
  // Tenemos que verificar que err es un
  // error antes de usarlo como uno.
  if (err instanceof Error) {
    console.log(err.message);
  }
}
```

Este patrón asegura que el código de manejo de errores sea más completo porque no puede garantizar que el objeto que se lanza *sea* una subclase de Error antes de tiempo. Con la marca `useUnknownInCatchVariables` habilitada, entonces no necesitas la sintaxis adicional (`:unknown`) ni una regla de lucimiento para intentar hacer cumplir este comportamiento.