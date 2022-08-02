---
title: Tipos Objeto
layout: docs
permalink: /docs/handbook/2/objects.html
oneline: "Cómo describe TypeScript las formas de los objetos JavaScript."
---

En *JavaScript*, la forma fundamental en que agrupamos y pasamos datos es a través de objetos.
En *TypeScript*, los representamos a través de *tipos `object`*.

Como hemos visto, pueden ser anónimos:

```ts twoslash
function greet(person: { name: string; age: number }) {
  //                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  return "Hello " + person.name;
}
```

o se pueden nombrar usando una interfaz

```ts twoslash
interface Person {
  //      ^^^^^^
  name: string;
  age: number;
}

function greet(person: Person) {
  return "Hello " + person.name;
}
```

o un alias de tipo.

```ts twoslash
type Person = {
  // ^^^^^^
  name: string;
  age: number;
};

function greet(person: Person) {
  return "Hello " + person.name;
}
```

En los tres ejemplos anteriores, hemos escrito funciones que toman objetos que contienen la propiedad `name` (que debe ser un `string`) y `age` (que debe ser un `number`).

## Modificadores de propiedad

Cada propiedad de un tipo objeto puede especificar un par de cosas: el tipo, si la propiedad es opcional y si se puede escribir en la propiedad.

### Propiedades opcionales

La mayor parte del tiempo, nos encontraremos tratando con objetos que *podrían* tener un conjunto de propiedades.
En esos casos, podemos marcar esas propiedades como *opcionales* agregando un signo de interrogación (`?`) al final de sus nombres.

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

// ---cut---
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  //  ^
  yPos?: number;
  //  ^
}

function paintShape(opts: PaintOptions) {
  // ...
}

const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

En este ejemplo, tanto `xPos` como `yPos` se consideran opcionales.
Podemos optar por proporcionar cualquiera de ellos, por lo que todas las llamadas anteriores a `paintShape` son válidas.
Todo lo que realmente dice la opcionalidad es que si la propiedad *está* establecida, es mejor que tenga un tipo específico.


También podemos leer de esas propiedades ⏤ pero cuando lo hacemos bajo [`strictNullChecks`](/tsconfig#strictNullChecks), *TypeScript* nos dirá que, potencialmente son `undefined`.

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos;
  //              ^?
  let yPos = opts.yPos;
  //              ^?
  // ...
}
```

En *JavaScript*, incluso si la propiedad nunca se ha establecido, aún podemos acceder a ella: solo nos dará el valor `undefined`.
Podemos manejar `undefined` especialmente.

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  //  ^?
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
  //  ^?
  // ...
}
```

Ten en cuenta que este patrón de establecimiento de valores predeterminados para valores no especificados es tan común que *JavaScript* tiene una sintaxis para admitirlo.

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log("x coordinate at", xPos);
  //                             ^?
  console.log("y coordinate at", yPos);
  //                             ^?
  // ...
}
```

Aquí usamos [un patrón de desestructuración](https://developer.mozilla.org/docs/Web/JavaScript/Referencia/Operadores/Destructuring_assignment) para el parámetro de `paintShape`, y proporcionamos [valores predeterminados](https://developer.mozilla.org/docs/Web/JavaScript/Referencia/Operadores/Destructuring_assignment#Default_values) para `xPos` y `yPos`.
Ahora, `xPos` y `yPos` están definitivamente presentes en el cuerpo de `paintShape`, pero son opcionales para cualquier persona que llame a `paintShape`.

> Ten en cuenta que actualmente no hay forma de colocar anotaciones de tipo dentro de patrones de desestructuración.
> Esto se debe a que la siguiente sintaxis ya significa algo diferente en *JavaScript*.

```ts twoslash
// @noImplicitAny: false
// @errors: 2552 2304
interface Shape {}
declare function render(x: unknown);
// ---cut---
function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
  render(shape);
  render(xPos);
}
```

En un patrón de desestructuración de objetos, `forma: Forma` significa "toma la propiedad `shape` y redefinirla localmente como una variable llamada `Shape`.
Asimismo, `xPos: number` crea una variable llamada `number` cuyo valor se basa en `xPos` del parámetro.

Con [modificadores de mapeo](/docs/handbook/2/mapped-types.html#modificadores-de-mapeo), puedes eliminar los atributos `optional`.

### Propiedades `readonly`

Las propiedades también se pueden marcar como `readonly` para *TypeScript*.
Si bien no cambiará ningún comportamiento en el entorno de ejecución, no se puede escribir en una propiedad marcada como `readonly` durante la comprobación de tipos.

```ts twoslash
// @errors: 2540
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  // Podemos leer desde 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`);

  // Pero no lo podemos reasignar.
  obj.prop = "hello";
}
```

El uso del modificador `readonly` no implica necesariamente que un valor sea totalmente inmutable ⏤ o en otras palabras, que su contenido interno no se puede modificar.
Simplemente significa que no se puede reescribir la propiedad en sí.

```ts twoslash
// @errors: 2540
interface Home {
  readonly resident: { name: string; age: number };
}

