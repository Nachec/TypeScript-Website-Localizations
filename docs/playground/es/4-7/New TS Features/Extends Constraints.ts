//// { "compiler": { "ts": "4.7.3" } }
// En 4.7, TypeScript agregó soporte para insertar una cláusula extendida
// en un tipo condicional. Esto puede ayudar a reducir la complejidad de
// tipos condicionales.

// Si eres nuevo en los tipos condicionales, consulta: example:conditional-types

// Como ejemplo, aquí hay un tipo condicional 4.6 que parece
// en el valor de retorno de una función y solo devuelve un tipo
// si el tipo de retorno es una cadena.

// prettier-ignore
type ReturnTypeOnlyStrings47<T> =
  T extends (...args: any[]) => 
    infer R ? (R extends string ? R : never) : never;

// Son esencialmente dos declaraciones if, una para el tipo de retorno
// y uno para luego verificar si el tipo de retorno es una cadena. En
// 4.7 esto se puede hacer dentro de una declaración.

// prettier-ignore
type ReturnType2<T> =
  T extends (...args: any[]) =>
    (infer R extends string) ? R : never;

// Es un poco como poder usar un && dentro del condicional
// verificación de tipo, lo que hace que el código sea un poco más simple y más legible.