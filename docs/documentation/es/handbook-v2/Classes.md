---
title: Clases
layout: docs
permalink: /docs/handbook/2/classes.html
oneline: "Cómo funcionan las clases en TypeScript"
---

<blockquote class='bg-reading'>
  <p>Lectura de antecedentes:<br /><a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes'>Clases (MDN)</a></p>
</blockquote>

*TypeScript* ofrece soporte completo para la palabra clave `class` introducida en *ES2015*.

Al igual que con otras funciones del lenguaje *JavaScript*, *TypeScript* agrega anotaciones de tipo y otra sintaxis para permitirte expresar relaciones entre clases y otros tipos.

## Miembros de clase

Aquí está la clase más básica ⏤ una vacía:

```ts twoslash
class Point {}
```

Esta clase aún no es muy útil, así que comencemos a agregar algunos miembros.

### Campos

Una declaración de campo crea una propiedad de escritura pública en una clase:

```ts twoslash
// @strictPropertyInitialization: false
class Point {
  x: number;
  y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

Al igual que con otras ubicaciones, la anotación de tipo es opcional, pero será un `any` implícito si no se especifica.

Los campos también pueden tener *iniciadores*; estos se ejecutarán automáticamente cuando se crea una instancia de la clase:

```ts twoslash
class Point {
  x = 0;
  y = 0;
}

const pt = new Point();
// Prints 0, 0
console.log(`${pt.x}, ${pt.y}`);
```

Al igual que con `const`, `let` y `var`, el iniciador de una propiedad de clase se utilizará para inferir su tipo:

```ts twoslash
// @errors: 2322
class Point {
  x = 0;
  y = 0;
}
// ---cut---
const pt = new Point();
pt.x = "0";
```

#### `--strictPropertyInitialization`

La configuración de [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization) controla si los campos de clase se deben iniciar en el constructor.

```ts twoslash
// @errors: 2564
class BadGreeter {
  name: string;
}
```

```ts twoslash
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

Ten en cuenta que el campo se debe iniciar *en el propio constructor*.
*TypeScript* no analiza los métodos que invocas desde el constructor para detectar iniciaciones, porque una clase derivada puede redefinir esos métodos y no iniciar los miembros.

Si tienes la intención de iniciar definitivamente un campo a través de medios distintos al constructor (por ejemplo, tal vez una biblioteca externa esté completando parte de tu clase por ti), puedes usar el *operador de aserción de asignación definida*, `!`:

```ts twoslash
class GoodGreeter {
  // No iniciado, pero sin error
  name!: string;
}
```

### `readonly`

Los campos pueden tener el modificador prefijo `readonly`.
Esto evita asignaciones al campo fuera del constructor.

```ts twoslash
// @errors: 2540 2540
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;
    }
  }

  err() {
    this.name = "not ok";
  }
}
const g = new Greeter();
g.name = "also not ok";
```

### Constructores

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes/constructor'>Constructor (MDN)</a><br/>
   </p>
</blockquote>

Los constructores de clase son muy similares a las funciones.
Puedes agregar parámetros con anotaciones de tipo, valores predeterminados y sobrecargas:

```ts twoslash
class Point {
  x: number;
  y: number;

  // Firma normal con valores predeterminados
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```ts twoslash
class Point {
  // Sobrecargas
  constructor(x: number, y: string);
  constructor(s: string);
  constructor(xs: any, y?: any) {
    // TBD
  }
}
```

Hay solo algunas diferencias entre las firmas de constructores de clases y las firmas de funciones:

- Los constructores no pueden tener parámetros de tipo ⏤ estos pertenecen a la declaración de clase externa, de la que aprenderemos más adelante
- Los constructores no pueden tener anotaciones de tipo de retorno ⏤ el tipo de clase de la instancia siempre es lo que se devuelve

#### Llamadas a super

Al igual que en *JavaScript*, si tienes una clase base, necesitarás llamar a `super();` en el cuerpo de tu constructor antes de usar cualquier miembro `this`:

```ts twoslash
// @errors: 17009
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // Imprime un valor incorrecto en ES5; lanza una excepción en ES6
    console.log(this.k);
    super();
  }
}
```

Olvidar llamar a `super` es un error fácil de cometer en *JavaScript*, pero *TypeScript* te dirá cuándo es necesario.

### Métodos

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Method_definitions'>Definición de métodos</a><br/>
   </p>
</blockquote>

Una propiedad de función en una clase se llama *método*.
Los métodos pueden usar todas las anotaciones del mismo tipo tal como las funciones y los constructores:

```ts twoslash
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

