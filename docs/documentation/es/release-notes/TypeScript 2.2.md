---
title: TypeScript 2.2
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-2.html
oneline: Notas de la versión de TypeScript 2.2
---

## Soporte para clases mixtas

*TypeScript 2.2* agrega soporte para el patrón de clase mixin *ECMAScript 2015* (ve la [Descripción MDN de Mixin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes#Mix-ins) y [Mixins "Real" con Clases *JavaScript*](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) para obtener más detalles), así como reglas para combinar firmas de construcción mixin con firmas de construcción regulares en tipos de intersección.

##### Primero algo de terminología

Un **tipo de constructor mixin** se refiere a un tipo que tiene una única firma de construcción con un único argumento `rest` de tipo `any[]` y un tipo de retorno similar a un objeto. Por ejemplo, dado un tipo de objeto `X`, `new (...args: any[]) => X` es un tipo de constructor mixin con un tipo de instancia `X`.

Una **clase mixin** es una declaración de clase o expresión que `extends` una expresión de un tipo de parámetro de tipo. Las siguientes reglas se aplican a las declaraciones de clases mixtas:

- El tipo de parámetro de tipo de la expresión `extends` se debe limitar a un tipo de constructor mixin.
- El constructor de una clase mixin (si lo hay) debe tener un único parámetro `rest` de tipo `any[]` y debe usar el operador de propagación para pasar esos parámetros como argumentos en una llamada a `super(... args)`.

Dada una expresión `Base` de un tipo paramétrico `T` con una restricción `X`, una clase mixin `class C extends Base {...}` se procesa como si `Base` tuviera el tipo `X` y el tipo resultante es la intersección `typeof C & T`.
En otras palabras, una clase mixin se representa como una intersección entre el tipo de constructor de la clase mixin y el tipo de constructor de la clase base paramétrica.

Al obtener las firmas de construcción de un tipo de intersección que contiene tipos de constructor mixin, las firmas de construcción mixin se descartan y sus tipos de instancia se mezclan con los tipos de retorno de las otras firmas de construcción en el tipo de intersección.
Por ejemplo, el tipo de intersección `{new(...args: any[]) => A } & { new(s: string) => B }`tiene una única firma de construcción `new(s: string) => A & B`.

##### Poner todas las reglas anteriores juntas en un ejemplo:

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

class Person {
  constructor(public name: string) {}
}

type Constructor<T> = new (...args: any[]) => T;

function Tagged<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    _tag: string;
    constructor(...args: any[]) {
      super(...args);
      this._tag = "";
    }
  };
}

const TaggedPoint = Tagged(Point);

let point = new TaggedPoint(10, 20);
point._tag = "hello";

class Customer extends Tagged(Person) {
  accountBalance: number;
}

let customer = new Customer("Joe");
customer._tag = "test";
customer.accountBalance = 0;
```

Las clases de mezcla pueden restringir los tipos de clases en las que se pueden mezclar especificando un tipo de retorno de firma de construcción en la restricción para el parámetro de tipo.
Por ejemplo, la siguiente función `WithLocation` implementa una fábrica de subclase que agrega un método `getLocation` a cualquier clase que satisfaga la interfaz `Point` (es decir, que tenga propiedades `x` e `y` de tipo `number`).

```ts
interface Point {
  x: number;
  y: number;
}

const WithLocation = <T extends Constructor<Point>>(Base: T) =>
  class extends Base {
    getLocation(): [number, number] {
      return [this.x, this.y];
    }
  };
```

## Tipo `object`

*TypeScript* no tiene un tipo que represente el tipo no primitivo, es decir, cualquier cosa que no sea `number`, `string`, `boolean`, `symbol`, `null` o `undefined`. Introduce el nuevo tipo `object`.

Con el tipo `object`, las *API*s como `Object.create` se pueden representar mejor. Por ejemplo:

```ts
declare function create(o: object | null): void;

create({ prop: 0 }); // Bien
create(null); // Bien

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

## Soporte para `new.target`

