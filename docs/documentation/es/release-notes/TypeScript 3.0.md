---
title: TypeScript 3.0
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-0.html
oneline: Notas de la versión de TypeScript 3.0
---

## Referencia de proyectos

*TypeScript 3.0* introduce un nuevo concepto de referencias de proyecto. Las referencias de proyecto permiten que los proyectos de *TypeScript* dependan de otros proyectos de *TypeScript*: específicamente, permite que los archivos `tsconfig.json` hagan referencia a otros archivos `tsconfig.json`. Especificar estas dependencias facilita la división de tu código en proyectos más pequeños, ya que le da a *TypeScript* (y las herramientas que lo rodean) una forma de comprender el orden de compilación y la estructura de salida.

*TypeScript 3.0* también introduce un nuevo modo para `tsc`, el indicador `--build`, que funciona de la mano con las referencias del proyecto para permitir compilaciones de *TypeScript* más rápidas.

Consulta la [página del manual de referencias del proyecto](/docs/handbook/project-reference.html) para obtener más documentación.

## Tuplas en parámetros `rest` y expresiones de propagación

*TypeScript 3.0* agrega soporte a múltiples capacidades nuevas para interactuar con listas de parámetros de funciones como tipos de tuplas.
*TypeScript 3.0* agrega soporte para:

