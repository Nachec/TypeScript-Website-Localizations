---
title: Fusión de declaraciones
layout: docs
permalink: /docs/handbook/declaration-merging.html
oneline: Cómo trabajan los espacios de nombres e interfaces
translatable: true
---

## Introducción

Algunos de los conceptos únicos en *TypeScript* describen la forma de los objetos *JavaScript* a nivel de tipo.
Un ejemplo que especialmente es exclusivo de *TypeScript* es el concepto de 'combinación de declaraciones'.
Comprender este concepto te dará una ventaja cuando trabajes con *JavaScript* existente.
También abre la puerta a conceptos de abstracción más avanzados.

A los efectos de este artículo, "fusión de declaraciones" significa que el compilador fusiona dos declaraciones independientes declaradas con el mismo nombre en una única definición.
Esta definición fusionada tiene las características de las dos declaraciones originales.
Se puede fusionar cualquier número de declaraciones; no se limita a solo dos declaraciones.

## Conceptos básicos

En *TypeScript*, una declaración crea entidades en al menos uno de tres grupos: espacio de nombres, tipo o valor.
Las declaraciones de creación de espacios de nombres crean un espacio de nombres, que contiene nombres a los que se accede mediante una notación de puntos.
Las declaraciones de creación de tipos hacen precisamente eso: crean un tipo que es visible con la forma declarada y vinculado al nombre dado.
Por último, las declaraciones de creación de valor crean valores que son visibles en la salida *JavaScript*.

| Declaración de tipo | Espacio de nombres | Tipo | Valor |
| ---------------- | :-------: | :--: | :---: |
| `Namespace`        |     X     |      |   X   |
| `Class`            |           |  X   |   X   |
| `Enum`             |           |  X   |   X   |
| `Interface`        |           |  X   |       |
| Alias de tipo      |           |  X   |       |
| `Function`         |           |      |   X   |
| Variable         |           |      |   X   |

Comprender lo que se crea con cada declaración te ayudará a comprender qué se fusiona cuando realizas una fusión de declaraciones.

## Fusionar interfaces

El tipo más simple, y quizás el más común, de combinación de declaraciones es la combinación de interfaces.
En el nivel más básico, la fusión une mecánicamente a los miembros de ambas declaraciones en una única interfaz con el mismo nombre.

```ts
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

let box: Box = { height: 5, width: 6, scale: 10 };
```

Los miembros no funcionales de las interfaces deben ser únicos.
Si no son únicos, deben ser del mismo tipo.
El compilador emitirá un error si las interfaces declaran un miembro no funcional con el mismo nombre, pero de diferentes tipos.

Para los miembros de función, cada miembro de función del mismo nombre se trata como si describiera una sobrecarga de la misma función.
También es de destacar que en el caso de la interfaz `A` que se fusiona con la interfaz `A` posterior, la segunda interfaz tendrá una precedencia mayor que la primera.

Es decir, en el ejemplo:

```ts
interface Cloner {
  clone(animal: Animal): Animal;
}

interface Cloner {
  clone(animal: Sheep): Sheep;
}

interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```

Las tres interfaces se fusionarán para crear una única declaración de la siguiente manera:

```ts
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```

Observa que los elementos de cada grupo mantienen el mismo orden, pero los grupos mismos se fusionan con los conjuntos sobrecargados posteriores ordenados primero.

Una excepción a esta regla son las firmas especializadas.
Si una firma tiene un parámetro cuyo tipo es un tipo de cadena literal  `single` (por ejemplo, no una unión de cadenas literales), entonces aparecerá en la parte superior de su lista de sobrecarga combinada.

Por ejemplo, las siguientes interfaces se fusionarán:

```ts
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}
```

La declaración combinada resultante de `Document` será la siguiente:

```ts
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}
```

## Fusionar espacios de nombres

De manera similar a las interfaces, los espacios de nombres del mismo nombre también fusionarán sus miembros.
Dado que los espacios de nombres crean tanto un espacio de nombres como un valor, debemos comprender cómo se fusionan ambos.

Para fusionar los espacios de nombres, las definiciones de tipos de las interfaces exportadas declaradas en cada espacio de nombres se fusionan, formando un único espacio de nombres con definiciones de interfaces fusionadas en su interior.

Para fusionar el valor del espacio de nombres, en cada sitio de declaración, si ya existe un espacio de nombres con el nombre dado, se amplía aún más tomando el espacio de nombres existente y agregando los miembros exportados del segundo espacio de nombres al primero.

La combinación de declaraciones de `Animals` en este ejemplo:

```ts
namespace Animals {
  export class Zebra {}
}

namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Dog {}
}
```

es equivalente a:

```ts
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }

  export class Zebra {}
  export class Dog {}
}
```

Este modelo de fusión de espacios de nombres es un punto de partida útil, pero también debemos comprender qué sucede con los miembros no exportados.
Los miembros no exportados solo son visibles en el espacio de nombres original (no combinado). Esto significa que después de la fusión, los miembros fusionados que proceden de otras declaraciones no pueden ver miembros no exportados.

