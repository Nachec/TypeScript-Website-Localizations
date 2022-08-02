---
title: Tipos avanzados
layout: docs
permalink: /docs/handbook/advanced-types.html
oneline: Conceptos avanzados sobre tipos en TypeScript
deprecated_by: /docs/handbook/2/types-from-types.html

# prettier-ignore
deprecation_redirects: [
  type-guards-and-differentiating-types, /docs/handbook/2/narrowing.html,
  user-defined-type-guards, /docs/handbook/2/narrowing.html#usar-predicados-de-tipo,
  typeof-type-guards, "/docs/handbook/2/narrowing.html#typeof-type-guards",
  instanceof-type-guards, /docs/handbook/2/narrowing.html#instanceof-narrowing,
  tipos-que-aceptan-valores-null, /docs/handbook/2/everyday-types.html#null-y-undefined,
  alias-de-tipo, /docs/handbook/2/everyday-types.html#alias-de-tipo,
  interfaces-vs-type-aliases, /docs/handbook/2/everyday-types.html#diferencias-entre-los-alias-de-tipo-y-las-interfaces,
  enum-member-types, /docs/handbook/enums.html,
  polymorphic-this-types, /docs/handbook/2/classes.html,
  index-types, /docs/handbook/2/objects.html#index-signatures,
  index-types-and-index-signatures, /docs/handbook/2/indexed-access-types.html,
  mapped-types, /docs/handbook/2/mapped-types.html,
  inference-from-mapped-types, /docs/handbook/2/mapped-types.html,
  conditional-types, /docs/handbook/2/conditional-types.html,
  tipos-condicionales-distributivos, /docs/handbook/2/conditional-types.html#tipos-condicionales-distributivos,
  inferencia-de-tipos-en-tipos-condicionales, /docs/handbook/2/conditional-types.html#inferencia-dentro-de-tipos-condicionales,
  predefined-conditional-types, /docs/handbook/utility-types.html,
  using-the-in-operator, "/docs/handbook/2/narrowing.html#the-in-operator-narrowing",
  usar-predicados-de-tipo, "/docs/handbook/2/narrowing.html#usar-predicados-de-tipo"
]
---

Esta página enumera algunas de las formas más avanzadas en las que puedes modelar tipos, funciona en conjunto con el documento [Tipos útiles](/docs/handbook/utility-types.html) que incluye tipos que están incluidos en *TypeScript* y disponibles globalmente.

## Protectores de tipo y diferenciación de tipos

Los tipos unión son útiles para modelar situaciones en las que los valores se pueden superponer en los tipos que pueden asumir.
¿Qué sucede cuando necesitamos saber específicamente si tenemos un `Fish`?
Una expresión común en *JavaScript* para diferenciar entre dos posibles valores es comprobar la presencia de un miembro.
Como mencionamos, solo puedes acceder a los miembros que están garantizados en todos los integrantes de una unión de tipos.

```ts twoslash
// @errors: 2339
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
// ---cut---
let pet = getSmallPet();

// Puedes utilizar el operador `'in'` para comprobar
if ("swim" in pet) {
  pet.swim();
}
// Sin embargo, no puedes utilizar el acceso a la propiedad
if (pet.fly) {
  pet.fly();
}
```

Para que el mismo código funcione a través de los descriptores de acceso a la propiedad, necesitaremos usar una aserción de tipo:

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
// ---cut---
let pet = getSmallPet();
let fishPet = pet as Fish;
let birdPet = pet as Bird;

if (fishPet.swim) {
  fishPet.swim();
} else if (birdPet.fly) {
  birdPet.fly();
}
```

Sin embargo, este no es el tipo de código que te gustaría tener en tu código base.

## Protectores de tipo definidos por el usuario

Sería mucho mejor si una vez que realizáramos el control, pudiéramos conocer el tipo de `pet` dentro de cada rama.

Da la casualidad de que *TypeScript* tiene algo llamado *protector de tipo*.
Un protector de tipo es una expresión que realiza una comprobación en el entorno de ejecución que garantiza el tipo en algún ámbito.

### Usar predicados de tipo

Para definir un protector de tipo definido por el usuario, simplemente tenemos que definir una función cuyo tipo de retorno sea un *predicado de tipo*:

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
// ---cut---
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

nuestro *predicado de tipo* en este ejemplo es `pet is Fish`.
Un predicado toma la forma `parameterName is Type`, donde `parameterName` debe ser el nombre de un parámetro de la firma de la función actual.

Cada vez que se llama a `isFish` con alguna variable, *TypeScript* *reducirá* esa variable a ese tipo específico si el tipo original es compatible.

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
// Ambas llamadas a 'swim' y 'fly' ahora están bien.
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

Ten en cuenta que *TypeScript* no solo sabe que `pet` es un `Fish` en la rama `if`;
también sabe en la rama `else` que, *no* tienes un `Fish`, por lo que debes tener un `Bird`.

Puedes utilizar la protección de tipo `isFish` para filtrar un arreglo de `Fish | Bird` y obtener un arreglo de `Fish`:

```ts twoslash
// @errors: 2345
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater1: Fish[] = zoo.filter(isFish);
// o, el equivalente
const underWater2: Fish[] = zoo.filter<Fish>(isFish);
const underWater3: Fish[] = zoo.filter<Fish>((pet) => isFish(pet));
```

### Usar el operador `in`

El operador `in` también actúa como una expresión de restricción para los tipos.

Para una expresión `n in x`, donde `n` es un tipo cadena literal o literal de cadena y `x` es un tipo unión, la rama `"true"` se restringe a tipos que tienen una propiedad `n` opcional o requerida, y la rama `"false"` se restringe a tipos que tienen una propiedad `n` opcional o faltante.

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
// ---cut---
function move(pet: Fish | Bird) {
  if ("swim" in pet) {
    return pet.swim();
  }
  return pet.fly();
}
```