Aparte de las anotaciones de tipo estándar, *TypeScript* no agrega nada nuevo a los métodos.

Ten en cuenta que dentro del cuerpo de un método, todavía es obligatorio acceder a los campos y otros métodos a través de `this`.
Un nombre no calificado en el cuerpo de un método siempre se referirá a algo en el ámbito adjunto:

```ts twoslash
// @errors: 2322
let x: number = 0;

class C {
  x: string = "hola";

  m() {
    // Esto está intentando modificar 'x' de la línea 1, no la propiedad de la clase
    x = "world";
  }
}
```

### Captadores y definidores

Las clases también pueden tener *accesores*:

```ts twoslash
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(valor) {
    this._length = value;
  }
}
```

> Ten en cuenta que un par de get/set respaldados por un campo sin lógica adicional rara vez es útil en *JavaScript*.
> Está bien exponer campos públicos si no necesitas agregar lógica adicional durante las operaciones de captación/definición.

*TypeScript* tiene algunas reglas de inferencia especiales para los descriptores de acceso:

- Si `get` existe pero no `set`, la propiedad automáticamente es `readonly`
- El tipo del parámetro definidor se infiere a partir del tipo de retorno del captador
- Los captadores y definidores deben tener la misma [Visibilidad de miembros](#visibilidad-de-miembros)

A partir de [*TypeScript 4.3*](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/), es posible tener descriptores de acceso con diferentes tipos para captar y definir.

```ts twoslash
class Thing {
  _size = 0;

  get size(): number {
    return this._size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // No permite NaN, Infinity, etc.

    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }

    this._size = num;
  }
}
```

### Índice de firmas

Las clases pueden declarar índices de firmas; funcionan igual que el [Indice de firmas para otros tipos de objetos](/docs/handbook/2/objects.html#indice-de-firmas):

```ts twoslash
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);

  check(s: string) {
    return this[s] as boolean;
  }
}
```

Debido a que el tipo del índice de firma también debe capturar los tipos de métodos, no es fácil usar estos tipos de manera útil.
Por lo general, es mejor almacenar los datos indexados en otro lugar en lugar de en la propia instancia de la clase.

## Herencia de clase

Al igual que otros lenguajes con características orientadas a objetos, las clases en *JavaScript* pueden heredar de las clases base.

### Cláusulas `implements`

Puedes utilizar una cláusula `implements` para comprobar que una clase satisface una `interfaz` en particular.
Se emitirá un error si una clase no la implementa correctamente:

```ts twoslash
// @errors: 2420
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  pong() {
    console.log("pong!");
  }
}
```

Las clases también pueden implementar múltiples interfaces, p. ej. `class C implements A, B {`.

#### Precauciones

Es importante entender que una cláusula `implements` es solo una comprobación de que la clase se puede tratar como el tipo interfaz.
No cambia *en absoluto* el tipo de clase o sus métodos.
Una fuente común de error es asumir que una cláusula `implements` cambiará el tipo de clase ⏤ ¡no lo hace!

```ts twoslash
// @errors: 7006
interface Checkable {
  check(name: string): boolean;
}

class NameChecker implements Checkable {
  check(s) {
    // No ocurre error aquí
    return s.toLowercse() === "ok";
    //         ^?
  }
}
```

En este ejemplo, quizás esperábamos que el tipo de `s` estuviera influenciado por el parámetro `name: string` de `check`.
No lo es ⏤ las cláusulas `implements` no cambian la forma en que se comprueba el cuerpo de la clase o se infiere su tipo.

De manera similar, implementar una interfaz con una propiedad opcional no crea esa propiedad:

```ts twoslash
// @errors: 2339
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
c.y = 10;
```

### Cláusulas `extends`

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends'>Palabras clave extendidas (MDN)</a><br/>
   </p>
</blockquote>

Las clases se pueden `extend`er de una clase base.
Una clase derivada tiene todas las propiedades y métodos de su clase base y también define miembros adicionales.

```ts twoslash
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
// Método de la clase base
d.move();
// Método de clase derivada
d.woof(3);
```

#### Métodos primordiales

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super'>super keyword (MDN)</a><br/>
   </p>
</blockquote>

Una clase derivada también puede redefinir un campo o propiedad de la clase base.
Puedes utilizar la sintaxis `super` para acceder a los métodos de la clase base.
Ten en cuenta que debido a que las clases de *JavaScript* son un objeto de búsqueda simple, no existe la noción de un "supercampo".

*TypeScript* impone que una clase derivada sea siempre un subtipo de su clase base.

Por ejemplo, esta es una forma legal de redefinir un método:

```ts twoslash
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

const d = new Derived();
d.greet();
d.greet("reader");
```

Es importante que una clase derivada siga su contrato de clase base.
Recuerda que es muy común (¡y siempre legal!) hacer referencia a una instancia de clase derivada a través de una referencia de clase base:

```ts twoslash
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
declare const d: Base;
// ---cut---
// Alias ​​de la instancia derivada a través de una referencia a la clase base
const b: Base = d;
// No hay problema
b.greet();
```

¿Qué pasa si `Derived` no siguió el contrato de `Base`?

```ts twoslash
// @errors: 2416
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  // Hace que este parámetro sea obligatorio
  greet(name: string) {
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

Si compilamos este código a pesar del error, este ejemplo fallará:

```ts twoslash
declare class Base {
  greet(): void;
}
declare class Derived extends Base {}
// ---cut---
const b: Base = new Derived();
// Se bloquea porque el "name" no estará definido
b.greet();
```

#### Solo declaraciones de tipo de campo

Cuando `target >= ES2022` o [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) es `true`, los campos de clase se inician después de que se completa el constructor de la clase principal, sobrescribiendo cualquier valor establecido por la clase principal. Esto puede ser un problema cuando solo deseas volver a declarar un tipo más preciso para un campo heredado. Para manejar estos casos, puedes escribir `declare` para indicarle a *TypeScript* que no debería haber ningún efecto de tiempo de ejecución para esta declaración de campo.

```ts twoslash
interface Animal {
  dateOfBirth: any;
}

interface Dog extends Animal {
  breed: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // No emite código JavaScript,
  // solo se asegura de que sea el tipo correcto
  declare resident: Dog;
  constructor(dog: Dog) {
    super(dog);
  }
}
```

#### Orden de iniciación

El orden en que se inician las clases de *JavaScript* puede resultar sorprendente en algunos casos.
Consideremos este código:

```ts twoslash
class Base {
  name = "base";
  constructor() {
    console.log("My name is " + this.name);
  }
}

class Derived extends Base {
  name = "derived";
}

// Imprime "base", no "derived"
const d = new Derived();
```

¿Que pasó aquí?

El orden de inicio de la clase, según lo define *JavaScript*, es:

- Se inician los campos de la clase base
- El constructor de la clase base se ejecuta
- Los campos de la clase derivada se inician
- El constructor de la clase derivada se ejecuta

Esto significa que el constructor de la clase base vio su propio valor para `name` durante su propio constructor, porque las iniciaciones del campo de la clase derivada aún no se habían ejecutado.

#### Heredar tipos integrados

> Nota: Si no planeas heredar de tipos integrados como `Array`, `Error`, `Map`, etc. o si tu destino de compilación está establecido explícitamente en `ES6`/`ES2015` o superior, puedes omitir esta sección

En *ES2015*, los constructores que devuelven un objeto sustituyen implícitamente el valor de `this` por cualquier llamador de `super(...)`.
Es necesario que el código del constructor generado capture cualquier potencial valor de retorno de `super(...)` y lo reemplace con `this`.

Como resultado, es posible que las subclases de `Error`, `Array` y otras ya no funcionen como se esperaba.
Esto se debe al hecho de que las funciones constructoras para `Error`, `Array` y similares usan `new.target` de *ECMAScript 6* para ajustar la cadena del prototipo;
sin embargo, no hay forma de asegurar un valor para `new.target` cuando se invoca un constructor en *ECMAScript 5*.
Otros compiladores de nivel inferior, por omisión, generalmente tienen la misma limitación.

Para una subclase como la siguiente:

```ts twoslash
class MsgError extends Error {
  constructor(m: string) {
    super(m);
  }
  sayHello() {
    return "hello " + this.message;
  }
}
```

puedes encontrar que:

- Los métodos pueden estar `undefined`s en los objetos devueltos al construir estas subclases, por lo que llamar a `sayHello` dará como resultado un error.
- `instanceof` se dividirá entre las instancias de la subclase y sus instancias, por lo que `(new MsgError()) instanceof MsgError` devolverá `false`.

Como recomendación, puedes ajustar manualmente el prototipo inmediatamente después de cualquier llamada a `super(...)`.

```ts twoslash
class MsgError extends Error {
  constructor(m: string) {
    super(m);

    // Establece el prototipo explícitamente.
    Object.setPrototypeOf(this, MsgError.prototype);
  }

  sayHello() {
    return "hello " + this.message;
  }
}
```

Sin embargo, cualquier subclase de `MsgError` también tendrá que configurar manualmente el prototipo.
Para los entornos de ejecución que no son compatibles con [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf), es posible que puedas usar [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto).

Desafortunadamente, [estas soluciones alternativas no trabajarán en *Internet Explorer 10* y anteriores](<https://docs.microsoft.com/es-es/microsoft-edge/dev-guide/whats-new/javascript-version-information?redirectedfrom=MSDN>).
Se pueden copiar manualmente métodos del prototipo a la propia instancia (es decir, `MsgError.prototype` en `this`), pero la cadena del prototipo en sí no se puede arreglar.

## Visibilidad de miembros

Puedes usar *TypeScript* para controlar si ciertos métodos o propiedades son visibles para el código fuera de la clase.

### `public`

La visibilidad predeterminada de los miembros de la clase es `public`.
Se puede acceder a un miembro `public` desde cualquier lugar:

```ts twoslash
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
```

Debido a que `public` ya es el modificador de visibilidad predeterminado, nunca *necesitas* escribirlo en un miembro de la clase, pero puedes elegir hacerlo por razones de estilo/legibilidad.

### `protected`

Los miembros `protected` solo son visibles para las subclases de la clase en la que están declarados.

```ts twoslash
// @errors: 2445
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // Bien para acceder al miembro protegido aquí
    console.log("Howdy, " + this.getName());
    //                          ^^^^^^^^^^^^^^
  }
}
const g = new SpecialGreeter();
g.greet(); // Bien
g.getName();
```

#### Exposición de miembros `protected`

Las clases derivadas deben seguir sus contratos de clase base, pero pueden optar por exponer un subtipo de clase base con más capacidades.
Esto incluye hacer que los miembros `protected` sean `public`:

```ts twoslash
class Base {
  protected m = 10;
}
class Derived extends Base {
  // Sin modificador, por lo que el valor predeterminado es `public`
  m = 15;
}
const d = new Derived();
console.log(d.m); // Bien
```

Ten en cuenta que `Derived` ya podía leer y escribir libremente `m`, por lo que esto no altera significativamente la "seguridad" de esta situación.
Lo principal a tener en cuenta aquí es que en la clase derivada, debemos tener cuidado de repetir el modificador `protected` si esta exposición no es intencional.

#### Acceso `protected` entre jerarquías

Diferentes lenguajes de programación orientada a objetos no están de acuerdo sobre si es legal acceder a un miembro `protected` a través de una referencia de clase base:

```ts twoslash
// @errors: 2446
class Base {
  protected x: number = 1;
}
class Derivada1 extends Base {
  protected x: number = 5;
}
class Derivada2 extends Base {
  f1(otro: Derivada2) {
    otro.x = 10;
  }
  f2(otro: Base) {
    otro.x = 10;
  }
}
```

*Java*, por ejemplo, considera que esto es legal.
Por otro lado, *C#* y *C++* eligieron que este código debería ser ilegal.

*TypeScript* por otro lado con *C#* y *C++* aquí, porque acceder a `x` en `Derived2` solo debería ser legal desde las subclases de `Derived2`, y `Derived1` no es una de ellas.
Además, si acceder a `x` a través de una referencia de `Derived1` es ilegal (¡lo que ciertamente debería serlo!), entonces acceder a él a través de una referencia de clase base nunca debería mejorar la situación.

Consulta también [¿Por qué no puedo acceder a un miembro protegido de una clase derivada?](https://blogs.msdn.microsoft.com/ericlippert/2005/11/09/why-cant-i-access-a-protected-member-from-a-derived-class/) que explica más el razonamiento de *C#*.

### `private`

`private` es como `protected`, pero no permite el acceso al miembro incluso desde subclases:

```ts twoslash
// @errors: 2341
class Base {
  private x = 0;
}
const b = new Base();
// No se puede acceder desde fuera de la clase
console.log(b.x);
```

```ts twoslash
// @errors: 2341
class Base {
  private x = 0;
}
// ---cut---
class Derived extends Base {
  showX() {
    // No se puede acceder a las subclases
    console.log(this.x);
  }
}
```

Debido a que los miembros `private` no son visibles para las clases derivadas, una clase derivada no puede aumentar su visibilidad:

```ts twoslash
// @errors: 2415
class Base {
  private x = 0;
}
class Derived extends Base {
  x = 1;
}
```

#### Acceso `private` entre instancias

Los diferentes lenguajes de programación orientada a objetos no están de acuerdo sobre si diferentes instancias de la misma clase pueden acceder a los miembros `private` de cada uno.
Mientras que lenguajes como *Java*, *C#*, *C++*, *Swift* y *PHP* permiten esto, *Ruby* no.

*TypeScript* permite el acceso `private` entre instancias:

```ts twoslash
class A {
  private x = 10;

