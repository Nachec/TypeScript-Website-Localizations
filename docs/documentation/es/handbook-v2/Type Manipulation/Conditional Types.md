---
title: Tipos condicionales
layout: docs
permalink: /docs/handbook/2/conditional-types.html
oneline: "Crea tipos que actúen como instrucciones `if` en el sistema de tipos."
---

En el corazón de la mayoría de los programas útiles, tenemos que tomar decisiones basadas en la entrada.
Los programas *JavaScript* no son diferentes, pero dado que los valores se pueden introspectar fácilmente, esas decisiones también se basan en los tipos de la entrada.
Los *tipos condicionales* ayudan a describir la relación entre los tipos de entrada y salida.

```ts twoslash
interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}

type Example1 = Dog extends Animal ? number : string;
//   ^?

type Example2 = RegExp extends Animal ? number : string;
//   ^?
```

Los tipos condicionales toman una forma que se parece un poco a las expresiones condicionales (`condition ? trueExpression : falseExpression`) en *JavaScript*:

```ts twoslash
type SomeType = any;
type OtherType = any;
type TrueType = any;
type FalseType = any;
type Stuff =
  // ---cut---
  SomeType extends OtherType ? TrueType : FalseType;
```

Cuando el tipo a la izquierda de `extends` se pueda asignar al de la derecha, entonces obtendrás el tipo en la primera rama (la rama "true"); de lo contrario, obtendrás el tipo en la última rama (la rama "false").

De los ejemplos anteriores, es posible que los tipos condicionales no parezcan útiles de inmediato: ¡Podemos decirnos a nosotros mismos si `Dog extends Animal` y elegir `number` o `string`!
Pero el poder de los tipos condicionales proviene de usarlos con genéricos.

Por ejemplo, tomemos la siguiente función `createLabel`:

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}

function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
  throw "unimplemented";
}
```

Estas sobrecargas para `createLabel` describen una única función de *JavaScript* que toma una decisión basada en los tipos de sus entradas. Ten en cuenta algunas cosas:

1. Si una biblioteca tiene que hacer el mismo tipo de elección una y otra vez en toda su *API*, esto se vuelve engorroso.
2. Tenemos que crear tres sobrecargas: una para cada caso cuando estamos *seguros* del tipo (uno para `string` y otra para `number`), y una para el caso más general (tomando un `string | number`). Por cada nuevo tipo que pueda manejar `createLabel`, el número de sobrecargas crece exponencialmente.

En cambio, podemos codificar esa lógica en un tipo condicional:

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
// ---cut---
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
```

Luego podemos usar ese tipo condicional para simplificar nuestras sobrecargas a una sola función sin sobrecargas.

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
// ---cut---
function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}

let a = createLabel("typescript");
//  ^?

let b = createLabel(2.8);
//  ^?

let c = createLabel(Math.random() ? "hello" : 42);
//  ^?
```

### Restricciones de tipo condicional

A menudo, las comprobaciones en un tipo condicional nos proporcionarán información nueva.
Al igual que la reducción con guardias de tipo puede darnos un tipo más específico, la verdadera rama de un tipo condicional restringirá aún más los genéricos por el tipo con el que comprobemos.

Por ejemplo, tomemos lo siguiente:

```ts twoslash
// @errors: 2536
type MessageOf<T> = T["message"];
```

En este ejemplo, errores de *TypeScript* porque no se sabe que `T` tenga una propiedad llamada `message`.
Podríamos restringir `T`, y *TypeScript* ya no se quejaría:

```ts twoslash
type MessageOf<T extends { message: unknown }> = T["message"];

interface Email {
  message: string;
}

type EmailMessageContents = MessageOf<Email>;
//   ^?
```

Sin embargo, ¿qué pasaría si quisiéramos que `MessageOf` tomara cualquier tipo y de manera predeterminada algo como `never` si una propiedad `message` no está disponible?
Podemos hacer esto moviendo la restricción e introduciendo un tipo condicional:

```ts twoslash
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