## Protector de tipo `typeof`

Regresemos y escribamos el código para una versión de `padLeft` que usa tipos unión.
La podrías escribir con predicados de tipo de la siguiente manera:

```ts twoslash
function isNumber(x: any): x is number {
  return typeof x === "number";
}

function isString(x: any): x is string {
  return typeof x === "string";
}

function padLeft(value: string, padding: string | number) {
  if (isNumber(padding)) {
    return Array(padding + 1).join(" ") + value;
  }
  if (isString(padding)) {
    return padding + value;
  }
  throw new Error(`Esperaba string o number, obtuve '${padding}'.`);
}
```

Sin embargo, tener que definir una función para determinar si un tipo es primitivo es un tanto vergonzoso.
Afortunadamente, no necesitas abstraer `typeof x === "number"` en tu propia función porque *TypeScript* lo reconocerá como un protector de tipo en sí mismo.
Eso significa que podríamos simplemente escribir estas comprobaciones en línea.

```ts twoslash
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Esperaba string o number, obtuve '${padding}'.`);
}
```

Estos *protectores de tipo `typeof`* se reconocen de dos formas diferentes: `typeof v === "typename"` y `typeof v !== "typename"`, donde `"typename"` puede ser uno de los [valores de retorno del operador `typeof`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof#Description) (`"undefined"`, `"number"`, `"string"`, `"boolean"`, `"bigint"`, `"symbol"`, `"object"` o `"function"`).
Mientras que *TypeScript* no te impedirá comparar con otras cadenas, el lenguaje no reconocerá esas expresiones como protectoras de tipo.

## Protector de tipo `instanceof`

Si has leído sobre protectores de tipo `typeof` y estás familiarizado con el operador `instanceof` en *JavaScript*, probablemente tengas una idea de lo que trata esta sección.

Los *protectores de tipo `instanceof`* son una forma de restringir tipos usando su función constructora.
Por ejemplo, tomemos prestado nuestro ejemplo de `padder` de cadenas de fuerza industrial de antes:

```ts twoslash
interface Padder {
  getPaddingString(): string;
}

class SpaceRepeatingPadder implements Padder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(" ");
  }
}

class StringPadder implements Padder {
  constructor(private value: string) {}
  getPaddingString() {
    return this.value;
  }
}

function getRandomPadder() {
  return Math.random() < 0.5
    ? new SpaceRepeatingPadder(4)
    : new StringPadder("  ");
}

let padder: Padder = getRandomPadder();
//       ^?

if (padder instanceof SpaceRepeatingPadder) {
  padder;
  //   ^?
}
if (padder instanceof StringPadder) {
  padder;
  //   ^?
}
```

El lado derecho de las necesarias `instanceof` debe ser una función constructora, y *TypeScript* lo restringirá a:

1. el tipo de propiedad de la función `prototype` si su tipo no es `any`
2. los tipos unión devueltos por las firmas del constructor de ese tipo

en ese orden.

## Tipos que aceptan valores `null`

*TypeScript* tiene dos tipos especiales, `null` y `undefined`, que tienen los valores `null` y `undefined`, respectivamente.
Los mencionamos brevemente en [la sección Tipos básicos](/docs/handbook/basic-types.html).

De manera predeterminada, el comprobador de tipos considera a `null` y a `undefined` asignables a cualquier cosa.
Efectivamente, `null` y `undefined` son valores válidos de todo tipo.
Eso significa que no es posible *detener* que se asignen a ningún tipo, incluso cuando desees evitarlo.
El inventor de `null`, Tony Hoare, llama a esto su ["error de mil millones de dólares"](https://wikipedia.org/wiki/Null_pointer#History).

El indicador [`strictNullChecks`](/tsconfig#strictNullChecks) corrige esto: cuando declaras una variable, no incluye automáticamente `null` o `undefined`.
Las puedes incluir explícitamente usando un tipo unión:

```ts twoslash
// @errors: 2322
let exampleString = "foo";
exampleString = null;

