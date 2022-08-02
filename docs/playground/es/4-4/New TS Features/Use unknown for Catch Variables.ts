//// { "compiler": { "ts": "4.4.2", "useUnknownInCatchVariables": true } }
// Si `unknown` es nuevo para ti, lee: example:unknown-and-never

// A partir de TypeScript 4.0, has podido cambiar el tipo
// de la variable en una declaración catch del valor predeterminado de
// `any` a `unknown` asignando manualmente el tipo:

try {
  // @ts-ignore
  iWillCrash();
} catch (err) {
  // Esto significa implícitamente que *tienes* que declarar
  // cuál es el tipo antes de poder escribir código
  // contra `err`:
  console.log(err.message);

  // Por ejemplo, tenemos que verificar que sea un
  // error antes de usarlo como uno.
  if (err instanceof Error) {
    console.log(err.message);
  }
}

// Also: example:unknown-in-catch

// Al usar la opción `useUnknownInCatchVariables`,
// puedes tener el compilador predeterminado en `unknown` en lugar de
// `any`. Efectivamente forzando todo el uso de esa variable
// debe ser confirmado por el sistema de tipos antes de su uso.

// Puedes optar por no recibir declaraciones de captura únicas asignando
// la variable a `any`.

try {
  // @ts-ignore
  iWillCrash();
} catch (err: any) {
  // En cuyo caso, puedes tratarlo.
  // como quieras.
  console.log(err.message);
}
