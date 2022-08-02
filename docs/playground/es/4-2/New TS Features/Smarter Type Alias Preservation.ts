//// { "compiler": { "ts": "4.2.0-beta" } }
// Los alias de tipo se diferencian de las interfaces en que no se garantiza que
// mantengan su nombre tal como se utilizan en todo el compilador. En parte, esto
// es una compensación en lo que les da su flexibilidad, pero la desventaja
// es que a veces TypeScript muestra un objeto en lugar del nombre.

// En 4.2, el compilador realiza un seguimiento del nombre original de un alias de tipo
// en más lugares. Reducir el tamaño de los mensajes de error y las sugerencias flotantes.

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number };

type Named = { name: string };

// Previamente: Shape
declare let shape: Shape;

// No hay cambios allí, pero si tomas la unión de forma existente y la extiendes,
// entonces TypeScript solía 'perder' el nombre original:

// Previamente: { kind: "circle"; radius: number; | { kind: "square"; size: number; | { kind: "rectangle"; width: number; height: number; | undefined
declare let optionalShape: Shape | undefined;

// Previamente: { kind: "circle"; radius: number; | { kind: "square"; size: number; | { kind: "rectangle"; width: number; height: number; | undefined
declare let namedShape: Shape & Named;

// Previamente: ({ kind: "circle"; radius: number; Named) | ({ kind: "square"; size: number; Named) | ({ kind: "rectangle"; width: number; height: number; Named) | undefined
declare let optionalNamedShape: (Shape & Named) | undefined; // (Shape & Named) | undefined