La metapropiedad `new.target` es una nueva sintaxis introducida en *ES2015*.
Cuando se crea una instancia de un constructor a través de `new`, el valor de `new.target` se establece como una referencia a la función del constructor utilizada inicialmente para asignar la instancia.
Si se llama a una función en lugar de construirla a través de `new`, `new.target` se establece en `undefined`.

`new.target` es útil cuando `Object.setPrototypeOf` o `__proto__` se deben configurar en un constructor de clases. Uno de esos casos de uso es heredar de `Error` en *NodeJS v4* y superior.

##### Ejemplo

```ts
class CustomError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' rompe la cadena del prototipo aquí
    Object.setPrototypeOf(this, new.target.prototype); // restaura la cadena de prototipos
  }
}
```

Esto da como resultado el *JS* generado

```js
var CustomError = (function(_super) {
  __extends(CustomError, _super);
  function CustomError() {
    var _newTarget = this.constructor;
    var _this = _super.apply(this, arguments); // 'Error' rompe la cadena del prototipo aquí
    _this.__proto__ = _newTarget.prototype; // restaura la cadena de prototipos
    return _this;
  }
  return CustomError;
})(Error);
```

`new.target` también es útil para escribir funciones construibles, por ejemplo:

```ts
function f() {
  if (new.target) {
    /* llamado a través de 'new' */
  }
}
```

Lo que se traduce en:

```js
function f() {
  var _newTarget = this && this instanceof f ? this.constructor : void 0;
  if (_newTarget) {
    /* llamado a través de 'new' */
  }
}
```

## Mejor comprobación de `null`/`undefined` en operandos de expresiones

*TypeScript 2.2* mejora la comprobación de operandos que aceptan valores `NULL` en expresiones. Específicamente, estos ahora están marcados como errores:

- Si cualquiera de los operandos de un operador `+` es anulable, y ninguno de los operandos es de tipo `any` o `string`.
- Si cualquiera de los operandos de un `-`, `*`, `**`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, o el operador `^` es anulable.
- Si cualquiera de los operandos de un operador `<`, `>`, `<=`, `>=` o `in` es anulable.
- Si el operando derecho de un operador `instanceof` es anulable.
- Si el operando de un operador unario `+`, `-`, `~`, `++` o `--` es anulable.

Un operando se considera anulable si el tipo del operando es `null` o `undefined` o un tipo unión que incluye `null` o `undefined`.
Ten en cuenta que el caso del tipo unión solo se produce en el modo [`strictNullChecks`](/tsconfig#strictNullChecks) porque `null` y `undefined` desaparecen de las uniones en el modo de comprobación de tipo clásico.

## Propiedad punteada para tipos con índice de firmas de cadena

Los tipos con un índice de firma de cadena se pueden indexar usando la notación `[]`, pero no se les permitió usar el `.`.
A partir de *TypeScript 2.2* se debe permitir el uso de cualquiera.

```ts
interface StringMap<T> {
  [x: string]: T;
}

const map: StringMap<number>;

map["prop1"] = 1;
map.prop2 = 2;
```

Esto solo se aplica a los tipos con un índice de firma de cadena *explicito*.
Sigue siendo un error acceder a propiedades desconocidas en un tipo utilizando la notación `.`.

## Soporte para el operador de propagación en elementos *JSX* secundarios

*TypeScript 2.2* agrega soporte para usar `spread` en un elemento *JSX* secundario.
Consulta [`facebook/jsx#57`](https://github.com/facebook/jsx/issues/57) para obtener más detalles.

##### Ejemplo

```ts
function Todo(prop: { key: number; todo: string }) {
  return <div>{prop.key.toString() + prop.todo}</div>;
}

function TodoList({ todos }: TodoListProps) {
  return (
    <div>{...todos.map(todo => <Todo key={todo.id} todo={todo.todo} />)}</div>
  );
}

let x: TodoListProps;

<TodoList {...x} />;
```

## Nuevo `jsx: react-native`

La canalización de compilación nativa de *React* espera que todos los archivos tengan extensiones `.js` incluso si el archivo contiene sintaxis *JSX*.
El nuevo valor de [`jsx`](/tsconfig#jsx) `react-native` mantendrá la sintaxis *JSX* en el archivo de salida, pero le dará una extensión `.js`.
