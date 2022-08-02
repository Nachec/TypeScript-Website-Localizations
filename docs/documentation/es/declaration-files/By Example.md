---
title: Declaración de referencia
layout: docs
permalink: /docs/handbook/declaration-files/by-example.html
oneline: "Cómo crear un archivo d.ts para un módulo"
---

El propósito de esta guía es enseñarte cómo escribir un archivo de definición de alta calidad.
Esta guía está estructurada mostrando la documentación de alguna *API*, junto con un ejemplo del uso de esa *API*,
y explica cómo escribir la declaración correspondiente.

Estos ejemplos están organizados en orden de complejidad aproximadamente creciente.

## Objetos con propiedades

*Documentación*

> La variable global `myLib` tiene una función `makeGreeting` para crear saludos,
> y una propiedad `numberOfGreetings` que indica el número de saludos realizados hasta el momento.

*Código*

```ts
let result = myLib.makeGreeting("hello, world");
console.log("El saludo calculado es: " + result);

let count = myLib.numberOfGreetings;
```

*Declaración*

Usa `declare namespace` para describir los tipos o valores a los que se accede mediante notación de puntos.

```ts
declare namespace myLib {
  function makeGreeting(s: string): string;
  let numberOfGreetings: number;
}
```

## Funciones sobrecargadas

*Documentación*

La función `getWidget` acepta un número y devuelve un *Widget*, o acepta una cadena y devuelve un arreglo de *Widget*s.

*Código*

```ts
let x: Widget = getWidget(43);

let arr: Widget[] = getWidget("all of them");
```

*Declaración*

```ts
declare function getWidget(n: number): Widget;
declare function getWidget(s: string): Widget[];
```

## Tipos reutilizables (Interfaces)

*Documentación*

> Al especificar un saludo, debes pasar un objeto `GreetingSettings`.
> Este objeto tiene las siguientes propiedades:
>
> 1 - greeting: Cadena obligatoria
>
> 2 - duration: Período de tiempo opcional (en milisegundos)
>
> 3 - color: Cadena opcional, p. ej. '#ff00ff'

*Código*

```ts
greet({
  greeting: "hello world",
  duration: 4000
});
```

*Declaración*

Usa una `interface` para definir un tipo con propiedades.

```ts
interface GreetingSettings {
  greeting: string;
  duracion?: number;
  color?: string;
}

declare function greet(setting: GreetingSettings): void;
```

## Tipos reutilizables (alias de tipos)

*Documentación*

> En cualquier lugar donde se espera un saludo, puedes proporcionar un `string`, una función que devuelve un `string` o una instancia de `Greeter`.

*Código*

```ts
function getGreeting() {
  return "hola";
}
class MyGreeter extends Greeter {}

greet("hello");
greet(getGreeting);
greet(new MyGreeter());
```

*Declaración*

Puedes usar un alias de tipo para crear una abreviatura para un tipo:

```ts
type GreetingLike = string | (() => string) | MyGreeter;

declare function greet(g: GreetingLike): void;
```

## Organizar tipos

*Documentación*

> El objeto `greeter` puede registrar en un archivo o mostrar una alerta.
> Puedes proporcionar `LogOptions` a `.log(...)` y opciones de alerta para `.alert(...)`

*Código*

```ts
const g = new Greeter("Hello");
g.log({ verbose: true });
g.alert({ modal: false, title: "Current Greeting" });
```

*Declaración*

Usa espacios de nombres para organizar tipos.

```ts
declare namespace GreetingLib {
  interface LogOptions {
    verbose?: boolean;
  }
  interface AlertOptions {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
```

También puedes crear espacios de nombres anidados en una declaración:

```ts
declare namespace GreetingLib.Options {
  // Referido vía GreetingLib.Options.Log
  interface Log {
    verbose?: boolean;
  }
  interface Alert {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
```

## Clases

*Documentación*

> Puedes crear un `greeter` creando una instancia del objeto `Greeter`, o crear un `greeter` personalizado extendiéndolo.

*Código*

```ts
const myGreeter = new Greeter("hello, world");
myGreeter.greeting = "howdy";
myGreeter.showGreeting();

class SpecialGreeter extends Greeter {
  constructor() {
    super("Very special greetings");
  }
}
```

*Declaración*

Usa `declare class` para describir una clase o un objeto similar a una clase.
Las clases pueden tener propiedades y métodos, así como un constructor.

```ts
declare class Greeter {
  constructor(greeting: string);

  greeting: string;
  showGreeting(): void;
}
```

## Variables globales

*Documentación*

> La variable global `foo` contiene la cantidad de artilugios presentes.

*Código*

```ts
console.log("Half the number of widgets is " + foo / 2);
```

*Declaración*

Usa `declare var` para declarar variables.
Si la variable es de solo lectura, puedes usar `declare const`.
También puedes usar `declare let` si la variable tiene un alcance de bloque.

```ts
/** El número de artilugios presentes */
declare var foo: number;
```

## Funciones globales

*Documentación*

> Puedes llamar a la función `greet` con una cadena para mostrar un saludo al usuario.

*Código*

```ts
greet("hello, world");
```

*Declaración*

Usa `declare function` para declarar funciones.

```ts
declare function greet(greeting: string): void;
```

