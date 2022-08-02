---
title: Más sobre funciones
layout: docs
permalink: /docs/handbook/2/functions.html
oneline: "Obtén más información sobre cómo trabajan las funciones en TypeScript."
---

Las funciones son el bloque de construcción básico de cualquier aplicación, ya sean funciones locales, importadas de otro módulo o métodos en una clase.
También son valores y, al igual que otros valores, *TypeScript* tiene muchas formas de describir cómo se puede invocar a las funciones.
Aprendamos a escribir tipos que describen funciones.

## Expresiones de tipo función

La forma más sencilla de describir una función es con una *expresión de tipo función*.
Estos tipos son sintácticamente similares a las funciones de flecha:

```ts twoslash
function ujier(fn: (a: string) => void) {
  fn("Hola, mundo");
}

function imprimeALaConsola(s: string) {
  console.log(s);
}

ujier(imprimeALaConsola);
```

La sintaxis `(a: string) => void` significa "una función con un parámetro, llamado `a`, de tipo `string`, que no tiene un valor de retorno".
Al igual que con las declaraciones de funciones, si no se especifica un tipo de parámetro, implícitamente es `any`.

> Ten en cuenta que el nombre del parámetro es **obligatorio**. El tipo función `(string) => void` significa ¡"una función con un parámetro llamado `string` de tipo `any`"!

Por supuesto, podemos usar un alias de tipo para nombrar un tipo función:

```ts twoslash
type FuncionSaluda = (a: string) => void;
function ujier(fn: FuncionSaluda) {
  // ...
}
```

## Firmas de llamada

En *JavaScript*, las funciones pueden tener propiedades además de ser invocables.
Sin embargo, la sintaxis de expresión del tipo función no permite declarar propiedades.
Si queremos describir algo invocable con propiedades, podemos escribir una *firma de llamada* en un tipo de objeto:

```ts twoslash
type FuncionDescribible = {
  description: string;
  (algunArg: number): boolean;
};
function hazAlgo(fn: FuncionDescribible) {
  console.log(fn.description + " devuelta " + fn(6));
}
```

Ten en cuenta que la sintaxis es ligeramente diferente en comparación con una expresión de tipo de función: usa `:` entre la lista de parámetros y el tipo de retorno en lugar de `=>`.

## Firmas de constructores

Las funciones de *JavaScript* también se pueden invocar con el operador `new`.
*TypeScript* se refiere a estos como *constructores* porque normalmente crean un nuevo objeto.
Puedes escribir una *firma de constructor* agregando la palabra clave `new` delante de una firma de llamada:

```ts twoslash
type AlgunObjeto = any;
// ---cut---
type AlgunConstructor = {
  new (s: string): AlgunObjeto;
};
function fn(ctor: AlgunConstructor) {
  return new ctor("hola");
}
```

Algunos objetos, como el objeto `Date` de *JavaScript*, se pueden llamar con o sin `new`.
Puedes combinar llamadas y firmas de constructores en el mismo tipo de forma arbitraria:

```ts twoslash
interface LlamadaOConstructor {
  new (s: string): Date;
  (n?: number): number;
}
```

## Funciones genéricas

Es común escribir una función donde los tipos de entrada se relacionan con el tipo de salida, o donde los tipos de dos entradas están relacionados de alguna manera.
Consideremos por un momento una función que devuelve el primer elemento de un arreglo:

```ts twoslash
function firstElement(arr: any[]) {
  return arr[0];
}
```

Esta función hace su trabajo, pero desafortunadamente tiene el tipo de retorno `any`.
Sería mejor si la función devolviera el tipo del elemento del arreglo.

En *TypeScript*, se usan `generics` cuando queremos describir una correspondencia entre dos valores.
Hacemos esto declarando un *tipo de parámetro* en la firma de la función:

