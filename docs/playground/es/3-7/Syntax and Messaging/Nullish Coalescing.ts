//// { "compiler": {  }, "order": 2 }

// El operador de fusión nula es una alternativa a ||
// que devuelve la expresión del lado derecho si el lado izquierdo
// es null o undefined.

// Por el contrario, || usa comprobaciones falsas, es decir, una cadena
// vacía o el número 0 se consideraría false.

// Un buen ejemplo de esta característica es el manejo de objetos
// parciales que tienen valores predeterminados cuando no se pasa una clave.

interface AppConfiguration {
  // Predefinido: "(sin nombre)"; cadena vacía ES válida
  name: string;

  // Predefinido: -1; 0 es válido
  items: number;

  // Predefinido: true
  active: boolean;
}

function updateApp(config: Partial<AppConfiguration>) {
  // Con sl operador de fusión nula
  config.name = config.name ?? "(sin nombre)";
  config.items = config.items ?? -1;
  config.active = config.active ?? true;

  // Solución actual
  config.name = typeof config.name === "string" ? config.name : "(sin nombre)";
  config.items = typeof config.items === "number" ? config.items : -1;
  config.active = typeof config.active === "boolean" ? config.active : true;

  // Usar el operador || que podría dar datos incorrectos
  config.name = config.name || "(sin nombre)"; // no permite la entrada ""
  config.items = config.items || -1; // no permite la entrada 0
  config.active = config.active || true; // realmente mal, siempre true
}

// Puedes leer más sobre la fusión nula en la publicación del blog 3.7:
//
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/