function visitForBirthday(home: Home) {
  // Podemos leer y actualizar las propiedades de 'home.resident'.
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}

function evict(home: Home) {
  // Pero no podemos escribir a la propiedad 'resident' en sí en una 'Home'.
  home.resident = {
    name: "Victor the Evictor",
    age: 42,
  };
}
```

Es importante gestionar las expectativas de lo que implica `readonly`.
Es útil señalar la intención durante el tiempo de desarrollo de *TypeScript* sobre cómo se debe usar un objeto.
*TypeScript* no tiene en cuenta si las propiedades de dos tipos son `readonly` cuando se comprueba si esos tipos son compatibles, por lo que las propiedades `readonly` también pueden cambiar mediante alias.

```ts twoslash
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};

// trabajos
let readonlyPerson: ReadonlyPerson = writablePerson;

console.log(readonlyPerson.age); // prints '42'
writablePerson.age++;
console.log(readonlyPerson.age); // prints '43'
```

Con [Modificadores de mapeo](/docs/handbook/2/mapped-types.html#modificadores-de-mapeo), puedes eliminar los atributos `readonly`.

### Índice de firmas

A veces, no conoces todos los nombres de las propiedades de un tipo de antemano, pero sí conoces la forma de los valores.

En esos casos, puedes utilizar un índice de firma para describir los tipos de valores posibles, por ejemplo:

```ts twoslash
declare function getStringArray(): StringArray;
// ---cut---
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1];
//     ^?
```

Arriba, tenemos una interfaz `StringArray` que tiene un índice de firma.
Este índice de firma indica que cuando un `StringArray` se indexa con un `number`, devolverá un `string`.

Un tipo de propiedad de índice de firma debe ser `string` o `number`.

<details>
    <summary>Es posible admitir ambos tipos de indexadores...</summary>
    <p>Es posible admitir muchos tipos de indexadores, pero el tipo devuelto por un indexador numérico debe ser un subtipo del tipo devuelto por el indexador de cadenas. Esto se debe a que cuando se indexa con un <code>number</code>, <em>JavaScript</em> lo convertirá en un <code>string</code> antes de indexarlo en un objeto. Eso significa que indexar con <code>100</code> (un <code>number</code>) es lo mismo que indexar con <code>"100"</code> (un <code>string</code>), por lo que los dos deben ser coherentes.</p>

```ts twoslash
// @errors: 2413
// @strictPropertyInitialization: false
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Error: ¡indexar con una cadena numérica puede obtener un tipo de Animal completamente diferente!
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}
```

</details>

Si bien los índices de firmas de cadena son una forma poderosa de describir el patrón de "diccionario", también imponen que todas las propiedades coincidan con su tipo de retorno.
Esto se debe a que un índice de cadena declara que `obj.property` también está disponible como `obj["property"]`.
En el siguiente ejemplo, el tipo de `name` no coincide con el tipo del índice de la cadena y el comprobador de tipo da un error:

```ts twoslash
// @errors: 2411
// @errors: 2411
interface NumberDictionary {
  [index: string]: number;

