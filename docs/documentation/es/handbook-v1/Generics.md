---
title: Genéricos
layout: docs
permalink: /docs/handbook/generics.html
oneline: Introducción a TypeScript y genéricos
handbook: "true"
deprecated_by: /docs/handbook/2/generics.html
---

Una parte importante de la ingeniería de software consiste en crear componentes que no solo tengan *APIs* coherentes y bien definidas, sino que también sean reutilizables.
Los componentes que son capaces de trabajar con los datos de hoy y con los del mañana te brindarán la más flexible capacidad para construir grandes sistemas de software.

En lenguajes como *C#* y *Java*, uno de los principales instrumentos en la caja de herramientas para crear componentes reutilizables es `generics`, es decir, poder crear un componente que pueda funcionar sobre una variedad de tipos en lugar de en uno solo.
Esto permite a los usuarios consumir estos componentes y utilizar sus propios tipos.

## Hello world de genéricos

Para empezar, hagamos el "hello world" de genéricos: la función de identidad.
La función de identidad es una función que devolverá todo lo que se le pase.
Puedes pensar en esta de una manera similar al comando `echo`.

Sin genéricos, tendríamos que darle a la función de identidad un tipo específico:

```ts twoslash
function identity(arg: number): number {
  return arg;
}
```

O, podríamos describir la función de identidad usando el tipo `any`:

```ts twoslash
function identity(arg: any): any {
  return arg;
}
```

Si bien el uso de `any` ciertamente es genérico en el sentido de que hará que la función acepte todos y cada uno de los tipos para el tipo de `arg`, en realidad estamos perdiendo la información sobre cual era ese tipo cuando la función regresa.
Si pasamos un número, la única información que tenemos es que se puede devolver cualquier tipo.

En cambio, necesitamos una forma de capturar el tipo de argumento de tal manera que también podamos usarlo para denotar lo que se está devolviendo.
Aquí, usaremos una *variable de tipo*, un tipo especial de variable que funciona con tipos en lugar de valores.

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
```

Ahora hemos agregado una variable de tipo `T` a la función de identidad.
Esta `T` nos permite capturar el tipo que proporciona el usuario (por ejemplo, `number`), para que podamos usar esa información más adelante.
Aquí, usamos `T` nuevamente como el tipo de retorno. Al inspeccionar, ahora podemos ver que se usa el mismo tipo para el argumento y el tipo de retorno.
Esto nos permite traficar ese tipo de información en un lado de la función y fuera del otro.

Decimos que esta versión de la función `identity` es genérica, ya que funciona en una variedad de tipos.
A diferencia de usar `any`, también es tan precisa (es decir, no pierde ninguna información) como la primera función de `identity` que usó números para el argumento y el tipo de retorno.

Una vez que hemos escrito la función de identidad genérica, podemos llamarla de dos formas.
La primera forma es pasar todos los argumentos, incluido el argumento de tipo, a la función:

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
let output = identity<string>("myString");
//       ^?
```

Aquí establecemos explícitamente `T` de tipo `string` como uno de los argumentos de la llamada a la función, denotado usando `<>` alrededor de los argumentos en lugar de `()`.

La segunda forma también es quizás la más común. Aquí usamos *inferencia de tipo del argumento* - es decir, queremos que el compilador establezca el valor de `T` automáticamente según el tipo del argumento que pasamos:

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
// ---cut---
let output = identity("myString");
//       ^?
```

Observa que no tuvimos que pasar explícitamente el tipo entre corchetes angulares (`<>`); el compilador simplemente miró el valor `"myString"`, y estableció `T` en su tipo.
Si bien la inferencia de tipo del argumento puede ser una herramienta útil para mantener el código más corto y legible, es posible que debas pasar explícitamente los argumentos de tipo como hicimos en el ejemplo anterior cuando el compilador no puede inferir el tipo, como puede suceder en ejemplos más complejos.

## Trabajar con variables de tipo genérico

Cuando comiences a usar genéricos, notarás que cuando creas funciones genéricas como `identity`, el compilador exigirá que uses correctamente cualquier parámetro genérico en el cuerpo de la función.
Es decir, que realmente tratas estos parámetros como si pudieran ser de todos los tipos.

Tomemos nuestra anterior función de `identity`:

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
```

