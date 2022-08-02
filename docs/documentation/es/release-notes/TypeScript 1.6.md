---
title: TypeScript 1.6
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-6.html
oneline: Notas de la versión de TypeScript 1.6
---

## Soporte *JSX*

*JSX* es una sintaxis similar a *XML* incrustable.
Está destinada a transformarse en *JavaScript* válido, pero la semántica de esa transformación es específica de la implementación.
*JSX* se hizo popular con la biblioteca *React*, pero desde entonces ha visto otras aplicaciones.
*TypeScript 1.6* admite la incrustación, la verificación de tipos y, opcionalmente, la compilación de *JSX* directamente en *JavaScript*.

#### Nueva extensión de archivo `.tsx` y el operador `as`

*TypeScript 1.6* introduce una nueva extensión de archivo `.tsx`.
Esta extensión hace dos cosas: habilita *JSX* dentro de los archivos de *TypeScript*, y hace que el nuevo operador `as` sea la forma predeterminada de emitir (eliminando cualquier ambigüedad entre las expresiones *JSX* y el operador de conversión de prefijos de *TypeScript*).
Por ejemplo:

```ts
var x = <any>foo;
// es equivalente a:
var x = foo as any;
```

#### Usar *React*

Para usar el soporte *JSX* con *React*, debes usar [tipado *React*](https://github.com/borisyankov/DefinitelyTyped/tree/master/react). Esta tipificación define el espacio de nombres `JSX` para que *TypeScript* pueda verificar correctamente las expresiones *JSX* para *React+. Por ejemplo:

```ts
/// <reference path="react.d.ts" />

interface Props {
  name: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.name}</span>;
  }
}

<MyComponent name="bar" />; // Bien
<MyComponent name={0} />; // error, `name` is not a number
```

#### Usar otros marcos *JSX*

Los nombres y propiedades de los elementos *JSX* se validan con el espacio de nombres `JSX`.
Consulta la página *wiki* de [[*JSX*]] para definir el espacio de nombres `JSX` para tu marco.

#### Generar salida

*TypeScript* se envía con dos modos *JSX*: `preserve` y `react`.

- El modo `preserve` mantendrá las expresiones *JSX* como parte de la salida para ser consumidas por otro paso de transformación. *Adicionalmente, la salida tendrá una extensión de archivo `.jsx`*.
- El modo `react` emitirá `React.createElement`, no necesita pasar por una transformación *JSX* antes de su uso, y la salida tendrá una extensión de archivo `.js`.

Consulta la página *wiki* de [[*JSX*]] para obtener más información sobre el uso de *JSX* en *TypeScript*.

## Intersección de tipos

*TypeScript 1.6* presenta la intersección de tipos, el complemento lógico de los tipos unión.
Un tipo unión `A | B` representa una entidad que es de tipo `A` o de tipo `B`, mientras que una intersección de tipo `A & B` representa una entidad que es tanto de tipo `A` como de tipo `B`.

##### Ejemplo

```ts
function extend<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in primera) {
    result[id] = first[id];
  }
  for (let id in segunda) {
    if (!result.hasOwnProperty(id)) {
      result[id] = second[id];
    }
  }
  return result;
}

var x = extend({ a: "hello" }, { b: 42 });
var s = x.a;
var n = x.b;
```

```ts
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
  name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

```ts
interface A {
  a: string;
}
interface B {
  b: string;
}
interface C {
  c: string;
}

var abc: A & B & C;
abc.a = "hello";
abc.b = "hello";
abc.c = "hello";
```

Consulta la [incidencia #1256](https://github.com/Microsoft/TypeScript/issues/1256) para obtener más información.

## Declaraciones de tipo local

Las declaraciones locales de clase, interfaz, enumeración y alias de tipo ahora pueden aparecer dentro de las declaraciones de función. Los tipos locales tienen un ámbito de bloque, similar a las variables declaradas con `let` y `const`. Por ejemplo:

```ts
function f() {
  if (true) {
    interface T {
      x: number;
    }
    let v: T;
    v.x = 5;
  } else {
    interface T {
      x: string;
    }
    let v: T;
    v.x = "hello";
  }
}
```

El tipo de retorno inferido de una función puede ser un tipo declarado localmente dentro de la función. No es posible que los llamadores de la función hagan referencia a un tipo local de este tipo, pero, por supuesto, puede coincidir estructuralmente. Por ejemplo:

```ts
interface Point {
  x: number;
  y: number;
}

function getPointFactory(x: number, y: number) {
  class P {
    x = x;
    y = y;
  }
  return P;
}

var PointZero = getPointFactory(0, 0);
var PointOne = getPointFactory(1, 1);
var p1 = new PointZero();
var p2 = new PointZero();
var p3 = new PointOne();
```

Los tipos locales pueden hacer referencia a parámetros de tipo envolvente y la clase local y las interfaces pueden ser en sí mismas genéricas. Por ejemplo:

```ts
function f3() {
  function f<X, Y>(x: X, y: Y) {
    class C {
      public x = x;
      public y = y;
    }
    return C;
  }
  let C = f(10, "hello");
  let v = new C();
  let x = v.x; // number
  let y = v.y; // string
}
```

## Expresiones `Class`

*TypeScript 1.6* agrega soporte para expresiones de clase *ES6*. En una expresión de clase, el nombre de la clase es opcional y, si se especifica, solo está dentro del alcance de la expresión de clase en sí. Es similar al nombre opcional de una expresión de función. No es posible hacer referencia al tipo de instancia de clase de una expresión de clase fuera de la expresión de clase, pero, por supuesto, el tipo puede coincidir estructuralmente. Por ejemplo:

```ts
let Point = class {
  constructor(public x: number, public y: number) {}
  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
};
var p = new Point(3, 4); // p tiene un tipo de clase anónimo
console.log(p.length());
```

## Extender expresiones

*TypeScript 1.6* agrega soporte para clases que extienden expresiones arbitrarias que calculan una función constructora. Esto significa que los tipos integrados ahora se pueden extender en declaraciones de clases.

La cláusula `extends` de una clase requería previamente que se especificara una referencia de tipo. Ahora acepta una expresión seguida opcionalmente por una lista de argumentos de tipo. El tipo de la expresión debe ser un tipo de función constructora con al menos una firma de construcción que tenga el mismo número de parámetros de tipo que el número de argumentos de tipo especificado en la cláusula `extends`. El tipo de retorno de la(s) firma(s) del constructor coincidente es el tipo base del cual hereda el tipo de instancia de clase. Efectivamente, esto permite que tanto clases reales como expresiones "similares a clases" se especifiquen en la cláusula `extends`.

Algunos ejemplos:

```ts
// Amplía los tipos integrados

class MyArray extends Array<number> {}
class MyError extends Error {}

// Ampliar la clase base calculada

class ThingA {
  getGreeting() {
    return "Hello from A";
  }
}

class ThingB {
  getGreeting() {
    return "Hello from B";
  }
}

interface Greeter {
  getGreeting(): string;
}

interface GreeterConstructor {
  new (): Greeter;
}

function getGreeterBase(): GreeterConstructor {
  return Math.random() >= 0.5 ? ThingA : ThingB;
}

class Test extends getGreeterBase() {
  sayHello() {
    console.log(this.getGreeting());
  }
}
```

## clases y métodos `abstract`os

*TypeScript 1.6* agrega soporte para la palabra clave `abstract` para las clases y sus métodos. Una clase `abstract`a puede tener métodos sin implementación y no se puede construir.

##### Ejemplos

```ts
abstract class Base {
  abstract getThing(): string;
  getOtherThing() {
    return "hello";
  }
}

let x = new Base(); // Error, 'Base' es abstracta

// Error, debe ser 'abstract'a o implementar el 'getThing' concreto
class Derived1 extends Base {}

class Derivada2 extends Base {
  getThing() {
    return "hello";
  }
  foo() {
    super.getThing(); // Error: no puede invocar miembros abstractos a través de 'super'
  }
}

var x = new Derived2(); // Bien
var y: Base = new Derived2(); // También está bien
y.getThing(); // Bien
y.getOtherThing(); // Bien
```

## Alias ​​de tipo genérico

Con *TypeScript 1.6*, los alias de tipo pueden ser genéricos. Por ejemplo:

```ts
type Lazy<T> = T | (() => T);

var s: Lazy<string>;
s = "eager";
s = () => "lazy";

interface Tuple<A, B> {
  a: A;
  b: B;
}

type Pair<T> = Tuple<T, T>;
```

## Comprobación de asignación literal de objetos más estricta

*TypeScript 1.6* impone comprobaciones de asignación literal de objetos más estrictas con el fin de detectar propiedades en exceso o mal escritas. Específicamente, cuando se asigna un nuevo objeto literal a una variable o se pasa como argumento para un tipo de destino no vacío, es un error que el literal de objeto especifique propiedades que no existen en el tipo de destino.

##### Ejemplos

```ts
var x: { foo: number };
x = { foo: 1, baz: 2 }; // Error, exceso de propiedad `baz`

var y: { foo: number; bar?: number };
y = { foo: 1, baz: 2 }; // Error, exceso o propiedad mal escrita `baz`
```

Un tipo puede incluir un índice de firma para indicar explícitamente que se permiten propiedades en exceso:

```ts
var x: { foo: number; [x: string]: any };
x = { foo: 1, baz: 2 }; // Bien, `baz` coincide con el índice de firma
```

## Generadores *ES6*

*TypeScript 1.6* agrega soporte para generadores cuando apunta a *ES6*.

Una función generadora puede tener una anotación de tipo de retorno, al igual que una función. La anotación representa el tipo de generador devuelto por la función. Aquí tienes un ejemplo:

```ts
function* g(): Iterable<string> {
  for (var i = 0; i < 100; i++) {
    yield ""; // string es asignable a string
  }
  yield* otherStringGenerator(); // otherStringGenerator debe ser iterable y el tipo de elemento asignable a string
}
```

Una función generadora sin anotación de tipo puede tener la anotación de tipo inferida.
Entonces, en el siguiente caso, el tipo se deducirá de las declaraciones de rendimiento:

```ts
function* g() {
  for (var i = 0; i < 100; i++) {
    yield ""; // infer string
  }
  yield* otherStringGenerator(); // infer element type of otherStringGenerator
}
```

## Soporte experimental para funciones `async`

*TypeScript 1.6* introduce soporte experimental de funciones `async` cuando se dirige a *ES6*.
Se espera que las funciones asincrónicas invoquen una operación asincrónica y esperen su resultado sin bloquear la ejecución normal del programa.
Esto se logró mediante el uso de una implementación de `Promise` compatible con *ES6* y la transposición del cuerpo de la función a una forma compatible para reanudar la ejecución cuando se complete la operación asincrónica esperada.

Una *función asíncrona* es una función o método que ha sido prefijado con el modificador `async`. Este modificador informa al compilador que se requiere la transposición del cuerpo de la función y que la palabra clave `await` debe tratarse como una expresión unaria en lugar de un identificador.
Una *Función asincrónica* debe proporcionar una anotación de tipo de retorno que apunte a un tipo de `Promise` compatible. La inferencia de tipo de retorno solo se puede utilizar si hay un tipo de `Promise` compatible y definido globalmente.

##### Ejemplo

```ts
var p: Promise<number> = /* ... */;
async function fn(): Promise<number> {
  var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
  return 1 + i;
}

var a = async (): Promise<number> => 1 + await p; // suspende la ejecución.
var a = async () => 1 + await p; // suspende la ejecución. el tipo de retorno se infiere como "Promise<number>" cuando se compila con --target ES6
var fe = async function(): Promise<number> {
  var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
  return 1 + i;
}

class C {
  async m(): Promise<number> {
    var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
    return 1 + i;
  }

  async get p(): Promise<number> {
    var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
    return 1 + i;
  }
}
```

## Construcciones nocturnas

Si bien no es estrictamente un cambio de lenguaje, las compilaciones nocturnas ahora están disponibles mediante la instalación con el siguiente comando:

```shell
npm install -g typescript@next
```

## Ajustes en la lógica de resolución del módulo

A partir de la versión 1.6, el compilador de *TypeScript* utilizará un conjunto diferente de reglas para resolver los nombres de los módulos cuando se dirija a 'commonjs'.
Estas [reglas](https://github.com/Microsoft/TypeScript/issues/2338) intentaron modelar el procedimiento de búsqueda de módulos utilizado por *Node*.
Esto significa efectivamente que los módulos de `node` pueden incluir información sobre sus tipificaciones y el compilador de *TypeScript* podrá encontrarla.
Sin embargo, el usuario puede redefinir las reglas de resolución del módulo elegidas por el compilador usando la opción de línea de comando [`moduleResolution`](/tsconfig#moduleResolution). Los valores posibles son:

- `'classic'` ⏤ reglas de resolución del módulo utilizadas por el compilador *TypeScript* anterior a 1.6
- `'node'` ⏤ resolución de módulo similar a `node`

## Fusión de clase ambiental y declaración de interfaz

El lado de la instancia de una declaración de clase ambiental se puede extender usando una declaración de interfaz. El constructor de objetos de la clase no está modificado.
Por ejemplo:

```ts
declare class Foo {
  public x: number;
}

interface Foo {
  y: string;
}

function bar(foo: Foo) {
  foo.x = 1; // Bien, declarado en la clase Foo
  foo.y = "1"; // Bien, declarado en la interfaz Foo
}
```

## Funciones protectoras de tipo definidas por el usuario

*TypeScript 1.6* agrega una nueva forma de limitar un tipo de variable dentro de un bloque `if`, además de `typeof` e `instanceof`.
Una función protectora de tipo definida por el usuario es aquella con una anotación de tipo de retorno de la forma `x is T`, donde `x` es un parámetro declarado en la firma y `T` es cualquier tipo.
Cuando se invoca una función protectora de tipo definida por el usuario en una variable en un bloque `if`, el tipo de la variable se reducirá a `T`.

##### Ejemplos

```ts
function isCat(a: any): a is Cat {
  return a.name === "kitty";
}

var x: Cat | Dog;
if (isCat(x)) {
  x.meow(); // Bien, x es Cat en este bloque
}
```

## Soporte de propiedad `exclude` en `tsconfig.json`

Un archivo `tsconfig.json` que no especifica una propiedad de archivos (y por lo tanto hace referencia implícitamente a todos los archivos `\*.ts` en todos los subdirectorios) ahora puede contener una propiedad de exclusión que especifica una lista de archivos y/o directorios para excluir de la compilación.
La propiedad de exclusión debe ser un arreglo de cadenas, cada una de las cuales especifica un nombre de archivo o directorio en relación con la ubicación del archivo `tsconfig.json`.
Por ejemplo:

```json tsconfig
{
  "compilerOptions": {
    "out": "test.js"
  },
  "exclude": ["node_modules", "test.ts", "utils/t2.ts"]
}
```

La lista `exclude` no admite tarjetas comodines. Simplemente debe ser una lista de archivos y/o directorios.

## Opción de línea de comando `--init`

Ejecuta `tsc --init` en un directorio para crear un `tsconfig.json` inicial en este directorio con los valores predeterminados.
Opcionalmente, pasa los argumentos de la línea de comandos junto con `--init` para que se almacenen en tu `tsconfig.json` inicial en el momento de la creación.