let stringOrNull: string | null = "bar";
stringOrNull = null;

stringOrNull = undefined;
```

Ten en cuenta que *TypeScript* trata a `null` y `undefined` de manera diferente para hacer coincidir la semántica de *JavaScript*.
`string | null` es un tipo diferente que `string | undefined` y que `string | undefined | null`.

A partir de *TypeScript 3.7* en adelante, puedes usar [encadenamiento opcional](/docs/handbook/release-notes/typescript-3-7.html#optional-chaining) para simplificar el trabajo con tipos `null`ables.

### Parámetros y propiedades opcionales

Con [`strictNullChecks`](/tsconfig#strictNullChecks), un parámetro opcional agrega automáticamente `| undefined`:

```ts twoslash
// @errors: 2345
function f(x: number, y?: number) {
  return x + (y ?? 0);
}

f(1, 2);
f(1);
f(1, undefined);
f(1, null);
```

Lo mismo es cierto para las propiedades opcionales:

```ts twoslash
// @strict: false
// @strictNullChecks: true
// @errors: 2322
class C {
  a: number;
  b?: number;
}

let c = new C();

c.a = 12;
c.a = undefined;
c.b = 13;
c.b = undefined;
c.b = null;
```

### Protectores de tipo y aserciones de tipo

Dado que los tipos `null`ables se implementan con una unión, debes usar un protector de tipo para deshacerte de `null`.
Afortunadamente, este es el mismo código que escribirías en *JavaScript*:

```ts twoslash
function f(stringOrNull: string | null): string {
  if (stringOrNull === null) {
    return "default";
  } else {
    return stringOrNull;
  }
}
```

La eliminación de `null` es bastante obvia aquí, pero también puedes usar operadores terciarios:

```ts twoslash
function f(stringOrNull: string | null): string {
  return stringOrNull ?? "default";
}
```

En los casos en que el compilador no pueda eliminar `null` o `undefined`, puedes usar el operador de aserción de tipo para eliminarlos manualmente.
La sintaxis posfija es `!`: `identifier!` elimina `null` y `undefined` del tipo de `identifier`:

```ts twoslash
// @errors: 2532
function getUser(id: string): UserAccount | undefined {
  return {} as any;
}
// ---cut---
interface UserAccount {
  id: number;
  email?: string;
}

const user = getUser("admin");
user.id;

if (user) {
  user.email.length;
}

// En cambio, si estás seguro de que estos objetos o campos existen, el
// ! posfijo le permite cortocircuitar la nulabilidad
user!.email!.length;
```

## Alias de tipo

Los alias de tipo crean un nuevo nombre para un tipo.
Los alias de tipo a veces son similares a las interfaces, pero pueden nombrar primitivos, uniones, tuplas y cualquier otro tipo que de otro modo tendrías que escribir a mano.

```ts twoslash
type Second = number;

let timeInSecond: number = 10;
let time: Second = 10;
```

Al apodar realmente no creas un nuevo tipo ⏤ creas un nuevo *nombre* para referirte a ese tipo.
Apodar un primitivo no es terriblemente útil, aunque se puede utilizar como una forma de documentación.

Al igual que las interfaces, los alias de tipo también pueden ser genéricos ⏤ podemos simplemente agregar parámetros de tipo y usarlos en el lado derecho de la declaración de alias:

```ts
type Container<T> = { value: T };
```

También podemos hacer que un alias de tipo se refiera a sí mismo en una propiedad:

```ts
type Tree<T> = {
  value: T;
  left?: Tree<T>;
  right?: Tree<T>;
};
```

Junto con los tipos [intersection](/docs/handbook/uniones-and-intersections.html), podemos hacer algunos tipos bastante alucinantes:

```ts twoslash
declare function getDriversLicenseQueue(): LinkedList<Person>;
// ---cut---
type LinkedList<Type> = Type & { next: LinkedList<Type> };

interface Person {
  name: string;
}

