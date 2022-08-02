---
title: Enumeraciones
layout: docs
permalink: /docs/handbook/enums.html
oneline: Cómo trabajan las enumeraciones de TypeScript
handbook: "true"
---

Las enumeraciones son una de las pocas características que tiene *TypeScript* que no son una extensión a nivel de tipo de *JavaScript*.

Las enumeraciones permiten a un desarrollador definir un conjunto de constantes con nombre.
El uso de enumeraciones puede facilitar la intención de la documentación o crear un conjunto de casos distintos.
*TypeScript* proporciona enumeraciones numéricas y basadas en cadenas.

## Enumeraciones numéricas

Primero comenzaremos con enumeraciones numéricas, que probablemente te sean más familiares si vienes de otros lenguajes.
Una enumeración se puede definir usando la palabra clave `enum`.

```ts twoslash
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```

Arriba, tenemos una enumeración numérica donde `Up` se inicia con `1`.
Todos los miembros siguientes se incrementan automáticamente a partir de ese momento.
En otras palabras, `Direction.Up` tiene el valor `1`, `Down` tiene `2`, `Left` tiene `3` y `Right` tiene `4`.

Si quisiéramos, podríamos dejar los iniciadores por completo:

```ts twoslash
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

Aquí, `Up` tendría el valor `0`, `Down` tendría `1`, etc.
Este comportamiento de incremento automático es útil para los casos en los que es posible que no nos importen los valores de los miembros en sí mismos, pero sí nos importa que cada valor sea distinto de otros valores en la misma enumeración.

Usar una enumeración es sencillo: simplemente accede a cualquier miembro como una propiedad fuera de la enumeración en sí, y declara los tipos usando el nombre de la enumeración:

```ts twoslash
enum UserResponse {
  No = 0,
  Yes = 1,
}

function respond(recipient: string, message: UserResponse): void {
  // ...
}

respond("Princess Caroline", UserResponse.Yes);
```

Las enumeraciones numéricas se pueden mezclar en [miembros calculados y constantes (ve más abajo)](#miembros-calculados-y-constantes).
La historia corta es que las enumeraciones sin iniciadores deben ser las primeras o deben ir después de las enumeraciones numéricas iniciadas con constantes numéricas u otros miembros constantes de enumeración.
En otras palabras, no se permite lo siguiente:

```ts twoslash
// @errors: 1061
const getSomeValue = () => 23;
// ---cut---
enum E {
  A = getSomeValue(),
  B,
}
```

## Enumeraciones de cadena

Las enumeraciones de cadena son un concepto similar, pero tienen algunas sutiles [diferencias en el entorno de ejecución](#enumeraciones-en-el-entorno-de-ejecución) como se documenta a continuación.
En una enumeración de cadena, cada miembro se debe iniciar de forma constante con una cadena literal o con otro miembro de enumeración de cadena.

```ts twoslash
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

