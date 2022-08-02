---
title: TypeScript 2.8
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-8.html
oneline: Notas de la versión de TypeScript 2.8
---

## Tipos condicionales

*TypeScript 2.8* introduce *tipos condicionales* que agregan la capacidad de expresar asignaciones de tipos no uniformes.
Un tipo condicional selecciona uno de los dos posibles tipos en función de una condición expresada como una prueba de relación de tipo:

```ts
T extends U ? X : Y
```

El tipo anterior significa que cuando `T` es asignable a `U`, el tipo es `X`, de lo contrario, el tipo es `Y`.

Un tipo condicional `T extends U ? X : Y` está *resuelto* a `X` o `Y`, o *diferido* porque la condición depende de una o más variables de tipo.
Si se resuelve o difiere se determina de la siguiente manera:

- Primero, los tipos `T'` y `U'` dados que son instancias de `T` y `U` donde todas las apariciones de parámetros de tipo se reemplazan con `any`, si `T'` no se puede asignar a `U'`, el tipo condicional se resuelve en `Y`. Intuitivamente, si la creación de instancias más permisiva de `T` no es asignable a la creación de instancias más permisiva de `U`, sabemos que ninguna creación de instancia lo será y podemos resolverla a `Y`.
- A continuación, para cada variable de tipo introducida por una declaración `infer` (más adelante) dentro de `U`, recopila un conjunto de tipos candidatos al inferir de `T` a `U` (utilizando el mismo algoritmo de inferencia que la inferencia de tipos para funciones genéricas). Para una determinada variable `V` de tipo `infer`, si alguno de los candidatos se infiere a partir de posiciones covariantes, el tipo inferido para `V` es una unión de esos candidatos. De lo contrario, si algún candidato se infiere de posiciones contravariantes, el tipo inferido para `V` es una intersección de esos candidatos. De lo contrario, el tipo inferido para `V` es `never`.
- Luego, dado un tipo `T''` que es una instanciación de `T` donde todas las variables de tipo `infer` se reemplazan con los tipos inferidos en el paso anterior, si `T''` *definitivamente es asignable* a `U`, el tipo condicional se resuelve en `X`. La relación definitivamente asignable es la misma que la relación asignable regular, excepto que no se consideran las restricciones de tipo variable. Intuitivamente, cuando un tipo es definitivamente asignable a otro tipo, sabemos que será asignable para *todas las instancias* de esos tipos.
- De lo contrario, la condición depende de una o más variables de tipo y el tipo condicional se difiere.

##### Ejemplo

```ts
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type T0 = TypeName<string>; // "string"
type T1 = TypeName<"a">; // "string"
type T2 = TypeName<true>; // "boolean"
type T3 = TypeName<() => void>; "function"
type T4 = TypeName<string[]>; // "object"
```

## Tipos condicionales distributivos

Los tipos condicionales en los que el tipo marcado es un parámetro de tipo desnudo se denominan *tipos condicionales distributivos*.
Los tipos condicionales distributivos se distribuyen automáticamente sobre los tipos unión durante la creación de instancias.
Por ejemplo, la creación de una instancia de `T extends U ? X : Y` con el argumento de tipo `A | B | C` para `T` se resuelve como `(¿A extiende U? X : Y) | (B extiende U ? X : Y) | (C extiende U ? X : Y)`.

##### Ejemplo

```ts
type T10 = TypeName<string | (() => void)>; // "string" | "function"
type T12 = TypeName<string | string[] | undefined>; // "string" | "object" | "undefined"
type T11 = TypeName<string[] | number[]>; // "object"
```

Al crear instancias de un tipo condicional distributivo `T extends U ? X : Y`, las referencias a `T` dentro del tipo condicional se resuelven en constituyentes individuales del tipo unión (es decir, `T` se refiere a los constituyentes individuales *después de* que el tipo condicional se distribuye sobre el tipo unión).
Además, las referencias a `T` dentro de `X` tienen una restricción de parámetro de tipo adicional `U` (es decir, `T` se considera asignable a `U` dentro de `X`).

##### Ejemplo

```ts
type BoxedValue<T> = { value: T };
type BoxedArray<T> = { array: T[] };
type Boxed<T> = T extends any[] ? BoxedArray<T[number]> : BoxedValue<T>;

type T20 = Boxed<string>; // BoxedValue<string>;
type T21 = Boxed<number[]>; // BoxedArray<number>;
type T22 = Boxed<string | number[]>; // BoxedValue<string> | BoxedArray<number>;
```

