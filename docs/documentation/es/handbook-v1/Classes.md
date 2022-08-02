---
title: Clases
layout: docs
permalink: /docs/handbook/classes.html
oneline: Cómo funcionan las clases en TypeScript
handbook: "true"
deprecated_by: /docs/handbook/2/classes.html
---

*JavaScript* tradicional usa funciones y herencia basada en prototipos para construir componentes reutilizables, pero esto puede parecer un poco difícil para los programadores que se sienten más cómodos con un enfoque orientado a objetos, donde las clases heredan la funcionalidad y los objetos se crean a partir de esas clases.
A partir de *ECMAScript 2015*, también conocido como *ECMAScript 6*, los programadores de *JavaScript* podrán construir sus aplicaciones utilizando este enfoque basado en clases orientadas a objetos.
En *TypeScript*, permitimos a los desarrolladores utilizar estas técnicas ahora, y compilarlas en *JavaScript* que funciona en todos los principales navegadores y plataformas, sin tener que esperar a la próxima versión de *JavaScript*.

## Clases

Echemos un vistazo a un ejemplo simple basado en clases:

```ts twoslash
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("world");
```

La sintaxis debería resultarte familiar si anteriormente haz utilizado *C#* o *Java*.
Declaramos una nueva clase `Greeter`. Esta clase tiene tres miembros: una propiedad llamada `greeting`, un constructor y un método `greet`.

Lo notarás en la clase cuando nos refiramos a uno de los miembros de la clase que prefijamos con `this.`.
`this` denota que es un acceso a miembro.

En la última línea construimos una instancia de la clase `Greeter` usando `new`.
Esto llama al constructor que definimos antes, crea un nuevo objeto con la forma `Greeter` y ejecuta el constructor para iniciarlo.

## Herencia

En *TypeScript*, podemos usar patrones comunes orientados a objetos.
Uno de los patrones más fundamentales en la programación basada en clases es poder extender las clases existentes para crear otras nuevas usando la herencia.

Echemos un vistazo a un ejemplo:

```ts twoslash
class Animal {
  move(distanceInMeters: number = 0) {
    console.log(`Animal moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof! Woof!");
  }
}

