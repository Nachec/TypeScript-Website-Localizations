---
title: Tipos utilitarios
layout: docs
permalink: /docs/handbook/utility-types.html
oneline: Tipos que se incluyen globalmente en TypeScript
translatable: true
---

*TypeScript* proporciona varios tipos de utilidad para facilitar las transformaciones de tipos comunes. Estas utilidades están disponibles a nivel global.

## `Awaited<Type>`

<blockquote class=bg-reading>

Liberado en:
[4.5](docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements)

</blockquote>

Este tipo está destinado a modelar operaciones como `await` en funciones `async`, o el
método `.then()` en `Promise`s ⏤ específicamente, la forma en que desenvuelven de forma
recursiva las `Promise`s.

##### Ejemplo

```ts twoslash
type A = Awaited<Promise<string>>;
//   ^?

type B = Awaited<Promise<Promise<number>>>;
//   ^?

type C = Awaited<boolean | Promise<number>>;
//   ^?
```

## `Partial<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.1](/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

Construye un tipo con todas las propiedades de `Type` establecidas como opcionales. Esta utilidad devolverá un tipo que representa todos los subconjuntos de un tipo determinado.

##### Ejemplo

```ts twoslash
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}

const todo1 = {
  title: "organizar escritorio",
  description: "despejar el desorden",
};

const todo2 = updateTodo(todo1, {
  description: "tirar la basura",
});
```

## `Required<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers)

</blockquote>