let people = getDriversLicenseQueue();
people.name;
people.next.name;
people.next.next.name;
people.next.next.next.name;
//                  ^?
```

## Interfaces frente a alias de tipo

Como mencionamos, los alias de tipo pueden actuar como similares a interfaces; sin embargo, hay algunas sutiles diferencias.

Casi todas las características de una "interfaz" están disponibles en "`type`", la distinción clave es que un tipo no se puede volver a abrir para agregar nuevas propiedades frente a una interfaz que siempre es extensible.

<table class='full-width-table'>
  <tbody>
    <tr>
      <th><code>Interfaz</code></th>
      <th><code>Tipo</code></th>
    </tr>
    <tr>
      <td>
        <p>Extender una interfaz</p>
        <code><pre>
interface Animal {
  name: string
}<br/>
interface Bear extends Animal {
  honey: boolean
}<br/>
const bear = getBear() 
bear.name
bear.honey
        </pre></code>
      </td>
      <td>
        <p>Extender un tipo a través de intersecciones</p>
        <code><pre>
type Animal = {
  name: string
}<br/>
type Bear = Animal & { 
  honey: `Boolean` 
}<br/>
const bear = getBear();
bear.name;
bear.honey;
        </pre></code>
      </td>
    </tr>
    <tr>
      <td>
        <p>Agregar nuevos campos a una interfaz existente</p>
        <code><pre>
interface Window {
  title: string
}<br/>
interface Window {
  ts: import("typescript")
}<br/>
const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
        </pre></code>
      </td>
      <td>
        <p>Un tipo no se puede cambiar después de haber sido creado</p>
        <code><pre>
type Window = {
  title: string
}<br/>
type Window = {
  ts: import("typescript")
}<br/>
// Error: Identificador duplicado 'Window'.<br/>
        </pre></code>
      </td>
    </tr>
    </tbody>
</table>

Debido a que una interfaz mapea más de cerca cómo funcionan los objetos de *JavaScript* [al estar abiertos a la extensión](https://wikipedia.org/wiki/Open/closed_principle), recomendamos usar una interfaz sobre un alias de tipo cuando sea posible.

Por otro lado, si no puedes expresar una forma con una interfaz y necesitas usar una unión de tipos o tupla, los alias suelen ser el camino a seguir.

## Tipos de miembros de enumeración

Como se menciona en [nuestra sección sobre enumeraciones](./enums.html#union-enums-and-enum-member-types), los miembros de enum tienen tipos cuando cada miembro se inicia literalmente.

La mayoría de las veces, cuando hablamos de "tipos `singleton`", nos referimos tanto a los tipos de miembros `enum` como a los tipos numéricos/cadenas literales, aunque muchos usuarios usarán "tipos `singleton`" y "tipos literales" indistintamente.

## Tipos polimórficos `this`

Un tipo polimórfico `this` representa un tipo que es el *subtipo* de la clase o interfaz que lo contiene.
Esto se llama polimorfismo delimitado por *F*, mucha gente lo conoce como el patrón [*API* fluida](https://en.wikipedia.org/wiki/Fluent_interface).
Esto hace que las interfaces jerárquicas fluidas sean mucho más fáciles de expresar, por ejemplo.
Tomemos una calculadora simple que regrese `this` después de cada operación:

```ts twoslash
class BasicCalculator {
  public constructor(protected value: number = 0) {}
  public currentValue(): number {
    return this.value;
  }
  public add(operand: number): this {
    this.value += operand;
    return this;
  }
  public multiply(operand: number): this {
    this.value *= operand;
    return this;
  }
  // ... otras operaciones van aquí ...
}

let v = new BasicCalculator(2).multiply(5).add(1).currentValue();
```

Como la clase usa tipos `this`, puedes ampliarla y la nueva clase puede usar los métodos anteriores sin cambios.

```ts twoslash
class BasicCalculator {
  public constructor(protected value: number = 0) {}
  public currentValue(): number {
    return this.value;
  }
  public add(operand: number): this {
    this.value += operand;
    return this;
  }
  public multiply(operand: number): this {
    this.value *= operand;
    return this;
  }
  // ... otras operaciones van aquí ...
}
// ---cut---
class ScientificCalculator extends BasicCalculator {
  public constructor(value = 0) {
    super(value);
  }
  public sin() {
    this.value = Math.sin(this.value);
    return this;
  }
  // ... otras operaciones van aquí ...
}

let v = new ScientificCalculator(2).multiply(5).sin().add(1).currentValue();
```

Sin tipos `this`, `ScientificCalculator` no habría sido capaz de extender `BasicCalculator` y mantener la interfaz fluida.
`multiplica` habría regresado `BasicCalculator`, que no tiene el método `sin`.
Sin embargo, con tipos `this`, `multiply` devuelve `this`, que está aquí en `ScientificCalculator`.

## Tipos índice

Con los tipos `index`, puedes hacer que el compilador compruebe el código que usa nombres de propiedad dinámicos.
Por ejemplo, un patrón *JavaScript* común es elegir un subconjunto de propiedades de un objeto:

```js
function pluck(o, propertyNames) {
  return propertyNames.map((n) => o[n]);
}
```

Así es como escribirías y usarías esta función en *TypeScript*, usando la **consulta de tipo `index`** y operators de **acceso indexado**:

```ts twoslash
function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
  return propertyNames.map((n) => o[n]);
}

interface Car {
  manufacturer: string;
  model: string;
  year: number;
}

let taxi: Car = {
  manufacturer: "Toyota",
  model: "Camry",
  year: 2014,
};

