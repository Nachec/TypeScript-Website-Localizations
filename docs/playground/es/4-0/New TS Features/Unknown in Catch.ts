//// { "compiler": { "ts": "4.0.2" } }

// Debido a que JavaScript permite arrojar cualquier valor, TypeScript
// no admite declarar el tipo de un error

try {
  // ..
} catch (e) { }

// Históricamente, esto ha significado que la `e` en catch
// de manera predeterminada sea any. Esto permitió la libertad de
// acceder arbitrariamente a cualquier propiedad. Con 4.0, hemos aflojado
// las restricciones sobre la asignación de tipo en la cláusula catch
// para permitir tanto `any` como `unknown`.

// Mismo comportamiento con any:
try {
  // ..
} catch (e) {
  e.stack;
}

// Comportamiento explícito con unknown:

try {
  // ..
} catch (e: unknown) {
  // No puede usar `e` en absoluto hasta que el sistema
  // de tipos aprenda lo que es, para obtener más información, consulta:
  // example:unknown-and-never
  e.stack;

  if (e instanceof SyntaxError) {
    e.stack;
  }
}
