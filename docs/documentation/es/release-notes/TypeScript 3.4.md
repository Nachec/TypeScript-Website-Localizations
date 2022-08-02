---
title: TypeScript 3.4
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-4.html
oneline: Notas de la versión de TypeScript 3.4
---

## Compilaciones posteriores más rápidas con el indicador `--incremental`

*TypeScript 3.4* introduce una nueva bandera llamada [`incremental`](/tsconfig#incremental) que le dice a *TypeScript* que guarde información sobre el gráfico del proyecto de la última compilación.
La próxima vez que se invoque *TypeScript* con [`incremental`](/tsconfig#incremental), usará esa información para detectar la forma menos costosa de comprobar el tipo y emitir cambios en tu proyecto.

```jsonc tsconfig
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "./lib"
  },
  "include": ["./src"]
}
```

De manera predeterminada con esta configuración, cuando ejecutamos `tsc`, *TypeScript* buscará un archivo llamado `.tsbuildinfo` en el directorio de salida (`./lib`).
Si `. ​/lib/ .tsbuildinfo` no existe, se generará.
Pero si lo hace, `tsc` intentará usar ese archivo para verificar de forma incremental y actualizar nuestros archivos de salida.

Estos archivos `.tsbuildinfo` se pueden eliminar de forma segura y no tienen ningún impacto en nuestro código en el entorno de ejecución ⏤ se utilizan exclusivamente para realizar compilaciones más rápidas.
También podemos nombrarlos como queramos y colocarlos donde queramos usando la opción [`tsBuildInfoFile`](/tsconfig#tsBuildInfoFile).

```jsonc tsconfig
// front-end.tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./buildcache/front-end",
    "outDir": "./lib"
  },
  "include": ["./src"]
}
```

### Proyectos compuestos

Parte de la intención con los proyectos compuestos (`tsconfig.json`s con [`composite`](/tsconfig#composite) establecido en `true`) es que las referencias entre distintos proyectos se pueden construir de forma incremental.
Como tal, los proyectos compuestos **siempre** produce archivos `.tsbuildinfo`.

### `outFile`

Cuando se usa [`outFile`](/tsconfig#outFile), el nombre del archivo de información de compilación se basará en el nombre del archivo de salida.
Como ejemplo, si nuestro archivo *JavaScript* de salida es `./Output/foo.js`, bajo la marca [`incremental`](/tsconfig#incremental), *TypeScript* generará el archivo `./Output/foo.tsbuildinfo` .
Como antes, esto se puede controlar con la opción [`tsBuildInfoFile`](/tsconfig#tsBuildInfoFile).

## Inferencia de tipo de orden superior a partir de funciones genéricas

*TypeScript 3.4* ahora puede producir tipos de funciones genéricas cuando la inferencia de otras funciones genéricas produce variables de tipo libre para inferencias.
Esto significa que muchos patrones de composición de funciones ahora trabajan mejor en 3.4.

Para ser más específicos, desarrollemos algo de motivación y consideremos la siguiente función `compose`:

```ts
function compose<A, B, C>(f: (arg: A) => B, g: (arg: B) => C): (arg: A) => C {
  return (x) => g(f(x));
}
```

`compose` toma otras dos funciones:

- `f` que toma algún argumento (de tipo `A`) y devuelve un valor de tipo `B`
- `g` que toma un argumento de tipo `B` (el tipo `f` devuelto) y devuelve un valor de tipo `C`

`compose` luego devuelve una función que alimenta su argumento a través de `f` y luego `g`.

Al llamar a esta función, *TypeScript* intentará averiguar los tipos de `A`, `B` y `C` a través de un proceso llamado *inferencia de tipo del argumento*.
Este proceso de inferencia suele funcionar bastante bien:

```ts
interface Person {
  name: string;
  age: number;
}

function getDisplayName(p: Person) {
  return p.name.toLowerCase();
}

function getLength(s: string) {
  return s.length;
}

// tiene tipo '(p: Person) => number'
const getDisplayNameLength = compose(getDisplayName, getLength);

// trabaja y devuelve el tipo 'number'
getDisplayNameLength({ name: "Person McPersonface", age: 42 });
```

El proceso de inferencia es bastante sencillo aquí porque `getDisplayName` y `getLength` usan tipos a los que se puede hacer referencia fácilmente.
Sin embargo, en *TypeScript 3.3* y versiones anteriores, las funciones genéricas como `compose` no funcionaban tan bien cuando se le pasaban otras funciones genéricas.

```ts
interface Caja<T> {
  value: T;
}

function makeArray<T>(x: T): T[] {
  return [x];
}

function makeBox<U>(value: U): Box<U> {
  return { value };
}

// tiene tipo '(arg: {}) => Box<{}[]>'
const makeBoxedArray = compose(makeArray, makeBox);

makeBoxedArray("hello!").value[0].toUpperCase();
//                                ~~~~~~~~~~~
// error: La propiedad 'toUpperCase' no existe en el tipo '{}'.
```

En versiones anteriores, *TypeScript* inferiría el tipo de objeto vacío (`{}`) al inferir de otras variables de tipo como `T` y `U`.

Durante la inferencia del tipo de argumentos en *TypeScript 3.4*, para una llamada a una función genérica que devuelve un tipo función, *TypeScript* , según corresponda, propagará los parámetros de tipo de los argumentos de la función genérica al tipo de función resultante.

En otras palabras, en lugar de producir el tipo

```ts
(arg: {}) => Box<{}[]>
```

*TypeScript 3.4* produce el tipo

```ts
<T>(arg: T) => Box<T[]>
```

Observa que `T` se ha propagado desde `makeArray` a la lista de tipos de los parámetros del tipo resultante.
Esto significa que la generalidad de los argumentos de `compose` se ha conservado y nuestro ejemplo de `makeBoxedArray` simplemente funcionará.

```ts
interface Caja<T> {
  value: T;
}

function makeArray<T>(x: T): T[] {
  return [x];
}

function makeBox<U>(value: U): Box<U> {
  return { value };
}

// has type '<T>(arg: T) => Box<T[]>'
const makeBoxedArray = compose(makeArray, makeBox);

// ¡trabaja sin problema!
makeBoxedArray("hello!").value[0].toUpperCase();
```

Para obtener más detalles, puedes [leer más en el cambio original](https://github.com/Microsoft/TypeScript/pull/30215).

## Mejoras para las tuplas `ReadonlyArray` y `readonly`

*TypeScript 3.4* facilita un poco el uso de tipos de arreglo de solo lectura.

### Una nueva sintaxis para `ReadonlyArray`

El tipo `ReadonlyArray` describe los `Array`s de los que solo se puede leer.
Cualquier variable con una referencia a un `ReadonlyArray` no puede agregar, quitar ni reemplazar ningún elemento del arreglo.

```ts
function foo(arr: ReadonlyArray<string>) {
  arr.slice(); // bien
  arr.push("hello!"); // ¡error!
}
```

Si bien es una buena práctica usar `ReadonlyArray` en lugar de `Array` cuando no se pretende realizar ninguna mutación, a menudo resulta complicado dado que los arreglos tienen una sintaxis más agradable.
Específicamente, `number[]` es una versión abreviada de `Array<number>`, al igual que `Date[]` es una abreviatura de `Array<Date>`.

*TypeScript 3.4* introduce una nueva sintaxis para `ReadonlyArray` usando un nuevo modificador `readonly` para tipos de arreglo.

```ts
function foo(arr: readonly string[]) {
  arr.slice(); // bien
  arr.push("hello!"); // ¡error!
}
```

### Tuplas `readonly`

*TypeScript 3.4* también introduce un nuevo soporte para tuplas de "solo lectura".
Podemos prefijar cualquier tipo de tupla con la palabra clave `readonly` para convertirla en una tupla `readonly`, al igual que ahora podemos hacerlo con la sintaxis abreviada de arreglos.
Como era de esperar, a diferencia de las tuplas ordinarias en cuyas ranuras se podría escribir, las tuplas `readonly` sólo permiten leer desde esas posiciones.

```ts
function foo(pair: readonly [string, string]) {
  console.log(pair[0]); // bien
  pair[1] = "hello!"; // error
}
```

De la misma manera que las tuplas ordinarias son tipos que se extienden desde `Array` ⏤ una tupla con elementos de tipo <code>T<sub>1</sub></code>, <code>T<sub>2</sub></code>, ... <code>T<sub>n</sub></code> se extiende desde <code>Array&lt; T<sub>1</sub> \| T<sub>2</sub> \| ... T<sub>n</sub> &gt;</code> - las tuplas `readonly` son tipos que se extienden desde `ReadonlyArray`. Entonces, una tupla de "solo lectura" con elementos <code>T<sub>1</sub></code>, <code>T<sub>2</sub></code>, ... <code>T< sub>n</sub></code> se extiende desde <code>ReadonlyArray< T <sub>1</sub> \| T<sub>2</sub> | ... T<sub>n</sub></code>.

### modificadores de tipo `readonly` mapeado y arreglos `readonly`

En versiones anteriores de *TypeScript*, generalizamos los tipos mapeados para operar de manera diferente en tipos similares a arreglos.
Esto significaba que un tipo mapeado como `Boxify` podría funcionar tanto en arreglos como en tuplas.

```ts
interface Caja<T> {
  value: T;
}

type Boxify<T> = {
  [K in keyof T]: Box<T[K]>;
};

// { a: Box<string>, b: Box<number> }
type A = Boxify<{ a: string; b: number }>;

// Array<Box<number>>
type B = Boxify<number[]>;

// [Box<string>, Box<number>]
type C = Boxify<[string, boolean]>;
```

Desafortunadamente, los tipos mapeados como el tipo utilitario `Readonly` efectivamente no eran operativos en los tipos de arreglo y tupla.

```ts
// lib.d.ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Cómo actuaba el código *antes* TypeScript 3.4

// { readonly a: string, readonly b: number }
type A = Readonly<{ a: string; b: number }>;

// number[]
type B = Readonly<number[]>;

// [string, boolean]
type C = Readonly<[string, boolean]>;
```

En *TypeScript 3.4*, el modificador `readonly` en un tipo mapeado convertirá automáticamente los tipos de arreglo en sus correspondientes homólogos de `readonly`.

```ts
// Cómo actúa el código ahora *con* TypeScript 3.4

// { readonly a: string, readonly b: number }
type A = Readonly<{ a: string; b: number }>;

// readonly number[]
type B = Readonly<number[]>;

// readonly [string, boolean]
type C = Readonly<[string, boolean]>;
```

De manera similar, podrías escribir un tipo de utilidad como el tipo mapeado `Writable` que elimine la condición `readonly`, y que convertiría los contenedores de arreglos `readonly` en sus equivalentes mutables.

```ts
type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

// { a: string, b: number }
type A = Writable<{
  readonly a: string;
  readonly b: number;
}>;

// number[]
type B = Writable<readonly number[]>;

// [string, boolean]
type C = Writable<readonly [string, boolean]>;
```

### Advertencias

A pesar de su apariencia, el modificador de tipo `readonly` solo se puede usar para la sintaxis en tipos arreglo y tipos tupla.
No es un operador de tipo de propósito general.

```ts
let err1: readonly Set<number>; // ¡error!
let err2: readonly Array<boolean>; // ¡error!

déjalo bien: readonly boolean[]; // trabaja bien
```

Puedes [ver más detalles en la solicitud de extracción](https://github.com/Microsoft/TypeScript/pull/29435).

## Aserciones `const`

*TypeScript 3.4* introduce una nueva construcción para valores literales llamada  *aserciones `const`*.
Su sintaxis es una aserción de tipo con `const` en lugar del nombre del tipo (por ejemplo, `123 as const`).
Cuando construimos nuevas expresiones literales con aserciones `const`, podemos indicarle al lenguaje que:

- no se deben ampliar los tipos literales en esa expresión (por ejemplo, no se debe pasar de `"hello"` a `string`)
- los objetos literales obtienen propiedades `readonly`
- los arreglos literales se convierten en tuplas `readonly`

```ts
// Tipo '"hello"'
let x = "hello" as const;

// Tipo 'readonly[10, 20]'
let y = [10, 20] as const;

// Tipo '{ readonly test:: "hello" }'
let z = { text: "hello" } as const;
```

Fuera de los archivos `.tsx`, también se puede utilizar la sintaxis de aserción de corchetes angulares.

```ts
// Tipo '"hello"'
let x = <const>"hello";

// Tipo 'readonly[10, 20]'
let y = <const>[10, 20];

// Tipo '{ readonly test:: "hello" }'
let z = <const>{ text: "hello" };
```

Esta característica significa que los tipos que de otro modo se usarían solo para insinuar inmutabilidad al compilador a menudo se pueden omitir.

```ts
// Trabaja sin tipos referenciados o declarados.
// Solo necesitábamos una única aserción constante.
function getShapes() {
  let result = [
    { kind: "circle", radius: 100 },
    { kind: "square", sideLength: 50 },
  ] as const;

  return result;
}

for (const shape of getShapes()) {
  // ¡Reduce perfectamente!
  if (shape.kind === "circle") {
    console.log("Circle radius", shape.radius);
  } else {
    console.log("Square side length", shape.sideLength);
  }
}
```

Ten en cuenta que lo anterior no necesita anotaciones de tipo.
La aserción `const` permitió a *TypeScript* tomar el tipo más específico de expresión.

Esto incluso se puede usar para habilitar patrones similares a `enum` en código *JavaScript* simple si eliges no usar la construcción `enum` de *TypeScript*.

```ts
export const Colors = {
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
} as const;

// o utiliza un 'export default'

export default {
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
} as const;
```

### Advertencias

Una cosa a tener en cuenta es que las aserciones `const` solo se pueden aplicar inmediatamente en expresiones literales simples.

```ts
// ¡Error! Una aserción 'const' solo se puede aplicar a una
// una cadena, número, booleano, arreglo u objeto literal.
let a = (Math.random() < 0.5 ? 0 : 1) as const;
let b = (60 * 60 * 1000) as const;

// ¡Trabaja!
let c = Math.random() < 0.5 ? (0 as const) : (1 as const);
let d = 3_600_000 as const;
```

Otra cosa a tener en cuenta es que los contextos `const` no convierten inmediatamente una expresión para que sea completamente inmutable.

```ts
let arr = [1, 2, 3, 4];

let foo = {
  name: "foo",
  contents: arr,
} as const;

foo.name = "bar"; // ¡error!
foo.contents = []; // ¡error!

foo.contents.push(5); // ...¡trabaja!
```

Para obtener más detalles, puedes [consultar la solicitud de extracción correspondiente](https://github.com/Microsoft/TypeScript/pull/29510).

## Comprobación de tipo para `globalThis`

*TypeScript 3.4* introduce soporte para la verificación de tipos del nuevo `globalThis` de *ECMAScript* ⏤ una variable global que, bueno, se refiere al ámbito global.
A diferencia de las soluciones anteriores, `globalThis` proporciona una forma estándar para acceder al alcance global que se puede utilizar en diferentes entornos.

```ts
// en un archivo global:

var abc = 100;

// Se refiere a 'abc' desde arriba.
globalThis.abc = 200;
```

Ten en cuenta que las variables globales declaradas con `let` y `const` no aparecen en `globalThis`.

```ts
let answer = 42;

// ¡error! La propiedad 'answer' no existe en 'typeof globalThis'.
globalThis.answer = 333333;
```

También es importante tener en cuenta que *TypeScript* no transforma las referencias a `globalThis` al compilar versiones anteriores de *ECMAScript*.
Como tal, a menos que estés apuntando a navegadores perenne (que ya son compatibles con `globalThis`), es posible que desees [usar un `polyfill` apropiado](https://github.com/ljharb/globalThis) en su lugar.

Para obtener más detalles sobre la implementación, consulta [la solicitud de extracción de la característica](https://github.com/Microsoft/TypeScript/pull/29332).