Si bien las enumeraciones de cadena no tienen un comportamiento de incremento automático, las enumeraciones de cadena tienen la ventaja de que se "serializan" bien.
En otras palabras, si estas depurando y tienes que leer el valor en el entorno de ejecución de una enumeración numérica, el valor suele ser opaco ⏤ no transmite ningún significado útil por sí solo (aunque el [mapeo inverso](#mapeos-inversos) a menudo puede ayudar), las enumeraciones de cadenas te permiten dar un valor significativo y legible cuando se ejecuta tu código, independientemente del nombre del miembro del enum en sí.

## Enumeraciones heterogéneas

Técnicamente, las enumeraciones se pueden mezclar con miembros numéricos y de cadena, pero no está claro por qué querrías hacerlo:

```ts twoslash
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

A menos que realmente estés tratando de aprovechar el comportamiento en el entorno de ejecución de *JavaScript* de una manera inteligente, se recomienda que no lo hagas.

## Miembros calculados y constantes

Cada miembro de la enumeración tiene un valor asociado que puede ser *constante* o *calculado*.
Un miembro de enum se considera constante si:

- Es el primer miembro de la enumeración y no tiene iniciador, en cuyo caso se le asigna el valor `0`:

  ```ts twoslash
  // E.X is constant:
  enum E {
    X,
  }
  ```

- No tiene un iniciador y el miembro de enumeración anterior era una constante numérica.
  En este caso, el valor del miembro de enumeración actual será el valor del miembro de enumeración anterior más uno.

  ```ts twoslash
  // Todos los miembros de enumeración en 'E1' y 'E2' son constantes.

  enum E1 {
    X,
    Y,
    Z,
  }

  enum E2 {
    A = 1,
    B,
    C,
  }
  ```

- El miembro de enumeración se inicia con una expresión de enumeración constante.
  Una expresión de enumeración constante es un subconjunto de expresiones  *TypeScript* que se pueden evaluar por completo en tiempo de compilación.
  Una expresión es una expresión de enumeración constante si es:

  1. una expresión de enumeración literal (básicamente una cadena literal o un número literal)
  2. una referencia a un miembro de enumeración constante previamente definido (que se puede originar a partir de una enumeración diferente)
  3. una expresión de enumeración constante entre paréntesis
  4. uno de los operadores unarios `+`, `-`, `~` aplicado a la expresión de enumeración constante
  5. `+`, `-`, `*`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, `^` operadores binarios con expresiones de enumeración constante como operandos

  Es un error de tiempo de compilación que las expresiones de enumeración constante se evalúen como "NaN" o "Infinity".

En todos los demás casos, el miembro enum se considera calculado.

```ts twoslash
enum FileAccess {
  // miembros constantes
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // miembro calculado
  G = "123".length,
}
```

## Unión de enumeraciones y tipos miembro de enumeración

Hay un subconjunto especial de miembros de enumeración constante que no se calculan: miembros literales de enumeración.
Un miembro de enumeración literal es un miembro de enumeración constante sin valor iniciado o con valores que se inician en

- cualquier cadena literal (por ejemplo, `"foo"`, `"bar`, `"baz"`)
- cualquier literal numérico (por ejemplo, `1`, `100`)
- un unario menos aplicado a cualquier literal numérico (p. ej., `-1`, `-100`)

Cuando todos los miembros de una enumeración tienen valores literales de enumeración, entran en juego algunas semánticas especiales.

La primera es que los miembros de la enumeración también se convierten en tipos.
Por ejemplo, podemos decir que ciertos miembros *solo* pueden tener el valor de un miembro enum:

```ts twoslash
// @errors: 2322
enum ShapeKind {
  Circle,
  Square,
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}

let c: Circle = {
  kind: ShapeKind.Square,
  radius: 100,
};
```

El otro cambio es que los tipos enum se convierten efectivamente en una *unión* de cada miembro enum.
Con las enumeraciones de unión, el sistema de tipos puede aprovechar el hecho de que conoce el conjunto exacto de valores que existen en la enumeración misma.
Por eso, *TypeScript* puede detectar errores en los que podríamos estar comparando valores incorrectamente.
Por ejemplo:

```ts twoslash
// @errors: 2367
enum E {
  Foo,
  Bar,
}

function f(x: E) {
  if (x !== E.Foo || x !== E.Bar) {
    //
  }
}
```

En ese ejemplo, primero comprobamos si `x` *no* era `E.Foo`.
Si esa comprobación tiene éxito, entonces nuestro `||` hará un cortocircuito y el cuerpo del `if` se ejecutará.
Sin embargo, si la comprobación no tuvo éxito, entonces `x` *solo* puede ser `E.Foo`, por lo que no tiene sentido ver si es igual a `E.Bar`.

## Enumeraciones en el entorno de ejecución

Las enumeraciones son objetos reales que existen en el entorno de ejecución.
Por ejemplo, la siguiente enumeración

```ts twoslash
enum E {
  X,
  Y,
  Z,
}
```

en realidad se puede pasar a las funciones

```ts twoslash
enum E {
  X,
  Y,
  Z,
}

function f(obj: { X: number }) {
  return obj.X;
}

// Funciona, ya que 'E' tiene una propiedad llamada 'X' que es un número.
f(E);
```

## Enumeraciones en tiempo de compilación

Aunque las enumeraciones son objetos reales que existen en el entorno de ejecución, la palabra clave `keyof` funciona de manera diferente de lo que cabría esperar para los objetos típicos. En su lugar, usa `keyof typeof` para obtener un tipo que represente todas las claves de la enumeración como cadenas.

```ts twoslash
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

/**
 * Esto es equivalente a:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;

function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key);
    console.log("Log level value is:", num);
    console.log("Log level message is:", message);
  }
}
printImportant("ERROR", "This is a message");
```

### Mapeos inversos

Además de crear un objeto con nombres de propiedad para miembros, los miembros de enumeraciones numéricas también obtienen un *mapeo inverso* de los valores de enumeración a los nombres de enumeración.
Por ejemplo, en este fragmento:

```ts twoslash
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

*TypeScript* compila esto en el siguiente *JavaScript*:

```ts twoslash
// @showEmit
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

En este código generado, se compila una enumeración en un objeto que almacena mapeos directos (`name` -> `value`) e inversa (`value` -> `name`).
Las referencias a otros miembros de enumeración siempre se emiten como accesos de propiedad y nunca en línea.

Ten en cuenta que los miembros de la enumeración de cadenas *no* obtienen un mapeo inverso generado en absoluto.

### enumeraciones `const`

En la mayoría de los casos, las enumeraciones son una solución perfectamente válida.
Sin embargo, a veces los requisitos son más estrictos.
Para evitar pagar el costo del código adicional generado y la indirección adicional al acceder a los valores de enumeración, es posible usar enumeraciones `const`.
Las enumeraciones constantes se definen usando el modificador `const` en nuestras enumeraciones:

```ts twoslash
const enum Enum {
  A = 1,
  B = A * 2,
}
```

Las enumeraciones constantes solo pueden usar expresiones enumerativas constantes y, a diferencia de las enumeraciones regulares, se eliminan por completo durante la compilación.
Los miembros de la enumeración constante están integrados en los sitios de uso.
Esto es posible ya que las enumeraciones constantes no pueden tener miembros calculados.

```ts twoslash
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

en el código generado se convertirá en:

```ts twoslash
// @showEmit
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

#### Errores de constante enum

Incluir valores de enumeración es sencillo al principio, pero tiene sutiles implicaciones.
Estas implicaciones pertenecen solo a las enumeraciones de constantes _ambient_ (básicamente enumeraciones de constantes en archivos `.d.ts`) y compartirlas entre proyectos, pero si está publicando o consumiendo archivos `.d.ts`, es probable que estas implicaciones se aplican a ti, porque `tsc --declaration` transforma los archivos `.ts` en archivos `.d.ts`.

1. Por las razones expuestas en la [documentación de `isolatedModules`](/tsconfig#references-to-const-enum-members), ese modo es fundamentalmente incompatible con las enumeraciones constantes ambientales.
   Esto significa que si publicas enumeraciones `const ambient`, los consumidores intermedios no podrán usar [`isolatedModules`](/tsconfig#isolatedModules) y esos valores de enumeración al mismo tiempo.
2. Puedes insertar fácilmente valores de la versión A de una dependencia en tiempo de compilación e importar la versión B en tiempo de ejecución.
   Las enumeraciones de las versiones A y B pueden tener valores diferentes, si no tienes mucho cuidado, lo que resulta en [errores sorprendentes](https://github.com/microsoft/TypeScript/issues/5219#issue-110947903), como tomar las ramas equivocadas de instrucciones `if`.
   Estos errores son especialmente perniciosos porque es común ejecutar pruebas automatizadas aproximadamente al mismo tiempo que se construyen los proyectos, con las mismas versiones de dependencia, lo que pasa por alto estos errores por completo.
3. [`importsNotUsedAsValues: "preserve"`](/tsconfig#importsNotUsedAsValues) no eliminará las importaciones de enumeraciones constantes utilizadas como valores, pero las enumeraciones constantes ambientales no garantizan que existan archivos `.js` en tiempo de ejecución.
   Las importaciones irresolubles provocan errores en tiempo de ejecución.
   La forma habitual de eludir sin ambigüedades las importaciones, [importaciones de solo tipo](/docs/handbook/modules.html#importing-types), [no permite valores de enumeración constantes](https://github.com/microsoft/TypeScript/ ediciones/40344), actualmente.

Aquí hay dos enfoques para evitar estas trampas:

A. No uses constantes enum en absoluto.
   Puedes [prohibir constantes enum](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#how-can-i-ban-specific-language-feature) fácilmente con la ayuda de un linter.
   Obviamente, esto evita cualquier problema con las constantes enum, pero evita que tu proyecto incluya sus propias enumeraciones.
   A diferencia de las enumeraciones integradas de otros proyectos, la integración de las enumeraciones propias de un proyecto no es problemática y tiene implicaciones de rendimiento.
B. No publiques constantes enum ambientales desconstándolas con la ayuda de [`preserveConstEnums`](/tsconfig#preserveConstEnums).
   Este es el enfoque adoptado internamente por el [proyecto TypeScript](https://github.com/microsoft/TypeScript/pull/5422).
   [`preserveConstEnums`](/tsconfig#preserveConstEnums) emite el mismo *JavaScript* para las constantes enum que para las enumeraciones simples.
   A continuación, puedes eliminar de forma segura el modificador `const` de los archivos `.d.ts` [en un paso de compilación](https://github.com/microsoft/TypeScript/blob/1a981d1df1810c868a66b3828497f049a944951c/Gulpfile.js#L144).

   De esta manera, los consumidores intermedios no incluirán enumeraciones en línea de tu proyecto, evitando las trampas anteriores, pero un proyecto aún puede colocar en línea sus propias enumeraciones, a diferencia de prohibir las enumeraciones constantes por completo.

## Enumeraciones ambientales

Las enumeraciones ambientales se utilizan para describir la forma de tipos de enumeración ya existentes.

```ts twoslash
declare enum Enum {
  A = 1,
  B,
  C = 2,
}
```

Una diferencia importante entre las enumeraciones ambientales y no ambientales es que, en las enumeraciones regulares, los miembros que no tienen un iniciador se considerarán constantes si su miembro de enumeración anterior se considera constante.
Por el contrario, un miembro de enumeración ambiental (y no constante) que no tiene iniciador *siempre* se considera calculado.

## Objetos vs enumeraciones

En *TypeScript* moderno, es posible que no necesites una enumeración cuando un objeto con `as const` podría ser suficiente:

```ts twoslash
const enum EDirection {
  Up,
  Down,
  Left,
  Right,
}

const ODirection = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
} as const;

EDirection.Up;
//         ^?

ODirection.Up;
//         ^?

// Usa la enumeración como parámetro
function walk(dir: EDirection) {}

// Requiere una línea extra para sacar los valores.
type Direction = typeof ODirection[keyof typeof ODirection];
function run(dir: Direction) {}

walk(EDirection.Left);
run(ODirection.Right);
```

El mayor argumento a favor de este formato sobre la `enum` de *TypeScript* es que mantiene su código base alineado con el estado de *JavaScript*, y [`when`/*if*](https://github.com/rbuckton/proposal-enum) se agregan enumeraciones a *JavaScript*, luego puede pasar a la sintaxis adicional.