  public sameAs(other: A) {
    // No hay error
    return other.x === this.x;
  }
}
```

#### Advertencias

Al igual que otros aspectos del sistema de tipos de texto *TypeScript*, `private` y `protected` [solamente son aplicadas durante la comprobación de tipos](https://www.typescriptlang.org/play?removeComments=true&target=99&ts=4.3.4#code/PTAEGMBsEMGddAEQPYHNQBMCmVoCcsEAHPASwDdoAXLUAM1K0gwQFdZSA7dAKWkoDK4MkSoByBAGJQJLAwAeAWABQIUH0HDSoiTLKUaoUggAW+DHorUsAOlABJcQlhUy4KpACeoLJzrI8cCwMGxU1ABVPIiwhESpMZEJQTmR4lxFQaQxWMm4IZABbIlIYKlJkTlDlXHgkNFAAbxVQTIAjfABrAEEC5FZOeIBeUAAGAG5mmSw8WAroSFIqb2GAIjMiIk8VieVJ8Ar01ncAgAoASkaAXxVr3dUwGoQAYWpMHBgCYn1rekZmNg4eUi0Vi2icoBWJCsNBWoA6WE8AHcAiEwmBgTEtDovtDaMZQLM6PEoQZbA5wSk0q5SO4vD4-AEghZoJwLGYEIRwNBoqAzFRwCZCFUIlFMXECdSiAhId8YZgclx0PsiiVqOVOAAaUAFLAsxWgKiC35MFigfC0FKgSAVVDTSyk+W5dB4fplHVVR6gF7xJrKFotEk-HXIRE9PoDUDDcaTAPTWaceaLZYQlmoPBbHYx-KcQ7HPDnK43FQqfY5+IMDDISPJLCIuqoc47UsuUCofAME3Vzi1r3URvF5QV5A2STtPDdXqunZDgDaYlHnTDrrEAF0dm28B3mDZg6HJwN1+2-hg57ulwNV2NQGoZbjYfNrYiENBwEFaojFiZQK08C-4fFKTVCozWfTgfFgLkeT5AUqiAA).

Esto significa que las construcciones en el entorno de ejecución de *JavaScript* como `in` o una simple búsqueda de propiedades aún pueden acceder a un miembro `private` o `protected`:

```ts twoslash
class MySafe {
  private secretKey = 12345;
}
```

```js
// En un archivo JavaScript...
const s = new MySafe();
// Imprimirá 12345
console.log(s.secretKey);
```

`private` también permite el acceso usando notación entre corchetes durante la verificación de tipos. Esto hace que los campos declarados `private` potencialmente sean más fáciles de acceder para cosas como pruebas unitarias, con el inconveniente de que estos campos son *privados suaves* y no imponen estrictamente la privacidad.

```ts twoslash
// @errors: 2341
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();

