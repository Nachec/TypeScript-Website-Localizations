//// { "compiler": { "ts": "4.1.0-beta" } }

// Con 4.1 el analizador JSDoc en TypeScript
// utilizado en archivos JavaScript y TypeScript
// admite el parámetro @see.

// Puedes usar @see para ayudar a las personas a saltar
// rápidamente a otro código relacionado haciendo clic
// (cmd/ctrl + clic) u obteniendo información de desplazamiento

/**
 * @see hello
 */
const goodbye = "Good";

/**
 * You say hi, I say low
 *
 * @see goodbye
 */
const hello = "Hello, hello";
