---
title: TypeScript 4.0
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-0.html
oneline: Notas de la versión de TypeScript 4.0
---

## Tipos de `tupla variadic`

Considera una función en *JavaScript* llamada `concat` que toma dos tipos: arreglo o tupla y los concatena para crear un nuevo arreglo.

```js
function concat(arr1, arr2) {
  return [...arr1, ...arr2];
}
```

Considera también `tail`, que toma un arreglo o tupla y devuelve todos los elementos menos el primero.

```js
function tail(arg) {
  const [_, ...result] = arg;
  return result;
}
```

¿Cómo escribiríamos cualquiera de estos en *TypeScript*?

Para `concat`, lo único válido que podíamos hacer en versiones anteriores del lenguaje era intentar escribir algunas sobrecargas.

```ts
function concat(arr1: [], arr2: []): [];
function concat<A>(arr1: [A], arr2: []): [A];
function concat<A, B>(arr1: [A, B], arr2: []): [A, B];
function concat<A, B, C>(arr1: [A, B, C], arr2: []): [A, B, C];
function concat<A, B, C, D>(arr1: [A, B, C, D], arr2: []): [A, B, C, D];
function concat<A, B, C, D, E>(arr1: [A, B, C, D, E], arr2: []): [A, B, C, D, E];
function concat<A, B, C, D, E, F>(arr1: [A, B, C, D, E, F], arr2: []): [A, B, C, D, E, F];
```

Uh... está bien, eso es... siete sobrecargas para cuando el segundo arreglo siempre está vacío.
Agreguemos algunos para cuando `arr2` tenga un argumento.

<!-- prettier-ignore -->
```ts
function concat<A2>(arr1: [], arr2: [A2]): [A2];
function concat<A1, A2>(arr1: [A1], arr2: [A2]): [A1, A2];
function concat<A1, B1, A2>(arr1: [A1, B1], arr2: [A2]): [A1, B1, A2];
function concat<A1, B1, C1, A2>(arr1: [A1, B1, C1], arr2: [A2]): [A1, B1, C1, A2];
function concat<A1, B1, C1, D1, A2>(arr1: [A1, B1, C1, D1], arr2: [A2]): [A1, B1, C1, D1, A2];
function concat<A1, B1, C1, D1, E1, A2>(arr1: [A1, B1, C1, D1, E1], arr2: [A2]): [A1, B1, C1, D1, E1, A2];
function concat<A1, B1, C1, D1, E1, F1, A2>(arr1: [A1, B1, C1, D1, E1, F1], arr2: [A2]): [A1, B1, C1, D1, E1, F1, A2];
```

Esperamos que quede claro que esto se está volviendo poco razonable.
Desafortunadamente, también terminaría con el mismo tipo de problemas al escribir una función como `tail`.

Este es otro caso de lo que nos gusta llamar "muerte por mil sobrecargas", y ni siquiera resuelve el problema en general.
Solo proporciona los tipos correctos para tantas sobrecargas como queramos escribir.
Si quisiéramos hacer un caso general, necesitaríamos una sobrecarga como la siguiente:

```ts
function concat<T, U>(arr1: T[], arr2: U[]): Array<T | U>;
```

Pero esa firma no codifica nada sobre las longitudes de la entrada, o el orden de los elementos, cuando se usan tuplas.

*TypeScript 4.0* trae dos cambios fundamentales, junto con mejoras de inferencia, para hacer posible el tipado.

El primer cambio es que los `spreads` en sintaxis de tipo tupla ahora pueden ser genéricos.
Esto significa que podemos representar operaciones de orden superior en tuplas y arreglos incluso cuando no conocemos los tipos reales sobre los que estamos operando.
Cuando se crean instancias de `spreads` genéricos (o se reemplazan con un tipo real) en estos tipos de tuplas, pueden producir otros conjuntos de tipos de arreglos y tuplas.

Por ejemplo, eso significa que podemos escribir function como `tail`, sin nuestro problema de "muerte por mil sobrecargas".

```ts twoslash
function tail<T extends any[]>(arr: readonly [any, ...T]) {
  const [_ignored, ...rest] = arr;
  return rest;
}

const myTuple = [1, 2, 3, 4] as const;
const myArray = ["hello", "world"];

const r1 = tail(myTuple);
//    ^?

const r2 = tail([...myTuple, ...myArray] as const);
//    ^?
```