- [Expansión de los parámetros `rest` con tipos de tupla en parámetros discretos](#parametros-rest-con-tipos-tupla).
- [Expansión de expresiones de propagación con tipos tupla en argumentos discretos](#dispersion-de-expresiones-con-tipos-tupla).
- [Parámetros de descanso genéricos y la correspondiente inferencia de tipos tupla] (#parametros-rest-genericos).
- [Elementos opcionales en tipos tuplas](#elementos-opcionales-en-tipos-tupla).
- [Elementos `rest` en tipos tupla](#rest-elements-in-tuple-types).

Con estas características, es posible tipar fuertemente una serie de funciones de orden superior que transforman funciones y sus listas de parámetros.

## Parámetros `rest` con tipos tupla

Cuando un parámetro `rest` tiene un tipo tupla, el tipo tupla se expande en una secuencia de parámetros discretos.
Por ejemplo, las dos siguientes declaraciones son equivalentes:

```ts
declare function foo(...args: [number, string, boolean]): void;
```

```ts
declare function foo(args_0: number, args_1: string, args_2: boolean): void;
```

## Dispersión de expresiones con tipos tupla

Cuando una llamada de función incluye una expresión de dispersión de un tipo tupla como último argumento, la expresión de dispersión corresponde a una secuencia de argumentos discretos de los tipos de elementos tupla.

Por tanto, las siguientes llamadas son equivalentes:

```ts
const args: [number, string, boolean] = [42, "hello", true];
foo(42, "hello", true);
foo(args[0], args[1], args[2]);
foo(...args);
```

## Parámetros `rest` genéricos

Se permite que un parámetro `rest` tenga un tipo genérico restringido a un tipo de arreglo, y la inferencia de tipos puede inferir tipos tupla para dichos parámetros `rest` genéricos. Esto permite la captura y dispersion de orden superior de listas de parámetros parciales:

##### Ejemplo

```ts
declare function bind<T, U extends any[], V>(
  f: (x: T, ...args: U) => V,
  x: T
): (...args: U) => V;

declare function f3(x: number, y: string, z: boolean): void;

const f2 = bind(f3, 42); // (y: string, z: boolean) => void
const f1 = bind(f2, "hello"); // (z: boolean) => void
const f0 = bind(f1, true); // () => void

f3(42, "hello", true);
f2("hello", true);
f1(true);
f0();
```

En la declaración de `f2` anterior, la inferencia de tipos infiere los tipos `number`, `[string, boolean]` y `void` para `T`, `U` y `V` respectivamente.

Ten en cuenta que cuando un tipo tupla se infiere de una secuencia de parámetros y luego se expande en una lista de parámetros, como es el caso de `U`, los nombres de los parámetros originales se usan en la expansión (sin embargo, los nombres no tienen significado semántico y no son observables de otra manera).

## Elementos opcionales en tipos tupla

Los tipos tupla ahora permiten un `?` posfijo en los tipos de los elementos para indicar que el elemento es opcional:

##### Ejemplo

```ts
let t: [number, string?, boolean?];
t = [42, "hello", true];
t = [42, "hello"];
t = [42];
```

En el modo [`strictNullChecks`](/tsconfig#strictNullChecks), un modificador `?` incluye automáticamente `undefined` en el tipo de elemento, similar a los parámetros opcionales.

Un tipo tupla permite omitir un elemento si tiene un `?` posfijo modificador en su tipo y todos los elementos a la derecha también tienen modificadores `?`.

Cuando se infieren tipos de tupla para parámetros `rest`, los parámetros opcionales en la fuente se convierten en elementos de tupla opcionales en el tipo inferido.

La propiedad `length` de un tipo tupla con elementos opcionales es una unión de tipos literales numéricos que representan las longitudes posibles.
Por ejemplo, el tipo de la propiedad `length` en el tipo tupla `[number, string?, boolean?]` es `1 | 2 | 3`.

### Elementos `rest` en tipos tupla

El último elemento de un tipo tupla puede ser un elemento `rest` de la forma `...X`, donde `X` es un tipo arreglo.
Un elemento `rest` indica que el tipo tupla es abierto y puede tener cero o más elementos adicionales del tipo de elemento arreglo.
Por ejemplo, `[number, ...string[]]` significa tuplas con un elemento `number` seguido de cualquier número de elementos `string`.

##### Ejemplo

```ts
function tuple<T extends any[]>(...args: T): T {
  return args;
}

const numbers: number[] = getArrayOfNumbers();
const t1 = tuple("foo", 1, true); // [string, number, boolean]
const t2 = tuple("bar", ...numbers); // [string, ...number[]]
```

El tipo de la propiedad `length` de un tipo tupla con un elemento `rest` es `number`.

## Nuevo tipo superior `unknown`

*TypeScript 3.0* introduce un nuevo tipo superior `unknown`.
`unknown` es la contraparte de seguridad de tipos de `any`.
Cualquier cosa se puede asignar a `unknown`, pero `unknown` no se puede asignar a nada más que a sí mismo y a `any` sin una aserción de tipo o una reducción basada en el control de flujo.
Del mismo modo, no se permiten operaciones en un `unknown` sin primero acertar o limitar a un tipo más específico.

##### Ejemplo

```ts
// En una intersección todo lo absorbe unknown

type T00 = unknown & null; // null
type T01 = unknown & undefined; // undefined
type T02 = unknown & null & undefined; // null y undefined (que se convierte en never)
type T03 = unknown & string; // string
type T04 = unknown & string[]; // string[]
type T05 = unknown & unknown; // unknown
type T06 = unknown & any; // `any`

// En una unión unknown lo absorbe todo

type T10 = unknown | null; // unknown
type T11 = unknown | undefined; // unknown
type T12 = unknown | null | undefined; // unknown
type T13 = unknown | string; // unknown
type T14 = unknown | string[]; // unknown
type T15 = unknown | unknown; // unknown
type T16 = unknown | any; // `any`

// Tipo variable y unknown en unión e intersección

type T20<T> = T & {}; // T & {}
type T21<T> = T | {}; // T | {}
type T22<T> = T & unknown; // T
type T23<T> = T | unknown; // unknown

// unknown en tipos condicionales

type T30<T> = unknown extends T ? true : false; // Diferido
tipo T31<T> = T extiende unknown? true : false; // Diferido (por lo que lo dispersa)
type T32<T> = never extends T ? true : false; // true
type T33<T> = T extends never ? true : false; // Diferido

// keyof de unknown

type T40 = keyof any; // string | number | symbol
type T41 = keyof unknown; // never

// Solo se permiten operadores de igualdad con unknown

function f10(x: unknown) {
  x == 5;
  x !== 10;
  x >= 0; // Error
  x + 1; // Error
  x * 2; // Error
  -x; // Error
  +x; // Error
}

// Sin accesos a propiedades, accesos a elementos o llamadas a funciones

function f11(x: unknown) {
  x.foo; // Error
  x[5]; // Error
  x(); // Error
  new x(); // Error
}

// predicados typeof, instanceof y de tipo definido por el usuario

declare function isFunction(x: unknown): x is Function;

function f20(x: unknown) {
  if (typeof x === "string" || typeof x === "number") {
    x; // string | number
  }
  if (x instanceof Error) {
    x; // Error
  }
  if (isFunction(x)) {
    x; // Function
  }
}

// Tipo mapeado homomórfico sobre unknown

type T50<T> = { [P in keyof T]: number };
type T51 = T50<any>; // { [x: string]: number }
type T52 = T50<unknown>; // {}

// Todo es asignable a unknown

function f21<T>(pAny: any, pNever: never, pT: T) {
  let x: unknown;
  x = 123;
  x = "hello";
  x = [1, 2, 3];
  x = new Error();
  x = x;
  x = pAny;
  x = pNever;
  x = pT;
}

// unknown asignable sólo a sí mismo y a any

function f22(x: unknown) {
  let v1: any = x;
  let v2: unknown = x;
  let v3: object = x; // Error
  let v4: string = x; // Error
  let v5: string[] = x; // Error
  let v6: {} = x; // Error
  let v7: {} | null | undefined = x; // Error
}

// Tipo de parámetro 'T extends unknown' no relacionado con el objeto

function f23<T extends unknown>(x: T) {
  let y: object = x; // Error
}

// Cualquier cosa menos primitiva asignable a {[x: string]: unknown }

function f24(x: { [x: string]: unknown }) {
  x = {};
  x = { a: 5 };
  x = [1, 2, 3];
  x = 123; // Error
}

// Los locales de tipo unknown siempre se consideran iniciados

function f25() {
  let x: unknown;
  let y = x;
}

// La propagación de unknown resulta ser unknown

function f26(x: {}, y: unknown, z: any) {
  let o1 = { a: 42, ...x }; // { a: number }
  let o2 = { a: 42, ...x, ...y }; // unknown
  let o3 = { a: 42, ...x, ...y, ...z }; // `any`
}

// Las funciones con tipo de retorno unknown no necesitan expresiones de retorno

function f27(): unknown {}

// El tipo `rest` no se puede crear a partir de unknown

function f28(x: unknown) {
  let { ...a } = x; // Error
}

// Las propiedades de clase de tipo unknown no necesitan una asignación definida

class C1 {
  a: string; // Error
  b: unknown;
  c: any;
}
```

## Soporte para `defaultProps` en *JSX*

*TypeScript 2.9* y versiones anteriores no aprovecharon las declaraciones [`defaultProps` de *React*](https://reactjs.org/docs/typechecking-with-proptypes.html#default-prop-values) dentro de los componentes *JSX*.
Los usuarios a menudo tendrían que declarar propiedades opcionales y usar aserciones no nulas dentro de `render`, o usarían aserciones de tipo para corregir el tipo del componente antes de exportarlo.

Las adiciones de *TypeScript 3.0* admiten un nuevo alias de tipo en el espacio de nombres `JSX` llamado `LibraryManagedAttributes`.
Este tipo de ayuda define una transformación en el tipo `Props` del componente, antes de usarlo para verificar una expresión *JSX* dirigida a él; permitiendo así la personalización como: de qué manera se manejan los conflictos entre los accesorios proporcionados y los accesorios inferidos, cómo se mapean las inferencias, cómo se maneja la opcionalidad y cómo se deben combinar las inferencias de diferentes lugares.

En resumen, usando este tipo general, podemos modelar el comportamiento específico de *React* para cosas como `defaultProps` y, hasta cierto punto, `propTypes`.

```tsx
export interface Props {
  name: string;
}

export class Greet extends React.Component<Props> {
  render() {
    const { name } = this.props;
    return <div>Hello {name.toUpperCase()}!</div>;
  }
  static defaultProps = { name: "world" };
}

// ¡Comprobaciones de tipo! ¡No se necesitan aserciones de tipo!
let el = <Greet />;
```

## Advertencias

### Tipos explícitos en `defaultProps`

Las propiedades predeterminadas se infieren a partir de el tipo de propiedad `defaultProps`. Si se agrega una anotación de tipo explícita, p. ej. `static defaultProps: Partial<Props>;` el compilador no podrá identificar qué propiedades tienen valores predeterminados (ya que el tipo de `defaultProps` incluye todas las propiedades de `Props`).

Utiliza `static defaultProps: Pick<Props, "name">;` como una anotación de tipo explícita en su lugar, o no agregues una anotación de tipo como se hizo en el ejemplo anterior.

Para los componentes de función (antes conocidos como *CFSE*), utiliza los iniciadores predeterminados de *ES2015*:

```tsx
function Greet({ name = "world" }: Props) {
  return <div>Hello {name.toUpperCase()}!</div>;
}
```

#### Cambios en `@types/React`

Aún se necesitan los cambios correspondientes para agregar la definición de `LibraryManagedAttributes` al espacio de nombres `JSX` en `@types/React`.
Ten en cuenta que existen algunas limitaciones.

## `/// <reference lib="..."/>` directivas de referencia

*TypeScript* agrega una nueva directiva de referencia de triple barra (`/// <reference lib="name"/>`), la cual permite que un archivo incluya explícitamente un archivo *lib* incorporado existente.

Los archivos `lib` incorporados se referencian de la misma manera que la opción [`lib`](/tsconfig#lib) del compilador en `tsconfig.json` (por ejemplo, usa `lib="es2015"` y no `lib="lib.es2015.d.ts"`, etc.).

Para los autores de archivos de declaración que se basan en tipos integrados, p. ej. se recomiendan las *API*s *DOM* o los constructores *JS* incorporados en el entorno de ejecución, como `Symbol` o `Iterable`, las directivas `lib` de referencia de triple barra inclinada. Anteriormente, estos archivos `.d.ts` tenían que agregar declaraciones de reenvío/duplicado de este tipo.

##### Ejemplo

Usar `/// <reference lib="es2017.string"/>` en uno de los archivos de una compilación es equivalente a compilar con `--lib es2017.string`.

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```