```ts twoslash
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

Al agregar un parámetro de tipo `Type` a esta función y usarlo en dos lugares, hemos creado un vínculo entre la entrada de la función (el arreglo) y la salida (el valor de retorno).
Ahora, cuando la llamamos, aparece un tipo más específico:

```ts twoslash
declare function firstElement<Type>(arr: Type[]): Type | undefined;
// ---cut---
// s es de tipo 'string'
const s = firstElement(["a", "b", "c"]);
// n es de tipo 'number'
const n = firstElement([1, 2, 3]);
// u es de tipo undefined
const u = firstElement([]);
```

### Inferencia

Ten en cuenta que no tuvimos que especificar `Type` en este ejemplo.
El tipo era *inferido* ⏤ elegido automáticamente ⏤ por *TypeScript*.

También podemos utilizar varios tipos de parámetros.
Por ejemplo, una versión independiente de `map` se vería así:

```ts twoslash
// prettier-ignore
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}

// El parámetro 'n' es de tipo 'string'
// 'parsed' es de tipo 'number[]'
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
```

Ten en cuenta que en este ejemplo, *TypeScript* podría inferir tanto el tipo del parámetro de tipo `Input` (del arreglo `string` dado), así como el parámetro de tipo `Output` basado en el valor de retorno de la expresión de función (`number`).

### Restricciones

Hemos escrito algunas funciones genéricas que pueden funcionar en *cualquier* tipo de valor.
A veces queremos relacionar dos valores, pero solo podemos operar en un cierto subconjunto de valores.
En este caso, podemos usar una restricción (`constraint`) para limitar los tipos que puede aceptar un tipo de parámetro.

Escribamos una función que devuelva el mayor de dos valores.
Para hacer esto, necesitamos una propiedad `length` que es un número.
*Restringiremos* el tipo del parámetro a ese tipo escribiendo una cláusula `extends`:

```ts twoslash
// @errors: 2345 2322
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray es de tipo 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longString es de tipo 'alice' | 'bob'
const longerString = longest("alice", "bob");
// ¡Error! Los números no tienen una propiedad 'length'
const notOK = longest(10, 100);
```

Hay algunas cosas interesantes a tener en cuenta en este ejemplo.
Permitimos que *TypeScript* *infiera* el tipo de retorno de `longest`.
La inferencia del tipo de retorno también trabaja en funciones genéricas.

Porque restringimos `Type` a `{ length: number }`, se nos permitió acceder a la propiedad `.length` de los parámetros `a` y `b`.
Sin la restricción de tipo, no podríamos acceder a esas propiedades porque los valores podrían haber sido de otro tipo sin una propiedad `length`.

Los tipos de `longerArray` y `longerString` se infirieron en función de los argumentos.
Recuerda, los genéricos tienen que ver con relacionar dos o más valores con el mismo tipo.

Finalmente, tal como nos gustaría, la llamada a `longest(10, 100)` se rechaza porque el tipo `number` no tiene una propiedad `.length`.

### Trabajar con valores restringidos

Aquí hay un error común cuando se trabaja con restricciones genéricas:

```ts twoslash
// @errors: 2322
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
  }
}
```

Puede parecer que esta función está bien ⏤ `Type` está restringido a  `{ length: number }`, y la función devuelve `Type` o un valor que coincida con esa restricción.
El problema es que la función promete devolver el *mismo* tipo de objeto que se le pasó, no solo *algún* objeto que coincida con la restricción.
Si este código fuera legal, podrías escribir código que definitivamente no funcionaría:

```ts twoslash
declare function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type;
// ---cut---
// 'arr' obtiene el valor { length: 6 }
const arr = minimumLength([1, 2, 3], 6);
// ¡y se bloquea aquí porque los arreglos tienen
// un método 'slice', pero no el objeto devuelto!
console.log(arr.slice(0));
```

### Especificar el tipo de los argumentos

*TypeScript* generalmente puede inferir los tipos de los argumentos provistos en una llamada genérica, pero no siempre.
Por ejemplo, digamos que escribiste una función para combinar dos arreglos:

```ts twoslash
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
```

Normalmente, sería un error llamar a esta función con arreglos que no coinciden:

```ts twoslash
// @errors: 2322
declare function combine<Type>(arr1: Type[], arr2: Type[]): Type[];
// ---cut---
const arr = combine([1, 2, 3], ["hello"]);
```

Sin embargo, si tenías la intención de hacer esto, podrías especificar `Type` manualmente:

```ts twoslash
declare function combine<Type>(arr1: Type[], arr2: Type[]): Type[];
// ---cut---
const arr = combine<string | number>([1, 2, 3], ["hello"]);
```

### Directrices para escribir buenas funciones genéricas

Escribir funciones genéricas es divertido y puede ser fácil dejarse llevar por el tipo de los parámetros.
Tener demasiados tipos de parámetros o usar restricciones donde no son necesarias puede hacer que la inferencia sea menos exitosa y frustrar a las personas que llaman a tu función.

#### El tipo de los parámetros los degrada

Aquí hay dos formas de escribir una función que parecen similares:

```ts twoslash
function firstElement1<Type>(arr: Type[]) {
  return arr[0];
}