  length: number; // Bien
  name: string;
}
```

Sin embargo, las propiedades de diferentes tipos son aceptables si el índice de firma es una unión de los tipos de propiedad:

```ts twoslash
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // bien, la longitud es un número
  name: string; // ok, el name es una cadena
}
```

Finalmente, puedes hacer que los índices de firmas sean de "solo lectura" para evitar la asignación a sus índices:

```ts twoslash
declare function getReadOnlyStringArray(): ReadonlyStringArray;
// ---cut---
// @errors: 2542
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory";
```

No puedes configurar `myArray[2]` porque el índice de firma es `readonly`.

## Ampliación de tipos

Es bastante común tener tipos que podrían ser versiones más específicas de otros tipos.
Por ejemplo, podríamos tener un tipo `BasicAddress` que describe los campos necesarios para enviar cartas y paquetes en los *EE. UU*.

```ts twoslash
interface BasicAddress {
  nombre?: string;
  street: string;
  ciudad: string;
  country: string;
  postalCode: string;
}
```

En algunas situaciones, eso es suficiente, pero las direcciones a menudo tienen un número de unidad asociado si el edificio en una dirección tiene varias unidades.
Entonces podemos describir una `AddressWithUnit`.

<!-- prettier-ignore -->
```ts twoslash
interface AddressWithUnit {
  nombre?: string;
  unit: string;
//^^^^^^^^^^^^^
  street: string;
  ciudad: string;
  country: string;
  postalCode: string;
}
```

Esto funciona, pero la desventaja aquí es que tuvimos que repetir todos los otros campos de `BasicAddress` cuando nuestros cambios eran puramente aditivos.
En su lugar, podemos extender el tipo `BasicAddress` original y simplemente agregar los nuevos campos que son exclusivos de `AddressWithUnit`.

```ts twoslash
interface BasicAddress {
  nombre?: string;
  street: string;
  ciudad: string;
  country: string;
  postalCode: string;
}

interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

La palabra clave `extends` en una `interface` nos permite copiar miembros de otros tipos con nombre y agregar los miembros nuevos que queramos.
Esto puede ser útil para reducir la cantidad de texto repetitivo de declaración de tipos que tenemos que escribir y para señalar la intención de que varias declaraciones diferentes de la misma propiedad podrían estar relacionadas.
Por ejemplo, `AddressWithUnit` no necesitaba repetir la propiedad `street`, y debido a que `street` se origina en `BasicAddress`, el lector sabrá que esos dos tipos están relacionados de alguna manera.

La `interface` también se puede extender desde varios tipos.

```ts twoslash
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

## Tipos intersección

La `interface` nos permitió construir nuevos tipos a partir de otros tipos extendiéndolos.
*TypeScript* proporciona otra construcción llamada *tipos intersección* que se usa principalmente para combinar tipos de objetos existentes.

Un tipo intersección se define mediante el operador `&`.

```ts twoslash
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;
```

Aquí, hemos cruzado `Colorful` y `Circle para producir un nuevo tipo que tiene todos los miembros de `Colorful` *y* `Circle.

```ts twoslash
// @errors: 2345
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
// ---cut---
function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}

// bien
draw({ color: "blue", radius: 42 });

// oops!
draw({ color: "red", raidus: 42 });
```

## Interfaces frente a intersecciones

Acabamos de ver dos formas de combinar tipos que son similares, pero en realidad son sutilmente diferentes.
Con las interfaces, podríamos usar una cláusula `extensions` para extender desde otros tipos, y pudimos hacer algo similar con las intersecciones y nombrar el resultado con un alias de tipo.
La principal diferencia entre los dos es cómo se manejan los conflictos, y esa diferencia suele ser una de las principales razones por las que elegiría uno sobre el otro entre una interfaz y un alias de tipo de un tipo intersección.

<!--
Por ejemplo, dos tipos pueden declarar la misma propiedad en una interfaz.

PENDIENTE -->

## Tipos de objetos genéricos

Imaginemos un tipo `Box` que puede contener cualquier valor ⏤ `string`s, `number`s, `Jirafa`s, lo que sea.

```ts twoslash
interface Box {
  contents: any;
}
```

En este momento, la propiedad `content` se escribe como `any`, que funciona, pero puede provocar accidentes en el futuro.

En su lugar, podríamos usar `unknown`, pero eso significaría que en los casos en los que ya conocemos el tipo de `contents`, tendríamos que hacer comprobaciones de precaución o usar aserciones de tipo propensas a errores.

```ts twoslash
interface Box {
  contents: unknown;
}

let x: Box = {
  contents: "hello world",
};

// podríamos comprobar 'x.contents'
if (typeof x.contents === "string") {
  console.log(x.contents.toLowerCase());
}

