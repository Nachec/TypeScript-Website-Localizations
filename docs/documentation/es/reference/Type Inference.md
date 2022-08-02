---
title: Inferencia de tipo
layout: docs
permalink: /docs/handbook/type-inference.html
oneline: Cómo funciona el análisis del flujo de código en TypeScript
translatable: true
---

En *TypeScript*, hay varios lugares donde se usa la inferencia de tipo para proporcionar información de tipo cuando no hay una anotación de tipo explícita. Por ejemplo, en este código

```ts twoslash
let x = 3;
//  ^?
```

Se infiere que el tipo de la variable `x` es `number`.
Este tipo de inferencia tiene lugar al iniciar variables y miembros, establecer valores predeterminados de parámetros y determinar los tipos de retorno de funciones.

En la mayoría de los casos, la inferencia de tipos es sencilla.
En las siguientes secciones, exploraremos algunos de los matices en cómo se infieren los tipos.

## Mejor tipo común

Cuando se hace una inferencia de tipo a partir de varias expresiones, los tipos de esas expresiones se utilizan para calcular el "mejor tipo común". Por ejemplo:

```ts twoslash
let x = [0, 1, null];
//  ^?
```

Para inferir el tipo de `x` en el ejemplo anterior, debemos considerar el tipo de cada elemento de la matriz.
Aquí se nos dan dos opciones para el tipo de arreglo: `number` y `null`.
El mejor algoritmo de tipo común considera cada tipo de candidato y elige el tipo que es compatible con todos los demás candidatos.

Debido a que el mejor tipo común se debe elegir entre los tipos candidatos proporcionados, hay algunos casos en los que los tipos comparten una estructura común, pero ningún tipo es el super tipo de todos los tipos candidatos. Por ejemplo:

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
let zoo = [new Rhino(), new Elephant(), new Snake()];
//    ^?
```

Idealmente, podríamos querer que `zoo` se infiera como un `Animal[] `, pero debido a que no hay ningún objeto que sea estrictamente de tipo `Animal` en el arreglo, no hacemos ninguna inferencia sobre el tipo de elemento del arreglo.
Para corregir esto, en su lugar, proporciona explícitamente el tipo cuando ningún tipo sea un súper tipo de todos los demás candidatos:

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
let zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()];
//    ^?
```

Cuando no se encuentra el mejor tipo común, la inferencia resultante es el tipo de arreglo de unión, `(Rhino | Elephant | Snake)[]`.

## Tipado contextual

La inferencia de tipos también funciona en "la otra dirección" en algunos casos en *TypeScript*.
Esto se conoce como "tipado contextual". El tipado contextual ocurre cuando el tipo de expresión está implícito en su ubicación. Por ejemplo:

```ts twoslash
// @errors: 2339
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button);
  console.log(mouseEvent.kangaroo);
};
```

Aquí, el verificador de tipos de *TypeScript* utilizó el tipo de la función `Window.onmousedown` para inferir el tipo de expresión de la función en el lado derecho de la asignación.
Cuando lo hizo, pudo inferir el [tipo](https://developer.mozilla.org/docs/Web/API/MouseEvent) del parámetro `mouseEvent`, que contiene una propiedad `button`, pero no es una propiedad de `kangaroo`.

Esto funciona porque `window` ya tiene `onmousedown` declarado en su tipo:

```ts
// Declara que hay una variable global llamada 'window'
declare var window: Window & typeof globalThis;

// Que se declara como (simplificado):
interface Window extends GlobalEventHandlers {
  // ...
}

// Que define una gran cantidad de eventos de controlador conocidos
interface GlobalEventHandlers {
  onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
  // ...
}
```

*TypeScript* también es lo suficientemente inteligente como para inferir tipos en otros contextos:

```ts twoslash
// @errors: 2339
window.onscroll = function (uiEvent) {
  console.log(uiEvent.button);
};
```

Basado en el hecho de que la función anterior se está asignando a `Window.onscroll`, *TypeScript* sabe que `uiEvent` es un [`UIEvent`](https://developer.mozilla.org/docs/Web/API/UIEvent), y no un [`MouseEvent`](https://developer.mozilla.org/docs/Web/API/MouseEvent) como el ejemplo anterior. Los objetos `UIEvent` no contienen la propiedad `button`, por lo que *TypeScript* arrojará un error.

Si esta función no estuviera en una posición de tipo contextual, el argumento de la función tendría implícitamente el tipo `any`, y no se emitiría ningún error (a menos que estés usando la opción [`noImplicitAny`](/tsconfig#noImplicitAny)):

```ts twoslash
// @noImplicitAny: false
const handler = function (uiEvent) {
  console.log(uiEvent.button); // <- Bien
};
```

También podemos dar explícitamente información de tipo al argumento de la función para redefinir cualquier tipo contextual:

```ts twoslash
window.onscroll = function (uiEvent: any) {
  console.log(uiEvent.button); // <- Ahora, no se da ningún error
};
```

Sin embargo, este código registrará `undefined`, ya que `uiEvent` no tiene una propiedad llamada `button`.

El tipado contextual se aplica en muchos casos.
Los casos comunes incluyen argumentos para llamadas a funciones, el lado derecho de las asignaciones, aserciones de tipo, miembros de objetos, arreglos literales y declaraciones de retorno.
El tipo contextual también actúa como un tipo candidato en el mejor tipo común. Por ejemplo:

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
function createZoo(): Animal[] {
  return [new Rhino(), new Elephant(), new Snake()];
}
```

En este ejemplo, el mejor tipo común tiene un conjunto de cuatro candidatos: `Animal`, `Rhino`, `Elephant` y `Snake`.
De estos, `Animal` se puede elegir mediante el mejor algoritmo de tipo común.
