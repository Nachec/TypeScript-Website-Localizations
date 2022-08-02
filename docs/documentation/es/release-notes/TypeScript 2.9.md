---
title: TypeScript 2.9
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-9.html
oneline: Notas de la versión de TypeScript 2.9
---

## Admite propiedades con nombre `number` y `symbol` con `keyof` y tipos mapeados

*TypeScript 2.9* agrega soporte para propiedades con nombre `number` y `symbol` en tipos de índice y tipos mapeados.
Anteriormente, el operador `keyof` y los tipos mapeados solo admitían propiedades con nombre `string`.

Los cambios incluyen:

- Un tipo de índice `keyof T` para algún tipo `T` es un subtipo de `string | number | symbol`.
- Un tipo mapeado `{ [P in K]: XXX}` permite cualquier `K` asignable a `string | number | symbol`.
- En una instrucción `for...in` para un objeto de un tipo `T` genérico, el tipo inferido de la variable de iteración anteriormente era `keyof T` pero ahora es `Extract<keyof T, string>`. (En otras palabras, el subconjunto de `keyof T` que incluye solo valores en forma de cadena).

Dado un tipo de objeto `X`, `keyof X` se resuelve de la siguiente manera:

- Si `X` contiene un índice de firma de cadena, `keyof X` es una unión de `string`, `number` y los tipos literales que representan propiedades similares a símbolos, de lo contrario
- Si `X` contiene un índice de firma numérico, `keyof X` es una unión de `number` y los tipos literales que representan propiedades similares a cadenas y símbolos, de lo contrario
- `keyof X` es una unión de los tipos literales que representan propiedades similares a cadenas, números y símbolos.

Dónde:

- Las propiedades de tipo cadena de un tipo de objeto son aquellas declaradas mediante un identificador, una cadena literal o un nombre de propiedad calculado de un tipo de cadena literal.
- Las propiedades numéricas de un tipo de objeto son aquellas declaradas usando un literal numérico o un nombre de propiedad calculado de un tipo literal numérico.
- Las propiedades similares a símbolos de un tipo de objeto son aquellas declaradas utilizando un nombre de propiedad calculado de un tipo de símbolo único.

En un tipo mapeado `{ [P in K]: XXX }`, cada tipo de cadena literal en `K` introduce una propiedad con un nombre de cadena, cada tipo literal numérico en `K` introduce una propiedad con un nombre numérico, y cada tipo de símbolo único en `K` introduce una propiedad con un nombre de símbolo único.
Además, si `K` incluye el tipo `string`, se introduce un índice de firma de cadena, y si `K` incluye el tipo `number`, se introduce un índice de firma numérico.

##### Ejemplo

```ts
const c = "c";
const d = 10;
const e = Symbol();

const enum E1 {
  A,
  B,
  C,
}
const enum E2 {
  A = "A",
  B = "B",
  C = "C",
}

type Foo = {
  a: string; // Nombre similar a una cadena
  5: string; // Nombre similar a un número
  [c]: string; // Nombre similar a una cadena
  [d]: string; // Nombre similar a un número
  [e]: string; // Nombre similar a un símbolo
  [E1.A]: string; // Nombre similar a un número
  [E2.A]: string; // Nombre similar a una cadena
};

type K1 = keyof Foo; // "a" | 5 | "c" | 10 | typeof e | E1.A | E2.A
type K2 = Extract<keyof Foo, string>; // "a" | "c" | E2.A
type K3 = Extract<keyof Foo, number>; // 5 | 10 | E1.A
type K4 = Extract<keyof Foo, symbol>; // typeof e
```

Dado que `keyof` ahora refleja la presencia de un índice de firma numérico al incluir el tipo `number` en el tipo de clave, los tipos mapeados como `Partial<T>` y `Readonly<T>` funcionan correctamente cuando se aplican a tipos de objeto con índice de firmas numérico:

```ts
type Arrayish<T> = {
  length: number;
  [x: number]: T;
};

type ReadonlyArrayish<T> = Readonly<Arrayish<T>>;

declare const map: ReadonlyArrayish<string>;
let n = map.length;
let x = map[123]; // Anteriormente de tipo any (o un error con --noImplicitAny)
```