// o podríamos usar una aserción de tipo
console.log((x.contents as string).toLowerCase());
```

Un enfoque seguro de tipo sería, en su lugar, crear diferentes tipos de `Box` para cada tipo de `contents`.

```ts twoslash
// @errors: 2322
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
```

Pero eso significa que tendremos que crear diferentes funciones, o sobrecargas de funciones, para operar en estos tipos.

```ts twoslash
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
// ---cut---
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

Eso es un montón de repetición. Además, es posible que más adelante necesitemos introducir nuevos tipos y sobrecargas.
Esto es frustrante, ya que nuestros tipos de cajas y sobrecargas son todos efectivamente iguales.

En su lugar, podemos crear un tipo *genérico* `Box` que declare un `type parameter`.

```ts twoslash
interface Box<Type> {
  contents: Type;
}
```

Puedes leer esto como “Una`Box` de `Type` es algo cuyo `content` tiene el tipo `Type`”.
Más adelante, cuando nos referimos a `Box`, tenemos que dar un *tipo al argumento* en lugar de `Type`.

```ts twoslash
interface Box<Type> {
  contents: Type;
}
// ---cut---
let box: Box<string>;
```

Piensa en `Box` como una plantilla para un tipo real, donde `Type` es un marcador de posición que será reemplazado por algún otro tipo.
Cuando *TypeScript* ve `Box<string>`, reemplazará cada instancia de `Type` en `Box<Type>` con `string`, y terminará trabajando con algo como  `content: string }`.
En otras palabras, `Box<string>` y nuestra anterior `StringBox` funciona de manera idéntica.

```ts twoslash
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}

let boxA: Box<string> = { contents: "hello" };
boxA.contents;
//   ^?

let boxB: StringBox = { contents: "world" };
boxB.contents;
//   ^?
```

`Box` es reutilizable en el sentido de que `Type` se puede sustituir por cualquier cosa. Eso significa que cuando necesitamos un cuadro para un nuevo tipo, no necesitamos declarar un nuevo tipo `Box` en absoluto (aunque ciertamente podríamos hacerlo si quisiéramos).

```ts twoslash
interface Box<Type> {
  contents: Type;
}

interface Apple {
  // ....
}

// Igual que '{ contents: Apple }'.
type AppleBox = Box<Apple>;
```

