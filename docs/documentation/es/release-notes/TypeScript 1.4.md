---
title: TypeScript 1.4
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-4.html
oneline: Notas de la versión de TypeScript 1.3
---

## Tipos unión

### Descripción general

Los tipos unión son una forma poderosa de expresar un valor que puede ser de varios tipos. Por ejemplo, puede tener una *API* para ejecutar un programa que toma una línea de comandos como un `string`, un `string[]` o una función que devuelve un `string`. Ahora puedes escribir:

```ts
interface RunOptions {
  program: string;
  commandline: string[] | string | (() => string);
}
```

La asignación a tipos unión funciona de manera muy intuitiva ⏤ todo lo que puedas asignar a uno de los miembros del tipo unión se puede asignar a la unión:

```ts
var opts: RunOptions = /* ... */;
opts.commandline = '-hello world'; // Bien
opts.commandline = ['-hello', 'world']; // Bien
opts.commandline = [42]; // Error, el número no es una string o una string[]
```

Al leer de un tipo unión, puedes ver las propiedades que comparten:

```ts
if (opts.commandline.length === 0) {
  // Bien, la string y string[] tienen la propiedad 'length'
  console.log("it's empty");
}
```

Con `Type Guards`, puedes trabajar fácilmente con una variable de un tipo unión:

```ts
function formatCommandline(c: string | string[]) {
  if (typeof c === "string") {
    return c.trim();
  } else {
    return c.join(" ");
  }
}
```

### Genéricos más estrictos

Con tipos unión capaces de representar una amplia gama de escenarios de tipos, hemos decidido mejorar el rigor de ciertas llamadas genéricas. Anteriormente, un código como este se compilaría (sorprendentemente) sin errores:

```ts
function equal<T>(lhs: T, rhs: T): boolean {
  return lhs === rhs;
}

// Previamente: No hay error
// Nuevo comportamiento: Error, no hay mejor tipo común entre 'string' y 'number'
var e = equal(42, "hello");
```

Con los tipos unión, ahora puedes especificar el comportamiento deseado tanto en el sitio de declaración de función como en el sitio de llamada:

```ts
// función 'choose' donde los tipos deben coincidir
function choose1<T>(a: T, b: T): T {
  return Math.random() > 0.5 ? a : b;
}
var a = choose1("hello", 42); // Error
var b = choose1<string | number>("hello", 42); // Bien

// función 'choose' donde los tipos no tienen por qué coincidir
function choose2<T, U>(a: T, b: U): T | U {
  return Math.random() > 0.5 ? a : b;
}
var c = choose2("bar", "foo"); // Bien, c: string
var d = choose2("hello", 42); // Bien, d: string|number
```

### Mejor inferencia de tipos

Los tipos unión también permiten una mejor inferencia de tipos en arreglos y otros lugares donde puedes tener varios tipos de valores en una colección:

```ts
var x = [1, "hello"]; // x: Array<string|number>
x[0] = "world"; // Bien
x[0] = false; // Error, booleano no es una string ni un number
```

## Declaraciones `let`

En *JavaScript*, las declaraciones `var` se" elevan "a la parte superior de su ámbito adjunto. Esto puede resultar en errores confusos:

```ts
console.log(x); // quería escribir 'y' aquí
/* más tarde en el mismo bloque * /
var x = "hello";
```

La nueva palabra clave `let` de *ES6*, ahora compatible con *TypeScript*, declara una variable con semántica de" bloque" más intuitiva. Solo se puede hacer referencia a una variable `let` después de su declaración, y tiene como ámbito el bloque sintáctico donde se define:

```ts
if (foo) {
  console.log(x); // Error, no se puede hacer referencia a x antes de su declaración
  let x = "hello";
} else {
  console.log(x); // Error, x no se declara en este bloque
}
```

`let` solo está disponible cuando se dirige a *ECMAScript 6* (`--target ES6`).

## Declaraciones `const`

El otro nuevo tipo de declaración de *ES6* compatible con *TypeScript* es `const`. No se puede asignar una variable `const` y se debe iniciar donde se declara. Esto es útil para declaraciones en las que no desea cambiar el valor después de su iniciación:

```ts
const halfPi = Math.PI / 2;
halfPi = 2; // Error, no se puede asignar a una `const`
```

`const` solo está disponible cuando se dirige a *ECMAScript 6* (`--target ES6`).

