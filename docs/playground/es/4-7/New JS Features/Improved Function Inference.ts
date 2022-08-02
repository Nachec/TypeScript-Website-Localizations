//// { "compiler": { "ts": "4.7.3" } }
// Con *TypeScript 4.7*, hay mejoras en cómo los tipos
// se infieren de las llamadas a funciones tipadas.

// Toma esta función `cache`, toma un parámetro de tipo, `Type`
// y un argumento de función, que contiene dos funciones.

declare function cache<Type>(arg: { add: (n: string) => Type; process: (x: Type) => void }): void;

// Cuando *TypeScript* está tratando de inferir el tipo de `Type`, este
// tiene dos potenciales lugares para buscar:
//
// - el regreso de 'add'
// - el primer parámetro de 'remove'

// La inferencia de código de *TypeScript* ahora toma más en cuenta estos casos
// con más estilos de código, y también manejar casos donde los
// Los tipos dependen unos de otros.

cache({
  add: n => n,
  process: x => x.toLowerCase(),
});

// Aquí Type = string porque `add` devuelve una cadena
// con cuál es el tipo del parámetro. Sin embargo, versiones anteriores de
// *TypeScript* inferiría Type = any/unknown porque ambos
// add y process se evaluarían al mismo tiempo.

cache({
  add: function (str) {
    return { value: str + "!" };
  },
  process: x => x.value.toLowerCase(),
});

// Aquí Type = { value: string }

cache({
  add() {
    return 23;
  },
  process: x => x + 1,
});

// Aquí Tipo = number

// Esto ayuda a los usuarios de JavaScript y TypeScript a experimentar
// anys menos accidentales cuando se trabaja en diferentes
// estilos de código.
