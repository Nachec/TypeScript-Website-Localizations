// Any es la cláusula de escape de TypeScript. Puedes usar any para
// declarar que una sección de tu código sea dinámica y
// similar a JavaScript, o para solucionar las limitaciones
// en el sistema de tipos.

// Un buen caso para any es el análisis JSON:

const myObject = JSON.parse("{}");

// Any declara a TypeScript que confía en tu código como
// seguro porque sabes más sobre él. Incluso si eso
// no es estrictamente cierto. Por ejemplo, este código fallaría:

myObject.x.y.z;

// El uso de any te da la capacidad de escribir código más cercano a
// JavaScript original con la compensación de la seguridad de tipos.

// any es muy parecido a un 'tipo comodín' que puedes reemplazar
// con cualquier tipo (excepto never) para hacer que un tipo sea asignable
// al otro.

declare function debug(value: any): void;

debug("a string");
debug(23);
debug({ color: "blue" });

// Cada llamada a debug está permitida porque podrías reemplazar el
// a any con el tipo de argumento que debe coincidir.

// TypeScript tendrá en cuenta la posición de los
// anys en diferentes formas, por ejemplo con estas tuplas
// para el argumento de la función.

declare function swap(x: [number, string]): [string, number];

declare const pair: [any, any];
swap(pair);

// La llamada a swap está permitida porque el argumento se puede
// emparejar reemplazando el primero any en el par con el número
// y el segundo `any` con una cadena.

// Si las tuplas son nuevas para ti, consulta: example:tuples

// Unknown es un tipo hermano para any, si any trata de decir
// "Sé lo que es mejor", entonces unknown es una forma de decir "No
// estoy seguro de qué es lo mejor, por lo que debes indicarle a TS el tipo"
// example:unknown-and-never