¿Qué pasa si también queremos registrar la longitud del argumento `arg` en la consola con cada llamada?
Podríamos tener la tentación de escribir esto:

```ts twoslash
// @errors: 2339
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

Cuando lo hagamos, el compilador nos dará un error de que estamos usando el miembro `.length` de `arg`, pero en ninguna parte hemos dicho que `arg` tiene este miembro.
Recuerda, anteriormente dijimos que estas variables de tipo representan todos y cada uno de los tipos, por lo que alguien que use esta función podría haber pasado un `number` en su lugar, que no tiene un miembro `.length`.

Digamos que en realidad pretendemos que esta función trabaje en arreglos de `T` en lugar de `T` directamente. Debido a que estamos trabajando con arreglos, el miembro `.length` debería estar disponible.
Podemos describir esto como crearíamos arreglos de otros tipos:

```ts twoslash
function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length);
  return arg;
}
```

Puedes leer el tipo de `loggingIdentity` como "la función genérica `loggingIdentity` toma un parámetro de tipo `T` y un argumento `arg` que es un arreglo de `T`s, y devuelve un arreglo de `T`s".
Si pasamos un arreglo de números, obtendríamos un arreglo de números, ya que `T` se uniría a `number`.
Esto nos permite usar nuestra variable `T` de tipo genérico como parte de los tipos con los que estamos trabajando, en lugar del tipo completo, lo que nos da una mayor flexibilidad.

Alternativamente, podemos escribir el ejemplo de muestra de esta manera:

```ts twoslash
function loggingIdentity<T>(arg: Array<T>): Array<T> {
  console.log(arg.length); // Array tiene una .length, por lo que no hay más errores
  return arg;
}
```

Es posible que ya estés familiarizado con este estilo de tipado en otros lenguajes.
En la siguiente sección, cubriremos cómo puedes crear tus propios tipos genéricos como `Array<T>`.

## Tipos genéricos

En secciones anteriores, creamos funciones de identidad genérica que funcionaron en una variedad de tipos.
En esta sección, exploraremos el tipo de funciones en sí mismas y cómo crear interfaces genéricas.

El tipo de funciones genéricas es como el de las funciones no genéricas, con el tipo de los parámetros enumerados primero, de manera similar a las declaraciones de función:

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
```

