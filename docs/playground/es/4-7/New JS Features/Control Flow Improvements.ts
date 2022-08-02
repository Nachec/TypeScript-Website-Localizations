//// { "compiler": { "ts": "4.7.3" } }
// En casi todas las versiones hay mejoras en el control de flujo,
// en 4.7 hay mejoras en el trabajo de propiedades calculadas cuando
// se reduce. Para obtener más información sobre la reducción, consulta: example:type-widening-and-narrowing

const dog = "stringer";

const dogsToOwnersOrID = {
  hayes: "The McShanes",
  poppy: "Pat",
  stringer: "Jane",
  otto: 1,
} as Record<string, string | number>;

// Una propiedad calculada es un acceso a la propiedad que no está codificada,
// por ejemplo:

const owner = dogsToOwnersOrID[dog];
//    ^?

// Antes de *TypeScript 4.7*, el uso de una propiedad calculada en
// realidad noreduce de forma fiable el tipo de un valor.

if (typeof dogsToOwnersOrID[dog] === "string") {
  const str = dogsToOwnersOrID[dog].toUpperCase();
  //     ^?

  // En 4.6, esta debería ser 'string | number'.
}