// No permitido durante la verificación de tipo
console.log(s.secretKey);

// Bien
console.log(s["secretKey"]);
```

A diferencia de *TypeScript*s `private`, los [campos `private`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes/Private_class_fields) (`#`) permanecen privados después de su compilación y no proporcionan las trampillas de escape mencionadas anteriormente, como el acceso a la notación de corchetes, haciéndolas *fuertemente privadas*.

```ts twoslash
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

```ts twoslash
// @target: esnext
// @showEmit
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

Al compilar a ES2021 o menor, *TypeScript* usará *WeakMap*s en lugar de "#".

```ts twoslash
// @target: es2015
// @showEmit
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

Si necesitas proteger los valores de tu clase de actores malintencionados, debes utilizar mecanismos que ofrezcan privacidad estricta en el entorno de ejecución, como cierres, `WeakMaps` o campos privados. Ten en cuenta que estas comprobaciones de privacidad adicionales durante el tiempo de ejecución podrían afectar el rendimiento.

## Miembros estáticos

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes/extends'>Palabras clave extendidas (MDN)</a><br/>
   </p>
</blockquote>

Las clases pueden tener miembros `static`.
Estos miembros no están asociados con una instancia particular de la clase.
Se puede acceder a ellos a través del propio objeto constructor de clases:

```ts twoslash
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
```

Los miembros estáticos también pueden usar los mismos modificadores de visibilidad `public`, `protected` y `private`:

```ts twoslash
// @errors: 2341
class MyClass {
  private static x = 0;
}
console.log(MyClass.x);
```

Los miembros estáticos también se heredan:

```ts twoslash
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

