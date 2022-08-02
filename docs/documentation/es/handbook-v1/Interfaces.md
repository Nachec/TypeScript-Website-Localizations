---
title: Interfaces
layout: docs
permalink: /docs/handbook/interfaces.html
oneline: Cómo escribir una interfaz con TypeScript
handbook: "true"
deprecated_by: /docs/handbook/2/objects.html
---

Uno de los principios básicos de *TypeScript* es que la comprobación de tipos se centra en la *forma* que tienen los valores.
Esto a veces se denomina "tipado pato" o "subtipado estructural".
En *TypeScript*, las interfaces cumplen la función de nombrar estos tipos y son una forma poderosa de definir contratos dentro de tu código, así como contratos con código fuera de tu proyecto.

## Nuestra primera interfaz

La forma más sencilla de ver cómo funcionan las interfaces es comenzar con un ejemplo simple:

```ts twoslash
function printLabel(labeledObj: { label: string }) {
  console.log(labeledObj.label);
}

let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);
```

El comprobador de tipos revisa la llamada a `printLabel`.
La función `printLabel` tiene un solo parámetro que requiere que el objeto pasado tenga una propiedad llamada `label` de tipo `string`.
Observa que nuestro objeto en realidad tiene más propiedades que esta, pero el compilador solo comprueba que *al menos* las requeridas estén presentes y coincidan con los tipos requeridos.
Hay algunos casos en los que *TypeScript* no es tan indulgente, que cubriremos en un momento.

Podemos escribir el mismo ejemplo nuevamente, esta vez usando una interfaz para describir el requisito de tener la propiedad `label` que es una cadena:

```ts twoslash
interface LabeledValue {
  label: string;
}

function printLabel(labeledObj: LabeledValue) {
  console.log(labeledObj.label);
}

let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);
```

La interfaz `LabeledValue` es un nombre que ahora podemos usar para describir el requisito en el ejemplo anterior.
Todavía representa tener una sola propiedad llamada `label` que es de tipo `string`.
Observa que no tuvimos que decir explícitamente que el objeto que pasamos a `printLabel` implementa esta interfaz como deberíamos hacerlo en otros lenguajes.
Aquí, solo importa la forma. Si el objeto que pasamos a la función cumple con los requisitos enumerados, entonces está permitido.

Vale la pena señalar que el comprobador de tipo no requiere que estas propiedades vengan en ningún tipo de orden, solo que las propiedades que requiere la interfaz estén presentes y tengan el tipo requerido.

## Propiedades opcionales

No todas las propiedades de una interfaz pueden ser obligatorias.
Algunas existen bajo ciertas condiciones o pueden no estar allí en absoluto.
Estas propiedades opcionales son populares cuando se crean patrones como "bolsas de opciones" donde se pasa un objeto a una función que solo tiene cumple con un par de propiedades.

Aquí tienes un ejemplo de este patrón:

```ts twoslash
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  let newSquare = { color: "white", area: 100 };
  if (config.color) {
    newSquare.color = config.color;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({ color: "black" });
```

Las interfaces con propiedades opcionales se escriben de manera similar a otras interfaces, con cada propiedad opcional indicada con un `?` al final del nombre de la propiedad en la declaración.

La ventaja de las propiedades opcionales es que puedes describir estas posibles propiedades disponibles y al mismo tiempo evitar el uso de propiedades que no forman parte de la interfaz.
Por ejemplo, si hubiéramos escrito mal el nombre de la propiedad `color` en `createSquare`, obtendríamos un mensaje de error informándonos:

```ts twoslash
// @errors: 2551
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  let newSquare = { color: "white", area: 100 };
  if (config.clor) {
    // Error: La propiedad 'clor' no existe en el tipo 'SquareConfig'
    newSquare.color = config.clor;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({ color: "black" });
```

## Propiedades de solo lectura

Algunas propiedades solo deberían ser modificables cuando se crea un objeto por primera vez.
Puedes especificar esto poniendo `readonly` antes del nombre de la propiedad:

```ts twoslash
interface Point {
  readonly x: number;
  readonly y: number;
}
```

