// Podría ser más fácil comenzar la explicación de
// ampliación y reducción con un ejemplo:

const welcomeString = "Hello There";
let replyString = "Hey";

// Aparte de las diferencias de texto de las cadenas, welcomeString
// es una constante (lo cual significa que el valor nunca cambiará)
// y replyString es un let (lo cual significa que puede cambiar).

// Si colocas el cursor sobre ambas variables, obtendrás resultados muy diferentes
// la información de tipo desde TypeScript:
//
//   const welcomeString: "Hello There"
//
//   let replyString: string

// TypeScript ha inferido el tipo de welcomeString para ser
// la cadena literal "Hola", mientras que replyString
// es una string general.

// Esto se debe a que un let debe tener un tipo más amplio,
// podrías establecer replyString para que sea cualquier otra cadena ⏤ lo cual significa
// que tiene un conjunto más amplio de posibilidades.

replyString = "Hi :wave:";

// Si replyString tenía el tipo de string literal "Hey" ⏤ entonces
// nunca podrías cambiar el valor porque solo podrías
// cambiar a "Hey" de nuevo.

// Los tipos Widening y Narrowing son sobre ampliar y reducir
// las posibilidades que podría representar un tipo.

// Un ejemplo de reducción de tipo es trabajar con uniones, el
// ejemplo de análisis de flujo de código se basa casi en su totalidad en
// narrowing: example:code-flow

// El tipo narrowing es lo que impulsa el modo strict de TypeScript
// a través de las comprobaciones de nulabilidad. Con el modo strict desactivado,
// los marcadores de nulabilidad como undefined y null se ignoran
// en una unión.

declare const quantumString: string | undefined;
// Esto fallará solo en modo strict
quantumString.length;

// En modo strict, la responsabilidad recae en el autor del código para garantizar
// que el tipo se ha reducido al tipo no null.
// Por lo general, esto es tan simple como una verificación if:

if (quantumString) {
  quantumString.length;
}

// En modo strict, el tipo quantumString tiene dos representaciones.
// Dentro del if, el tipo se redujo a solo string.

// Puedes ver más ejemplos de reducción en:
//
// example:union-and-intersection-types
// example:discriminate-types

// E incluso más recursos en la web:
//
// https://mariusschulz.com/blog/literal-type-widening-in-typescript
// https://sandersn.github.io/manual/Widening-and-Narrowing-in-Typescript.html
