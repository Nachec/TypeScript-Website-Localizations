---
title: Qué hacer y qué no hacer
layout: docs
permalink: /docs/handbook/declaration-files/do-s-and-don-ts.html
oneline: "Recomendaciones para escribir archivos d.ts"
---

## Tipos generales

## `Number`, `String`, `Boolean`, `Symbol` y `Object`

❌ **No** uses los tipos `Number`, `String`, `Boolean`, `Symbol` u `Object`
Estos tipos se refieren a objetos empaquetados no primitivos que casi nunca se usan apropiadamente en el código *JavaScript*.

```ts
/* INCORRECTO */
function reverse(s: String): String;
```

✅ **Mejor** utiliza los tipos `number`, `string`, `boolean` y `symbol`.

```ts
/* Bien */
function reverse(s: string): string;
```

En lugar de `Object`, usa el tipo no primitivo `object` ([agregado en *TypeScript 2.2*](../release-notes/typescript-2-2.html#object-type)).

## Genéricos

❌ **No** hayas tenido un tipo genérico que no use su parámetro `type`.
Consulta más detalles en la [página de preguntas frecuentes de *TypeScript*](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-type-inference-work-on-this-interface-interface-foot--).

## `any`

❌ **No** uses `any` como tipo a menos que estés en el proceso de migrar un proyecto de *JavaScript* a *TypeScript*. El compilador *eficazmente* trata a `any` como "por favor, desactiva la comprobación de tipos para esta cosa". Es similar a poner un comentario `@ts-ignore` alrededor de cada uso de la variable. Esto puede ser muy útil cuando estás migrando por primera vez un proyecto de *JavaScript* a *TypeScript*, ya que puedes establecer el tipo para las cosas que aún no has migrado como `any`, pero en un proyecto de *TypeScript* completo estás deshabilitando la comprobación de tipos para cualquier parte de tu programa que la usa.

En los casos en los que no sepas qué tipo deseas aceptar, o cuando quieras aceptar algo porque lo pasarás a ciegas sin interactuar con él, puedes usar [`unknown`](/play/#example/unknown-and-never).

<!-- TODO: Más -->

## Tipos de devolución de llamada

## Tipos de retorno de devolución de llamada

<!-- TODO: En otras palabras; estos ejemplos no tienen sentido en el contexto de un archivo de declaración -->

❌ **No** uses el tipo de retorno `any` para devoluciones de llamada cuyo valor será ignorado:

```ts
/* INCORRECTO */
function fn(x: () => any) {
  x();
}
```

✅ **Mejor** usa el tipo de retorno `void` para devoluciones de llamada cuyo valor será ignorado:

```ts
/* Bien */
function fn(x: () => void) {
  x();
}
```

❔ **Por qué**: Usar `void` es más seguro porque evita que, accidentalmente, uses el valor de retorno de `x` de una manera sin marcar:

```ts
function fn(x: () => void) {
  var k = x(); // oops! destinado a hacer algo más
  k.doSomething(); // error, pero estaría bien si el tipo de retorno hubiera sido 'any'
}
```

## Parámetros opcionales en devoluciones de llamada

❌ **No** uses parámetros opcionales en devoluciones de llamada a menos que realmente lo quieras:

```ts
/* INCORRECTO */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime?: number) => void): void;
}
```

Esto tiene un significado muy específico: la devolución de llamada `done` se podría invocar con 1 argumento o se podría invocar con 2 argumentos.
El autor probablemente pretendía decir que a la devolución de llamada podría no importarle el parámetro `elapsedTime`,
pero no hay necesidad de hacer que el parámetro sea opcional para lograr esto:
siempre es legal proporcionar una devolución de llamada que acepte menos argumentos.

✅ **Mejor** escribe parámetros de devolución de llamada como no opcionales:

```ts
/* Bien */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime: number) => void): void;
}
```

## Sobrecargas y devoluciones de llamada

❌ **No** escribas sobrecargas separadas que difieran solo en la aridad de la devolución de llamada:

```ts
/* INCORRECTO */
declare function beforeAll(action: () => void, timeout?: number): void;
declare function beforeAll(
  accion: (hecho: DoneFn) => void,
  tiempoTerminado?: number
): void;
```

✅ **Mejor** escribe una sola sobrecarga usando la máxima aridad:

```ts
/* Bien */
declare function beforeAll(
  accion: (hecho: DoneFn) => void,
  tiempoTerminado?: number
): void;
```

❔ **Por qué**: Siempre es legal que una devolución de llamada ignore un parámetro, por lo que no hay necesidad de una sobrecarga más corta.
Proporcionar una devolución de llamada más corta primero permite pasar las funciones con tipado incorrecto porque coinciden con la primera sobrecarga.

## Sobrecarga de funciones

## Ordenar

❌ **No** pongas las sobrecargas más generales antes que las sobrecargas más específicas:

```ts
/* INCORRECTO */
declare function fn(x: unknown): unknown;
declare function fn(x: HTMLElement): number;
declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: unknown, wat?
```

✅ **Mejor** Ordena las sobrecargas colocando las firmas más generales después de las firmas más específicas:

```ts
/* Bien */
declare function fn(x: HTMLDivElement): string;
declare function fn(x: HTMLElement): number;
declare function fn(x: unknown): unknown;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: string, :)
```

❔ **Por qué**: *TypeScript* elige la *primera sobrecarga coincidente* al resolver llamadas a funciones.
Cuando una sobrecarga anterior es "más general" que una anterior, la última está efectivamente oculta y no se puede llamar.

## Usa parámetros opcionales

❌ **No** escribas varias sobrecargas que difieran solo en los parámetros finales:

```ts
/* INCORRECTO */
interface Example {
  diff(one: string): number;
  diff(one: string, two: string): number;
  diff(one: string, two: string, three: boolean): number;
}
```

✅ **Mejor** utiliza parámetros opcionales siempre que sea posible:

```ts
/* Bien */
interface Example {
  diff(one: string, two?: string, three?: boolean): number;
}
```

Ten en cuenta que este colapso solo debería ocurrir cuando todas las sobrecargas tienen el mismo tipo de retorno.

❔ **Por qué**: Esto es importante por dos razones.

*TypeScript* resuelve la compatibilidad de la firma al ver si se puede invocar cualquier firma del objetivo con los argumentos de la fuente,
*y se permiten argumentos extraños*.
Este código, por ejemplo, expone un error solo cuando la firma se escribe correctamente usando parámetros opcionales:

```ts
function fn(x: (a: string, b: number, c: number) => void) {}
var x: Example;
// Cuando se escribe con sobrecargas, está bien -- usa la primera sobrecarga
// Cuando se escribe con opcionales, correctamente un error
fn(x.diff);
```

La segunda razón es cuando un consumidor utiliza la función *TypeScript* de "comprobación estricta de null".
Debido a que los parámetros no especificados aparecen como `undefined` en *JavaScript*, generalmente es correcto pasar un `undefined` explícito a una función con argumentos opcionales.
Este código, por ejemplo, debería estar bien bajo nulos estrictos:

```ts
var x: Example;
// Cuando se escribe con sobrecargas, incorrectamente un error debido al paso de 'undefined' a 'string'
// Cuando se escribe con opcionales, correctamente OK
x.diff("something", true ? undefined : "hour");
```

## Usar tipos unión

❌ **No** escribas sobrecargas que difieren según el tipo del argumento en una sola posición:

```ts
/* INCORRECTO */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number): Moment;
  utcOffset(b: string): Moment;
}
```

✅ **Mejor** usa tipos unión siempre que sea posible:

```ts
/* Bien */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number | string): Moment;
}
```

Ten en cuenta que aquí no hicimos opcional a `b` porque los tipos devueltos de las firmas son diferentes.

❔ **Por qué**: Esto es importante para las personas que están "transmitiendo" un valor a su función:

```ts
function fn(x: string): void;
function fn(x: number): void;
function fn(x: number | string) {
  // Cuando se escribe con sobrecargas separadas, incorrectamente un error
  // Cuando se escribe con tipos unión, correctamente Ok
  return moment().utcOffset(x);
}
```