Podemos ver esto claramente en este ejemplo:

```ts
namespace Animal {
  let haveMuscles = true;

  export function animalsHaveMuscles() {
    return haveMuscles;
  }
}

namespace Animal {
  export function doAnimalsHaveMuscles() {
    return haveMuscles; // Error, porque haveMuscles no es accesible aquí
  }
}
```

Debido a que `haveMuscles` no se exporta, solo la función `animalsHaveMuscles` que comparte el mismo espacio de nombres no combinado puede ver el símbolo.
La función `doAnimalsHaveMuscles`, aunque es parte del espacio de nombres `Animal` fusionado, no puede ver este miembro no exportado.

## Fusionar espacios de nombres con clases, funciones y enumeraciones

Los espacios de nombres son lo suficientemente flexibles como para fusionarse con otras declaraciones de tipo.
Para hacerlo, la declaración del espacio de nombres debe seguir a la declaración con la que se fusionará. La declaración resultante tiene propiedades de ambos tipos de declaración.
*TypeScript* utiliza esta capacidad para modelar algunos de los patrones en *JavaScript*, así como en otros lenguajes de programación.

## Fusionar espacios de nombres con clases

Esto le da al usuario una forma de describir las clases internas.

```ts
class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel {}
}
```

Las reglas de visibilidad para los miembros fusionados son las mismas que se describen en la sección [Fusionar espacios de nombres](./statement-merging.html#fusionar-espacios-de-nombres), por lo que debemos exportar la clase `AlbumLabel` para que la clase fusionada la vea.
El resultado final es una clase administrada dentro de otra clase.
También puedes usar espacios de nombres para agregar más miembros estáticos a una clase existente.

Además del patrón de clases internas, es posible que también estés familiarizado con la práctica de *JavaScript* de crear una función y luego extender la función aún más agregando propiedades a la función.
*TypeScript* utiliza la combinación de declaraciones para crear definiciones como esta de forma segura.

```ts
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}

namespace buildLabel {
  export let suffix = "";
  export let prefix = "Hello, ";
}

console.log(buildLabel("Sam Smith"));
```

De manera similar, los espacios de nombres se pueden usar para extender enumeraciones con miembros estáticos:

```ts
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}

namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    } else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    } else if (colorName == "magenta") {
      return Color.red + Color.blue;
    } else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
```

## Fusiones no permitidas

No todas las fusiones están permitidas en *TypeScript*.
Actualmente, las clases no se pueden fusionar con otras clases o con variables.
Para obtener información sobre cómo imitar la fusión de clases, consulta la sección [`mixins` en *TypeScript*](/docs/handbook/mixins.html).

## Aumento de módulo

Aunque los módulos de *JavaScript* no admiten la fusión, puedes parchear objetos existentes importándolos y luego actualizándolos.
Veamos un ejemplo de juguete observable:

```ts
// observable.ts
export class Observable<T> {
  // ... la implementación se deja como ejercicio para el lector ...
}

// map.ts
import { Observable } from "./observable";
Observable.prototype.map = function (f) {
  // ... otro ejercicio para el lector
};
```

Esto también funciona bien en *TypeScript*, pero el compilador no conoce `Observable.prototype.map`.
Puedes utilizar el aumento de módulos para informar al compilador sobre ello:

```ts
// observable.ts
export class Observable<T> {
  // ... la implementación se deja como ejercicio para el lector ...
}

// map.ts
import { Observable } from "./observable";
declare module "./observable" {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}
Observable.prototype.map = function (f) {
  // ... otro ejercicio para el lector
};

// consumer.ts
import { Observable } from "./observable";
import "./map";
let o: Observable<number>;
o.map((x) => x.toFixed());
```

El nombre del módulo se resuelve de la misma manera que los especificadores de módulo en `import`/`export`.
Consulta [Módulos](/docs/handbook/modules.html) para obtener más información.
Luego, las declaraciones en un aumento se fusionan como si estuvieran declaradas en el mismo archivo que el original.

Sin embargo, hay dos limitaciones a tener en cuenta:

1. No puedes hacer nuevas declaraciones de nivel superior en el aumento: solo parches a declaraciones existentes.
2. Las exportaciones predeterminadas tampoco se pueden aumentar, solo las exportaciones con nombre (ya que necesitas aumentar una exportación por su nombre exportado, y `default` es una palabra reservada ⏤ consulta [#14080](https://github.com/Microsoft/TypeScript/issues/14080) para obtener más detalles)

## Aumento global

También puedes agregar declaraciones al alcance global desde dentro de un módulo:

```ts
// observable.ts
export class Observable<T> {
  // ... todavía no hay implementación ...
}

declare global {
  interface Array<T> {
    toObservable(): Observable<T>;
  }
}

Array.prototype.toObservable = function () {
  // ...
};
```

Los aumentos globales tienen el mismo comportamiento y límites que los aumentos de módulos.