Puedes construir un `Point` asignando un objeto literal.
Después de la asignación, `x` e `y` no se pueden cambiar.

```ts twoslash
// @errors: 2540
interface Point {
  readonly x: number;
  readonly y: number;
}
// ---cut---
let p1: Point = { x: 10, y: 20 };
p1.x = 5; // ¡error!
```

*TypeScript* viene con un tipo `ReadonlyArray<T>` que es el mismo que `Array <T>` con todos los métodos de mutación eliminados, por lo que te puedes asegurar de no cambiar tus arreglos después de la creación:

```ts twoslash
// @errors: 2542 2339 2540 4104
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a;

ro[0] = 12; // ¡error!
ro.push(5); // ¡error!
ro.length = 100; // ¡error!
a = ro; // ¡error!
```

En la última línea del fragmento, puedes ver que incluso asignar todo el `ReadonlyArray` a un arreglo normal es ilegal.
Sin embargo, aún lo puedes anular con una aserción de tipo:

```ts twoslash
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a;

a = ro as number[];
```

### `readonly` vs `const`

La forma más fácil de recordar si usar `readonly` o `const` es preguntarte si lo estás usando en una variable o en una propiedad.
Las variables usan `const` mientras que las propiedades usan `readonly`.

## Exceso de comprobación de propiedades

En nuestro primer ejemplo usando interfaces, *TypeScript* nos permite pasar `{ size: number; label: string; }` a algo que solo esperaba una `{ label: string; }`.
También aprendimos acerca de las propiedades opcionales y cómo son útiles para describir las llamadas "bolsas de opciones".

Sin embargo, combinar los dos ingenuamente permitiría que se colara un error. Por ejemplo, tomando nuestro último ejemplo usando `createSquare`:

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

let mySquare = createSquare({ colour: "red", width: 100 });
```

Observa que el argumento dado a `createSquare` se escribe *`colour`* en lugar de `color`.
En *JavaScript* puro, este tipo de cosas falla silenciosamente.

Se podría argumentar que este programa está escrito correctamente, ya que las propiedades `width` son compatibles, no hay ninguna propiedad `color` presente y la propiedad `colour` adicional es insignificante.

Sin embargo, *TypeScript* toma la postura de que probablemente haya un error en este código.
Los objetos literales reciben un tratamiento especial y se someten a *exceso de comprobación de propiedades* al asignarlos a otras variables o pasarlos como argumentos.
Si un objeto literal tiene propiedades que el "tipo de destino" no tiene, obtendrás un error:

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let mySquare = createSquare({ colour: "red", width: 100 });
```

Evitar estos controles es realmente sencillo.
El método más fácil es simplemente usar una aserción de tipo:

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

Sin embargo, un mejor enfoque podría ser agregar un índice de firma de cadena si estás seguro de que el objeto puede tener algunas propiedades adicionales que se utilizan de alguna manera especial.
Si `SquareConfig` puede tener propiedades `color` y `width` con los tipos anteriores, pero *también* podría tener cualquier número de otras propiedades, entonces la podríamos definir así:

```ts twoslash
interface SquareConfig {
  color?: string;
  width?: number;
  [nombrePropiedad: string]: any;
}
```

Abordaremos el tema de índice de  firmas en un momento, pero aquí estamos diciendo que un `SquareConfig` puede tener cualquier número de propiedades, y mientras no sean `color` o `width`, sus tipos no importan.

Una última forma de sortear estas comprobaciones, que puede resultar un poco sorprendente, es asignar el objeto a otra variable:
Dado que `squareOptions` no se somete a controles de propiedad excesivos, el compilador no te dará un error.

