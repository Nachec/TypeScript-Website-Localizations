---
title: TypeScript 3.6
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-6.html
oneline: Notas de la versión de TypeScript 3.6
---

## Genéricos más estrictos

*TypeScript 3.6* introduce una comprobación más estricta de los iteradores y las funciones del generador.
En versiones anteriores, los usuarios de generadores no tenían forma de diferenciar si un generador entregaba o devolvía un valor.

```ts
function* foo() {
  if (Math.random() < 0.5) yield 100;
  return "Finished!";
}

let iter = foo();
let curr = iter.next();
if (curr.done) {
  // TypeScript 3.5 y anteriores pensaron que se trataba de una 'string | number'.
  // ¡Debe saber que es 'string' ya que 'done' era 'true'!
  curr.value;
}
```

Además, los generadores simplemente asumieron que el tipo de `yield` siempre era `any`.

```ts
function* bar() {
  let x: { hello(): void } = yield;
  x.hello();
}

let iter = bar();
iter.next();
iter.next(123); // oops! ¡Error de el entorno de ejecución!
```

En *TypeScript 3.6*, el corrector ahora sabe que el tipo correcto para `curr.value` debería ser `string` en nuestro primer ejemplo, y se equivocará correctamente en nuestra llamada a `next()` en nuestro último ejemplo.
Esto es gracias a algunos cambios en las declaraciones de tipo `Iterator` e `IteratorResult` para incluir algunos nuevos parámetros de tipo, y a un nuevo tipo que *TypeScript* usa para representar generadores llamado el tipo `Generator`.

El tipo `Iterator` ahora permite a los usuarios especificar el tipo generado, el tipo devuelto y el tipo que `next` puede aceptar.

```ts
interface Iterator<T, TReturn = any, TNext = undefined> {
  // Toma 0 o 1 argumentos - no acepta 'undefined'
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return?(value?: TReturn): IteratorResult<T, TReturn>;
  throw?(e?: any): IteratorResult<T, TReturn>;
}
```

Sobre la base de ese trabajo, el nuevo tipo `Generator` es un `Iterator` que siempre tiene presentes los métodos `return` y `throw`, y también es iterable.

```ts
interface Generator<T = unknown, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return(value: TReturn): IteratorResult<T, TReturn>;
  throw(e: any): IteratorResult<T, TReturn>;
  [Symbol.iterator](): Generator<T, TReturn, TNext>;
}
```

Para permitir la diferenciación entre los valores devueltos y los valores obtenidos, *TypeScript 3.6* convierte el tipo `IteratorResult` en un tipo de unión discriminada:

```ts
type IteratorResult<T, TReturn = any> =
  | IteratorYieldResult<T>
  | IteratorReturnResult<TReturn>;

interface IteratorYieldResult<TYield> {
  done?: false;
  value: TYield;
}

interface IteratorReturnResult<TReturn> {
  done: true;
  value: TReturn;
}
```

En resumen, lo que esto significa es que podrás reducir adecuadamente los valores de los iteradores al tratar con ellos directamente.

Para representar correctamente los tipos que se pueden pasar a un generador desde las llamadas a `next()`, *TypeScript 3.6* también infiere ciertos usos de `yield` dentro del cuerpo de una función generadora.

```ts
function* foo() {
  let x: string = yield;
  console.log(x.toUpperCase());
}

let x = foo();
x.next(); // la primera llamada a 'next' siempre se ignora
x.next(42); // ¡error! 'number' no se puede asignar a 'string'
```

Si prefieres ser explícito, también puedes aplicar el tipo de valores que se pueden devolver, generar y evaluar a partir de expresiones `yield` mediante un tipo de retorno explícito.
Debajo, `next()` solo se puede llamar con `boolean`os, y dependiendo del valor de `done`, `value` es un `string` o un `number`.