### Nombres estáticos especiales

Generalmente no es seguro/posible redefinir las propiedades del prototipo `Function`.
Debido a que las clases son funciones en sí mismas que se pueden invocar con `new`, ciertos nombres `static` no se pueden usar.
Las propiedades de funciones como `name`, `length` y `call` no son válidas para definir como miembros `static`:

```ts twoslash
// @errors: 2699
class S {
  static name = "S!";
}
```

### ¿Por qué no hay clases estáticas?

*TypeScript* (y *JavaScript*) no tienen una construcción llamada `static class ` de la misma manera que *C#*.

Esas construcciones *sólo* existen porque esos lenguajes obligan a todos los datos y funciones a estar dentro de una clase; debido a que esa restricción no existe en *TypeScript*, no es necesaria.
Una clase con una sola instancia generalmente se representa como un *objeto* normal en *JavaScript*/*TypeScript*.

Por ejemplo, no necesitamos una sintaxis de "clase estática" en *TypeScript* porque un objeto normal (o incluso una función de nivel superior) trabajará igual de bien:

```ts twoslash
// Clase "static" innecesaria
class MyStaticClass {
  static doSomething() {}
}

// Preferred (alternative 1)
function doSomething() {}

// Preferred (alternative 2)
const MyHelperObject = {
  dosomething() {},
};
```

## Bloque`static` en Clases

Los bloques estáticos re permiten escribir una secuencia de declaraciones con su propio alcance que puede acceder a campos privados dentro de la clase contenedora. Esto significa que podemos escribir código de iniciación con todas las capacidades de escribir declaraciones, sin fugas de variables y acceso completo a los componentes internos de nuestra clase.

```ts twoslash
declare function loadLastInstances(): any[]
// ---cut---
class Foo {
    static #count = 0;

    get count() {
        return Foo.#count;
    }

    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
```

## Clases genéricas

Las clases, al igual que las interfaces, pueden ser genéricas.
Cuando se crea una instancia de una clase genérica con `new`, sus parámetros de tipo se infieren de la misma manera que en una llamada de función:

```ts twoslash
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}

const b = new Box("hello!");
//    ^?
```

Las clases pueden usar restricciones genéricas y valores predeterminados de la misma manera que las interfaces.

### Parámetros de tipo en miembros estáticos

Este código no es legal y puede que no sea obvio por qué:

```ts twoslash
// @errors: 2302
class Box<Type> {
  static defaultValue: Type;
}
```

Recuerda que los tipos siempre se borran por completo.
En el entorno de ejecución, solo hay un espacio de propiedad *un* `Box.defaultValue`.
Esto significa que la configuración de `Box<string>.defaultValue` (si eso fuera posible) *también* cambiaría `Box<number>.defaultValue` ⏤ no es bueno.
Los miembros `static` de una clase genérica nunca pueden hacer referencia al tipo de los parámetros de la clase.

## `this` en el entorno de ejecución en clases

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this'>la palabra clave this (MDN)</a><br/>
   </p>
</blockquote>

Es importante recordar que *TypeScript* no cambia el comportamiento en el entorno de ejecución de *JavaScript* y que *JavaScript* es algo famoso por tener algunos comportamientos peculiares en el entorno de ejecución.

El manejo de *JavaScript* de `this` es realmente inusual:

```ts twoslash
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}
const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};

// Imprime "obj", no "MyClass"
console.log(obj.getName());
```

En pocas palabras, de forma predeterminada, el valor de `this` dentro de una función depende de *cómo se llamó a la función*.
En este ejemplo, debido a que la función se llamó a través de la referencia `obj`, su valor de `this` fue `obj` en lugar de la instancia de clase.

¡Esto rara vez es lo que quieres que suceda!
*TypeScript* proporciona algunas formas de mitigar o prevenir este tipo de error.

### Funciones flecha

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions'>Funciones flecha (MDN)</a><br/>
   </p>
</blockquote>

Si tienes una función que a menudo se llamará de una manera que pierde su contexto `this`, puede tener sentido usar una propiedad de la función de flecha en lugar de una definición de método:

```ts twoslash
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}
const c = new MyClass();
const g = c.getName;
// Imprime "MyClass" en lugar de fallar
console.log(g());
```

Esto tiene algunas ventajas y desventajas:

- Se garantiza que el valor de `this` sea correcto en tiempo de ejecución, incluso para el código no verificado con *TypeScript*
- Esto usará más memoria, porque cada instancia de clase tendrá su propia copia de cada función definida de esta manera
- No puedes usar `super.getName` en una clase derivada, porque no hay una entrada en la cadena del prototipo para obtener el método de la clase base.

### Parámetros `this`

En una definición de método o función, un parámetro inicial llamado `this` tiene un significado especial en *TypeScript*.
Estos parámetros se borran durante la compilación:

```ts twoslash
type SomeType = any;
// ---cut---
// Entrada TypeScript con el parámetro 'this'
function fn(this: SomeType, x: number) {
  /* ... */
}
```

```js
// Salida de JavaScript
function fn(x) {
  /* ... */
}
```

*TypeScript* comprueba que la llamada a una función con un parámetro `this` se haga con un contexto correcto.
En lugar de usar una función de flecha, podemos agregar un parámetro `this` a las definiciones del método para hacer cumplir estáticamente que el método se llama correctamente:

```ts twoslash
// @errors: 2684
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// Bien
c.getName();

