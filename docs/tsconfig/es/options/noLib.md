---
display: "Sin Lib"
oneline: "Desactiva la inclusión de cualquier archivo de biblioteca, incluido el `lib.d.ts` predeterminado."
---

Desactiva la inclusión automática de cualquier archivo de biblioteca.
Si esta opción está configurada, `lib` se ignora.

*TypeScript no puede* compilar nada sin un conjunto de interfaces para primitivos clave como: `Array`, `Boolean`, `Function`, `IArguments`, `Number`, `Object`, `RegExp` y `String`. Se espera que si usas `noLib`, incluirás tus propias definiciones de tipo para estos.
