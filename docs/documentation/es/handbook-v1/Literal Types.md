---
title: Tipos literales
layout: docs
permalink: /docs/handbook/literal-types.html
oneline: Usar tipos literales con TypeScript
handbook: "true"
deprecated_by: /docs/handbook/2/everyday-types.html#literal-types
---

Un literal es un subtipo más concreto de un tipo colectivo.
Lo que esto significa es que `"Hello World"` es un `string`, pero un `string` no es `"Hello World"` dentro del sistema de tipos.

Hay tres conjuntos de tipos literales disponibles en *TypeScript* en la actualidad: `strings`, `numbers` y valores booleanos; al usar tipos literales, puedes permitir un valor exacto que debe tener una cadena, un número o un booleano.

## Reducción literal

Cuando declaras una variable a través de `var` o `let`, le estás diciendo al compilador que existe la posibilidad de que esta variable cambie su contenido.
En contraste, usar `const` para declarar una variable informará a *TypeScript* que este objeto nunca cambiará.

```ts twoslash
// Garantizamos que esta variable
// helloWorld nunca cambiará, usando const.

// Entonces, TypeScript establece el tipo como "Hello World", no string
const helloWorld = "Hello World";

// Por otro lado, un let puede cambiar, por lo que el compilador lo declara un string
let hiWorld = "Hi World";
```

El proceso de pasar de un número infinito de casos potenciales (hay un número infinito de posibles valores de cadena) a un número finito más pequeño de casos potenciales (en el caso de `helloWorld`: 1) se llama reducción.

## Tipos de cadena literal

En la práctica, los tipos de cadenas literales se combinan muy bien con los tipos unión, protectores de tipo y alias de tipo.
Puedes usar estas características para obtener un comportamiento como el de `enum` en cadenas.

```ts twoslash
// @errors: 2345
type Easing = "ease-in" | "ease-out" | "ease-in-out";

class UIElement {
  animate(dx: number, dy: number, suavizado: Easing) {
    if (easing === "ease-in") {
      // ...
    } else if (easing === "ease-out") {
    } else if (easing === "ease-in-out") {
    } else {
      // Es posible que alguien pueda llegar a esto
      // sin embargo, ignora tus tipos.
    }
  }
}

let button = new UIElement();
button.animate(0, 0, "ease-in");
button.animate(0, 0, "uneasy");
```

Puedes pasar cualquiera de las tres cadenas permitidas, pero cualquier otra cadena dará el error

```
El argumento de tipo "`uneasy`" no se puede asignar al parámetro del tipo `"ease-in" | "ease-out" | "ease-in-out"`
```

Los tipos literales de cadena se pueden usar de la misma manera para distinguir sobrecargas:

```ts
function createElement(tagName: "img"): HTMLImageElement;
function createElement(tagName: "input"): HTMLInputElement;
// ... más sobrecargas ...
function createElement(tagName: string): Element {
  // ... el código va aquí ...
}
```

## Tipos literales numéricos

*TypeScript* también tiene tipos literales numéricos, que actúan igual que los literales de cadena anteriores.

```ts twoslash
function rollDice(): 1 | 2 | 3 | 4 | 5 | 6 {
  return (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}

const result = rollDice();
```

Un caso común para su uso es para describir los valores de configuración:

```ts twoslash
/** Crea un mapa centrado en loc/lat */
declare function setupMap(config: MapConfig): void;
// ---cut---
interface MapConfig {
  lng: number;
  lat: number;
  tileSize: 8 | 16 | 32;
}

setupMap({ lng: -73.935242, lat: 40.73061, tileSize: 16 });
```

## Tipos booleanos literales

*TypeScript* también tiene tipos booleanos literales. Los puedes utilizar para restringir los valores de los objetos cuyas propiedades están interrelacionadas.

```ts twoslash
interface ValidationSuccess {
  isValid: true;
  razon: null;
}

interface FallaValidacion {
  isValid: false;
  razon: string;
}

type ValidationResult = ValidationSuccess | ValidationFailure;
```
