// Normalmente, un arreglo contiene de cero a muchos objetos de un
// único tipo. TypeScript tiene un análisis especial en torno
// los arreglos que contienen varios tipos, y donde el orden
// en el que están indexados es importante.

// Estos se llaman tuplas. Piensa en ellos como una forma de
// conectar algunos datos, pero con menos sintaxis que los objetos con clave.

// Puedes crear una tupla utilizando la sintaxis de arreglo de JavaScript:

const failingResponse = ["Not Found", 404];

// pero deberás declarar su tipo como una tupla.

const passingResponse: [string, number] = ["{}", 200];

// Si pasas el cursor sobre los dos nombres de variables, puedes ver la
// diferencia entre un arreglo ( ( string | number )[] ) y
// la tupla ( [string, number] ).

// Como arreglo, el orden no es importante, por lo que un elemento en
// cualquier índice puede ser una cadena o un número. En la
// tupla el orden y la longitud están garantizados.

if (passingResponse[1] === 200) {
  const localInfo = JSON.parse(passingResponse[0]);
  console.log(localInfo);
}

// Esto significa que TypeScript proporcionará los tipos correctos en
// el índice correcto, e incluso generar un error si intentas
// acceder a un objeto en un índice no declarado.

passingResponse[2];

// Una tupla puede parecer un buen patrón para fragmentos cortos de
// datos conectados o para accesorios.

type StaffAccount = [number, string, string, string?];

const staff: StaffAccount[] = [
  [0, "Adankwo", "adankwo.e@"],
  [1, "Kanokwan", "kanokwan.s@"],
  [2, "Aneurin", "aneurin.s@", "Supervisor"],
];

// Cuando tienes un conjunto de tipos conocidos al comienzo de una
// tupla y luego una longitud desconocida, puedes usar el operador
// spread para indicar que puede tener cualquier longitud y
// los índices adicionales serán de un tipo particular:

type PayStubs = [StaffAccount, ...number[]];

const payStubs: PayStubs[] = [
  [staff[0], 250],
  [staff[1], 250, 260],
  [staff[0], 300, 300, 300],
];

const monthOnePayments = payStubs[0][1] + payStubs[1][1] + payStubs[2][1];
const monthTwoPayments = payStubs[1][2] + payStubs[2][2];
const monthThreePayments = payStubs[2][2];

// Puedes utilizar tuplas para describir funciones que toman
// un número indefinido de parámetros con tipos:

declare function calculatePayForEmployee(id: number, ...args: [...number[]]): number;

calculatePayForEmployee(staff[0][0], payStubs[0][1]);
calculatePayForEmployee(staff[1][0], payStubs[1][1], payStubs[1][2]);

//
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#tuples-in-rest-parameters-and-spread-expressions
// https://auth0.com/blog/typescript-3-exploring-tuples-the-unknown-type/
