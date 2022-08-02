//// { "order": 3, "isJavaScript": true }

// TypeScript tiene un soporte JSDoc muy rico, para muchos casos
// incluso puedes omitir hacer tus archivos .ts y simplemente usar
// anotaciones JSDoc para crear un entorno de desarrollo rico.
//
// Un comentario JSDoc es un comentario de varias líneas que comienza con
// dos estrellas en lugar de una.

/* Este es un comentario normal */
/** Este es un comentario JSDoc */

// Los comentarios JSDoc se adjuntan al código JavaScript
// más cercano debajo de él.

const myVariable = "Hi";

// Si pasas el cursor sobre myVariable, puede ver que tiene el
// texto desde el interior del comentario JSDoc adjunto.

// Los comentarios JSDoc son una forma de proporcionar información de tipo a
// TypeScript y a tus editores. Empecemos con uno fácil
// establece el tipo de una variable en un tipo integrado.

// Para todos estos ejemplos, puedes colocar el cursor sobre el nombre,
// y en la siguiente línea intenta escribir [ejemplo]. ver las
// opciones de autocompletado.

/** @type {number} */
var myNumber;

// Puedes ver todas las etiquetas admitidas en el manual:
//
// https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#supported-jsdoc

// Sin embargo, intentaremos repasar algunos de los ejemplos más comunes.
// aquí. También puedes copiar y pegar cualquier ejemplo del manual
// aquí.

// Importar los tipos de archivos de configuración de JavaScript:

/** @type { import("webpack").Config } */
const config = {};

// Crear un tipo complejo para reutilizar en muchos lugares:

/**
 * @typedef {Object} User - una cuenta de usuario
 * @property {string} displayName - el nombre usado para mostrarlo al usuario
 * @property {number} id - un identificador único
 */

// Luego úsalo haciendo referencia al nombre de typedef:

/** @type { User } */
const user = {};

// Existe la abreviatura de tipo en línea compatible con TypeScript,
// que puedes usar tanto para type como para typedef:

/** @type {{ owner: User, name: string }} */
const resource;

/** @typedef {{owner: User, name: string}} Resource */

/** @type {Resource} */
const otherResource;

// Declarar una función tipada:

/**
 * Suma dos números
 * @param {number} a - El primer número
 * @param {number} b - El segundo número
 * @returns {number}
 */
function addTwoNumbers(a, b) {
  return a + b;
}

// Puedes utilizar la mayoría de las herramientas de tipo de TypeScript, como uniones:

/** @type {(string | boolean)} */
let stringOrBoolean = "";
stringOrBoolean = false;

// Extender globales en JSDoc es un proceso más complicado
// que puedes ver en la documentación de VS Code:
//
// https://code.visualstudio.com/docs/nodejs/working-with-javascript#_global-variables-and-type-checking

// Agregar comentarios JSDoc a tus funciones es beneficioso para toda
// situación; obtienes mejores herramientas y también todos los
// consumidores de tu API.