También podríamos haber usado un nombre diferente para el parámetro de tipo genérico en el tipo, siempre que el número de variables de tipo y cómo se usan las variables de tipo se alineen.

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: <U>(arg: U) => U = identity;
```

También podemos escribir el tipo genérico como una firma de llamada de un tipo de objeto literal:

```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: { <T>(arg: T): T } = identity;
```

Lo que nos lleva a escribir nuestra primera interfaz genérica.
Tomemos el objeto literal del ejemplo anterior y movámoslo a una interfaz:

```ts twoslash
interface GenericIdentityFn {
  <T>(arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;
```

En un ejemplo similar, es posible que deseemos mover el parámetro genérico para que sea un parámetro de toda la interfaz.
Esto nos permite ver sobre qué tipo(s) somos genéricos (por ejemplo, `Dictionary<string>` en lugar de solo `Dictionary`).
Esto hace que el parámetro de tipo sea visible para todos los demás miembros de la interfaz.

```ts twoslash
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

Observa que nuestro ejemplo ha cambiado para ser algo ligeramente diferente.
En lugar de describir una función genérica, ahora tenemos una firma de función no genérica que es parte de un tipo genérico.
Cuando usamos `GenericIdentityFn`, ahora también necesitaremos especificar el tipo del argumento correspondiente (aquí: `number`), bloqueando efectivamente lo que usará la firma de la llamada subyacente.
Comprender cuándo colocar el parámetro de tipo directamente en la firma de la llamada y cuándo colocarlo en la propia interfaz será útil para describir qué aspectos de un tipo son genéricos.

Además de las interfaces genéricas, también podemos crear clases genéricas.
Ten en cuenta que no es posible crear enumeraciones y espacios de nombres genéricos.

## Clases genéricas

Una clase genérica tiene una forma similar a una interfaz genérica.
Las clases genéricas tienen una lista de parámetros de tipo genérico entre paréntesis angulares (`<>`) después del nombre de la clase.

```ts twoslash
// @strict: false
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

Este es un uso bastante literal de la clase `GenericNumber`, pero es posible que hayas notado que nada la restringe para usar solo el tipo `number`.
En su lugar, podríamos haber usado `string` o incluso objetos más complejos.

```ts twoslash
// @strict: false
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
// ---cut---
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

Al igual que con la interfaz, poner el tipo del parámetro en la propia clase nos permite asegurarnos de que todas las propiedades de la clase funcionan con el mismo tipo.

Como cubrimos en [nuestra sección sobre clases](/docs/handbook/classes.html), una clase tiene dos lados en su tipo: el lado estático y el lado de la instancia.
Las clases genéricas son solo genéricas en el lado de la instancia en lugar de en el lado estático, por lo que cuando se trabaja con clases, los miembros estáticos no pueden usar el tipo del parámetro de la clase.

## Restricciones genéricas

Si recuerdas un ejemplo anterior, es posible que a veces desees escribir una función genérica que trabaje en un conjunto de tipos donde tenga algún conocimiento sobre las capacidades que tendrá ese conjunto de tipos.
En nuestro ejemplo de `loggingIdentity`, queríamos poder acceder a la propiedad `.length` de `arg`, pero el compilador no pudo probar que todos los tipos tuvieran una propiedad `.length`, por lo que nos advierte que no podemos hacer esta suposición.

```ts twoslash
// @errors: 2339
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

En lugar de trabajar con todos y cada uno de los tipos, nos gustaría restringir esta función para que trabaje con todos los tipos que también tengan la propiedad `.length`.
Siempre que el tipo tenga este miembro, lo permitiremos, pero se requiere tener al menos este miembro.
Para hacerlo, debemos enumerar nuestro requisito como una restricción sobre lo que puede ser `T`.

Para hacerlo, crearemos una interfaz que describa nuestra restricción.
Aquí, crearemos una interfaz que tiene una única propiedad `.length` y luego usaremos esta interfaz y la palabra clave `extends` para denotar nuestra restricción:

```ts twoslash
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // Ahora sabemos que tiene una propiedad .length, así que no más errores
  return arg;
}
```

Debido a que la función genérica ahora está restringida, ya no funcionará con todos los tipos:

```ts twoslash
// @errors: 2345
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
// ---cut---
loggingIdentity(3);
```

En su lugar, necesitamos pasar valores cuyo tipo tenga todas las propiedades requeridas:

```ts twoslash
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
// ---cut---
loggingIdentity({ length: 10, value: 3 });
```

## Uso del tipo de parámetro en restricciones genéricas

Puedes declarar un parámetro de tipo que esté restringido por otro parámetro de tipo.
Por ejemplo, aquí nos gustaría obtener una propiedad de un objeto dado su nombre.
Nos gustaría asegurarnos de que no estamos tomando accidentalmente una propiedad que no existe en el `obj`, por lo que colocaremos una restricción entre los dos tipos:

```ts twoslash
// @errors: 2345
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
```

## Uso de tipos de clase en genéricos

Al crear fábricas en *TypeScript* usando genéricos, es necesario hacer referencia a los tipos de clase por sus funciones de constructor. Por ejemplo:

```ts twoslash
function create<T>(c: { new (): T }): T {
  return new c();
}
```

Un ejemplo más avanzado usa la propiedad `prototype` para inferir y restringir las relaciones entre la función constructora y el lado de la instancia de los tipos de clase.

```ts twoslash
// @strict: false
class BeeKeeper {
  hasMask: boolean;
}

class ZooKeeper {
  nametag: string;
}

class Animal {
  numLegs: number;
}

class Bee extends Animal {
  keeper: BeeKeeper;
}

class Lion extends Animal {
  keeper: ZooKeeper;
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
```