El segundo cambio es que los elementos de `rest` pueden ocurrir en cualquier lugar de una tupla: ¡no solo al final!

```ts
type Strings = [string, string];
type Numbers = [number, number];

type StrStrNumNumBool = [...Strings, ...Numbers, boolean];
```

Anteriormente, *TypeScript* emitía un error como el siguiente:

```
Un elemento `rest` debe ser el último en un tipo tupla.
```

Pero con *TypeScript 4.0*, esta restricción se relaja.

Ten en cuenta que en los casos en que distribuimos en un tipo sin una longitud conocida, el tipo resultante también se vuelve ilimitado, y todos los elementos siguientes se tienen en cuenta en el tipo de elemento `rest` resultante.

```ts
type Strings = [string, string];
type Numbers = number[];

type Unbounded = [...Strings, ...Numbers, boolean];
```

Combinando ambos comportamientos juntos, podemos escribir una única firma bien escrita para `concat`:

```ts twoslash
type Arr = readonly any[];

function concat<T extends Arr, U extends Arr>(arr1: T, arr2: U): [...T, ...U] {
  return [...arr1, ...arr2];
}
```

Si bien esa firma todavía es un poco larga, es solo una firma que no se tiene que repetir y proporciona un comportamiento predecible en todos los arreglos y tuplas.