Además, con el soporte del operador `keyof` para las claves con nombre `number` y `symbol`, ahora es posible abstraer el acceso a las propiedades de los objetos que están indexados por literales numéricos (como tipos de enumeración numérica) y símbolos únicos.

```ts
const enum Enum {
  A,
  B,
  C,
}

const enumToStringMap = {
  [Enum.A]: "Name A",
  [Enum.B]: "Name B",
  [Enum.C]: "Name C",
};

const sym1 = Symbol();
const sym2 = Symbol();
const sym3 = Symbol();

const symbolToNumberMap = {
  [sym1]: 1,
  [sym2]: 2,
  [sym3]: 3,
};

type KE = keyof typeof enumToStringMap; // Enum (i.e. Enum.A | Enum.B | Enum.C)
type KS = keyof typeof symbolToNumberMap; // typeof sym1 | typeof sym2 | typeof sym3

function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let x1 = getValue(enumToStringMap, Enum.C); // Devuelve "Name C"
let x2 = getValue(symbolToNumberMap, sym3); // Devuelve 3
```

Este es un cambio rotundo; anteriormente, el operador `keyof` y los tipos mapeados solo admitían propiedades con nombre `string`.
El código que asumía que los valores escritos con `keyof T` eran siempre `string`s, ahora se marcará como error.

##### Ejemplo

```ts
function useKey<T, K extends keyof T>(o: T, k: K) {
  var name: string = k; // Error: keyof T no es asignable a string
}
```

#### Recomendaciones

- Si tus funciones solo pueden manejar claves de propiedad con nombre de cadena, usa `Extract<keyof T, string>` en la declaración:

  ```ts
  function useKey<T, K extends Extract<keyof T, string>>(o: T, k: K) {
    var name: string = k; // Bien
  }
  ```

- Si tus funciones están abiertas para manejar todas las claves de propiedad, entonces los cambios se deben realizar en sentido descendente:

  ```ts
  function useKey<T, K extends keyof T>(o: T, k: K) {
    var name: string | number | symbol = k;
  }
  ```

