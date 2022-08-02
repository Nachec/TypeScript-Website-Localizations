---
title: TypeScript 2.3
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-3.html
oneline: Notas de la versión de TypeScript 2.3
---

## Generadores e iteración para *ES5*/*ES3*

*Primero algo de terminología ES2016*:

##### Iteradores

[*ES2015* introdujo `Iterator`](http://www.ecma-international.org/ecma-262/6.0/#sec-iteration), que es un objeto que expone tres métodos, `next`, `return` y `throw`, según la siguiente interfaz:

```ts
interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}
```

Este tipo de iterador es útil para iterar sobre valores disponibles sincrónicamente, como los elementos de un arreglo o las claves de un mapa.
Se dice que un objeto que admite iteración es "iterable" si tiene un método `Symbol.iterator` que devuelve un objeto `Iterator`.

El protocolo `Iterator` también define el objetivo de algunas de las características de *ES2015* como `for..of` y el operador de propagación y el resto del arreglo en las asignaciones de desestructuración.

##### Generadores

[*ES2015* también introdujo "Generadores"](https://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-objects), que son funciones que se pueden utilizar para producir resultados de cálculo parciales a través de la función de la interfaz `Iterator` y la palabra clave `yield`.
Los generadores también pueden delegar llamadas internamente a otro iterable a través de `yield*`. Por ejemplo:

```ts
function* f() {
  yield 1;
  yield* [2, 3];
}
```

##### Nuevo `--downlevelIteration`

Anteriormente, los generadores solo eran compatibles si el objetivo era *ES6*/*ES2015* o posterior.
Además, las construcciones que operan en el protocolo Iterator, p. ej. `for..of` solo se admitían si operan en arreglos para objetivos por debajo de *ES6*/*ES2015*.

*TypeScript 2.3* agrega soporte completo para generadores y el protocolo `Iterator` para objetivos *ES3* y *ES5* con el indicador [`downlevelIteration`](/tsconfig#downlevelIteration).

Con [`downlevelIteration`](/tsconfig#downlevelIteration), el compilador usa un nuevo comportamiento de verificación y emisión de tipos que intenta llamar a un método `[Symbol.iterator]()` en el objeto iterado si se encuentra, y crea un iterador de arreglo sobre el objeto si no es así.

> Ten en cuenta que esto requiere un `Symbol.iterator` nativo o `Symbol.iterator` en el entorno de ejecución para cualquier valor que no sea de arreglo.

Las declaraciones `for..of`, Desestructuración y Dispersión de elementos en expresiones `Array`, `Call` y `New` admiten `Symbol.iterator` en *ES5*/*E3* si está disponible cuando se usa [`downlevelIteration`](/tsconfig#downlevelIteration), pero lo puede utilizar un `Array` incluso si no define `Symbol.iterator` en el entorno de ejecución o en tiempo de diseño.

## Iteración asincrónica

*TypeScript 2.3* agrega soporte para los iteradores y generadores asíncronos como se describe en la [propuesta *TC39*](https://github.com/tc39/proposal-async-iteration) actual.

##### Iteradores asíncronos

La iteración asincrónica introduce un `AsyncIterator`, que es similar a `Iterator`.
La diferencia radica en el hecho de que los métodos `next`, `return` y `throw` de un `AsyncIterator` devuelven una `Promise` para el resultado de la iteración, en lugar del resultado en sí.
Esto permite al llamador a enlistarse en una notificación asincrónica para el tiempo en el que el `AsyncIterator` ha avanzado hasta el punto de dar un valor.
Un `AsyncIterator` tiene la siguiente forma:

```ts
interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}
```

Se dice que un objeto que admite la iteración asíncrona es "iterable" si tiene un método `Symbol.asyncIterator` que devuelve un objeto `AsyncIterator`.

##### Generadores asincrónicos

La [propuesta de iteración asíncrona](https://github.com/tc39/proposal-async-iteration) presenta "generadores asíncronos", que son funciones asíncronas que también se pueden utilizar para producir resultados de cálculo parciales.
Los generadores asíncronos también pueden delegar llamadas a través de `yield*` a un iterable o `async` iterable:

```ts
async function* g() {
  yield 1;
  await sleep(100);
  yield* [2, 3];
  yield* (async function*() {
    await sleep(100);
    yield 4;
  })();
}
```

Al igual que con los generadores, los generadores asíncronos solo pueden ser declaraciones de función, expresiones de función o métodos de clases u objetos literales.
Las funciones de flecha no pueden ser generadores asíncronos. Los generadores asíncronos requieren una implementación global válida de `Promise` (ya sea nativa o un `polyfill` compatible con *ES2015*), además de una referencia válida de `Symbol.asyncIterator` (ya sea un símbolo nativo o un `shim`).

##### La declaración `for-await-of`

Finalmente, *ES2015* introdujo la declaración `for..of` como un medio de iterar sobre un iterable.
De manera similar, la propuesta de iteración asíncrona introduce la declaración `for..await..of` para iterar sobre un iterable asíncrono:

```ts
async function f() {
  for await (const x of g()) {
    console.log(x);
  }
}
```

La instrucción `for..await..of` solo es legal dentro de una función asíncrona o un generador asíncrono.

##### Advertencias

- Ten en cuenta que nuestro soporte para iteradores asíncronos depende del soporte para que `Symbol.asyncIterator` exista en el entorno de ejecución. Es posible que debas realizar un `polyfill` `Symbol.asyncIterator`, que para propósitos simples puede ser tan simple como: `(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");`
- También necesitas incluir `esnext` en tu opción [`lib`](/tsconfig#lib), para obtener la declaración `AsyncIterator` si aún no la tienes.
- Finalmente, si tu objetivo es *ES5* o *ES3*, también deberás configurar el indicador `--downlevelIterators`.

## Valores predeterminados de parámetros genéricos

*TypeScript 2.3* agrega soporte para declarar valores predeterminados para parámetros de tipo genérico.

##### Ejemplo

Considera una función que crea un nuevo `HTMLElement`, llamarlo sin argumentos genera un `Div`; opcionalmente, también puedes pasar una lista de hijos. Previamente lo tendrías que definir como:

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

Con valores predeterminados de parámetros genéricos podemos reducirlo a:

```ts
declare function create<T extends HTMLElement = HTMLDivElement, U = T[]>(
  element?: T,
  children?: U
): Container<T, U>;
```

Un parámetro genérico predeterminado sigue las siguientes reglas:

- Un parámetro de tipo se considera opcional si tiene un parámetro predeterminado.
- Los parámetros de tipo obligatorios no deben seguir a los parámetros de tipo opcionales.
- Los tipos predeterminados para un parámetro de tipo deben satisfacer la restricción del parámetro de tipo, si existe.
- Al especificar argumentos de tipo, solo debes especificar argumentos de tipo para el tipo de los parámetros requeridos. Los parámetros de tipo no especificados se resolverán a sus tipos predeterminados.
- Si se especifica un tipo predeterminado y la inferencia no puede elegir un candidato, se infiere el tipo predeterminado.
- Una declaración de clase o interfaz que se fusiona con una declaración de clase o interfaz existente puede introducir un parámetro por predefinido para un tipo existente.
- Una declaración de clase o interfaz que se fusiona con una declaración de clase o interfaz existente puede introducir un nuevo parámetro de tipo siempre que especifique un valor predeterminado.

## Nueva opción maestra `--strict`

Las nuevas comprobaciones agregadas a *TypeScript* a menudo están desactivadas de forma predeterminada para evitar romper los proyectos existentes.
Si bien evitar la rotura es algo bueno, esta estrategia tiene el inconveniente de hacer que sea cada vez más complejo elegir el nivel más alto de seguridad de tipos, y hacerlo requiere una acción explícita de inclusión voluntaria en cada versión de *TypeScript*.
Con la opción [`strict`](/tsconfig#strict) es posible elegir la máxima seguridad de tipos con el entendimiento de que las versiones más recientes del compilador pueden informar errores adicionales a medida que se agregan características mejoradas de verificación de tipos.

La nueva opción del compilador [`strict`](/tsconfig#strict) representa la configuración recomendada de varias opciones de verificación de tipos. Específicamente, especificar [`strict`](/tsconfig#strict) corresponde a especificar todas las siguientes opciones (y en el futuro puede incluir más opciones):

- [`strictNullChecks`](/tsconfig#strictNullChecks)
- [`noImplicitAny`](/tsconfig#noImplicitAny)
- [`noImplicitThis`](/tsconfig#noImplicitThis)
- [`alwaysStrict`](/tsconfig#alwaysStrict)

En términos exactos, la opción [`strict`](/tsconfig#strict) establece el valor `default` para las opciones del compilador enumeradas anteriormente.
Esto significa que aún es posible controlar individualmente las opciones.
Por ejemplo:

```sh
`--strict --noImplicitThis false`
```

tiene el efecto de activar todas las opciones estrictas *excepto* la opción [`noImplicitThis`](/tsconfig#noImplicitThis). Usando este esquema es posible expresar configuraciones que consisten en *todas* las opciones estrictas excepto algunas opciones listadas explícitamente.
En otras palabras, ahora es posible establecer de forma predeterminada el nivel más alto de seguridad de tipos pero optar por no participar en determinadas comprobaciones.

A partir de *TypeScript 2.3*, el `tsconfig.json` predeterminado generado por `tsc --init` incluye un `"strict": true` en la sección `"compilerOptions"`.
Por lo tanto, los proyectos nuevos que se inicien con `tsc --init` tendrán, de manera predeterminada, habilitado el nivel más alto de seguridad de tipos.

## Salida mejorada de `--init`

Además de configurar [`strict`](/tsconfig#strict) de forma predeterminada, `tsc --init` tiene una salida mejorada. Los archivos predeterminados `tsconfig.json` generados por `tsc --init` ahora incluyen un conjunto de opciones comunes del compilador junto con sus descripciones comentadas.
Simplemente elimina los comentarios de la configuración que deseas establecer para obtener el comportamiento deseado; esperamos que la nueva salida simplifique la configuración de nuevos proyectos y mantenga los archivos de configuración legibles a medida que crecen los proyectos.

## Errores en archivos `.js` con `--checkJs`

De forma predeterminada, el compilador de *TypeScript* no informa ningún error en los archivos `.js`, incluido el uso de [`allowJs`](/tsconfig#allowJs).
Con *TypeScript 2.3*, los errores de verificación de tipo también se pueden informar en archivos `.js` con [`checkJs`](/tsconfig#checkJs).

Puedes omitir la comprobación de algunos archivos agregando comentarios `//@ts-nocheck`; a la inversa, puedes optar por comprobar sólo unos pocos archivos `.js` añadiendo comentarios `//@ts-check` sobre ellos sin establecer [`checkJs`](/tsconfig#checkJs).
También puedes ignorar errores en líneas específicas agregando `//@ts-ignore` en la línea anterior.

Los archivos `.js` se siguen comprobando para garantizar que solo incluyan funciones estándar de *ECMAScript*; las anotaciones de tipo solo se permiten en archivos `.ts` y se marcan como errores en los archivos `.js`.
Los comentarios *JSDoc* se pueden utilizar para agregar información de tipo a tu código *JavaScript*, consulta [Documentación de soporte *JSDoc*](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript) para obtener más detalles sobre las Construcciones *JSDoc*.

Consulta la [Documentación de archivos sobre la comprobación de tipos *JavaScript*](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files) para obtener más detalles.