Esta funcionalidad por sí sola es excelente, pero también brilla en escenarios más sofisticados.
Por ejemplo, considera una función para [aplicar argumentos de forma parcial](https://en.wikipedia.org/wiki/Partial_application) denominada `partialCall`.
`partialCall` toma una función ⏤ llamémosla `f` ⏤ junto con los pocos argumentos iniciales que espera `f`.
Luego devuelve una nueva función que toma cualquier otro argumento que `f` todavía necesite, y llama a `f` cuando los recibe.

```js
function partialCall(f, ...headArgs) {
  return (...tailArgs) => f(...headArgs, ...tailArgs);
}
```

*TypeScript 4.0* mejora el proceso de inferencia para los parámetros `rest` y los elementos de tupla `rest` para que podamos escribir esto y hacer que "simplemente funcione".

```ts twoslash
type Arr = readonly unknown[];

function partialCall<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}
```

En este caso, `partialCall` comprende qué parámetros puede y qué no puede tomar inicialmente, y devuelve funciones que aceptan y rechazan apropiadamente todo lo que sobra.

```ts twoslash
// @errors: 2345 2554 2554 2345
type Arr = readonly unknown[];

function partialCall<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}
// ---cut---
const foo = (x: string, y: number, z: boolean) => {};

const f1 = partialCall(foo, 100);

const f2 = partialCall(foo, "hello", 100, true, "oops");

// ¡Esto funciona!
const f3 = partialCall(foo, "hello");
//    ^?

// ¿Qué podemos hacer ahora con f3?

// ¡Trabaja!
f3(123, true);

f3();

f3(123, "hello");
```

Los tipos `tupla variadic` permiten muchos patrones nuevos y emocionantes, especialmente en torno a la composición de funciones.
Esperamos que podamos aprovecharlo para hacer un mejor trabajo comprobando el método `bind` incorporado de *JavaScript*.
Un puñado de otras mejoras y patrones de inferencia también se incluyeron en esto, y si estás interesado en obtener más información, puedes echar un vistazo a [la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/39094) para `tuplas variadic`.

## Elementos etiquetados de `tupla`

Mejorar la experiencia en torno a los tipos de `tupla`s y las listas de parámetros es importante porque nos permite obtener una validación fuertemente tipada en torno a los modismos comunes de *JavaScript*: en realidad, simplemente dividiendo y cortando listas de argumentos y pasándolas a otras funciones.
La idea de que podemos usar tipos de `tupla`s para parámetros `rest` es un lugar donde esto es crucial.

Por ejemplo, la siguiente función que usa un tipo `tupla` como parámetro `rest`...

```ts
function foo(...args: [string, number]): void {
  // ...
}
```

...no debería aparecer diferente de la siguiente función...

```ts
function foo(arg0: string, arg1: number): void {
  // ...
}
```

...para cualquier llamador de `foo`.

```ts twoslash
// @errors: 2554
function foo(arg0: string, arg1: number): void {
  // ...
}
// ---cut---
foo("hello", 42);

foo("hello", 42, true);
foo("hello");
```

Sin embargo, hay un lugar donde las diferencias comienzan a ser observables: legibilidad.
En el primer ejemplo, no tenemos nombres de parámetros para el primer y segundo elemento.
Si bien estos no tienen ningún impacto en la verificación de tipos, la falta de etiquetas en las posiciones de `tupla`s puede dificultar su uso ⏤ más difícil de comunicar nuestra intención.

Es por eso que en *TypeScript 4.0*, los tipos `tupla`s ahora pueden proporcionar etiquetas.

```ts
type Range = [start: number, end: number];
```

Para profundizar la conexión entre las listas de parámetros y los tipos `tupla`s, la sintaxis de los elementos `rest` y los elementos opcionales refleja la sintaxis de las listas de parámetros.

```ts
type Foo = [first: number, second?: string, ...rest: any[]];
```

Hay algunas reglas al usar `tupla`s etiquetadas.
Por un lado, al etiquetar un elemento de `tupla`, todos los demás elementos de la `tupla` también deben estar etiquetados.

```ts twoslash
// @errors: 5084
type Bar = [first: string, number];
```

Vale la pena señalar ⏤ las etiquetas no requieren que nombremos nuestras variables de manera diferente al desestructurar.
Están ahí únicamente para documentación y herramientas.

```ts twoslash
function foo(x: [first: string, second: number]) {
    // ...

    // Nota: no necesitamos nombrar estos 'first' y 'second'
    const [a, b] = x;
    a
//  ^?
    b
//  ^?
}
```

En general, las `tupla`s etiquetadas son útiles cuando se aprovechan los patrones alrededor de las `tupla`s y las listas de argumentos, junto con la implementación de sobrecargas de forma segura para los tipos.
De hecho, el soporte del editor de *TypeScript* intentará mostrarlos como sobrecargas cuando sea posible.

![Ayuda de firma que muestra una unión de tuplas etiquetadas como en una lista de parámetros como dos firmas](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/08/signatureHelpLa labelTuples.gif)

Para obtener más información, consulta [la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/38234) para ver los elementos de `tupla` etiquetados.

## Inferencia de propiedades de clase a partir de constructores

*TypeScript 4.0* ahora puede usar el análisis de control de flujo  para determinar los tipos de las propiedades en las clases cuando [`noImplicitAny`](/tsconfig"noImplicitAny) está habilitado.

<!--prettier-ignore -->
```ts twoslash
class Square {
  // Anteriormente, ambos eran
  area;
// ^?
  sideLength;
// ^?
  constructor(sideLength: number) {
    this.sideLength = sideLength;
    this.area = sideLength ** 2;
  }
}
```

En los casos en los que no todas las rutas de un constructor se asignan a un miembro de instancia, la propiedad se considera potencialmente `undefined`.

<!--prettier-ignore -->
```ts twoslash
// @errors: 2532
class Square {
  sideLength;
// ^?

  constructor(sideLength: number) {
    if (Math.random()) {
      this.sideLength = sideLength;
    }
  }

  get area() {
    return this.sideLength ** 2;
  }
}
```

En los casos en los que lo sepas mejor (por ejemplo, si tienes un método `initialize` de algún tipo), aún necesitarás una anotación de tipo explícita junto con una aserción de asignación definida (`!`) si estás en [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization).

```ts twoslash
class Square {
  // aserción de asignación definida
  //        v
  sideLength!: number;
  //         ^^^^^^^^
  // anotación de tipo

  constructor(sideLength: number) {
    this.initialize(sideLength);
  }

  initialize(sideLength: number) {
    this.sideLength = sideLength;
  }

  get area() {
    return this.sideLength ** 2;
  }
}
```

Para obtener más detalles, [consulta la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/37920).

## Operadores de asignación de cortocircuito

*JavaScript*, y muchos otros lenguajes, admiten un conjunto de operadores denominados operadores de asignación compuesta.
Los operadores de asignación compuesta aplican un operador a dos argumentos y luego asignan el resultado al lado izquierdo.
Es posible que los hayas visto antes:

```ts
// Adición
// a = a + b
a += b;

// Sustracción
// a = a - b
a -= b;

// Multiplicación
// a = a * b
a *= b;

// División
// a = a / b
a /= b;

// Exponenciación
// a = a ** b
a **= b;

// Desplazamiento de bit a la izquierda
// a = a << b
a <<= b;
```

¡Muchos operadores en *JavaScript* tienen un operador de asignación correspondiente!
Sin embargo, hasta hace poco, había tres excepciones notables: *and* lógicos (`&&`), *or* lógicos (`||`) y coalescentes nulos (`??`).

Es por eso que *TypeScript 4.0* admite una nueva función *ECMAScript* para agregar tres nuevos operadores de asignación: `&&=`, `||=` y `??=`.

Estos operadores son excelentes para sustituir cualquier ejemplo en el que un usuario pueda escribir código como el siguiente:

```ts
a = a && b;
a = a || b;
a = a ?? b;
```

O un bloque `if` similar como

```ts
// podría ser 'a ||= b'
if (!a) {
  a = b;
}
```

Incluso hay algunos patrones que hemos visto (or, uh, escritos nosotros mismos) para iniciar valores de forma indulgente, solo si serán necesarios.

```ts
let values: string[];
(values ?? (values = [])).push("hello");

// Después:
(values ??= []).push("hello");
```

(mira, no estamos orgullosos de *todo* el código que escribimos...)

En el raro caso de que utilices captadores o definidores con efectos secundarios, vale la pena señalar que estos operadores solo realizan asignaciones si es necesario.
En ese sentido, no solo el lado derecho del operador está "cortocircuitado" ⏤ la tarea en sí también lo es.

```ts
obj.prop ||= foo();

// aproximadamente equivalente a cualquiera de los siguientes

obj.prop || (obj.prop = foo());

if (!obj.prop) {
    obj.prop = foo();
}
```

[Intenta ejecutar el ejemplo siguiente](https://www.typescriptlang.org/play?ts=Nightly#code/MYewdgzgLgBCBGArGBeGBvAsAKBnmA5gKawAOATiKQBQCUGO+TMokIANkQHTsgHUAiYlChFyMABYBDCDHIBXMANoBuHI2Z4A9FpgAlIqXZTgRGAFsiAQg2byJeeTAwAslKgSu5KWAAmIczoYAB4YAAYuAFY1XHwAXwAaWxgIEhgKKmoAfQA3KXYALhh4EA4iH3osWM1WCDKePkFUkTFJGTlFZRimOJw4mJwAM0VgKABLcBhB0qCqplr63n4BcjGCCVgIMd8zIjz2eXciXy7k+yhHZygFIhje7BwFzgblgBUJMdlwM3yAdykAJ6yBSQGAeMzNUTkU7YBCILgZUioOBIBGUJEAHwxUxmqnU2Ce3CWgnenzgYDMACo6pZxpYIJSOqDwSkSFCYXC0VQYFi0NMQHQVEA) para ver la diferencia con *siempre* realizar la tarea.

```ts twoslash
const obj = {
    get prop() {
        console.log("getter has run");

        // ¡Reemplázame!
        return Math.random() < 0.5;
    },
    set prop(_val: boolean) {
        console.log("setter has run");
    }
};

function foo() {
    console.log("right side evaluated");
    return true;
}

console.log("This one always runs the setter");
obj.prop = obj.prop || foo();

console.log("This one *sometimes* runs the setter");
obj.prop ||= foo();
```

¡Nos gustaría extender un gran agradecimiento al miembro de la comunidad [Wenlu Wang](https://github.com/Kingwl) por esta contribución!

Para obtener más detalles, puedes [echar un vistazo a la solicitud de extracción aquí](https://github.com/microsoft/TypeScript/pull/37727).
También puedes [consultar el repositorio de propuestas de TC39 para esta función](https://github.com/tc39/proposal-logical-assignment/).

## `unknown` en las vinculaciones de cláusulas `catch`

Desde los primeros días de *TypeScript*, las variables de la cláusula `catch` siempre se han escrito como `any`.
Esto significaba que *TypeScript* le permitía hacer lo que quisieras con ellos.

```ts twoslash
// @useUnknownInCatchVariables: false
try {
  // Haz algo de trabajo
} catch (x) {
  // x tiene el tipo 'any' ⏤ ¡diviértete!
  console.log(x.message);
  console.log(x.toUpperCase());
  x++;
  x.yadda.yadda.yadda();
}
```

¡Lo anterior tiene un comportamiento indeseable si estamos tratando de evitar que ocurran *más* errores en nuestro código de manejo de errores!
Debido a que estas variables tienen el tipo `any` de manera predeterminada, carecen de seguridad de tipo que podría haber generado errores en operaciones no válidas.

Es por eso que *TypeScript 4.0* ahora te permite especificar el tipo de variables de cláusula `catch` como `unknown` en su lugar.
`unknown` es más seguro que `any` porque nos recuerda que debemos realizar algunos tipos de comprobaciones de tipo antes de operar con nuestros valores.

<!--prettier-ignore -->
```ts twoslash
// @errors: 2571
try {
  // ...
} catch (e: unknown) {
  // No se puede acceder a los valores de las incógnitas
  console.log(e.toUpperCase());

  if (typeof e === "string") {
    // Hemos reducido la 'e' al tipo 'string'.
    console.log(e.toUpperCase());
  }
}
```

Si bien los tipos de las variables `catch` no cambiarán de manera predeterminada, podríamos considerar un nuevo indicador de modo [`strict`](/tsconfig#strict) en el futuro para que los usuarios puedan optar por este comportamiento.
Mientras tanto, debería ser posible escribir una regla de `lint` para forzar que las variables `catch` tengan una anotación explícita de `:any` o `:unknown`.

Para obtener más detalles, puedes [echar un vistazo a los cambios de esta función](https://github.com/microsoft/TypeScript/pull/39015).

## Fábricas *JSX* personalizadas

Cuando usamos *JSX*, un [*fragmento*](https://reactjs.org/docs/fragments.html) es un tipo de elemento *JSX* que nos permite devolver múltiples elementos secundarios.
Cuando implementamos por primera vez fragmentos en *TypeScript*, no teníamos una gran idea sobre cómo los utilizarían otras bibliotecas.
Hoy en día, la mayoría de las otras bibliotecas que fomentan el uso de *JSX* y admiten fragmentos tienen una forma de *API* similar.

En *TypeScript 4.0*, los usuarios pueden personalizar la fábrica de fragmentos a través de la nueva opción [`jsxFragmentFactory`](/tsconfig#jsxFragmentFactory).

Como ejemplo, el siguiente archivo `tsconfig.json` le dice a *TypeScript* que transforme *JSX* de una manera compatible con *React*, pero cambia cada invocación de fábrica a `h` en lugar de `React.createElement`, y usa `Fragment` en lugar de `React .Fragmento`.

```jsonc tsconfig
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

En los casos en los que necesites tener una fábrica *JSX* diferente por archivo<!-- (tal vez te guste enviar *React*, *Preact* e *Inferno* para brindar una experiencia increíblemente rápida) -->, puedes aprovechar el nuevo comentario pragma `/** @jsxFrag */`.
Por ejemplo, lo siguiente...

```tsx twoslash
// @noErrors
// Nota: estos comentarios pragmáticos se deben escribir
// con una sintaxis multilínea de estilo JSDoc para que surta efecto.

/** @jsx h */
/** @jsxFrag Fragment */

import { h, Fragment } from "preact";

export const Header = (
  <>
    <h1>Welcome</h1>
  </>
);
```

...se transformará en esta salida *JavaScript*...

```tsx twoslash
// @noErrors
// @showEmit
// Nota: estos comentarios pragmáticos se deben escribir
// con una sintaxis multilínea de estilo JSDoc para que surta efecto.

/** @jsx h */
/** @jsxFrag Fragment */

import { h, Fragment } from "preact";

export const Header = (
  <>
    <h1>Welcome</h1>
  </>
);
```

Nos gustaría extender un gran agradecimiento al miembro de la comunidad [Noj Vek](https://github.com/nojvek) por enviar esta solicitud de extracción y trabajar pacientemente con nuestro equipo en ella.

¡Puedes ver [la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/38720) para obtener más detalles!

## Mejoras de velocidad en el modo `build` con `--noEmitOnError`

Anteriormente, compilar un programa después de una compilación anterior con errores en [`incremental`](/tsconfig#incremental) sería extremadamente lento cuando se usaba el indicador [`noEmitOnError`](/tsconfig#noEmitOnError).
Esto se debe a que ninguna información de la última compilación se almacenará en caché en un archivo `.tsbuildinfo` basado en el indicador [`noEmitOnError`](/tsconfig#noEmitOnError).

*TypeScript 4.0* cambia esto, lo que da un gran aumento de velocidad en estos escenarios y, a su vez, mejora los escenarios del modo `--build` (lo que implica tanto [`incremental`](/tsconfig#incremental) como [`noEmitOnError`](/tsconfig#noEmitOnError)).

Para obtener más detalles, [lee más sobre la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/38853).

## `--incremental` con `--noEmit`

*TypeScript 4.0* nos permite usar el indicador [`noEmit`](/tsconfig#noEmit) cuando aún aprovechamos las compilaciones [`incremental`](/tsconfig#incremental).
Esto no estaba permitido anteriormente, ya que [`incremental`](/tsconfig#incremental) necesita emitir archivos `.tsbuildinfo`; sin embargo, el caso de uso para permitir compilaciones incrementales más rápidas es lo suficientemente importante como para habilitarlo para todos los usuarios.

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/39122).

## Mejoras del editor

El compilador de *TypeScript* no solo potencia la experiencia de edición para *TypeScript* en sí mismo en la mayoría de los editores principales ⏤ también potencia la experiencia de *JavaScript* en la familia de editores de *Visual Studio* y más.
Por esa razón, gran parte de nuestro trabajo se centra en mejorar los escenarios del editor: el lugar donde pasas la mayor parte de tu tiempo como desarrollador.

El uso de la nueva funcionalidad de *TypeScript*/*JavaScript* en tu editor será diferente según tu editor, pero

- *Visual Studio Code* admite [seleccionar diferentes versiones de *TypeScript*](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Alternativamente, existe la [Extensión nocturna de *JavaScript*/*TypeScript*](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) para mantenerte a la vanguardia (que generalmente es muy estable).
- *Visual Studio 2017/2019* tiene [los instaladores de *SDK* anteriores] y [instalación de *MSBuild*](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild).
- *Sublime Text 3* admite [seleccionar diferentes versiones de *TypeScript*](https://github.com/microsoft/TypeScript-Sublime-Plugin#note-using-different-versions-of-typescript)

Puedes consultar una [lista parcial de editores que admiten *TypeScript*](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support) para obtener más información sobre si tu editor favorito tiene soporte para usar nuevas versiones.

### Convertir a encadenamiento opcional

El encadenamiento opcional es una característica reciente que ha recibido mucho cariño.
Es por eso que *TypeScript 4.0* trae una nueva refactorización para convertir patrones comunes para aprovechar el [encadenamiento opcional](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#optional-chaining) y [anular la fusión](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#nullish-coalescing)!

![Convertir `a && a.b.c && a.b.c.d.e.f()` a `a?.b.c?.d.e.f.()`](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/08/convertToOptionalChain-4-0.gif)

Ten en cuenta que si bien esta refactorización no captura *perfectamente* el mismo comportamiento debido a sutilezas con veracidad/falsedad en *JavaScript*, creemos que deberías capturar la intención para la mayoría de los casos de uso, especialmente cuando *TypeScript* tiene un conocimiento más preciso de tus tipos.

Para obtener más detalles, [consulta la solicitud de extracción aquí](https://github.com/microsoft/TypeScript/pull/39135).

### Soporte para `/**@deprecated */`

El soporte de edición de *TypeScript* ahora reconoce cuando una declaración ha sido marcada con un `/ **@deprecated */` Comentario *JSDoc*.
Esa información aparece en listas de compleción y como un diagnóstico de sugerencia que los editores pueden manejar de manera especial.
En un editor como *VS Code*, los valores obsoletos se muestran normalmente en un estilo tachado ~~como este~~.

![Algunos ejemplos de declaraciones obsoletas con texto tachado en el editor](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/06/deprecated_4-0.png)

Esta nueva funcionalidad está disponible gracias a [Wenlu Wang](https://github.com/Kingwl).
Consulta [la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/38523) para obtener más detalles.

### Modo semántico parcial al inicio

Hemos escuchado mucho de usuarios que sufren largos tiempos de inicio, especialmente en proyectos más grandes.
El culpable suele ser un proceso llamado *construcción de programas*.
Este es el proceso de comenzar con un conjunto inicial de archivos raíz, analizarlos, encontrar sus dependencias, analizar esas dependencias, encontrar las dependencias de esas dependencias, etc.
Cuanto más grande sea tu proyecto, más tiempo tendrás que esperar antes de poder obtener las operaciones básicas del editor, como ir a la definición o información rápida.

Es por eso que hemos estado trabajando en un nuevo modo para que los editores brinden una experiencia *parcial* hasta que se cargue la experiencia completa del servicio del lenguaje.
La idea central es que los editores pueden ejecutar un servidor parcial ligero que solo mira los archivos actuales que el editor tiene abiertos.

Es difícil decir con precisión qué tipo de mejoras verás, pero anecdóticamente, solía tomar entre *20 segundos a un minuto* antes de que *TypeScript* se volviera completamente receptivo en el código base de *Visual Studio Code*.
Por el contrario, **nuestro nuevo modo semántico parcial parece reducir ese retraso a solo unos segundos**.
Como ejemplo, en el siguiente video, puedes ver dos editores uno al lado del otro con *TypeScript 3.9* ejecutándose a la izquierda y *TypeScript 4.0* ejecutándose a la derecha.

<video loop autoplay muted style="width:100%;height:100%;" src="https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/08/partialModeFast.mp4">
</video>

Al reiniciar ambos editores en un código base particularmente grande, el que tiene *TypeScript 3.9* no puedes proporcionar terminaciones o información rápida en absoluto.
Por otro lado, el editor con *TypeScript 4.0* puede brindarnos *inmediatamente* una rica experiencia en el archivo actual que estamos editando, a pesar de cargar el proyecto completo en segundo plano.

Actualmente, el único editor que admite este modo es [*Visual Studio Code*](http://code.visualstudio.com/) que tiene algunas mejoras de *XU* en [*Visual Studio Code Insiders*](http://code.visualstudio.com/insiders).
Reconocemos que esta experiencia aún puede tener espacio para pulir en *XU* y funcionalidad, y tenemos [una lista de mejoras](https://github.com/microsoft/TypeScript/issues/39035) en mente.
Estamos buscando más comentarios sobre lo que crees que podría ser útil.

Para obtener más información, puedes [ver la propuesta original](https://github.com/microsoft/TypeScript/issues/37713), [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/38561), junto con [el meta problema de seguimiento](https://github.com/microsoft/TypeScript/issues/39035).

### Importaciones automáticas más inteligentes

La importación automática es una característica fantástica que facilita mucho la codificación; sin embargo, cada vez que la importación automática no parece funcionar, puedes confundir mucho a los usuarios.
Un problema específico que escuchamos de los usuarios fue que las importaciones automáticas no funcionaban en las dependencias escritas en *TypeScript* ⏤ es decir, hasta que escribieron al menos una importación explícita en algún otro lugar de su proyecto.

¿Por qué las importaciones automáticas funcionarían para paquetes `@ types`, pero no para paquetes que envían sus propios tipos?
Resulta que las importaciones automáticas solo funcionan en paquetes que su proyecto *ya* incluye.
Debido a que *TypeScript* tiene algunos valores predeterminados extravagantes que agregan automáticamente paquetes en `node_modules/@types` a tu proyecto, *esos* paquetes se importarían automáticamente.
Por otro lado, se excluyeron otros paquetes porque rastrear todos tus paquetes `node_modules` puede ser *realmente* costoso.

Todo esto conduce a una experiencia de inicio bastante pésima para cuando intentas importar automáticamente algo que acabas de instalar pero que aún no has usado.

*TypeScript 4.0* ahora hace un poco más de trabajo en escenarios de editor para incluir los paquetes que has enumerado en los campos `dependencies` (y `peerDependencies`) de tu `package.json`.
La información de estos paquetes solo se usa para mejorar las importaciones automáticas y no cambia nada más, como la verificación de tipos.
Esto nos permite proporcionar importaciones automáticas para todas sus dependencias que tienen tipos, sin incurrir en el costo de una búsqueda completa de `node_modules`.

En los raros casos en que tu `package.json` enumera más de diez dependencias escritas que aún no se han importado, esta función se desactiva automáticamente para evitar la carga lenta del proyecto.
Para forzar el trabajo de la función o para deshabilitarla por completo, deberías poder configurar tu editor.
Para *Visual Studio Code*, esta es la configuración "Incluir paquete *JSON Auto Imports*" (o `typescript.preferences.includePackageJsonAutoImports`).

![Configuración de 'include package de importación automática de JSON'](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/08/configurePackageJsonAutoImports4-0.png)
Para obtener más detalles, puedes ver [la propuesta de incidencia](https://github.com/microsoft/TypeScript/issues/37812) junto con [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/tirar/38923).

## ¡Nuestro nuevo sitio web!

[El sitio web de *TypeScript*](https://www.typescriptlang.org/) se ha reescrito recientemente desde cero y se ha implementado.

![Una captura de pantalla del nuevo sitio web de *TypeScript*](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/08/ts-web.png)

[Ya escribimos un poco sobre nuestro nuevo sitio](https://devblogs.microsoft.com/typescript/announcing-the-new-typescript-website/), para que puedas leer más allí; ¡Pero vale la pena mencionar que todavía estamos esperando escuchar lo que piensas!
Si tienes preguntas, comentarios o sugerencias, puedes [archivarlos en el rastreador de problemas del sitio web](https://github.com/microsoft/TypeScript-Website).

## Ruptura por cambios

### Cambios `lib.d.ts`

Nuestras declaraciones `lib.d.ts` han cambiado ⏤ específicamente, los tipos del *DOM* han cambiado.
El cambio más notable puede ser la eliminación de [`document.origin`](https://developer.mozilla.org/docs/Web/API/Document/origin) que solo funcionaba en versiones antiguas de *IE* y *Safari*
*MDN* recomienda pasar a [`self.origin`](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/origin).

### Propiedades que redefinen los accesos (y viceversa) es un error

Anteriormente, solo era un error que las propiedades invalidaran los descriptores de acceso, o que los descriptores de acceso reemplazaran las propiedades, cuando se usaba [`useDefineForClassFields`](/tsconfig#useDefineForClassFields); sin embargo, *TypeScript* ahora siempre emite un error al declarar una propiedad en una clase derivada que redefinirá un captador o definidor en la clase base.

```ts twoslash
// @errors: 1049 2610
class Base {
  get foo() {
    return 100;
  }
  set foo(value) {
    // ...
  }
}

class Derived extends Base {
  foo = 10;
}
```

```ts twoslash
// @errors: 2611
class Base {
  prop = 10;
}

class Derived extends Base {
  get prop() {
    return 100;
  }
}
```

Consulta más detalles sobre [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/37894).

### Los operandos para "eliminar" (`delete`) deben ser opcionales.

Cuando se usa el operador `delete` en [`strictNullChecks`](/tsconfig#strictNullChecks), el operando ahora debe ser `any`, `unknown`, `never`, o ser opcional (ya que contiene `undefined` en el tipo).
De lo contrario, el uso del operador `delete` es un error.

```ts twoslash
// @errors: 2790
interface Thing {
  prop: string;
}

function f(x: Thing) {
  delete x.prop;
}
```

Consulta más detalles sobre [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/37921).

### El uso de la fábrica *Node* de *TypeScript* está obsoleto

En la actualidad, *TypeScript* proporciona un conjunto de funciones "de fábrica" ​​para producir *Nodos AST*; sin embargo, *TypeScript 4.0* proporciona una nueva *API* de fábrica de *Node*.
Como resultado, para *TypeScript 4.0* hemos tomado la decisión de desaprobar estas funciones antiguas en favor de las nuevas.

Para obtener más detalles, [lee sobre la solicitud de extracción relevante para este cambio](https://github.com/microsoft/TypeScript/pull/35282).
