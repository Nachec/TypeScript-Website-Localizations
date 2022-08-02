// TypeScript tiene algunos divertidos casos especiales para literales en
// código fuente.

// En parte, gran parte del soporte está cubierto por la ampliación de tipos
// y reducción ( ejemplo: type-widening-narrowing ) y
// vale la pena cubrir eso primero.

// Un literal es un subtipo más concreto de tipo colectivo.
// Lo cual significa es que "Hola mundo" es una cadena, pero una
// una cadena no es "Hola mundo" dentro del sistema de tipos.

const helloWorld = "Hello World";
let hiWorld = "Hi World"; // esta es una cadena porque es let

// Esta función toma todas las cadenas
declare function allowsAnyString(arg: string);
allowsAnyString(helloWorld);
allowsAnyString(hiWorld);

// Esta función solo acepta la cadena literal "Hello World"
declare function allowsOnlyHello(arg: "Hello World");
allowsOnlyHello(helloWorld);
allowsOnlyHello(hiWorld);

// Esto te permite declarar APIs que usan uniones para decir
// que solo acepta un literal particular:

declare function allowsFirstFiveNumbers(arg: 1 | 2 | 3 | 4 | 5);
allowsFirstFiveNumbers(1);
allowsFirstFiveNumbers(10);

let potentiallyAnyNumber = 3;
allowsFirstFiveNumbers(potentiallyAnyNumber);

// A primera vista, esta regla no se aplica a objetos complejos.

const myUser = {
  name: "Sabrina",
};

// Ve cómo transforma `name: "Sabrina"` a `name: string`
// aunque se define como una constante. Esto es porque
// el name aún puede cambiar en cualquier momento:

myUser.name = "Cynthia";

// Debido a que la propiedad name de myUser puede cambiar, TypeScript
// no puede utilizar la versión literal en el sistema de tipos. Allí
// sin embargo, hay una característica que te permitirá hacer esto.

const myUnchangingUser = {
  name: "Fatma",
} as const;

// Cuando se aplica "as const" al objeto, se convierte en
// un objeto literal que no cambia en lugar de un
// objeto mutable que puede.

myUnchangingUser.name = "Raîssa";

// "as const" es una gran herramienta para datos fijos y lugares
// donde tratas el código como literales en línea. "as const" además
// trabaja con arreglos:

const exampleUsers = [{ name: "Brian" }, { name: "Fahrooq" }] as const;
