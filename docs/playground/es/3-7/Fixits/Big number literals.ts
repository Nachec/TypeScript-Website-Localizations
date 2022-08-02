//// { "compiler": {  "target": 99 }, "order": 1 }

// ¿Sabías que hay un límite para el número que
// puedes representar en JavaScript al escribir?

const maxHighValue = 9007199254740991;
const maxLowValue = -9007199254740991;

// Si pasas uno por encima o por debajo de estos números
// entonces empiezas a adentrarte en territorio peligroso.

const oneOverMax = 9007199254740992;
const oneBelowMin = -9007199254740992;

// La solución para manejar números de este tamaño
// es convertir estos números a BigInts en lugar
// de un number:
//
// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt

// TypeScript ahora ofrecerá una solución para los números
// literales que están por encima de 2^52 (positivo/negativo)
// que agrega el sufijo "n" para informar a JavaScript
// que el tipo debería ser BigInt.

// Literales numéricos
9007199254740993;
-9007199254740993;
9007199254740994;
-9007199254740994;

// Números hexadecimales
0x19999999999999;
-0x19999999999999;
0x20000000000000;
-0x20000000000000;
0x20000000000001;
-0x20000000000001;