// El fabricante y el modelo son ambos de tipo cadena,
// para que podamos insertarlos en un arreglo de cadenas tipadas
let makeAndModel: string[] = pluck(taxi, ["manufacturer", "model"]);

// Si intentamos seleccionar el modelo y el año, obtenemos un
// arreglo de un tipo unión: (string | number)[]
let modelYear = pluck(taxi, ["model", "year"]);
```

El compilador comprueba que `manufacturer` y `model` en realidad son propiedades en `Car`.
El ejemplo presenta un par de nuevos operadores de tipo.
Primero es `keyof T` el **operador de consulta de tipo `index`**.
Para cualquier tipo `T`, `keyof T` es la unión de nombres públicos conocidos de la propiedad `T`.
Por ejemplo:

```ts twoslash
interface Car {
  manufacturer: string;
  model: string;
  year: number;
}
// ---cut---
let carProps: keyof Car;
//         ^?
```

`keyof Car` es completamente intercambiable con `"manufacturer"` | `"model"` | `"year"`.
La diferencia es que si agregas otra propiedad a `Car`, diga `ownerAddress: string`, luego `keyof Car` se actualizará automáticamente para ser `"manufacturer"` | `"model"` | `"year"` | `"ownerAddress"`.
Y puedes usar `keyof` en contextos genéricos como `pluck`, donde posiblemente no puedas conocer los nombres de las propiedades con anticipación.
Eso significa que el compilador revisará que pases el conjunto de nombres de propiedad  correcto a `pluck`:

```ts
// error, el tipo `"unknown"` no se puede asignar al tipo `"manufacturer"` | `"model"` | `"year"`
pluck(taxi, ["year", "unknown"]);
```

El segundo operador es `T[K]`, el **operador de acceso indexado**.
Aquí, el tipo de sintaxis refleja la sintaxis de expresión.
Eso significa que `taxi["manufacturer"]` tiene el tipo `Car["manufacturer"]` &mdash; que en nuestro ejemplo es simplemente `string`.
Sin embargo, al igual que las consultas de tipo índice, puedes usar `T[K]` en un contexto genérico, que es donde cobra vida su poder real.
Solo tienes que asegurarte de que la variable sea de tipo `K extends keyof T`.
Aquí hay otro ejemplo con una función llamada `getProperty`.

```ts
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] es de tipo T[K]
}
```

En `getProperty`, `o: T` y `propertyName: K`, entonces eso significa `o[propertyName]: T[K]`.
Una vez que devuelvas el resultado `T[K]`, el compilador creará una instancia del tipo real de la clave, por lo que el tipo de retorno de `getProperty` variará de acuerdo a cual propiedad solicites.

```ts twoslash
// @errors: 2345
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] es de tipo T[K]
}
interface Car {
  manufacturer: string;
  model: string;
  year: number;
}
let taxi: Car = {
  manufacturer: "Toyota",
  model: "Camry",
  year: 2014,
};
// ---cut---
let manufacturer: string = getProperty(taxi, "manufacturer");
let year: number = getProperty(taxi, "year");

let unknown = getProperty(taxi, "unknown");
```

## Tipos índice e índice de firmas

`keyof` y `T[K]` interactúan con los índices de firmas. Un tipo de parámetro de índice de firma debe ser '`string`' o '`number`'.
Si tienes un tipo con un índice de firma de cadena, `keyof T` será `string | number`
(y no solo `string`, ya que en *JavaScript* puedes acceder a una propiedad de objeto
utilizando cadenas (`object["42"]`) o números (`objeto[42]`)).
Y `T[string]` solo es el tipo del índice de firma:

```ts twoslash
interface Dictionary<T> {
  [key: string]: T;
}
let keys: keyof Dictionary<number>;
//     ^?
let value: Dictionary<number>["foo"];
//      ^?
```

Si tienes un tipo con un índice de firma numérico, `keyof T` será simplemente `number`.

```ts twoslash
// @errors: 2339
interface Dictionary<T> {
  [key: number]: T;
}

let keys: keyof Dictionary<number>;
//     ^?
let numberValue: Dictionary<number>[42];
//     ^?
let value: Dictionary<number>["foo"];
```

## Tipos mapeados

Una tarea común es tomar un tipo existente y hacer que cada una de sus propiedades sea opcional:

```ts
interface PersonSubset {
  nombre?: string;
  age?: number;
}
```

O podríamos querer una versión de solo lectura:

```ts
interface PersonReadonly {
  readonly name: string;
  readonly age: number;
}
```

Esto sucede con suficiente frecuencia en *JavaScript* que *TypeScript* proporciona una forma de crear nuevos tipos basados ​​en tipos antiguos ─ **tipos asignados**.
En un tipo asignado, el nuevo tipo transforma de la misma manera cada propiedad en el tipo antiguo.
Por ejemplo, puedes hacer que todas las propiedades sean opcionales o de un tipo `readonly`.
Aquí hay un par de ejemplos:

```ts twoslash
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// @noErrors
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