Observa que `T` tiene la restricción adicional `any[]` dentro de la rama verdadera de `Boxed<T>` y, por lo tanto, es posible referirse al tipo de elemento del arreglo como `T[number]`. Además, observa cómo se distribuye el tipo condicional sobre el tipo unión en el último ejemplo.

La propiedad distributiva de los tipos condicionales se puede utilizar convenientemente para *filtrar* tipos unión:

```ts
type Diff<T, U> = T extends U ? never : T; // Eliminar tipos de T que se pueden asignar a U
type Filter<T, U> = T extends U ? T : never; // Elimina tipos de T que no se pueden asignar a U

type T30 = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T31 = Filter<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"
type T32 = Diff<string | number | (() => void), Function>; // string | number
type T33 = Filter<string | number | (() => void), Function>; // () => void

type NonNullable<T> = Diff<T, null | undefined>; // Elimina null y undefined de T

type T34 = NonNullable<string | number | undefined>; // string | number
type T35 = NonNullable<string | string[] | null | undefined>; // string | string[]

function f1<T>(x: T, y: NonNullable<T>) {
  x = y; // Bien
  y = x; // Error
}

function f2<T extends string | undefined>(x: T, y: NonNullable<T>) {
  x = y; // Bien
  y = x; // Error
  let s1: string = x; // Error
  let s2: string = y; // Bien
}
```

Los tipos condicionales son particularmente útiles cuando se combinan con los tipos asignados:

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface Part {
  id: number;
  name: string;
  subparts: Part[];
  updatePart(newName: string): void;
}

type T40 = FunctionPropertyNames<Part>; // "updatePart"
type T41 = NonFunctionPropertyNames<Part>; // "id" | "name" | "subparts"
type T42 = FunctionProperties<Part>; // { updatePart(newName: string): void }
type T43 = NonFunctionProperties<Part>; // { id: number, name: string, subparts: Part[] }
```

De manera similar a los tipos unión e intersección, los tipos condicionales no pueden hacer referencia a sí mismos de manera recursiva.
Por ejemplo, lo siguiente es un error.

##### Ejemplo

```ts
type ElementType<T> = T extends any[] ? ElementType<T[number]> : T; // Error
```

## Inferencia de tipos en tipos condicionales

Dentro de la cláusula `extend` de un tipo condicional, ahora es posible tener declaraciones `infer` que introducen una variable `type` para inferir.
Dichas variables de tipo inferido se pueden referir en la rama `true` del tipo condicional.
Es posible tener múltiples ubicaciones `infer` para la misma variable de tipo.

Por ejemplo, lo siguiente extrae el tipo de retorno de una función `type`:

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

Los tipos condicionales se pueden anidar para formar una secuencia de coincidencias de patrones que se evalúan en orden:

```ts
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type T0 = Unpacked<string>; // string
type T1 = Unpacked<string[]>; // string
type T2 = Unpacked<() => string>; // string
type T3 = Unpacked<Promise<string>>; // string
type T4 = Unpacked<Promise<string>[]>; // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>; // string
```

El siguiente ejemplo demuestra cómo múltiples candidatos para la misma variable de tipo en posiciones covariantes hacen que se infiera un tipo unión:

```ts
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;
type T10 = Foo<{ a: string; b: string }>; // string
type T11 = Foo<{ a: string; b: number }>; // string | number
```

Del mismo modo, múltiples candidatos para la misma variable de tipo en posiciones contravariantes hacen que se infiera un tipo intersección:

```ts
type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }
  ? U
  : never;
type T20 = Bar<{ a: (x: string) => void; b: (x: string) => void }>; // string
type T21 = Bar<{ a: (x: string) => void; b: (x: number) => void }>; // string & number
```

Cuando se infiere de un tipo con múltiples firmas de llamada (como el tipo de una función sobrecargada), se hacen inferencias a partir de la firma `last` (que, presumiblemente, es el caso general más permisivo).
No es posible realizar una resolución de sobrecarga basada en una lista de tipos de argumentos.

```ts
declare function foo(x: string): number;
declare function foo(x: number): string;
declare function foo(x: string | number): string | number;
type T30 = ReturnType<typeof foo>; // string | number
```

No es posible utilizar declaraciones `infer` en cláusulas de restricción para parámetros de tipo regular:

```ts
type ReturnType<T extends (...args: any[]) => infer R> = R; // Error, no admitido
```

Sin embargo, se puede obtener el mismo efecto borrando las variables de tipo en la restricción y en su lugar especificando un tipo condicional:

```ts
type AnyFunction = (...args: any[]) => any;
type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : any;
```

## Tipos condicionales predefinidos

TypeScript 2.8 agrega varios tipos condicionales predefinidos a `lib.d.ts`:

- `Exclude<T, U>` -- Excluye de `T` aquellos tipos que se pueden asignar a `U`.
- `Extract<T, U>` -- Extrae de `T` los tipos que se pueden asignar a `U`.
- `NonNullable<T>` -- Excluye `null` y `undefined` de `T`.
- `ReturnType<T>` -- Obtiene el tipo de retorno de un tipo `function`.
- `InstanceType<T>` -- Obtiene el tipo de instancia de un tipo `function constructor`a.

##### Ejemplo

```ts
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"

