---
title: TypeScript 4.6
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-6.html
oneline: Notas de la versión de TypeScript 4.6
---

## ¿Qué hay de nuevo desde la Beta y RC?

Cuando anunciamos nuestra versión beta, nos perdimos de documentar dos excelentes características: [análisis de flujo de control para uniones discriminadas desestructuradas](#cfa-destructured-discriminated-unions) y [la adición del objetivo de salida `es2022`](#target-es2022).
Un cambio notable adicional que ha estado presente desde nuestra versión beta es [la eliminación de los argumentos `void 0` en el modo `react-jsx`] (#no-void-0-react-jsx)

Un cambio que llegó a nuestro *RC*, pero que no capturamos en nuestro anuncio anterior fue [sugerencias para nombres de parámetros *JSDoc* no coincidentes](#jsdoc-name-suggestions).

Desde nuestro *RC*, también hemos realizado una refactorización interna que solucionó ciertos problemas, corrigió algunos mensajes de error extraños y mejoró el rendimiento de verificación de tipos en un 3% en ciertos casos.
Puedes [leer más sobre ese cambio aquí](https://github.com/microsoft/TypeScript/pull/47738).

## Permitir código en constructores antes de `super()`

En las clases de *JavaScript* es obligatorio llamar a `super()` antes de referirse a `this`.
*TypeScript* también aplica esto, aunque fue un poco demasiado estricto en _cómo_ aseguró esto.
En *TypeScript*, anteriormente era un error contener _cualquier_ código al comienzo de un constructor si su clase contenedora tenía algún iniciador de propiedad.

```ts
class Base {
  // ...
}

class Derived extends Base {
  someProperty = true;

  constructor() {
    // ¡error!
    // tienes que llamar a 'super()' primero porque necesitas iniciar 'someProperty'.
    doSomeStuff();
    super();
  }
}
```

Esto hizo que fuera barato comprobar que se llama a `super()` antes de que se haga referencia a `this`, pero terminó rechazando una gran cantidad de código válido.
*TypeScript 4.6* ahora es mucho más indulgente en esa verificación y permite que otro código se ejecute antes de `super()`, todo mientras se asegura de que `super()` ocurra en el nivel superior antes de cualquier referencia a `this`.

Nos gustaría extender nuestro agradecimiento a [Joshua Goldberg](https://github.com/JoshuaKGoldberg) por [trabajar pacientemente con nosotros para lograr este cambio](https://github.com/microsoft/TypeScript/pull/29374)!

## Análisis del control de flujo para uniones discriminadas desestructuradas

*TypeScript* puede restringir los tipos en función de lo que se denomina una propiedad discriminante.
Por ejemplo, en el siguiente fragmento de código, *TypeScript* puede restringir el tipo de `action` en función de cada vez que comprobamos el valor de `kind`.

```ts
type Action =
  | { kind: "NumberContents"; payload: number }
  | { kind: "StringContents"; payload: string };

function processAction(action: Action) {
  if (action.kind === "NumberContents") {
    // aquí `action.payload` es un number
    let num = action.payload * 2;
    // ...
  } else if (action.kind === "StringContents") {
    // Aquí `action.payload` es un string.
    const str = action.payload.trim();
    // ...
  }
}
```

Esto nos permite trabajar con objetos que pueden contener diferentes datos, pero un campo común nos dice _qué_ datos tienen esos objetos.

Esto es muy común en *TypeScript*; sin embargo, dependiendo de tus preferencias, es posible que hayas querido desestructurar `kind` y `payload` en el ejemplo anterior.
Tal vez algo como lo siguiente:

```ts
type Action =
  | { kind: "NumberContents"; payload: number }
  | { kind: "StringContents"; payload: string };

function processAction(action: Action) {
  const { kind, payload } = action;
  if (kind === "NumberContents") {
    let num = payload * 2;
    // ...
  } else if (kind === "StringContents") {
    const str = payload.trim();
    // ...
  }
}
```

Anteriormente, TypeScript fallaba en estos: una vez que `kind` y `payload` se extrajeron del mismo objeto en variables, se consideraron totalmente independientes.

¡En *TypeScript 4.6*, esto simplemente funciona!

Al desestructurar propiedades individuales en una declaración `const`, o al desestructurar un parámetro en variables que nunca se asignan, *TypeScript* verificará si el tipo desestructurado es una unión discriminada.
Si es así, *TypeScript* ahora puede reducir los tipos de variables dependiendo de las comprobaciones de otras variables
Entonces, en nuestro ejemplo, una verificación en `kind` reduce el tipo de `payload`.

Para obtener más información, [consulta la solicitud de extracción de cambios que implementó este análisis](https://github.com/microsoft/TypeScript/pull/46266).

## Comprobaciones de profundidad de recurción mejoradas

*TypeScript* tiene algunos desafíos interesantes debido al hecho de que se basa en un sistema de tipo estructural que también proporciona genéricos.

En un sistema de tipos estructurales, los tipos de objetos son compatibles en función de los miembros que tienen.

```ts
interface Source {
  prop: string;
}

interface Target {
  prop: number;
}

function check(source: Source, target: Target) {
  target = source;
  // ¡error!
  // El tipo 'Source' no se puede asignar al tipo 'Target'.
  //   Los tipos de la propiedad 'prop' son incompatibles.
  //     El tipo 'string' no se puede asignar al tipo 'number'.
}
```

Ten en cuenta que si `Source` es compatible o no con `Target` tiene que ver con si sus _propiedades_ son asignables.
En este caso, eso es solo `prop`.

Cuando introduces genéricos en esto, hay algunas preguntas más difíciles de responder.
Por ejemplo, ¿se puede asignar un `Source<string>` a un `Target<number>` en el siguiente caso?

```ts
interface Source<T> {
  prop: Source<Source<T>>;
}

interface Target<T> {
  prop: Target<Target<T>>;
}

function check(source: Source<string>, target: Target<number>) {
  target = source;
}
```

Para responder eso, *TypeScript* necesita verificar si los tipos de `prop` son compatibles.
Eso lleva a la otra pregunta: ¿Se puede asignar un `Source<Source<string>>` a un `Target<Target<number>>`?
Para responder a eso, *TypeScript* verifica si `prop` es compatible con _esos_ tipos, y termina verificando si `Source<Source<Source<string>>>` se puede asignar a `Target<Target<Target<number>>>`.
Continúa un poco y notarás que el tipo se expande infinitamente a medida que profundiza.

*TypeScript* tiene algunas heurísticas aquí: si un tipo _parece_ expandirse infinitamente después de encontrar una cierta verificación de profundidad, entonces considera que los tipos _podrían_ ser compatibles.
Esto suele ser suficiente, pero vergonzosamente hubo algunos falsos negativos que esto no detectó.

```ts
interface Foo<T> {
  prop: T;
}

declare let x: Foo<Foo<Foo<Foo<Foo<Foo<string>>>>>>;
declare let y: Foo<Foo<Foo<Foo<Foo<string>>>>>;

x = y;
```

Un lector humano puede ver que `x` e `y` deberían ser incompatibles en el ejemplo anterior.
Si bien los tipos están profundamente anidados, eso es solo una consecuencia de cómo se declararon.
La heurística estaba destinada a capturar casos en los que se generaron tipos profundamente anidados a través de la exploración de los tipos, no cuando un desarrollador escribió ese tipo por sí mismo.

*TypeScript 4.6* ahora puede distinguir estos casos y corregir errores en el último ejemplo.
Además, debido a que el lenguaje ya no se preocupa por los falsos positivos de tipos escritos explícitamente, *TypeScript* puede concluir que un tipo se está expandiendo infinitamente mucho antes y ahorrar mucho trabajo al verificar la compatibilidad de tipos.
Como resultado, las bibliotecas en `DefinitelyTyped` como `redux-immutable`, `react-lazylog` y `yup` experimentaron una reducción del 50 % en el tiempo de verificación.

Es posible que ya tengas este cambio porque se seleccionó en *TypeScript 4.5.3*, pero es una característica notable de *TypeScript 4.6* sobre la que puedes leer más [aquí](https://github.com/microsoft/TypeScript/tirar/46599).

## Mejoras en la inferencia de acceso indexado

*TypeScript* ahora puede inferir correctamente los tipos de acceso indexados que se indexan inmediatamente en un tipo de objeto asignado.

```ts
interface TypeMap {
  number: number;
  string: string;
  boolean: boolean;
}

type UnionRecord<P extends keyof TypeMap> = {
  [K in P]: {
    kind: K;
    v: TypeMap[K];
    f: (p: TypeMap[K]) => void;
  };
}[P];

function processRecord<K extends keyof TypeMap>(record: UnionRecord<K>) {
  record.f(record.v);
}

// Esta llamada solía tener problemas - ¡ahora trabaja!
processRecord({
  kind: "string",
  v: "hello!",

  // 'val' solía tener implícitamente el tipo 'string | number | boolean',
  // pero ahora se infiere correctamente solo como 'string'.
  f: (val) => {
    console.log(val.toUpperCase());
  },
});
```

Este patrón ya era compatible y permitía que *TypeScript* comprendiera que la llamada a `record.f(record.v)` es válida, pero anteriormente la llamada a `processRecord` daba resultados de inferencia deficientes para `val`

*TypeScript 4.6* mejora esto para que no se necesiten aserciones de tipo dentro de la llamada a `processRecord`.

Para obtener más información, puedes [leer sobre la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/47109).

## Análisis del control de flujo para parámetros dependientes

Una firma se puede declarar con un parámetro `rest` cuyo tipo es una unión discriminada de tuplas.

```ts
function func(...args: ["str", string] | ["num", number]) {
  // ...
}
```

Lo que esto dice es que los argumentos de `func` dependen completamente del primer argumento.
Cuando el primer argumento es la cadena `"str"`, entonces su segundo argumento tiene que ser un `string`.
Cuando su primer argumento es la cadena `"num"`, su segundo argumento tiene que ser un `number`.

En los casos en que *TypeScript* infiere el tipo de una función a partir de una firma como esta, *TypeScript* ahora puede limitar los parámetros que dependen de otros.

```ts
type Func = (...args: ["a", number] | ["b", string]) => void;

const f1: Func = (kind, payload) => {
  if (kind === "a") {
    payload.toFixed(); // 'payload' reducido a 'number'
  }
  if (kind === "b") {
    payload.toUpperCase(); // 'payload' reducido a 'string'
  }
};

f1("a", 42);
f1("b", "hello");
```

Para obtener más información, [consulta el cambio en *GitHub*](https://github.com/microsoft/TypeScript/pull/47190).

## `--target es2022`

La opción `--target` de *TypeScript* ahora es compatible con `es2022`.
Esto significa que las funciones como los campos de clase ahora tienen un destino de salida estable donde se pueden conservar.
También significa que la nueva funcionalidad integrada como el método [`at()` en `Array`s](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at), [`Object.hasOwn`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn), o [la opción `cause` en ` new Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error#rethrowing_an_error_with_a_cause) se puede usar con esta nueva configuración `--target`, o con `--lib es2022`.

Esta funcionalidad fue [implementada](https://github.com/microsoft/TypeScript/pull/46291) por [Kagami Sascha Rosylight (saschanaz)](https://github.com/saschanaz) en varias *SE*, y nosotros estamos muy agradecidos por esa contribución!

## Argumentos innecesarios eliminados en `react-jsx`

Previamente, al compilar código como el siguiente en `--jsx react-jsx`

```tsx
export const el = <div>foo</div>;
```

*TypeScript* produciría el siguiente código *JavaScript*:

```jsx
import { jsx as _jsx } from "react/jsx-runtime";
export const el = _jsx("div", { children: "foo" }, void 0);
```

Ese último argumento `void 0` es innecesario en este modo de emisión, y eliminarlo puede mejorar el tamaño de los paquetes.

```diff
- export const el = _jsx("div", { children: "foo" }, void 0);
+ export const el = _jsx("div", { children: "foo" });
```

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/47467) de [Alexander Tarasyuk](https://github.com/a-tarasyuk), *TypeScript 4.6* ahora descarta el argumento `void 0`.

## Sugerencias de nombres *JSDoc*

En *JSDoc*, puedes documentar parámetros usando una etiqueta `@param`.

```js
/**
 * @param {x} El primer operando
 * @param y El segundo operando
 */
function add(x, y) {
  return x + y;
}
```

Pero, ¿qué sucede cuando estos comentarios quedan desactualizados?
¿Qué pasa si renombramos `x` e `y` a `a` y `b`?

```js
/**
 * @param x {number} The first operand
 * @param y {number} El segundo operando
 */
function add(a, b) {
  return a + b;
}
```

Anteriormente, *TypeScript* solo te informaba sobre esto cuando realizabas una verificación de tipo en archivos *JavaScript*: cuando se usa la opción `checkJs` o se agrega `// @ts-check comentario` en la parte superior de tu archivo.

¡Ahora puedes obtener información similar para archivos *TypeScript* en tu editor!
*TypeScript* ahora proporciona sugerencias para cuando los nombres de los parámetros no coinciden entre tu función y tu comentario *JSDoc*.

![Diagnósticos sugeridos que se muestran en el editor para nombres de parámetros en comentarios *JSDoc* que no coinciden con un nombre de parámetro real.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2022/02/jsdoc-comentario-suggestions-4-6.png)

¡[Este cambio](https://github.com/microsoft/TypeScript/pull/47257) fue proporcionado por cortesía de [Alexander Tarasyuk](https://github.com/a-tarasyuk)!

## Más errores de sintaxis y enlaces en *JavaScript*

*TypeScript* ha ampliado su conjunto de errores de sintaxis y enlaces en archivos *JavaScript*.
Verás estos nuevos errores si abres archivos *JavaScript* en un editor como *Visual Studio* o *Visual Studio Code*, o si ejecutas código *JavaScript* a través del compilador *TypeScript*: incluso si no activas `checkJs` o agregas `// @ts-check` comentario en la parte superior de tus archivos.

Como ejemplo, si tienes dos declaraciones de una `const` en el mismo ámbito de un archivo *JavaScript*, *TypeScript* ahora emitirá un error en esas declaraciones.

```ts
const foo = 1234;
//    ~~~
// error: No se puede volver a declarar la variable de ámbito de bloque 'foo'.

// ...

const foo = 5678;
//    ~~~
// error: No se puede volver a declarar la variable de ámbito de bloque 'foo'.
```

Otro ejemplo, *TypeScript* te permitirá saber si un modificador se está utilizando incorrectamente.

```ts
function container() {
    export function foo() {
//  ~~~~~~
// error: Los modificadores no pueden aparecer aquí.
    }
}
```

Estos errores se pueden deshabilitar agregando `// @ts-nocheck` en la parte superior de tu archivo, pero estamos interesados ​​en escuchar algunos comentarios iniciales sobre cómo funciona para tu flujo de trabajo de *JavaScript*.
Lo puedes probar fácilmente para *Visual Studio Code* instalando la [Extensión *TypeScript* y *JavaScript Nightly*](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next), y lee más en la [primera](https://github.com/microsoft/TypeScript/pull/47067) y la [segunda](https://github.com/microsoft/TypeScript/pull/47075) solicitudes de extracción.

## Analizador de trazas de *TypeScript*

Ocasionalmente, los equipos pueden encontrar tipos que son computacionalmente costosos de crear y comparar con otros tipos.
[*TypeScript* tiene un indicador `--generateTrace`](https://github.com/microsoft/TypeScript/wiki/Performance#performance-tracing) para ayudar a identificar algunos de esos tipos costosos o, a veces, ayudar a diagnosticar problemas en el compilador de *TypeScript*.
Si bien la información generada por `--generateTrace` puede ser útil (especialmente con alguna información agregada en *TypeScript 4.6*), a menudo puede ser difícil de leer en los visualizadores de seguimiento existentes.

Recientemente publicamos una herramienta llamada [`@typescript/analyze-trace`](https://www.npmjs.com/package/@typescript/analyze-trace) para obtener una vista más digerible de esta información.
Si bien no esperamos que todos necesiten `analyze-trace`, creemos que puede ser útil para cualquier equipo que tenga [problemas de rendimiento de compilación con *TypeScript*](https://github.com/microsoft/TypeScript/wiki /Actuación).

Para obtener más información, [consulta el repositorio de la herramienta `analyze-trace`](https://github.com/microsoft/typescript-analyze-trace).

## Ruptura por cambios

### Las expresiones `rest` de objetos eliminan miembros no propagables de objetos genéricos

Las expresiones `rest` de objetos ahora eliminan miembros que parecen no ser propagables en objetos genéricos.
En el siguiente ejemplo...

```ts
class Thing {
  someProperty = 42;

  someMethod() {
    // ...
  }
}

function foo<T extends Thing>(x: T) {
  let { someProperty, ...rest } = x;

  // Solía funcionar, ¡ahora es un error!
  // La propiedad 'someMethod' no existe en el tipo 'Omit<T, "someProperty" | "someMethod">'.
  rest.someMethod();
}
```

la variable `rest` solía tener el tipo `Omit<T, "someProperty">` porque *TypeScript* analizaría estrictamente qué otras propiedades se desestructuraron.
Esto no modela cómo funcionaría `...rest` en una desestructuración de un tipo no genérico porque `someMethod` normalmente también se eliminaría.
En *TypeScript 4.6*, el tipo de `rest` es `Omit<T, "someProperty" | "someMethod">`.

Esto también puede surgir en los casos en que se desestructura desde `this`.
Al desestructurar `this` usando un elemento `...rest`, ahora se eliminan los miembros no propagables y no públicos, lo que es coherente con la desestructuración de instancias de una clase en otros lugares.

```ts
class Thing {
  someProperty = 42;

  someMethod() {
    // ...
  }

  someOtherMethod() {
    let { someProperty, ...rest } = this;

    // Solía funcionar, ¡ahora es un error!
    // La propiedad 'someMethod' no existe en el tipo 'Omit<T, "someProperty" | "someMethod">'.
    rest.someMethod();
  }
}
```

Para obtener más detalles, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/47078).

### Los archivos *JavaScript* siempre reciben errores gramaticales y de enlaces

Anteriormente, *TypeScript* ignoraba la mayoría de los errores gramaticales en *JavaScript*, además de usar accidentalmente la sintaxis de *TypeScript* en un archivo *JavaScript*.
*TypeScript* ahora muestra la sintaxis de *JavaScript* y los errores de vinculación en tu archivo, como el uso de modificadores incorrectos, declaraciones duplicadas y más.
Por lo general, estos serán más evidentes en *Visual Studio Code* o *Visual Studio*, pero también pueden ocurrir cuando se ejecuta código *JavaScript* a través del compilador de *TypeScript*.

Puede desactivar explícitamente estos errores insertando un comentario `@ts-nocheck` en la parte superior de tu archivo.

Para obtener más información, consulta [primero](https://github.com/microsoft/TypeScript/pull/47067) y [segundo](https://github.com/microsoft/TypeScript/pull/47075) cómo implementar solicitudes de extracción. para estas características.