Y para usarlo:

```ts twoslash
type Person = {
  name: string;
  age: number;
};
// ---cut---
type PersonPartial = Partial<Person>;
//   ^?
type ReadonlyPerson = Readonly<Person>;
//   ^?
```

Ten en cuenta que esta sintaxis describe un tipo en lugar de a un miembro.
Si deseas agregar miembros, puedes usar un tipo de intersección:

```ts twoslash
// @errors: 2693 1005 1128 7061
// Usa this:
type PartialWithNewMember<T> = {
  [P in keyof T]?: T[P];
} & { newMember: boolean }

// ¡Esto es un error!
type WrongPartialWithNewMember<T> = {
  [P in keyof T]?: T[P];
  newMember: boolean;
}
```

Echemos un vistazo al tipo asignado más simple y sus partes:

```ts twoslash
type Keys = "option1" | "option2";
type Flags = { [K in Keys]: boolean };
```

La sintaxis se asemeja a la sintaxis para los índices de firmas con un `for .. in` interior.
Hay tres partes:

1. La variable de tipo `K`, que se vincula a cada propiedad en turno.
2. La  cadena de la unión literal `Keys`, que contiene los nombres de las propiedades para iterar.
3. El tipo resultante de la propiedad.

En este ejemplo simple, `Keys` es una lista codificada de nombres de propiedad y el tipo de propiedad siempre es `boolean`, por lo que este tipo asignado es equivalente a escribir:

```ts twoslash
type Flags = {
  option1: boolean;
  option2: boolean;
};
```

Las aplicaciones reales, sin embargo, se ven como `Readonly` o `Partial` arriba.
Se basan en algún tipo existente y transforman las propiedades de alguna manera.
Ahí es donde entran `keyof` y los tipos de acceso indexado:

```ts twoslash
type Person = {
  name: string;
  age: number;
};
// ---cut---
type NullablePerson = { [P in keyof Person]: Person[P] | null };
//   ^?
type PartialPerson = { [P in keyof Person]?: Person[P] };
//   ^?
```

Pero es más útil tener una versión general.

```ts
type Nullable<T> = { [P in keyof T]: T[P] | null };
type Partial<T> = { [P in keyof T]?: T[P] };
```

