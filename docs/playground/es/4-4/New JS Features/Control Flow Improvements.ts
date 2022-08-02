//// { "compiler": { "ts": "4.4.2" } }
// Análisis de control de flujo es el nombre del sistema que
// reduce los tipos potenciales en los que se puede basar un identificador
// en el código que alguien ha escrito, puedes obtener una descripción general
// en example:type-widening-and-narrowing

// Básicamente, el Control Flow Analysis te permite escribir código como
// el seguimiento:

declare const userInput: string | number;
if (typeof userInput === "string") {
  userInput; // string
} else {
  userInput; // number
}

// En este caso, antes de TypeScript 4.4, el análisis de flujo de código
// solo se aplicaría al código dentro de la declaración if.
// Esto significa que una refactorización muy simple como la siguiente:

const isString = typeof userInput === "string";

// *No* habría aplicado el análisis de control de flujo:

if (isString) {
  userInput; // string | number in 4.3
} else {
  userInput; // string | number in 4.3
}

// En TypeScript 4.4 ⏤ la versión en la que estás actualmente, el análisis del
// control de flujo puede manejar este tipo de código. Esto funciona cuando TypeScript
// puede hacer suposiciones razonables de que la variable no ha cambiado desde
// fue creada. Por ejemplo, un `let` no se podría usar
// en análisis:

let isString2 = typeof userInput === "string";
if (isString2) {
  userInput; // string | number in 4.4
} else {
  userInput; // string | number in 4.4
}

// Para obtener más detalles, consulta:
// https://github.com/microsoft/TypeScript/pull/44730
