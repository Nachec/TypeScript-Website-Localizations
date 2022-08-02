---
title: Iteradores y generadores
layout: docs
permalink: /docs/handbook/iterators-and-generators.html
oneline: Cómo trabajan los iteradores y generadores en TypeScript
translatable: true
---

## Iterables

Un objeto se considera iterable si tiene una implementación para la propiedad [`Symbol.iterator`](symbols.html#symboliterator).
Algunos tipos integrados como `Array`, `Map`, `Set`, `String`, `Int32Array`, `Uint32Array`, etc. tienen su propiedad `Symbol.iterator` ya implementada.
La función `Symbol.iterator` en un objeto es responsable de devolver la lista de valores para iterar.

### Interfaz `Iterable`

`Iterable` es un tipo que podemos usar si queremos incluir los tipos enumerados anteriormente que son iterables. Aquí tienes un ejemplo:

```ts
function toArray<X>(xs: Iterable<X>): X[] {
  return [...xs]
}
```

### Declaraciones `for..of`

`for..of` recorre un objeto iterable, invocando la propiedad `Symbol.iterator` en el objeto.
Aquí hay un bucle simple `for..of` en un arreglo:

```ts
let someArray = [1, "string", false];

for (let entry of someArray) {
  console.log(entry); // 1, "string", false
}
```

### Declaraciones `for..of` vs. `for..in`

Tanto las declaraciones `for..of` como `for..in` iteran sobre listas; los valores iterados son diferentes, sin embargo, `for..in` devuelve una lista de `keys` en el objeto que se itera, mientras que `for..of` devuelve una lista de `values` de las propiedades numéricas del objeto que se itera.

Aquí hay un ejemplo que demuestra esta distinción:

```ts
let list = [4, 5, 6];

for (let i in list) {
  console.log(i); // "0", "1", "2",
}

for (let i of list) {
  console.log(i); // 4, 5, 6
}
```

Otra distinción es que `for..in` opera sobre cualquier objeto; sirve como una forma de inspeccionar las propiedades de este objeto.
`for..of` por otro lado, principalmente está interesado en valores de objetos iterables. Los objetos integrados como `Map` y `Set` implementan la propiedad `Symbol.iterator` que permite el acceso a los valores almacenados.

```ts
let pets = new Set(["Cat", "Dog", "Hamster"]);
pets["species"] = "mammals";

for (let pet in pets) {
  console.log(pet); // "species"
}

for (let pet of pets) {
  console.log(pet); // "Cat", "Dog", "Hamster"
}
```

### Generar código

#### Orientación a *ES5* y *ES3*

Al apuntar a un motor compatible con *ES5* o *ES3*, los iteradores solo se permiten en valores de tipo `Array`.
Es un error usar bucles `for..of` en valores que no son `Array`, incluso si estos valores que no son `Array` implementan la propiedad `Symbol.iterator`.

El compilador generará un bucle `for` simple para un bucle `for..of`, por ejemplo:

```ts
let numbers = [1, 2, 3];
for (let num of numbers) {
  console.log(num);
}
```

se generará como:

```js
var numbers = [1, 2, 3];
for (var _i = 0; _i < numbers.length; _i++) {simple 
  var num = numbers[_i];
  console.log(num);
}
```

#### Orientación a *ECMAScript* 2015 y versiones posteriores

Al apuntar a un motor compatible con *ECMAScript* 2015, el compilador generará bucles `for..of` para apuntar a la implementación del iterador incorporado en el motor.