En estos ejemplos, la lista de propiedades es `keyof T` y el tipo resultante es alguna variante de `T[P]`.
Esta es una buena plantilla para cualquier uso general de tipos asignados.
Eso es porque este tipo de transformación es [homomórfica](https://wikipedia.org/wiki/Homomorphism), lo cual significa que el mapeo se aplica solo a las propiedades de `T` y no a otras.
El compilador sabe que puedes copiar todos los modificadores de propiedad existentes antes de agregar los nuevos.
Por ejemplo, si `Person.name` fuera de solo lectura, `Partial<Person>.name` sería de solo lectura y opcional.

Aquí hay un ejemplo más, en el que `T[P]` está incluido en una clase `Proxy<T>`:

```ts twoslash
// @noErrors
type Proxy<T> = {
  get(): T;
  set(value: T): void;
};

type Proxify<T> = {
  [P in keyof T]: Proxy<T[P]>;
};

function proxify<T>(o: T): Proxify<T> {
  // ... envuelve proxies ...
}

let props = { rooms: 4 };
let proxyProps = proxify(props);
//  ^?
```

Ten en cuenta que, `Readonly<T>` y `Partial<T>` son tan útiles, que se incluyen en la biblioteca estándar de *TypeScript* junto con `Pick` y `Record`:

```ts
type Recoger<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

`Readonly`, `Partial` y `Pick` son homomórficos, mientras que `Record` no.
Una pista para reconocer que `Record` no es homomórfico es que no toma un tipo de entrada desde el cual copiar propiedades:

```ts twoslash
type ThreeStringProps = Record<"prop1" | "prop2" | "prop3", string>;
```

Los tipos no homomórficos esencialmente crean nuevas propiedades, por lo que no pueden copiar modificadores de propiedad desde ningún lugar.

Ten en cuenta que `keyof any` representa el tipo de cualquier valor que se puede utilizar como índice de un objeto. En otras palabras, `keyof any` actualmente es igual a `string | number | symbol`.

## Inferencia de tipos mapeados

Ahora que ya sabes cómo ajustar las propiedades de un tipo, lo siguiente que desearás hacer es desenvolverlas.
Afortunadamente, eso es bastante fácil:

```ts twoslash
type Proxy<T> = {
  get(): T;
  set(value: T): void;
};

type Proxify<T> = {
  [P in keyof T]: Proxy<T[P]>;
};

function proxify<T>(o: T): Proxify<T> {
  return {} as any;
}

let props = { rooms: 4 };
let proxyProps = proxify(props);
// ---cut---
function unproxify<T>(t: Proxify<T>): T {
  let result = {} as T;
  for (const k in t) {
    result[k] = t[k].get();
  }
  return result;
}

let originalProps = unproxify(proxyProps);
//  ^?
```

Ten en cuenta que esta inferencia desenvolvente solo funciona en tipos homomórficos asignados.
Si el tipo asignado no es homomórfico, tendrás que dar un parámetro de tipo explícito a tu función desenvolvente.

## Tipos condicionales

Un tipo condicional selecciona uno de los dos posibles tipos en función de una condición expresada como una prueba de relación de tipo:

```ts
T extends U ? X : Y
```

El tipo anterior significa que cuando `T` es asignable a `U`, el tipo es `X`, de lo contrario, el tipo es `Y`.

Un tipo condicional `T extends U ? X : Y` está *resuelto* a `X` o `Y`, o *diferido* porque la condición depende de una o más variables de tipo.
Cuando `T` o `U` contiene variables de tipo, ya sea para resolver a `X` o `Y`, o para diferir, se determina si el sistema de tipos tiene o no suficiente información para concluir que `T` siempre es asignable a `U`.

Como ejemplo de algunos tipos que se resuelven de inmediato, podemos echar un vistazo al siguiente ejemplo:

```ts twoslash
declare function f<T extends boolean>(x: T): T extends true ? string : number;

// El tipo es 'string | number'
let x = f(Math.random() < 0.5);
//  ^?
```

Otro ejemplo sería el alias de tipo `TypeName`, que utiliza tipos condicionales anidados:

```ts twoslash
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

type T0 = TypeName<string>;
//   ^?
type T1 = TypeName<"a">;
//   ^?
type T2 = TypeName<true>;
//   ^?
type T3 = TypeName<() => void>;
//   ^?
type T4 = TypeName<string[]>;
//   ^?
```

Pero como ejemplo de un lugar donde se difieren los tipos condicionales: donde se quedan en lugar de coger una rama ⏤ estaría en lo siguiente:

```ts twoslash
interface Foo {
  propA: boolean;
  propB: boolean;
}

declare function f<T>(x: T): T extends Foo ? string : number;

function foo<U>(x: U) {
  // ¿El tipo 'U extiende a Foo? string : number'
  let a = f(x);

  // ¡Sin embargo, esta asignación está permitida!
  let b: string | number = a;
}
```

En lo anterior, la variable `a` tiene un tipo condicional que aún no ha elegido una rama.
Cuando otro código termina llamando a `foo`, se sustituirá en `U` con algún otro tipo, y *TypeScript* volverá a evaluar el tipo condicional, decidiendo si realmente puede elegir una rama.

Mientras tanto, podemos asignar un tipo condicional a cualquier otro tipo de objetivo siempre que cada rama del condicional sea asignable a ese objetivo.
Entonces, en nuestro ejemplo anterior, pudimos asignar `U extends Foo? string : number` a `string | number` ya que no importa a qué se evalúe el condicional, se sabe que es `string` o `number`.

## Tipos condicionales distributivos

Los tipos condicionales en los que el tipo marcado es un parámetro de tipo desnudo se denominan *tipos condicionales distributivos*.
Los tipos condicionales distributivos se distribuyen automáticamente sobre los tipos unión durante la creación de instancias.
Por ejemplo, la creación de una instancia de `T extends U ? X : Y` con el argumento de tipo `A | B | C` para `T` se resuelve como `(¿A extiende U? X : Y) | (B extiende U ? X : Y) | (C extiende U ? X : Y)`.

#### Ejemplo

```ts twoslash
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
// ---cut---
type T5 = TypeName<string | (() => void)>;
//   ^?
type T6 = TypeName<string | string[] | undefined>;
//   ^?
type T7 = TypeName<string[] | number[]>;
//   ^?
```

Al crear instancias de un tipo condicional distributivo `T extends U ? X : Y`, las referencias a `T` dentro del tipo condicional se resuelven en constituyentes individuales del tipo unión (es decir, `T` se refiere a los constituyentes individuales *después de* que el tipo condicional se distribuye sobre el tipo unión).
Además, las referencias a `T` dentro de `X` tienen una restricción de parámetro de tipo adicional `U` (es decir, `T` se considera asignable a `U` dentro de `X`).

#### Ejemplo

```ts twoslash
type BoxedValue<T> = { value: T };
type BoxedArray<T> = { array: T[] };
type Boxed<T> = T extends any[] ? BoxedArray<T[number]> : BoxedValue<T>;

type T1 = Boxed<string>;
//   ^?
type T2 = Boxed<number[]>;
//   ^?
type T3 = Boxed<string | number[]>;
//   ^?
```

Observa que `T` tiene la restricción adicional `any[]` dentro de la rama verdadera de `Boxed<T>` y, por lo tanto, es posible referirse al tipo de elemento del arreglo como `T[number]`. Además, observa cómo se distribuye el tipo condicional sobre el tipo unión en el último ejemplo.

La propiedad distributiva de los tipos condicionales se puede utilizar convenientemente para *filtrar* tipos unión:

```ts twoslash
// @errors: 2300 2322
// Eliminar tipos de T que se pueden asignar a U
type Diff<T, U> = T extends U ? never : T;
// Elimina tipos de T que no se pueden asignar a U
type Filter<T, U> = T extends U ? T : never;

type T1 = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">;
//   ^?
type T2 = Filter<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"
//   ^?
type T3 = Diff<string | number | (() => void), Function>; // string | number
//   ^?
type T4 = Filter<string | number | (() => void), Function>; // () => void
//   ^?

// Elimina null y undefined de T
type NotNullable<T> = Diff<T, null | undefined>;

type T5 = NotNullable<string | number | undefined>;
//   ^?
type T6 = NotNullable<string | string[] | null | undefined>;
//   ^?

function f1<T>(x: T, y: NotNullable<T>) {
  x = y;
  y = x;
}

function f2<T extends string | undefined>(x: T, y: NotNullable<T>) {
  x = y;
  y = x;
  let s1: string = x;
  let s2: string = y;
}
```

Los tipos condicionales son particularmente útiles cuando se combinan con los tipos asignados:

```ts twoslash
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

type T1 = FunctionPropertyNames<Part>;
//   ^?
type T2 = NonFunctionPropertyNames<Part>;
//   ^?
type T3 = FunctionProperties<Part>;
//   ^?
type T4 = NonFunctionProperties<Part>;
//   ^?
```

Ten en cuenta que los tipos condicionales no pueden hacer referencia a sí mismos de forma recursiva. Por ejemplo, lo siguiente es un error.

#### Ejemplo

```ts twoslash
// @errors: 2456 2315
type ElementType<T> = T extends any[] ? ElementType<T[number]> : T; // Error
```

## Inferencia de tipos en tipos condicionales

Dentro de la cláusula `extend` de un tipo condicional, ahora es posible tener declaraciones `infer` que introducen una variable `type` para inferir.
Dichas variables de tipo inferido se pueden referir en la rama `true` del tipo condicional.
Es posible tener múltiples ubicaciones `infer` para la misma variable de tipo.

Por ejemplo, lo siguiente extrae el tipo de retorno de una función `type`:

```ts twoslash
// @noErrors
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

Los tipos condicionales se pueden anidar para formar una secuencia de coincidencias de patrones que se evalúan en orden:

```ts twoslash
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type T0 = Unpacked<string>;
//   ^?
type T1 = Unpacked<string[]>;
//   ^?
type T2 = Unpacked<() => string>;
//   ^?
type T3 = Unpacked<Promise<string>>;
//   ^?
type T4 = Unpacked<Promise<string>[]>;
//   ^?
type T5 = Unpacked<Unpacked<Promise<string>[]>>;
//   ^?
```

El siguiente ejemplo demuestra cómo múltiples candidatos para la misma variable de tipo en posiciones covariantes hacen que se infiera un tipo unión:

```ts twoslash
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;

type T1 = Foo<{ a: string; b: string }>;
//   ^?
type T2 = Foo<{ a: string; b: number }>;
//   ^?
```

Del mismo modo, múltiples candidatos para la misma variable de tipo en posiciones contravariantes hacen que se infiera un tipo intersección:

```ts twoslash
type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }
  ? U
  : never;

type T1 = Bar<{ a: (x: string) => void; b: (x: string) => void }>;
//   ^?
type T2 = Bar<{ a: (x: string) => void; b: (x: number) => void }>;
//   ^?
```

Cuando se infiere de un tipo con múltiples firmas de llamada (como el tipo de una función sobrecargada), se hacen inferencias a partir de la firma `last` (que, presumiblemente, es el caso general más permisivo).
No es posible realizar una resolución de sobrecarga basada en una lista de tipos de argumentos.

```ts twoslash
declare function foo(x: string): number;
declare function foo(x: number): string;
declare function foo(x: string | number): string | number;

type T1 = ReturnType<typeof foo>;
//   ^?
```

No es posible utilizar declaraciones `infer` en cláusulas de restricción para parámetros de tipo regular:

```ts twoslash
// @errors: 1338 2304
type ReturnedType<T extends (...args: any[]) => infer R> = R;
```

Sin embargo, se puede obtener el mismo efecto borrando las variables de tipo en la restricción y en su lugar especificando un tipo condicional:

```ts twoslash
// @noErrors
type AnyFunction = (...args: any[]) => any;
type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : any;
```

## Tipos condicionales predefinidos

*TypeScript* agrega varios tipos condicionales predefinidos, puedes encontrar la lista completa y ejemplos en [Tipos de utilidad](/docs/handbook/utility-types.html).
