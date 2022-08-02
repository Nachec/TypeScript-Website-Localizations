---
title: Una inmersión profunda
layout: docs
permalink: /docs/handbook/declaration-files/deep-dive.html
oneline: "Cómo funcionan los archivos d.ts, un análisis profundo"
---

## Teoría del archivo de declaración: Una inmersión profunda

La estructuración de módulos para obtener la forma exacta de la *API* que deseas puede ser complicada.
Por ejemplo, es posible que deseemos un módulo que se pueda invocar con o sin `new` para producir diferentes tipos,
que tenga una variedad de tipos con nombre expuestos en una jerarquía,
y también tenga algunas propiedades en el objeto `module`.

Al leer esta guía, tendrás las herramientas para escribir archivos de declaración complejos que exponen una amigable *API* en la superficie.
Esta guía se enfoca en las bibliotecas de módulos (o *UMD*) porque las opciones aquí son más variadas.

## Conceptos clave

Puedes comprender completamente cómo hacer cualquier forma de declaración
entendiendo algunos conceptos clave de cómo funciona *TypeScript*

### Tipos

Si estás leyendo esta guía, probablemente ya sabes qué es un tipo en *TypeScript*.
Sin embargo, para ser más explícito, se introduce un *tipo* con:

- Una declaración alias de tipo (`type sn = number | string;`)
- Una declaración de interfaz (`interface I {x: number[]; }`)
- Una declaración de clase (`class C {}`)
- Una declaración de enumeración (`enum E {A, B, C}`)
- Una declaración `import` que se refiere a un tipo

Cada una de estas formas de declaración crea un nuevo nombre de tipo.

### Valores

Al igual que con los tipos, probablemente ya entiendas qué es un valor.
Los valores son nombres del entorno de ejecución a los que podemos hacer referencia en expresiones.
Por ejemplo `let x = 5;` crea un valor llamado `x`.

Una vez más, al ser explícito, las siguientes cosas crean valores:

- declaraciones `let`, `const` y `var`
- Una declaración `namespace` o `module` que contiene un valor
- Una declaración `enum`
- Una declaración `class`
- Una declaración `import` que se refiere a un valor
- Una declaración `function`

### Espacios de nombres

Los tipos pueden existir en *espacios de nombres*.
Por ejemplo, si tenemos la declaración `let x: A.B.C`,
decimos que el tipo `C` proviene del espacio de nombres `A.B`.

Esta distinción es sutil e importante: aquí, `A.B` no necesariamente es un tipo o un valor.

## Combinaciones simples: Un nombre, múltiples significados

Dado un nombre `A`, podríamos encontrar hasta tres significados diferentes para `A`: un tipo, un valor o un espacio de nombres.
Cómo se interpreta el nombre depende del contexto en el que se usa.
Por ejemplo, en la declaración `let m: A.A = A;`,
`A` se usa primero como un espacio de nombres, luego como un nombre de tipo, luego como un valor.
¡Estos significados podrían terminar refiriéndose a declaraciones completamente diferentes!

Esto puede parecer confuso, pero en realidad es muy conveniente siempre que no sobrecarguemos excesivamente las cosas.
Veamos algunos aspectos útiles del comportamiento de esta combinación.

### Combinaciones integradas

Los lectores astutos notarán que, por ejemplo, `class` apareció en las listas `type` y `value`.
La declaración `class C { }` crea dos cosas:
un `type` `C` que se refiere a la forma de instancia de la clase,
y un `value` `C` que se refiere a la función constructora de la clase.
Las declaraciones de `enum` se comportan de manera similar.

### Combinaciones de usuario

Digamos que escribimos un archivo de módulo `foo.d.ts`:

```ts
export var SomeVar: { a: SomeType };
export interface SomeType {
  cantidad: number;
}
```

Luego lo consumimos:

```ts
import * as foo from "./foo";
let x: foo.SomeType = foo.SomeVar.a;
console.log(x.count);
```

Esto funciona bastante bien, pero podríamos imaginar que `SomeType` y `SomeVar` estuvieran muy relacionadas
de manera tal que quisieras que tuvieran el mismo nombre.
Podemos usar la combinación para presentar estos dos objetos diferentes (el valor y el tipo) con el mismo nombre `Bar`:

```ts
export var Bar: { a: Bar };
export interface Bar {
  cantidad: number;
}
```

Esto presenta una muy buena oportunidad para desestructurar el código consumido:

```ts
import { Bar } from "./foo";
let x: Bar = Bar.a;
console.log(x.count);
```

Nuevamente, aquí usamos `Bar` tanto como un tipo como un valor.
Ten en cuenta que no tuvimos que declarar el valor de `Bar` como del tipo `Bar` ⏤ son independientes.

## Combinaciones avanzadas

Algunos tipos de declaraciones se pueden combinar en múltiples declaraciones.
Por ejemplo, `class C { }` e `interface C { }` pueden coexistir y ambas aportan propiedades a los tipos `C`.

Esto es legal siempre y cuando no cree un conflicto.
Una regla general es que los valores siempre entran en conflicto con otros valores del mismo nombre a menos que se declaren como `namespace`s,
los tipos entrarán en conflicto si se declaran con una declaración alias de tipo (`type s = string`),
y los espacios de nombres nunca entran en conflicto.

Veamos cómo se puede usar esto.

### Agregar usando una `interfaz`

Podemos agregar miembros adicionales a una `interface` con otra declaración `interface`:

```ts
interface Foo {
  x: number;
}
// ... en otra parte ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // Bien
```

Esto también funciona con clases:

```ts
class Foo {
  x: number;
}
// ... en otra parte ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // Bien
```

Ten en cuenta que usando una `interfaz` no podemos agregar el alias de tipo (`type s = string;`).

### Agregar usando un *espacio de nombres*

Una declaración `namespace` se puede usar para agregar nuevos tipos, valores y espacios de nombres de cualquier manera que no cree un conflicto.

Por ejemplo, podemos agregar un miembro estático a una clase:

```ts
class C {}
// ... en otra parte ...
namespace C {
  export let x: number;
}
let y = C.x; // Bien
```

Nota que en este ejemplo, agregamos un valor al lado `static` de `C` (su función constructora).
Esto se debe a que agregamos un `value`, y el contenedor para todos los valores es otro valor
(los tipos están contenidos por espacios de nombres, y los espacios de nombres están contenidos por otros espacios de nombres).

También podríamos agregar un tipo de espacio de nombres a una clase:

```ts
class C {}
// ... en otra parte ...
namespace C {
  export interface D {}
}
let y: C.D; // Bien
```

En este ejemplo, no había un espacio de nombres `C` hasta que escribimos la declaración `namespace` para él.
El significado de `C` como espacio de nombres no entra en conflicto con el valor o los significados del tipo `C` creados por la clase.

Finalmente, podríamos realizar muchas fusiones diferentes usando declaraciones `namespace`.
Este no es un ejemplo particularmente realista, pero muestra todo tipo de comportamiento interesante:

```ts
namespace X {
  export interface Y {}
  export class Z {}
}

// ... en otra parte ...
namespace X {
  export var Y: number;
  export namespace Z {
    export class C {}
  }
}
type X = string;
```

En este ejemplo, el primer bloque crea los siguientes significados de nombre:

- Un valor `X` (porque la declaración del `namespace` contiene un valor, `Z`)
- Un espacio de nombres `X` (porque la declaración del `namespace` contiene un tipo, `Y`)
- Un tipo `Y` en el espacio de nombres `X`
- Un tipo `Z` en el espacio de nombres `X` (la forma de instancia de la clase)
- Un valor `Z` que es una propiedad del valor `X` (la función constructora de la clase)

El segundo bloque crea los siguientes significados de nombre:

- Un valor `Y` (de tipo `number`) que es una propiedad del valor `X`
- Un espacio de nombres `Z`
- Un valor `Z` que es una propiedad del valor `X`
- Un tipo `C` en el espacio de nombres `X.Z`
- Un valor `C` que es una propiedad del valor `X.Z`
- Un tipo `X`

<!-- TODO: Escribe más sobre esto. -->