Construye un tipo que consta de todas las propiedades de `Tipo` establecidas como obligatorias. Lo contrario de [`Partial`](#partialtype).

##### Ejemplo

```ts twoslash
// @errors: 2741
interface Props {
  a?: number;
  b?: string;
}

const obj: Props = { a: 5 };

const obj2: Required<Props> = { a: 5 };
```

## `Readonly<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.1](/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

Construye un tipo con todas las propiedades de `Tipo` establecidas en `readonly`, lo cual significa que las propiedades del tipo construido no se pueden reasignar.

##### Ejemplo

```ts twoslash
// @errors: 2540
interface Todo {
  title: string;
}

const todo: Readonly<Todo> = {
  title: "Eliminar usuarios inactivos",
};

todo.title = "Hola";
```

Esta utilidad sirve para representar expresiones de asignación que fallarán en el entorno de ejecución (es decir, al intentar reasignar propiedades de un [objeto congelado](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze )).

##### `Object.freeze`

```ts
function freeze<Type>(obj: Type): Readonly<Type>;
```

## `Record<Keys, Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.1](/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

Construye un tipo de objeto cuyas claves de propiedad son `keys` y cuyos valores de propiedad son `Type`. Esta utilidad sirve para asignar las propiedades de un tipo a otro tipo.

##### Ejemplo

```ts twoslash
interface CatInfo {
  age: number;
  breed: string;
}

type CatName = "miffy" | "boris" | "mordred";

const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: "Persian" },
  boris: { age: 5, breed: "Maine Coon" },
  mordred: { age: 16, breed: "British Shorthair" },
};

cats.boris;
// ^?
```

## `Pick<Type, Keys>`

<blockquote class=bg-reading>

Liberado en:  
[2.1](/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

Construye un tipo seleccionando el conjunto de propiedades `keys` (literal de cadena o unión de literales de cadena) de `Type`.

##### Ejemplo

```ts twoslash
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

todo;
// ^?
```

## `Omit<Type, Keys>`

<blockquote class=bg-reading>

Liberado en:  
[3.5](/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type)

</blockquote>

Construye un tipo seleccionando todas las propiedades de `Type` y luego eliminando `Keys` (cadena literal o unión de cadenas literales).

##### Ejemplo

```ts twoslash
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

type TodoPreview = Omit<Todo, "description">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
  createdAt: 1615544252770,
};

todo;
// ^?

type TodoInfo = Omit<Todo, "completed" | "createdAt">;

const todoInfo: TodoInfo = {
  title: "Pick up kids",
  description: "Kindergarten closes at 5pm",
};

todoInfo;
// ^?
```

## `Exclude<UnionType, ExcludedMembers>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

Construye un tipo excluyendo de `Type` a todos los miembros de la unión que se pueden asignar a `ExcludedUnion`.

##### Ejemplo

```ts twoslash
type T0 = Exclude<"a" | "b" | "c", "a">;
//    ^?
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
//    ^?
type T2 = Exclude<string | number | (() => void), Function>;
//    ^?
```

## `Extract<Type, Union>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

Construye un tipo excluyendo de `Type` a todos los miembros de la unión que se pueden asignar a `Union`.

##### Ejemplo

```ts twoslash
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
//    ^?
type T1 = Extract<string | number | (() => void), Function>;
//    ^?
```

## `NonNullable<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

Construye un tipo excluyendo `null` y `undefined` de `Type`.

##### Ejemplo

```ts twoslash
type T0 = NonNullable<string | number | undefined>;
//    ^?
type T1 = NonNullable<string[] | null | undefined>;
//    ^?
```

## `Parameters<Type>`

<blockquote class=bg-reading>

Liberado en:  
[3.1](https://github.com/microsoft/TypeScript/pull/26243)

</blockquote>

Construye un tipo de tupla a partir de los tipos utilizados en los parámetros de un tipo función `Type`.

##### Ejemplo

```ts twoslash
// @errors: 2344
declare function f1(arg: { a: number; b: string }): void;

type T0 = Parameters<() => string>;
//    ^?
type T1 = Parameters<(s: string) => void>;
//    ^?
type T2 = Parameters<<T>(arg: T) => T>;
//    ^?
type T3 = Parameters<typeof f1>;
//    ^?
type T4 = Parameters<any>;
//    ^?
type T5 = Parameters<never>;
//    ^?
type T6 = Parameters<string>;
//    ^?
type T7 = Parameters<Function>;
//    ^?
```

## `ConstructorParameters<Type>`

<blockquote class=bg-reading>

Liberado en:  
[3.1](https://github.com/microsoft/TypeScript/pull/26243)

</blockquote>

Construye un tipo *tupla* o *array* a partir de los tipos de un tipo de función constructora. Produce un tipo de *tupla* con todos los tipos de parámetros (o el tipo `never` si `Type` no es una función).

##### Ejemplo

```ts twoslash
// @errors: 2344
// @strict: false
type T0 = ConstructorParameters<ErrorConstructor>;
//    ^?
type T1 = ConstructorParameters<FunctionConstructor>;
//    ^?
type T2 = ConstructorParameters<RegExpConstructor>;
//    ^?
type T3 = ConstructorParameters<any>;
//    ^?

type T4 = ConstructorParameters<Function>;
//    ^?
```

## `ReturnType<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

Construye un tipo que consta del tipo de retorno de la función `Type`.

##### Ejemplo

```ts twoslash
// @errors: 2344 2344
declare function f1(): { a: number; b: string };

type T0 = ReturnType<() => string>;
//    ^?
type T1 = ReturnType<(s: string) => void>;
//    ^?
type T2 = ReturnType<<T>() => T>;
//    ^?
type T3 = ReturnType<<T extends U, U extends number[]>() => T>;
//    ^?
type T4 = ReturnType<typeof f1>;
//    ^?
type T5 = ReturnType<any>;
//    ^?
type T6 = ReturnType<never>;
//    ^?
type T7 = ReturnType<string>;
//    ^?
type T8 = ReturnType<Function>;
//    ^?
```

## `InstanceType<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.8](/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

Construye un tipo que consiste en el tipo de instancia de una función constructora en `Type`.

##### Ejemplo

```ts twoslash
// @errors: 2344 2344
// @strict: false
class C {
  x = 0;
  y = 0;
}

type T0 = InstanceType<typeof C>;
//    ^?
type T1 = InstanceType<any>;
//    ^?
type T2 = InstanceType<never>;
//    ^?
type T3 = InstanceType<string>;
//    ^?
type T4 = InstanceType<Function>;
//    ^?
```

## `ThisParameterType<Type>`

<blockquote class=bg-reading>

Liberado en:  
[3.3](https://github.com/microsoft/TypeScript/pull/28920)

</blockquote>

Extrae el tipo del parámetro [`this`](/docs/handbook/functions.html#this-parameters) para un tipo de función, o [`unknown`](/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type) si el tipo `function` no tiene el parámetro `this`.

##### Ejemplo

```ts twoslash
function toHex(this: Number) {
  return this.toString(16);
}

function numberToString(n: ThisParameterType<typeof toHex>) {
  return toHex.apply(n);
}
```

## `OmitThisParameter<Type>`

<blockquote class=bg-reading>

Liberado en:  
[3.3](https://github.com/microsoft/TypeScript/pull/28920)

</blockquote>

Elimina el parámetro [`this`](/docs/handbook/functions.html#this-parameters) de `Type`. Si `Type` no tiene un parámetro `this` declarado explícitamente, el resultado es simplemente `Type`. De lo contrario, se crea un nuevo tipo de función sin el parámetro `this` a partir de `Type`. Los genéricos se borran y solo la última firma de sobrecarga se propaga al nuevo tipo `function`.

##### Ejemplo

```ts twoslash
function toHex(this: Number) {
  return this.toString(16);
}

const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);

console.log(fiveToHex());
```

## `ThisType<Type>`

<blockquote class=bg-reading>

Liberado en:  
[2.3](https://github.com/microsoft/TypeScript/pull/14141)

</blockquote>

Esta utilidad no devuelve un tipo transformado. En cambio, sirve como marcador para un tipo [`this`](/docs/handbook/functions.html#this) contextual. Ten en cuenta que el indicador [`noImplicitThis`](/tsconfig#noImplicitThis) debe estar habilitado para utilizar esta utilidad.

##### Ejemplo

```ts twoslash
// @noImplicitThis: false
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>; // El tipo de 'this' en los métodos es D & M
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  let data: object = desc.data || {};
  let methods: object = desc.methods || {};
  return { ...data, ...methods } as D & M;
}

let obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // 'this' fuertemente tipado
      this.y += dy; // 'this' fuertemente tipado
    },
  },
});

obj.x = 10;
obj.y = 20;
obj.moveBy(5, 5);
```

En el ejemplo anterior, el objeto `methods` en el argumento de `makeObject` tiene un tipo contextual que incluye `ThisType<D & M>` y, por lo tanto, el tipo de [`this`](/docs/handbook/functions.html#this) en los métodos dentro del objeto `methods` es `{ x: number, y: number } & { moveBy(dx: number, dy: number): number }`. Observa cómo el tipo de la propiedad `methods` es simultáneamente un objetivo de inferencia y una fuente para el tipo `this` en los métodos.

La interfaz del marcador `ThisType<T>` simplemente es una interfaz vacía declarada en `lib.d.ts`. Más allá de ser reconocida en el tipo contextual de un objeto literal, la interfaz actúa como cualquier interfaz vacía.

## Tipos de manipulación intrínseca de cadenas

### `Uppercase<StringType>`

### `Lowercase<StringType>`

### `Capitalize<StringType>`

### `Uncapitalize<StringType>`

Para ayudar con la manipulación de cadenas alrededor de literales de cadena de plantilla, *TypeScript* incluye un conjunto de tipos que se pueden usar en la manipulación de cadenas dentro del sistema de tipos. Los puedes encontrar en la documentación de [Tipos `Template` literales](docs/handbook/2/template-literal-types.html#uppercasestringtype).