```ts twoslash
interface SquareConfig {
  color?: string;
  width?: number;
  [nombrePropiedad: string]: any;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

La solución anterior funcionará siempre que tenga una propiedad común entre `squareOptions` y `SquareConfig`.
En este ejemplo, era la propiedad `width`. Sin embargo, fallará si la variable no tiene ninguna propiedad de objeto común. Por ejemplo:

```ts twoslash
// @errors: 2559
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let squareOptions = { colour: "rojo" };
let mySquare = createSquare(squareOptions);
```

Ten en cuenta que para un código simple como el anterior, probablemente no deberías intentar "sortear" estas comprobaciones.
Para objetos literales más complejos que tienen métodos y estado de retención, es posible que debas tener en cuenta estas técnicas, pero la mayoría de los errores de propiedad en exceso son en realidad errores.
Eso significa que si tienes problemas de exceso de comprobación de propiedad para algo como bolsas de opciones, es posible que debas revisar algunas de tus declaraciones de tipo.
En este caso, si está bien pasar un objeto con una propiedad tanto de `color` como de `colour` a `createSquare`, debes corregir la definición de`SquareConfig` para reflejar eso.

## Tipos función

Las interfaces son capaces de describir la amplia gama de formas que pueden adoptar los objetos *JavaScript*.
Además de describir un objeto con propiedades, las interfaces también pueden describir tipos función.

Para describir un tipo función con una interfaz, le damos a la interfaz una firma de llamada.
Esto es como una declaración de función con solo la lista de parámetros y el tipo de retorno dado. Cada parámetro de la lista de parámetros requiere tanto el nombre como el tipo.

```ts twoslash
interface SearchFunc {
  (source: string, subString: string): boolean;
}
```

Una vez definida, podemos usar esta interfaz de tipo función como lo haríamos con otras interfaces.
Aquí, mostramos cómo puedes crear una variable de un tipo función y asignarle un valor de función del mismo tipo.

```ts twoslash
interface SearchFunc {
  (source: string, subString: string): boolean;
}
// ---cut---
let mySearch: SearchFunc;

mySearch = function (source: string, subString: string): boolean {
  let result = source.search(subString);
  return result > -1;
};
```

Para que los tipos función escriban comprobaciones correctamente, no es necesario que los nombres de los parámetros coincidan.
Por ejemplo, podríamos haber escrito, el ejemplo anterior así:

```ts twoslash
interface SearchFunc {
  (source: string, subString: string): boolean;
}
// ---cut---
let mySearch: SearchFunc;

mySearch = function (src: string, sub: string): boolean {
  let result = src.search(sub);
  return result > -1;
};
```

Los parámetros de función se comprueban uno a la vez, con el tipo en cada posición de parámetro correspondiente comparado entre sí.
Si no deseas especificar tipos en absoluto, la escritura contextual de *TypeScript* puede inferir los tipos de argumentos ya que el valor de la función se asigna directamente a una variable de tipo `SearchFunc`.
Aquí, también, el tipo de retorno de nuestra expresión de función está implícito en los valores que devuelve (aquí, `false` y `true`).

```ts twoslash
interface SearchFunc {
  (source: string, subString: string): boolean;
}
// ---cut---
let mySearch: SearchFunc;

mySearch = function (src, sub) {
  let result = src.search(sub);
  return result > -1;
};
```

Si la expresión de la función hubiera devuelto números o cadenas, el comprobador de tipos habría cometido un error que indica que el tipo de retorno no coincide con el tipo de retorno descrito en la interfaz `SearchFunc`.

```ts twoslash
// @errors: 2322
interface SearchFunc {
  (source: string, subString: string): boolean;
}
// ---cut---
let mySearch: SearchFunc;

mySearch = function (src, sub) {
  let result = src.search(sub);
  return "string";
};
```

## Tipos indexables

De manera similar a cómo podemos usar interfaces para describir tipos de funciones, también podemos describir tipos que podemos "indexar" como `a[10]`, o `ageMap["daniel"]`.
Los tipos indexables tienen un *índice de firma* que describe los tipos que podemos usar para indexar en el objeto, junto con los tipos de retorno correspondientes al indexar.

Tomemos un ejemplo:

```ts twoslash
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

Arriba, tenemos una interfaz `StringArray` que tiene un índice de firma.
Este índice de firma indica que cuando un `StringArray` se indexa con un `number`, devolverá un `string`.

Hay dos tipos de índices de firmas admitidos: string, number, symbol y plantillas de cadena.
Es posible admitir muchos tipos de indexadores, pero el tipo devuelto por un indexador numérico debe ser un subtipo del tipo devuelto por el indexador de cadenas.

