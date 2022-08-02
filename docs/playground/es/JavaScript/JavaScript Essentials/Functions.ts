//// { "order": 2, "compiler": { "noImplicitAny": false } }

// Hay varias formas de declarar una función en
// JavaScript. Veamos una función que suma dos
// números juntos:

// Crea una función en el ámbito global llamada addOldSchool
function addOldSchool(x, y) {
  return x + y;
}

// Puedes mover el nombre de la función a un nombre de
// variable también
const anonymousOldSchoolFunction = function (x, y) {
  return x + y;
};

// También puedes utilizar la abreviatura fat-arrow para una función
const addFunction = (x, y) => {
  return x + y;
};

// Nos vamos a enfocar en el último, pero todo
// se aplica a los tres formatos.

// TypeScript proporciona una sintaxis adicional que se suma a
// definición de función y ofrece sugerencias sobre qué tipos
// son esperados por esta función.
//
// A continuación, se encuentra la versión más abierta de la función de adición,
// dice que sumar toma dos entradas de cualquier tipo: estos podrían
// ser cadenas, números u objetos que hayas creado.

const add1 = (x: any, y: any) => {
  return x + y;
};
add1("Hello", 23);

// Este es JavaScript legítimo (se pueden agregar cadenas
// como este, por ejemplo) pero no es óptimo para nuestra función
// que sabemos es para números, por lo que convertiremos la x e
// y para que solo sean números.

const add2 = (x: number, y: number) => {
  return x + y;
};
add2(16, 23);
add2("Hello", 23);

// Excelente. Obtenemos un error cuando cualquier otra cosa que no sea un número
// se pasa en. Si pasas el cursor sobre la palabra add2 arriba,
// verás que TypeScript lo describe como:
//
//   const add2: (x: number, y: number) => number
//
// Donde ha inferido que cuando las dos entradas son
// números, el único tipo de retorno posible es un número.
// Esto es genial, no tienes que escribir sintaxis adicional.
// Veamos qué se necesita para hacer eso:

const add3 = (x: number, y: number): string => {
  return x + y;
};

// Esta función falla porque le dijimos a TypeScript que
// debería esperar que se devuelva una cadena, pero la función
// no estuvo a la altura de esa promesa.

const add4 = (x: number, y: number): number => {
  return x + y;
};

// Esta es una versión muy explícita de add2 ⏤ existen
// casos en los que deseas utilizar el tipo de retorno explícito
// sintaxis para tener un espacio para trabajar antes
// empiezas. Un poco como el desarrollo impulsado por pruebas
// recomienda comenzar con una prueba fallida, pero en este caso
// en su lugar, tienes una forma defectuosa de una función.

// Este ejemplo es solo una introducción, puedes aprender mucho más
// sobre cómo funcionan las funciones en TypeScript en el manual y
// dentro de la sección de JavaScript funcional de los ejemplos:
//
// https://www.typescriptlang.org/docs/handbook/functions.html
// example:function-chaining

// Y para continuar nuestro recorrido por los conceptos básicos de JavaScript,
// veremos cómo el flujo de código afecta los tipos de TypeScript:
// example:code-flow
