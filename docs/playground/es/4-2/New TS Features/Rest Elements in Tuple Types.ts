//// { "compiler": { "ts": "4.2.0-beta" } }
// Los tipos tupla son una característica donde la posición de un tipo en un
// arreglo es importante. Por ejemplo, en string[] (arreglo) sabes que todos
// los elementos del arreglo son una cadena, en [string](tuple) sabes que
// solo el primer elemento es una cadena. De acuerdo al sistema de tipos, un
// [string] es un arreglo con un solo elemento, de cadena.

const stringArray: string[] = ["sugar", "tea", "rum"];
const singleStringTuple: [string] = ["sugar", "tea", "rum"];

// Las tuplas permiten que TypeScript describa arreglos como: [string, number] - lo cual
// significa que solo se puede usar una cadena y un número en la primer y segunda
// posiciones respectivamente.

const stringNumberTuple: [string, number] = ["Weeks from shore", 2];

// Debajo del capó, TypeScript usa tuplas para describir parámetros para funciones
// de lo cual puedes aprender más en:
//
// - example:tuples
// - example:named-tuples

// Lo que se agregó en TypeScript 4.2 es la capacidad de describir funciones que
// toman un número desconocido de parámetros pero que tienen un comienzo particular,
// medio o final. Esto se hace a través del operador de propagación ... en una tupla para
// indicar que el número varía (también conocido como: variadic)

// Este tipo representa un número desconocido de cadenas en el arreglo, pero siempre
// termina con un objeto.
type StringsThenConfig = [...string[], { huh: boolean }];

const firstChorus: StringsThenConfig = ["Blow", "Me Bully boys", "blow", { huh: true }];
const secondChorus: StringsThenConfig = ["We'll take our leave and go", { huh: false }];
const thirdChorus: StringsThenConfig = ["When she dived down below", { huh: true }];

// Puedes obtener más información sobre cómo ha evolucionado la característica en la publicación beta del blog:
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-2-beta/
