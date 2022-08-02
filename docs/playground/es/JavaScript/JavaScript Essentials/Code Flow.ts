//// { "order": 3, "compiler": { "strictNullChecks": true } }

// Cómo fluye el código dentro de nuestros archivos JavaScript puede afectar
// los tipos a lo largo de nuestros programas.

const users = [{ name: "Ahmed" }, { name: "Gemma" }, { name: "Jon" }];

// Vamos a ver si podemos encontrar un usuario llamado "jon".
const jon = users.find((u) => u.name === "jon");

// En el caso anterior, 'find' podría fallar. En ese caso nosotros
// no tenemos un objeto. Esto crea el tipo:
//
//   { name: string } | undefined
//
// Si pasas el mouse sobre los siguientes tres usos de 'jon' a continuación,
// verás cómo cambian los tipos dependiendo de dónde se ubica la palabra:

if (jon) {
  jon;
} else {
  jon;
}

// El tipo '{ name: string } | undefined' usa una característica
// de TypeScript denominada tipos unión. Un tipo unión es una forma de
// declarar que un objeto podría ser una de muchas cosas.
//
// La tubería actúa como separador entre diferentes tipos.
// La naturaleza dinámica de JavaScript significa que muchas funciones
// reciben y devuelven objetos de tipos no relacionados y necesitamos
// para poder expresar con cuáles podríamos estar tratando.

// Podemos usar esto de varias maneras. Empecemos mirando
// un arreglo donde los valores tienen diferentes tipos.

const identifiers = ["Hello", "World", 24, 19];

// Podemos usar la sintaxis de JavaScript 'typeof x === y' para
// comprobar el tipo del primer elemento. Puedes flotar sobre
// 'randomIdentifier' abajo para ver cómo cambia entre
// diferentes ubicaciones

const randomIdentifier = identifiers[0];
if (typeof randomIdentifier === "number") {
  randomIdentifier;
} else {
  randomIdentifier;
}

// Este análisis de control de flujo significa que podemos escribir JavaScript
// puro y TypeScript intentará comprender cómo
// los tipos del código cambiarán en diferentes ubicaciones.

// Para obtener más información sobre el análisis de código de flujo:
// - example:type-guards

// Para continuar leyendo ejemplos, puedes saltar a unos
// pocos lugares diferentes ahora:
//
// - JavaScript moderno: example:immutability
// - Guardias de tipo: example:type-guards
// - Programación funcional con JavaScript example:function-chaining
