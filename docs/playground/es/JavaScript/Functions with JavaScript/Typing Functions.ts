// La inferencia de TypeScript puede llevarte muy lejos, pero hay
// muchas formas adicionales de proporcionar una forma más completa de documentar
// la forma de tus funciones.

// Un buen primer lugar es mirar los parámetros opcionales, que
// es una forma de hacerles saber a los demás que puedes omitir parámetros.

let i = 0;
const incrementIndex = (value?: number) => {
  i += value === undefined ? 1 : value;
};

// Esta función se puede llamar así:

incrementIndex();
incrementIndex(0);
incrementIndex(3);

// Puede escribir parámetros como funciones, lo que proporciona
// inferencia de tipo cuando escribes las funciones.

const callbackWithIndex = (callback: (i: number) => void) => {
  callback(i);
};

// Las interfaces de funciones integradas pueden resultar un poco difíciles de leer
// con todas las flechas. El uso de un alias de tipo te permitirá nombrar
// la función param.

type NumberCallback = (i: number) => void;
const callbackWithIndex2 = (callback: NumberCallback) => {
  callback(i);
};

// Estos se pueden llamar como:

callbackWithIndex(index => {
  console.log(index);
});

// Al pasar el cursor sobre el índice de arriba, puedes ver cómo TypeScript
// ha inferido correctamente que el índice es un número.

// La inferencia de TypeScript puede funcionar al pasar una función
// también como referencia de instancia. Para mostrar esto, usaremos
// una función que cambió un número en una cadena:

const numberToString = (n: number) => {
  return n.toString();
};

// Esto se puede usar en una función como mapa en un arreglo
// para convertir todos los números en una cadena, si te desplazas
// en stringedNumbers a continuación puedes ver los tipos esperados.
const stringedNumbers = [1, 4, 6, 10].map(i => numberToString(i));

// Podemos usar la abreviatura para que la función se pase directamente
// y obtener los mismos resultados con un código más enfocado:
const stringedNumbersTerse = [1, 4, 6, 10].map(numberToString);

// Puedes tener funciones que podrían aceptar muchos tipos
// pero solo te interesan algunas propiedades. Este es
// un caso útil para firmas indexadas en tipos. El
// siguiente tipo declara que esta función se puede usar
// cualquier objeto siempre que incluya el nombre de la propiedad:

interface AnyObjectButMustHaveName {
  name: string;
  [key: string]: any;
}

const printFormattedName = (input: AnyObjectButMustHaveName) => {};

printFormattedName({ name: "joey" });
printFormattedName({ name: "joey", age: 23 });

// Si deseas obtener más información sobre índice de firmas
// nosotros recomendamos:
//
// https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks
// https://basarat.gitbooks.io/typescript/docs/types/index-signatures.html

// También puedes permitir este tipo de comportamiento en todas partes.
// a través del indicador tsconfig suppressExcessPropertyErrors ⏤
// sin embargo, no puedes saber si otras personas que utilizan tu API tienen
// esto desactivado.

// Las funciones en JavaScript pueden aceptar diferentes conjuntos de parámetros.
// Hay dos patrones comunes para describirlos: union
// tipos para parámetros/retorno y sobrecargas de funciones.

// Usar tipos unión en tus parámetros tiene sentido si hay
// solo uno o dos cambios y la documentación no necesita
// cambiar entre funciones.

const boolOrNumberFunction = (input: boolean | number) => {};

boolOrNumberFunction(true);
boolOrNumberFunction(23);

// La sobrecarga de funciones, por otro lado, ofrece una
// sintaxis de los parámetros y tipos de retorno.

interface BoolOrNumberOrStringFunction {
  /** Toma un bool, devuelve un bool */
  (input: boolean): boolean;
  /** Toma un número, devuelve un número */
  (input: number): number;
  /** Toma una cadena, devuelve un bool */
  (input: string): boolean;
}

// Si es la primera vez que lo ves declarar, te permite
// decirle a TypeScript que algo existe incluso si no
// existe en el entorno de ejecución en este archivo. Útil para mapear
// código con efectos secundarios pero extremadamente útil para demostraciones
// donde hacer la implementación sería mucho código.

declare const boolOrNumberOrStringFunction: BoolOrNumberOrStringFunction;

const boolValue = boolOrNumberOrStringFunction(true);
const numberValue = boolOrNumberOrStringFunction(12);
const boolValue2 = boolOrNumberOrStringFunction("string");

// Si pasas el cursor sobre los valores y funciones anteriores,
// puedes ver la documentación correcta y los valores de retorno.

// Sin embargo, el uso de sobrecarga de funciones puede llevarte muy lejos
// hay otra herramienta para lidiar con diferentes tipos de
// entradas y valores de retorno y eso es genérico.

// Estos proporcionan una forma de tener tipos como marcadores de posición
// de variables en definiciones de tipo.

// example:generic-functions
// example:function-chaining