// Error, fallaría
const g = c.getName;
console.log(g());
```

Este método hace las compensaciones opuestas del enfoque de la función de flecha:

- Las personas que llaman de *JavaScript*pueden seguir usando el método de clase incorrectamente sin darse cuenta
- Solo se asigna una función por definición de clase, en lugar de una por instancia de clase
- Las definiciones de métodos base todavía se pueden llamar a través de `super`.

## Tipos `this`

En las clases, un tipo especial llamado `this` se refiere *dinámicamente* al tipo de la clase actual.
Veamos cómo es útil esto:

<!-- prettier-ignore -->
```ts twoslash
class Box {
  contents: string = "";
  set(value: string) {
//  ^?
    this.contents = value;
    return this;
  }
}
```

Aquí, *TypeScript* infirió que el tipo de retorno de `set` es `this`, en lugar de `Box`.
Ahora hagamos una subclase de `Box`:

```ts twoslash
class Box {
  contents: string = "";
  set(value: string) {
    this.contents = value;
    return this;
  }
}
// ---cut---
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello");
//    ^?
```

También puedes usar `this` en una anotación de tipo en parámetro:

```ts twoslash
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
```

Esto es diferente de escribir `other: Box` -- si tienes una clase derivada, su método `sameAs` ahora solo aceptará otras instancias de esa misma clase derivada:

```ts twoslash
// @errors: 2345
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}

