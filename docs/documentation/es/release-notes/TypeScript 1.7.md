---
title: TypeScript 1.7
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-7.html
oneline: Notas de la versión de TypeScript 1.7
---

## Compatibilidad con `async`/`await` en los destinos *ES6* (*Node v4+*)

*TypeScript* ahora admite funciones asíncronas para motores que tienen soporte nativo para generadores *ES6*, p. ej. *Node v4* y superior.
Las funciones asincrónicas tienen como prefijo la palabra clave `async`;
`await` suspende la ejecución hasta que se cumpla una promesa de devolución de función asíncrona y desenvuelve el valor de la `Promise` devuelta.

##### Ejemplo

En el siguiente ejemplo, cada elemento de entrada se imprimirá uno a la vez con un retraso de 400ms:

```ts
"use strict";

// printDelayed es una 'Promise<void>'
async function printDelayed(elements: string[]) {
  for (const element of elements) {
    await delay(400);
    console.log(element);
  }
}

async function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

printDelayed(["Hello", "beautiful", "asynchronous", "world"]).then(() => {
  console.log();
  console.log("Printed every element!");
});
```

Para obtener más información, consulta la [referencia de función asíncrona](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function).

## Soporte para `--target ES6` con `--module`

*TypeScript 1.7* agrega `ES6` a la lista de opciones disponibles para la opción [`module`](/tsconfig#module) y te permite especificar la salida del módulo al apuntar a `ES6`.
Esto proporciona más flexibilidad para apuntar exactamente a las funciones que deseas en entornos de ejecución específicos.

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "amd",
    "target": "es6"
  }
}
```

## `this`-tipado

Es un patrón común devolver el objeto actual (es decir, `this`) de un método para crear [*API*s de estilo fluido](https://wikipedia.org/wiki/Fluent_interface).
Por ejemplo, considera el siguiente módulo `BasicCalculator`:

```ts
export default class BasicCalculator {
  public constructor(protected value: number = 0) {}

  public currentValue(): number {
    return this.value;
  }

  public add(operand: number) {
    this.value += operand;
    return this;
  }

  public subtract(operand: number) {
    this.value -= operand;
    return this;
  }

  public multiply(operand: number) {
    this.value *= operand;
    return this;
  }

  public divide(operand: number) {
    this.value /= operand;
    return this;
  }
}
```

Un usuario podría expresar `2 * 5 + 1` como

```ts
import calc from "./BasicCalculator";

let v = new calc(2).multiply(5).add(1).currentValue();
```

Esto a menudo abre formas muy elegantes de escribir código; sin embargo, hubo un problema para las clases que querían extenderse desde `BasicCalculator`.
Imagina que un usuario quisiera empezar a escribir una 'Calculadora científica':

```ts
import BasicCalculator from "./BasicCalculator";

export default class ScientificCalculator extends BasicCalculator {
  public constructor(value = 0) {
    super(value);
  }

  public square() {
    this.value = this.value ** 2;
    return this;
  }

  public sin() {
    this.value = Math.sin(this.value);
    return this;
  }
}
```

Debido a que *TypeScript* solía inferir el tipo `BasicCalculator` para cada método en `BasicCalculator` que devolvía `this`, el sistema de tipos olvidaría que tenía `ScientificCalculator` siempre que se usara un método `BasicCalculator`.

Por ejemplo:

```ts
import calc from "./ScientificCalculator";

let v = new calc(0.5)
  .square()
  .divide(2)
  .sin() // Error: 'BasicCalculator' has no 'sin' method.
  .currentValue();
```

Este ya no es el caso ⏤ *TypeScript* ahora infiere que `this` tiene un tipo especial llamado `this` siempre que esté dentro de un método de instancia de una clase.
El tipo `this` se escribe así, y básicamente significa "el tipo del lado izquierdo del punto en una llamada a un método".

El tipo `this` también es útil con tipos de intersección para describir bibliotecas (por ejemplo, *Ember.js*) que usan patrones de estilo mixin para describir la herencia:

```ts
interface MyType {
  extend<T>(other: T): this & T;
}
```

## Operador de exponenciación *ES7*

*TypeScript 1.7* admite los próximos [operadores de exponenciación *ES7*/*ES2016*](https://github.com/rwaldron/exponentiation-operator): `**` y `**=`.
Los operadores se transformarán en la salida a *ES3*/*ES5* usando `Math.pow`.

##### Ejemplo

```ts
var x = 2 ** 3;
var y = 10;
y **= 2;
var z = -(4 ** 3);
```

Generará la siguiente salida de *JavaScript*:

```js
var x = Math.pow(2, 3);
var y = 10;
y = Math.pow(y, 2);
var z = -Math.pow(4, 3);
```

## Comprobación mejorada de la desestructuración del objeto literal

*TypeScript 1.7* hace que la verificación de patrones de desestructuración con un objeto literal o iniciadores de arreglo literal sea menos rígida y más intuitiva.

Cuando un objeto literal se escribe contextualmente por el tipo implícito de un patrón de vinculación de objeto:

- Las propiedades con valores predeterminados en el patrón de vinculación de objetos se vuelven opcionales en el objeto literal.
- Las propiedades del patrón de vinculación de objetos que no coinciden en el objeto literal deben tener un valor predeterminado en el patrón de vinculación de objetos y se agregan automáticamente al tipo del objeto literal.
- Las propiedades del objeto literal que no coinciden con el patrón de vinculación del objeto son un error.

Cuando un arreglo literal se escribe contextualmente por el tipo implícito de un patrón de enlace de arreglo:

- Los elementos del patrón de enlace de arreglo que no coinciden en el arreglo literal deben tener un valor predeterminado en el patrón de enlace de arreglo y se agregan automáticamente al tipo de arreglo literal.

##### Ejemplo

```ts
// El tipo de f1 es (arg ?: { x?: number, y?: number }) => void
function f1({ x = 0, y = 0 } = {}) {}

// Y se puede llamar como:
f1();
f1({});
f1({ x: 1 });
f1({ y: 1 });
f1({ x: 1, y: 1 });

// El tipo de f2 es (arg?: (x: number, y?: number) => void
function f2({ x, y = 0 } = { x: 0 }) {}

f2();
f2({}); // Error, x no es opcional
f2({ x: 1 });
f2({ y: 1 }); // Error, x no es opcional
f2({ x: 1, y: 1 });
```

## Soporte para decoradores al apuntar a *ES3*

Los decoradores ahora están permitidos al apuntar a *ES3*.
*TypeScript 1.7* elimina el uso específico de *ES5* de `reduceRight` del ayudante `__decorate`.
Los cambios también incluyen llamadas en línea a `Object.getOwnPropertyDescriptor` y a `Object.defineProperty` de una manera compatible con versiones anteriores que permite limpiar el emisor para *ES5* y luego eliminando varias llamadas repetitivas a los métodos de `Object` antes mencionados.
