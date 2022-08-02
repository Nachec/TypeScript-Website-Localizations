//// { "order": 3, "isJavaScript": true }

// De forma predeterminada, TypeScript no proporciona mensajes de error
// dentro de JavaScript. En cambio, las herramientas se enfocan en
// proporcionando un gran apoyo a los editores.

// Sin embargo, activar los errores es bastante fácil. en un
// archivo JS típico, todo lo que se requiere para activar los mensajes de error
// de TypeScript está agregando el siguiente comentario:

// @ts-check

let myString = "123";
myString = {};

// Esto puede comenzar a agregar muchos garabatos rojos dentro de tu
// archivo JS. Mientras sigues trabajando dentro de JavaScript, tienes
// algunas herramientas para corregir estos errores.

// Para algunos de los errores más complicados, que no siente
// los cambios de código deberían ocurrir, puedes usar anotaciones JSDoc
// para decirle a TypeScript cuáles deberían ser los tipos:

/** @type {string | {}} */
let myStringOrObject = "123";
myStringOrObject = {};

// Sobre el cual puedes leer más aquí: example:jsdoc-support

// Puedes declarar que la falla no es importante, diciendo
// a TypeScript que ignore el siguiente error:

let myIgnoredError = "123";
// @ts-ignore
myStringOrObject = {};

// Puedes utilizar la inferencia de tipos a través del flujo de código para hacer
// cambios en tu JavaScript: example:code-flow
