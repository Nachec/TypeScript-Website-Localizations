//// { "order": 3, "isJavaScript": true }

// El playground ahora puede manejar archivos JavaScript.

// Es bastante razonable preguntarse por qué agregaríamos soporte
// para JavaScript en el playground, pero es probable que la
// mayoría de los usuarios de TypeScript utilizan JavaScript.

// TypeScript puede utilizar tipos inferidos, adquisición de tipos y
// compatibilidad con JSDoc en un archivo JavaScript para proporcionar un gran
// entorno de herramientas:
//
//  example:objects-and-arrays
//  example:automatic-type-acquisition
//  example:jsdoc-support

// Que el playground admita JavaScript significa que
// puedes aprender y guiar a las personas a través de complicados
// ejemplos JSDoc o problemas de depuración cuando hay expectativas
// desajustadas.

// Por ejemplo, ¿por qué no se escribe este comentario JSDoc
// correctamente?

/**
 * Suma dos números
 * @param {number} El primer número
 * @param {number} El segundo número
 * @returns {number}
 */
function addTwoNumbers(a, b) {
  return a + b;
}

// Es mucho más fácil darse cuenta de eso en un entorno
// donde instantáneamente puedes ver lo que está sucediendo al pasar el mouse.
