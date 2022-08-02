---
title: Referencia JSDoc
layout: docs
permalink: /docs/handbook/jsdoc-supported-types.html
oneline: ¿Qué hace JSDoc con la tecnología de TypeScript para  potenciar JavaScript?
translatable: true
---

La lista a continuación describe qué construcciones son compatibles actualmente
al usar anotaciones *JSDoc* para proporcionar información de tipo en archivos *JavaScript*.

Ten en cuenta que las etiquetas que no se enumeran explícitamente a continuación (como `@async`) aún no son compatibles.

#### Tipos

- [`@type`](#type)
- [`@param`](#param-and-returns) (o [`@arg`](#param-and-returns) o [`@argument`](#param-and-returns))
- [`@returns`](#param-and-returns) (o [`@return`](#param-and-returns))
- [`@typedef`](#typedef-callback-and-param)
- [`@callback`](#typedef-callback-and-param)
- [`@template`](#template)

#### Clases

- [Modificadores de propiedad](#modificadores-de-propiedad) `@public`, `@private`, `@protected`, `@readonly`
- [`@override`](#override)
- [`@extends`](#extends) (o [`@augments`](#extends))
- [`@implements`](#implements)
- [`@class`](#constructor) (o [`@constructor`](#constructor))
- [`@this`](#this)

#### Documentación

Las etiquetas de documentación funcionan tanto en *TypeScript* como en *JavaScript*.

- [`@deprecated`](#deprecated)
- [`@see`](#see)
- [`@link`](#link)

#### Otro

- [`@enum`](#enum)
- [`@author`](#author)
- [Otros patrones admitidos](#otros-patrones-admitidos)
- [Patrones no admitidos](#patrones-no admitidos)
- [Etiquetas no admitidas](#etiquetas-no-admitidas)

El significado suele ser el mismo, o un superconjunto, del significado de la etiqueta dada en [`jsdoc.app`](https://jsdoc.app).
El siguiente código describe las diferencias y ofrece algunos ejemplos de uso de cada etiqueta.

**Nota**: Puedes usar [`playground` para explorar el soporte de *JSDoc*](/play?UseJavaScript=truee=4#example/jsdoc-support).

## Tipos

### `@type`

Puedes hacer referencia a tipos con la etiqueta `@type`. El tipo puede ser:

1. Primitivo, como `string` o `number`.
2. Declarado en una declaración de *TypeScript*, ya sea global o importado.
3. Declarado en una etiqueta *JSDoc* [`@typedef`](#typedef-callback-and-param).

Puedes utilizar la mayoría de la sintaxis de tipo *JSDoc* y cualquier sintaxis de *TypeScript*, desde [la más básica como `string`](/docs/handbook/2/basic-types.html) hasta [la más avanzada, como los tipos condicionales](/docs/handbook/2/conditional-types.html).

```js twoslash
/**
 * @type {string}
 */
var s;

/** @type {Window} */
var win;

/** @type {PromiseLike<string>} */
var promisedString;

// Puedes especificar un elemento HTML con propiedades DOM
/** @type {HTMLElement} */
var myElement = document.querySelector(selector);
element.dataset.myData = "";
```

`@type` puedes especificar un tipo unión ⏤ por ejemplo, algo puede ser una cadena o un booleano.

```js twoslash
/**
 * @type {string | boolean}
 */
var sb;
```

Puedes especificar tipos de arreglos utilizando una variedad de sintaxis:

```js twoslash
/** @type {number[]} */
var ns;
/** @type {Array.<number>} */
var jsdoc;
/** @type {Array<number>} */
var nas;
```

También puedes especificar tipos de objetos literales.
Por ejemplo, un objeto con propiedades 'a' (cadena) y 'b' (número) usa la siguiente sintaxis:

```js twoslash
/** @type {{ a: string, b: number }} */
var var9;
```

Puedes especificar objetos tipo mapa y tipo arreglo utilizando el índice de firmas de números y cadenas, utilizando la sintaxis `JSDoc` estándar o la sintaxis *TypeScript*.

```js twoslash
/**
 * Un objeto similar a un mapa que asigna propiedades arbitrarias de `string` a `number`.
 *
 * @type {Object.<string, number>}
 */
var stringToNumber;

/** @type {Object.<number, object>} */
var arrayLike;
```

Los dos tipos anteriores son equivalentes a los tipos de *TypeScript* `{[x: string]: number }` y `{ [x: number]: any }`. El compilador comprende ambas sintaxis.

Puedes especificar tipos de funciones utilizando la sintaxis *TypeScript* o *Google Closure*:

```js twoslash
/** @type {function(string, boolean): number} Closure syntax */
var sbn;
/** @type {(s: string, b: boolean) => number} TypeScript syntax */
var sbn2;
```

O simplemente puedes usar el tipo `Function` no especificado:

```js twoslash
/** @type {Function} */
var fn7;
/** @type {function} */
var fn6;
```

Otros tipos de `Closure` también funcionan:

```js twoslash
/**
 * @type {*} - puede ser de tipo 'any'
 */
var star;
/**
 * @type {?} - tipo desconocido (igual que 'any')
 */
var question;
```

#### Conversiones

*TypeScript* toma prestada la sintaxis de conversión de *Google Closure*.
Esto te permite convertir tipos a otros tipos agregando una etiqueta `@type` antes de cualquier expresión entre paréntesis.

```js twoslash
/**
 * @type {number | string}
 */
var numberOrString = Math.random() < 0.5 ? "hello" : 100;
var typeAssertedNumber = /** @type {number} */ (numberOrString);
```

Incluso puedes convertir a `const` como *TypeScript*:

```js twoslash
let one = /** @type {const} */(1);
```

#### Importar tipos

Puedes importar declaraciones de otros archivos utilizando tipos `import`ación.
Esta sintaxis es específica de *TypeScript* y difiere del *JSDoc* estándar:

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};

// @filename: main.js
/**
 * @param { import("./types").Pet } p
 */
function walk(p) {
  console.log(`Walking ${p.name}...`);
}
```

los tipos `import`ación se pueden utilizar en declaraciones de alias de tipo:

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};
// @filename: main.js
// ---cut---
/**
 * @typedef { import("./types").Pet } Pet
 */

/**
 * @type {Pet}
 */
var myPet;
myPet.name;
```

La importación de tipos se puede usar para obtener el tipo de un valor desde un módulo si no conoces el tipo, o si tiene un tipo grande que es molesto escribir:

```js twoslash
// @filename: accounts.d.ts
export const userAccount = {
  name: "Name",
  address: "An address",
  postalCode: "",
  country: "",
  planet: "",
  system: "",
  galaxy: "",
  universe: "",
};
// @filename: main.js
// ---cut---
/**
 * @type {typeof import("./accounts").userAccount }
 */
var x = require("./accounts").userAccount;
```

### `@param` r `@returns`

`@param` usa la misma sintaxis de tipo que `@type`, pero agrega un nombre de parámetro.
El parámetro también se puede declarar opcional rodeando el nombre con corchetes:

```js twoslash
// Los parámetros se pueden declarar en una variedad de formas sintácticas
/**
 * @param {string}  p1 - Un parámetro string.
 * @param {string=} p2 - Un parámetro opcional (sintaxis de cierres *Google*)
 * @param {string} [p3] - Otro parámetro opcional (sintaxis JSDoc).
 * @param {string} [p4="test"] ⏤ Un parámetro opcional con un valor predeterminado
 * @return {string} Este es el resultado
 */
function stringsStringStrings(p1, p2, p3, p4) {
  // PENDIENTE
}
```

De igual manera, para el tipo del retorno de una función:

```js twoslash
/**
 * @return {PromiseLike<string>}
 */
function ps() {}

/**
 * @returns {{ a: string, b: number }} - Puede usar '@returns' así como '@return'
 */
function ab() {}
```

### `@typedef`, `@callback` y `@param`

Puedes definir tipos complejos con `@typedef`.
Una sintaxis similar funciona con `@param`.

```js twoslash
/**
 * @typedef {Object} SpecialType ⏤ crea un nuevo tipo llamado `SpecialType`
 * @property {string} prop1 ⏤ una propiedad de cadena de `SpecialType`
 * @property {number} prop2 ⏤ una propiedad numérica de `SpecialType`
 * @property {number=} prop3 ⏤ una propiedad numérica opcional de `SpecialType`
 * @prop {number} [prop4] ⏤ una propiedad numérica opcional de `SpecialType`
 * @prop {number} [prop5=42] ⏤ una propiedad numérica opcional de `SpecialType` con valor predeterminado
 */

/** @type {SpecialType} */
var specialTypeObject;
specialTypeObject.prop3;
```

Puedes utilizar `object` u `Object` en la primera línea.

```js twoslash
/**
 * @typedef {object} SpecialType1 ⏤ crea un nuevo tipo llamado `SpecialType`
 * @property {string} prop1 ⏤ una propiedad de cadena de `SpecialType`
 * @property {number} prop2 ⏤ una propiedad numérica de `SpecialType`
 * @property {number=} prop3 ⏤ una propiedad numérica opcional de `SpecialType`
 */

/** @type {SpecialType1} */
var specialTypeObject1;
```

`@param` permite una sintaxis similar para especificaciones de tipo único.
Ten en cuenta que los nombres de las propiedades anidadas deben tener como prefijo el nombre del parámetro:

```js twoslash
/**
 * @param {Object} options ⏤ La forma es la misma que la de `SpecialType` anterior
 * @param {string} options.prop1
 * @param {number} options.prop2
 * @param {number=} options.prop3
 * @param {number} [options.prop4]
 * @param {number} [options.prop5=42]
 */
function special(options) {
  return (options.prop4 || 1001) + options.prop5;
}
```

`@callback` es similar a `@typedef`, pero especifica un tipo `function` en lugar de un tipo objeto:

```js twoslash
/**
 * @callback Predicate
 * @param {string} data
 * @param {number} [index]
 * @returns {boolean}
 */

/** @type {Predicate} */
const ok = (s) => !(s.length % 2);
```

Por supuesto, cualquiera de estos tipos se puede declarar usando la sintaxis de *TypeScript* en una sola línea `@typedef`:

```js
/** @typedef {{ prop1: string, prop2: string, prop3?: number }} SpecialType */
/** @typedef {(data: string, index?: number) => boolean} Predicate */
```

### `@template`

Puedes declarar parámetros de tipo con la etiqueta `@template`.
Esto te permite crear funciones, clases o tipos que son genéricos:

```js twoslash
/**
 * @template T
 * @param {T} x ⏤ Un parámetro genérico que fluye hasta el tipo de retorno.
 * @returns {T}
 */
function id(x) {
  return x;
}

const a = id("string");
const b = id(123);
const c = id({});
```

Utiliza comas o varias etiquetas para declarar varios parámetros de tipo:

```js
/**
 * @template T,U,V
 * @template W,X
 */
```

También puedes especificar una restricción de tipo antes del nombre del tipo del parámetro.
Solo el primer parámetro de tipo de una lista está restringido:

```js twoslash
/**
 * @template {string} K ⏤ K must be a string or string literal
 * @template {{ serious(): string }} Seriousalizable ⏤ debe tener un método serio
 * @param {K} key
 * @param {Seriousalizable} object
 */
function seriousalize(key, object) {
  // ????
}
```

Finalmente, puedes especificar un parámetro predeterminado para un tipo:

```js twoslash
/** @template [T=object] */
class Cache {
    /** @param {T} initial */
    constructor(T) {
    }
}
let c = new Cache()
```

## Clases

Las clases se pueden declarar como clases `ES6`.

```js twoslash
class C {
  /**
   * @param {number} data
   */
  constructor(data) {
    // se pueden inferir tipos de propiedad
    this.name = "foo";

    // o establecer explícitamente
    /** @type {string | null} */
    this.title = null;

    // o simplemente anotados, si están configurados en otro lugar
    /** @type {number} */
    this.size;

    this.initialize(data); // En caso de error, el iniciador espera una cadena
  }
  /**
   * @param {string} s
   */
  initialize = function (s) {
    this.size = s.length;
  };
}

var c = new C(0);

// C solo se debe llamar con new, pero
// porque es JavaScript, esto está permitido y
// considerado un 'any'.
var result = C(1);
```

También se pueden declarar como funciones constructoras; usa [`@constructor`](#constructor) junto con [`@this`](#this) para esto.

### Modificadores de propiedad
<div id="jsdoc-property-modifiers"></div>


`@public`, `@private`, y `@protected` trabajan exactamente como `public`, `private` y `protected` en *TypeScript*:

```js twoslash
// @errors: 2341
// @ts-check

class Car {
  constructor() {
    /** @private */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

- `@public` siempre está implícito y se puede omitir, pero significa que se puede acceder a una propiedad desde cualquier lugar.
- `@private` significa que una propiedad solo se puede usar dentro de la clase que la contiene.
- `@protected` significa que una propiedad solo se puede usar dentro de la clase contenedora y todas las subclases derivadas, pero no en instancias diferentes de la clase contenedora.

`@public`, `@private` y `@protected` no traban en las funciones constructor.

### `@readonly`

El modificador `@readonly` asegura que una propiedad solo se escriba durante la iniciación.

```js twoslash
// @errors: 2540
// @ts-check

class Car {
  constructor() {
    /** @readonly */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

### `@override`

`@override` funciona de la misma manera que en *TypeScript*; utilízalo en métodos que redefinan un método de una clase base:

```js twoslash
export class C {
  m() { }
}
class D extends C {
  /** @override */
  m() { }
}
```

Establece `noImplicitOverride: true` en `tsconfig` para comprobar las redefiniciones.

### `@extends`

Cuando las clases de *JavaScript* extienden una clase base genérica, no existe una sintaxis de *JavaScript* para pasar un argumento de tipo. La etiqueta `@extends` permite esto:

```js twoslash
/**
 * @template T
 * @extends {Set<T>}
 */
class SortableSet extends Set {
  // ...
}
```

Ten en cuenta que `@extends` solo funciona con clases. Actualmente, no hay forma de que una función constructora extienda una clase.

### `@implements`

De la misma manera, no existe una sintaxis de *JavaScript* para implementar una interfaz *TypeScript*. La etiqueta `@implements` funciona igual que en *TypeScript*:

```js twoslash
/** @implements {Print} */
class TextBook {
  print() {
    // PENDIENTE
  }
}
```

### `@constructor`

El compilador infiere funciones de constructor en función de las asignaciones de esta propiedad, pero puede hacer que la verificación sea más estricta y las sugerencias mejor si agregas una etiqueta `@constructor`:

```js twoslash
// @checkJs
// @errors: 2345 2348
/**
 * @constructor
 * @param {number} data
 */
function C(data) {
  // se pueden inferir tipos de propiedad
  this.name = "foo";

  // o establecer explícitamente
  /** @type {string | null} */
  this.title = null;

  // o simplemente anotados, si están configurados en otro lugar
  /** @type {number} */
  this.size;

  this.initialize(data);
}
/**
 * @param {string} s
 */
C.prototype.initialize = function (s) {
  this.size = s.length;
};

var c = new C(0);
c.size;

var result = C(1);
```

> Nota: Los mensajes de error solo aparecen en las bases de código *JS* con [*JSConfig*](/docs/handbook/tsconfig-json.html) y [`checkJs`](/tsconfig#checkJs) habilitados.

Con `@constructor`, `this` se marca dentro de la función constructora `C`, por lo que obtendrás sugerencias para el método `initialize` y un error si le pasas un número. Tu editor también puede mostrar advertencias si llamas a "C" en lugar de construirlo.

Desafortunadamente, esto significa que las funciones constructor que también son invocables no pueden usar `@constructor`.

### `@this`

El compilador normalmente puede averiguar el tipo de `this` cuando tiene algún contexto con el que trabajar. Cuando no es así, puedes especificar explícitamente el tipo de `this` con `@this`:

```js twoslash
/**
 * @this {HTMLElement}
 * @param {*} e
 */
function callbackForLater(e) {
  this.clientHeight = parseInt(e); // ¡debería estar bien!
}
```

## Documentación

### `@deprecated`
<div id="deprecated-comments"></div>

Cuando una función, método o propiedad está en desuso, puedes informar a los usuarios marcándola con un comentario `/ **@deprecated */` Comentario *JSDoc*. Esa información aparece en listas de compleción y como un diagnóstico de sugerencia que los editores pueden manejar de manera especial. En un editor como *VS Code*, los valores obsoletos se muestran normalmente en un estilo tachado ~~como este~~.

```js twoslash
// @noErrors
/** @deprecated */
const apiV1 = {};
const apiV2 = {};

apiV;
// ^|


```

### `@see`

`@see` te permite enlazar a otros nombres en tu programa:

```ts twoslash
type Box<T> = { t: T }
/** @see Box para detalles de implementación */
type Boxify<T> = { [K in keyof T]: Box<T> };
```

Algunos editores convertirán `Box` en un enlace para que sea más fácil saltar de un lado a otro.

### `@link`

`@link` es como `@see`, excepto que se puede usar dentro de otras etiquetas:

```ts twoslash
type Box<T> = { t: T }
/** @return A {@link Box} que contiene el parámetro. */
function box<U>(u: U): Box<U> {
  return { t: u };
}
```

## Otro

### `@enum`

La etiqueta `@enum` te permite crear un objeto literal cuyos miembros son todos de un tipo específico. A diferencia de la mayoría de los objetos literales en *JavaScript*, no permite otros miembros.
`@enum` está diseñado para ser compatible con la etiqueta `@enum` de *Google Closure*.

```js twoslash
/** @enum {number} */
const JSDocState = {
  BeginningOfLine: 0,
  SawAsterisk: 1,
  SavingComments: 2,
};

JSDocState.SawAsterisk;
```

Ten en cuenta que `@enum` es bastante diferente y mucho más simple que la `enum` de *TypeScript*. Sin embargo, a diferencia de las enumeraciones de *TypeScript*, `@enum` puede tener cualquier tipo:

```js twoslash
/** @enum {function(number): number} */
const MathFuncs = {
  add1: (n) => n + 1,
  id: (n) => -n,
  sub1: (n) => n - 1,
};

MathFuncs.add1;
```

### `@author`

Puedes especificar el autor de un elemento con `@autor`:

```ts twoslash
/**
 * Bienvenido a 'awesome.ts'
 * @author Iam Awesome <i.am.awesome@example.com>
 */
```

Recuerda rodear la dirección de correo electrónico con corchetes angulares.
De lo contrario, `@example` se analizará como una nueva etiqueta.

### Otros patrones admitidos

```js twoslash
class Foo {}
// ---cut---
var someObj = {
  /**
   * @param {string} param1 ⏤ JSDocs en el trabajo de asignaciones de propiedad
   */
  x: function (param1) {},
};

/**
 * Al igual que `jsdocs` en asignaciones de variables
 * @return {Window}
 */
let someFunc = function () {};

/**
 * Y métodos de clase
 * @param {string} greeting El saludo a usar
 */
Foo.prototype.sayHi = (greeting) => console.log("Hi!");

/**
 * Y expresiones de función de flecha
 * @param {number} x ⏤ Un multiplicador
 */
let myArrow = (x) => x * x;

/**
 * Lo cual significa que también funciona para componentes de función en JSX
 * @param {{a: string, b: number}} props - Algún parámetro
 */
var fc = (props) => <div>{props.a.charAt(0)}</div>;

/**
 * Un parámetro puede ser un constructor de clase, utilizando la sintaxis de cierre de Google.
 *
 * @param {{new(...args: any[]): object}} C - La clase para inscribirse
 */
function registerClass(C) {}

/**
 * @param {...string} p1 - Un arg 'rest' (arreglo) de cadenas. (tratado como 'any')
 */
function fn10(p1) {}

/**
 * @param {...string} p1 - Un arg 'rest' (arreglo) de cadenas. (tratado como 'any')
 */
function fn9(p1) {
  return p1.join();
}
```

### Patrones no admitidos

El posfijo es igual a un tipo de propiedad en un tipo de objeto literal no especifica una propiedad opcional:

```js twoslash
/**
 * @type {{ a: string, b: number= }}
 */
var wrong;
/**
 * En su lugar, usa la consulta posfija en el nombre de la propiedad:
 * @type {{ a: string, b?: number }}
 */
var right;
```

Los tipos que aceptan valores `null` solo tienen significado si [`strictNullChecks`](/tsconfig#strictNullChecks) está activado:

```js twoslash
/**
 * @type {?number}
 * Con strictNullChecks: true  -- number | null
 * Con strictNullChecks: false -- number
 */
var nullable;
```

La sintaxis nativa de *TypeScript* es un tipo unión:

```js twoslash
/**
 * @type {number | null}
 * Con strictNullChecks: true  -- number | null
 * Con strictNullChecks: false -- number
 */
var unionNullable;
```

Los tipos que no aceptan valores NULL no tienen significado y se tratan como su tipo original:

```js twoslash
/**
 * @type {!number}
 * Solo tiene tipo number
 */
var normal;
```

A diferencia del sistema de tipos de *JSDoc*, *TypeScript* solo te permite marcar tipos que contienen `null` o `not`.
No hay nulabilidad explícita ⏤ si `strictNullChecks` está activado, entonces `number` no acepta valores `NULL`.
Si está desactivado, entonces `number` es nulable.

### Etiquetas no admitidas

*TypeScript* ignora las etiquetas *JSDoc* no admitidas.

Las siguientes etiquetas tienen incidencias abiertas para admitirlas:

- `@const` ([issue #19672](https://github.com/Microsoft/TypeScript/issues/19672))
- `@inheritdoc` ([issue #23215](https://github.com/Microsoft/TypeScript/issues/23215))
- `@memberof` ([issue #7237](https://github.com/Microsoft/TypeScript/issues/7237))
- `@yields` ([issue #23857](https://github.com/Microsoft/TypeScript/issues/23857))
