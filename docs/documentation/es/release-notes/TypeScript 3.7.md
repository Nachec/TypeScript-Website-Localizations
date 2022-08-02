---
title: TypeScript 3.7
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-7.html
oneline: Notas de la versión de TypeScript 3.7
---

## Encadenamiento opcional

[*Playground*](/play/#example/optional-chaining)

El encadenamiento opcional es la [incidencia #16](https://github.com/microsoft/TypeScript/issues/16) en nuestro rastreador de incidencias. Para el contexto, ha habido más de 23,000 incidencias en el rastreador de incidencias de *TypeScript* desde entonces.

En esencia, el encadenamiento opcional nos permite escribir código donde *TypeScript* puede detener inmediatamente la ejecución de algunas expresiones si nos encontramos con un `null` o un `undefined`.
La estrella del espectáculo en el encadenamiento opcional es el nuevo operador `? .` para *accesos a propiedad opcionales*.
Cuando escribimos código como

```ts
let x = foo?.bar.baz();
```

esta es una forma de decir que cuando se define `foo`, se calculará `foo.bar.baz()`; pero cuando `foo` es `null` o `undefined`, detenga lo que estamos haciendo y devuelva `undefined`".

Con toda claridad, ese fragmento de código es lo mismo que escribir lo siguiente.

```ts
let x = foo === null || foo === undefined ? undefined : foo.bar.baz();
```

Ten en cuenta que si `bar` es `null` o `undefined`, nuestro código seguirá mostrando un error al acceder a `baz`.
Del mismo modo, si `baz` es `null` o `undefined`, encontraremos un error en el sitio de la llamada.
`? .` solo comprueba si el valor de la *izquierda* es `null` o `undefined` ⏤ ninguna de las propiedades posteriores.

Es posible que te encuentres usando `? .` para reemplazar una gran cantidad de código que realiza comprobaciones repetitivas de nulidad usando el operador `&&`.

```ts
// Antes
if (foo && foo.bar && foo.bar.baz) {
  // ...
}

// Después
if (foo?.bar?.baz) {
  // ...
}
```

Ten en cuenta que `? .` actúa de manera diferente a las operaciones `&&` ya que `&&` actuará especialmente en valores "falsos" (por ejemplo, la cadena vacía, `0`, `NaN` y, bueno, `false`) , pero esta es una característica intencionada del constructor.
No produce un cortocircuito en datos válidos como `0` o cadenas vacías.

El encadenamiento opcional también incluye otras dos operaciones.
Primero está el *acceso de elemento opcional* que actúa de manera similar a los accesos de propiedad opcionales, pero nos permite acceder a propiedades que no son identificadores (por ejemplo, cadenas arbitrarias, números y símbolos):

```ts
/**
 * Obtiene el primer elemento del arreglo si tenemos un arreglo.
 * De lo contrario, devuelve undefined.
 */
function tryGetFirstElement<T>(arr?: T[]) {
  return arr?.[0];
  // equivalente a
  //   return (arr === null || arr === undefined) ?
  //       undefined :
  //       arr[0];
}
```

También existe la *llamada opcional*, que nos permite llamar condicionalmente expresiones si no son `null` o `undefined`.

```ts
async function makeRequest(url: string, log?: (msg: string) => void) {
  log?.(`Request started at ${new Date().toISOString()}`);
  // aproximadamente equivalente a
  //   if (log != null) {
  //       log(`Request started at ${new Date().toISOString()}`);
  //   }

  const result = (await fetch(url)).json();

  log?.(`Request finished at ${new Date().toISOString()}`);

  return result;
}
```

El comportamiento de "cortocircuito" que tienen las cadenas opcionales es accesos limitados a propiedades, llamadas, accesos a elementos ⏤ no se expande más allá de estas expresiones.
En otras palabras,

```ts
let result = foo?.bar / someComputation();
```

no detiene la división o la llamada a `someComputation()`.
Es equivalente a

```ts
let temp = foo === null || foo === undefined ? undefined : foo.bar;

let result = temp / someComputation();
```

Eso podría resultar en la división de `undefined`, razón por la cual en [`strictNullChecks`](/tsconfig#strictNullChecks), lo siguiente es un error.

```ts
function barPercentage(foo?: { bar: number }) {
  return foo?.bar / 100;
  //     ~~~~~~~~
  // Error: Es posible que el objeto no esté definido.
}
```

Para obtener más detalles, puedes [leer sobre la propuesta](https://github.com/tc39/proposal-optional-chaining/) y [ver la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/33294).

## Fusión nula

[*Playground*](/play/#example/nullish-coalescing)

El *operador coalescente nulo* es otra próxima característica de *ECMAScript* que va de la mano con el encadenamiento opcional, y en la que nuestro equipo ha estado involucrado en promover en *TC39*.

Puedes pensar en esta característica ⏤ el operador `??` ⏤ como una forma de "retroceder" a un valor predeterminado cuando se trata de `null` o `undefined`.
Cuando escribimos código como

```ts
let x = foo ?? bar();
```

esta es una nueva forma de decir que el valor `foo` se usará cuando esté "presente ";
pero cuando sea `null` o `undefined`, calcula `bar()` en su lugar.

Nuevamente, el código anterior es equivalente al siguiente.

```ts
let x = foo !== null && foo !== undefined ? foo : bar();
```

El operador `??` puede reemplazar los usos de `||` cuando se intenta utilizar un valor predeterminado.
Por ejemplo, el siguiente fragmento de código intenta recuperar el volumen que se guardó por última vez en [`localStorage`](https://developer.mozilla.org/docs/Web/API/Window/localStorage) (si alguna vez lo fue);
sin embargo, tiene un error porque usa `||`.

```ts
function initializeAudio() {
  let volume = localStorage.volume || 0.5;

  // ...
}
```

Cuando `localStorage.volume` se establece en `0`, la página establecerá el volumen en `0.5`, lo cual no es intencionado.
`??` evita que algunos comportamientos no deseados de `0`, `NaN` y `""` sean tratados como valores falsos.

¡Debemos un gran agradecimiento a los miembros de la comunidad [Wenlu Wang](https://github.com/Kingwl) y [Titian Cernicova Dragomir](https://github.com/dragomirtitian) por implementar esta característica!
Para obtener más detalles, [consulta tu solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32883) y [el repositorio de propuestas de fusión `null`](https://github.com/tc39/proposal-nullish-coalescing/).

## Funciones de aserción

[`Playground`](/play/#example/assertion-functions)

Hay un conjunto específico de funciones que "arrojan" un error (`throw`) si sucede algo inesperado.
Se llaman funciones de "aserción".
Como ejemplo, *Node.js* tiene una función dedicada para esto llamada `assert`.

```js
assert(someValue === 42);
```

En este ejemplo, si `someValue` no es igual a `42`, entonces `assert` arrojará un `AssertionError`.

Las aserciones en *JavaScript* se utilizan a menudo para evitar que se pasen tipos incorrectos.
Por ejemplo:

```js
function multiply(x, y) {
  assert(typeof x === "number");
  assert(typeof y === "number");

  return x * y;
}
```

Desafortunadamente, en *TypeScript*, estas comprobaciones nunca pudieron codificarse correctamente.
En el caso del código tipado débilmente, esto significaba que *TypeScript* verificaba menos y, en el caso de un código ligeramente conservador, a menudo obligaba a los usuarios a utilizar aserciones de tipo.

```ts
function yell(str) {
  assert(typeof str === "string");

  return str.toUppercase();
  // Oops! Escribimos mal 'toUpperCase'.
  // ¡Sería genial si TypeScript todavía captara esto!
}
```

La alternativa era, en cambio, reescribir el código para que el lenguaje lo pudiera analizar, pero esto no es conveniente.

```ts
function yell(str) {
  if (typeof str !== "string") {
    throw new TypeError("str should have been a string.");
  }
  // ¡Error detectado!
  return str.toUppercase();
}
```

En última instancia, el objetivo de *TypeScript* es escribir las construcciones *JavaScript* existentes de la manera menos disruptiva.
Por esa razón, *TypeScript 3.7* introduce un nuevo concepto llamado "firmas de aserción" que modelan estas funciones de aserción.

El primer tipo de firma de aserción modela la forma en que trabaja la función `assert` de *Node*.
Asegura que cualquier condición que se esté verificando debe ser verdadera para el resto del alcance contenedor.

```ts
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg);
  }
}
```

`asserts condition` dice que cualquier cosa que se pase al parámetro `condition` debe ser `true` si el `assert` regresa (porque de lo contrario arrojaría un error).
Eso significa que para el resto del alcance, esa condición debe ser veraz.
Como ejemplo, el uso de esta función de aserción significa que *hacemos* captar nuestro ejemplo original de `yell`.

```ts
function yell(str) {
  assert(typeof str === "string");

  return str.toUppercase();
  //         ~~~~~~~~~~~
  // error: La propiedad 'toUppercase' no existe en el tipo 'string'.
  //        ¿Quisiste decir 'toUpperCase'?
}

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg);
  }
}
```

El otro tipo de firma de aserción no busca una condición, sino que le dice a *TypeScript* que una variable o propiedad específica tiene un tipo diferente.

```ts
function assertIsString(val: any): asserts val is string {
  if (typeof val !== "string") {
    throw new AssertionError("Not a string!");
  }
}
```

Aquí, `asserts val is string` asegura que después de cualquier llamada a `assertIsString`, cualquier variable pasada será conocida como un `string`.

```ts
function yell(str: any) {
  assertIsString(str);

  // Ahora TypeScript sabe que 'str' es una 'string'.

  return str.toUppercase();
  //         ~~~~~~~~~~~
  // error: La propiedad 'toUppercase' no existe en el tipo 'string'.
  //        ¿Quisiste decir 'toUpperCase'?
}
```

Estas firmas de aserción son muy similares a escribir firmas de predicado de tipo:

```ts
function isString(val: any): val is string {
  return typeof val === "string";
}

function yell(str: any) {
  if (isString(str)) {
    return str.toUppercase();
  }
  throw "Oops!";
}
```

Y al igual que las firmas de predicado de tipo, estas firmas de aserción son increíblemente expresivas.
Podemos expresar algunas ideas bastante sofisticadas con estas.

```ts
function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError(
      `Se esperaba que se definieras 'val', pero se recibió ${val}`
    );
  }
}
```

Para obtener más información sobre las firmas de aserción, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/32695).

## Mejor soporte para funciones que regresan `never`

Como parte del trabajo para las firmas de aserción, *TypeScript* necesitaba codificar más sobre dónde y qué funciones se llamaban.
Esto nos dio la oportunidad de ampliar el soporte para otra clase de funciones ⏤ las funciones que devuelven `never`.

La intención de cualquier función que devuelva `never` es que regrese `never`.
Indica que se lanzó una excepción, se produjo una condición de error de detención o que el programa se cerró.
Por ejemplo, [`process.exit(...)` en `@types/node`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5299d372a220584e75a031c13b3d555607af13f8/types/node/globals.d.ts#l874) se especifica para devolver `never`.

Con el fin de garantizar que una función nunca devolviera potencialmente `undefined` o que se devolviera efectivamente de todas las rutas de código, *TypeScript* necesitaba alguna señal sintáctica: ya sea un `return` o un `throw` al final de una función.
Así que los usuarios se encontraron "devolviendo" sus funciones de falla.

```ts
function dispatch(x: string | number): SomeType {
  if (typeof x === "string") {
    return doThingWithString(x);
  } else if (typeof x === "number") {
    return doThingWithNumber(x);
  }
  return process.exit(1);
}
```

Ahora, cuando se llaman estas funciones que regresan `never`, *TypeScript* reconoce que afectan el gráfico de control de flujo y las tiene en cuenta.

```ts
function dispatch(x: string | number): SomeType {
  if (typeof x === "string") {
    return doThingWithString(x);
  } else if (typeof x === "number") {
    return doThingWithNumber(x);
  }
  process.exit(1);
}
```

Al igual que con las funciones de aserción, puedes [leer más en la misma solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32695).

## (Más) Alias ​​de tipo recursivo

[*Playground*](/play/#example/recursive-type-references)

Los alias de tipo siempre han tenido una limitación en la forma en que se le puede hacer referencia "recursivamente".
La razón es que cualquier uso de un alias de tipo se debe poder sustituir con cualquier alias que tenga.
En algunos casos, eso no es posible, por lo que el compilador rechaza ciertos alias recursivos como los siguientes:

```ts
type Foo = Foo;
```

Esta es una restricción razonable porque cualquier uso de `Foo` necesitaría ser reemplazado por `Foo` que necesitaría ser reemplazado por `Foo` que necesitaría ser reemplazado con `Foo` que ... bueno, con suerte obtendrás ¡la idea!
Al final, no hay un tipo que tenga sentido en lugar de `Foo`.

Esto es bastante [coherente con la forma en que otros lenguajes tratan los alias de tipo](https://wikipedia.org/w/index.php?title=Recursive_data_type&oldid=913091335#in_type_synonyms), pero da lugar a algunos escenarios ligeramente sorprendentes sobre cómo los usuarios aprovechan la característica.
Por ejemplo, en *TypeScript 3.6* y versiones anteriores, lo siguiente provoca un error.

```ts
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
//   ~~~~~~~~~~~~
// error: El alias de tipo 'ValueOrArray' se hace referencia circularmente a sí mismo.
```

Esto es extraño porque técnicamente no hay nada de malo en cualquier uso que los usuarios siempre puedan escribir lo que era efectivamente el mismo código introduciendo una interfaz.

```ts
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
```

Debido a que las interfaces (y otros tipos de objetos) introducen un nivel de indirección y su estructura completa no necesita construirse con entusiasmo, *TypeScript* no tiene problemas para trabajar con esta estructura.

Pero la solución alternativa para introducir la interfaz no fue intuitiva para los usuarios.
Y, en principio, realmente no había nada malo con la versión original de `ValueOrArray` que usaba `Array` directamente.
Si el compilador era un poco más "vago" y solo calculaba los argumentos de tipo para `Array` cuando era necesario, *TypeScript* podría expresarlos correctamente.

Eso es exactamente lo que introduce *TypeScript 3.7*.
En el "nivel superior" de un alias de tipo, *TypeScript* diferirá la resolución del tipo de los argumentos para permitir estos patrones.

Esto significa que un código como el siguiente que intentaba representar *JSON*...

```ts
type Json = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [property: string]: Json;
}

interface JsonArray extends Array<Json> {}
```

finalmente se puede reescribir sin interfaces auxiliares.

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];
```

Esta nueva relajación también nos permite hacer referencia de forma recursiva a alias de tipo en tuplas.
El siguiente código que solía generar errores ahora es un código *TypeScript* válido.

```ts
type VirtualNode = string | [string, { [key: string]: any }, ...VirtualNode[]];

const myNode: VirtualNode = [
  "div",
  { id: "parent" },
  ["div", { id: "first-child" }, "I'm the first child"],
  ["div", { id: "second-child" }, "I'm the second child"],
];
```

Para obtener más información, puedes [leer sobre la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/33050).

## `--declaration` y `--allowJs`

La bandera [`declaration`](/tsconfig#declaration) en *TypeScript* nos permite generar archivos `.d.ts` (archivos de declaración) a partir de archivos fuente de *TypeScript* (es decir, archivos `.ts` y `.tsx`).
Estos archivos `.d.ts` son importantes por un par de razones.

En primer lugar, son importantes porque permiten que *TypeScript* verifique el tipo de otros proyectos sin volver a verificar el código fuente original.
También son importantes porque permiten que *TypeScript* interopere con las bibliotecas de *JavaScript* existentes que no se crearon con *TypeScript* en mente.
Finalmente, un beneficio que a menudo se subestima: tanto los usuarios de *TypeScript* y *JavaScript* se pueden beneficiar de estos archivos cuando utilizan editores con tecnología de *TypeScript* para obtener cosas como una mejor autocompletado.

Desafortunadamente, [`declaration`](/tsconfig#declaration) no funcionó con el indicador [`allowJs`](/tsconfig#allowJs) que permite mezclar archivos de entrada de *TypeScript* y *JavaScript*.
Esta fue una limitación frustrante porque significaba que los usuarios no podían usar la marca [`declaration`](/tsconfig#declaration) al migrar código base, incluso si estaban anotadas en *JSDoc*.
*TypeScript 3.7* cambia eso y permite que las dos opciones se usen juntas.

El resultado más impactante de esta característica puede ser un poco sutil: con *TypeScript 3.7*, los usuarios pueden escribir bibliotecas en *JavaScript* anotado *JSDoc* y admitir usuarios de *TypeScript*.

La forma en que esto funciona es que cuando se usa [`allowJs`](/tsconfig#allowJs), *TypeScript* tiene algunos análisis de mejor esfuerzo para comprender los patrones comunes de *JavaScript*; sin embargo, la forma en que algunos patrones se expresan en *JavaScript* no necesariamente se parecen a sus equivalentes en *TypeScript*.
Cuando se activa la emisión de [`declaration`](/tsconfig#declaration), *TypeScript* descubre la mejor manera de transformar los comentarios *JSDoc* y las exportaciones *CommonJS* en declaraciones de tipo válidas y similares en los archivos de salida `.d.ts`.

Como ejemplo, el siguiente fragmento de código

```js
const assert = require("assert");

module.exports.blurImage = blurImage;

/**
 * Produce una imagen borrosa desde un búfer de entrada.
 *
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
function blurImage(input, width, height) {
  const numPixels = width * height * 4;
  assert(input.length === numPixels);
  const result = new Uint8Array(numPixels);

  // PENDIENTE

  return result;
}
```

Producirá un archivo `.d.ts` como

```ts
/**
 * Produce una imagen borrosa desde un búfer de entrada.
 *
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
export function blurImage(
  input: Uint8Array,
  width: number,
  height: number
): Uint8Array;
```

Esto también puede ir más allá de las funciones básicas con etiquetas `@param`, donde el siguiente ejemplo:

```js
/**
 * @callback Job
 * @returns {void}
 */

/** Las colas funcionan */
export class Worker {
  constructor(maxDepth = 10) {
    this.started = false;
    this.depthLimit = maxDepth;
    /**
     * **Nota**: Los trabajos en cola pueden agregar más elementos a la cola
     * @type {Job[]}
     */
    this.queue = [];
  }
  /**
   * Agrega un elemento de trabajo a la cola
   * @param {Job} work
   */
  push(work) {
    if (this.queue.length + 1 > this.depthLimit) throw new Error("¡Cola llena!");
    this.queue.push(work);
  }
  /**
   * Inicia la cola si aún no se ha iniciado
   */
  start() {
    if (this.started) return false;
    this.started = true;
    while (this.queue.length) {
      /** @type {Job} */ (this.queue.shift())();
    }
    return true;
  }
}
```

se transformará en el siguiente archivo `.d.ts`:

```ts
/**
 * @callback Job
 * @returns {void}
 */
/** Las colas funcionan */
export class Worker {
  constructor(maxDepth?: number);
  started: boolean;
  depthLimit: number;
  /**
   * **Nota**: Los trabajos en cola pueden agregar más elementos a la cola
   * @type {Job[]}
   */
  queue: Job[];
  /**
   * Agrega un elemento de trabajo a la cola
   * @param {Job} work
   */
  push(work: Job): void;
  /**
   * Inicia la cola si aún no se ha iniciado
   */
  start(): boolean;
}
export type Job = () => void;
```

Ten en cuenta que cuando se usan estos indicadores juntos, *TypeScript* no necesariamente tiene que bajar el nivel de los archivos `.js`.
Si simplemente deseas que *TypeScript* cree archivos `.d.ts`, puedes usar la opción del compilador [`emitDeclarationOnly`](/tsconfig#emitDeclarationOnly).

Para obtener más detalles, puedes [consultar la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/32372).

## El indicador `useDefineForClassFields` y el modificador de propiedad `declare`

Cuando *TypeScript* implementó campos públicos de clase, asumimos lo mejor que pudimos que el siguiente código

```ts
class C {
  foo = 100;
  bar: string;
}
```

sería equivalente a una asignación similar dentro del cuerpo de un constructor.

```ts
class C {
  constructor() {
    this.foo = 100;
  }
}
```

Desafortunadamente, si bien esta parecía ser la dirección hacia la que se movió la propuesta en sus primeros días, existe una gran posibilidad de que los campos de clases públicas se estandaricen de manera diferente.
En cambio, es posible que la muestra de código original deba eliminar el azúcar sintáctico a algo más cercano a lo siguiente:

```ts
class C {
  constructor() {
    Object.defineProperty(this, "foo", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100,
    });
    Object.defineProperty(this, "bar", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
  }
}
```

Si bien *TypeScript 3.7* no cambia ninguna emisión existente de forma predeterminada, hemos estado implementando cambios de forma incremental para ayudar a los usuarios a mitigar posibles roturas futuras.
Hemos proporcionado una nueva bandera llamada [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) para habilitar este modo de emisión con una nueva lógica de verificación.

Los dos cambios más importantes son los siguientes:

- Las declaraciones se inician con `Object.defineProperty`.
- Las declaraciones *siempre* se inician en `undefined`, incluso si no tienen iniciador.

Esto puede causar algunas consecuencias para el código existente que usa herencia. En primer lugar, los descriptores de acceso `set` de las clases base no se activarán ⏤ se sobrescribirán por completo.

```ts
class Base {
  set data(value: string) {
    console.log("data changed to " + value);
  }
}

class Derived extends Base {
  // Ya no activa un 'console.log'
  // cuando se usa 'useDefineForClassFields'.
  data = 10;
}
```

En segundo lugar, el uso de campos de clase para especializar propiedades de clases base tampoco funcionará.

```ts
interface Animal {
  animalStuff: any;
}
interface Dog extends Animal {
  dogStuff: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // Inicia 'resident' a 'undefined'
  // después de la llamada a 'super()' cuando
  // usas 'useDefineForClassFields'!
  resident: Dog;

  constructor(dog: Dog) {
    super(dog);
  }
}
```

A lo que estos dos se reducen es a que mezclar propiedades con descriptores de acceso causará problemas, y también volverá a declarar propiedades sin iniciadores.

Para detectar el problema en torno a los accesos, *TypeScript 3.7* ahora emitirá accesos `get`/`set` en archivos `.d.ts` para que en *TypeScript* se puedan comprobar accesos redefinidos.

El código que se ve afectado por el cambio de campos de clase puede solucionar el problema convirtiendo los iniciadores de campo en asignaciones en los cuerpos del constructor.

```ts
class Base {
  set data(value: string) {
    console.log("data changed to " + value);
  }
}

class Derived extends Base {
  constructor() {
    this.data = 10;
  }
}
```

Para ayudar a mitigar el segundo problema, puedes agregar un iniciador explícito o agregar un modificador `declare` para indicar que una propiedad no debe tener emisión.

```ts
interface Animal {
  animalStuff: any;
}
interface Dog extends Animal {
  dogStuff: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  declare resident: Dog;
  //  ^^^^^^^
  // 'resident' ahora tiene un modificador 'declare',
  // y no producirá ningún código de salida.

  constructor(dog: Dog) {
    super(dog);
  }
}
```

Actualmente, [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) solo está disponible cuando se apunta a *ES5* y superior, ya que `Object.defineProperty` no existe en *ES3*.
Para lograr una similar verificación de problemas, puedes crear un proyecto separado que apunte a *ES5* y use [`noEmit`](/tsconfig#noEmit) para evitar una compilación completa.

Para obtener más información, puedes [echar un vistazo a la solicitud de extracción original para estos cambios](https://github.com/microsoft/TypeScript/pull/33509).

Recomendamos encarecidamente a los usuarios que prueben la marca [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) e informen sobre nuestro rastreador de problemas o en los comentarios a continuación.
Esto incluye comentarios sobre la dificultad de adoptar la bandera para que podamos entender cómo podemos facilitar la migración.

## Edición sin compilación con referencias de proyectos

Las referencias de proyectos *TypeScript* nos brindan una manera fácil de dividir el código base para brindarnos compilaciones más rápidas.
Desafortunadamente, editar un proyecto cuyas dependencias no se habían creado (o cuya salida estaba desactualizada) significaba que la experiencia de edición no funcionaría bien.

En *TypeScript 3.7*, al abrir un proyecto con dependencias, *TypeScript* utilizará automáticamente los archivos fuente `.ts`/`.tsx` en su lugar.
Esto significa que los proyectos que utilizan referencias de proyectos ahora verán una experiencia de edición mejorada donde las operaciones semánticas están actualizadas y "simplemente funcionan".
Puedes deshabilitar este comportamiento con la opción del compilador [`disableSourceOfProjectReferenceRedirect`](/tsconfig#disableSourceOfProjectReferenceRedirect) que puede ser apropiada cuando se trabaja en proyectos muy grandes donde este cambio puede afectar el rendimiento de la edición.

Puedes [leer más sobre este cambio leyendo su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32028).

## Comprobación de funciones no solicitadas

Un error común y peligroso es olvidarse de invocar una función, especialmente si la función tiene cero argumentos o se nombra de una manera que implica que podría ser una propiedad en lugar de una función.

```ts
interface User {
  isAdministrator(): boolean;
  notify(): void;
  doNotDisturb?(): boolean;
}

// más tarde...

// Código roto, ¡no lo uses!
function doAdminThing(user: User) {
  // oops!
  if (user.isAdministrator) {
    sudo();
    editTheConfiguration();
  } else {
    throw new AccessDeniedError("User is not an admin");
  }
}
```

Aquí, olvidamos llamar a `isAdministrator`, ¡y el código ⏤incorrectamente⏤ permite a los usuarios que no son administradores editar la configuración!

En *TypeScript 3.7*, esto se identifica como un error probable:

```ts
function doAdminThing(user: User) {
    if (user.isAdministrator) {
    //  ~~~~~~~~~~~~~~~~~~~~
    // ¡error! Esta condición siempre devolverá true ya que la función siempre está definida.
    //        ¿Querías llamarla en su lugar?
```

Esta comprobación es un cambio rotundo, pero por esa razón las comprobaciones son muy conservadoras.
Este error solo se emite en condiciones `if`, y no se emite en propiedades opcionales, si [`strictNullChecks`](/tsconfig#strictNullChecks) está desactivado, o si la función se llama más tarde dentro del cuerpo del `if`:

```ts
interface User {
  isAdministrator(): boolean;
  notify(): void;
  doNotDisturb?(): boolean;
}

function issueNotification(user: User) {
  if (user.doNotDisturb) {
    // Bien, la propiedad es opcional
  }
  if (user.notify) {
    // Bien, llamó a la función
    user.notify();
  }
}
```

Si tenías la intención de probar la función sin llamarla, puedes corregir la definición de la misma para incluir `undefined`/`null`, o usar `!!` para escribir algo como `if (!!user.isAdministrator)` para indicar que la coacción es intencionada.

Le debemos un gran agradecimiento al usuario de *GitHub* [*@jwbay*](https://github.com/jwbay) que tomó la iniciativa de crear una [prueba de concepto](https://github.com/microsoft/TypeScript/pull/32802) e iterado para proporcionarnos [la versión actual](https://github.com/microsoft/TypeScript/pull/33178).

## `// en archivos *TypeScript*

*TypeScript 3.7* nos permite agregar comentarios `//@ ts-nocheck` en la parte superior de los archivos de TypeScript para deshabilitar las comprobaciones semánticas.
Históricamente, este comentario solo se respetaba en archivos fuente *JavaScript* en presencia de [`checkJs`](/tsconfig#checkJs), pero hemos ampliado el soporte a archivos *TypeScript* para facilitar las migraciones a todos los usuarios.

## Opción del formateador de punto y coma

El formateador integrado de *TypeScript* ahora admite la inserción y eliminación del punto y coma en ubicaciones donde un punto y coma final es opcional debido a las reglas de inserción automática de punto y coma (*IAPC*) de *JavaScript*. La configuración está disponible ahora en [*Visual Studio Code Insiders*](https://code.visualstudio.com/insiders/) y estará disponible en *Visual Studio 16.4 Preview 2* en el menú *Herramientas* ▹ *Opciones*.

<img width="833" alt="Nueva opción de formateador de punto y coma en VS Code" src="https://user-images.githubusercontent.com/3277153/65913194-10066e80-e395-11e9-8a3a-4f7305c397d5.png">

La elección de un valor de "insertar" o "eliminar" también afecta el formato de las importaciones automáticas, los tipos extraídos y otro código generado proporcionado por los servicios de *TypeScript*. Dejar la configuración en su valor predeterminado de "ignorar" hace que el código generado coincida con la preferencia de punto y coma detectada en el archivo actual.

## 3.7 Cambios importantes

### Cambios *DOM*

[Se actualizaron los tipos de `lib.dom.d.ts`](https://github.com/microsoft/TypeScript/pull/33627).
Estos cambios son en gran parte cambios de corrección relacionados con la nulabilidad, pero el impacto dependerá en última instancia de su código base.

### Mitigación de campo de clase

[Como se mencionó anteriormente](#el-indicador-usedefineforclassfields-y-el-modificador-de-propiedad-declare), *TypeScript 3.7* emite accesores `get`/`set` en archivos `.d.ts` que pueden causar cambios importantes para los consumidores en versiones anteriores de *TypeScript* como 3.5 y anteriores.
Los usuarios de *TypeScript 3.6* no se verán afectados, ya que esa versión fue preparada para el futuro de esta característica.

Si bien no es una rotura per se, optar por la marca [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) puede provocar roturas cuando:

- anular un descriptor de acceso en una clase derivada con una declaración de propiedad
- volver a declarar una declaración de propiedad sin iniciador

Para comprender el impacto total, lee [la sección anterior sobre el indicador `useDefineForClassFields`](#el-indicador-usedefineforclassfields-y-el-modificador-de-propiedad-declare).

### Comprobación de funciones de verdad

Como se mencionó anteriormente, *TypeScript* ahora genera errores cuando las funciones parecen no ser llamadas dentro de las condiciones de la declaración `if`.
Se emite un error cuando se marca un tipo de función en las condiciones `if`, a menos que se aplique cualquiera de las siguientes condiciones:

- el valor comprobado proviene de una propiedad opcional
- [`strictNullChecks`](/tsconfig#strictNullChecks) está deshabilitado
- la función se llama más tarde dentro del cuerpo del `if`

### Las declaraciones de tipos locales e importados ahora están en conflicto

Debido a un error, anteriormente se permitía la siguiente construcción en *TypeScript*:

```ts
// ./someOtherModule.ts
interface SomeType {
  y: string;
}

// ./myModule.ts
import { SomeType } from "./someOtherModule";
export interface SomeType {
  x: number;
}

function fn(arg: SomeType) {
  console.log(arg.x); // ¡Error! 'x' no existe en 'SomeType'
}
```

Aquí, `SomeType` parece originarse tanto en la declaración `import` como en la declaración `interface` local.
Quizás sorprendentemente, dentro del módulo, `SomeType` se refiere exclusivamente a la definición `import`ada, y la declaración local `SomeType` solo se puede usar cuando se importa desde otro archivo.
Esto es muy confuso y nuestra revisión de la muy pequeña cantidad de casos de código como este en la naturaleza mostró que los desarrolladores generalmente pensaban que estaba sucediendo algo diferente.

En *TypeScript 3.7*, [esto ahora correctamente se identifica como un error de identificador duplicado](https://github.com/microsoft/TypeScript/pull/31231).
La corrección exacta depende de la intención original del autor y se debe abordar caso por caso.
Por lo general, el conflicto de nombres no es intencional y la mejor solución es cambiar el nombre del tipo importado.
Si la intención era aumentar el tipo importado, se debería escribir un aumento de módulo adecuado en su lugar.

### Cambios en la *API* 3.7

Para habilitar los patrones de alias de tipo recursivo descritos anteriormente, la propiedad `typeArguments` se ha eliminado de la interfaz `TypeReference`. En su lugar, los usuarios deberían utilizar la función `getTypeArguments` en instancias de `TypeChecker`.
