//// { "compiler": { "ts": "4.0.2" } }
// Tupas variadic dan a las tuplas la capacidad de manejar el operador rest (...)
// para pasar tipos a través del verificador de tipos de una manera que funcionen como genéricos.

// Este es un tema bastante avanzado, así que si te pierdes no te preocupes demasiado.
// Se basa en el example:generic-functions y el example:tuples.

// Para empezar, aquí hay una tupla variadic que siempre prefija a otra
// tupla con un número:

type AddMax<T extends unknown[]> = [max: number, ...rest: T];
//          ^ Genérico utilizado para restringir la T
//                                                ^ ... utilizado para indicar dónde fusionar

// Esto luego se puede usar para la composición:
type MaxMin = AddMax<[min: number]>
type MaxMinDiameter = AddMax<[min: number, diameter: number]>

// Lo mismo se puede usar después de la tupla:
type SuffixDIContext<T extends unknown[]> = [...first: T, context: any];
type DIContainer = SuffixDIContext<[param: string]>

// Este mecanismo se puede combinar con múltiples parámetros de entrada. Por ejemplo, estaba
// función fusiona dos arreglos pero usa '\0' como señal para indicar dónde empiezan 
// y terminan los arreglo
function joinWithNullTerminators<T extends unknown[], U extends unknown[]>(t: [...T], u: [...U]) {
    return ['\0', ...t, '\0', ...u, '\0'] as const;
}

// TypeScript puede inferir el tipo de retorno de una función como esta:
const result = joinWithNullTerminators(['variadic', 'types'], ["terminators", 3]);

// Estas herramientas permiten escribir correctamente una función como curry que
// es un concepto muy utilizado en programación funcional:

function curry<T extends unknown[], U extends unknown[], R>(f: (...args: [...T, ...U]) => R, ...a: T) {
    return (...b: U) => f(...a, ...b);
}

// Hay tres argumentos genéricos:
// - T: Los parámetros que son un arreglo de entradas para la función curry
// - U: Los parámetros que *no* pasaron a la función curry y se deben aplicar al retorno de la función
// - R: el tipo de retorno pasado a la función

const sum = (left: number, right: number,) => left + right

const a = curry(sum, 1, 2)
const b = curry(sum, 1)(2)
const c = curry(sum)(1, 2)

// Puedes encontrar una explicación más detallada, con más ejemplos de código en
// https://github.com/microsoft/TypeScript/pull/39094

