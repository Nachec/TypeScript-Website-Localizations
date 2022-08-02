// Un sistema de tipos nominales significa que cada tipo es único
// e incluso si los tipos tienen los mismos datos, no puedes asignar
// a través de tipos.

// El sistema de tipos de TypeScript es estructural, lo cual significa
// que si el tipo tiene forma de pato, es un pato. Si un
// ganso tiene los mismos atributos que un pato, entonces también
// es un pato. Puedes aprender más aquí: example:structural-typing

// Esto puede tener inconvenientes, por ejemplo, hay casos
// donde una cadena o un número pueden tener un contexto especial y tú
// no quieres que los valores sean transferibles. Por
// ejemplo:
//
// -  Cadenas de entrada de usuario (inseguras)
// -  Cadenas traducidas
// -  Números de identificación de usuario
// -  Tokens de acceso

// Podemos obtener la mayor parte del valor de un sistema de tipos
// nominal con un poco de código adicional.

// Usaremos un tipo interseccional, con una única
// restricción en la forma de una propiedad llamada __brand (esta
// es una convención) lo que hace imposible asignar una
// cadena normal a ValidatedInputString.

type ValidatedInputString = string & { __brand: "User Input Post Validation" };

// Usaremos una función para transformar una cadena a
// ValidatedInputString ⏤ pero el punto digno de mención
// es que solo estamos *diciendo* a TypeScript que es true.

const validateUserInput = (input: string) => {
  const simpleValidatedInput = input.replace(/\</g, "≤");
  return simpleValidatedInput as ValidatedInputString;
};

// Ahora podemos crear funciones que solo aceptarán
// nuestro nuevo tipo nominal, y no el tipo de string general.

const printName = (name: ValidatedInputString) => {
  console.log(name);
};

// Por ejemplo, aquí hay una entrada insegura de un usuario, yendo
// a través del validador y luego se le permite imprimir:

const input = "alert('bobby tables')";
const validatedInput = validateUserInput(input);
printName(validatedInput);

// Por otro lado, pasar la cadena no validada a
// printName generará un error del compilador:

printName(input);

// Puedes leer una descripción general completa de las
// diferentes formas de crear tipos nominales, y sus
// compensaciones en este problema de GitHub de 400 comentarios de largo:
//
// https://github.com/Microsoft/TypeScript/issues/202
//
// y esta publicación es un gran resumen:
//
// https://michalzalecki.com/nominal-typing-in-typescript/