type T02 = Exclude<string | number | (() => void), Function>; // string | number
type T03 = Extract<string | number | (() => void), Function>; // () => void

type T04 = NonNullable<string | number | undefined>; // string | number
type T05 = NonNullable<(() => string) | string[] | null | undefined>; // (() => string) | string[]

function f1(s: string) {
  return { a: 1, b: s };
}

class C {
  x = 0;
  y = 0;
}

type T10 = ReturnType<() => string>; // string
type T11 = ReturnType<(s: string) => void>; // void
type T12 = ReturnType<<T>() => T>; // {}
type T13 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]
type T14 = ReturnType<typeof f1>; // { a: number, b: string }
type T15 = ReturnType<any>; // `any`
type T16 = ReturnType<never>; // `any`
type T17 = ReturnType<string>; // Error
type T18 = ReturnType<Function>; // Error

type T20 = InstanceType<typeof C>; // C
type T21 = InstanceType<any>; // `any`
type T22 = InstanceType<never>; // `any`
type T23 = InstanceType<string>; // Error
type T24 = InstanceType<Function>; // Error
```

> Nota: El tipo `Exclude` es una implementación adecuada del tipo `Diff` sugerida [aquí](https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458). Hemos utilizado el nombre `Exclude` para evitar romper el código existente que define un `Diff`, además creemos que ese nombre transmite mejor la semántica de `type`. No incluimos el tipo `Omit<T, K>` porque está tipado trivialmente como `Pick<T, Exclude<keyof T, K>>`.

## Control mejorado sobre modificadores de tipo asignados

Los tipos asignados admiten la adición de un modificador `readonly` o `?` una propiedad asignada, pero no brindan soporte para la capacidad de *remover* modificadores.
Esto es importante en [*tipos homomórficos mapeados*](https://github.com/Microsoft/TypeScript/pull/12563) que de forma predeterminada conservan los modificadores del tipo subyacente.

*TypeScript 2.8* agrega la capacidad de que un tipo mapeado agregue o elimine un modificador en particular.
Específicamente, un modificador de propiedad `readonly` o `?` en un tipo mapeado ahora puede tener el prefijo `+` o `-` para indicar que el modificador se debe agregar o eliminar.

#### Ejemplo

```ts
type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] }; // Quitar 'readonly' y '?'
type ReadonlyPartial<T> = { +readonly [P in keyof T]+?: T[P] }; // Agregar 'readonly' y '?'
```

Un modificador sin prefijo `+` o `-` es lo mismo que un modificador con un prefijo `+`. Entonces, el tipo `ReadonlyPartial<T>` anterior corresponde a:

```ts
type ReadonlyPartial<T> = { readonly [P in keyof T]?: T[P] }; // Agregar 'readonly' y '?'
```

Usando esta habilidad, `lib.d.ts` ahora tiene un nuevo tipo `Required<T>`.
Este tipo quita los modificadores `?` de todas las propiedades de `T`, por lo que todas las propiedades son necesarias.

##### Ejemplo

```ts
type Required<T> = { [P in keyof T]-?: T[P] };
```

Ten en cuenta que en el modo [`strictNullChecks`](/tsconfig#strictNullChecks), cuando un tipo mapeado homomórfico elimina un modificador `?` de una propiedad en el tipo subyacente, también elimina `undefined` del tipo de esa propiedad:

##### Ejemplo

```ts
type Foo = { a?: string }; // Igual que { a?: string | undefined }
type Bar = Required<Foo>; // Igual que { a: string }
```

## `keyof` mejorado con intersección de tipos

Con *TypeScript 2.8*, `keyof` aplicado a una intersección de tipos se transforma en una unión de `keyof` aplicada a cada constituyente de la intersección.
En otras palabras, los tipos de la forma `keyof(A & B)` se transforman en `keyof A | keyof B`.
Este cambio debería abordar las inconsistencias con la inferencia de las expresiones `keyof`.

##### Ejemplo

```ts
type A = { a: string };
type B = { b: string };

