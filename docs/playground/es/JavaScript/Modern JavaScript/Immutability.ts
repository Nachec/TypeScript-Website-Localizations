// JavaScript es un lenguaje con algunas formas de declarar que
// algunos de sus objetos no cambian. El más destacado es
// const ⏤ que dice que el valor no cambiará.

const helloWorld = "Hello World";

// No puedes cambiar helloWorld ahora, TypeScript te dará
// un error sobre esto, porque obtendrías uno en
// el entorno de ejecución en su lugar.

helloWorld = "Hi world";

// ¿Por qué preocuparte por la inmutabilidad? Mucho de esto se trata
// reduciendo la complejidad en tu código. Si puedes reducir la
// cantidad de cosas que pueden cambiar, entonces hay menos
// cosas para realizar un seguimiento.

// Usar const es un gran primer paso, sin embargo, esto falla
// un poco al usar objetos.

const myConstantObject = {
  msg: "Hello World",
};

// myConstantObject no es una constante, sin embargo, debido a que
// todavía podemos hacer cambios en partes del objeto, por
// ejemplo podemos cambiar msg:

myConstantObject.msg = "Hi World";

// const significa que el valor en ese punto permanece igual, pero
// que el objeto en sí puede cambiar internamente. Esto se puede
// cambiar usando Object.freeze.

const myDefinitelyConstantObject = Object.freeze({
  msg: "Hello World",
});

// Cuando un objeto está congelado, no puedes cambiar los
// internos. TypeScript ofrecerá errores en estos casos:

myDefinitelyConstantObject.msg = "Hi World";

// Esto también funciona igual para los arreglos:

const myFrozenArray = Object.freeze(["Hi"]);
myFrozenArray.push("World");

// Usar freeze significa que puedes confiar en que el objeto
// permanece igual bajo el capó.

// TypeScript tiene algunos ganchos de sintaxis adicionales para mejorar el trabajo
// con datos inmutables que puedes encontrar en la
// sección de ejemplos TypeScript:
//
// example:literals
// example:type-widening-and-narrowing
