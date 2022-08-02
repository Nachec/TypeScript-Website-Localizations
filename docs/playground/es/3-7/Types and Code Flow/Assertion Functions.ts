//// { "compiler": {  }, "order": 1 }

// Dada la flexibilidad de JavaScript, puede ser una buena idea agregar
// validación al entorno de ejecución a tu código para validar tus suposiciones.

// Suelen denominarse aserciones (o invariantes) y
// son pequeñas funciones que generan errores temprano cuando
// tus variables no coinciden con lo que esperas.

// Node viene con una función para hacer esto fuera de la caja,
// se llama aserción y está disponible sin una importación.

// Sin embargo, vamos a definir el nuestro. Este declara una
// función que acierta que el valor de la expresión
// llamada es true:
declare function assert(value: unknown): asserts value;

// Ahora lo usamos para validar el tipo de enumeración.
declare const maybeStringOrNumber: string | number;
assert(typeof maybeStringOrNumber === "string");

// Con TypeScript 3.7, el análisis del flujo de código puede utilizar estos
// tipos de funciones para averiguar qué es el código. Entonces,
// cuando pasas el cursor sobre la variable de abajo - puedes ver eso
// se ha reducido de una cadena o un número a
// solo una cadena.

maybeStringOrNumber;

// Puedes utilizar funciones de aserción para hacer garantías de
// tus tipos a lo largo de tu código inferido, por ejemplo
// TypeScript sabe que esta función devolverá un
// número sin la necesidad de agregar tipos al parámetro
// a través de la declaración de aserción anterior.

function multiply(x: any, y: any) {
  assert(typeof x === "number");
  assert(typeof y === "number");

  return x * y;
}

// Las funciones de aserción son hermanas de Type Guards
// example:type-guards excepto que afectan el control de flujo 
// cuando continúa a través de la función.

// Por ejemplo, podemos usar funciones de aserción para reducir
// una enumeración a lo largo del tiempo:

declare const oneOfFirstFiveNumbers: 1 | 2 | 3 | 4 | 5;

declare function isOdd(param: unknown): asserts param is 1 | 3 | 5;
declare function isBelowFour(param: unknown): asserts param is 1 | 2 | 3 | 4;

// Esto debería reducir la enumeración a: 1 | 3 | 5

isOdd(oneOfFirstFiveNumbers);
oneOfFirstFiveNumbers;

// Esto luego cortará los posibles estados de la enumeración a: 1 | 3

isBelowFour(oneOfFirstFiveNumbers);
oneOfFirstFiveNumbers;

// Esta es una introducción a algunas de las características de las funciones de aserción.
// en TypeScript 3.7 - puedes obtener más información leyendo las
// notas de lanzamiento:
//
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/
