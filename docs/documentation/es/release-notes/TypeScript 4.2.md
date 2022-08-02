---
title: TypeScript 4.2
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-2.html
oneline: Notas de la versión de TypeScript 4.2
---

## Conservación de alias de tipo más inteligente

*TypeScript* tiene una forma de declarar nuevos nombres para tipos llamados alias de tipo.
Si estás escribiendo un conjunto de funciones que trabajan todas en `string | number | boolean`, puedes escribir un alias de tipo para evitar que se repita una y otra vez.

```ts
type BasicPrimitive = number | string | boolean;
```

*TypeScript* siempre ha utilizado un conjunto de reglas y conjeturas sobre cuándo reutilizar los alias de tipos al imprimir tipos.
Como ejemplo, el siguiente fragmento de código

```ts
export type BasicPrimitive = number | string | boolean;

export function doStuff(value: BasicPrimitive) {
  let x = value;
  return x;
}
```

Si pasemos nuestro ratón sobre `x` en un editor como *Visual Studio*, *Visual Studio Código*, o [*PlayGround* de *TypeScript*](https://www.typescriptlang.org/play?ts=4.1.3#code/KYDwDg9gTgLgBDAnmYcBCBDAzgSwMYAKUOAtjjDgG6oC8cAdgK4kBGwUcAPnFjMfQHMucFhAgAbYBnoBuAFBzQkWHABmjengoR6cACYQAyjEarVACkoZxjYAC502fEVLkqwAJRwA3nLj+4SXgQODorG2B5ALgoYBMoXRB5AF8gA), obtendremos un panel de información rápida que muestra el tipo `BasicPrimitive`.
Del mismo modo, si obtenemos la salida del archivo de declaración (salida `.d.ts`) para este archivo, *TypeScript* dirá que `doStuff` devuelve `BasicPrimitive`.

Sin embargo, ¿qué sucede si devolvemos un `BasicPrimitive` o `undefined`?

```ts
export type BasicPrimitive = number | string | boolean;

export function doStuff(value: BasicPrimitive) {
  if (Math.random() < 0.5) {
    devuelve undefined
  }

  return value;
}
```

Podemos ver lo que sucede [en *Playground* de *TypeScript 4.1*](https://www.typescriptlang.org/play?ts=4.1.3#code/KYDwDg9gTgLgBDAnmYcBCBDAzgSwMYAKUOAtjjDgG6oC8cAdgK4kBGwUcAPnFjMfQHMucFhAgAbYBnoBuALAAoRQHplcABIRqHCPTgByACYQAyjEYAzC-pHBxEAO4IIPYKgcALDPAAqyYCZ4xGDwhjhYYOIYiFhwFtAIHqhQwOZQekgoAHQqagDqqGQCHvBe1HCgKHgwwIZw5M5wYPzw2Lm5cJ2YuITEZBTl3Iz0hsAWOPS1HR0sjPBs9k5+KIHB8AAsWQBMADT18BO8UnVhEVExcG0Kqh2dTKzswrz8QtyiElJ6QyNjE1PXykUlWg8Asw2qOF0cGMZksFgAFJQMOJGMAAFzobD4IikchUYAASjgAG9FJ1yTgLHB4QBZbweLJQaTGEjwokAHjgAAYsgBWImkhTk4WdFJpPTDUbjSaGeRC4UAX0UZOFYsY6TgSJRwDlcAVQA).
Si bien es posible que deseemos que *TypeScript* muestre el tipo de retorno de `doStuff` como `BasicPrimitive | undefined`, en su lugar muestra `string | number | boolean | undefined`!
¿Que da?

Bueno, esto tiene que ver sobre cómo representa internamente los tipos *TypeScript*.
Al crear un tipo unión a partir de uno o más tipos unión, siempre *normalizará* esos tipos en un nuevo tipo unión aplanado ⏤ pero al hacer eso se pierde información.
El comprobador de tipos tendría que encontrar todas las combinaciones de tipos de `string | number | boolean | undefined` para ver qué tipos de alias se podrían haber usado, e incluso entonces, podría haber múltiples tipos de alias en `string | number | boolean`.

En *TypeScript 4.2*, nuestros componentes internos son un poco más inteligentes.
Realizamos un seguimiento de cómo se construyeron los tipos al mantener partes de cómo se escribieron y construyeron originalmente a lo largo del tiempo.
¡También hacemos un seguimiento de los alias de tipos y los diferenciamos de las instancias de otros alias!

Ser capaz de volver a imprimir los tipos en función de cómo los usaste en tu código significa que, como usuario de *TypeScript*, puedes evitar que se muestren algunos tipos descomunales, y eso a menudo se traduce en una mejor salida del archivo `.d.ts`, mensajes de error, y el tipo en el editor se muestra en información rápida y ayuda para firmas.
Esto puede ayudar a que *TypeScript* se sienta un poco más accesible para los recién llegados.

Para obtener más información, consulta [la primera solicitud de extracción que mejora varios casos sobre la conservación de los alias de tipo `union`](https://github.com/microsoft/TypeScript/pull/42149), junto con [una segunda solicitud de extracción que conserva los alias indirectos](https://github.com/microsoft/TypeScript/pull/42284).

## Elementos `rest` intermedios/principales en tipos `tupla`

En *TypeScript*, los tipos `tupla` están destinados a modelar arreglos con longitudes y tipos de elementos específicos.

```ts
// Una tupla que almacena un par de números.
let a: [number, number] = [1, 2];

// Una tupla que almacena una cadena, un número y un booleano
let b: [string, number, boolean] = ["hello", 42, true];
```

Con el tiempo, los tipos `tupla` de *TypeScript* se han vuelto cada vez más sofisticados, ya que también se utilizan para modelar cosas como listas de parámetros en *JavaScript*.
Como resultado, pueden tener elementos opcionales y elementos `rest`, e incluso pueden tener etiquetas para herramientas y legibilidad.

```ts twoslash
// Una tupla que tiene una o dos cadenas.
let c: [string, string?] = ["hello"];
c = ["hello", "world"];

// Una tupla etiquetada que tiene una o dos cadenas.
let d: [first: string, second?: string] = ["hello"];
d = ["hello", "world"];

// Una tupla con un *elemento rest* - sostiene al menos 2 `strings` en la parte delantera,
// y cualquier número de booleanos en la parte posterior.
let e: [string, string, ...boolean[]];

e = ["hello", "world"];
e = ["hello", "world", false];
e = ["hello", "world", true, false, true];
```

En *TypeScript 4.2*, los elementos `rest` se expandieron específicamente en cómo se pueden usar.
En versiones anteriores, *TypeScript* solo permitía elementos `...rest` en la última posición de un tipo `tupla`.

Sin embargo, ahora los elementos `rest` pueden ocurrir en cualquier lugar dentro de una `tupla`. con solo unas pocas restricciones.

```ts twoslash
let foo: [...string[], number];

foo = [123];
foo = ["hello", 123];
foo = ["hello!", "hello!", "hello!", 123];

let bar: [boolean, ...string[], boolean];

bar = [true, false];
bar = [true, "some text", false];
bar = [true, "some", "separated", "text", false];
```

La única restricción es que un elemento `rest` se puede colocar en cualquier lugar de una tupla, siempre que no vaya seguido de otro elemento opcional o elemento `rest`.
En otras palabras, solo un elemento `rest` por tupla y ningún elemento opcional después de los elementos `rest`.

```ts twoslash
// @errors: 1265 1266
interface Clown {
  /*...*/
}
interface Joker {
  /*...*/
}

let StealersWheel: [...Clown[], "me", ...Joker[]];

let StringsAndMaybeBoolean: [...string[], boolean?];
```

Estos elementos `rest` no finales se pueden usar para modelar funciones que toman cualquier número de argumentos iniciales, seguidos de algunos fijos.

```ts twoslash
declare function doStuff(...args: [...names: string[], shouldCapitalize: boolean]): void;

doStuff(/*shouldCapitalize:*/ false)
doStuff("fee", "fi", "fo", "fum", /*shouldCapitalize:*/ true);
```

Aunque *JavaScript* no tiene ninguna sintaxis para modelar los parámetros `rest` principales, aún pudimos declarar `doStuff` como una función que toma argumentos principales al declarar el parámetro `rest ... args`  con *un tipo `tupla` que usa un elemento `rest`*.
¡Esto puede ayudar a modelar muchos *JavaScript* existentes!

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/41544).

## Controles más estrictos para el operador `in`

En *JavaScript*, es un error del entorno de ejecución utilizar un tipo que no sea un objeto en el lado derecho del operador `in`.
*TypeScript 4.2* garantiza que esto se pueda detectar en tiempo de diseño.

```ts twoslash
// @errors: 2361
"foo" in 42;
```

Esta verificación es bastante conservadora en su mayor parte, por lo que si has recibido un error al respecto, es probable que se trate de un problema en el código.

¡Muchas gracias a nuestro colaborador externo [Jonas Hübotter](https://github.com/jonhue) por [su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/41928)!

## `--noPropertyAccessFromIndexSignature`

Cuando *TypeScript* introdujo por primera vez los índices de firmas, solo se podían obtener propiedades declaradas por ellas con una sintaxis de acceso a elementos "entre corchetes" como `persona["nombre"]`.

```ts twoslash
interface SomeType {
  /** Este es un índice de firma. */
  [nombrePropiedad: string]: any;
}

function doStuff(value: SomeType) {
  let x = value["someProperty"];
}
```

Esto terminó siendo engorroso en situaciones en las que necesitamos trabajar con objetos que tienen propiedades arbitrarias.
Por ejemplo, imagina una *API* donde es común escribir mal el nombre de una propiedad agregando un carácter `s` adicional al final.

```ts twoslash
interface Options {
  /** Patrones de archivo que se excluirán. */
  exclude?: string[];

  /**
   * Maneja cualquier propiedad adicional que no hayamos declarado como tipo 'any'.
   */
  [x: string]: any;
}

function processOptions(opts: Options) {
  // Nota que *intencionalmente* estamos accediendo a `excludes`, no a `exclude`
  if (opts.excludes) {
    console.error(
      "La opción `excludes` no es válida. ¿Quisiste decir `exclude`?"
    );
  }
}
```

Para facilitar este tipo de situaciones, hace un tiempo, *TypeScript* hizo posible el uso de la sintaxis de acceso a la propiedad "con puntos" como `person.name` cuando un tipo tenía un índice de firma de cadena.
Esto también facilitó la transición del código *JavaScript* existente a *TypeScript*.

Sin embargo, aflojar la restricción también significó que escribir mal una propiedad declarada explícitamente se volvió mucho más fácil.

```ts twoslash
interface Options {
  /** Patrones de archivo que se excluirán. */
  exclude?: string[];

  /**
   * Maneja cualquier propiedad adicional que no hayamos declarado como tipo 'any'.
   */
  [x: string]: any;
}
// ---cut---
function processOptions(opts: Options) {
  // ...

  // Ten en cuenta que *accidentalmente* estamos accediendo a `exclude` esta vez.
  // Oops! Totalmente válido.
  for (const excludePattern of opts.excludes) {
    // ...
  }
}
```

En algunos casos, los usuarios preferirían optar explícitamente por el índice de firma: preferirían recibir un mensaje de error cuando el acceso a una propiedad con puntos no corresponde a una declaración de propiedad específica.

Es por eso que *TypeScript* introduce una nueva marca llamada [`noPropertyAccessFromIndexSignature`](/tsconfig#noPropertyAccessFromIndexSignature).
En este modo, se habilitará el comportamiento anterior de *TypeScript* que emite un error.
Esta nueva configuración no pertenece a la familia de indicadores [`strict`](/tsconfig#strict), ya que creemos que los usuarios la encontrarán más útil en cierto código base que en otros.

Puedes comprender esta característica con más detalle leyendo la [solicitud de extracción](https://github.com/microsoft/TypeScript/pull/40171/) correspondiente.
¡También nos gustaría extender un gran agradecimiento a [Wenlu Wang](https://github.com/Kingwl) que nos envió esta solicitud de extracción!

## Firmas de `Construct abstract`

*TypeScript* nos permite marcar una clase como `abstract`.
Esto le dice a *TypeScript* que la clase solo se debe extender y que ciertos miembros deben ser completados por cualquier subclase para crear una instancia.

```ts twoslash
// @errors: 2511
abstract class Shape {
  abstract getArea(): number;
}

new Shape();

class Square extends Shape {
  #sideLength: number;

  constructor(sideLength: number) {
    super();
    this.#sideLength = sideLength;
  }

  getArea() {
    return this.#sideLength ** 2;
  }
}

// Trabaja bien.
new Square(42);
```

Para asegurarte de que esta restricción en las clases `new`-`abstract`as se aplique de manera consistente, no puedes asignar una clase `abstract`a a cualquier cosa que espere una firma de construcción.

```ts twoslash
// @errors: 2322
abstract class Shape {
  abstract getArea(): number;
}
// ---cut---
interface HasArea {
  getArea(): number;
}

let Ctor: new () => HasArea = Shape;
```

Esto hace lo correcto en caso de que pretendamos ejecutar código como `new Ctor`, pero es demasiado restrictivo en caso de que queramos escribir una subclase de `Ctor`.

```ts twoslash
// @errors: 2345
abstract class Shape {
  abstract getArea(): number;
}

interface HasArea {
  getArea(): number;
}

function makeSubclassWithArea(Ctor: new () => HasArea) {
  return class extends Ctor {
    getArea() {
      return 42
    }
  };
}

let MyShape = makeSubclassWithArea(Shape);
```

Tampoco funciona bien con tipos auxiliares incorporados como `InstanceType`.

```ts twoslash
// @errors: 2344
abstract class Shape {
  abstract getArea(): number;
}
// ---cut---
type MyInstance = InstanceType<typeof Shape>;
```

Es por eso que *TypeScript 4.2* te permite especificar un modificador `abstract`o en las firmas del constructor.

```ts twoslash {5}
abstract class Shape {
  abstract getArea(): number;
}
// ---cut---
interface HasArea {
    getArea(): number;
}

// ¡Trabaja!
let Ctor: abstract new () => HasArea = Shape;
```

Agregar el modificador `abstract` a las señales de firma de una construcción que puede pasar en constructores `abstract`.
No le impide pasar otras clases/funciones constructor que son "concretas" ⏤ realmente solo indica que no hay intención de ejecutar el constructor directamente, por lo que es seguro pasar cualquier tipo de clase.

Esta característica nos permite escribir *fábricas de `mixin`* de una manera que admita clases abstractas.
Por ejemplo, en el siguiente fragmento de código, podemos usar la función *mixin* `withStyles` con la clase `abstract SuperClass`.

```ts twoslash
abstract class SuperClass {
    abstract someMethod(): void;
    badda() {}
}

type AbstractConstructor<T> = abstract new (...args: any[]) => T

function withStyles<T extends AbstractConstructor<object>>(Ctor: T) {
    abstract class StyledClass extends Ctor {
        getStyles() {
            // ...
        }
    }
    return StyledClass;
}

class SubClass extends withStyles(SuperClass) {
    someMethod() {
        this.someMethod()
    }
}
```

Ten en cuenta que `withStyles` está demostrando una regla específica, donde una clase (como `StyledClass`) que extiende un valor genérico y delimitado por un constructor abstracto (como `Ctor`) también se debe declarar como `abstract`.
Esto se debe a que no hay forma de saber si se pasó una clase con *más* miembros abstractos, por lo que es imposible saber si la subclase implementa todos los miembros abstractos.

Puedes leer más sobre firmas de construcciones abstractos [en su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36392).

## Comprender la estructura de tu proyecto con `--explainFiles`

Un escenario sorprendentemente común para los usuarios de *TypeScript* es preguntar "¿por qué *TypeScript* incluye este archivo?".
Inferir los archivos de tu programa resulta ser un proceso complicado, por lo que hay muchas razones por las que se utilizó una combinación específica de `lib.d.ts`, por qué se incluyen ciertos archivos en `node_modules` y por qué ciertos archivos se incluyen aunque pensamos que especificar `exclude` los mantendría fuera.

Es por eso que *TypeScript* ahora proporciona una marca [`explainFiles`](/tsconfig#explainFiles).

```sh
tsc --explainFiles
```

Al usar esta opción, el compilador de *TypeScript* dará una salida muy detallada sobre por qué un archivo terminó en tu programa.
Para leerlo fácilmente, puedes reenviar el resultado a un archivo o canalizarlo a un programa que pueda verlo fácilmente.

```sh
# Reenvía la salida a un archivo de texto
tsc --explainFiles > explanation.txt

# Canaliza la salida a un programa de utilidad como `less`, o un editor como VS Code
tsc --explainFiles | less

tsc --explainFiles | code -
```

Normalmente, la salida comenzará enumerando las razones por las que se incluyen los archivos `lib.d.ts`, luego los archivos locales y luego los archivos `node_modules`.

```
TS_Compiler_Directory/4.2.2/lib/lib.es5.d.ts
  Biblioteca a la que se hace referencia a través de 'es5' desde el archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2015.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2015.d.ts
  Biblioteca a la que se hace referencia a través de 'es2015' del archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2016.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2016.d.ts
  Biblioteca a la que se hace referencia a través de 'es2016' desde el archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2017.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2017.d.ts
  Biblioteca a la que se hace referencia a través de 'es2017' desde el archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2018.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2018.d.ts
  Biblioteca a la que se hace referencia a través de 'es2018' del archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2015.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2019.d.ts
  Biblioteca a la que se hace referencia a través de 'es2019' del archivo 'TS_Compiler_Directory/4.2.2/lib/lib.es2020.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.es2020.d.ts
  Biblioteca a la que se hace referencia a través de 'es2020' desde el archivo 'TS_Compiler_Directory/4.2.2/lib/lib.esnext.d.ts'
TS_Compiler_Directory/4.2.2/lib/lib.esnext.d.ts
  Biblioteca 'lib.esnext.d.ts' especificada en compilerOptions

... Más referencias de la biblioteca...

foo.ts
  Coincide con el patrón de inclusión '**/*' en `tsconfig.json`
```

En este momento, no ofrecemos ninguna garantía sobre el formato de salida ⏤ podría cambiar con el tiempo.
En ese sentido, ¡estamos interesados ​​en mejorar este formato si tienes alguna sugerencia!

Para obtener más información, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/40011).

## Comprobación de funciones no llamadas mejoradas en expresiones lógicas

Gracias a las mejoras adicionales de [Alex Tarasyuk](https://github.com/a-tarasyuk), las comprobaciones de funciones no llamadas de *TypeScript* ahora se aplican dentro de las expresiones `&&` y `||`.

En [`strictNullChecks`](/tsconfig#strictNullChecks), el siguiente código ahora generará un error.

```ts
function shouldDisplayElement(element: Element) {
  // ...
  return true;
}

function getVisibleItems(elements: Element[]) {
  return elements.filter((e) => shouldDisplayElement && e.children.length);
  //                          ~~~~~~~~~~~~~~~~~~~~
  // Esta condición siempre devolverá true ya que la función siempre está definida.
  // ¿Querías llamarla en su lugar?
}
```

Para obtener más detalles, [consulta la solicitud de extracción aquí](https://github.com/microsoft/TypeScript/issues/40197).

## Las variables desestructuradas se pueden marcar explícitamente como no utilizadas

Gracias a otra solicitud de extracción de [Alex Tarasyuk](https://github.com/a-tarasyuk), ahora puede marcar las variables desestructuradas como no utilizadas colocándolas como prefijo con un guión bajo (el carácter `_`).

```ts
let [_first, second] = getValues();
```

Anteriormente, si `_first` nunca se usaba más adelante, *TypeScript* emitía un error en [`noUnusedLocals`](/tsconfig#noUnusedLocals).
Ahora, *TypeScript* reconocerá que `_first` fue nombrado intencionalmente con un guión bajo porque no había intención de usarlo.

Para obtener más detalles, echa un vistazo a [el cambio completo](https://github.com/microsoft/TypeScript/pull/41378).

## Reglas relajadas entre propiedades opcionales e índice de firmas de cadena

Los índices de firmas de cadena son una forma de escribir objetos similares a un diccionario, donde deseas permitir el acceso con claves arbitrarias:

```ts twoslash
const movieWatchCount: { [key: string]: number } = {};

function watchMovie(title: string) {
  movieWatchCount[title] = (movieWatchCount[title] ?? 0) + 1;
}
```

Por supuesto, para cualquier título de película que aún no esté en el diccionario, `movieWatchCount[title]` será `undefined` (*TypeScript 4.1* agregó la opción [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#check-indexed-accesses---nouncheckedindexedaccess) para incluir `undefined` al leer de una firma de índice como esta).
Aunque está claro que debe haber algunas cadenas que no estén presentes en `movieWatchCount`, las versiones anteriores de *TypeScript* trataban las propiedades de objetos opcionales como no asignables a índices de firmas compatibles, debido a la presencia de `undefined`.

```ts twoslash
type WesAndersonWatchCount = {
  "Fantastic Mr. Fox"?: number;
  "The Royal Tenenbaums"?: number;
  "Moonrise Kingdom"?: number;
  "The Grand Budapest Hotel"?: number;
};

declare const wesAndersonWatchCount: WesAndersonWatchCount;
const movieWatchCount: { [key: string]: number } = wesAndersonWatchCount;
//    ~~~~~~~~~~~~~~~ error!
// El tipo 'WesAndersonWatchCount' no se puede asignar al tipo '{ [ key: string]: number; }'.
//    La propiedad '"Fantastic Mr. Fox"' es incompatible con el índice de firma.
//      El tipo 'number | undefined' no se puede asignar al tipo 'number '.
//        El tipo 'undefined' no se puede asignar al tipo 'number'. (2322)
```

*TypeScript 4.2* permite esta asignación. Sin embargo, *no* permite la asignación de propiedades no opcionales con `undefined` en sus tipos, ni permite escribir `undefined` en una clave específica:

```ts twoslash
// @errors: 2322
type BatmanWatchCount = {
  "Batman Begins": number | undefined;
  "The Dark Knight": number | undefined;
  "The Dark Knight Rises": number | undefined;
};

declare const batmanWatchCount: BatmanWatchCount;

// Sigue siendo un error en TypeScript 4.2.
const movieWatchCount: { [key: string]: number } = batmanWatchCount;

// Sigue siendo un error en TypeScript 4.2.
// // Los índices de firmas implícitamente no permiten `undefined` explícito.
movieWatchCount["Es la gran calabaza, Charlie Brown"] = undefined;
```

La nueva regla tampoco se aplica al índice de firmas numérico, ya que se supone que son densas y similares a un arreglo:

```ts twoslash
// @errors: 2322
declare let sortOfArrayish: { [key: number]: string };
declare let numberKeys: { 42?: string };

sortOfArrayish = numberKeys;
```

Puedes tener una mejor idea de este cambio [leyendo la *SE* original](https://github.com/microsoft/TypeScript/pull/41921).

## Declarar función auxiliar faltante

Gracias a [una solicitud de extracción de la comunidad](https://github.com/microsoft/TypeScript/pull/41215) de [Alexander Tarasyuk](https://github.com/a-tarasyuk), ahora tenemos una solución rápida para declarar nuevas funciones y métodos basados ​​en el sitio de llamada!

![Se llama a una función `foo` no declarada, con una solución rápida que amplía el contenido nuevo del archivo](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/01/addMissingFunction-4.2.gif)

## Ruptura por cambios

Siempre nos esforzamos por minimizar los cambios importantes en un lanzamiento.
*TypeScript 4.2* contiene algunos cambios importantes, pero creemos que deberían ser manejables en una actualización.

### Actualizaciones de `lib.d.ts`

Como con todas las versiones de *TypeScript*, las declaraciones para `lib.d.ts` (especialmente las declaraciones generadas para contextos web), han cambiado.
Hay varios cambios, aunque `Intl` y `ResizeObserver` pueden terminar siendo los más perturbadores.

### Los errores `noImplicitAny` se aplican a expresiones sueltas de `yield`

Cuando se captura el valor de una expresión `yield`, pero *TypeScript* no puede averiguar inmediatamente qué tipo deseas que reciba (es decir, la expresión `yield` no se escribe contextualmente), *TypeScript* ahora emitirá un error `any` implícito.

```ts twoslash
// @errors: 7057
function* g1() {
  const value = yield 1;
}

function* g2() {
  // No hay error.
  // El resultado de `yield 1` no se utiliza.
  yield 1;
}

function* g3() {
  // No hay error.
  // `yield 1` se escribe contextualmente por 'string'.
  const value: string = yield 1;
}

function* g4(): Generator<number, void, string> {
  // No hay error.
  // TypeScript puede averiguar el tipo de `yield 1`
  // del tipo de retorno explícito de `g4`.
  const value = yield 1;
}
```

Ve más detalles en [los cambios correspondientes](https://github.com/microsoft/TypeScript/pull/41348).

### Comprobación de funciones no solicitadas ampliadas

Como se describió anteriormente, las comprobaciones de funciones no llamadas ahora operarán consistentemente dentro de las expresiones `&&` y `||` al usar [`strictNullChecks`](/tsconfig#strictNullChecks).
Esto puede ser una fuente de nuevas interrupciones, pero normalmente es una indicación de un error lógico en el código existente.

### Los argumentos de tipo en *JavaScript* no se analizan como argumentos `Type`

Los argumentos `Type` ya no estaban permitidos en *JavaScript*, pero en *TypeScript 4.2*, el analizador los procesará de una manera más compatible con las especificaciones.
Entonces, al escribir el siguiente código en un archivo *JavaScript*:

```ts
f<T>(100);
```

*TypeScript* lo procesará como el siguiente *JavaScript*:

```js
f < T > 100;
```

Esto te puede afectar si estabas aprovechando la *API* de *TypeScript* para analizar construcciones de tipo en archivos *JavaScript*, lo que puede haber ocurrido al intentar analizar archivos `Flow`.

Consulta [la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/41928) para obtener más detalles sobre lo que está marcado.

### Límites de tamaño de `tupla` para `spreads`

Los tipos `tupla` se pueden crear utilizando cualquier tipo de sintaxis de propagación (`...`) en *TypeScript*.

```ts
// Tipos tupla con elementos de propagación
type NumStr = [number, string];
type NumStrNumStr = [...NumStr, ...NumStr];

// Expresiones de dispersión de arreglo
const numStr = [123, "hello"] as const;
const numStrNumStr = [...numStr, ...numStr] as const;
```

A veces, estos tipos de tuplas pueden crecer accidentalmente hasta ser enormes, y eso puede hacer que la verificación de tipos lleve mucho tiempo.
En lugar de dejar que el proceso de verificación de tipos se cuelgue (lo cual es especialmente malo en los escenarios del editor), *TypeScript* tiene un limitador para evitar hacer todo ese trabajo.

Puedes [ver esta solicitud de extracción](https://github.com/microsoft/TypeScript/pull/42448) para obtener más detalles.

### Las extensiones `.d.ts` no se pueden utilizar en rutas de importación

En *TypeScript 4.2*, ahora es un error que tus rutas de importación contengan `.d.ts` en la extensión.

```ts
// se debe cambiar algo como
//   - "./foo"
//   - "./foo.js"
import { Foo } from "./foo.d.ts";
```

En cambio, tus rutas de importación deben reflejar lo que hará tu cargador en el entorno de ejecución.
En su lugar, se podría utilizar cualquiera de las siguientes importaciones.

```ts
import { Foo } from "./foo";
import { Foo } from "./foo.js";
import { Foo } from "./foo/index.js";
```

### Revertir la inferencia literal de la plantilla

Este cambio eliminó una función de *TypeScript 4.2* beta.
Si aún no has actualizado más allá de nuestra última versión estable, no te verás afectado, pero aún puedes estar interesado en el cambio.

La versión beta de *TypeScript 4.2* incluyó un cambio en la inferencia a las cadenas de plantillas.
En este cambio, los literales de cadena de plantilla recibirían tipos de cadena de plantilla o se simplificarían a varios tipos de cadena literal.
Estos tipos se *ancharon* a `string` cuando se asignen a variables mutables.

```ts
declare const yourName: string;

// 'bar' es constante.
// Tiene el tipo '`hello ${string}`'.
const bar = `hello ${yourName}`;

// 'baz' es mutable.
// Tiene tipo 'string'.
let baz = `hello ${yourName}`;
```

Esto es similar a cómo funciona la inferencia de cadena literal.

```ts
// 'bar' tiene el tipo '"hello"'.
const bar = "hello";

// 'baz' tiene el tipo 'string'.
let baz = "hello";
```

Por esa razón, creíamos que hacer que las expresiones de cadena de plantilla tuvieran tipos de cadena de plantilla sería "consistente";
sin embargo, por lo que hemos visto y oído, eso no siempre es deseable.    09000001030692189

En respuesta, hemos revertido esta característica (y un posible cambio radical).
Si deseas que una expresión de cadena de plantilla tenga un tipo literal, siempre puedes agregar `as const` al final de la misma.

```ts
declare const yourName: string;

// 'bar' has type '`hello ${string}`'.
const bar = `hello ${yourName}` as const;
//                              ^^^^^^^^

// 'baz' tiene el tipo 'string'.
const baz = `hello ${yourName}`;
```

### La devolución de llamada `lift` de *TypeScript* en `visitNode` usa un tipo diferente

*TypeScript* tiene una función `visitNode` que toma una función `lift`.
`lift` ahora espera un `readonly Node[]` en lugar de un `NodeArray<Node>`.
Este técnicamente es un cambio radical de la *API* del que puedes leer más[aquí](https://github.com/microsoft/TypeScript/pull/42000).
