---
title: TypeScript 3.2
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-2.html
oneline: Notas de la versión de TypeScript 3.2
---

## `strictBindCallApply`

*TypeScript 3.2* introduce una nueva opción del compilador [`strictBindCallApply`](/tsconfig#strictBindCallApply) (en la familia de opciones [`strict`](/tsconfig#strict)) con la que se aplican los comandos `bind`, `call` y los métodos `apply` de los objetos de función están fuertemente tipados y estrictamente controlados.

```ts
function foo(a: number, b: string): string {
  return a + b;
}

let a = foo.apply(undefined, [10]); // error: muy pocos argumentos
let b = foo.apply(undefined, [10, 20]); // error: El segundo argumento es un número
let c = foo.apply(undefined, [10, "hello", 30]); // error: demasiados argumentos
let d = foo.apply(undefined, [10, "hello"]); // ¡Bien! devuelve una cadena
```

Esto se logra mediante la introducción de dos nuevos tipos, `CallableFunction` y `NewableFunction`, en `lib.d.ts`. Estos tipos contienen declaraciones de métodos genéricos especializados para `bind`, `call` y `apply` para funciones regulares y funciones constructoras, respectivamente. Las declaraciones usan parámetros `rest` genéricos (ve #24897) para capturar y reflejar listas de parámetros de una manera fuertemente tipada. En el modo [`strictBindCallApply`](/tsconfig#strictBindCallApply) estas declaraciones se utilizan en lugar de las declaraciones (muy permisivas) proporcionadas por el tipo `Function`.

## Advertencias

Dado que las comprobaciones más estrictas pueden descubrir errores no informados previamente, este es un cambio importante en el modo [`strict`](/tsconfig#strict).

Además, [otra advertencia](https://github.com/Microsoft/TypeScript/pull/27028#issuecomment-429334450) de esta nueva funcionalidad es que, debido a ciertas limitaciones, `bind`, `call` y `apply` todavía no se pueden modelar completamente funciones genéricas o funciones que tienen sobrecargas.
Cuando se utilizan estos métodos en una función genérica, los parámetros de tipo se sustituirán por el tipo de objeto vacío (`{}`), y cuando se utilicen en una función con sobrecargas, solo se modelará la última sobrecarga.

## Expresiones de propagación genéricas en objetos literales

En *TypeScript 3.2*, los objetos literales ahora permiten expresiones de propagación genéricas que ya producen intersección de tipos, similares a la función `Object.assign` y literales *JSX*. Por ejemplo:

```ts
function taggedObject<T, U extends string>(obj: T, tag: U) {
  return { ...obj, tag }; // T & { tag: U }
}

let x = taggedObject({ x: 10, y: 20 }, "point"); // { x: number, y: number } & { tag: "point" }
```

Las asignaciones de propiedad y las expresiones de dispersión no genéricas se fusionan en la mayor medida posible a ambos lados de una expresión de extensión genérica. Por ejemplo:

```ts
function foo1<T>(t: T, obj1: { a: string }, obj2: { b: string }) {
  return { ...obj1, x: 1, ...t, ...obj2, y: 2 }; // { a: string, x: number } & T & { b: string, y: number }
}
```

Las expresiones de propagación no genéricas continúan procesándose como antes: Las firmas de llamadas y construcciones se eliminan, solo se conservan las propiedades que no son de método y, para las propiedades con el mismo nombre, se utiliza el tipo de propiedad situada más a la derecha. Esto contrasta con la intersección de tipos que concatenan firmas de llamada y construcción, preservan todas las propiedades e intersectan los tipos de propiedades con el mismo nombre. Por lo tanto, los diferenciales de los mismos tipos pueden producir resultados diferentes cuando se crean mediante la creación de instancias de tipos genéricos:

```ts
function spread<T, U>(t: T, u: U) {
  return { ...t, ...u }; // T & U
}

declare let x: { a: string; b: number };
declare let y: { b: string; c: boolean };

let s1 = { ...x, ...y }; // { a: string, b: string, c: boolean }
let s2 = spread(x, y); // { a: string, b: number } & { b: string, c: boolean }
let b1 = s1.b; // string
let b2 = s2.b; // number & string
```

## Parámetros y variables `rest` de objetos genéricos

*TypeScript 3.2* también permite desestructurar un enlace `rest` a partir de una variable genérica. Esto se logra usando los tipos de ayuda predefinidos `Pick` y `Exclude` de `lib.d.ts`, y usando el tipo genérico en cuestión, así como los nombres de las otras vinculaciones en el patrón de desestructuración.

```ts
function excludeTag<T extends { tag: string }>(obj: T) {
  let { tag, ...rest } = obj;
  return rest; // Pick<T, Exclude<keyof T, "tag">>
}

const taggedPoint = { x: 10, y: 20, tag: "point" };
const point = excludeTag(taggedPoint); // { x: number, y: number }
```

## `BigInt`

Los `BigInts` son parte de una próxima propuesta en *ECMAScript* que nos permite modelar teóricamente números enteros arbitrariamente grandes.
*TypeScript 3.2* ofrece verificación de tipos para `BigInts`, así como soporte para emitir literales `BigInt` al apuntar a `esnext`.

El soporte de `BigInt` en *TypeScript* introduce un nuevo tipo primitivo llamado `bigint` (todo en minúsculas).
Puedes obtener un `bigint` llamando a la función `BigInt()` o escribiendo un `BigInt` literal agregando una `n` al final de cualquier literal numérico entero:

```ts
let foo: bigint = BigInt(100); // la función BigInt
let bar: bigint = 100n; // un BigInt literal

// *Golpea el techo de la función de fibonacci*
// Este chico malo devuelve entradas que pueden llegar a ser *tan* ¡big!
function fibonacci(n: bigint) {
  let result = 1n;
  for (let last = 0n, i = 0n; i < n; i++) {
    const current = result;
    result += last;
    last = current;
  }
  return result;
}

fibonacci(10000n);
```

Si bien puedes imaginar una interacción cercana entre `number` y `bigint`, los dos son dominios separados.

```ts
declare let foo: number;
declare let bar: bigint;

foo = bar; // error: El tipo 'bigint' no se puede asignar al tipo 'number'.
bar = foo; // error: El tipo 'number' no se puede asignar al tipo 'bigint'.
```

Como se especifica en *ECMAScript*, mezclar `number`s y `bigint`s en operaciones aritméticas es un error.
Tendrás que convertir explícitamente los valores a `BigInt`s.

```ts
console.log(3.141592 * 10000n); // error
console.log(3145 * 10n); // error
console.log(BigInt(3145) * 10n); // ¡Bien!
```

También es importante tener en cuenta que los `bigint`s producen una nueva cadena cuando se usa el operador `typeof`: la cadena `"bigint"`.
Por lo tanto, *TypeScript* se reduce correctamente usando `typeof` como era de esperar.

```ts
function whatKindOfNumberIsIt(x: number | bigint) {
  if (typeof x === "bigint") {
    console.log("'x' is a bigint!");
  } else {
    console.log("'x' is a floating-point number");
  }
}
```

Nos gustaría extender un enorme agradecimiento a [Caleb Sander](https://github.com/calebsander) por todo el trabajo en esta característica.
Estamos agradecidos por la contribución y estamos seguros de que nuestros usuarios también lo están.

## Advertencias

Como mencionamos, el soporte de `BigInt` solo está disponible para el objetivo `esnext`.
Puede que no sea obvio, pero debido a que los `BigInts` tienen un comportamiento diferente para operadores matemáticos como `+`, `-`, `*`, etc., brindan funcionalidad para objetivos más antiguos donde la función no existe (como `es2017` e inferior ) implicaría reescribir cada una de estas operaciones.
*TypeScript* necesitaría distribuirse al comportamiento correcto según el tipo, por lo que cada adición, concatenación de cadenas, multiplicación, etc. implicaría una llamada a función.

Por esa razón, no tenemos planes inmediatos para brindar soporte de nivel inferior.
En el lado positivo, *Node 11* y las versiones más recientes de *Chrome* ya son compatibles con esta función, por lo que podrás usar `BigInts` allí cuando apuntes a `esnext`.

Ciertos destinos pueden incluir un objeto de el entorno de ejecución `polyfill` o similar a `BigInt`.
Para esos propósitos, es posible que desees agregar `esnext.bigint` a la configuración de [`lib`](/tsconfig#lib) en las opciones del compilador.

## Tipos que no pertenecen a la unidad como discriminantes de unión

*TypeScript 3.2* facilita la reducción al relajar las reglas de lo que considera una propiedad discriminante.
Las propiedades comunes de las uniones ahora se consideran discriminantes siempre que contengan *algún* tipo singleton (por ejemplo, una cadena literal, `null` o `undefined`) y no contengan genéricos.

Como resultado, *TypeScript 3.2* considera que la propiedad `error` en el siguiente ejemplo es un discriminante, mientras que antes no lo haría, ya que `Error` no es un tipo `singleton`.
Gracias a esto, la reducción funciona correctamente en el cuerpo de la función `unwrap`.

```ts
type Result<T> = { error: Error; data: null } | { error: null; data: T };

function unwrap<T>(result: Result<T>) {
  if (result.error) {
    // Aquí 'error' no es null
    throw result.error;
  }

  // Ahora 'data' no es null
  return result.data;
}
```

## Herencia `tsconfig.json` a través de paquetes *Node.js*

*TypeScript 3.2* ahora resuelve `tsconfig.json`s de `node_modules`. Cuando se usa una ruta simple para el campo `extends` en `tsconfig.json`, *TypeScript* se sumergirá en los paquetes de `node_modules` por nosotros.

```jsonc tsconfig
{
  "extends": "@my-team/tsconfig-base",
  "include": ["./**/*"],
  "compilerOptions": {
    // Redefine ciertas opciones proyecto por proyecto.
    "strictBindCallApply": false
  }
}
```

Aquí, *TypeScript* subirá los archivos `node_modules` buscando un paquete `@my-team/tsconfig-base`. Para cada uno de esos paquetes, *TypeScript* primero verificará si `package.json` contiene un campo `"tsconfig"`, y si lo tiene, *TypeScript* intentará cargar un archivo de configuración desde ese campo. Si ninguno de los dos existe, *TypeScript* intentará leer desde un `tsconfig.json` en la raíz. Esto es similar al proceso de búsqueda de archivos `.js` en paquetes que usan *Node*, y al proceso de búsqueda `.d.ts` que *TypeScript* ya usa.

Esta característica puede ser extremadamente útil para organizaciones más grandes o proyectos con muchas dependencias distribuidas.

## El nuevo indicador `--showConfig`

`tsc`, el compilador de *TypeScript*, admite una nueva marca llamada `--showConfig`.
Al ejecutar `tsc --showConfig`, *TypeScript* calculará el `tsconfig.json` efectivo (después de calcular las opciones heredadas del campo `extends`) y lo imprimirá.
Esto puede resultar útil para diagnosticar problemas de configuración en general.

## Declaraciones `Object.defineProperty` en *JavaScript*

Al escribir en archivos *JavaScript* (usando [`allowJs`](/tsconfig#allowJs)), *TypeScript* ahora reconoce declaraciones que usan `Object.defineProperty`.
Esto significa que obtendrás mejores completados y una comprobación de tipos más sólida cuando habilites la verificación de tipos en archivos *JavaScript* (activando la opción [`checkJs`](/tsconfig#checkJs) o agregando un comentario `//@ts-check` en la parte superior de tu archivo).

```js
// @ts-check

let obj = {};
Object.defineProperty(obj, "x", { value: "hello", writable: false });

obj.x.toLowercase();
//    ~~~~~~~~~~~
//    error:
//     La propiedad 'toLowercase' no existe en el tipo 'string'.
//     ¿Quisiste decir 'toLowerCase'?

obj.x = "world";
//  ~
//  error:
//   No se puede asignar a 'x' porque es una propiedad de solo lectura.
```