Esto también significa que podemos evitar las sobrecargas por completo utilizando en su lugar [funciones genéricas](/docs/handbook/2/functions.html#generic-functions).

```ts twoslash
interface Box<Type> {
  contents: Type;
}

// ---cut---
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

Vale la pena señalar que los alias de tipo también pueden ser genéricos. Podríamos haber definido nuestra nueva interfaz `Box<Type>`, que era:

```ts twoslash
interface Box<Type> {
  contents: Type;
}
```

utilizando un alias de tipo en su lugar:

```ts twoslash
type Box<Type> = {
  contents: Type;
};
```

Dado que los alias de tipo, a diferencia de las interfaces, pueden describir más que solo tipos de objetos, también podemos usarlos para escribir otros tipos de tipos de ayuda genéricos.

```ts twoslash
// @errors: 2575
type OrNull<Type> = Type | null;

type OneOrMany<Type> = Type | Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
//   ^?

type OneOrManyOrNullStrings = OneOrManyOrNull<string>;
//   ^?
```

Volveremos a los alias de tipo en un momento.

### El tipo `Array`

Los tipos de objetos genéricos son a menudo algún tipo de tipo de contenedor que funciona independientemente del tipo de elementos que contienen.
Es ideal que las estructuras de datos funcionen de esta manera para que sean reutilizables en diferentes tipos de datos.

Resulta que hemos estado trabajando con un tipo así a lo largo de este manual: el tipo `Array`.
Siempre que escribimos tipos como `number[]` o `string[]`, eso en realidad es una abreviatura de `Array<number>` y `Array<string>`.

```ts twoslash
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ["hello", "world"];

// ¡Cualquiera de estas funciona!
doSomething(myArray);
doSomething(new Array("hello", "world"));
```

Al igual que el tipo `Box` anterior, `Array` en sí mismo es un tipo genérico.

```ts twoslash
// @noLib: true
interface Number {}
interface String {}
interface Boolean {}
interface Symbol {}
// ---cut---
interface Array<Type> {
  /**
   * Obtiene o establece la longitud del arreglo.
   */
  length: number;

  /**
   * Elimina el último elemento de un arreglo y lo devuelve.
   */
  pop(): Type | undefined;

  /**
   * Agrega nuevos elementos a un arreglo y devuelve la nueva longitud del arreglo.
   */
  push(...elementos: Type[]): number;

  // ...
}
```

El *JavaScript* moderno también proporciona otras estructuras de datos que son genéricas, tal como `Map<K, V>`, `Set<T>` y `Promise<T>`.
Todo esto realmente significa que debido a cómo se comportan `Map`, `Set` y `Promise`, pueden funcionar con cualquier conjunto de tipos.

### El tipo `ReadonlyArray`

`ReadonlyArray` es un tipo especial que describe arreglos que no se deben cambiar.

```ts twoslash
// @errors: 2339
function doStuff(values: ReadonlyArray<string>) {
  // Podemos leer desde 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...pero no podemos mutar 'values'.
  values.push("hello!");
}
```

Al igual que el modificador `readonly` para propiedades, principalmente es una herramienta que podemos usar para la intención.
Cuando vemos una función que devuelve `ReadonlyArray`s, nos dice que no debemos cambiar el contenido en absoluto, y cuando vemos una función que consume `ReadonlyArray`s, nos dice que podemos pasar cualquier arreglo a esa función sin preocuparnos de que cambie su contenido.

A diferencia de `Array`, no hay un constructor de `ReadonlyArray` que podamos usar.

```ts twoslash
// @errors: 2693
new ReadonlyArray("red", "green", "blue");
```

En su lugar, podemos asignar `Array`s regulares a `ReadonlyArray`s.

```ts twoslash
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

Así como *TypeScript* proporciona una sintaxis abreviada para `Array<Type>` con `Type[]`, también proporciona una sintaxis abreviada para `ReadonlyArray<Type>` con `readonly Type[]`.

```ts twoslash
// @errors: 2339
function doStuff(values: readonly string[]) {
  //                     ^^^^^^^^^^^^^^^^^
  // Podemos leer desde 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...pero no podemos mutar 'values'.
  values.push("hello!");
}
```

Una última cosa a tener en cuenta es que, a diferencia del modificador de propiedad `readonly`, la asignabilidad no es bidireccional entre los `Array`s regulares y los `ReadonlyArray`s.

```ts twoslash
// @errors: 4104
let x: readonly string[] = [];
let y: string[] = [];

x = y;
y = x;
```

### Tipos tupla

Un *tipo tupla* es otro tipo de `Array` que sabe exactamente cuántos elementos contiene y exactamente qué tipos contiene en posiciones específicas.

```ts twoslash
type StringNumberPair = [string, number];
//                      ^^^^^^^^^^^^^^^^
```

Aquí, `StringNumberPair` es un tipo de tupla de `string` y `number`.
Como `ReadonlyArray`, no tiene representación en el entorno de ejecución, pero es importante para *TypeScript*.
Para el sistema de tipos, `StringNumberPair` describe arreglos cuyo índice `0` contiene un `string` y cuyo índice `1` contiene un `number`.

```ts twoslash
function doSomething(pair: [string, number]) {
  const a = pair[0];
  //    ^?
  const b = pair[1];
  //    ^?
  // ...
}

doSomething(["hello", 42]);
```

Si intentamos indexar más allá del número de elementos, obtendremos un error.

```ts twoslash
// @errors: 2493
function doSomething(pair: [string, number]) {
  // ...

  const c = pair[2];
}
```

También podemos [desestructurar tuplas](https://developer.mozilla.org/docs/Web/JavaScript/Referencia/Operadores/Destructuring_assignment#Desestructuraci%C3%B3n_de_arreglos) usando la desestructuración de arreglos de *JavaScript*.

```ts twoslash
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;

  console.log(inputString);
  //          ^?

  console.log(hash);
  //          ^?
}
```

> Los tipos tupla son útiles en *API* basadas en gran medida en convenciones, donde el significado de cada elemento es "obvio".
> Esto nos da flexibilidad en lo que queramos nombrar nuestras variables cuando las desestructuramos.
> En el ejemplo anterior, pudimos nombrar elementos `0` y `1` a lo que quisiéramos.
>
> Sin embargo, dado que no todos los usuarios tienen la misma visión de lo que es obvio, puede valer la pena reconsiderar si el uso de objetos con nombres de propiedad descriptivos puede ser mejor para tu *API*.

Aparte de las comprobaciones de longitud, los tipos tupla simples como estos son equivalentes a tipos que son versiones de `Array`s que declaran propiedades para índices específicos y que declaran `length` con un tipo numérico literal.

```ts twoslash
interface StringNumberPair {
  // propiedades especializadas
  length: 2;
  0: string;
  1: number;

  // Otros miembros 'Array<string | number>'...
  slice(start?: number, fin?: number): Array<string | number>;
}
```

Otra cosa que puede interesarte es que las tuplas pueden tener propiedades opcionales escribiendo un signo de interrogación (`?` después del tipo de un elemento).
Los elementos opcionales de tupla solo pueden aparecer al final y también afectan el tipo de `length`.

```ts twoslash
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;
  //           ^?

  console.log(`Provided coordinates had ${coord.length} dimensions`);
  //                                            ^?
}
```

Las tuplas también pueden tener elementos `rest`, que deben ser de tipo arreglo/tupla.

```ts twoslash
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

- `StringNumberBooleans` describe una tupla cuyos dos primeros elementos son`string` y `number` respectivamente, pero que pueden tener cualquier número de `booleanos` siguientes.
- `StringBooleansNumber` describe una tupla cuyo primer elemento es `string` y luego cualquier número de `boolean`os y termina con un `number`.
- `BooleansStringNumber` describe una tupla cuyos elementos iniciales son cualquier número de `boolean`os y terminan con un `string` y luego un `number`.

Una tupla con un elemento `rest` no tiene una `length` establecida — solo tiene un conjunto de elementos conocidos en diferentes posiciones.

```ts twoslash
type StringNumberBooleans = [string, number, ...boolean[]];
// ---cut---
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];
```

¿Por qué podrían ser útiles los elementos opcionales y `rest`?
Bueno, permiten que *TypeScript* corresponda tuplas con listas de parámetros.
Los tipos tupla se pueden usar en [parámetros y argumentos `rest`](/docs/handbook/2/functions.html#parametros-rest-y-argumentos), de modo que lo siguiente:

```ts twoslash
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

básicamente es equivalente a:

```ts twoslash
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

Esto es útil cuando deseas tomar un número variable de argumentos con un parámetro `rest` y necesitas un número mínimo de elementos, pero no deseas introducir variables intermedias.

<!--
TODO, ¿necesitamos este ejemplo?

Por ejemplo, imagina que necesitamos escribir una función que sume `números` en base a los argumentos que se pasan.

```ts twoslash
function sum(...args: number[]) {
    // ...
}
```

Podríamos sentir que tiene poco sentido tomar menos de 2 elementos, por lo que queremos requerir que los llamantes proporcionen al menos 2 argumentos.
Un primer intento podría ser

```ts twoslash
function foo(a: number, b: number, ...args: number[]) {
    args.unshift(a, b);

    let result = 0;
    for (const valor of args) {
        result += value;
    }
    return result;
}
```

-->

### Tipos de tuplas `readonly`

Una nota final sobre los tipos tupla ⏤ los tipos tupla tienen variantes `readonly` y se pueden especificar colocando un modificador `readonly` delante de ellos: al igual que con la sintaxis abreviada de arreglo.

```ts twoslash
function doSomething(pair: readonly [string, number]) {
  //                       ^^^^^^^^^^^^^^^^^^^^^^^^^
  // ...
}
```

Como era de esperar, no se permite escribir en ninguna propiedad de una tupla `readonly` en *TypeScript*.

```ts twoslash
// @errors: 2540
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
}
```

Las tuplas tienden a crearse y no modificarse en la mayoría del código, por lo que anotar tipos como tuplas de "solo lectura" cuando sea posible es un buen valor predeterminado.
Esto también es importante dado que los arreglos literales con aserciones `const` se inferirán con tipos tupla `readonly`.

```ts twoslash
// @errors: 2345
let point = [3, 4] as const;

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}

distanceFromOrigin(point);
```

Aquí, `distanceFromOrigin` nunca modifica sus elementos, pero espera una tupla mutable.
Dado que el tipo de `point` se infirió como `readonly [3, 4]`, no será compatible con `[number, number]` ya que ese tipo no puede garantizar que los elementos de `point` no sean mutados.

<!-- ## Otros tipos de miembros de Objeto

La mayoría de las declaraciones en tipos objeto:

### Sintaxis de método

### Firmas de llamada

### Firmas de constructores

### Índice de firmas -->