function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0];
}

// a: number (bien)
const a = firstElement1([1, 2, 3]);
// b: any (mal)
const b = firstElement2([1, 2, 3]);
```

Estas pueden parecer idénticas a primera vista, pero `firstElement1` es una forma mucho mejor de escribir esta función.
Su tipo de retorno inferido es `Type`, pero el tipo de retorno inferido de `firstElement2` es `any` porque *TypeScript* tiene que resolver la expresión `arr[0]` usando la restricción de tipo, en lugar de "esperar" para resolver el elemento durante una llamada.

> **Regla**: Cuando sea posible, usa el tipo del parámetro en sí mismo en lugar de restringirlo

#### Utiliza menos tipos en parámetros

Aquí hay otro par de funciones similares:

```ts twoslash
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func);
}

function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func);
}
```

Hemos creado un parámetro de tipo `Func` que *no relaciona dos valores*.
Eso siempre es una señal de alerta, porque significa que las personas que la llaman desean especificar el tipo de los argumentos tienen que especificar manualmente un tipo de argumento adicional sin ningún motivo.
`Func` no hace nada más que hacer que la función sea más difícil de leer y razonar.

> **Regla**: Siempre utiliza la menor cantidad posible de tipos en parámetros

#### El tipo de los parámetros debería aparecer dos veces

A veces olvidamos que es posible que una función no necesite ser genérica:

```ts twoslash
function greet<Str extends string>(s: Str) {
  console.log("Hello, " + s);
}