- De lo contrario, usa la opción del compilador [`keyofStringsOnly`](/tsconfig#keyofStringsOnly) para deshabilitar el nuevo comportamiento.

## Argumentos de tipo genérico en elementos *JSX*

Los elementos *JSX* ahora permiten pasar argumentos de tipo a componentes genéricos.

##### Ejemplo

```ts
class GenericComponent<P> extends React.Component<P> {
  internalProp: P;
}

type Props = { a: number; b: string };

const x = <GenericComponent<Props> a={10} b="hi" />; // Bien

const y = <GenericComponent<Props> a={10} b={20} />; // Error
```

## Argumentos de tipo genérico en plantillas etiquetadas genéricas

Las plantillas etiquetadas son una forma de invocación introducida en *ECMAScript 2015*.
Al igual que las expresiones de llamada, las funciones genéricas se pueden usar en una plantilla etiquetada y *TypeScript* inferirá los argumentos de tipo utilizados.

*TypeScript 2.9* permite pasar argumentos de tipo genérico a cadenas de plantilla etiquetadas.

##### Ejemplo

```ts
declare function styledComponent<Props>(
  strs: TemplateStringsArray
): Component<Props>;

interface MyProps {
  name: string;
  age: number;
}

styledComponent<MyProps>`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

declare function tag<T>(strs: TemplateStringsArray, ...args: T[]): T;

// la inferencia falla porque 'number' y 'string' son candidatos que entran en conflicto
let a = tag<string | number>`${100} ${"hello"}`;
```

## `import`ar tipos

Los módulos pueden importar tipos declarados en otros módulos. Pero los scripts globales que no son de módulo no pueden acceder a los tipos declarados en los módulos. Introduce `importa` tipos.

El uso de `import("mod")` en una anotación de tipo permite acceder a un módulo y acceder a su declaración exportada sin importarla.

##### Ejemplo

Dada una declaración de una clase `Pet` en un archivo de módulo:

```ts
// module.d.ts

export declare class Pet {
  name: string;
}
```

Se puede utilizar en un archivo que no sea de módulo `global-script.ts`:

```ts
// global-script.ts

function adopt(p: import("./module").Pet) {
  console.log(`Adopting ${p.name}...`);
}
```

Esto también funciona en los comentarios *JSDoc* para referirse a tipos de otros módulos en `.js`:

```js
// a.js

/**
 * @param p { import("./module").Pet }
 */
function walk(p) {
  console.log(`Walking ${p.name}...`);
}
```

## La declaración relajante emite reglas de visibilidad.

Con la `import`ación de tipos disponible, muchos de los errores de visibilidad reportados durante la generación del archivo de declaración pueden ser manejados por el compilador sin la necesidad de cambiar la entrada.

Por ejemplo:

```ts
import { createHash } from "crypto";

export const hash = createHash("sha256");
//           ^^^^
// La variable 'hash' exportada tiene o está usando el nombre 'Hash' del módulo externo "crypto" pero no se puede nombrar.
```

Con *TypeScript 2.9*, no se informan errores y ahora el archivo generado se ve así:

```ts
export declare const hash: import("crypto").Hash;
```

## Soporte para `import.meta`

*TypeScript 2.9* introduce soporte para `import.meta`, una nueva metapropiedad como se describe en la [propuesta *TC39* actual](https://github.com/tc39/proposal-import-meta).

El tipo de `import.meta` es el tipo`ImportMeta` global  que se define en `lib.es5.d.ts`.
Esta interfaz es extremadamente limitada.
Agregar propiedades conocidas para *Node* o navegadores requiere la combinación de interfaces y posiblemente un aumento global según el contexto.

##### Ejemplo

Suponiendo que `__dirname` siempre está disponible en `import.meta`, la declaración se haría reabriendo la interfaz de `ImportMeta`:

```ts
// node.d.ts
interface ImportMeta {
  __dirname: string;
}
```

Y el uso sería:

```ts
import.meta.__dirname; // Tiene tipo 'string'.
```

`import.meta` solo está permitido cuando se dirige a módulos `ESNext` y destinos *ECMAScript*.

## Nuevo `--resolveJsonModule`

A menudo, en las aplicaciones *Node.js*, se necesita un `.json`. Con *TypeScript 2.9*, [`resolveJsonModule`](/tsconfig#resolveJsonModule) permite importar, extraer tipos y generar archivos `.json`.

##### Ejemplo

```ts
// settings.json

{
    "repo": "TypeScript",
    "dry": false,
    "debug": false
}
```

```ts
// a.ts

import settings from "./settings.json";

settings.debug === true; // Bien
settings.dry === 2; // Error: Al operador '===' no se le pueden aplicar booleano y numérico
```

```json tsconfig
// tsconfig.json

{
  "compilerOptions": {
    "module": "commonjs",
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Salida `--pretty` predeterminada

Los errores al iniciar *TypeScript 2.9* se muestran en [`pretty`](/tsconfig#pretty) de forma predeterminada si el dispositivo de salida es aplicable para texto colorido.
*TypeScript* comprobará si el flujo de salida tiene establecida la propiedad [`isTty`](https://nodejs.org/api/tty.html).

Usa `--pretty false` en la línea de comando o establece `"pretty": false` en tu `tsconfig.json` para deshabilitar la salida [`pretty`](/tsconfig#pretty).

## Nuevo `--declarationMap`

Habilitar [`statementMap`](/tsconfig#DeclarationMap) junto con [`statement`](/tsconfig#statement) hace que el compilador emita archivos `.d.ts.map` junto con los archivos de salida `.d.ts`.
Language Services ahora también puede comprender estos archivos de mapa y los usa para asignar ubicaciones de definición basadas en archivos de declaración a su fuente original, cuando estén disponibles.

En otras palabras, presionar ir a la definición en una declaración de un archivo `.d.ts` generado con [`statementMap`](/tsconfig#DeclarationMap) to llevará a la ubicación del archivo fuente (`.ts`) donde esa declaración fue definida, y no a los `.d.ts`.