Esto se debe a que cuando se indexa con un `number`, *JavaScript* lo convertirá en un `string` antes de indexarlo en un objeto.
Eso significa que indexar con `100` (un `number`) es lo mismo que indexar con `"100"` (un `string`), por lo que los dos deben ser coherentes.

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

Si bien los índices de firmas de cadena son una forma poderosa de describir el patrón de "diccionario", también imponen que todas las propiedades coincidan con su tipo de retorno.
Esto se debe a que un índice de cadena declara que `obj.property` también está disponible como `obj["property"]`.
En el siguiente ejemplo, el tipo de `name` no coincide con el tipo del índice de la cadena y el comprobador de tipo da un error:

```ts twoslash
// @errors: 2411
interface NumberDictionary {
  [index: string]: number;

  length: number; // bien, la longitud es un número
  name: string; // error, el tipo de 'name' no es un subtipo del indexador
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
// @errors: 2542
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = ["Alice", "Bob"];
myArray[2] = "Mallory"; // ¡error!
```

No puedes configurar `myArray[2]` porque el índice de firma es `readonly`.

### Tipos indexables con cadenas de plantilla

Se puede usar una cadena de plantilla para indicar que se permite un patrón en particular, pero no todos. Por ejemplo, un objeto de encabezados *HTTP* puede tener una lista establecida de encabezados conocidos y admitir cualquier [propiedad personalizada definida](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) con el prefijo `x-`.

```ts twoslash
// @errors: 2339

interface HeadersResponse {
  "content-type": string,
  date: string,
  "content-length": string

  // Permitir cualquier propiedad que comience con 'data-'.
  [headerName: `x-${string}`]: string;
}

function handleResponse(r: HeadersResponse) {
  // Maneja conocido y x- prefijado con x-
  const type = r["content-type"]
  const poweredBy = r["x-powered-by"]

  // Las claves desconocidas sin prefijo generan errores
  const origin = r.origin
}
```

## Tipos de clases

### Implementar una interfaz

Uno de los usos más comunes de interfaces en lenguajes como *C#* y *Java*, el de hacer cumplir explícitamente que una clase cumple con un contrato en particular, también es posible en *TypeScript*.

```ts twoslash
interface ClockInterface {
  currentTime: Date;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  constructor(h: number, m: number) {}
}
```

También puedes describir métodos en una interfaz que se implementan en la clase, como lo hacemos con `setTime` en el siguiente ejemplo:

```ts twoslash
// @strictPropertyInitialization: false
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  setTime(d: Date) {
    this.currentTime = d;
  }
  constructor(h: number, m: number) {}
}
```

Las interfaces describen el lado público de la clase, en lugar del lado público y privado.
Esto te prohíbe usarlos para comprobar que una clase también tenga tipos particulares para el lado privado de la instancia de clase.

### Diferencia entre los lados estático y de instancia de las clases

Cuando se trabaja con clases e interfaces, es útil tener en cuenta que una clase tiene *dos* tipos: el tipo del lado estático y el tipo del lado de la instancia.
Puedes notar que si creas una interfaz con una firma de construcción e intentas crear una clase que implemente esta interfaz, obtendrás un error:

```ts twoslash
// @errors: 7013 2420 2564
// @strictPropertyInitialization: false
// @noImplicitAny: false
interface ClockConstructor {
  new (hour: number, minute: number);
}

class Clock implements ClockConstructor {
  currentTime: Date;
  constructor(h: number, m: number) {}
}
```

Esto se debe a que cuando una clase implementa una interfaz, solo se comprueba el lado de la instancia de la clase.
Dado que el constructor se encuentra en el lado estático, no se incluye en esta comprobación.

En cambio, necesitarías trabajar directamente con el lado estático de la clase.
En este ejemplo, definimos dos interfaces, `ClockConstructor` para el constructor e `ClockInterface` para los métodos de instancia.
Luego, por conveniencia, definimos una función constructora `createClock` que crea instancias del tipo que se le pasa:

```ts twoslash
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tictac(): void;
}

function createClock(
  ctor: ClockConstructor,
  hour: number,
  minute: number
): ClockInterface {
  return new ctor(hour, minute);
}

class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tictac() {
    console.log("beep beep");
  }
}

class AnalogClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tictac() {
    console.log("tic tac");
  }
}

let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 7, 32);
```

Debido a que el primer parámetro de `createClock` es de tipo `ClockConstructor`, en `createClock(AnalogClock, 7, 32)`, comprueba que `AnalogClock` tenga la firma correcta del constructor.

Otra forma sencilla es utilizar expresiones de clase:

```ts twoslash
// @strictPropertyInitialization: false
// @noImplicitAny: false
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tictac(): void;
}

const Clock: ClockConstructor = class Clock implements ClockInterface {
  constructor(h: number, m: number) {}
  tictac() {
    console.log("beep beep");
  }
};

let clock = new Clock(12, 17);
clock.tick();
```

## Extender interfaces

Como las clases, las interfaces se pueden extender entre sí.
Esto te permite copiar los miembros de una interfaz en otra, lo que te da más flexibilidad a la hora de separar tus interfaces en componentes reutilizables.

```ts twoslash
interface Shape {
  color: string;
}

interface Square extends Shape {
  sideLength: number;
}

let square = {} as Square;
square.color = "blue";
square.sideLength = 10;
```

Una interfaz puede extender múltiples interfaces, creando una combinación de todas las interfaces.

```ts twoslash
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}

let square = {} as Square;
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```

## Tipos híbridos

Como mencionamos anteriormente, las interfaces pueden describir los tipos enriquecidos presentes en *JavaScript* del mundo real.
Debido a la naturaleza dinámica y flexible de *JavaScript*, es posible que ocasionalmente encuentres un objeto que funcione como una combinación de algunos de los tipos descritos anteriormente.

Un ejemplo es un objeto que actúa como función y como objeto, con propiedades adicionales:

```ts twoslash
interface Counter {
  (inicio: number): string;
  interval: number;
  reiniciar(): void;
}

function getCounter(): Counter {
  let counter = function (start: number) {} as Counter;
  counter.interval = 123;
  counter.reset = function () {};
  return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

Al interactuar con *JavaScript* de terceros, es posible que debas usar patrones como el anterior para describir completamente la forma del tipo.

## Interfaces que extienden clases

Cuando un tipo de interfaz extiende un tipo de clase, hereda los miembros de la clase pero no sus implementaciones.
Es como si la interfaz hubiera declarado a todos los miembros de la clase sin proporcionar una implementación.
Las interfaces heredan incluso los miembros privados y protegidos de una clase base.
Esto significa que cuando creas una interfaz que extiende una clase con miembros privados o protegidos, ese tipo de interfaz solo se puede ser implementar por esa clase o una subclase de ella.

Esto es útil cuando tienes una jerarquía de herencia grande, pero deseas especificar que tu código funciona solo con subclases que tienen ciertas propiedades.
Las subclases no tienen que estar relacionadas además de heredar de la clase base.
Por ejemplo:

```ts twoslash
// @errors: 2300 2420 2300
class Control {
  private state: any;
}

interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select() {}
}

class TextBox extends Control {
  select() {}
}

class ImageControl implements SelectableControl {
  private state: any;
  select() {}
}
```

En el ejemplo anterior, `SelectableControl` contiene todos los miembros de `Control`, incluida la propiedad privada `state`.
Dado que `state` es un miembro privado, solo los descendientes de `Control` pueden implementar `SelectableControl`.
Esto se debe a que solo los descendientes de `Control` tendrán un miembro privado `state` que se origine en la misma declaración, lo cual es un requisito para que los miembros privados sean compatibles.

Dentro de la clase `Control` es posible acceder al miembro privado `state` a través de una instancia de `SelectableControl`.
Efectivamente, un `SelectableControl` actúa como un `Control` que se sabe que tiene un método `select`.
Las clases `Button` y `TextBox` son subtipos de `SelectableControl` (porque ambas heredan de `Control` y tienen un método `select`). La clase `ImageControl` tiene su propio miembro privado `state` en lugar de extender `Control`, por lo que no puede implementar `SelectableControl`.