greet("world");
```

Con la misma facilidad podríamos haber escrito una versión más simple:

```ts twoslash
function greet(s: string) {
  console.log("Hello, " + s);
}
```

Recuerda, el tipo de los parámetros es para *relacionar los tipos de valores múltiples*.
Si un tipo de parámetro solo se usa una vez en la firma de la función, no está relacionando nada.

> **Regla**: Si un tipo de parámetro solo aparece en una ubicación, reconsidera si realmente lo necesitas

## Parámetros opcionales

Las funciones en *JavaScript* suelen tener un número variable de argumentos.
Por ejemplo, el método `toFixed` de `number` toma una cantidad de dígitos opcional:

```ts twoslash
function f(n: number) {
  console.log(n.toFixed()); // 0 argumentos
  console.log(n.toFixed(3)); // 1 argumento
}
```

Podemos modelar esto en *TypeScript* marcando el parámetro como *opcional* con `?`:

```ts twoslash
function f(x?: number) {
  // ...
}
f(); // Bien
f(10); // Bien
```

Aunque el parámetro se especifica como de tipo `number`, el parámetro `x` realmente tendrá el tipo `number | undefined` porque los parámetros no especificados en *JavaScript* obtienen el valor `undefined`.

También puedes proporcionar un parámetro `default`:

```ts twoslash
function f(x = 10) {
  // ...
}
```

Ahora, en el cuerpo de `f`, `x` tendrá el tipo `number` porque cualquier argumento `undefined` será reemplazado por `10`.
Ten en cuenta que cuando un parámetro es opcional, las personas que llaman siempre pueden pasar `undefined`, ya que esto simplemente simula un argumento "faltante":

```ts twoslash
declare function f(x?: number): void;
// corta
// ¡Todo bien!
f();
f(10);
f(undefined);
```

### Parámetros opcionales en devoluciones de llamada

Una vez que hayas aprendido acerca de los parámetros opcionales y las expresiones de tipo de función, es muy fácil cometer los siguientes errores al escribir funciones que invocan devoluciones de llamada:

```ts twoslash
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}
```

Lo que la gente suele intentar al escribir `index?` como parámetro opcional es que quieren que estas dos llamadas sean legales:

```ts twoslash
// @errors: 2532
declare function myForEach(
  arr: any[],
  callback: (arg: any, index?: number) => void
): void;
// ---cut---
myForEach([1, 2, 3], (a) => console.log(a));
myForEach([1, 2, 3], (a, i) => console.log(a, i));
```

Lo que *actualmente* significa esto es que *`callback` se podría invocar con un argumento*.
En otras palabras, la definición de la función dice que la implementación se podría ver así:

```ts twoslash
// @errors: 2532
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // No tengo ganas de proporcionar el índice hoy
    callback(arr[i]);
  }
}
```

A su vez, *TypeScript* impondrá este significado y emitirá errores que no son realmente posibles:

<!-- prettier-ignore -->
```ts twoslash
// @errors: 2532
declare function myForEach(
  arr: any[],
  callback: (arg: any, index?: number) => void
): void;
// ---cut---
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed());
});
```

En *JavaScript*, si llamas a una función con más argumentos que parámetros, los argumentos adicionales simplemente se ignoran.
*TypeScript* se comporta de la misma manera.
Las funciones con menos parámetros (del mismo tipo) siempre pueden reemplazar a las funciones con más parámetros.

> Al escribir un tipo de función para una devolución de llamada, *nunca* escribas un parámetro opcional a menos que tengas la intención de `call` la función sin pasar ese argumento

## Sobrecarga de funciones

Algunas funciones de *JavaScript* se pueden llamar en una variedad de tipos y cantidad de argumentos.
Por ejemplo, puedes escribir una función para producir un `Date` que tome una marca de tiempo (un argumento) o una especificación de mes/día/año (tres argumentos).

En *TypeScript*, podemos especificar una función que se puede llamar de diferentes formas escribiendo *firmas sobrecargadas*.
Para hacer esto, escribe algunas firmas de funciones (generalmente dos o más), seguidas del cuerpo de la función:

```ts twoslash
// @errors: 2575
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);
```

En este ejemplo, escribimos dos sobrecargas: una acepta un argumento y otra acepta tres argumentos.
Estas dos primeras firmas se denominan *firmas de sobrecarga*.

Luego, escribimos una implementación de función con una firma compatible.
Las funciones tienen una firma *implementation*, pero esta firma no se puede llamar directamente.
Aunque escribimos una función con dos parámetros opcionales después del requerido, ¡no se puede llamar con dos parámetros!

### Firmas de sobrecarga y firma de implementación

Ésta es una fuente de confusión común.
A menudo, las personas escriben un código como este y no entienden por qué hay un error:

```ts twoslash
// @errors: 2554
function fn(x: string): void;
function fn() {
  // ...
}
// Se espera poder llamarla con cero argumentos
fn();
```

Nuevamente, la firma utilizada para escribir el cuerpo de la función no se puede "ver" desde el exterior.

> La firma de la *implementación* no es visible desde el exterior.
> Al escribir una función sobrecargada, siempre debes tener *dos* o más firmas por encima de la implementación de la función.

La firma de implementación también debe ser *compatible* con las firmas sobrecargadas.
Por ejemplo, estas funciones tienen errores porque la firma de implementación no coincide con las sobrecargas de manera correcta:

```ts twoslash
// @errors: 2394
function fn(x: boolean): void;
// El tipo de argumento no es correcto
function fn(x: string): void;
function fn(x: boolean) {}
```

```ts twoslash
// @errors: 2394
function fn(x: string): string;
// El tipo de retorno no es correcto
function fn(x: number): boolean;
function fn(x: string | number) {
  return "oops";
}
```

### Escribiendo buenas sobrecargas

Al igual que los genéricos, hay algunas pautas que debes seguir al usar sobrecarga de funciones.
Seguir estos principios hará que tu función sea más fácil de llamar, más fácil de entender y más fácil de implementar.

Consideremos una función que devuelve la longitud de una cadena o un arreglo:

```ts twoslash
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
```

Esta función está bien; podemos invocarla con cadenas o arreglos.
Sin embargo, no la podemos invocar con un valor que podría ser una cadena *o* un arreglo, porque *TypeScript* solo puede resolver una llamada de función a una sola sobrecarga:

```ts twoslash
// @errors: 2769
declare function len(s: string): number;
declare function len(arr: any[]): number;
// ---cut---
len(""); // Bien
len([0]); // Bien
len(Math.random() > 0.5 ? "hello" : [0]);
```

Debido a que ambas sobrecargas tienen la misma cantidad de argumentos y el mismo tipo de retorno, podemos escribir una versión no sobrecargada de la función:

```ts twoslash
function len(x: any[] | string) {
  return x.length;
}
```

¡Esto es mucho mejor!
Los llamadores pueden invocar esta con cualquier tipo de valor y, como beneficio adicional, no tenemos que averiguar una firma de implementación correcta.

> Siempre prefiere parámetros con tipos unión en lugar de sobrecargas cuando sea posible

### Declarar `this` en una función

*TypeScript* deducirá lo que debería ser `this` en una función a través del análisis de flujo de código, por ejemplo, en lo siguiente:

```ts twoslash
const user = {
  id: 123,

  admin: false,
  becomeAdmin: function () {
    this.admin = true;
  },
};
```

*TypeScript* entiende que la función `user.becomeAdmin` tiene un `this` correspondiente, que es el objeto externo `user`. `this`, *heh*, puede ser suficiente para muchos casos, pero hay muchos casos en los que necesitas más control sobre qué objeto representa `this`. La especificación de *JavaScript* establece que no puedes tener un parámetro llamado `this`, por lo que *TypeScript* usa ese espacio de sintaxis para permitirte declarar el tipo `this` en el cuerpo de la función.

```ts twoslash
interface User {
  id: number;
  admin: boolean;
}
declare const getDB: () => BD;
// ---cut---
interface BD {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(function (this: User) {
  return this.admin;
});
```

Este patrón es común con las *API*s de estilo de devolución de llamada, donde otro objeto normalmente controla cuándo se llama a su función. Ten en cuenta que necesitas usar `function` y no funciones de flecha para obtener este comportamiento:

```ts twoslash
// @errors: 7041 7017
interface User {
  id: number;
  isAdmin: boolean;
}
declare const getDB: () => BD;
// ---cut---
interface BD {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(() => this.admin);
```

## Otros tipos que debes conocer

Hay algunos tipos adicionales que querrás reconocer que aparecen a menudo cuando se trabaja con tipos `function`.
Como todos los tipos, los puedes usar en todas partes, pero son especialmente relevantes en el contexto de las funciones.

### `void`

`void` representa el valor de retorno de funciones que no devuelven un valor.
Es el tipo inferido cada vez que una función no tiene ninguna declaración de retorno, o no devuelve ningún valor explícito de esas declaraciones de retorno:

```ts twoslash
// El tipo de retorno inferido es 'void'
function noop() {
  return;
}
```

En *JavaScript*, una función que no devuelve ningún valor devolverá implícitamente el valor `undefined`.
Sin embargo, `void` y `undefined` no son lo mismo en *TypeScript*.
Hay más detalles al final de este capítulo.

> `void` no es lo mismo que `undefined`.

### `object`

El tipo especial `object` se refiere a cualquier valor que no sea un primitivo (`string`, `number`, `bigint`, `boolean`, `symbol`, `null` o `undefined`).
Es diferente del tipo de *objeto vacío* `{}`, y también del tipo global `Object`.
Es muy probable que nunca uses `Object`.

> `object` no es `Object`. ¡**Siempre** usa `object`!

Ten en cuenta que en *JavaScript*, los valores de función son objetos: Tienen propiedades, tienen `Object.prototype` en su cadena de prototipos, son `instanceof Object`, puedes llamar a `Object.keys` en ellos, y así sucesivamente.
Por esta razón, los tipos de función se consideran `object` en *TypeScript*.

### `unknown`

El tipo `unknown` representa *cualquier* valor.
Esto es similar al tipo `any`, pero es más seguro porque no es legal hacer nada con un valor `unknown`:

```ts twoslash
// @errors: 2571
function f1(a: any) {
  a.b(); // Bien
}
function f2(a: unknown) {
  a.b();
}
```

Esto es útil cuando se describen tipos de funciones porque puedes describir funciones que aceptan cualquier valor sin tener ningún valor en el cuerpo de tu función.

Por el contrario, puedes describir una función que devuelve un valor de tipo desconocido:

```ts twoslash
declare const someRandomString: string;
// ---cut---
function safeParse(s: string): unknown {
  return JSON.parse(s);
}

// ¡Hay que tener cuidado con 'obj'!
const obj = safeParse(someRandomString);
```

### `never`

Algunas funciones *nunca* devuelven un valor:

```ts twoslash
function fail(msg: string): never {
  throw new Error(msg);
}
```

El tipo `never` representa valores que *nunca* se observan.
En un tipo de retorno, esto significa que la función lanza una excepción o termina la ejecución del programa.

`never` también aparece cuando *TypeScript* determina que no queda nada en una unión.

```ts twoslash
function fn(x: string | number) {
  if (typeof x === "string") {
    // haz algo
  } else if (typeof x === "number") {
    // hace algo más
  } else {
    x; // ¡tiene tipo 'never'!
  }
}
```

### `Function`

El tipo global `Function` describe propiedades como `bind`, `call`, `apply` y otras presentes en todos los valores de función en *JavaScript*.
También tiene la propiedad especial de que siempre se pueden llamar valores de tipo `Function`; estas llamadas devuelven `any`:

```ts twoslash
function doSomething(f: Function) {
  return f(1, 2, 3);
}
```

Esta es una *llamada de función sin tipo* y generalmente es mejor evitarla debido al tipo de retorno inseguro `any`.

Si necesitas aceptar una función arbitraria pero no tienes la intención de llamarla, el tipo `() => void` generalmente es más seguro.

## Parámetros `rest` y argumentos

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/rest_parameters'>Parámetros <code>rest</code></a><br/>
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Spread_syntax'>Sintaxis extendida</a><br/>
   </p>
</blockquote>

### Parámetros `rest`

Además de usar parámetros opcionales o sobrecargas para crear funciones que puedan aceptar una cantidad variable de argumentos fijos, también podemos definir funciones que tomen un número *ilimitado* de argumentos usando *parámetros* `rest`.

Aparece un parámetro `rest` después de todos los demás parámetros y utiliza la sintaxis `...`:

```ts twoslash
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}
// 'a' obtiene el valor [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
```

En *TypeScript*, la anotación de tipo en estos parámetros implícitamente es `any[]` en lugar de `any`, y cualquier anotación de tipo dada debe ser de la forma `Array<T>` o `T[]`, o un tipo de tupla (del que se hablará más adelante).

### Argumentos `rest`

A la inversa, podemos *proporcionar* un número variable de argumentos de un arreglo utilizando la sintaxis de propagación.
Por ejemplo, el método de arreglos `push` toma cualquier número de argumentos:

```ts twoslash
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

Ten en cuenta que, en general, *TypeScript* no asume que los arreglos sean inmutables.
Esto puede llevar a un comportamiento sorprendente:

```ts twoslash
// @errors: 2556
// El tipo inferido es number[] --
// "un arreglo con cero o más números",
// no específicamente dos números
const args = [8, 5];
const angulo = Math.atan2(...args);
```

La mejor solución para esta situación depende un poco de tu código, pero en general un contexto `const` es la solución más sencilla:

```ts twoslash
// Inferido como tupla de longitud 2
const args = [8, 5] as const;
// Bien
const angulo = Math.atan2(...args);
```

El uso de argumentos `rest` puede requerir activar [`downlevelIteration`](/tsconfig#downlevelIteration) cuando se apunta a entornos de ejecución más antiguos.

<!-- PENDIENTE enlaza a iteración de nivel inferior -->

## Desestructuración de parámetros

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/ed/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment'>Asignación de desestructuración</a><br/>
   </p>
</blockquote>

Puedes utilizar la desestructuración de parámetros para descomprimir convenientemente los objetos proporcionados como argumento en una o más variables locales en el cuerpo de la función.
En *JavaScript*, se ve así:

```js
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
```

La anotación de tipo para el objeto va después de la sintaxis de desestructuración:

```ts twoslash
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```

Esto puede parecer un poco detallado, pero aquí, también puedes usar un tipo con nombre:

```ts twoslash
// Igual que el ejemplo anterior
type ABC = { a: number; b: number; c: number };
function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

## Asignabilidad de funciones

### Tipo de retorno `void`

El tipo de retorno `void` para funciones puede producir un comportamiento inusual, pero esperado.

El tipado contextual con un tipo de retorno `void` **no** obliga a las funciones a **no** devolver algo. Otra forma de decir esto es un tipo de función contextual con un tipo de retorno `void` (`type vf = () => void`), cuando se implementa, puede devolver *cualquier* otro valor, pero será ignorado.

Por tanto, las siguientes implementaciones del tipo `() => void` son válidas:


```ts twoslash
type voidFunc = () => void;

const f1: voidFunc = () => {
  return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
  return true;
};
```

Y cuando el valor de retorno de una de estas funciones se asigna a otra variable, conservará el tipo `void`:

```ts twoslash
type voidFunc = () => void;

const f1: voidFunc = () => {
  return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
  return true;
};
// ---cut---
const v1 = f1();

const v2 = f2();

const v3 = f3();
```

Este comportamiento existe para que el siguiente código sea válido aunque `Array.prototype.push` devuelva un número y el método `Array.prototype.forEach` espera una función con un tipo de retorno `void`.


```ts twoslash
const src = [1, 2, 3];
const dst = [0];

src.forEach((el) => dst.push(el));
```

Hay otro caso especial a tener en cuenta, cuando una definición de función literal tiene un tipo de retorno `void`, esa función **no** debe devolver cualquier cosa.

```ts twoslash
function f2(): void {
  // @ts-expect-error
  return true;
}

const f3 = function (): void {
  // @ts-expect-error
  return true;
};
```

Para obtener más información sobre `void`, consulta estas otras entradas de documentación:


- [`handbook` v1](https://www.typescriptlang.org/docs/handbook/basic-types.html#void)
- [`handbook` v2](https://www.typescriptlang.org/docs/handbook/2/functions.html#void)
- [PF - "¿Por qué las funciones devuelven no void asignables a la función devolviendo void?"](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void)