```ts
/**
 * - produce números
 * - devuelve cadenas
 * - se le pueden pasar booleanos
 */
function* counter(): Generator<number, string, boolean> {
  let i = 0;
  while (true) {
    if (yield i++) {
      break;
    }
  }
  return "done!";
}

var iter = counter();
var curr = iter.next();
while (!curr.done) {
  console.log(curr.value);
  curr = iter.next(curr.value === 5);
}
console.log(curr.value.toUpperCase());

// prints:
//
// 0
// 1
// 2
// 3
// 4
// 5
// ¡HECHO!
```

Para obtener más detalles sobre el cambio, [consulta la solicitud de extracción aquí](https://github.com/Microsoft/TypeScript/issues/2983).

## Difusión de arreglo más precisa

En los objetivos anteriores a *ES2015*, las emisiones más fieles para construcciones como los bucles `for`/`of` y las extensiones de arreglo pueden ser un poco pesadas.
Por esta razón, *TypeScript* usa una emisión más simple de manera predeterminada solo admite tipos de arreglo y admite la iteración en otros tipos usando el indicador [`downlevelIteration`](/tsconfig#downlevelIteration).
El valor predeterminado más flexible sin [`downlevelIteration`](/tsconfig#downlevelIteration) funciona bastante bien; sin embargo, hubo algunos casos comunes en los que la transformación de los diferenciales de arreglo tuvo diferencias observables.
Por ejemplo, el siguiente arreglo que contiene una extensión

```ts
[...Array(5)];
```

se puede reescribir como el siguiente literal de arreglo

```js
[undefined, undefined, undefined, undefined, undefined];
```

Sin embargo, *TypeScript* transformaría el código original en este código:

```ts
Array(5).slice();
```

que es ligeramente diferente.
`Array(5)` produce un arreglo con una longitud de 5, pero sin ranuras de propiedad definidas.

*TypeScript 3.6* introduce un nuevo ayudante `__spreadArrays` para modelar con precisión lo que sucede en *ECMAScript 2015* en objetivos más antiguos fuera de [`downlevelIteration`](/tsconfig#downlevelIteration).
`__spreadArrays` también está disponible en [`tslib`](https://github.com/Microsoft/tslib/).

Para obtener más información, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/31166).

## Promesas mejoradas en torno a *XU*

*TypeScript 3.6* introduce algunas mejoras para cuando las `Promise`s se manejan mal.

Por ejemplo, frecuentemente es muy común olvidar `.then()` o `await` el contenido de una `Promise` antes de pasarla a otra función.
Los mensajes de error de *TypeScript* ahora son especializados e informan al usuario que tal vez debería considerar usar la palabra clave `await`.

```ts
interface User {
  name: string;
  age: number;
  location: string;
}

declare function getUserData(): Promise<User>;
declare function displayUser(user: User): void;

async function f() {
  displayUser(getUserData());
  //              ~~~~~~~~~~~~~
  // El argumento de tipo 'Promise<User>' no se puede asignar al parámetro de tipo 'User'.
  //   ...
  // ¿Olvidaste usar 'await'?
}
```

También es común intentar acceder a un método antes de `await` o `.then()` a `Promise`.
Este es otro ejemplo, entre muchos otros, en los que podemos hacerlo mejor.

```ts
async function getCuteAnimals() {
  fetch("https://reddit.com/r/aww.json").json();
  //   ~~~~
  // La propiedad 'json' no existe en el tipo 'Promise<Response>'.
  //
  // ¿Olvidaste usar 'await'?
}
```

Para obtener más detalles, [consulta el problema de origen](https://github.com/microsoft/TypeScript/issues/30646), así como las solicitudes de extracción que lo vinculan.

## Mejor compatibilidad con Unicode para identificadores

*TypeScript 3.6* contiene un mejor soporte para caracteres Unicode en identificadores cuando se emiten a *ES2015* y destinos posteriores.

```ts
const 𝓱𝓮𝓵𝓵𝓸 = "world"; // anteriormente no permitido, ahora permitido en '--target es2015'
```

## Soporte de `import.meta` en `SystemJS`

*TypeScript 3.6* admite la transformación de `import.meta` a `context.meta` cuando el objetivo de su `module` está configurado en `system`.

```ts
// Este módulo:

console.log(import.meta.url);

// se convierte en lo siguiente:

System.register([], function (exports, context) {
  return {
    setters: [],
    execute: function () {
      console.log(context.meta.url);
    },
  };
});
```

## Los accesores `get` y `set` están permitidos en contextos ambientales

En versiones anteriores de *TypeScript*, el lenguaje no permitía los accesores `get` y `set` en contextos ambientales (como en las `declare` de clases, o en los archivos `.d.ts` en general).
El fundamento era que los descriptores de accesores no eran distintos de las propiedades en cuanto a escribir y leer estas propiedades;
sin embargo, [debido a que la propuesta de campos de clase de *ECMAScript* puede tener un comportamiento diferente al de las versiones existentes de *TypeScript*](https://github.com/tc39/proposal-class-fields/issues/248), nos dimos cuenta de que necesitábamos una forma de comunicar este comportamiento diferente para proporcionar errores apropiados en las subclases.

Como resultado, los usuarios pueden escribir captadores y definidores en contextos ambientales en *TypeScript 3.6*.

```ts
declare class Foo {
  // Permitido en 3.6+.
  get x(): number;
  set x(val: number);
}
```

En *TypeScript 3.7*, el propio compilador aprovechará esta característica para que los archivos `.d.ts` generados también emitan accesores `get`/`set`.

## Las clases y funciones ambientales se pueden fusionar

En versiones anteriores de *TypeScript
, era un error fusionar clases y funciones bajo cualquier circunstancia.
Ahora, las clases y funciones ambientales (clases/funciones con el modificador `declare`, o en archivos `.d.ts`) se pueden fusionar.
Esto significa que ahora puedes escribir lo siguiente:

```ts
export declare function Point2D(x: number, y: number): Point2D;
export declare class Point2D {
  x: number;
  y: number;
  constructor(x: number, y: number);
}
```

en lugar de la necesidad de usar

```ts
export interface Point2D {
  x: number;
  y: number;
}
export declare var Point2D: {
  (x: number, y: number): Point2D;
  new (x: number, y: number): Point2D;
};
```

Una ventaja de esto es que el patrón del constructor invocable se puede expresar fácilmente al mismo tiempo que permite que los espacios de nombres se fusionen con estas declaraciones (ya que las declaraciones `var` no se pueden fusionar con los `namespace`s).

En *TypeScript 3.7*, el compilador aprovechará esta característica para que los archivos `.d.ts` generados a partir de archivos `.js` puedan capturar adecuadamente tanto la capacidad de llamada como la capacidad de construcción de una función similar a una clase.

Para obtener más detalles, [consulta la *SE* original en *GitHub*](https://github.com/microsoft/TypeScript/pull/32584).

## *API* para admitir `--build` y `--incremental`

*TypeScript 3.0* introdujo soporte para hacer referencia a otros y construirlos de forma incremental usando la marca `--build`.
Además, *TypeScript 3.4* introdujo el indicador [`incremental`](/tsconfig#incremental) para guardar información sobre compilaciones anteriores para reconstruir solo ciertos archivos.
Estas banderas fueron increíblemente útiles para estructurar proyectos de manera más flexible y acelerar las construcciones.
Desafortunadamente, el uso de estos indicadores no funcionó con herramientas de compilación de terceros como *Gulp* y *Webpack*.
*TypeScript 3.6* ahora expone dos conjuntos de *API*s para operar en referencias de proyectos y creación de programas incrementales.

Para crear compilaciones [`incremental`](/tsconfig#incremental), los usuarios pueden aprovechar las *API*s `createIncrementalProgram` y `createIncrementalCompilerHost`.
Los usuarios también pueden rehidratar instancias de programas antiguos a partir de archivos `.tsbuildinfo` generados por esta *API* utilizando la función `readBuilderProgram` recién expuesta, que solo se debe usar para crear nuevos programas (es decir, no puedes modificar la instancia devuelta ⏤ solo está destinado a ser utilizado para el parámetro `oldProgram` en otras funciones de `create*Program`).

Para aprovechar las referencias del proyecto, se ha expuesto una nueva función `createSolutionBuilder`, que devuelve una instancia del nuevo tipo `SolutionBuilder`.

Para obtener más detalles sobre estas *API*s, puede s[ver la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/31432).

## Edición de código con reconocimiento de punto y coma

Editores como *Visual Studio* y *Visual Studio Code* pueden aplicar automáticamente correcciones rápidas, refactorizaciones y otras transformaciones, como importar automáticamente valores de otros módulos.
Estas transformaciones están impulsadas por *TypeScript*, y las versiones anteriores de *TypeScript* agregaron punto y coma incondicionalmente al final de cada declaración; desafortunadamente, esto no estaba de acuerdo con las pautas de estilo de muchos usuarios, y muchos usuarios estaban disgustados con que el editor insertara punto y coma.

*TypeScript* ahora es lo suficientemente inteligente como para detectar si tu archivo usa punto y coma al aplicar este tipo de ediciones.
Si tu archivo generalmente carece de punto y coma, *TypeScript* no agregará uno.

Para obtener más detalles, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/31801).

## Sintaxis de importación automática más inteligente

*JavaScript* tiene muchas sintaxis o convenciones de módulos diferentes: el del estándar *ECMAScript*, el que *Node* ya admite (*CommonJS*), *AMD*, *System.js*, ¡y más!
En su mayor parte, *TypeScript* se importaría automáticamente de forma predeterminada utilizando la sintaxis del módulo *ECMAScript*, que a menudo era inapropiado en ciertos proyectos de *TypeScript* con diferentes configuraciones de compilador, o en proyectos de *Node* con *JavaScript* estándar y llamadas `require`.

*TypeScript 3.6* ahora es un poco más inteligente al analizar tus importaciones existentes antes de decidir cómo importar automáticamente otros módulos.
Puedes [ver más detalles en la solicitud de extracción original aquí](https://github.com/microsoft/TypeScript/pull/32684).

## Nuevo *Playground de TypeScript*

¡El *Playground* de *TypeScript* ha recibido una actualización muy necesaria con una nueva y práctica funcionalidad!
El nuevo *Playground* es en gran parte una bifurcación del [*Playground* de *TypeScript*](https://github.com/agentcooper/typescript-play) de [Artem Tyurin](https://github.com/agentcooper)  que los miembros de la comunidad han estado usando más y más.
¡Le debemos a Artem un gran agradecimiento por ayudarnos aquí!

El nuevo *Playground* ahora admite muchas opciones nuevas, que incluyen:

- La opción [`target`](/tsconfig#target) (que permite a los usuarios cambiar de `es5` a `es3`, `es2015`, `esnext`, etc.)
- Todas las banderas de rigor (incluyendo solo [`strict`](/tsconfig#strict))
- Soporte para archivos *JavaScript* simples (usando `allowJS` y opcionalmente [`checkJs`](/tsconfig#checkJs))

Estas opciones también persisten cuando se comparten enlaces a ejemplos de *Playground*, lo que permite a los usuarios compartir ejemplos de manera más confiable sin tener que decirle al destinatario "¡oh, no olvides activar la opción [`noImplicitAny`](/tsconfig#noImplicitAny)!".

En un futuro cercano, actualizaremos los ejemplos de *Playground*, agregaremos soporte *JSX* y mejoraremos la adquisición automática de tipos, lo que significa que podrás ver la misma experiencia en el *Playground* que la que obtendrías en tu editor personal. .

A medida que mejoramos el *Playground* y el sitio web, [agradecemos tus comentarios y solicitudes de extracción en *GitHub*](https://github.com/microsoft/TypeScript-Website/).