const dog = new Dog();
dog.bark();
dog.move(10);
dog.bark();
```

Este ejemplo muestra la característica de herencia más básica: las clases heredan propiedades y métodos de las clases base.
Aquí, `Dog` es una clase *derivada* que proviene de la clase *base* `Animal` usando la palabra clave `extends`.
Las clases derivadas a menudo se denominan *subclases* y las clases base a menudo se denominan *superclases*.

Debido a que `Dog` extiende la funcionalidad de `Animal`, pudimos crear una instancia de `Dog` que podría tanto `bark()` como `move()`rse.

Veamos ahora un ejemplo más complejo.

```ts twoslash
class Animal {
  name: string;
  constructor(theName: string) {
    this.name = theName;
  }
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Snake extends Animal {
  constructor(name: string) {
    super(name);
  }
  move(distanceInMeters = 5) {
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}

class Horse extends Animal {
  constructor(name: string) {
    super(name);
  }
  move(distanceInMeters = 45) {
    console.log("Galloping...");
    super.move(distanceInMeters);
  }
}

let sam = new Snake("Sammy the Python");
let tom: Animal = new Horse("Tommy the Palomino");

sam.move();
tom.move(34);
```

Este ejemplo cubre algunas otras características que no mencionamos anteriormente.
Una vez más, vemos la palabra clave `extend` utilizada para crear dos nuevas subclases de `Animal`: `Horse` y `Snake`.

Una diferencia con respecto al ejemplo anterior es que cada clase derivada que contiene una función constructora debe llamar a `super()` para ejecutar el constructor de la clase base.
Es más, antes de que *alguna vez* accedamos a una propiedad con `this` en el cuerpo de un constructor, *tenemos* que llamar a `super()`.
Esta es una regla importante que *TypeScript* impone.

El ejemplo también muestra cómo sobrescribir los métodos en la clase base con métodos que están especializados para la subclase.
Aquí, tanto `Snake` como `Horse` crean un método `move` que redefine al `move` de `Animal`, dándole funcionalidad específica a cada clase.
Ten en cuenta que aunque `tom` se declara como un `Animal`, dado que su valor es `Horse`, la llamada a `tom.move(34)` llamará al método redefinido en `Horse`:

```
Slithering...
Sammy the Python moved 5m.
Galloping...
Tommy the Palomino moved 34m.
```

## Los modificadores `public`, `private` y `protected`

## De manera predeterminada `public`

En nuestros ejemplos, hemos podido acceder libremente a los miembros que declaramos en nuestros programas.
Si estás familiarizado con las clases en otros lenguajes, puedes haber notado en los ejemplos anteriores que no hemos tenido que usar la palabra `public` para lograrlo; por ejemplo, `C#` requiere que cada miembro esté explícitamente etiquetado `public` para ser visible.
En *TypeScript*, de manera predeterminada, cada miembro es `public`.

Aún puedes marcar a un miembro `public` explícitamente.
Podríamos haber escrito la clase `Animal` de la sección anterior de la siguiente manera:

```ts twoslash
class Animal {
  public name: string;

  public constructor(theName: string) {
    this.name = theName;
  }

  public move(distanceInMeters: number) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}
```

## Campos privados en *ECMAScript*

Con *TypeScript 3.8*, *TypeScript* admite la nueva sintaxis de *JavaScript* para campos privados:

```ts twoslash
// @errors: 18013
class Animal {
  #name: string;
  constructor(theName: string) {
    this.#name = theName;
  }
}

new Animal("Cat").#name;
```

Esta sintaxis está integrada en el entorno de ejecución de *JavaScript* y puede tener mejores garantías sobre el aislamiento de cada campo privado.
En este momento, la mejor documentación para estos campos privados se encuentra en *TypeScript 3.8* [notas de la versión](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#ecmascript-private-fields).

## Entendiendo el `private` de *TypeScript*

*TypeScript* también tiene su propia forma de declarar que un miembro está marcado como `private`, no se puede acceder a él desde fuera de la clase que lo contiene. Por ejemplo:

```ts twoslash
// @errors: 2341
class Animal {
  private name: string;

  constructor(theName: string) {
    this.name = theName;
  }
}

new Animal("Cat").name;
```

*TypeScript* es un sistema de tipo estructural.
Cuando comparamos dos tipos diferentes, independientemente de su procedencia, si los tipos de todos los miembros son compatibles, entonces decimos que los tipos en sí mismos son compatibles.

Sin embargo, al comparar tipos que tienen miembros `private` y `protected`, tratamos estos tipos de manera diferente.
Para que dos tipos se consideren compatibles, si uno de ellos tiene un miembro `private`, entonces el otro debe tener un miembro `private` que se haya originado en la misma declaración.
Lo mismo aplica a los miembros `protected`.

Veamos un ejemplo para entender mejor cómo funciona esto en la práctica:

```ts twoslash
// @errors: 2322
class Animal {
  private name: string;
  constructor(theName: string) {
    this.name = theName;
  }
}

class Rhino extends Animal {
  constructor() {
    super("Rhino");
  }
}

class Employee {
  private name: string;
  constructor(theName: string) {
    this.name = theName;
  }
}

let animal = new Animal("Goat");
let rhino = new Rhino();
let employee = new Employee("Bob");

animal = rhino;
animal = employee;
```

En este ejemplo, tenemos un `Animal` y un `Rhino`, siendo `Rhino` una subclase de `Animal`.
También tenemos una nueva clase `Employee` que se ve idéntica a `Animal` en términos de forma.
Creamos algunas instancias de estas clases y luego tratamos de asignarlas entre sí para ver qué sucederá.
Porque `Animal` y `Rhino` comparten el lado `private` de su forma partiendo de la misma declaración de `private name: string` en `Animal`, son compatibles. Sin embargo, este no es el caso para `Employee`.
Cuando intentamos asignar desde un `Employee` a `Animal`, obtenemos el error de que estos tipos no son compatibles.
Aunque `Employee` también tiene un miembro `private` llamado `name`, este no es el que declaramos en `Animal`.

## Comprender `protected`

El modificador `protected` actúa de manera muy similar al modificador `private`, excepto que los miembros declarados `protected` también se pueden acceder dentro de las clases derivadas. Por ejemplo:

```ts twoslash
// @errors: 2445
class Person {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Employee extends Person {
  private department: string;

  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }

  public getElevatorPitch() {
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard = new Employee("Howard", "Sales");
console.log(howard.getElevatorPitch());
console.log(howard.name);
```

Ten en cuenta que, si bien no podemos usar `name` desde fuera de `Person`, aún lo podemos usar desde un método de la instancia de `Employee` porque `Employee` proviene de `Person`.

Un constructor también puede estar marcado como `protected`.
Esto significa que la clase no se puede instanciar fuera de su clase contenedora, pero se puede extender. Por ejemplo:

```ts twoslash
// @errors: 2674
class Person {
  protected name: string;
  protected constructor(theName: string) {
    this.name = theName;
  }
}

// Employee puede extender a Person
class Employee extends Person {
  private department: string;

  constructor(name: string, department: string) {
    super(name);
    this.department = department;
  }

  public getElevatorPitch() {
    return `Hello, my name is ${this.name} and I work in ${this.department}.`;
  }
}

let howard = new Employee("Howard", "Sales");
let john = new Person("John");
```

## Modificador `readonly`

Puedes hacer propiedades de solo lectura usando la palabra clave `readonly`.
Las propiedades de solo lectura se deben iniciar en su declaración o en el constructor.

```ts twoslash
// @errors: 2540
class Octopus {
  readonly name: string;
  readonly numberOfLegs: number = 8;

  constructor(theName: string) {
    this.name = theName;
  }
}

let dad = new Octopus("Man with the 8 strong legs");
dad.name = "Man with the 3-piece suit";
```

## Propiedades de parámetros

En nuestro último ejemplo, tuvimos que declarar un miembro `name` de solo lectura y el parámetro `theName` del constructor en la clase `Octopus`. Esto es necesario para que el valor de `theName` sea accesible después de que se ejecute el constructor `Octopus`.
Las *propiedades* de los *parámetros* te permiten crear e iniciar un miembro en un solo lugar.
Aquí hay una revisión adicional de la clase `Octopus` anterior usando una *propiedad* de *parámetro*:

```ts twoslash
class Octopus {
  readonly numberOfLegs: number = 8;
  constructor(readonly name: string) {}
}

let dad = new Octopus("Man with the 8 strong legs");
dad.name;
```

Observa cómo eliminamos `theName` por completo y simplemente usamos el parámetro abreviado `readonly name: string` en el constructor para crear e iniciar el miembro `name`.
Hemos consolidado las declaraciones y la asignación en una sola ubicación.

Las propiedades de los parámetros se declaran prefijando un parámetro del constructor con un modificador de accesibilidad, `readonly` o ambos.
El uso de `private` en una propiedad de parámetro declara e inicia un miembro privado; también, se hace lo mismo para `public`, `protected` y `readonly`.

## Accesores

*TypeScript* admite captadores/definidores como una forma de interceptar accesos a un miembro de un objeto.
Esto te brinda una forma de tener un control más detallado sobre cómo se accede a un miembro en cada objeto.

Vamos a convertir una clase simple para usar `get` y `set`.
Primero, comencemos con un ejemplo sin captadores ni definidores.

```ts twoslash
// @strict: false
class Employee {
  fullName: string;
}

let employee = new Employee();
employee.fullName = "Bob Smith";

if (employee.fullName) {
  console.log(employee.fullName);
}
```

Si bien permitir que las personas establezcan aleatoriamente `fullName` directamente es bastante útil, es posible que también deseemos aplicar algunas restricciones cuando se establece `fullName`.

En esta versión, agregamos un definidor que comprueba la longitud del `newName` para asegurarse de que sea compatible con la longitud máxima de nuestro campo de la base de datos de respaldo. Si no es así, arrojamos un error notificando al código del cliente que algo salió mal.

Para preservar la funcionalidad existente, también agregamos un captador simple que recupera `fullName` sin modificar.

```ts twoslash
// @strict: false
const fullNameMaxLength = 10;

class Employee {
  private _fullName: string = "";

  get fullName(): string {
    return this._fullName;
  }

  set fullName(newName: string) {
    if (newName && newName.length > fullNameMaxLength) {
      throw new Error("fullName has a max length of " + fullNameMaxLength);
    }

    this._fullName = newName;
  }
}

let employee = new Employee();
employee.fullName = "Bob Smith";

if (employee.fullName) {
  console.log(employee.fullName);
}
```

Para demostrarnos a nosotros mismos que nuestro descriptor de acceso ahora está revisando la longitud de los valores, podemos intentar asignar un nombre de más de 10 caracteres y comprobar que obtenemos un error.

Un par de cosas a tener en cuenta sobre los accesores:

En primer lugar, los accesores requieren que configures el compilador para que produzca *ECMAScript 5* o superior.
Debajo de *ECMAScript 3* no es compatible.
En segundo lugar, los accesores con un `get` y sin `set` se infieren automáticamente como `readonly`.
Esto es útil al generar un archivo `.d.ts` desde tu código, porque los usuarios de tu propiedad pueden ver que no lo pueden cambiar.

## Propiedades estáticas

Hasta este punto, solo hemos hablado de los miembros *instance* de la clase, los que aparecen en el objeto cuando se crea una instancia.
También podemos crear miembros estáticos de una clase, aquellos que son visibles en la clase en lugar de en las instancias.
En este ejemplo, usamos `static` en el origen, ya que es un valor general para todas las rejillas.
Cada instancia accede a este valor anteponiendo el nombre de la clase.
De manera similar a anteponer `this.` frente a los accesos a las instancias, aquí anexamos `Grid.` delante de los accesos estáticos.

```ts twoslash
class Grid {
  static origin = { x: 0, y: 0 };

  calculateDistanceFromOrigin(point: { x: number; y: number }) {
    let xDist = point.x - Grid.origin.x;
    let yDist = point.y - Grid.origin.y;
    return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
  }

  constructor(public scale: number) {}
}

let grid1 = new Grid(1.0); // Escala 1x
let grid2 = new Grid(5.0); // Escala 5x

console.log(grid1.calculateDistanceFromOrigin({ x: 10, y: 10 }));
console.log(grid2.calculateDistanceFromOrigin({ x: 10, y: 10 }));
```

## Clases abstractas

Las clases abstractas son clases base de las cuales se pueden derivar otras clases.
No se pueden instanciar directamente.
A diferencia de una interfaz, una clase abstracta puede contener detalles de implementación para sus miembros.
La palabra clave `abstract` se usa para definir clases abstractas, así como también métodos abstractos dentro de una clase abstracta.

```ts twoslash
abstract class Animal {
  abstract makeSound(): void;

  move(): void {
    console.log("roaming the earth...");
  }
}
```

Los métodos dentro de una clase abstracta que están marcados como abstractos no contienen una implementación y se deben implementar en clases derivadas.
Los métodos abstractos comparten una sintaxis similar a los métodos de interfaz.
Ambos definen la firma de un método sin incluir un cuerpo de método.
Sin embargo, los métodos abstractos deben incluir la palabra clave `abstract` y opcionalmente incluir modificadores de acceso.

```ts twoslash
// @errors: 2511 2339
abstract class Department {
  constructor(public name: string) {}

  printName(): void {
    console.log("Department name: " + this.name);
  }

  abstract printMeeting(): void; // se debe implementar en clases derivadas
}

class AccountingDepartment extends Department {
  constructor() {
    super("Accounting and Auditing"); // los constructores en clases derivadas deben llamar a super()
  }

  printMeeting(): void {
    console.log("The Accounting Department meets each Monday at 10am.");
  }

  generateReports(): void {
    console.log("Generating accounting reports...");
  }
}

let department: Department; // bien para crear una referencia a un tipo abstracto
department = new Department(); // error: no se puede crear una instancia de una clase abstracta
department = new AccountingDepartment(); // ok para crear y asignar una subclase no abstracta
department.printName();
department.printMeeting();
department.generateReports(); // error: department no es de tipo AccountingDepartment, no puede acceder a generateReports
```

## Técnicas avanzadas

## Funciones constructoras

Cuando declaras una clase en *TypeScript*, en realidad estás creando múltiples declaraciones al mismo tiempo.
El primero es el tipo de la *instancia* de la clase.

```ts twoslash
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    return "Hello, " + this.greeting;
  }
}

let greeter: Greeter;
greeter = new Greeter("world");
console.log(greeter.greet()); // "Hello, world"
```

Aquí, cuando decimos `let greeter: Greeter`, estamos usando `Greeter` como el tipo de instancias de la clase `Greeter`.
Esta es casi una segunda naturaleza para los programadores de otros lenguajes orientados a objetos.

También estamos creando otro valor que llamamos *función constructora*.
Esta es la función que se llama cuando subimos instancias `new` de la clase.
Para ver cómo se ve esto en la práctica, echemos un vistazo al *JavaScript* creado por el ejemplo anterior:

```ts twoslash
// @strict: false
let Greeter = (function () {
  function Greeter(message) {
    this.greeting = message;
  }

  Greeter.prototype.greet = function () {
    return "Hello, " + this.greeting;
  };

  return Greeter;
})();

let greeter;
greeter = new Greeter("world");
console.log(greeter.greet()); // "Hello, world"
```

Aquí, a `let Greeter` le será asignada la función constructora.
Cuando llamamos a `new` y ejecutamos esta función, obtenemos una instancia de la clase.
La función constructora también contiene todos los miembros estáticos de la clase.
Otra forma de pensar en cada clase es que hay un lado *instancia* y un lado *estático*.

Modifiquemos un poco el ejemplo para mostrar esta diferencia:

```ts twoslash
// @strict: false
class Greeter {
  static standardGreeting = "Hello, there";
  greeting: string;
  greet() {
    if (this.greeting) {
      return "Hello, " + this.greeting;
    } else {
      return Greeter.standardGreeting;
    }
  }
}

let greeter1: Greeter;
greeter1 = new Greeter();
console.log(greeter1.greet()); // "Hello, there"

let greeterMaker: typeof Greeter = Greeter;
greeterMaker.standardGreeting = "Hey there!";

let greeter2: Greeter = new greeterMaker();
console.log(greeter2.greet()); // "Hey there!"

let greeter3: Greeter;
greeter3 = new Greeter();
console.log(greeter3.greet()); // "Hey there!"
```

En este ejemplo, `greeter1` funciona de manera similar a antes.
Instalamos la clase `Greeter` y usamos ese objeto.
Esto lo hemos visto antes.

Luego, usamos la clase directamente.
Aquí creamos una nueva variable llamada `greeterMaker`.
Esta variable contendrá la clase en sí misma, o dicho de otra manera su función constructora.
Aquí usamos `typeof Greeter`, es decir, "dame el tipo de la clase `Greeter` en sí misma" en lugar del tipo de la instancia.
O, con más precisión, "dame el tipo del símbolo llamado `Greeter`", que es el tipo de la función constructora.
Este tipo contendrá todos los miembros estáticos de `Greeter` junto con el constructor que crea instancias de la clase `Greeter`.
Mostramos esto usando `new` on `greeterMaker`, creando nuevas instancias de `Greeter` e invocándolas como antes.
También es bueno mencionar que cambiar la propiedad estática está mal visto, aquí `greeter3` tiene `"¡Hola allá!"` en lugar de `"Hola, allá"` en `standardGreeting`.

## Usar una clase como interfaz

Como dijimos en la sección anterior, una declaración de clase crea dos cosas: un tipo que representa instancias de la clase y una función constructora.
Debido a que las clases crean tipos, puedes usarlas en los mismos lugares donde podrías usar interfaces.

```ts twoslash
// @strict: false
class Point {
  x: number;
  y: number;
}

interface Point3d extends Point {
  z: number;
}

let point3d: Point3d = { x: 1, y: 2, z: 3 };
```