class DerivedBox extends Box {
  otherContent: string = "?";
}

const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
```

### Guardias basados ​​en el tipo de `this`

Puedes usar `this is Type` en la posición de retorno para métodos en clases e interfaces.
Cuando se mezcla con una restricción de tipo (por ejemplo, declaraciones `if`), el tipo del objeto destino se reduciría al `Type` especificado.

<!-- prettier-ignore -->
```ts twoslash
// @strictPropertyInitialization: false
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}

class Directory extends FileSystemObject {
  children: FileSystemObject[];
}

interface Networked {
  host: string;
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content;
// ^?
} else if (fso.isDirectory()) {
  fso.children;
// ^?
} else if (fso.isNetworked()) {
  fso.host;
// ^?
}
```

Un caso de uso común para un tipo de protección basado en este es permitir la validación diferida de un campo en particular. Por ejemplo, este caso elimina un `undefined` del valor contenido dentro del cuadro cuando se ha verificado que `hasValue` es `true`:

```ts twoslash
class Box<T> {
  value?: T;

  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}

const box = new Box();
box.value = "Gameboy";

box.value;
//  ^?

if (box.hasValue()) {
  box.value;
  //  ^?
}
```

## Propiedades de parámetros

*TypeScript* ofrece una sintaxis especial para convertir un parámetro de constructor en una propiedad de clase con el mismo nombre y valor.
Estos se denominan *propiedades de parámetros* y se crean anteponiendo un argumento de constructor con uno de los modificadores de visibilidad `public`, `private`, `protected` o `readonly`.
El campo resultante obtiene esos modificadores:

```ts twoslash
// @errors: 2341
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No se necesita cuerpo
  }
}
const a = new Params(1, 2, 3);
console.log(a.x);
//            ^?
console.log(a.z);
```

## Expresiones `Class`

<blockquote class='bg-reading'>
   <p>Lectura de antecedentes:<br />
   <a href='https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/class'>Expresiones Class (MDN)</a><br/>
   </p>
</blockquote>

Las expresiones `Class` son muy similares a las declaraciones de clase.
La única diferencia real es que las expresiones de clase no necesitan un nombre, aunque podemos referirnos a ellas a través del identificador al que terminaron vinculadas:

```ts twoslash
const someClass = class<Type> {
  content: Type;
  constructor(value: Type) {
    this.content = value;
  }
};

