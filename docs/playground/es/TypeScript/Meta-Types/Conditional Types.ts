// Los tipos condicionales proporcionan una forma de hacer lógica simple en el
// Sistema de tipos TypeScript. Esta definitivamente es una característica
// avanzada, y es bastante factible que no necesites
// usar esto en tu código normal del día a día.

// Un tipo condicional se ve así:
//
//   A extends B ? C : D
//
// Donde la condición es si una una expresión de
// tipo extends, y de ser así, qué tipo se debe devolver.

// Repasemos algunos ejemplos, por brevedad vamos
// a utilizar letras simples para los genéricos. Esto es opcional
// pero restringirnos a 60 caracteres lo convierte en
// difícil de encajar en la pantalla.

type Cat = { meows: true };
type Dog = { barks: true };
type Cheetah = { meows: true; fast: true };
type Wolf = { barks: true; howls: true };

// Podemos crear un tipo condicional que permita extraer
// tipos que solo se ajustan a algo que ladra (barks).

type ExtractDogish<A> = A extends { barks: true } ? A : never;

// Luego podemos crear tipos que ExtractDogish envuelve:

// Un gato no ladra, por lo que devolverá never
type NeverCat = ExtractDogish<Cat>;
// Un lobo ladrará, por lo que devuelve la forma de lobo.
type Wolfish = ExtractDogish<Wolf>;

// Esto resulta útil cuando deseas trabajar con una
// unión de muchos tipos y reducir el número de potenciales
// opciones en una unión:

type Animals = Cat | Dog | Cheetah | Wolf;

// Cuando aplicas ExtractDogish a un tipo unión, es lo
// mismo que ejecutar el condicional contra cada miembro de
// el tipo:

type Dogish = ExtractDogish<Animals>;

// = ExtractDogish<Cat> | ExtractDogish<Dog> |
//   ExtractDogish<Cheetah> | ExtractDogish<Wolf>
//
// = never | Dog | never | Wolf
//
// = Dog | Wolf (see example:unknown-and-never)

// Esto se llama tipo condicional distributivo porque
// el tipo se distribuye entre cada miembro de la unión.

// Tipos condicionales diferidos

// Los tipos condicionales se pueden utilizar para ajustar tus APIs que
// pueden devolver diferentes tipos dependiendo de las entradas.

// Por ejemplo, esta función que podría devolver un
// string o number dependiendo del booleano pasado.

declare function getID<T extends boolean>(fancy: T): T extends true ? string : number;

// Entonces, dependiendo de cuánto sepa el sistema de tipos sobre
// el booleano, obtendrás diferente devolución de tipos:

let stringReturnValue = getID(true);
let numberReturnValue = getID(false);
let stringOrNumber = getID(Math.random() < 0.5);

// En este caso, el TypeScript anterior puede conocer el valor de retorno
// instantáneamente. Sin embargo, puedes usar tipos condicionales en funciones
// donde el tipo aún no se conoce. Esto se llama tipo
// condicional diferido.

// Igual que nuestro Dogish anterior, pero como una función
declare function isCatish<T>(x: T): T extends { meows: true } ? T : undefined;

// Hay una herramienta extra útil dentro de los tipos condicionales, que
// es poder decirle específicamente a TypeScript que debería
// inferir el tipo al diferir. Esa es la palabra clave 'infer'.

// infer se usa típicamente para crear metatipos que inspeccionan
// los tipos existentes en tu código, considéralo como una creación
// de una nueva variable dentro del tipo.

type GetReturnValue<T> = T extends (...args: any[]) => infer R ? R : T;

// Aproximadamente:
//
//  - este es un tipo genérico condicional llamado GetReturnValue
//    que toma un tipo en su primer parámetro
//
//  - el condicional comprueba si el tipo es una función, y
//    si es así, crea un nuevo tipo llamado R basado en el valor
//    devuelto para esa función
//
//  - Si la verificación pasa, el valor del tipo es valor devuelto
//    inferido, de lo contrario es el tipo original
//

type getIDReturn = GetReturnValue<typeof getID>;

// Esto falla en la verificación por ser una función, y
// simplemente devuelva el tipo que se le pasó.
type getCat = GetReturnValue<Cat>;