interface Email {
  message: string;
}

interface Dog {
  bark(): void;
}

type EmailMessageContents = MessageOf<Email>;
//   ^?

type DogMessageContents = MessageOf<Dog>;
//   ^?
```

Dentro de la rama `true`, *TypeScript* sabe que `T` *deberá* tener una propiedad `message`.

Como otro ejemplo, también podríamos escribir un tipo llamado `Flatten` que aplana los tipos de arreglos a sus tipos de elementos, pero los deja solos de lo contrario:

```ts twoslash
type Flatten<T> = T extends any[] ? T[number] : T;

// Extrae el tipo de elemento.
type Str = Flatten<string[]>;
//   ^?

// Deja el tipo solo.
type Num = Flatten<number>;
//   ^?
```

Cuando a `Flatten` se le da un tipo de arreglo, usa un acceso indexado con `number` para obtener el tipo de elemento de `string[]`.
De lo contrario, solo devuelve el tipo que se le dio.

### Inferencia dentro de tipos condicionales

Nos encontramos usando tipos condicionales para aplicar restricciones y luego extraer tipos.
Esto termina siendo una operación tan común que los tipos condicionales la facilitan.

Los tipos condicionales nos proporcionan una forma de inferir a partir de los tipos con los que comparamos en la rama verdadera usando la palabra clave `infer`.
Por ejemplo, podríamos haber inferido el tipo de elemento en `Flatten` en lugar de obtenerlo "manualmente" con un tipo de acceso indexado:

```ts twoslash
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```

Aquí, usamos la palabra clave `infer` para introducir declarativamente una nueva variable de tipo genérico llamada `Item` en lugar de especificar cómo recuperar el tipo de elemento de `T` dentro de la rama verdadera.
Esto nos libera de tener que pensar en cómo profundizar y sondear la estructura de los tipos que nos interesan.

Podemos escribir algunos útiles alias de tipos auxiliares usando la palabra clave `infer`.
Por ejemplo, para casos simples, podemos extraer el tipo de retorno de los tipos `function`:

```ts twoslash
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
  ? Return
  : never;

type Num = GetReturnType<() => number>;
//   ^?

type Str = GetReturnType<(x: string) => string>;
//   ^?

type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
//   ^?
```

Cuando se infiere de un tipo con múltiples firmas de llamada (como el tipo de una función sobrecargada), se hacen inferencias a partir de la firma `last` (que, presumiblemente, es el caso general más permisivo). No es posible realizar una resolución de sobrecarga basada en una lista de tipos de argumentos.

```ts twoslash
declare function stringOrNum(x: string): number;
declare function stringOrNum(x: number): string;
declare function stringOrNum(x: string | number): string | number;

type T1 = ReturnType<typeof stringOrNum>;
//   ^?
```

## Tipos condicionales distributivos

Cuando los tipos condicionales actúan sobre un tipo genérico, se vuelven *distributivos* cuando se les da un tipo de unión.
Por ejemplo, toma lo siguiente:

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;
```

Si conectamos un tipo `union` en `ToArray`, entonces el tipo condicional se aplicará a cada miembro de esa unión.

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;
//   ^?
```

Lo que sucede aquí es que `StrArrOrNumArr` se distribuye en:

```ts twoslash
type StrArrOrNumArr =
  // ---cut---
  string | number;
```

y mapea cada tipo miembro de la unión, a lo que es efectivamente:

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;
type StrArrOrNumArr =
  // ---cut---
  ToArray<string> | ToArray<number>;
```

lo que nos deja con:

```ts twoslash
type StrArrOrNumArr =
  // ---cut---
  string[] | number[];
```

Normalmente, la distributividad es el comportamiento deseado.
Para evitar ese comportamiento, puedes rodear cada lado de la palabra clave `extends` con corchetes.

```ts twoslash
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

// 'StrArrOrNumArr' ya no es una unión.
type StrArrOrNumArr = ToArrayNonDist<string | number>;
//   ^?
```