const m = new someClass("Hello, world");
//    ^?
```

## Clases y miembros `abstract`os

Las clases, métodos y campos en *TypeScript* pueden ser `abstract`.

Un *método abstracto* o *campo abstracto* es uno al que no le ha proporcionado una implementación.
Estos miembros deben existir dentro de una *clase abstracta*, que no se puede instanciar directamente.

El papel de las clases abstractas es servir como clase base para las subclases que implementan todos los miembros abstractos.
Cuando una clase no tiene miembros abstractos, se dice que es *concreta*.

Veamos un ejemplo:

```ts twoslash
// @errors: 2511
abstract class Base {
  abstract getName(): string;

  printName() {
    console.log("Hello, " + this.getName());
  }
}

const b = new Base();
```

No podemos instanciar `Base` con `new` porque es abstracto.
En su lugar, necesitamos crear una clase derivada e implementar los miembros abstractos:

```ts twoslash
abstract class Base {
  abstract getName(): string;
  printName() {}
}
// ---cut---
class Derived extends Base {
  getName() {
    return "world";
  }
}

const d = new Derived();
d.printName();
```

Ten en cuenta que si olvidamos implementar los miembros abstractos de la clase base, obtendremos un error:

```ts twoslash
// @errors: 2515
abstract class Base {
  abstract getName(): string;
  printName() {}
}
// ---cut---
class Derived extends Base {
  // olvidé hacer algo
}
```

### Firmas de constructores abstractos

A veces deseas aceptar alguna función constructora de clase que produzca una instancia de una clase que se derive de alguna clase abstracta.

Por ejemplo, es posible que desees escribir este código:

```ts twoslash
// @errors: 2511
abstract class Base {
  abstract getName(): string;
  printName() {}
}
class Derived extends Base {
  getName() {
    return "";
  }
}
// ---cut---
function greet(ctor: typeof Base) {
  const instance = new ctor();
  instance.printName();
}
```

*TypeScript* te está diciendo correctamente que estás intentando crear una instancia de una clase abstracta.
Después de todo, dada la definición de `greet`, es perfectamente legal escribir este código, que terminaría construyendo una clase abstracta:

```ts twoslash
declare const greet: any, Base: any;
// ---cut---
// ¡Mal!
greet(Base);
```

En su lugar, deseas escribir una función que acepte algo con una firma de constructor:

```ts twoslash
// @errors: 2345
abstract class Base {
  abstract getName(): string;
  printName() {}
}
class Derived extends Base {
  getName() {
    return "";
  }
}
// ---cut---
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}
greet(Derived);
greet(Base);
```

Ahora *TypeScript* le dice correctamente qué funciones de constructor de clase se pueden invocar: `Derived` puede porque es concreto, pero `Base` no.

## Relaciones entre clases

En la mayoría de los casos, las clases en *TypeScript* se comparan estructuralmente, al igual que otros tipos.

Por ejemplo, estas dos clases se pueden usar en lugar de la otra porque son idénticas:

```ts twoslash
class Point1 {
  x = 0;
  y = 0;
}

class Point2 {
  x = 0;
  y = 0;
}

// Bien
const p: Point1 = new Point2();
```

De manera similar, existen relaciones de subtipos entre clases incluso si no hay herencia explícita:

```ts twoslash
// @strict: false
class Person {
  name: string;
  age: number;
}

class Employee {
  name: string;
  age: number;
  salary: number;
}

// Bien
const p: Person = new Employee();
```

Esto suena sencillo, pero hay algunos casos que parecen más extraños que otros.

Las clases vacías no tienen miembros.
En un sistema de tipos estructurales, un tipo sin miembros generalmente es un supertipo de cualquier otra cosa.
Entonces, si escribes una clase vacía (¡no lo hagas!), se puede usar cualquier cosa en su lugar:

```ts twoslash
class Empty {}

function fn(x: Empty) {
  // no puedo hacer nada con 'x', así que no lo haré
}

// ¡Todo bien!
fn(window);
fn({});
fn(fn);
```