type T1 = keyof (A & B); // "a" | "b"
type T2<T> = keyof (T & B); // keyof T | "b"
type T3<U> = keyof (A & U); // "a" | keyof U
type T4<T, U> = keyof (T & U); // keyof T | keyof U
type T5 = T2<A>; // "a" | "b"
type T6 = T3<B>; // "a" | "b"
type T7 = T4<A, B>; // "a" | "b"
```

## Mejor manejo de patrones de espacio de nombres en archivos `.js`

*TypeScript 2.8* agrega soporte para comprender más patrones de espacio de nombres en archivos `.js`.
Las declaraciones de objetos literales vacíos en el nivel superior, al igual que las funciones y clases, ahora se reconocen como declaraciones de espacio de nombres en *JavaScript*.

```js
var ns = {}; // reconocido como una declaración para un espacio de nombres `ns`
ns.constant = 1; // reconocido como una declaración `constant` para var
```

Las asignaciones en el nivel superior se deben comportar de la misma manera; en otras palabras, no se requiere una declaración `var` o `const`.

```js
app = {}; // NO necesita ser `var app = {}`
app.C = class {};
app.f = function() {};
app.prop = 1;
```

## *IIFE*s como declaraciones de espacio de nombres

Un *IIFE* que devuelve una función, clase u objeto literal vacío, también se reconoce como un espacio de nombres:

```js
var C = (function() {
  function C(n) {
    this.p = n;
  }
  return C;
})();
C.staticProperty = 1;
```

## Declaraciones incumplidas

Las "declaraciones predeterminadas" permiten iniciadores que hacen referencia al nombre declarado en el lado izquierdo de una lógica o:

```js
my = window.my || {};
my.app = my.app || {};
```

## Asignación de prototipos

Puedes asignar un objeto literal directamente a la propiedad del prototipo. Las asignaciones de prototipos individuales también funcionan:

```ts
var C = function(p) {
  this.p = p;
};
C.prototype = {
  m() {
    console.log(this.p);
  }
};
C.prototype.q = function(r) {
  return this.p === r;
};
```

## Declaraciones anidadas y fusionadas

El anidamiento funciona a cualquier nivel ahora y se fusiona correctamente en todos los archivos. Anteriormente tampoco era el caso.

```js
var app = window.app || {};
app.C = class {};
```

## Fábricas *JSX* por archivo

*TypeScript 2.8* agrega soporte para un nombre de fábrica *JSX* configurable por archivo usando el paradigma `@jsx dom`.
*JSX factory* se puede configurar para una compilación usando [`jsxFactory`](/tsconfig#jsxFactory) (el valor predeterminado es `React.createElement`). Con *TypeScript 2.8* puedes redefinir esto por archivo agregando un comentario al principio del archivo.

##### Ejemplo

```ts
/** @jsx dom */
import { dom } from "./renderer";
<h></h>;
```

Genera:

```js
var renderer_1 = require("./renderer");
renderer_1.dom("h", null);
```

## Espacios de nombres *JSX* de ámbito local

La verificación de tipo *JSX* está impulsada por definiciones en un espacio de nombres *JSX*, por ejemplo, `JSX.Element` para el tipo de un elemento *JSX* y `JSX.IntrinsicElements` para elementos integrados.
Antes de *TypeScript 2.8*, se esperaba que el espacio de nombres `JSX` estuviera en el espacio de nombres global y, por lo tanto, solo permitiera definir uno en un proyecto.
A partir de *TypeScript 2.8*, el espacio de nombres `JSX` se buscará debajo del `jsxNamespace` (por ejemplo, `React`), lo que permite múltiples fábricas `jsx` en una compilación.
Para compatibilidad con versiones anteriores, el espacio de nombres global `JSX` se utiliza como respaldo si no se definió ninguno en la función de fábrica.
Combinado con el paradigma por archivo `@jsx`, cada archivo puede tener una fábrica *JSX* diferente.

## Nuevo `--emitDeclarationOnly`

[`emitDeclarationOnly`](/tsconfig#emitDeclarationOnly) *solo* permite generar archivos de declaración; la generación de salida `.js`/`.jsx` se omitirá con esta marca. La marca es útil cuando la generación de salida `.js` es manejada por un transpilador diferente como *Babel*.