## Cadenas de plantilla

*TypeScript* ahora admite cadenas de plantilla *ES6*. Éstas son una manera fácil de incrustar expresiones arbitrarias en cadenas:

```ts
var name = "TypeScript";
var greeting = `Hello, ${name}! Your name has ${name.length} characters`;
```

Al compilar en destinos anteriores a *ES6*, la cadena se descompone:

```js
var name = "TypeScript!";
var greeting =
  "Hello, " + name + "! Your name has " + name.length + " characters";
```

## `Type Guards`

Un patrón común en *JavaScript* es usar `typeof` o `instanceof` para examinar el tipo de una expresión en el entorno de ejecución. *TypeScript* ahora comprende estas condiciones y cambiará la inferencia de tipo en consecuencia cuando se use en un bloque `if`.

Usar `typeof` para probar una variable:

```ts
var x: any = /* ... */;
if(typeof x === 'string') {
    console.log(x.subtr(1)); // Error, 'subtr' no existe en 'string'
}
// x todavía está aquí
x.unknown(); // Bien
```

Usar `typeof` con tipos unión y `else`:

```ts
var x: string | HTMLElement = /* ... */;
if(typeof x === 'string') {
    // x es una string aquí, como se muestra arriba
}
else {
    // x is HTMLElement here
    console.log(x.innerHTML);
}
```

Usar `instanceof` con clases y tipos unión:

```ts
class Dog { woof() { } }
class Cat { meow() { } }
var pet: Dog|Cat = /* ... */;
if (pet instanceof Dog) {
    pet.woof(); // Bien
}
else {
    pet.woof(); // Error
}
```

## Alias de tipo

Ahora puedes definir un *alias* para un tipo usando la palabra clave `type`:

```ts
type PrimitiveArray = Array<string | number | boolean>;
type MyNumber = number;
type NgScope = ng.IScope;
type Callback = () => void;
```

Los alias de tipo son exactamente los mismos que sus tipos originales; simplemente son nombres alternativos.

## `const enum` (enumeraciones completamente en línea)

Las enumeraciones son muy útiles, pero algunos programas en realidad no necesitan el código generado y se beneficiarían simplemente de incluir todas las instancias de miembros de enumeración con sus equivalentes numéricos. La nueva declaración `const enum` funciona como una `enum` normal para la seguridad de tipos, pero se borra completamente en tiempo de compilación.

```ts
const enum Suit {
  Clubs,
  Diamonds,
  Hearts,
  Spades
}
var d = Suit.Diamonds;
```

Compila exactamente:

```js
var d = 1;
```

*TypeScript* ahora también calculará los valores de enumeración cuando sea posible:

```ts
enum MyFlags {
  None = 0,
  Neat = 1,
  Cool = 2,
  Awesome = 4,
  Best = Neat | Cool | Awesome
}
var b = MyFlags.Best; // emite var b = 7;
```

## Opción de línea de comandos `-noEmitOnError`

El comportamiento predeterminado del compilador de *TypeScript* es seguir emitiendo archivos `.js` si hubo errores de tipo (por ejemplo, un intento de asignar un `string` a un `number`). Esto puede ser indeseable en servidores de compilación u otros escenarios donde solo se desea la salida de una compilación "limpia". El nuevo indicador [`noEmitOnError`](/tsconfig#noEmitOnError) evita que el compilador emita código `.js` si hubiera algún error.

Ahora es el valor predeterminado para los proyectos de *MSBuild*; esto permite que la compilación incremental de *MSBuild* funcione como se esperaba, ya que los resultados solo se generan en compilaciones limpias.

## Nombres de módulos *AMD*

De manera predeterminada, los módulos *AMD* se generan de forma anónima. Esto puede generar problemas cuando se utilizan otras herramientas para procesar los módulos resultantes, como los paquetes (por ejemplo, `r.js`).

La nueva etiqueta `amd-module name` permite pasar un nombre de módulo opcional al compilador:

```ts
//// [amdModule.ts]
///<amd-module name='NamedModule'/>
export class C {}
```

Dará como resultado la asignación del nombre `NamedModule` al módulo como parte de la llamada a *AMD* `define`:

```js
//// [amdModule.js]
define("NamedModule", ["require", "exports"], function(require, exports) {
  var C = (function() {
    function C() {}
    return C;
  })();
  exports.C = C;
});
```
