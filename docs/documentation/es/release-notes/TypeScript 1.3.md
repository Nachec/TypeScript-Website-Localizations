---
title: TypeScript 1.3
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-3.html
oneline: Notas de la versión de TypeScript 1.3
---

## `protected`

El nuevo modificador `protected` en las clases funciona como lo hace en lenguajes familiares como *C++*, *C#* y *Java*. Un miembro `protected` de una clase es visible solo dentro de las subclases de la clase en la que está declarado:

```ts
class Thing {
  protected doSomething() {
    /* ... */
  }
}

class MyThing extends Thing {
  public myMethod() {
    // Bien, puede acceder al miembro protegido de la subclase
    this.doSomething();
  }
}
var t = new MyThing();
t.doSomething(); // Error, no se puede llamar a un miembro protegido desde fuera de la clase
```

## Tipos `tupla`

Los tipos `tupla` expresan un arreglo en la que se conoce el tipo de ciertos elementos, pero no es necesario que sea el mismo. Por ejemplo, es posible que desees representar un arreglo con un `string` en la posición 0 y un `number` en la posición 1:

```ts
// Declara un tipo tupla
var x: [string, number];
// La inicia
x = ["hello", 10]; // Bien
// La Inicia incorrectamente
x = [10, "hello"]; // Error
```

Al acceder a un elemento con un índice conocido, se recupera el tipo correcto:

```ts
console.log(x[0].substr(1)); // Bien
console.log(x[1].substr(1)); // Error, 'number' no tiene 'substr'
```

Ten en cuenta que en *TypeScript 1.4*, al acceder a un elemento fuera del conjunto de índices conocidos, se usa un tipo `union` en su lugar:

```ts
x[3] = "world"; // Bien
console.log(x[5].toString()); // Bien, 'string' y 'number' ambos tienen 'toString'
x[6] = true; // Error, booleano no es un número ni una cadena
```
