---
title: Descripción general
layout: docs
permalink: /docs/handbook/release-notes/overview.html
oneline: "Todas las notas de la versión de TypeScript"
---

Esta página de descripción general contiene una versión abreviada de todas las notas de la versión de *TypeScript*. Debido a que esta página es tan grande. el código de los ejemplos tiene sus elementos interactivos deshabilitados.

## TypeScript 4.2

### Conservación de alias de tipo más inteligente

*TypeScript* tiene una forma de declarar nuevos nombres para tipos llamados alias de tipo.
Si estás escribiendo un conjunto de funciones que trabajan todas en `string | number | boolean`, puedes escribir un alias de tipo para evitar que se repita una y otra vez.

```ts
type BasicPrimitive = number | string | boolean;
```

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

En *TypeScript 4.2*, los elementos `rest` se expandieron específicamente en cómo se pueden usar.
En versiones anteriores, *TypeScript* solo permitía elementos `...rest` en la última posición de un tipo `tupla`.

Sin embargo, ahora los elementos `rest` pueden ocurrir en cualquier lugar dentro de una `tupla`. con solo unas pocas restricciones.

```ts
let foo: [...string[], number];

foo = [123];
foo = ["hello", 123];
foo = ["hello!", "hello!", "hello!", 123];

let bar: [boolean, ...string[], boolean];

bar = [true, false];
bar = [true, "some text", false];
bar = [true, "some", "separated", "text", false];
```

Aunque *JavaScript* no tiene ninguna sintaxis para modelar los parámetros `rest` principales, aún pudimos declarar `doStuff` como una función que toma argumentos principales al declarar el parámetro `rest ... args`  con *un tipo `tupla` que usa un elemento `rest`*.
¡Esto puede ayudar a modelar muchos *JavaScript* existentes!

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/41544).

### Controles más estrictos para el operador `in`

En *JavaScript*, es un error del entorno de ejecución utilizar un tipo que no sea un objeto en el lado derecho del operador `in`.
*TypeScript 4.2* garantiza que esto se pueda detectar en tiempo de diseño.

```ts
// @errors: 2361
"foo" in 42;
```

Esta verificación es bastante conservadora en su mayor parte, por lo que si has recibido un error al respecto, es probable que se trate de un problema en el código.

¡Muchas gracias a nuestro colaborador externo [Jonas Hübotter](https://github.com/jonhue) por [su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/41928)!

### `--noPropertyAccessFromIndexSignature`

Cuando *TypeScript* introdujo por primera vez los índices de firmas, solo se podían obtener propiedades declaradas por ellas con una sintaxis de acceso a elementos "entre corchetes" como `persona["nombre"]`.

```ts
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

```ts
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

En algunos casos, los usuarios preferirían optar explícitamente por el índice de firma: preferirían recibir un mensaje de error cuando el acceso a una propiedad con puntos no corresponde a una declaración de propiedad específica.

Es por eso que *TypeScript* introduce una nueva marca llamada [`noPropertyAccessFromIndexSignature`](/tsconfig#noPropertyAccessFromIndexSignature).
En este modo, se habilitará el comportamiento anterior de *TypeScript* que emite un error.
Esta nueva configuración no pertenece a la familia de indicadores [`strict`](/tsconfig#strict), ya que creemos que los usuarios la encontrarán más útil en cierto código base que en otros.

Puedes comprender esta característica con más detalle leyendo la [solicitud de extracción](https://github.com/microsoft/TypeScript/pull/40171/) correspondiente.
¡También nos gustaría extender un gran agradecimiento a [Wenlu Wang](https://github.com/Kingwl) que nos envió esta solicitud de extracción!

### Firmas de `Construct abstract`

*TypeScript* nos permite marcar una clase como `abstract`.
Esto le dice a *TypeScript* que la clase solo se debe extender y que ciertos miembros deben ser completados por cualquier subclase para crear una instancia.

*TypeScript 4.2* te permite especificar un modificador `abstract` en las firmas de los constructores.

```ts {5}
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

```ts
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

### Comprender la estructura de tu proyecto con `--explainFiles`

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
tsc --explainFiles > expanation.txt

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

### Comprobación de funciones no llamadas mejoradas en expresiones lógicas

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

### Las variables desestructuradas se pueden marcar explícitamente como no utilizadas

Gracias a otra solicitud de extracción de [Alex Tarasyuk](https://github.com/a-tarasyuk), ahora puede marcar las variables desestructuradas como no utilizadas colocándolas como prefijo con un guión bajo (el carácter `_`).

```ts
let [_first, second] = getValues();
```

Anteriormente, si `_first` nunca se usaba más adelante, *TypeScript* emitía un error en [`noUnusedLocals`](/tsconfig#noUnusedLocals).
Ahora, *TypeScript* reconocerá que `_first` fue nombrado intencionalmente con un guión bajo porque no había intención de usarlo.

Para obtener más detalles, echa un vistazo a [el cambio completo](https://github.com/microsoft/TypeScript/pull/41378).

### Reglas relajadas entre propiedades opcionales e índice de firmas de cadena

Los índices de firmas de cadena son una forma de escribir objetos similares a un diccionario, donde deseas permitir el acceso con claves arbitrarias:

```ts
const movieWatchCount: { [key: string]: number } = {};

function watchMovie(title: string) {
  movieWatchCount[title] = (movieWatchCount[title] ?? 0) + 1;
}
```

Por supuesto, para cualquier título de película que aún no esté en el diccionario, `movieWatchCount[title]` será `undefined` (*TypeScript 4.1* agregó la opción [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#check-indexed-accesses---nouncheckedindexedaccess) para incluir `undefined` al leer de una firma de índice como esta).
Aunque está claro que debe haber algunas cadenas que no estén presentes en `movieWatchCount`, las versiones anteriores de *TypeScript* trataban las propiedades de objetos opcionales como no asignables a índices de firmas compatibles, debido a la presencia de `undefined`.

```ts
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

```ts
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

```ts
// @errors: 2322
declare let sortOfArrayish: { [key: number]: string };
declare let numberKeys: { 42?: string };

sortOfArrayish = numberKeys;
```

Puedes tener una mejor idea de este cambio [leyendo la *SE* original](https://github.com/microsoft/TypeScript/pull/41921).

### Declarar función auxiliar faltante

Gracias a [una solicitud de extracción de la comunidad](https://github.com/microsoft/TypeScript/pull/41215) de [Alexander Tarasyuk](https://github.com/a-tarasyuk), ahora tenemos una solución rápida para declarar nuevas funciones y métodos basados ​​en el sitio de llamada!

![Se llama a una función `foo` no declarada, con una solución rápida que amplía el contenido nuevo del archivo](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/01/addMissingFunction-4.2.gif)

### Ruptura por cambios

Siempre nos esforzamos por minimizar los cambios importantes en un lanzamiento.
*TypeScript 4.2* contiene algunos cambios importantes, pero creemos que deberían ser manejables en una actualización.

#### Actualizaciones de `lib.d.ts`

Como con todas las versiones de *TypeScript*, las declaraciones para `lib.d.ts` (especialmente las declaraciones generadas para contextos web), han cambiado.
Hay varios cambios, aunque `Intl` y `ResizeObserver` pueden terminar siendo los más perturbadores.

#### Los errores `noImplicitAny` se aplican a expresiones sueltas de `yield`

Cuando se captura el valor de una expresión `yield`, pero *TypeScript* no puede averiguar inmediatamente qué tipo deseas que reciba (es decir, la expresión `yield` no se escribe contextualmente), *TypeScript* ahora emitirá un error `any` implícito.

```ts
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
  // del tipo de retorno explícito de `g3`.
  const value = yield 1;
}
```

Ve más detalles en [los cambios correspondientes](https://github.com/microsoft/TypeScript/pull/41348).

#### Comprobación de funciones no solicitadas ampliadas

Como se describió anteriormente, las comprobaciones de funciones no llamadas ahora operarán consistentemente dentro de las expresiones `&&` y `||` al usar [`strictNullChecks`](/tsconfig#strictNullChecks).
Esto puede ser una fuente de nuevas interrupciones, pero normalmente es una indicación de un error lógico en el código existente.

#### Los argumentos de tipo en *JavaScript* no se analizan como argumentos `Type`

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

#### Las extensiones `.d.ts` no se pueden utilizar en rutas de importación

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

## TypeScript 4.1

### Tipos de plantillas literales

Los tipos de cadenas literales en *TypeScript* nos permiten modelar funciones y *API* que esperan un conjunto de cadenas específicas.

```ts
// @errors: 2345
function setVerticalAlignment(color: "top" | "middle" | "bottom") {
  // ...
}

setVerticalAlignment("middel");
```

Esto es bastante bueno porque los tipos de cadena literal básicamente pueden revisar la ortografía de nuestros valores de cadena.

También nos gusta que las cadenas literales se puedan usar como nombres de propiedad en tipos mapeados.
En este sentido, también se pueden utilizar como bloques de construcción:

```ts
type Options = {
  [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean;
};
// igual que
//   type Options = {
//       noImplicitAny?: boolean,
//       StrictNullChecks ?: boolean,
//       strictFunctionTypes?: boolean
//   };
```

Pero hay otro lugar donde esos tipos de cadenas literales se podrían usar como bloques de construcción: construyendo otros tipos de cadenas literales.

Es por eso que *TypeScript 4.1* trae el tipo de cadena literal de plantilla.
Tiene la misma sintaxis que [plantillas de cadena literales en *JavaScript*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals), pero se usa en posiciones de tipo.
Cuando lo usas con tipos de literales concretos, produce un nuevo tipo de cadena literal al concatenar el contenido.

```ts
type World = "world";

type Greeting = `hello ${World}`;
//   ^?
```

¿Qué pasa cuando tienes uniones en posiciones de sustitución?
Produce el conjunto de todas las posibles cadena literales que podrían representar cada miembro de la unión.

```ts
type Color = "red" | "blue";
type Quantity = "one" | "two";

type SeussFish = `${Quantity | Color} fish`;
//   ^?
```

Esto se puede usar más allá de los lindos ejemplos en las notas de la versión.
Por ejemplo, varias bibliotecas para componentes de la IU tienen una forma de especificar la alineación vertical y horizontal en sus *API*s, a menudo con ambas a la vez usando una sola cadena como `"bottom-right"`.
Entre alinearse verticalmente con `"top"`, `"middle"` y `"bottom"`, y alinearse horizontalmente con `"left"`, `"center"` y `"right"`, hay 9 posibles cadenas en las que cada una de las primeras está conectada con cada una de las últimas mediante un guión.

```ts
// @errors: 2345
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

// Acepta
//   | "top-left"    | "top-center"    | "top-right"
//   | "middle-left" | "middle-center" | "middle-right"
//   | "bottom-left" | "bottom-center" | "bottom-right"

declare function setAlignment(value: `${VerticalAlignment}-${HorizontalAlignment}`): void;

setAlignment("top-left");   // ¡funciona!
setAlignment("top-middel"); // ¡error!
setAlignment("top-pot");    // ¡error! pero buenas donas si alguna vez vas a Seattle
```

Mientras hay **lotes** de ejemplos de este tipo de *API* en la naturaleza, esto sigue siendo un ejemplo de juguete, ya que podríamos escribirlos manualmente.
De hecho, para 9 cadenas, esto probablemente esté bien; pero cuando necesites una tonelada de cadenas, deberías considerar generarlas automáticamente antes de tiempo para ahorrar trabajo en cada verificación de tipo (o simplemente usa `string`, que será mucho más simple de comprender).

Parte del valor real proviene de la creación dinámica de nuevas cadenas literales.
Por ejemplo, imagina una *API* `makeWatchedObject` que toma un objeto y produce un objeto casi idéntico, pero con un nuevo método `on` para detectar cambios en las propiedades.

```ts
let person = makeWatchedObject({
  firstName: "Homer",
  age: 42, // Da o toma
  location: "Springfield",
});

person.on("firstNameChanged", () => {
  console.log(`firstName was changed!`);
});
```

Observa que `on` escucha el evento `"firstNameChanged"`, no solo `"firstName"`.
¿Cómo escribiríamos esto?

```ts twoslash
type PropEventSource<T> = {
    on(eventName: `${string & keyof T}Changed`, callback: () => void): void;
};

/// Crea un "objeto observado" con un método 'on'
/// para que puedas estar atento a los cambios en las propiedades.
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
```

¡Con esto, podemos construir algo que se equivoque cuando le damos la propiedad incorrecta!

```ts
// @errors: 2345
type PropEventSource<T> = {
    on(eventName: `${string & keyof T}Changed`, callback: () => void): void;
};
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
let person = makeWatchedObject({
  firstName: "Homer",
  age: 42, // Da o toma
  location: "Springfield",
});

// ---cut---
// ¡error!
person.on("firstName", () => {});

// ¡error!
person.on("frstNameChanged", () => {});
```

También podemos hacer algo especial en los tipos de plantillas literales: podemos *inferir* desde posiciones de sustitución.
Podemos hacer que nuestro último ejemplo sea genérico para inferir de partes de la cadena `eventName` para averiguar la propiedad asociada.

```ts
type PropEventSource<T> = {
    on<K extends string & keyof T>
        (eventName: `${K}Changed`, callback: (newValue: T[K]) => void ): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;

let person = makeWatchedObject({
    firstName: "Homer",
    age: 42,
    location: "Springfield",
});

// ¡funciona! 'newName' tiene el tipo 'string'
person.on("firstNameChanged", newName => {
    // 'newName' tiene el tipo de 'firstName'
    console.log(`new name is ${newName.toUpperCase()}`);
});

// ¡funciona! 'newAge' tiene el tipo 'number'
person.on("ageChanged", newAge => {
    if (newAge < 0) {
        console.log("warning! negative age");
    }
})
```

Aquí convertimos `on` en un método genérico.
Cuando un usuario llama con la cadena `"firstNameChanged'`, *TypeScript* intentará inferir el tipo correcto para `K`.
Para hacer eso, comparará `K` con el contenido antes de `"Changed"` e inferirá la cadena `"firstName"`.
Una vez que *TypeScript* se da cuenta de eso, el método `on` puede obtener el tipo de `firstName` en el objeto original, que es `string` en este caso.
De manera similar, cuando llamamos con `"ageChanged"`, encuentra el tipo de la propiedad `age` que es `number`).

La inferencia se puede combinar de diferentes formas, a menudo para deconstruir cadenas y reconstruirlas de diferentes formas.
De hecho, para ayudar con la modificación de estos tipos de cadena literal, hemos agregado algunos nuevos alias de tipos de utilidad para modificar el uso de mayúsculas y minúsculas (es decir, convertir a caracteres en minúsculas y mayúsculas).

```ts
type EnthusiasticGreeting<T extends string> = `${Uppercase<T>}`

type HELLO = EnthusiasticGreeting<"hello">;
//   ^?
```

Los nuevos alias de tipo son `Uppercase`, `Lowercase`, `Capitalize` y `Uncapitalize`.
Los dos primeros transforman cada carácter de una cadena y los dos últimos transforman solo el primer carácter de una cadena.

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/40336) y [la solicitud de extracción en curso para cambiar a los auxiliares de alias de tipo](https://github.com/microsoft/TypeScript/pull/40580).

## Reasignación de claves en tipos mapeados

Solo como una actualización, un tipo mapeado puede crear nuevos tipos de objetos basados ​​en claves arbitrarias

```ts
type Options = {
  [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean;
};
// igual que
//   type Options = {
//       noImplicitAny?: boolean,
//       StrictNullChecks ?: boolean,
//       strictFunctionTypes?: boolean
//   };
```

o nuevos tipos de objetos basados ​​en otros tipos de objetos.

```ts
/// 'Partial<T>' es lo mismo que 'T', pero con cada propiedad marcada como opcional.
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

Hasta ahora, los tipos mapeados solo podían producir nuevos tipos de objetos con las claves que les proporcionaste; sin embargo, muchas veces deseas poder crear nuevas claves, o filtrar claves, basándose en las entradas.

Es por eso que *TypeScript 4.1* te permite reasignar claves en tipos mapeados con una nueva cláusula `as`.

```ts
type MappedTypeWithNewKeys<T> = {
    [K in keyof T as NewKeyType]: T[K]
    //            ^^^^^^^^^^^^^
    //            ¡Esta es la nueva sintaxis!
}
```

Con esta nueva cláusula `as`, puedes aprovechar características como tipos de plantillas literales para crear fácilmente nombres de propiedades basados ​​en los antiguos.

```ts
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

interface Person {
    name: string;
    age: number;
    location: string;
}

type LazyPerson = Getters<Person>;
//   ^?
```

e incluso puedes filtrar las claves produciendo `never`.
Eso significa que no tienes que usar un tipo auxiliar `Omit` adicional en algunos casos.

```ts
// Elimina la propiedad 'kind'
type RemoveKindField<T> = {
    [K in keyof T as Exclude<K, "kind">]: T[K]
};

interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
//   ^?
```

Para obtener más información, consulta [la solicitud de extracción original en GitHub](https://github.com/microsoft/TypeScript/pull/40336).

## Tipos condicionales recursivos

En *JavaScript*, es bastante común ver funciones que pueden aplanar y construir tipos de contenedores en niveles arbitrarios.
Por ejemplo, considera el método `.then()` en instancias de `Promise`.
`.then(...)` desenvuelve cada promesa hasta que encuentra un valor que no es "similar a una promesa", y pasa ese valor a una devolución de llamada.
También hay un método `flat` relativamente nuevo en `Array` que puede penetrar en la profundidad por aplanar .

Expresar esto en el sistema de tipos de *TypeScript* fue, a todos los efectos prácticos, imposible.
Si bien hubo trucos para lograr esto, los tipos terminaron pareciendo muy poco razonables.

Es por eso que *TypeScript 4.1* facilita algunas restricciones sobre los tipos condicionales: para que puedan modelar estos patrones.
En *TypeScript 4.1*, los tipos condicionales ahora pueden hacer referencia a sí mismos inmediatamente dentro de sus ramas, lo que facilita la escritura de alias de tipos recursivos.

Por ejemplo, si quisiéramos escribir un tipo para obtener los tipos de elementos de los arreglos anidados, podríamos escribir el siguiente tipo `deepFlatten`.

```ts
type ElementType<T> = T extends ReadonlyArray<infer U> ? ElementType<U> : T;

function deepFlatten<T extends readonly unknown[]>(x: T): ElementType<T>[] {
  throw "not implemented";
}

// Todos estos devuelven el tipo 'number[]':
deepFlatten([1, 2, 3]);
deepFlatten([[1], [2, 3]]);
deepFlatten([[1], [[2]], [[[3]]]]);
```

De manera similar, en *TypeScript 4.1* podemos escribir un tipo `Awaited` para desenvolver profundamente las `Promise`s.

```ts
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/// Como `promise.then(...)`, pero más precisos en tipos.
declare function customThen<T, U>(
  p: Promise<T>,
  onFulfilled: (value: Awaited<T>) => U
): Promise<Awaited<U>>;
```

Ten en cuenta que, si bien estos tipos recursivos son poderosos, se deben usar de manera responsable y con moderación.

En primer lugar, estos tipos pueden hacer mucho trabajo, lo cual significa que pueden aumentar el tiempo de verificación de tipos.
Intentar modelar números en la conjetura de `Collatz` o la secuencia de `Fibonacci` puede ser divertido, pero no envíes eso en archivos `.d.ts` a `npm`.

Además de ser computacionalmente intensivos, estos tipos pueden alcanzar un límite de profundidad de recursión interna en entradas suficientemente complejas.
Cuando se alcanza ese límite de recursividad, se produce un error en tiempo de compilación.
En general, es mejor no utilizar estos tipos en absoluto que escribir algo que falle en ejemplos más realistas.

Ve más [en la implementación](https://github.com/microsoft/TypeScript/pull/40002).

## Accesos indexados comprobados (`--noUncheckedIndexedAccess`)

*TypeScript* tiene una característica llamada *índice de firmas*.
Estas firmas son una forma de indicar al sistema de tipos que los usuarios pueden acceder a propiedades con nombres arbitrarios.

```ts
interface Options {
  path: string;
  permissions: number;

  // Las propiedades adicionales son capturadas por este índice de firma.
  [nombrePropiedad: string]: string | number;
}

function checkOptions(opts: Options) {
  opts.path; // string
  opts.permissions; // number

  // ¡Todos estos también están permitidos!
  // Tienen el tipo 'string | number'.
  opts.yadda.toString();
  opts["foo bar baz"].toString();
  opts[Math.random()].toString();
}
```

En el ejemplo anterior, `Options` tiene un índice de firma que dice que cualquier propiedad a la que se acceda que no esté listada debería tener el tipo `string | number`.
Esto suele ser conveniente para el código optimista que asume que sabes lo que estás haciendo, pero la verdad es que la mayoría de los valores en *JavaScript* no son compatibles con todos los nombres de propiedades potenciales.
La mayoría de los tipos, por ejemplo, no tendrán un valor para una clave de propiedad creada por `Math.random()` como en el ejemplo anterior.
Para muchos usuarios, este comportamiento era indeseable y se sentía como si no estuviera aprovechando la comprobación estricta completa de [`strictNullChecks`](/tsconfig#strictNullChecks).

Es por eso que *TypeScript 4.1* viene con una nueva bandera llamada [`noUncheckedIndexedAccess`](/tsconfig#noUncheckedIndexedAccess).
Bajo este nuevo modo, cada acceso a propiedad (como `foo.bar`) o acceso indexado (como `foo["bar"]`) se considera potencialmente indefinido.
Eso significa que en nuestro último ejemplo, `opts.yadda` tendrá el tipo `string | number | undefined` en lugar de solo `string | number`.
Si necesitas acceder a esa propiedad, primero deberás verificar su existencia o usar un operador de aserción no null (el carácter `!` posfijo).

Esta bandera puede ser útil para detectar errores fuera de los límites, pero puede ser ruidosa para una gran cantidad de código, por lo que no se habilita automáticamente con la bandera [`strict`](/tsconfig#strict); sin embargo, si esta característica es interesante para ti, no dudes en probarla y determinar si tiene sentido para el código base de tu equipo.

Puedes obtener más información [en la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/39560).

## `paths` sin `baseUrl`

El uso del mapeo de rutas es bastante común ⏤ a menudo es para tener importaciones más agradables, a menudo es para simular el comportamiento de enlace de "monorepo".

Desafortunadamente, especificar [`paths`](/tsconfig#paths) para habilitar el mapeo de rutas requiere también especificar una opción llamada [`baseUrl`](/tsconfig#baseUrl), que permite que la especificación de rutas desnudas también sean alcanzadas en relación con [`baseUrl`](/tsconfig#baseUrl).
Esto también provocó que las autoimportaciones utilizaran rutas deficientes.

En *TypeScript 4.1*, la opción [`paths`](/tsconfig#paths) se puede usar sin [`baseUrl`](/tsconfig#baseUrl).
Esto ayuda a evitar algunos de estos problemas.

## `checkJs` Implica `allowJs`

Anteriormente, si estabas iniciando un proyecto marcado por *JavaScript*, tenías que configurar tanto [`allowJs`](/tsconfig#allowJs) como [`checkJs`](/tsconfig#checkJs).
Esta fue una fricción un poco molesta en la experiencia, por lo que [`checkJs`](/tsconfig#checkJs) ahora de manera predeterminada implica [`allowJs`](/tsconfig#allowJs).

[Ve más detalles en la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/40275).

## Fábricas *React 17 JSX*

*TypeScript 4.1* admite las próximas funciones de fábrica `jsx` y `jsxs` de *React 17* a través de dos nuevas opciones para la opción del compilador [`jsx`](/tsconfig#jsx):

- `react-jsx`
- `react-jsxdev`

Estas opciones están destinadas a compilaciones de producción y desarrollo, respectivamente.
A menudo, las opciones de uno se pueden extender desde el otro.

Para obtener más información, [consulta la *SE* correspondiente](https://github.com/microsoft/TypeScript/pull/39199).

## TypeScript 4.0

### Tipos de `tupla variadic`

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
function concat<A, B, C, D, E, F>(arr1: [A, B, C, D, E, F], arr2: []): [A, B, C, D, E, F];)
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

```ts
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

```ts
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

```ts
type Arr = readonly unknown[];

function partialCall<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}
```

En este caso, `partialCall` comprende qué parámetros puede y qué no puede tomar inicialmente, y devuelve funciones que aceptan y rechazan apropiadamente todo lo que sobra.

```ts
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

### Elementos etiquetados de `tupla`

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

```ts
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

```ts
// @errors: 5084
type Bar = [first: string, number];
```

Vale la pena señalar ⏤ las etiquetas no requieren que nombremos nuestras variables de manera diferente al desestructurar.
Están ahí únicamente para documentación y herramientas.

```ts
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
```ts
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
```ts
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

```ts
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

```ts
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

```ts
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
```ts
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

## TypeScript 3.9

## Mejoras en `Inference` y `Promise.all`

Las versiones recientes de *TypeScript* (alrededor de 3.7) han actualizado las declaraciones de funciones como `Promise.all` y `Promise.race`.
Desafortunadamente, eso introdujo algunas regresiones, especialmente cuando se mezclan valores con `null` o `undefined`.

```ts
interface Lion {
  roar(): void;
}

interface Seal {
  singKissFromARose(): void;
}

async function visitZoo(
  lionExhibit: Promise<Lion>,
  sealExhibit: Promise<Seal | undefined>
) {
  let [lion, seal] = await Promise.all([lionExhibit, sealExhibit]);
  lion.roar(); // uh oh
  //  ~~~~
  // El objeto posiblemente sea 'undefined'.
}
```

¡Este es un comportamiento extraño!
El hecho de que `sealExhibit` contenía un tipo de `lion` `undefined` de alguna manera envenenado para incluir `undefined`.

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/34501) de [Jack Bates](https://github.com/jablko), esto se ha solucionado con mejoras en nuestra inferencia proceso en *TypeScript 3.9*.
Lo anterior ya no son errores.
Si se ha quedado atascado en versiones anteriores de *TypeScript* debido a problemas relacionados con `Promise`s, ¡te recomendamos que pruebes 3.9!

### ¿Qué pasa con el tipo `awaited`?

Si has estado siguiendo nuestro rastreador de problemas y las notas de la reunión de diseño, es posible que tengas en cuenta algunas soluciones en torno a [un nuevo operador de tipo llamado `awaited`](https://github.com/microsoft/TypeScript/pull/35998).
El objetivo de este operador de tipo es modelar con precisión la forma en que funciona el desenvolvimiento de `Promise` en *JavaScript*.

Inicialmente anticipamos el envío `awaited` en *TypeScript 3.9*, pero como hemos ejecutado las primeras compilaciones de *TypeScript* con bases de código existente, nos hemos dado cuenta de que la función necesita más trabajo de diseño antes de que podamos implementarla para todos sin problemas.
Como resultado, hemos decidido retirar la función de nuestra rama principal hasta que nos sintamos más seguros.
Experimentaremos más con la función, pero no la enviaremos como parte de esta versión.

## Mejoras de velocidad

*TypeScript 3.9* incluye muchas mejoras de velocidad nuevas.
Nuestro equipo se ha centrado en el rendimiento después de observar una velocidad de edición/compilación extremadamente baja con paquetes como material-ui y styled-components.
Hemos profundizado aquí, con una serie de diferentes solicitudes de extracción que optimizan ciertos casos patológicos que involucran grandes uniones, intersecciones, tipos condicionales y tipos mapeados.

- https://github.com/microsoft/TypeScript/pull/36576
- https://github.com/microsoft/TypeScript/pull/36590
- https://github.com/microsoft/TypeScript/pull/36607
- https://github.com/microsoft/TypeScript/pull/36622
- https://github.com/microsoft/TypeScript/pull/36754
- https://github.com/microsoft/TypeScript/pull/36696

Cada una de estas solicitudes de extracción obtiene una reducción de aproximadamente un 5-10% en los tiempos de compilación en ciertos códigos base.
En total, creemos que hemos logrado una reducción de alrededor del 40% en el tiempo de compilación de material-ui.

También tenemos algunos cambios en la funcionalidad de cambio de nombre de archivos en escenarios del editor.
Escuchamos del equipo de *Visual Studio Code* que cuando se cambia el nombre de un archivo, solo averiguar qué declaraciones de importación se deben actualizar puede llevar entre 5 y 10 segundos.
*TypeScript 3.9* soluciona este problema al [cambiar los aspectos internos de cómo el compilador y el servicio de lenguaje almacenan en caché las búsquedas de archivos](https://github.com/microsoft/TypeScript/pull/37055).

Si bien todavía hay margen de mejora, esperamos que este trabajo se traduzca en una experiencia más ágil para todos.

## `// @ts-expect-error` Comentarios

Imagina que estamos escribiendo una biblioteca en *TypeScript* y exportamos una función llamada `doStuff` como parte de nuestra *API* pública.
Los tipos `function` declaran que se necesitan dos `string`s para que otros usuarios de *TypeScript* puedan obtener errores de verificación de tipos, pero también realiza una verificación en el entorno de ejecución (tal vez solo en compilaciones de desarrollo) para dar a los usuarios de *JavaScript* un error útil.

```ts
function doStuff(abc: string, xyz: string) {
  assert(typeof abc === "string");
  assert(typeof xyz === "string");

  // hace algunas cosas
}
```

Por lo tanto, los usuarios de *TypeScript* obtendrán un útil garabato rojo y un mensaje de error cuando hagan un mal uso de esta función, y los usuarios de *JavaScript* obtendrán un error de aserción.
Nos gustaría probar este comportamiento, así que escribiremos una prueba unitaria.

```ts
expect(() => {
  doStuff(123, 456);
}).toThrow();
```

Desafortunadamente, si nuestras pruebas están escritas en *TypeScript*, ¡*TypeScript* nos dará un error!

```ts
doStuff(123, 456);
//          ~~~
// error: El tipo 'number' no se puede asignar al tipo 'string'.
```

Es por eso que *TypeScript 3.9* trae una nueva característica: `// @ts-expect-error`.
Cuando una línea tiene el comentario prefijo `//@ts-expect-error` TypeScript evitará que se reporte ese error;
pero si no hay ningún error, *TypeScript* informará que `//@ts-expect-error` no era necesario.

Como ejemplo rápido, el siguiente código está bien

```ts
// @ts-expect-error
console.log(47 * "octopus");
```

mientras que el siguiente código

```ts
// @ts-expect-error
console.log(1 + 1);
```

da como resultado el error

```
Directiva '@ts-expect-error' no utilizada.
```

Nos gustaría extender un gran agradecimiento a [Josh Goldberg](https://github.com/JoshuaKGoldberg), el colaborador que implementó esta característica.
Para obtener más información, puedes echar un vistazo a [la solicitud de extracción `ts-expect-error`](https://github.com/microsoft/TypeScript/pull/36014).

### ¿`ts-ignore` o `ts-expect-error`?

De alguna manera `//@ts-expect-error` puede actuar como una supresión de comentario, similar a `// `//@ts-ignore`.
La diferencia es que `//@ts-ignore` no hará nada si la siguiente línea no tiene errores.

Puedes tener la tentación de cambiar los comentarios `//@ts-ignore` sobre `//@ ts-expect-error`, y es posible que te preguntes cuál es el apropiado para tu código futuro.
Si bien depende completamente de ti y tu equipo, tenemos algunas ideas para elegir en ciertas situaciones.

Elige `ts-expect-error` si:

- estás escribiendo un código de prueba donde realmente deseas que el sistema de tipos produzca un error en una operación
- esperas que una solución llegue con bastante rapidez y solo necesitas una solución rápida
- estás en un proyecto de tamaño razonable con un equipo proactivo que desea eliminar la supresión de comentarios tan pronto como el código afectado vuelva a ser válido

Elige `ts-ignore` si:

- tienes un proyecto más grande y han aparecido nuevos errores en el código sin un propietario claro
- estás en medio de una actualización entre dos versiones diferentes de *TypeScript* y una línea de errores de código en una versión pero no en otra.
- honestamente, no tienes tiempo para decidir cuál de estas opciones es mejor.

## Comprobación de funciones no llamadas en expresiones condicionales

En *TypeScript 3.7* introdujimos la *comprobación de funciones no llamadas* para informar un error cuando te olvidaste de llamar a una función.

```ts
function hasImportantPermissions(): boolean {
  // ...
}

// Oops!
if (hasImportantPermissions) {
  //  ~~~~~~~~~~~~~~~~~~~~~~~
  // Esta condición siempre devolverá true ya que la función siempre está definida.
  // ¿Querías llamarla en su lugar?
  deleteAllTheImportantFiles();
}
```

Sin embargo, este error solo se aplica a las condiciones en las declaraciones `if`.
Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36402) de [Alexander Tarasyuk](https://github.com/a-tarasyuk), esta característica ahora también es compatible con la sintaxis de condicionales ternarios (es decir, `cond ? trueExpr : falseExpr`).

```ts
declare function listFilesOfDirectory(dirPath: string): string[];
declare function isDirectory(): boolean;

function getAllFiles(startFileName: string) {
  const result: string[] = [];
  traverse(startFileName);
  return result;

  function traverse(currentPath: string) {
    return isDirectory
      ? //     ~~~~~~~~~~~
        // Esta condición siempre devolverá true
        // debido a que la función siempre está definida.
        // ¿Querías llamarla en su lugar?
        listFilesOfDirectory(currentPath).forEach(traverse)
      : result.push(currentPath);
  }
}
```

https://github.com/microsoft/TypeScript/issues/36048

## Mejoras del editor

El compilador de *TypeScript* no solo potencia la experiencia de edición de *TypeScript* en la mayoría de los principales editores, sino que también potencia la experiencia de *JavaScript* en la familia de editores de *Visual Studio* y más.
El uso de la nueva funcionalidad de *TypeScript*/*JavaScript* en tu editor será diferente según tu editor, pero

- *Visual Studio Code* admite [seleccionar diferentes versiones de *TypeScript*](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Alternativamente, existe la [Extensión nocturna de *JavaScript*/*TypeScript*](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) para mantenerte a la vanguardia (que generalmente es muy estable).
- *Visual Studio 2017/2019* tiene [los instaladores de *SDK* anteriores] y [instalación de *MSBuild*](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild).
- *Sublime Text 3* admite [seleccionar diferentes versiones de *TypeScript*](https://github.com/microsoft/TypeScript-Sublime-Plugin#note-using-different-versions-of-typescript)

### Importaciones automáticas de *CommonJS* en *JavaScript*

Una gran mejora nueva es la importación automática de archivos *JavaScript* mediante módulos *CommonJS*.

En versiones anteriores, *TypeScript* siempre asumió que, independientemente de tu archivo, deseabas una importación de estilo *ECMAScript* como

```js
import * as fs from "fs";
```

Sin embargo, no todo el mundo está apuntando a módulos de estilo *ECMAScript* al escribir archivos *JavaScript*.
Muchos usuarios todavía usan el estilo de importaciones `require(...)` de *CommonJS* tal como

```js
const fs = require("fs");
```

*TypeScript* ahora detecta automáticamente los tipos de importaciones que estás utilizando para mantener el estilo de tu archivo limpio y consistente.

<video src="https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/ERkaliGU0AA5anJ1.mp4"></video>

Para obtener más detalles sobre el cambio, consulta [la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/37027).

### Las acciones de código conservan las líneas nuevas

Las refactorizaciones y las correcciones rápidas de *TypeScript* a menudo no hicieron un gran trabajo a la hora de preservar las nuevas líneas.
Como ejemplo realmente básico, toma el siguiente código.

```ts
const maxValue = 100;

/*start*/
for (let i = 0; i <= maxValue; i++) {
  // Primero obtiene el valor al cuadrado.
  let square = i ** 2;

  // Ahora imprime el valor al cuadrado.
  console.log(square);
}
/*end*/
```

Si resaltamos el rango desde `/* start */` hasta `/* end */` en nuestro editor para extraer una nueva función, terminaríamos con un código como el siguiente.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
  for (let i = 0; i <= maxValue; i++) {
    // Primero obtiene el valor al cuadrado.
    let square = i ** 2;
    // Ahora imprime el valor al cuadrado.
    console.log(square);
  }
}
```

![Extraer el bucle for a una función en versiones anteriores de TypeScript. No se conserva una nueva línea](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithoutNewlines-3.9.gif.gif).

Eso no es ideal ⏤ teníamos una línea en blanco entre cada declaración en nuestro bucle `for`, ¡pero la refactorización se deshizo de ella!
*TypeScript 3.9* hace un poco más de trabajo para preservar lo que escribimos.

```ts
const maxValue = 100;

printSquares();

function printSquares() {
  for (let i = 0; i <= maxValue; i++) {
    // Primero obtiene el valor al cuadrado.
    let square = i ** 2;

    // Ahora imprime el valor al cuadrado.
    console.log(square);
  }
}
```

![Extraer el bucle for a una función en TypeScript 3.9. Se conserva una nueva línea.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/03/printSquaresWithNewlines-3.9.gif.gif)

Puedes ver más sobre la implementación [en esta solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36688)

### Soluciones rápidas para expresiones de retorno faltantes

Hay ocasiones en las que podríamos olvidarnos de devolver el valor de la última declaración en una función, especialmente cuando agregamos llaves a las funciones de flecha.

```ts
// antes
let f1 = () => 42;

// Oops - ¡no es el mismo!
let f1 = () => 42;
  42;
};
```

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/26434) del miembro de la comunidad [Wenlu Wang](https://github.com/Kingwl), *TypeScript* puede proporcionar una solución rápida para agregar declaraciones `return` faltantes, eliminar llaves o agregar paréntesis a los cuerpos de las funciones de flecha que, sospechosamente, se parecen a objetos literales.

![TypeScript corrige un error en el que no se devuelve ninguna expresión agregando una declaración `return` o quitando llaves](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2020/04/missingReturnValue-3-9.gif)

### Archivos de "Solución de estilo" `tsconfig.json`

Los editores deben averiguar a qué archivo de configuración pertenece un archivo para que puedan aplicar las opciones adecuadas y averiguar qué otros archivos están incluidos en el "proyecto" actual.
De forma predeterminada, los editores con tecnología del servidor de lenguaje *TypeScript* hacen esto recorriendo cada directorio principal para encontrar un `tsconfig.json`.

Un caso en el que esto se derrumbó ligeramente es cuando un `tsconfig.json` simplemente existía para hacer referencia a otros archivos `tsconfig.json`.

```json tsconfig
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.shared.json" },
    { "path": "./tsconfig.frontend.json" },
    { "path": "./tsconfig.backend.json" }
  ]
}
```

Este archivo que realmente no hace nada más que administrar otros archivos de proyecto a menudo se denomina "solución" en algunos entornos.
Aquí, ninguno de estos archivos `tsconfig.*.json` es recogido por el servidor, pero realmente nos gustaría que el lenguaje del servidor entendiera que el archivo `.ts` actual probablemente pertenece a uno de los proyectos mencionados en este `tsconfig.json` raíz.

*TypeScript 3.9* agrega soporte para editar escenarios para esta configuración.
Para obtener más detalles, echa un vistazo a [la solicitud de extracción que agregó esta funcionalidad](https://github.com/microsoft/TypeScript/pull/37239).

## Ruptura por cambios

### Análisis de las diferencias en el encadenamiento opcional y las aserciones no nulas

*TypeScript* implementó recientemente el operador de encadenamiento opcional, pero hemos recibido comentarios de los usuarios de que el comportamiento del encadenamiento opcional (`?.`) con el operador de aserción no nulo (`!`) es extremadamente contrario a la intuición.

Específicamente, en versiones anteriores, el código

```ts
foo?.bar!.baz;
```

se interpretó como equivalente al siguiente *JavaScript*.

```js
(foo?.bar).baz;
```

En el código anterior, los paréntesis detienen el comportamiento de "cortocircuito" del encadenamiento opcional, por lo que si `foo` es `undefined`, acceder a `baz` provocará un error en el entorno de ejecución.

El equipo de *Babel* que señaló este comportamiento, y la mayoría de los usuarios que nos proporcionaron comentarios, creen que este comportamiento es incorrecto.
¡Nosotros también!
Lo que más escuchamos fue que el operador `!` simplemente debería "desaparecer" ya que la intención era eliminar `null` y `undefined` del tipo `bar`.

En otras palabras, la mayoría de las personas consideró que el fragmento original se debería interpretar como

```js
foo?.bar.baz;
```

que solo se evalúa como `undefined` cuando `foo` es `undefined`.

Este es un cambio importante, pero creemos que la mayor parte del código se escribió con la nueva interpretación en mente.
Los usuarios que deseen volver al comportamiento anterior pueden agregar paréntesis explícitos alrededor del lado izquierdo del operador `!`.

```ts
foo?.bar!.baz;
```

### `}` y `>` ahora son caracteres de texto *JSX* no válidos

La Especificación *JSX* prohíbe el uso de los caracteres `}` y `>` en las posiciones de texto.
*TypeScript* y *Babel* han decidido hacer cumplir esta regla para ser más congruentes.
La nueva forma de insertar estos caracteres es utilizar un código de escape *HTML* (por ejemplo, `<span>2 &gt; 1</div>`) o insertar una expresión con una cadena literal (por ejemplo, `<span>2 {">"} 1</div>`).

Afortunadamente, gracias a la [solicitud de extracción](https://github.com/microsoft/TypeScript/pull/36636) que aplica esto de [Brad Zacher](https://github.com/bradzacher), obtendrá un mensaje de error en la línea de

```
Unexpected token. Did you mean `{'>'}` or `&gt;`?
Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

Por ejemplo:

```tsx
let directions = <span>Navigate to: Menu Bar > Tools > Options</div>
//                                           ~       ~
// Unexpected token. Did you mean `{'>'}` or `&gt;`?
```

Ese mensaje de error vino con una práctica solución rápida, y gracias a [Alexander Tarasyuk](https://github.com/a-tarasyuk), [puedes aplicar estos cambios de forma masiva](https://github.com/microsoft/TypeScript/pull/37436) si tienes muchos errores.

### Controles más estrictos en intersecciones y propiedades opcionales

Generalmente, un tipo de intersección como `A & B` se puede asignar a `C` si `A` o `B` se pueden asignar a `C`; sin embargo, a veces eso tiene problemas con las propiedades opcionales.
Por ejemplo, toma lo siguiente:

```ts
interface A {
  a: number; // nota que este es el 'number'
}

interface B {
  b: string;
}

interface C {
  a?: boolean; // nota que esto es 'boolean'
  b: string;
}

declare let x: A & B;
declare let y: C;

y = x;
```

En versiones anteriores de *TypeScript*, esto estaba permitido porque mientras que `A` era totalmente incompatible con `C`, `B` *era* compatible con `C`.

En *TypeScript 3.9*, siempre que cada tipo en una intersección sea un tipo de objeto concreto, el sistema de tipos considerará todas las propiedades a la vez.
Como resultado, *TypeScript* verá que la propiedad `a` de `A & B` es incompatible con la de `C`:

```
El tipo 'A & B' no se puede asignar al tipo 'C'.
  Los tipos de la propiedad 'a' son incompatibles.
    El tipo 'number' no se puede asignar al tipo 'boolean | undefined'.
```

Para obtener más información sobre este cambio, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/37195).

### Intersecciones reducidas por propiedades discriminantes

Hay algunos casos en los que puedes terminar con tipos que describen valores que simplemente no existen.
Por ejemplo

```ts
declare function smushObjects<T, U>(x: T, y: U): T & U;

interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

declare let x: Circle;
declare let y: Square;

let z = smushObjects(x, y);
console.log(z.kind);
```

Este código es un poco extraño porque realmente no hay forma de crear una intersección de un `Circle` y un `Square` ⏤ tienen dos campos de `kind` incompatibles.
En versiones anteriores de *TypeScript*, este código estaba permitido y el tipo de `kind` en sí mismo era `never` porque `"circle" & "square"` describía un conjunto de valores que nunca (`never`) podrían existir.

En *TypeScript 3.9*, el sistema de tipos es más agresivo aquí ⏤ se da cuenta de que es imposible intersecar `Circle` y `Square` debido a sus propiedades `kind`.
Entonces, en lugar de contraer el tipo de `z.kind` a `never`, colapsa el tipo de `z` en sí mismo (`Circle & Square`) a `never`.
Eso significa que el código anterior ahora tiene errores con:

```
La propiedad 'kind' no existe en el tipo 'never'.
```

La mayoría de las rupturas que observamos parecen corresponder con declaraciones de tipo ligeramente incorrectas.
Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/36696).

### Los Captadores/Definidores ya no son enumerables

En versiones anteriores de *TypeScript*, los descriptores de acceso `get` y `set` en las clases se emitían de una manera que los hacía enumerables; sin embargo, esto no cumplía con la especificación *ECMAScript* que establece que deben ser no enumerables.
Como resultado, el código *TypeScript* dirigido a *ES5* y *ES2015* podría diferir en su comportamiento.

Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32264) del usuario de *GitHub* [*pathurs*](https://github.com/pathurs), *TypeScript 3.9* ahora se ajusta mejor a *ECMAScript* a este respecto.

### Parámetros de tipo que extienden a `any` ya no actúan como `any`

En versiones anteriores de *TypeScript*, un parámetro de tipo restringido a `any` se podía tratar como `any`.

```ts
function foo<T extends any>(arg: T) {
  arg.spfjgerijghoied; // ¡No hay error!
}
```

Esto fue un descuido, por lo que *TypeScript 3.9* adopta un enfoque más conservador y emite un error en estas operaciones cuestionables.

```ts
function foo<T extends any>(arg: T) {
  arg.spfjgerijghoied;
  //  ~~~~~~~~~~~~~~~
  // La propiedad 'spfjgerijghoied' no existe en el tipo 'T'.
}
```

### `export *` se conserva siempre

En versiones anteriores de *TypeScript*, declaraciones como `export * from "foo"` se eliminarían en nuestra salida de *JavaScript* si `foo` no exportara ningún valor.
Este tipo de emisión es problemático porque está dirigido por tipos y *Babel* no lo puede emular.
*TypeScript 3.9* siempre emitirá estas declaraciones `export *`.
En la práctica, no esperamos que esto rompa gran parte del código existente.

## TypeScript 3.8

## Importación y exportación solo de tipo

Esta característica es algo en lo que la mayoría de los usuarios tal vez nunca tengan que pensar; sin embargo, si has encontrado problemas en [`isolatedModules`](/tsconfig#isolatedModules), la *API* `transpileModule` de *TypeScript* o *Babel*, esta característica podría ser relevante.

*TypeScript 3.8* agrega una nueva sintaxis para las importaciones y exportaciones solo de tipo.

```ts
import type { SomeThing } from "./some-module.js";

export type { SomeThing };
```

`import type` solo importa declaraciones que se utilizarán para anotaciones de tipo y declaraciones.
*Siempre* se borra por completo, por lo que no queda ningún vestigio en el entorno de ejecución.
De manera similar, `export type` solo proporciona una exportación que se puede usar para contextos de tipo y también se borra de la salida de *TypeScript*.

Es importante tener en cuenta que las clases tienen un valor en el entorno de ejecución y un tipo en tiempo de diseño, y el uso es sensible al contexto.
Al usar `import type` para importar una clase, no puedes hacer cosas como extender a partir de ella.

```ts
import type { Component } from "react";

interface ButtonProps {
  // ...
}

class Button extends Component<ButtonProps> {
  //               ~~~~~~~~~
  // ¡error! 'Componente' solo se refiere a un tipo, pero aquí se utiliza como valor.
  // ...
}
```

Si has utilizado `Flow` antes, la sintaxis es bastante similar.
Una diferencia es que hemos agregado algunas restricciones para evitar códigos que pueden parecer ambiguos.

```ts
// ¿'Foo'  es solo un tipo? ¿O cada declaración en la import?
// Solo damos un error porque no está claro.

import type Foo, { Bar, Baz } from "some-module";
//     ~~~~~~~~~~~~~~~~~~~~~~
// ¡error! Una importación de solo tipo puede especificar una importación predeterminada o enlaces con nombre, pero no ambos.
```

Junto con la `import type`, *TypeScript 3.8* también agrega una nueva marca de compilador para controlar lo que sucede con las importaciones que no se utilizarán en el entorno de ejecución: [`importsNotUsedAsValues`](/tsconfig#importsNotUsedAsValues).
Esta bandera toma 3 diferentes valores:

- `remove` ⏤ este es el comportamiento actual de la caída de estas importaciones. Continuará siendo el predeterminado y es un cambio inquebrantable.
- `preserve` ⏤ esto *preserva* todas las importaciones cuyos valores nunca se utilizan. Esto puede hacer que se conserven las importaciones/efectos secundarios.
- `error` ⏤ esto conserva todas las importaciones (lo mismo que la opción `preserve`), pero generará un error cuando una importación de valor solo se use como un tipo. Esto puede ser útil si deseas asegurarte de que no se importen valores accidentalmente, pero aún así, hacer que las importaciones de efectos secundarios sean explícitas.

Para obtener más información sobre la característica, puedes [echar un vistazo a la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/35200) y [cambios relevantes](https://github.com/microsoft/TypeScript/pull/36092/) en torno a la ampliación donde se pueden utilizar las importaciones de una declaración de importación de tipo.

## Campos privados en *ECMAScript*

*TypeScript 3.8* ofrece soporte para los campos privados de *ECMAScript*, parte de la [propuesta de campos de clase de la etapa 3](https://github.com/tc39/proposal-class-fields/).

```ts
class Person {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  greet() {
    console.log(`Hello, my name is ${this.#name}!`);
  }
}

let jeremy = new Person("Jeremy Bearimy");

jeremy.#name;
//     ~~~~~
// La propiedad '#name' no es accesible fuera de la clase 'Person'
// porque tiene un identificador privado.
```

A diferencia de las propiedades normales (incluso las declaradas con el modificador `private`), los campos privados tienen algunas reglas a tener en cuenta.
Algunas de ellas son:

- Los campos privados comienzan con un carácter `#`. A veces los llamamos *nombres privados*.
- Cada nombre de campo privado tiene un ámbito exclusivo para su clase contenedora.
- Los modificadores de accesibilidad de *TypeScript* como `public` o `private` no se pueden usar en campos privados.
- No se puede acceder a los campos privados o incluso detectarlos fuera de la clase que los contiene ⏤ ¡incluso por usuarios de *JS*! A veces la llamamos *privacidad dura*.

Aparte de la privacidad "dura", otro beneficio de los campos privados es la singularidad que acabamos de mencionar.
Por ejemplo, las declaraciones de propiedades regulares tienden a sobrescribirse en subclases.

```ts
class C {
  foo = 10;

  cHelper() {
    return this.foo;
  }
}

class D extends C {
  foo = 20;

  dHelper() {
    return this.foo;
  }
}

let instance = new D();
// 'this.foo' se refiere a la misma propiedad en cada instancia.
console.log(instance.cHelper()); // imprime '20'
console.log(instance.dHelper()); // imprime '20'
```

Con los campos privados, nunca tendrás que preocuparte por esto, ya que cada nombre de campo es único para la clase que lo contiene.

```ts
class C {
  #foo = 10;

  cHelper() {
    return this.#foo;
  }
}

class D extends C {
  #foo = 20;

  dHelper() {
    return this.#foo;
  }
}

let instance = new D();
// 'this.#foo' se refiere a un campo diferente dentro de cada clase.
console.log(instance.cHelper()); // imprime '10'
console.log(instance.dHelper()); // imprime '20'
```

¡Otra cosa que vale la pena señalar es que acceder a un campo privado en cualquier otro tipo resultará en un `TypeError`!

```ts
class Square {
  #sideLength: number;

  constructor(sideLength: number) {
    this.#sideLength = sideLength;
  }

  equals(other: any) {
    return this.#sideLength === other.#sideLength;
  }
}

const a = new Square(100);
const b = { sideLength: 100 };

// ¡Boom!
// TypeError: intentó obtener un campo privado en una no instancia
// Esto falla porque 'b' no es una instancia de 'Square'.
console.log(a.equals(b));
```

Finalmente, para cualquier usuario de archivo `.js` estándar, los campos privados *siempre* se deben declarar antes de ser asignados.

```js
class C {
  // Sin declaración para '#foo'
  // :(

  constructor(foo: number) {
    // SyntaxError!
    // Es necesario declarar '#foo' antes de escribir en él.
    this.#foo = foo;
  }
}
```

*JavaScript* siempre ha permitido a los usuarios acceder a propiedades no declaradas, mientras que *TypeScript* siempre ha requerido declaraciones para propiedades de clase.
Con los campos privados, las declaraciones siempre son necesarias independientemente de si estamos trabajando en archivos `.js` o `.ts`.

```js
class C {
  /** @type {number} */
  #foo;

  constructor(foo: number) {
    // ¡Esto funciona!
    this.#foo = foo;
  }
}
```

Para obtener más información sobre la implementación, puedes [consultar la solicitud de extracción original](https://github.com/Microsoft/TypeScript/pull/30829)

### ¿Qué debo usar?

Ya hemos recibido muchas preguntas sobre qué tipo de información privada debes utilizar como usuario de *TypeScript* ⏤ comúnmente, "¿deberías usar la palabra clave `private` o los campos privados hash/pound (`#`) de *ECMAScript*? "
¡Eso depende!

Cuando se trata de propiedades, los modificadores `private` de *TypeScript* se borran por completo: eso significa que en el entorno de ejecución, actúa completamente como una propiedad normal y no hay forma de saber que fue declarado con un modificador `private`. Cuando se usa la palabra clave `private`, la privacidad solo se aplica en tiempo de compilación/tiempo de diseño, y para los consumidores de *JavaScript* está completamente basada en la intención.

```ts
class C {
  private foo = 10;
}

// Este es un error en el momento de la compilación,
// pero cuando TypeScript genera archivos .js,
// funcionará bien e imprimirá '10'.
console.log(new C().foo); // imprime '10'
//                  ~~~
// ¡error! La propiedad 'foo' es privada y solo se puede acceder a ella dentro de la clase 'C'.

// TypeScript permite esto en tiempo de compilación
// como una "solución alternativa" para evitar el error.
console.log(new C()["foo"]); // imprime '10'
```

La ventaja es que este tipo de "privacidad suave" puede ayudar a tus consumidores a evitar temporalmente no tener acceso a alguna *API*, y también funciona en cualquier entorno de ejecución.

Por otro lado, los privados `#` de *ECMAScript* son completamente inaccesibles fuera de la clase.

```ts
class C {
  #foo = 10;
}

console.log(new C().#foo); // SyntaxError
//                  ~~~~
// TypeScript reporta un error *y*
// ¡esto no funcionará en el entorno de ejecución!

console.log(new C()["#foo"]); // imprime undefined
//          ~~~~~~~~~~~~~~~
// TypeScript reporta un error en 'noImplicitAny',
// y esto imprime 'undefined'.
```

Esta estricta privacidad es realmente útil para garantizar estrictamente que nadie pueda hacer uso de ninguno de sus componentes internos.
Si eres un autor de una biblioteca, eliminar o cambiar el nombre de un campo privado nunca debería causar un cambio importante.

Como mencionamos, otro beneficio es que la subclasificación puede ser más fácil con los privados `#` de *ECMAScript* porque *realmente* son privados.
Cuando se utilizan campos privados de *ECMAScript* `#`, ninguna subclase tiene que preocuparse por las colisiones en la denominación de los campos.
Cuando se trata de las declaraciones de propiedad `private` de *TypeScript*, los usuarios deben tener cuidado de no pisotear las propiedades declaradas en superclases.

Una cosa más en la que pensar es dónde deseas que se ejecute tu código.
*TypeScript* actualmente no puede admitir esta característica a menos que tenga como destino los objetivos *ECMAScript 2015* (*ES6*) o superior.
Esto se debe a que nuestra implementación descendente usa `WeakMap`s para hacer cumplir la privacidad, y los `WeakMap`s no se pueden rellenar de una manera que no cause pérdidas de memoria.
Por el contrario, las propiedades declaradas `private` de *TypeScript* funcionan con todos los objetivos ⏤ ¡incluso *ECMAScript 3*!

Una consideración final podría ser la velocidad ⏤ Las propiedades `private` no son diferentes de cualquier otra propiedad, por lo que acceder a ellas es tan rápido como cualquier otro acceso a una propiedad, sin importar el entorno de ejecución al que se dirija.
Por el contrario, debido a que los campos privados `#` se bajan de nivel usando `WeakMap`s, puede ser más lento usarlos.
Si bien algunos entornos de ejecución pueden optimizar sus implementaciones reales de campos privados `#`, e incluso tener implementaciones rápidas de `WeakMap`, ese podría no ser el caso en todos los entornos de ejecución.

## Sintaxis `export * as ns`

A menudo es común tener un único punto de entrada que exponga a todos los miembros de otro módulo como un solo miembro.

```ts
import * as utilities from "./utilities.js";
export { utilities };
```

¡Esto es tan común que *ECMAScript 2020* recientemente agregó una nueva sintaxis para admitir este patrón!

```ts
export * as utilities from "./utilities.js";
```

Esta es una buena mejora en la calidad de vida de *JavaScript*, y *TypeScript 3.8* implementa esta sintaxis.
Cuando el destino de tu módulo es anterior a `es2020`, *TypeScript* generará algo similar al primer fragmento de código.

## `await` de nivel superior

*TypeScript 3.8* proporciona soporte para una práctica característica de *ECMAScript* llamada "`await` de nivel superior".

Los usuarios de *JavaScript* a menudo introducen una función `async` para usar `await`, y luego llaman inmediatamente a la función después de definirla.

```js
async function main() {
  const response = await fetch("...");
  const greeting = await response.text();
  console.log(greeting);
}

main().catch((e) => console.error(e));
```

Esto se debe a que anteriormente en *JavaScript* (junto con la mayoría de los otros lenguajes con una característica similar), `await` solo se permitía dentro del cuerpo de una función `async`.
Sin embargo, con `await` de nivel superior, podemos usar `await` en el nivel superior de un módulo.

```ts
const response = await fetch("...");
const greeting = await response.text();
console.log(greeting);

// Se asegura de que somos un módulo
export {};
```

Ten en cuenta que hay una sutileza ⏤ `await` de nivel superior solo funciona en el nivel superior de un `module`, y los archivos solo se consideran módulos cuando *TypeScript* encuentra una declaración `import` o una `export`.
En algunos casos básicos, es posible que debas escribir `export {}` como un texto estándar para asegurarte de esto.

Es posible que `await` de nivel superior no funcione en todos los entornos en los que podrías esperar en este momento.
Actualmente, solo puedes usar el `await` de nivel superior cuando la opción del compilador [`target`](/tsconfig#target) es `es2017` o superior, y `module` es `esnext` o `system`.
El soporte dentro de varios entornos y paquetes puede ser limitado o puede requerir la habilitación del soporte experimental.

Para obtener más información sobre nuestra implementación, puedes [consultar la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/35813).

## `es2020` para `target` y `module`

*TypeScript 3.8* admite `es2020` como una opción para `module` y [`target`](/tsconfig#target).
Esto preservará las características más nuevas de *ECMAScript 2020* como el encadenamiento opcional, la fusión nula, la `export * as ns`, y la sintaxis dinámica de `import(...)`.
También significa que los `bigint`s literales ahora tienen un [`target`](/tsconfig#target) estable debajo de `esnext`.

## Modificadores de propiedades *JSDoc*

*TypeScript 3.8* admite archivos *JavaScript* activando la marca [`allowJs`](/tsconfig#allowJs), y también admite `type-check` en esos archivos *JavaScript* a través de la opción [`checkJs`](/tsconfig#checkJs) o agregando un comentario `//@ts-check` en la parte superior de tus archivos `.js`.

Debido a que los archivos *JavaScript* no tienen una sintaxis dedicada para la verificación de tipos, *TypeScript* aprovecha *JSDoc*.
*TypeScript 3.8* comprende algunas etiquetas *JSDoc* nuevas para propiedades.

Primero están los modificadores de accesibilidad: `@public`, `@private` y `@protected`.
Estas etiquetas funcionan exactamente como `public`, `private` y `protected` funcionan respectivamente en *TypeScript*.

```js
// @ts-check

class Foo {
  constructor() {
    /** @private */
    this.stuff = 100;
  }

  printStuff() {
    console.log(this.stuff);
  }
}

new Foo().stuff;
//        ~~~~~
// ¡error! La propiedad 'stuff' es privada y solo se puede acceder a ella dentro de la clase 'Foo'.
```

- `@public` siempre está implícito y se puede omitir, pero significa que se puede acceder a una propiedad desde cualquier lugar.
- `@private` significa que una propiedad solo se puede usar dentro de la clase que la contiene.
- `@protected` significa que una propiedad solo se puede usar dentro de la clase contenedora y todas las subclases derivadas, pero no en instancias diferentes de la clase contenedora.

A continuación, también agregamos el modificador `@readonly` para garantizar que una propiedad solo se escriba durante la iniciación.

```js
// @ts-check

class Foo {
  constructor() {
    /** @readonly */
    this.stuff = 100;
  }

  writeToStuff() {
    this.stuff = 200;
    //   ~~~~~
    // No se puede asignar a 'stuff' porque es una propiedad de solo lectura.
  }
}

new Foo().stuff++;
//        ~~~~~
// No se puede asignar a 'stuff' porque es una propiedad de solo lectura.
```

## Mejor visualización de directorios en *Linux* y `watchOptions`

*TypeScript 3.8* incluye una nueva estrategia para ver directorios, que es crucial para recoger de manera eficiente los cambios en `node_modules`.

Para algún contexto, en sistemas operativos como *Linux*, *TypeScript* instala observadores de directorios (a diferencia de los observadores de archivos) en `node_modules` y muchos de sus subdirectorios para detectar cambios en las dependencias.
Esto se debe a que la cantidad de observadores de archivos disponibles a menudo se ve eclipsada por la cantidad de archivos en `node_modules`, mientras que hay muchos menos directorios para rastrear.

Las versiones anteriores de *TypeScript* instalarían *inmediatamente* los observadores de directorios en los directorios, y al inicio eso estaría bien; sin embargo, durante una instalación de `npm`, se llevará a cabo una gran cantidad de actividad dentro de `node_modules` y eso puede abrumar a *TypeScript*, a menudo ralentizando las sesiones del editor.
Para evitar esto, *TypeScript 3.8* espera un poco antes de instalar los observadores de directorios para dar tiempo a que estos directorios altamente volátiles se estabilicen.

Debido a que cada proyecto podría funcionar mejor bajo diferentes estrategias, y este nuevo enfoque podría no funcionar bien para tus flujos de trabajo, *TypeScript 3.8* introduce un nuevo campo `watchOptions` en `tsconfig.json` y `jsconfig.json` que permite a los usuarios decirle al compilador/servicio del lenguaje qué estrategias de observación se deben utilizar para realizar un seguimiento de los archivos y directorios.

```json tsconfig
{
  // Algunas opciones típicas del compilador
  "compilerOptions": {
    "target": "es2020",
    "moduleResolution": "node"
    // ...
  },

  // NUEVO: Opciones para ver archivos/directorios
  "watchOptions": {
    // Usa eventos del sistema de archivos nativo para archivos y directorios
    "watchFile": "useFsEvents",
    "watchDirectory": "useFsEvents",

    // Sondeo de archivos para actualizaciones con más frecuencia
    // cuando se actualizan mucho.
    "fallbackPolling": "dynamicPriority"
  }
}
```

`watchOptions` contiene 4 opciones nuevas que se pueden configurar para manejar cómo *TypeScript* realiza un seguimiento de los cambios.

Para obtener más información sobre estos cambios, [dirígete a *GitHub* para ver la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/35615) para leer más.

## Comprobación incremental "rápida y flexible"

*TypeScript 3.8* introduce una nueva opción de compilador llamada [`AssumChangesOnlyAffectDirectDependencies`](/tsconfig#AssumChangesOnlyAffectDirectDependencies).
Cuando esta opción está habilitada, *TypeScript* evitará volver a verificar/reconstruir todos los archivos posiblemente afectados realmente, y solo volverá a verificar/reconstruir los archivos que hayan cambiado, así como los archivos que los importen directamente.

En un código base como *Visual Studio Code*, esto redujo los tiempos de reconstrucción para cambios en ciertos archivos de aproximadamente 14 segundos a aproximadamente 1 segundo.
Si bien no recomendamos necesariamente esta opción para todos los códigos base, es posible que te interese si tienes un código base extremadamente grande y estás dispuesto a diferir los errores completos del proyecto hasta más adelante (por ejemplo, una compilación dedicada a través de un `tsconfig.fullbuild.json` o en *CI*).

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/35711).

## TypeScript 3.7

## Encadenamiento opcional

[*Playground*](/play/#example/optional-chaining)

El encadenamiento opcional es la [incidencia #16](https://github.com/microsoft/TypeScript/issues/16) en nuestro rastreador de incidencias. Para el contexto, ha habido más de 23,000 incidencias en el rastreador de incidencias de *TypeScript* desde entonces.

En esencia, el encadenamiento opcional nos permite escribir código donde *TypeScript* puede detener inmediatamente la ejecución de algunas expresiones si nos encontramos con un `null` o un `undefined`.
La estrella del espectáculo en el encadenamiento opcional es el nuevo operador `? .` para *accesos a propiedad opcionales*.
Cuando escribimos código como

```ts
let x = foo?.bar.baz();
```

esta es una forma de decir que cuando se define `foo`, se calculará `foo.bar.baz()`; pero cuando `foo` es `null` o `undefined`, detenga lo que estamos haciendo y devuelva `undefined`".

Con toda claridad, ese fragmento de código es lo mismo que escribir lo siguiente.

```ts
let x = foo === null || foo === undefined ? undefined : foo.bar.baz();
```

Ten en cuenta que si `bar` es `null` o `undefined`, nuestro código seguirá mostrando un error al acceder a `baz`.
Del mismo modo, si `baz` es `null` o `undefined`, encontraremos un error en el sitio de la llamada.
`? .` solo comprueba si el valor de la *izquierda* es `null` o `undefined` ⏤ ninguna de las propiedades posteriores.

Es posible que te encuentres usando `? .` para reemplazar una gran cantidad de código que realiza comprobaciones repetitivas de nulidad usando el operador `&&`.

```ts
// Antes
if (foo && foo.bar && foo.bar.baz) {
  // ...
}

// Después
if (foo?.bar?.baz) {
  // ...
}
```

Ten en cuenta que `? .` actúa de manera diferente a las operaciones `&&` ya que `&&` actuará especialmente en valores "falsos" (por ejemplo, la cadena vacía, `0`, `NaN` y, bueno, `false`) , pero esta es una característica intencionada del constructor.
No produce un cortocircuito en datos válidos como `0` o cadenas vacías.

El encadenamiento opcional también incluye otras dos operaciones.
Primero está el *acceso de elemento opcional* que actúa de manera similar a los accesos de propiedad opcionales, pero nos permite acceder a propiedades que no son identificadores (por ejemplo, cadenas arbitrarias, números y símbolos):

```ts
/**
 * Obtiene el primer elemento del arreglo si tenemos un arreglo.
 * De lo contrario, devuelve undefined.
 */
function tryGetFirstElement<T>(arr?: T[]) {
  return arr?.[0];
  // equivalente a
  //   return (arr === null || arr === undefined) ?
  //       undefined :
  //       arr[0];
}
```

También existe la *llamada opcional*, que nos permite llamar condicionalmente expresiones si no son `null` o `undefined`.

```ts
async function makeRequest(url: string, log?: (msg: string) => void) {
  log?.(`Request started at ${new Date().toISOString()}`);
  // aproximadamente equivalente a
  //   if (log != null) {
  //       log(`Request started at ${new Date().toISOString()}`);
  //   }

  const result = (await fetch(url)).json();

  log?.(`Request finished at at ${new Date().toISOString()}`);

  return result;
}
```

El comportamiento de "cortocircuito" que tienen las cadenas opcionales es accesos limitados a propiedades, llamadas, accesos a elementos ⏤ no se expande más allá de estas expresiones.
En otras palabras,

```ts
let result = foo?.bar / someComputation();
```

no detiene la división o la llamada a `someComputation()`.
Es equivalente a

```ts
let temp = foo === null || foo === undefined ? undefined : foo.bar;

let result = temp / someComputation();
```

Eso podría resultar en la división de `undefined`, razón por la cual en [`strictNullChecks`](/tsconfig#strictNullChecks), lo siguiente es un error.

```ts
function barPercentage(foo?: { bar: number }) {
  return foo?.bar / 100;
  //     ~~~~~~~~
  // Error: Es posible que el objeto no esté definido.
}
```

Para obtener más detalles, puedes [leer sobre la propuesta](https://github.com/tc39/proposal-optional-chaining/) y [ver la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/33294).

## Fusión nula

[*Playground*](/play/#example/nullish-coalescing)

El *operador coalescente nulo* es otra próxima característica de *ECMAScript* que va de la mano con el encadenamiento opcional, y en la que nuestro equipo ha estado involucrado en promover en *TC39*.

Puedes pensar en esta característica ⏤ el operador `??` ⏤ como una forma de "retroceder" a un valor predeterminado cuando se trata de `null` o `undefined`.
Cuando escribimos código como

```ts
let x = foo ?? bar();
```

esta es una nueva forma de decir que el valor `foo` se usará cuando esté "presente ";
pero cuando sea `null` o `undefined`, calcula `bar()` en su lugar.

Nuevamente, el código anterior es equivalente al siguiente.

```ts
let x = foo !== null && foo !== undefined ? foo : bar();
```

El operador `??` puede reemplazar los usos de `||` cuando se intenta utilizar un valor predeterminado.
Por ejemplo, el siguiente fragmento de código intenta recuperar el volumen que se guardó por última vez en [`localStorage`](https://developer.mozilla.org/docs/Web/API/Window/localStorage) (si alguna vez lo fue);
sin embargo, tiene un error porque usa `||`.

```ts
function initializeAudio() {
  let volume = localStorage.volume || 0.5;

  // ...
}
```

Cuando `localStorage.volume` se establece en `0`, la página establecerá el volumen en `0.5`, lo cual no es intencionado.
`??` evita que algunos comportamientos no deseados de `0`, `NaN` y `""` sean tratados como valores falsos.

¡Debemos un gran agradecimiento a los miembros de la comunidad [Wenlu Wang](https://github.com/Kingwl) y [Titian Cernicova Dragomir](https://github.com/dragomirtitian) por implementar esta característica!
Para obtener más detalles, [consulta tu solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32883) y [el repositorio de propuestas de fusión `null`](https://github.com/tc39/proposal-nullish-coalescing/).

## Funciones de aserción

[`Playground`](/play/#example/assertion-functions)

Hay un conjunto específico de funciones que "arrojan" un error (`throw`) si sucede algo inesperado.
Se llaman funciones de "aserción".
Como ejemplo, *Node.js* tiene una función dedicada para esto llamada `assert`.

```js
assert(someValue === 42);
```

En este ejemplo, si `someValue` no es igual a `42`, entonces `assert` arrojará un `AssertionError`.

Las aserciones en *JavaScript* se utilizan a menudo para evitar que se pasen tipos incorrectos.
Por ejemplo:

```js
function multiply(x, y) {
  assert(typeof x === "number");
  assert(typeof y === "number");

  return x * y;
}
```

Desafortunadamente, en *TypeScript*, estas comprobaciones nunca pudieron codificarse correctamente.
En el caso del código tipado débilmente, esto significaba que *TypeScript* verificaba menos y, en el caso de un código ligeramente conservador, a menudo obligaba a los usuarios a utilizar aserciones de tipo.

```ts
function yell(str) {
  assert(typeof str === "string");

  return str.toUppercase();
  // Oops! Escribimos mal 'toUpperCase'.
  // ¡Sería genial si TypeScript todavía captara esto!
}
```

La alternativa era, en cambio, reescribir el código para que el lenguaje lo pudiera analizar, pero esto no es conveniente.

```ts
function yell(str) {
  if (typeof str !== "string") {
    throw new TypeError("str should have been a string.");
  }
  // ¡Error detectado!
  return str.toUppercase();
}
```

En última instancia, el objetivo de *TypeScript* es escribir las construcciones *JavaScript* existentes de la manera menos disruptiva.
Por esa razón, *TypeScript 3.7* introduce un nuevo concepto llamado "firmas de aserción" que modelan estas funciones de aserción.

El primer tipo de firma de aserción modela la forma en que trabaja la función `assert` de *Node*.
Asegura que cualquier condición que se esté verificando debe ser verdadera para el resto del alcance contenedor.

```ts
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg);
  }
}
```

`asserts condition` dice que cualquier cosa que se pase al parámetro `condition` debe ser `true` si el `assert` regresa (porque de lo contrario arrojaría un error).
Eso significa que para el resto del alcance, esa condición debe ser veraz.
Como ejemplo, el uso de esta función de aserción significa que *hacemos* captar nuestro ejemplo original de `yell`.

```ts
function yell(str) {
  assert(typeof str === "string");

  return str.toUppercase();
  //         ~~~~~~~~~~~
  // error: La propiedad 'toUppercase' no existe en el tipo 'string'.
  //        ¿Quisiste decir 'toUpperCase'?
}

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg);
  }
}
```

El otro tipo de firma de aserción no busca una condición, sino que le dice a *TypeScript* que una variable o propiedad específica tiene un tipo diferente.

```ts
function assertIsString(val: any): asserts val is string {
  if (typeof val !== "string") {
    throw new AssertionError("Not a string!");
  }
}
```

Aquí, `asserts val is string` asegura que después de cualquier llamada a `assertIsString`, cualquier variable pasada será conocida como un `string`.

```ts
function yell(str: any) {
  assertIsString(str);

  // Ahora TypeScript sabe que 'str' es una 'string'.

  return str.toUppercase();
  //         ~~~~~~~~~~~
  // error: La propiedad 'toUppercase' no existe en el tipo 'string'.
  //        ¿Quisiste decir 'toUpperCase'?
}
```

Estas firmas de aserción son muy similares a escribir firmas de predicado de tipo:

```ts
function isString(val: any): val is string {
  return typeof val === "string";
}

function yell(str: any) {
  if (isString(str)) {
    return str.toUppercase();
  }
  throw "Oops!";
}
```

Y al igual que las firmas de predicado de tipo, estas firmas de aserción son increíblemente expresivas.
Podemos expresar algunas ideas bastante sofisticadas con estas.

```ts
function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new AssertionError(
      `Se esperaba que se definieras 'val', pero se recibió ${val}`
    );
  }
}
```

Para obtener más información sobre las firmas de aserción, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/32695).

## Mejor soporte para funciones que regresan `never`

Como parte del trabajo para las firmas de aserción, *TypeScript* necesitaba codificar más sobre dónde y qué funciones se llamaban.
Esto nos dio la oportunidad de ampliar el soporte para otra clase de funciones ⏤ las funciones que devuelven `never`.

La intención de cualquier función que devuelva `never` es que regrese `never`.
Indica que se lanzó una excepción, se produjo una condición de error de detención o que el programa se cerró.
Por ejemplo, [`process.exit(...)` en `@types/node`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5299d372a220584e75a031c13b3d555607af13f8/types/node/globals.d.ts#l874) se especifica para devolver `never`.

Con el fin de garantizar que una función nunca devolviera potencialmente `undefined` o que se devolviera efectivamente de todas las rutas de código, *TypeScript* necesitaba alguna señal sintáctica: ya sea un `return` o un `throw` al final de una función.
Así que los usuarios se encontraron "devolviendo" sus funciones de falla.

```ts
function dispatch(x: string | number): SomeType {
  if (typeof x === "string") {
    return doThingWithString(x);
  } else if (typeof x === "number") {
    return doThingWithNumber(x);
  }
  return process.exit(1);
}
```

Ahora, cuando se llaman estas funciones que regresan `never`, *TypeScript* reconoce que afectan el gráfico de control de flujo y las tiene en cuenta.

```ts
function dispatch(x: string | number): SomeType {
  if (typeof x === "string") {
    return doThingWithString(x);
  } else if (typeof x === "number") {
    return doThingWithNumber(x);
  }
  process.exit(1);
}
```

Al igual que con las funciones de aserción, puedes [leer más en la misma solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32695).

## (Más) Alias ​​de tipo recursivo

[*Playground*](/play/#example/recursive-type-references)

Los alias de tipo siempre han tenido una limitación en la forma en que se le puede hacer referencia "recursivamente".
La razón es que cualquier uso de un alias de tipo se debe poder sustituir con cualquier alias que tenga.
En algunos casos, eso no es posible, por lo que el compilador rechaza ciertos alias recursivos como los siguientes:

```ts
type Foo = Foo;
```

Esta es una restricción razonable porque cualquier uso de `Foo` necesitaría ser reemplazado por `Foo` que necesitaría ser reemplazado por `Foo` que necesitaría ser reemplazado con `Foo` que ... bueno, con suerte obtendrás ¡la idea!
Al final, no hay un tipo que tenga sentido en lugar de `Foo`.

Esto es bastante [coherente con la forma en que otros lenguajes tratan los alias de tipo](https://wikipedia.org/w/index.php?title=Recursive_data_type&oldid=913091335#in_type_synonyms), pero da lugar a algunos escenarios ligeramente sorprendentes sobre cómo los usuarios aprovechan la característica.
Por ejemplo, en *TypeScript 3.6* y versiones anteriores, lo siguiente provoca un error.

```ts
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
//   ~~~~~~~~~~~~
// error: El alias de tipo 'ValueOrArray' se hace referencia circularmente a sí mismo.
```

Esto es extraño porque técnicamente no hay nada de malo en cualquier uso que los usuarios siempre puedan escribir lo que era efectivamente el mismo código introduciendo una interfaz.

```ts
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
```

Debido a que las interfaces (y otros tipos de objetos) introducen un nivel de indirección y su estructura completa no necesita construirse con entusiasmo, *TypeScript* no tiene problemas para trabajar con esta estructura.

Pero la solución alternativa para introducir la interfaz no fue intuitiva para los usuarios.
Y, en principio, realmente no había nada malo con la versión original de `ValueOrArray` que usaba `Array` directamente.
Si el compilador era un poco más "vago" y solo calculaba los argumentos de tipo para `Array` cuando era necesario, *TypeScript* podría expresarlos correctamente.

Eso es exactamente lo que introduce *TypeScript 3.7*.
En el "nivel superior" de un alias de tipo, *TypeScript* diferirá la resolución del tipo de los argumentos para permitir estos patrones.

Esto significa que un código como el siguiente que intentaba representar *JSON*...

```ts
type Json = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [property: string]: Json;
}

interface JsonArray extends Array<Json> {}
```

finalmente se puede reescribir sin interfaces auxiliares.

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[];
```

Esta nueva relajación también nos permite hacer referencia de forma recursiva a alias de tipo en tuplas.
El siguiente código que solía generar errores ahora es un código *TypeScript* válido.

```ts
type VirtualNode = string | [string, { [key: string]: any }, ...VirtualNode[]];

const myNode: VirtualNode = [
  "div",
  { id: "parent" },
  ["div", { id: "first-child" }, "I'm the first child"],
  ["div", { id: "second-child" }, "I'm the second child"],
];
```

Para obtener más información, puedes [leer sobre la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/33050).

## `--declaration` y `--allowJs`

La bandera [`declaration`](/tsconfig#declaration) en *TypeScript* nos permite generar archivos `.d.ts` (archivos de declaración) a partir de archivos fuente de *TypeScript* (es decir, archivos `.ts` y `.tsx`).
Estos archivos `.d.ts` son importantes por un par de razones.

En primer lugar, son importantes porque permiten que *TypeScript* verifique el tipo de otros proyectos sin volver a verificar el código fuente original.
También son importantes porque permiten que *TypeScript* interopere con las bibliotecas de *JavaScript* existentes que no se crearon con *TypeScript* en mente.
Finalmente, un beneficio que a menudo se subestima: tanto los usuarios de *TypeScript* y *JavaScript* se pueden beneficiar de estos archivos cuando utilizan editores con tecnología de *TypeScript* para obtener cosas como una mejor autocompletado.

Desafortunadamente, [`declaration`](/tsconfig#declaration) no funcionó con el indicador [`allowJs`](/tsconfig#allowJs) que permite mezclar archivos de entrada de *TypeScript* y *JavaScript*.
Esta fue una limitación frustrante porque significaba que los usuarios no podían usar la marca [`declaration`](/tsconfig#declaration) al migrar código base, incluso si estaban anotadas en *JSDoc*.
*TypeScript 3.7* cambia eso y permite que las dos opciones se usen juntas.

El resultado más impactante de esta característica puede ser un poco sutil: con *TypeScript 3.7*, los usuarios pueden escribir bibliotecas en *JavaScript* anotado *JSDoc* y admitir usuarios de *TypeScript*.

La forma en que esto funciona es que cuando se usa [`allowJs`](/tsconfig#allowJs), *TypeScript* tiene algunos análisis de mejor esfuerzo para comprender los patrones comunes de *JavaScript*; sin embargo, la forma en que algunos patrones se expresan en *JavaScript* no necesariamente se parecen a sus equivalentes en *TypeScript*.
Cuando se activa la emisión de [`declaration`](/tsconfig#declaration), *TypeScript* descubre la mejor manera de transformar los comentarios *JSDoc* y las exportaciones *CommonJS* en declaraciones de tipo válidas y similares en los archivos de salida `.d.ts`.

Como ejemplo, el siguiente fragmento de código

```js
const assert = require("assert");

module.exports.blurImage = blurImage;

/**
 * Produce una imagen borrosa desde un búfer de entrada.
 *
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
function blurImage(input, width, height) {
  const numPixels = width * height * 4;
  assert(input.length === numPixels);
  const result = new Uint8Array(numPixels);

  // PENDIENTE

  return result;
}
```

Producirá un archivo `.d.ts` como

```ts
/**
 * Produce una imagen borrosa desde un búfer de entrada.
 *
 * @param input {Uint8Array}
 * @param width {number}
 * @param height {number}
 */
export function blurImage(
  input: Uint8Array,
  width: number,
  height: number
): Uint8Array;
```

Esto también puede ir más allá de las funciones básicas con etiquetas `@param`, donde el siguiente ejemplo:

```js
/**
 * @callback Job
 * @returns {void}
 */

/** Las colas funcionan */
export class Worker {
  constructor(maxDepth = 10) {
    this.started = false;
    this.depthLimit = maxDepth;
    /**
     * **Nota**: Los trabajos en cola pueden agregar más elementos a la cola
     * @type {Job[]}
     */
    this.queue = [];
  }
  /**
   * Agrega un elemento de trabajo a la cola
   * @param {Job} work
   */
  push(work) {
    if (this.queue.length + 1 > this.depthLimit) throw new Error("¡Cola llena!");
    this.queue.push(work);
  }
  /**
   * Inicia la cola si aún no se ha iniciado
   */
  start() {
    if (this.started) return false;
    this.started = true;
    while (this.queue.length) {
      /** @type {Job} */ (this.queue.shift())();
    }
    return true;
  }
}
```

se transformará en el siguiente archivo `.d.ts`:

```ts
/**
 * @callback Job
 * @returns {void}
 */
/** Las colas funcionan */
export class Worker {
  constructor(maxDepth?: number);
  started: boolean;
  depthLimit: number;
  /**
   * **Nota**: Los trabajos en cola pueden agregar más elementos a la cola
   * @type {Job[]}
   */
  queue: Job[];
  /**
   * Agrega un elemento de trabajo a la cola
   * @param {Job} work
   */
  push(work: Job): void;
  /**
   * Inicia la cola si aún no se ha iniciado
   */
  start(): boolean;
}
export type Job = () => void;
```

Ten en cuenta que cuando se usan estos indicadores juntos, *TypeScript* no necesariamente tiene que bajar el nivel de los archivos `.js`.
Si simplemente deseas que *TypeScript* cree archivos `.d.ts`, puedes usar la opción del compilador [`emitDeclarationOnly`](/tsconfig#emitDeclarationOnly).

Para obtener más detalles, puedes [consultar la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/32372).

## El indicador `useDefineForClassFields` y el modificador de propiedad `declare`

Cuando *TypeScript* implementó campos públicos de clase, asumimos lo mejor que pudimos que el siguiente código

```ts
class C {
  foo = 100;
  bar: string;
}
```

sería equivalente a una asignación similar dentro del cuerpo de un constructor.

```ts
class C {
  constructor() {
    this.foo = 100;
  }
}
```

Desafortunadamente, si bien esta parecía ser la dirección hacia la que se movió la propuesta en sus primeros días, existe una gran posibilidad de que los campos de clases públicas se estandaricen de manera diferente.
En cambio, es posible que la muestra de código original deba eliminar el azúcar sintáctico a algo más cercano a lo siguiente:

```ts
class C {
  constructor() {
    Object.defineProperty(this, "foo", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100,
    });
    Object.defineProperty(this, "bar", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
  }
}
```

Si bien *TypeScript 3.7* no cambia ninguna emisión existente de forma predeterminada, hemos estado implementando cambios de forma incremental para ayudar a los usuarios a mitigar posibles roturas futuras.
Hemos proporcionado una nueva bandera llamada [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) para habilitar este modo de emisión con una nueva lógica de verificación.

Los dos cambios más importantes son los siguientes:

- Las declaraciones se inician con `Object.defineProperty`.
- Las declaraciones *siempre* se inician en `undefined`, incluso si no tienen iniciador.

Esto puede causar algunas consecuencias para el código existente que usa herencia. En primer lugar, los descriptores de acceso `set` de las clases base no se activarán ⏤ se sobrescribirán por completo.

```ts
class Base {
  set data(value: string) {
    console.log("data changed to " + value);
  }
}

class Derived extends Base {
  // Ya no activa un 'console.log'
  // cuando se usa 'useDefineForClassFields'.
  data = 10;
}
```

En segundo lugar, el uso de campos de clase para especializar propiedades de clases base tampoco funcionará.

```ts
interface Animal {
  animalStuff: any;
}
interface Dog extends Animal {
  dogStuff: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // Inicia 'resident' a 'undefined'
  // después de la llamada a 'super()' cuando
  // usas 'useDefineForClassFields'!
  resident: Dog;

  constructor(dog: Dog) {
    super(dog);
  }
}
```

A lo que estos dos se reducen es a que mezclar propiedades con descriptores de acceso causará problemas, y también volverá a declarar propiedades sin iniciadores.

Para detectar el problema en torno a los accesos, *TypeScript 3.7* ahora emitirá accesos `get`/`set` en archivos `.d.ts` para que en *TypeScript* se puedan comprobar accesos redefinidos.

El código que se ve afectado por el cambio de campos de clase puede solucionar el problema convirtiendo los iniciadores de campo en asignaciones en los cuerpos del constructor.

```ts
class Base {
  set data(value: string) {
    console.log("data changed to " + value);
  }
}

class Derived extends Base {
  constructor() {
    data = 10;
  }
}
```

Para ayudar a mitigar el segundo problema, puedes agregar un iniciador explícito o agregar un modificador `declare` para indicar que una propiedad no debe tener emisión.

```ts
interface Animal {
  animalStuff: any;
}
interface Dog extends Animal {
  dogStuff: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  declare resident: Dog;
  //  ^^^^^^^
  // 'resident' ahora tiene un modificador 'declare',
  // y no producirá ningún código de salida.

  constructor(dog: Dog) {
    super(dog);
  }
}
```

Actualmente, [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) solo está disponible cuando se apunta a *ES5* y superior, ya que `Object.defineProperty` no existe en *ES3*.
Para lograr una similar verificación de problemas, puedes crear un proyecto separado que apunte a *ES5* y use [`noEmit`](/tsconfig#noEmit) para evitar una compilación completa.

Para obtener más información, puedes [echar un vistazo a la solicitud de extracción original para estos cambios](https://github.com/microsoft/TypeScript/pull/33509).

Recomendamos encarecidamente a los usuarios que prueben la marca [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) e informen sobre nuestro rastreador de problemas o en los comentarios a continuación.
Esto incluye comentarios sobre la dificultad de adoptar la bandera para que podamos entender cómo podemos facilitar la migración.

## Edición sin compilación con referencias de proyectos

Las referencias de proyectos *TypeScript* nos brindan una manera fácil de dividir el código base para brindarnos compilaciones más rápidas.
Desafortunadamente, editar un proyecto cuyas dependencias no se habían creado (o cuya salida estaba desactualizada) significaba que la experiencia de edición no funcionaría bien.

En *TypeScript 3.7*, al abrir un proyecto con dependencias, *TypeScript* utilizará automáticamente los archivos fuente `.ts`/`.tsx` en su lugar.
Esto significa que los proyectos que utilizan referencias de proyectos ahora verán una experiencia de edición mejorada donde las operaciones semánticas están actualizadas y "simplemente funcionan".
Puedes deshabilitar este comportamiento con la opción del compilador [`disableSourceOfProjectReferenceRedirect`](/tsconfig#disableSourceOfProjectReferenceRedirect) que puede ser apropiada cuando se trabaja en proyectos muy grandes donde este cambio puede afectar el rendimiento de la edición.

Puedes [leer más sobre este cambio leyendo su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/32028).

## Comprobación de funciones no solicitadas

Un error común y peligroso es olvidarse de invocar una función, especialmente si la función tiene cero argumentos o se nombra de una manera que implica que podría ser una propiedad en lugar de una función.

```ts
interface User {
  isAdministrator(): boolean;
  notify(): void;
  doNotDisturb?(): boolean;
}

// más tarde...

// Código roto, ¡no lo uses!
function doAdminThing(user: User) {
  // oops!
  if (user.isAdministrator) {
    sudo();
    editTheConfiguration();
  } else {
    throw new AccessDeniedError("User is not an admin");
  }
}
```

Aquí, olvidamos llamar a `isAdministrator`, ¡y el código ⏤incorrectamente⏤ permite a los usuarios que no son administradores editar la configuración!

En *TypeScript 3.7*, esto se identifica como un error probable:

```ts
function doAdminThing(user: User) {
    if (user.isAdministrator) {
    //  ~~~~~~~~~~~~~~~~~~~~
    // ¡error! Esta condición siempre devolverá true ya que la función siempre está definida.
    //        ¿Querías llamarla en su lugar?
```

Esta comprobación es un cambio rotundo, pero por esa razón las comprobaciones son muy conservadoras.
Este error solo se emite en condiciones `if`, y no se emite en propiedades opcionales, si [`strictNullChecks`](/tsconfig#strictNullChecks) está desactivado, o si la función se llama más tarde dentro del cuerpo del `if`:

```ts
interface User {
  isAdministrator(): boolean;
  notify(): void;
  doNotDisturb?(): boolean;
}

function issueNotification(user: User) {
  if (user.doNotDisturb) {
    // Bien, la propiedad es opcional
  }
  if (user.notify) {
    // Bien, llamó a la función
    user.notify();
  }
}
```

Si tenías la intención de probar la función sin llamarla, puedes corregir la definición de la misma para incluir `undefined`/`null`, o usar `!!` para escribir algo como `if (!!user.isAdministrator)` para indicar que la coacción es intencionada.

Le debemos un enorme agradecimiento al usuario de *GitHub* [*@jwbay*](https://github.com/jwbay) que tomó la iniciativa de crear una [prueba de concepto](https://github.com/microsoft/TypeScript/pull/32802) e iterado para proporcionarnos [la versión actual](https://github.com/microsoft/TypeScript/pull/33178).

## `// en archivos *TypeScript*

*TypeScript 3.7* nos permite agregar comentarios `//@ ts-nocheck` en la parte superior de los archivos de TypeScript para deshabilitar las comprobaciones semánticas.
Históricamente, este comentario solo se respetaba en archivos fuente *JavaScript* en presencia de [`checkJs`](/tsconfig#checkJs), pero hemos ampliado el soporte a archivos *TypeScript* para facilitar las migraciones a todos los usuarios.

## Opción del formateador de punto y coma

El formateador integrado de *TypeScript* ahora admite la inserción y eliminación del punto y coma en ubicaciones donde un punto y coma final es opcional debido a las reglas de inserción automática de punto y coma (*IAPC*) de *JavaScript*. La configuración está disponible ahora en [*Visual Studio Code Insiders*](https://code.visualstudio.com/insiders/) y estará disponible en *Visual Studio 16.4 Preview 2* en el menú *Herramientas* ▹ *Opciones*.

<img width="833" alt="Nueva opción de formateador de punto y coma en VS Code" src="https://user-images.githubusercontent.com/3277153/65913194-10066e80-e395-11e9-8a3a-4f7305c397d5.png">

La elección de un valor de "insertar" o "eliminar" también afecta el formato de las importaciones automáticas, los tipos extraídos y otro código generado proporcionado por los servicios de *TypeScript*. Dejar la configuración en su valor predeterminado de "ignorar" hace que el código generado coincida con la preferencia de punto y coma detectada en el archivo actual.

## 3.7 Cambios importantes

### Cambios *DOM*

[Se actualizaron los tipos de `lib.dom.d.ts`](https://github.com/microsoft/TypeScript/pull/33627).
Estos cambios son en gran parte cambios de corrección relacionados con la nulabilidad, pero el impacto dependerá en última instancia de su código base.

### Mitigación de campo de clase

[Como se mencionó anteriormente](#el-indicador-usedefineforclassfields-y-el-modificador-de-propiedad-declare), *TypeScript 3.7* emite accesores `get`/`set` en archivos `.d.ts` que pueden causar cambios importantes para los consumidores en versiones anteriores de *TypeScript* como 3.5 y anteriores.
Los usuarios de *TypeScript 3.6* no se verán afectados, ya que esa versión fue preparada para el futuro de esta característica.

Si bien no es una rotura per se, optar por la marca [`useDefineForClassFields`](/tsconfig#useDefineForClassFields) puede provocar roturas cuando:

- anular un descriptor de acceso en una clase derivada con una declaración de propiedad
- volver a declarar una declaración de propiedad sin iniciador

Para comprender el impacto total, lee [la sección anterior sobre el indicador `useDefineForClassFields`](#el-indicador-usedefineforclassfields-y-el-modificador-de-propiedad-declare).

### Comprobación de funciones de verdad

Como se mencionó anteriormente, *TypeScript* ahora genera errores cuando las funciones parecen no ser llamadas dentro de las condiciones de la declaración `if`.
Se emite un error cuando se marca un tipo de función en las condiciones `if`, a menos que se aplique cualquiera de las siguientes condiciones:

- el valor comprobado proviene de una propiedad opcional
- [`strictNullChecks`](/tsconfig#strictNullChecks) está deshabilitado
- la función se llama más tarde dentro del cuerpo del `if`

### Las declaraciones de tipos locales e importados ahora están en conflicto

Debido a un error, anteriormente se permitía la siguiente construcción en *TypeScript*:

```ts
// ./someOtherModule.ts
interface SomeType {
  y: string;
}

// ./myModule.ts
import { SomeType } from "./someOtherModule";
export interface SomeType {
  x: number;
}

function fn(arg: SomeType) {
  console.log(arg.x); // ¡Error! 'x' no existe en 'SomeType'
}
```

Aquí, `SomeType` parece originarse tanto en la declaración `import` como en la declaración `interface` local.
Quizás sorprendentemente, dentro del módulo, `SomeType` se refiere exclusivamente a la definición `import`ada, y la declaración local `SomeType` solo se puede usar cuando se importa desde otro archivo.
Esto es muy confuso y nuestra revisión de la muy pequeña cantidad de casos de código como este en la naturaleza mostró que los desarrolladores generalmente pensaban que estaba sucediendo algo diferente.

En *TypeScript 3.7*, [esto ahora correctamente se identifica como un error de identificador duplicado](https://github.com/microsoft/TypeScript/pull/31231).
La corrección exacta depende de la intención original del autor y se debe abordar caso por caso.
Por lo general, el conflicto de nombres no es intencional y la mejor solución es cambiar el nombre del tipo importado.
Si la intención era aumentar el tipo importado, se debería escribir un aumento de módulo adecuado en su lugar.

### Cambios en la *API* 3.7

Para habilitar los patrones de alias de tipo recursivo descritos anteriormente, la propiedad `typeArguments` se ha eliminado de la interfaz `TypeReference`. En su lugar, los usuarios deberían utilizar la función `getTypeArguments` en instancias de `TypeChecker`.

## TypeScript 3.6

## Genéricos más estrictos

*TypeScript 3.6* introduce una comprobación más estricta de los iteradores y las funciones del generador.
En versiones anteriores, los usuarios de generadores no tenían forma de diferenciar si un generador entregaba o devolvía un valor.

```ts
function* foo() {
  if (Math.random() < 0.5) yield 100;
  return "Finished!";
}

let iter = foo();
let curr = iter.next();
if (curr.done) {
  // TypeScript 3.5 y anteriores pensaron que se trataba de una 'string | number'.
  // ¡Debe saber que es 'string' ya que 'done' era 'true'!
  curr.value;
}
```

Además, los generadores simplemente asumieron que el tipo de `yield` siempre era `any`.

```ts
function* bar() {
  let x: { hello(): void } = yield;
  x.hello();
}

let iter = bar();
iter.next();
iter.next(123); // oops! ¡Error de el entorno de ejecución!
```

En *TypeScript 3.6*, el corrector ahora sabe que el tipo correcto para `curr.value` debería ser `string` en nuestro primer ejemplo, y se equivocará correctamente en nuestra llamada a `next()` en nuestro último ejemplo.
Esto es gracias a algunos cambios en las declaraciones de tipo `Iterator` e `IteratorResult` para incluir algunos nuevos parámetros de tipo, y a un nuevo tipo que *TypeScript* usa para representar generadores llamado el tipo `Generator`.

El tipo `Iterator` ahora permite a los usuarios especificar el tipo generado, el tipo devuelto y el tipo que `next` puede aceptar.

```ts
interface Iterator<T, TReturn = any, TNext = undefined> {
  // Toma 0 o 1 argumentos - no acepta 'undefined'
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return?(value?: TReturn): IteratorResult<T, TReturn>;
  throw?(e?: any): IteratorResult<T, TReturn>;
}
```

Sobre la base de ese trabajo, el nuevo tipo `Generator` es un `Iterator` que siempre tiene presentes los métodos `return` y `throw`, y también es iterable.

```ts
interface Generator<T = unknown, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return(value: TReturn): IteratorResult<T, TReturn>;
  throw(e: any): IteratorResult<T, TReturn>;
  [Symbol.iterator](): Generator<T, TReturn, TNext>;
}
```

Para permitir la diferenciación entre los valores devueltos y los valores obtenidos, *TypeScript 3.6* convierte el tipo `IteratorResult` en un tipo de unión discriminada:

```ts
type IteratorResult<T, TReturn = any> =
  | IteratorYieldResult<T>
  | IteratorReturnResult<TReturn>;

interface IteratorYieldResult<TYield> {
  done?: false;
  value: TYield;
}

interface IteratorReturnResult<TReturn> {
  done: true;
  value: TReturn;
}
```

En resumen, lo que esto significa es que podrás reducir adecuadamente los valores de los iteradores al tratar con ellos directamente.

Para representar correctamente los tipos que se pueden pasar a un generador desde las llamadas a `next()`, *TypeScript 3.6* también infiere ciertos usos de `yield` dentro del cuerpo de una función generadora.

```ts
function* foo() {
  let x: string = yield;
  console.log(x.toUpperCase());
}

let x = foo();
x.next(); // la primera llamada a 'next' siempre se ignora
x.next(42); // ¡error! 'number' no se puede asignar a 'string'
```

Si prefieres ser explícito, también puedes aplicar el tipo de valores que se pueden devolver, generar y evaluar a partir de expresiones `yield` mediante un tipo de retorno explícito.
Debajo, `next()` solo se puede llamar con `boolean`os, y dependiendo del valor de `done`, `value` es un `string` o un `number`.

```ts
/**
 * - produce números
 * - devuelve cadenas
 * - se le pueden pasar booleanos
 */
function* counter(): Generator<number, string, boolean> {
  let i = 0;
  while (true) {
    if (yield i++) {
      break;
    }
  }
  return "done!";
}

var iter = counter();
var curr = iter.next();
while (!curr.done) {
  console.log(curr.value);
  curr = iter.next(curr.value === 5);
}
console.log(curr.value.toUpperCase());

// prints:
//
// 0
// 1
// 2
// 3
// 4
// 5
// ¡HECHO!
```

Para obtener más detalles sobre el cambio, [consulta la solicitud de extracción aquí](https://github.com/Microsoft/TypeScript/issues/2983).

## Difusión de arreglo más precisa

En los objetivos anteriores a *ES2015*, las emisiones más fieles para construcciones como los bucles `for`/`of` y las extensiones de arreglo pueden ser un poco pesadas.
Por esta razón, *TypeScript* usa una emisión más simple de manera predeterminada solo admite tipos de arreglo y admite la iteración en otros tipos usando el indicador [`downlevelIteration`](/tsconfig#downlevelIteration).
El valor predeterminado más flexible sin [`downlevelIteration`](/tsconfig#downlevelIteration) funciona bastante bien; sin embargo, hubo algunos casos comunes en los que la transformación de los diferenciales de arreglo tuvo diferencias observables.
Por ejemplo, el siguiente arreglo que contiene una extensión

```ts
[...Array(5)];
```

se puede reescribir como el siguiente literal de arreglo

```js
[undefined, undefined, undefined, undefined, undefined];
```

Sin embargo, *TypeScript* transformaría el código original en este código:

```ts
Array(5).slice();
```

que es ligeramente diferente.
`Array(5)` produce un arreglo con una longitud de 5, pero sin ranuras de propiedad definidas.

*TypeScript 3.6* introduce un nuevo ayudante `__spreadArrays` para modelar con precisión lo que sucede en *ECMAScript 2015* en objetivos más antiguos fuera de [`downlevelIteration`](/tsconfig#downlevelIteration).
`__spreadArrays` también está disponible en [`tslib`](https://github.com/Microsoft/tslib/).

Para obtener más información, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/31166).

## Promesas mejoradas en torno a *XU*

*TypeScript 3.6* introduce algunas mejoras para cuando las `Promise`s se manejan mal.

Por ejemplo, frecuentemente es muy común olvidar `.then()` o `await` el contenido de una `Promise` antes de pasarla a otra función.
Los mensajes de error de *TypeScript* ahora son especializados e informan al usuario que tal vez debería considerar usar la palabra clave `await`.

```ts
interface User {
  name: string;
  age: number;
  location: string;
}

declare function getUserData(): Promise<User>;
declare function displayUser(user: User): void;

async function f() {
  displayUser(getUserData());
  //              ~~~~~~~~~~~~~
  // El argumento de tipo 'Promise<User>' no se puede asignar al parámetro de tipo 'User'.
  //   ...
  // ¿Olvidaste usar 'await'?
}
```

También es común intentar acceder a un método antes de `await` o `.then()` a `Promise`.
Este es otro ejemplo, entre muchos otros, en los que podemos hacerlo mejor.

```ts
async function getCuteAnimals() {
  fetch("https://reddit.com/r/aww.json").json();
  //   ~~~~
  // La propiedad 'json' no existe en el tipo 'Promise<Response>'.
  //
  // ¿Olvidaste usar 'await'?
}
```

Para obtener más detalles, [consulta el problema de origen](https://github.com/microsoft/TypeScript/issues/30646), así como las solicitudes de extracción que lo vinculan.

## Mejor compatibilidad con Unicode para identificadores

*TypeScript 3.6* contiene un mejor soporte para caracteres Unicode en identificadores cuando se emiten a *ES2015* y destinos posteriores.

```ts
const 𝓱𝓮𝓵𝓵𝓸 = "world"; // anteriormente no permitido, ahora permitido en '--target es2015'
```

## Soporte de `import.meta` en `SystemJS`

*TypeScript 3.6* admite la transformación de `import.meta` a `context.meta` cuando el objetivo de su `module` está configurado en `system`.

```ts
// Este módulo:

console.log(import.meta.url);

// se convierte en lo siguiente:

System.register([], function (exports, context) {
  return {
    setters: [],
    execute: function () {
      console.log(context.meta.url);
    },
  };
});
```

## Los accesores `get` y `set` están permitidos en contextos ambientales

En versiones anteriores de *TypeScript*, el lenguaje no permitía los accesores `get` y `set` en contextos ambientales (como en las `declare` de clases, o en los archivos `.d.ts` en general).
El fundamento era que los descriptores de accesores no eran distintos de las propiedades en cuanto a escribir y leer estas propiedades;
sin embargo, [debido a que la propuesta de campos de clase de *ECMAScript* puede tener un comportamiento diferente al de las versiones existentes de *TypeScript*](https://github.com/tc39/proposal-class-fields/issues/248), nos dimos cuenta de que necesitábamos una forma de comunicar este comportamiento diferente para proporcionar errores apropiados en las subclases.

Como resultado, los usuarios pueden escribir captadores y definidores en contextos ambientales en *TypeScript 3.6*.

```ts
declare class Foo {
  // Permitido en 3.6+.
  get x(): number;
  set x(val: number);
}
```

En *TypeScript 3.7*, el propio compilador aprovechará esta característica para que los archivos `.d.ts` generados también emitan accesores `get`/`set`.

## Las clases y funciones ambientales se pueden fusionar

En versiones anteriores de *TypeScript
, era un error fusionar clases y funciones bajo cualquier circunstancia.
Ahora, las clases y funciones ambientales (clases/funciones con el modificador `declare`, o en archivos `.d.ts`) se pueden fusionar.
Esto significa que ahora puedes escribir lo siguiente:

```ts
export declare function Point2D(x: number, y: number): Point2D;
export declare class Point2D {
  x: number;
  y: number;
  constructor(x: number, y: number);
}
```

en lugar de la necesidad de usar

```ts
export interface Point2D {
  x: number;
  y: number;
}
export declare var Point2D: {
  (x: number, y: number): Point2D;
  new (x: number, y: number): Point2D;
};
```

Una ventaja de esto es que el patrón del constructor invocable se puede expresar fácilmente al mismo tiempo que permite que los espacios de nombres se fusionen con estas declaraciones (ya que las declaraciones `var` no se pueden fusionar con los `namespace`s).

En *TypeScript 3.7*, el compilador aprovechará esta característica para que los archivos `.d.ts` generados a partir de archivos `.js` puedan capturar adecuadamente tanto la capacidad de llamada como la capacidad de construcción de una función similar a una clase.

Para obtener más detalles, [consulta la *SE* original en *GitHub*](https://github.com/microsoft/TypeScript/pull/32584).

## *API* para admitir `--build` y `--incremental`

*TypeScript 3.0* introdujo soporte para hacer referencia a otros y construirlos de forma incremental usando la marca `--build`.
Además, *TypeScript 3.4* introdujo el indicador [`incremental`](/tsconfig#incremental) para guardar información sobre compilaciones anteriores para reconstruir solo ciertos archivos.
Estas banderas fueron increíblemente útiles para estructurar proyectos de manera más flexible y acelerar las construcciones.
Desafortunadamente, el uso de estos indicadores no funcionó con herramientas de compilación de terceros como *Gulp* y *Webpack*.
*TypeScript 3.6* ahora expone dos conjuntos de *API*s para operar en referencias de proyectos y creación de programas incrementales.

Para crear compilaciones [`incremental`](/tsconfig#incremental), los usuarios pueden aprovechar las *API*s `createIncrementalProgram` y `createIncrementalCompilerHost`.
Los usuarios también pueden rehidratar instancias de programas antiguos a partir de archivos `.tsbuildinfo` generados por esta *API* utilizando la función `readBuilderProgram` recién expuesta, que solo se debe usar para crear nuevos programas (es decir, no puedes modificar la instancia devuelta ⏤ solo está destinado a ser utilizado para el parámetro `oldProgram` en otras funciones de `create*Program`).

Para aprovechar las referencias del proyecto, se ha expuesto una nueva función `createSolutionBuilder`, que devuelve una instancia del nuevo tipo `SolutionBuilder`.

Para obtener más detalles sobre estas *API*s, puede s[ver la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/31432).

## Edición de código con reconocimiento de punto y coma

Editores como *Visual Studio* y *Visual Studio Code* pueden aplicar automáticamente correcciones rápidas, refactorizaciones y otras transformaciones, como importar automáticamente valores de otros módulos.
Estas transformaciones están impulsadas por *TypeScript*, y las versiones anteriores de *TypeScript* agregaron punto y coma incondicionalmente al final de cada declaración; desafortunadamente, esto no estaba de acuerdo con las pautas de estilo de muchos usuarios, y muchos usuarios estaban disgustados con que el editor insertara punto y coma.

*TypeScript* ahora es lo suficientemente inteligente como para detectar si tu archivo usa punto y coma al aplicar este tipo de ediciones.
Si tu archivo generalmente carece de punto y coma, *TypeScript* no agregará uno.

Para obtener más detalles, [consulta la solicitud de extracción correspondiente](https://github.com/microsoft/TypeScript/pull/31801).

## Sintaxis de importación automática más inteligente

*JavaScript* tiene muchas sintaxis o convenciones de módulos diferentes: el del estándar *ECMAScript*, el que *Node* ya admite (*CommonJS*), *AMD*, *System.js*, ¡y más!
En su mayor parte, *TypeScript* se importaría automáticamente de forma predeterminada utilizando la sintaxis del módulo *ECMAScript*, que a menudo era inapropiado en ciertos proyectos de *TypeScript* con diferentes configuraciones de compilador, o en proyectos de *Node* con *JavaScript* estándar y llamadas `require`.

*TypeScript 3.6* ahora es un poco más inteligente al analizar tus importaciones existentes antes de decidir cómo importar automáticamente otros módulos.
Puedes [ver más detalles en la solicitud de extracción original aquí](https://github.com/microsoft/TypeScript/pull/32684).

## Completar las promesas `await`

## Nuevo *Playground de TypeScript*

¡El *Playground* de *TypeScript* ha recibido una actualización muy necesaria con una nueva y práctica funcionalidad!
El nuevo *Playground* es en gran parte una bifurcación del [*Playground* de *TypeScript*](https://github.com/agentcooper/typescript-play) de [Artem Tyurin](https://github.com/agentcooper)  que los miembros de la comunidad han estado usando más y más.
¡Le debemos a Artem un gran agradecimiento por ayudarnos aquí!

El nuevo *Playground* ahora admite muchas opciones nuevas, que incluyen:

- La opción [`target`](/tsconfig#target) (que permite a los usuarios cambiar de `es5` a `es3`, `es2015`, `esnext`, etc.)
- Todas las banderas de rigor (incluyendo solo [`strict`](/tsconfig#strict))
- Soporte para archivos *JavaScript* simples (usando `allowJS` y opcionalmente [`checkJs`](/tsconfig#checkJs))

Estas opciones también persisten cuando se comparten enlaces a ejemplos de *Playground*, lo que permite a los usuarios compartir ejemplos de manera más confiable sin tener que decirle al destinatario "¡oh, no olvides activar la opción [`noImplicitAny`](/tsconfig#noImplicitAny)!".

En un futuro cercano, actualizaremos los ejemplos de *Playground*, agregaremos soporte *JSX* y mejoraremos la adquisición automática de tipos, lo que significa que podrás ver la misma experiencia en el *Playground* que la que obtendrías en tu editor personal. .

A medida que mejoramos el *Playground* y el sitio web, [agradecemos tus comentarios y solicitudes de extracción en *GitHub*](https://github.com/microsoft/TypeScript-Website/).

## TypeScript 3.5

## Mejoras de velocidad

*TypeScript 3.5* introduce varias optimizaciones en torno a la verificación de tipos y las compilaciones incrementales.

### Aceleración de verificación de tipo

*TypeScript 3.5* contiene ciertas optimizaciones sobre *TypeScript 3.4* para la verificación de tipos de manera más eficiente.
Estas mejoras son significativamente más pronunciadas en escenarios del editor donde la verificación de tipos impulsa operaciones como listas de completado de código.

### Mejoras `--incrementales`

*TypeScript 3.5* mejora el modo de compilación [`incremental`](/tsconfig#incremental) de 3.4, al guardar información sobre cómo se calculó el estado del mundo ⏤ la configuración del compilador, por qué se buscaron los archivos, dónde se encontraron los archivos, etc.
En escenarios que involucran cientos de proyectos que usan referencias de proyectos *TypeScript* en modo `--build`, [hemos encontrado que la cantidad de tiempo de reconstrucción se puede reducir hasta en un 68% en comparación con *TypeScript 3.4*](https://github.com/Microsoft/TypeScript/pull/31101)!

Para obtener más detalles, puedes ver las solicitudes de extracción para

- [resolución del módulo `cache`](https://github.com/Microsoft/TypeScript/pull/31100)
- [configuración de caché calculada a partir de `tsconfig.json`](https://github.com/Microsoft/TypeScript/pull/31101)

## El tipo de ayudante `Omit`

*TypeScript 3.5* introduce el nuevo tipo de ayudante `Omit`, que crea un nuevo tipo con algunas propiedades eliminadas del original.

```ts
type Person = {
  name: string;
  age: number;
  location: string;
};

type QuantumPerson = Omit<Person, "location">;

// equivalente a
type QuantumPerson = {
  name: string;
  age: number;
};
```

Aquí pudimos copiar todas las propiedades de `Person` excepto por `location` usando el ayudante `Omit`.

Para obtener más detalles, [consulta la solicitud de extracción en *GitHub* para agregar `Omit`](https://github.com/Microsoft/TypeScript/pull/30552), así como [el cambio para usar `Omit` para el resto de los objetos](https://github.com/microsoft/TypeScript/pull/31134).

### Controles de exceso de propiedad mejorados en tipos unión

En *TypeScript 3.4* y versiones anteriores, se permitían ciertas propiedades en exceso en situaciones en las que realmente no deberían haber estado.
Por ejemplo, *TypeScript 3.4* permitía la propiedad `name` incorrecta en el objeto literal, aunque sus tipos no coinciden entre `Point` y `Label`.

```ts
type Point = {
  x: number;
  y: number;
};

type Label = {
  name: string;
};

const thing: Point | Label = {
  x: 0,
  y: 0,
  name: true, // ¡Uh oh!
};
```

Anteriormente, una unión no discriminada no tendría verificación de exceso de propiedades realizada en sus miembros y, como resultado, la propiedad `name` escrita incorrectamente y pasada desapercibida.

En *TypeScript 3.5*, el verificador de tipo al menos comprueba que todas las propiedades proporcionadas pertenecen a *algún* miembro de la unión y tienen el tipo apropiado, lo cual significa que el ejemplo anterior emite correctamente un error.

Ten en cuenta que la superposición parcial todavía está permitida siempre que los tipos de propiedad sean válidos.

```ts
const pl: Point | Label = {
  x: 0,
  y: 0,
  name: "origin", // bien
};
```

## La bandera `--allowUmdGlobalAccess`

En *TypeScript 3.5*, ahora puedes hacer referencia a declaraciones *UMD* globales como

```
export as namespace foo;
```

desde donde sea ⏤ incluso módulos ⏤ usando el nuevo indicador [`allowUmdGlobalAccess`](/tsconfig#allowUmdGlobalAccess).

Este modo agrega flexibilidad para mezclar y combinar la forma en que las bibliotecas de terceros, donde los globales que las bibliotecas declaran siempre se pueden consumir, incluso desde dentro de los módulos.

Para obtener más detalles, [consulta la solicitud de extracción en *GitHub*](https://github.com/Microsoft/TypeScript/pull/30776/files).

## Comprobación más inteligente del tipo unión

En *TypeScript 3.4* y versiones anteriores, el siguiente ejemplo fallaría:

```ts
type S = { done: boolean, valor: number };
type T = { done: false; value: number } | { done: true; value: number };

declare let source: S;
declare let target: T;

target = source;
```

Eso es porque `S` no se puede asignar a `{ done: false, value: number }` ni a `{ done: true, value: number }`.
¿Por qué?
Debido a que la propiedad `done` en `S` no es lo suficientemente específica ⏤ es `boolean` mientras que cada componente de `T` tiene una propiedad `done` que específicamente es `true` o `false`.
Eso es lo que queríamos decir con cada tipo de constituyente que se verifica de forma aislada: *TypeScript* no solo une cada propiedad y ve si `S` se puede asignar a eso.
Si lo hiciera, podría pasar algún código incorrecto como el siguiente:

```ts
interface Foo {
  kind: "foo";
  value: string;
}

interface Bar {
  kind: "bar";
  value: number;
}

function doSomething(x: Foo | Bar) {
  if (x.kind === "foo") {
    x.value.toLowerCase();
  }
}

// UH oh - ¡afortunadamente errores de TypeScript aquí!
doSomething({
  kind: "foo",
  value: 123,
});
```

Sin embargo, esto fue demasiado estricto para el ejemplo original.
Si averiguas el tipo preciso de cualquier valor posible de `S`, podrás ver que coincide exactamente con los tipos de `T`.

En *TypeScript 3.5*, al asignar tipos con propiedades discriminantes como en `T`, el lenguaje en realidad  *irá más allá* y descompondrá tipos como `S` en una unión de todos los posibles tipos habitantes.
En este caso, dado que `boolean` es una unión de `true` y `false`, `S` se verá como una unión de `{ done: false, value: number }` y `{ done: true, value: number }`.

Para obtener más detalles, puedes [ver la solicitud de extracción original en *GitHub*](https://github.com/microsoft/TypeScript/pull/30779).

## Inferencia de tipos de orden superior a partir de constructores genéricos

In TypeScript 3.4, we improved inference for when generic functions that return functions like so:

```ts
function compose<T, U, V>(f: (x: T) => U, g: (y: U) => V): (x: T) => V {
  return (x) => g(f(x));
}
```

tomó otras funciones genéricas como argumentos, así:

```ts
function arrayify<T>(x: T): T[] {
  return [x];
}

type Box<U> = { value: U };
function boxify<U>(y: U): Box<U> {
  return { value: y };
}

let newFn = compose(arrayify, boxify);
```

En lugar de un tipo relativamente inútil como `(x: {}) => Box<{}[]>`, que las versiones anteriores del lenguaje inferirían, la inferencia de *TypeScript 3.4* permite que `newFn` sea genérico.
Su nuevo tipo es `<T>(x: T) => Box<T[]>`.

*TypeScript 3.5* generaliza este comportamiento para trabajar también en funciones constructoras.

```ts
class Box<T> {
  kind: "box";
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

class Bag<U> {
  kind: "bag";
  value: U;
  constructor(value: U) {
    this.value = value;
  }
}

function composeCtor<T, U, V>(
  F: new (x: T) => U,
  G: new (y: U) => V
): (x: T) => V {
  return (x) => new G(new F(x));
}

let f = composeCtor(Box, Bag); // tiene el tipo '<T>(x: T) => Bag<Box<T>>'
let a = f(1024); // tiene el tipo 'Bag<Box<number>>'
```

Además de los patrones de composición como el anterior, esta nueva inferencia sobre constructores genéricos significa que las funciones que operan en componentes de clase en ciertas bibliotecas de *IU* como *React* pueden operar correctamente en componentes de clase genéricos.

```ts
type ComponentClass<P> = new (props: P) => Component<P>;
declare class Component<P> {
  props: P;
  constructor(props: P);
}

declare function myHoc<P>(C: ComponentClass<P>): ComponentClass<P>;

type NestedProps<T> = { foo: number; stuff: T };

declare class GenericComponent<T> extends Component<NestedProps<T>> {}

// el tipo es 'new<T>(props: NestedProps<T>) => Component<NestedProps<T>>'
const GenericComponent2 = myHoc(GenericComponent);
```

Para obtener más información, [consulta la solicitud de extracción original en *GitHub*](https://github.com/microsoft/TypeScript/pull/31116).

## TypeScript 3.4

## Compilaciones posteriores más rápidas con el indicador `--incremental`

*TypeScript 3.4* introduce una nueva bandera llamada [`incremental`](/tsconfig#incremental) que le dice a *TypeScript* que guarde información sobre el gráfico del proyecto de la última compilación.
La próxima vez que se invoque *TypeScript* con [`incremental`](/tsconfig#incremental), usará esa información para detectar la forma menos costosa de comprobar el tipo y emitir cambios en tu proyecto.

```json tsconfig
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

```json tsconfig
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

```
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

De la misma manera que las tuplas ordinarias son tipos que se extienden desde `Array` ⏤ una tupla con elementos de tipo `T`<sub>`1`</sub>, `T`<sub>`2`</sub>, ... `T`<sub>`n`</sub> extends from `Array<` `T`<sub>`1`</sub> | `T`<sub>`2`</sub> | ... `T`<sub>`n`</sub> `>` ⏤ las tuplas `readonly` son tipos que se extienden desde `ReadonlyArray`. Entonces, una tupla `readonly` con elementos `T`<sub>`1`</sub>, `T`<sub>`2`</sub>, ... `T`<sub>`n`</sub> se extiende desde `ReadonlyArray<` `T`<sub>`1`</sub> | `T`<sub`2`</sub> | ... `T`<sub>`n`</sub> `>`.

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

// ¡Trabaja!
let b = Math.random() < 0.5 ? (0 as const) : (1 as const);
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

## TypeScript 3.3

## Comportamiento mejorado para llamar a tipos unión

En versiones anteriores de *TypeScript*, las uniones de tipos invocables solo se podían invocar si tenían listas de parámetros idénticas.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number; // come y clasifica la fruta
type ColorConsumer = (color: Color) => string; // consume y describe los colores

declare let f: FruitEater | ColorConsumer;

// No se puede invocar una expresión cuyo tipo carece de una firma de llamada.
//   Tipo 'FruitEater | ColorConsumer' no tiene firmas de llamada .ts  compatibles (2349)
f("orange");
```

Sin embargo, en el ejemplo anterior, tanto `FruitEater`s como `ColorConsumer`s deberían poder tomar la cadena `"orange"` y devolver un `number` o un `string`.

En *TypeScript 3.3*, esto ya no es un error.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number; // come y clasifica la fruta
type ColorConsumer = (color: Color) => string; // consume y describe los colores

declare let f: FruitEater | ColorConsumer;

f("orange"); // ¡Esto funciona! Devuelve un 'number | string'.

f("apple"); // error - El argumento de tipo '"red"' no se puede asignar al parámetro de tipo '"orange"'.

f("red"); // error - El argumento de tipo '"red"' no se puede asignar al parámetro de tipo '"orange"'.
```

En *TypeScript 3.3*, los parámetros de estas firmas se *intersectan* juntos para crear una nueva firma.

En el ejemplo anterior, los parámetros `fruit` y `color` se cruzan juntos en un nuevo parámetro de tipo `Fruit & Color`.
`Fruit & Color` es realmente lo mismo que `("apple" | "orange") & ("red" | "orange")` que es equivalente a `("apple" & "red") | ("apple" & "orange") | ("orange" y "red") | ("orange" & "orange")`.
Cada una de esas intersecciones imposibles se reduce a `never`, y nos quedamos con `"orange" & "orange"` que es simplemente `"orange"`.

### Advertencias

Este nuevo comportamiento solo se activa cuando como máximo un tipo en la unión tiene múltiples sobrecargas, y como máximo un tipo en la unión tiene una firma genérica.
Eso significa métodos en `number[] | string[]` como `map` (que es genérico) todavía no se podrá llamar.

Por otro lado, métodos como `forEach` ahora serán invocables, pero en [`noImplicitAny`](/tsconfig#noImplicitAny) puede haber algunos problemas.

```ts
interface Dog {
  kind: "dog";
  dogProp: any;
}
interface Cat {
  kind: "cat";
  catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];

catOrDogArray.forEach((animal) => {
  //                ~~~~~~ error!
  // El parámetro 'animal' tiene implícitamente un tipo 'any'.
});
```

Esto todavía es estrictamente más capaz en *TypeScript 3.3*, y agregar una anotación de tipo explícita funcionará.

```ts
interface Dog {
  kind: "dog";
  dogProp: any;
}
interface Cat {
  kind: "cat";
  catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];
catOrDogArray.forEach((animal: Dog | Cat) => {
  if (animal.kind === "dog") {
    animal.dogProp;
    // ...
  } else if (animal.kind === "cat") {
    animal.catProp;
    // ...
  }
});
```

## Observación incremental de archivos para proyectos compuestos en `--build --watch`

*TypeScript 3.0* introdujo una nueva característica para estructurar compilaciones llamadas "proyectos compuestos".
Parte del objetivo aquí era garantizar que los usuarios pudieran dividir proyectos grandes en partes más pequeñas que se construyen rápidamente y preserva la estructura del proyecto, sin comprometer la experiencia existente de *TypeScript*.
Gracias a los proyectos compuestos, *TypeScript* puede usar el modo `--build` para recompilar solo el conjunto de proyectos y dependencias.
Puedes pensar en esto como optimizar las compilaciones entre proyectos.

*TypeScript 2.7* también introdujo compilaciones en modo `--watch` a través de una nueva *API* incremental "constructora".
En una línea similar, la idea completa es que este modo solo vuelve a verificar y vuelve a emitir archivos modificados o archivos cuyas dependencias podrían afectar la verificación de tipos.
Puedes pensar en esto como optimizar las compilaciones de *inter*-proyectos.

Antes de 3.3, la construcción de proyectos compuestos usando `--build --watch` en realidad no usaba esta infraestructura de observación incremental de archivos.
Una actualización en un proyecto en el modo `--build --watch` forzaría una compilación completa de ese proyecto, en lugar de determinar qué archivos dentro de ese proyecto se vieron afectados.

En *TypeScript 3.3*, la bandera `--build` del modo `--watch` también aprovecha la observación incremental de archivos.
Eso puede significar compilaciones significativamente más rápidas en `--build --watch`.
En nuestras pruebas, esta funcionalidad resultó en **una reducción del 50% al 75% en los tiempos de construcción** de los tiempos originales de `--build --watch`.
[Puedes leer más sobre la solicitud de extracción original para el cambio](https://github.com/Microsoft/TypeScript/pull/29161) para ver números específicos, pero creemos que la mayoría de los usuarios de proyectos compuestos verán ganancias significativas aquí.

## TypeScript 3.2

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

### Advertencias

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

### Advertencias

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

```json tsconfig
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

## TypeScript 3.1

## Tipos mapeados en tuplas y arreglos

En *TypeScript 3.1*, los tipos de objetos mapeados<sup>[[1]](#ts-3-1-only-homomorphic)</sup> sobre tuplas y arreglos ahora producen nuevas tuplas/arreglos, en lugar de crear un nuevo tipo donde los miembros como `push()`, `pop()` y `length` se convierten.
Por ejemplo:

```ts
type MapToPromise<T> = { [K in keyof T]: Promise<T[K]> };

type Coordinate = [number, number];

type PromiseCoordinate = MapToPromise<Coordinate>; // [Promise<number>, Promise<number>]
```

`MapToPromise` toma un tipo `T`, y cuando ese tipo es una tupla como `Coordinate`, solo se convierten las propiedades numéricas.
En `[number, number]`, hay dos propiedades nombradas numéricamente: `0` y `1`.
Cuando se le da una tupla como esa, `MapToPromise` creará una nueva tupla donde las propiedades `0` y `1` son `Promise` del tipo original.
Entonces, el tipo resultante `PromiseCoordinate` termina con el tipo `[Promise<number>, Promise<number>]`.

## Declaración de propiedades sobre funciones

*TypeScript 3.1* brinda la capacidad de definir propiedades en declaraciones de funciones y funciones declaradas por `const`, simplemente asignando propiedades en estas funciones en el mismo ámbito.
Esto nos permite escribir código *JavaScript* canónico sin tener que recurrir a improvisaciones de "espacio de nombres".
Por ejemplo:

```ts
function readImage(path: string, callback: (err: any, image: Image) => void) {
  // ...
}

readImage.sync = (path: string) => {
  const contents = fs.readFileSync(path);
  return decodeImageSync(contents);
};
```

Aquí, tenemos una función `readImage` que lee una imagen de una manera asincrónica sin bloqueo.
Además de `readImage`, hemos proporcionado una función de conveniencia en `readImage` llamada `readImage.sync`.

Si bien las exportaciones de *ECMAScript* son a menudo una mejor manera de proporcionar esta funcionalidad, este nuevo soporte permite que el código escrito en este estilo "simplemente funcione" en *TypeScript*.
Además, este enfoque para las declaraciones de propiedad nos permite expresar patrones comunes como `defaultProps` y `propTypes` en los componentes de función sin estado de *React* (*SFC*s).

```ts
export const FooComponent = ({ name }) => <div>Hello! I am {name}</div>;

FooComponent.defaultProps = {
  name: "(anonymous)",
};
```

<!--
fs.readFile(path, (err, data) => {
        if (err) callback(err, undefined);
        else decodeImage(data, (err, image) => {
            if (err) callback(err, undefined);
            else callback(undefined, image);
        });
    });
-->

---

<sup id="ts-3-1-only-homomorphic">[1]</sup>Específicamente, tipos mapeados homomórficos como en el formulario anterior.

## Selección de versión con `typesVersions`

Los comentarios de nuestra comunidad, así como nuestra propia experiencia, nos han demostrado que aprovechar las funciones más nuevas de *TypeScript* y, al mismo tiempo, dar cabida a los usuarios de las versiones anteriores es difícil.
*TypeScript* introduce una nueva función llamada `typesVersions` para ayudar a adaptarse a estos escenarios.

Cuando se usa la resolución del módulo *Node* en *TypeScript 3.1*, cuando *TypeScript* abre un archivo `package.json` para averiguar qué archivos necesita leer, primero mira un nuevo campo llamado `typesVersions`.
Un `package.json` con un campo `typesVersions` se podría ver así:

```json tsconfig
{
  "name": "nombre-paquete",
  "version": "1.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

Este `package.json` le dice a *TypeScript* que verifique si la versión actual de *TypeScript* se está ejecutando.
Si es 3.1 o posterior, determina la ruta que has importado en relación con el paquete y lee desde el directorio `ts3.1` del paquete.
Eso es lo que `{"*": ["ts3.1/*"] }` significa ⏤ Si estás familiarizado con el mapeo de rutas hoy en día, funciona exactamente así.

Entonces, en el ejemplo anterior, si estamos importando desde `"package-name"`, intentaremos resolver desde `[...]/node_modules/package-name/ts3.1/index.d.ts` (y otras rutas relevantes) cuando se ejecuta en *TypeScript 3.1*.
Si importamos desde `nombre-paquete/foo`, intentaremos buscar `[...]/node_modules/nombre-paquete/ts3.1/foo.d.ts` y `[...]/node-modules/nombre-paquete/ts3.1/foo/index.d.ts`.

¿Qué pasa si no estamos ejecutando *TypeScript 3.1* en este ejemplo?
Bueno, si ninguno de los campos en `typesVersions` coincide, *TypeScript* vuelve al campo `types`, por lo que aquí *TypeScript 3.0* y versiones anteriores serán redirigidos a `[...]/node_modules/nombre-paquete/index.d.ts`.

### Comportamiento coincidente

La forma en que *TypeScript* decide si una versión del compilador y el lenguaje coincide es utilizando los [rangos de `semver`](https://github.com/npm/node-semver#ranges) de *Node*.

### Varios campos

`typesVersions` puede admitir varios campos donde cada nombre de campo está especificado por el rango para coincidir.

```json tsconfig
{
  "name": "nombre-paquete",
  "version": "1.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    ">=3.2": { "*": ["ts3.2/*"] },
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

Dado que los rangos tienen el potencial de superponerse, determinar qué redirección se aplica es específico del orden.
Eso significa que en el ejemplo anterior, aunque tanto los comparadores `>=3.2` como `>=3.1` son compatibles con *TypeScript 3.2* y superior, invertir el orden podría tener un comportamiento diferente, por lo que el ejemplo anterior no sería equivalente al siguiente.

```json tsconfig
{
  "name": "nombre-paquete",
  "version": "1.0",
  "tipos": "./index.d.ts",
  "typesVersions": {
    // **Nota**: ¡esto no funciona!
    ">=3.1": { "*": ["ts3.1/*"] },
    ">=3.2": { "*": ["ts3.2/*"] }
  }
}
```

## TypeScript 3.0

## Tuplas en parámetros `rest` y expresiones de propagación

*TypeScript 3.0* agrega soporte a múltiples capacidades nuevas para interactuar con listas de parámetros de funciones como tipos de tuplas.
*TypeScript 3.0* agrega soporte para:

- [Expansión de los parámetros `rest` con tipos de tupla en parámetros discretos](#parametros-rest-con-tipos-tupla).
- [Expansión de expresiones de propagación con tipos tupla en argumentos discretos](#dispersion-de-expresiones-con-tipos-tupla).
- [Parámetros de descanso genéricos y la correspondiente inferencia de tipos tupla] (#parametros-rest-genericos).
- [Elementos opcionales en tipos tuplas](#elementos-opcionales-en-tipos-tupla).
- [Elementos `rest` en tipos tupla](#rest-elements-in-tuple-types).

Con estas características, es posible tipar fuertemente una serie de funciones de orden superior que transforman funciones y sus listas de parámetros.

### Parámetros `rest` con tipos tupla

Cuando un parámetro `rest` tiene un tipo tupla, el tipo tupla se expande en una secuencia de parámetros discretos.
Por ejemplo, las dos siguientes declaraciones son equivalentes:

```ts
declare function foo(...args: [number, string, boolean]): void;
```

```ts
declare function foo(args_0: number, args_1: string, args_2: boolean): void;
```

### Dispersión de expresiones con tipos tupla

Cuando una llamada de función incluye una expresión de dispersión de un tipo tupla como último argumento, la expresión de dispersión corresponde a una secuencia de argumentos discretos de los tipos de elementos tupla.

Por tanto, las siguientes llamadas son equivalentes:

```ts
const args: [number, string, boolean] = [42, "hello", true];
foo(42, "hello", true);
foo(args[0], args[1], args[2]);
foo(...args);
```

### Parámetros `rest` genéricos

Se permite que un parámetro `rest` tenga un tipo genérico restringido a un tipo de arreglo, y la inferencia de tipos puede inferir tipos tupla para dichos parámetros `rest` genéricos. Esto permite la captura y dispersion de orden superior de listas de parámetros parciales:

##### Ejemplo

```ts
declare function bind<T, U extends any[], V>(
  f: (x: T, ...args: U) => V,
  x: T
): (...args: U) => V;

declare function f3(x: number, y: string, z: boolean): void;

const f2 = bind(f3, 42); // (y: string, z: boolean) => void
const f1 = bind(f2, "hello"); // (z: boolean) => void
const f0 = bind(f1, true); // () => void

f3(42, "hello", true);
f2("hello", true);
f1(true);
f0();
```

En la declaración de `f2` anterior, la inferencia de tipos infiere los tipos `number`, `[string, boolean]` y `void` para `T`, `U` y `V` respectivamente.

Ten en cuenta que cuando un tipo tupla se infiere de una secuencia de parámetros y luego se expande en una lista de parámetros, como es el caso de `U`, los nombres de los parámetros originales se usan en la expansión (sin embargo, los nombres no tienen significado semántico y no son observables de otra manera).

### Elementos opcionales en tipos tupla

Los tipos tupla ahora permiten un `?` posfijo en los tipos de los elementos para indicar que el elemento es opcional:

##### Ejemplo

```ts
let t: [number, string?, boolean?];
t = [42, "hello", true];
t = [42, "hello"];
t = [42];
```

En el modo [`strictNullChecks`](/tsconfig#strictNullChecks), un modificador `?` incluye automáticamente `undefined` en el tipo de elemento, similar a los parámetros opcionales.

Un tipo tupla permite omitir un elemento si tiene un `?` posfijo modificador en su tipo y todos los elementos a la derecha también tienen modificadores `?`.

Cuando se infieren tipos de tupla para parámetros `rest`, los parámetros opcionales en la fuente se convierten en elementos de tupla opcionales en el tipo inferido.

La propiedad `length` de un tipo tupla con elementos opcionales es una unión de tipos literales numéricos que representan las longitudes posibles.
Por ejemplo, el tipo de la propiedad `length` en el tipo tupla `[number, string?, boolean?]` es `1 | 2 | 3`.

### Elementos `rest` en tipos tupla

El último elemento de un tipo tupla puede ser un elemento `rest` de la forma `...X`, donde `X` es un tipo arreglo.
Un elemento `rest` indica que el tipo tupla es abierto y puede tener cero o más elementos adicionales del tipo de elemento arreglo.
Por ejemplo, `[number, ...string[]]` significa tuplas con un elemento `number` seguido de cualquier número de elementos `string`.

##### Ejemplo

```ts
function tuple<T extends any[]>(...args: T): T {
  return args;
}

const numbers: number[] = getArrayOfNumbers();
const t1 = tuple("foo", 1, true); // [string, number, boolean]
const t2 = tuple("bar", ...numbers); // [string, ...number[]]
```

El tipo de la propiedad `length` de un tipo tupla con un elemento `rest` es `number`.

## Nuevo tipo superior `unknown`

*TypeScript 3.0* introduce un nuevo tipo superior `unknown`.
`unknown` es la contraparte de seguridad de tipos de `any`.
Cualquier cosa se puede asignar a `unknown`, pero `unknown` no se puede asignar a nada más que a sí mismo y a `any` sin una aserción de tipo o una reducción basada en el control de flujo.
Del mismo modo, no se permiten operaciones en un `unknown` sin primero acertar o limitar a un tipo más específico.

##### Ejemplo

```ts
// En una intersección todo lo absorbe unknown

type T00 = unknown & null; // null
type T01 = unknown & undefined; // undefined
type T02 = unknown & null & undefined; // null y undefined (que se convierte en never)
type T03 = unknown & string; // string
type T04 = unknown & string[]; // string[]
type T05 = unknown & unknown; // unknown
type T06 = unknown & any; // `any`

// En una unión unknown lo absorbe todo

type T10 = unknown | null; // unknown
type T11 = unknown | undefined; // unknown
type T12 = unknown | null | undefined; // unknown
type T13 = unknown | string; // unknown
type T14 = unknown | string[]; // unknown
type T15 = unknown | unknown; // unknown
type T16 = unknown | any; // `any`

// Tipo variable y unknown en unión e intersección

type T20<T> = T & {}; // T & {}
type T21<T> = T | {}; // T | {}
type T22<T> = T & unknown; // T
type T23<T> = T | unknown; // unknown

// unknown en tipos condicionales

type T30<T> = unknown extends T ? true : false; // Diferido
tipo T31<T> = T extiende unknown? true : false; // Diferido (por lo que lo dispersa)
type T32<T> = never extends T ? true : false; // true
type T33<T> = T extends never ? true : false; // Diferido

// keyof de unknown

type T40 = keyof any; // string | number | symbol
type T41 = keyof unknown; // never

// Solo se permiten operadores de igualdad con unknown

function f10(x: unknown) {
  x == 5;
  x !== 10;
  x >= 0; // Error
  x + 1; // Error
  x * 2; // Error
  -x; // Error
  +x; // Error
}

// Sin accesos a propiedades, accesos a elementos o llamadas a funciones

function f11(x: unknown) {
  x.foo; // Error
  x[5]; // Error
  x(); // Error
  new x(); // Error
}

// predicados typeof, instanceof y de tipo definido por el usuario

declare function isFunction(x: unknown): x is Function;

function f20(x: unknown) {
  if (typeof x === "string" || typeof x === "number") {
    x; // string | number
  }
  if (x instanceof Error) {
    x; // Error
  }
  if (isFunction(x)) {
    x; // Function
  }
}

// Tipo mapeado homomórfico sobre unknown

type T50<T> = { [P in keyof T]: number };
type T51 = T50<any>; // { [x: string]: number }
type T52 = T50<unknown>; // {}

// Todo es asignable a unknown

function f21<T>(pAny: any, pNever: never, pT: T) {
  let x: unknown;
  x = 123;
  x = "hello";
  x = [1, 2, 3];
  x = new Error();
  x = x;
  x = pAny;
  x = pNever;
  x = pT;
}

// unknown asignable sólo a sí mismo y a any

function f22(x: unknown) {
  let v1: any = x;
  let v2: unknown = x;
  let v3: object = x; // Error
  let v4: string = x; // Error
  let v5: string[] = x; // Error
  let v6: {} = x; // Error
  let v7: {} | null | undefined = x; // Error
}

// Tipo de parámetro 'T extends unknown' no relacionado con el objeto

function f23<T extends unknown>(x: T) {
  let y: object = x; // Error
}

// Cualquier cosa menos primitiva asignable a {[x: string]: unknown }

function f24(x: { [x: string]: unknown }) {
  x = {};
  x = { a: 5 };
  x = [1, 2, 3];
  x = 123; // Error
}

// Los locales de tipo unknown siempre se consideran iniciados

function f25() {
  let x: unknown;
  let y = x;
}

// La propagación de unknown resulta ser unknown

function f26(x: {}, y: unknown, z: any) {
  let o1 = { a: 42, ...x }; // { a: number }
  let o2 = { a: 42, ...x, ...y }; // unknown
  let o3 = { a: 42, ...x, ...y, ...z }; // `any`
}

// Las funciones con tipo de retorno unknown no necesitan expresiones de retorno

function f27(): unknown {}

// El tipo `rest` no se puede crear a partir de unknown

function f28(x: unknown) {
  let { ...a } = x; // Error
}

// Las propiedades de clase de tipo unknown no necesitan una asignación definida

class C1 {
  a: string; // Error
  b: unknown;
  c: any;
}
```

## Soporte para `defaultProps` en *JSX*

*TypeScript 2.9* y versiones anteriores no aprovecharon las declaraciones [`defaultProps` de *React*](https://reactjs.org/docs/typechecking-with-proptypes.html#default-prop-values) dentro de los componentes *JSX*.
Los usuarios a menudo tendrían que declarar propiedades opcionales y usar aserciones no nulas dentro de `render`, o usarían aserciones de tipo para corregir el tipo del componente antes de exportarlo.

Las adiciones de *TypeScript 3.0* admiten un nuevo alias de tipo en el espacio de nombres `JSX` llamado `LibraryManagedAttributes`.
Este tipo de ayuda define una transformación en el tipo `Props` del componente, antes de usarlo para verificar una expresión *JSX* dirigida a él; permitiendo así la personalización como: de qué manera se manejan los conflictos entre los accesorios proporcionados y los accesorios inferidos, cómo se mapean las inferencias, cómo se maneja la opcionalidad y cómo se deben combinar las inferencias de diferentes lugares.

En resumen, usando este tipo general, podemos modelar el comportamiento específico de *React* para cosas como `defaultProps` y, hasta cierto punto, `propTypes`.

```tsx
export interface Props {
  name: string;
}

export class Greet extends React.Component<Props> {
  render() {
    const { name } = this.props;
    return <div>Hello ${name.toUpperCase()}!</div>;
  }
  static defaultProps = { name: "world" };
}

// ¡Comprobaciones de tipo! ¡No se necesitan aserciones de tipo!
let el = <Greet />;
```

### Advertencias

#### Tipos explícitos en `defaultProps`

Las propiedades predeterminadas se infieren a partir de el tipo de propiedad `defaultProps`. Si se agrega una anotación de tipo explícita, p. ej. `static defaultProps: Partial<Props>;` el compilador no podrá identificar qué propiedades tienen valores predeterminados (ya que el tipo de `defaultProps` incluye todas las propiedades de `Props`).

Utiliza `static defaultProps: Pick<Props, "name">;` como una anotación de tipo explícita en su lugar, o no agregues una anotación de tipo como se hizo en el ejemplo anterior.

Para los componentes de función sin estado (*CFSE*), utiliza los iniciadores predeterminados de *ES2015* para *CFSE*:

```tsx
function Greet({ name = "world" }: Props) {
  return <div>Hello ${name.toUpperCase()}!</div>;
}
```

##### Cambios en `@types/React`

Aún se necesitan los cambios correspondientes para agregar la definición de `LibraryManagedAttributes` al espacio de nombres `JSX` en `@types/React`.
Ten en cuenta que existen algunas limitaciones.

## `/// <reference lib="..."/>` directivas de referencia

*TypeScript* agrega una nueva directiva de referencia de triple barra (`/// <reference lib="name"/>`), la cual permite que un archivo incluya explícitamente un archivo *lib* incorporado existente.

Los archivos `lib` incorporados se referencian de la misma manera que la opción [`lib`](/tsconfig#lib) del compilador en `tsconfig.json` (por ejemplo, usa `lib="es2015"` y no `lib="lib.es2015.d.ts"`, etc.).

Para los autores de archivos de declaración que se basan en tipos integrados, p. ej. las *API*s del *DOM* o los constructores *JS* incorporados en el entorno de ejecución, como `Symbol` o `Iterable`, se recomiendan las directivas de referencia `lib` de triple barra inclinada. Anteriormente, estos archivos `.d.ts` tenían que agregar declaraciones de reenvío/duplicado de este tipo.

##### Ejemplo

Usar `/// <reference lib="es2017.string"/>` en uno de los archivos de una compilación es equivalente a compilar con `--lib es2017.string`.

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```

## TypeScript 2.9

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

#### Ejemplo

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

#### Ejemplo

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

#### Ejemplo

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

#### Ejemplo

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

#### Ejemplo

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

#### Ejemplo

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

#### Ejemplo

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

## TypeScript 2.8

## Tipos condicionales

*TypeScript 2.8* introduce *tipos condicionales* que agregan la capacidad de expresar asignaciones de tipos no uniformes.
Un tipo condicional selecciona uno de los dos posibles tipos en función de una condición expresada como una prueba de relación de tipo:

```ts
T extends U ? X : Y
```

El tipo anterior significa que cuando `T` es asignable a `U`, el tipo es `X`, de lo contrario, el tipo es `Y`.

Un tipo condicional `T extends U ? X : Y` está *resuelto* a `X` o `Y`, o *diferido* porque la condición depende de una o más variables de tipo.
Si se resuelve o difiere se determina de la siguiente manera:

- Primero, los tipos `T'` y `U'` dados que son instancias de `T` y `U` donde todas las apariciones de parámetros de tipo se reemplazan con `any`, si `T'` no se puede asignar a `U'`, el tipo condicional se resuelve en `Y`. Intuitivamente, si la creación de instancias más permisiva de `T` no es asignable a la creación de instancias más permisiva de `U`, sabemos que ninguna creación de instancia lo será y podemos resolverla a `Y`.
- A continuación, para cada variable de tipo introducida por una declaración `infer` (más adelante) dentro de `U`, recopila un conjunto de tipos candidatos al inferir de `T` a `U` (utilizando el mismo algoritmo de inferencia que la inferencia de tipos para funciones genéricas). Para una determinada variable `V` de tipo `infer`, si alguno de los candidatos se infiere a partir de posiciones covariantes, el tipo inferido para `V` es una unión de esos candidatos. De lo contrario, si algún candidato se infiere de posiciones contravariantes, el tipo inferido para `V` es una intersección de esos candidatos. De lo contrario, el tipo inferido para `V` es `never`.
- Luego, dado un tipo `T''` que es una instanciación de `T` donde todas las variables de tipo `infer` se reemplazan con los tipos inferidos en el paso anterior, si `T''` *definitivamente es asignable* a `U`, el tipo condicional se resuelve en `X`. La relación definitivamente asignable es la misma que la relación asignable regular, excepto que no se consideran las restricciones de tipo variable. Intuitivamente, cuando un tipo es definitivamente asignable a otro tipo, sabemos que será asignable para *todas las instancias* de esos tipos.
- De lo contrario, la condición depende de una o más variables de tipo y el tipo condicional se difiere.

#### Ejemplo

```ts
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type T0 = TypeName<string>; // "string"
type T1 = TypeName<"a">; // "string"
type T2 = TypeName<true>; // "boolean"
type T3 = TypeName<() => void>; "function"
type T4 = TypeName<string[]>; // "object"
```

### Tipos condicionales distributivos

Los tipos condicionales en los que el tipo marcado es un parámetro de tipo desnudo se denominan *tipos condicionales distributivos*.
Los tipos condicionales distributivos se distribuyen automáticamente sobre los tipos unión durante la creación de instancias.
Por ejemplo, la creación de una instancia de `T extends U ? X : Y` con el argumento de tipo `A | B | C` para `T` se resuelve como `(¿A extiende U? X : Y) | (B extiende U ? X : Y) | (C extiende U ? X : Y)`.

#### Ejemplo

```ts
type T10 = TypeName<string | (() => void)>; // "string" | "function"
type T12 = TypeName<string | string[] | undefined>; // "string" | "object" | "undefined"
type T11 = TypeName<string[] | number[]>; // "object"
```

Al crear instancias de un tipo condicional distributivo `T extends U ? X : Y`, las referencias a `T` dentro del tipo condicional se resuelven en constituyentes individuales del tipo unión (es decir, `T` se refiere a los constituyentes individuales *después de* que el tipo condicional se distribuye sobre el tipo unión).
Además, las referencias a `T` dentro de `X` tienen una restricción de parámetro de tipo adicional `U` (es decir, `T` se considera asignable a `U` dentro de `X`).

#### Ejemplo

```ts
type BoxedValue<T> = { value: T };
type BoxedArray<T> = { array: T[] };
type Boxed<T> = T extends any[] ? BoxedArray<T[number]> : BoxedValue<T>;

type T20 = Boxed<string>; // BoxedValue<string>;
type T21 = Boxed<number[]>; // BoxedArray<number>;
type T22 = Boxed<string | number[]>; // BoxedValue<string> | BoxedArray<number>;
```

Observa que `T` tiene la restricción adicional `any[]` dentro de la rama verdadera de `Boxed<T>` y, por lo tanto, es posible referirse al tipo de elemento del arreglo como `T[number]`. Además, observa cómo se distribuye el tipo condicional sobre el tipo unión en el último ejemplo.

La propiedad distributiva de los tipos condicionales se puede utilizar convenientemente para *filtrar* tipos unión:

```ts
type Diff<T, U> = T extends U ? never : T; // Eliminar tipos de T que se pueden asignar a U
type Filter<T, U> = T extends U ? T : never; // Elimina tipos de T que no se pueden asignar a U

type T30 = Diff<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T31 = Filter<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"
type T32 = Diff<string | number | (() => void), Function>; // string | number
type T33 = Filter<string | number | (() => void), Function>; // () => void

type NonNullable<T> = Diff<T, null | undefined>; // Elimina null y undefined de T

type T34 = NonNullable<string | number | undefined>; // string | number
type T35 = NonNullable<string | string[] | null | undefined>; // string | string[]

function f1<T>(x: T, y: NonNullable<T>) {
  x = y; // Bien
  y = x; // Error
}

function f2<T extends string | undefined>(x: T, y: NonNullable<T>) {
  x = y; // Bien
  y = x; // Error
  let s1: string = x; // Error
  let s2: string = y; // Bien
}
```

Los tipos condicionales son particularmente útiles cuando se combinan con los tipos asignados:

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface Part {
  id: number;
  name: string;
  subparts: Part[];
  updatePart(newName: string): void;
}

type T40 = FunctionPropertyNames<Part>; // "updatePart"
type T41 = NonFunctionPropertyNames<Part>; // "id" | "name" | "subparts"
type T42 = FunctionProperties<Part>; // { updatePart(newName: string): void }
type T43 = NonFunctionProperties<Part>; // { id: number, name: string, subparts: Part[] }
```

De manera similar a los tipos unión e intersección, los tipos condicionales no pueden hacer referencia a sí mismos de manera recursiva. Por ejemplo, lo siguiente es un error.

#### Ejemplo

```ts
type ElementType<T> = T extends any[] ? ElementType<T[number]> : T; // Error
```

### Inferencia de tipos en tipos condicionales

Dentro de la cláusula `extend` de un tipo condicional, ahora es posible tener declaraciones `infer` que introducen una variable `type` para inferir.
Dichas variables de tipo inferido se pueden referir en la rama `true` del tipo condicional.
Es posible tener múltiples ubicaciones `infer` para la misma variable de tipo.

Por ejemplo, lo siguiente extrae el tipo de retorno de una función `type`:

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

Los tipos condicionales se pueden anidar para formar una secuencia de coincidencias de patrones que se evalúan en orden:

```ts
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type T0 = Unpacked<string>; // string
type T1 = Unpacked<string[]>; // string
type T2 = Unpacked<() => string>; // string
type T3 = Unpacked<Promise<string>>; // string
type T4 = Unpacked<Promise<string>[]>; // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>; // string
```

El siguiente ejemplo demuestra cómo múltiples candidatos para la misma variable de tipo en posiciones covariantes hacen que se infiera un tipo unión:

```ts
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;
type T10 = Foo<{ a: string; b: string }>; // string
type T11 = Foo<{ a: string; b: number }>; // string | number
```

Del mismo modo, múltiples candidatos para la misma variable de tipo en posiciones contravariantes hacen que se infiera un tipo intersección:

```ts
type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }
  ? U
  : never;
type T20 = Bar<{ a: (x: string) => void; b: (x: string) => void }>; // string
type T21 = Bar<{ a: (x: string) => void; b: (x: number) => void }>; // string & number
```

Cuando se infiere de un tipo con múltiples firmas de llamada (como el tipo de una función sobrecargada), se hacen inferencias a partir de la firma `last` (que, presumiblemente, es el caso general más permisivo).
No es posible realizar una resolución de sobrecarga basada en una lista de tipos de argumentos.

```ts
declare function foo(x: string): number;
declare function foo(x: number): string;
declare function foo(x: string | number): string | number;
type T30 = ReturnType<typeof foo>; // string | number
```

No es posible utilizar declaraciones `infer` en cláusulas de restricción para parámetros de tipo regular:

```ts
type ReturnType<T extends (...args: any[]) => infer R> = R; // Error, no admitido
```

Sin embargo, se puede obtener el mismo efecto borrando las variables de tipo en la restricción y en su lugar especificando un tipo condicional:

```ts
type AnyFunction = (...args: any[]) => any;
type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : any;
```

### Tipos condicionales predefinidos

TypeScript 2.8 agrega varios tipos condicionales predefinidos a `lib.d.ts`:

- `Exclude<T, U>` -- Excluye de `T` aquellos tipos que se pueden asignar a `U`.
- `Extract<T, U>` -- Extrae de `T` los tipos que se pueden asignar a `U`.
- `NonNullable<T>` -- Excluye `null` y `undefined` de `T`.
- `ReturnType<T>` -- Obtiene el tipo de retorno de un tipo `function`.
- `InstanceType<T>` -- Obtiene el tipo de instancia de un tipo `function constructor`a.

#### Ejemplo

```ts
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "b" | "d"
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">; // "a" | "c"

type T02 = Exclude<string | number | (() => void), Function>; // string | number
type T03 = Extract<string | number | (() => void), Function>; // () => void

type T04 = NonNullable<string | number | undefined>; // string | number
type T05 = NonNullable<(() => string) | string[] | null | undefined>; // (() => string) | string[]

function f1(s: string) {
  return { a: 1, b: s };
}

class C {
  x = 0;
  y = 0;
}

type T10 = ReturnType<() => string>; // string
type T11 = ReturnType<(s: string) => void>; // void
type T12 = ReturnType<<T>() => T>; // {}
type T13 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]
type T14 = ReturnType<typeof f1>; // { a: number, b: string }
type T15 = ReturnType<any>; // `any`
type T16 = ReturnType<never>; // `any`
type T17 = ReturnType<string>; // Error
type T18 = ReturnType<Function>; // Error

type T20 = InstanceType<typeof C>; // C
type T21 = InstanceType<any>; // `any`
type T22 = InstanceType<never>; // `any`
type T23 = InstanceType<string>; // Error
type T24 = InstanceType<Function>; // Error
```

> Nota: El tipo `Exclude` es una implementación adecuada del tipo `Diff` sugerida [aquí](https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458). Hemos utilizado el nombre `Exclude` para evitar romper el código existente que define un `Diff`, además creemos que ese nombre transmite mejor la semántica de `type`. No incluimos el tipo `Omit<T, K>` porque está tipado trivialmente como `Pick<T, Exclude<keyof T, K>>`.

## Control mejorado sobre modificadores de tipo asignados

Los tipos asignados admiten la adición de un modificador `readonly` o `?` una propiedad asignada, pero no brindan soporte para la capacidad de *remover* modificadores.
Esto es importante en [*tipos homomórficos mapeados*](https://github.com/Microsoft/TypeScript/pull/12563) que de forma predeterminada conservan los modificadores del tipo subyacente.

*TypeScript 2.8* agrega la capacidad de que un tipo mapeado agregue o elimine un modificador en particular.
Específicamente, un modificador de propiedad `readonly` o `?` en un tipo mapeado ahora puede tener el prefijo `+` o `-` para indicar que el modificador se debe agregar o eliminar.

#### Ejemplo

```ts
type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] }; // Quitar 'readonly' y '?'
type ReadonlyPartial<T> = { +readonly [P in keyof T]+?: T[P] }; // Agregar 'readonly' y '?'
```

Un modificador sin prefijo `+` o `-` es lo mismo que un modificador con un prefijo `+`. Entonces, el tipo `ReadonlyPartial<T>` anterior corresponde a:

```ts
type ReadonlyPartial<T> = { readonly [P in keyof T]?: T[P] }; // Agregar 'readonly' y '?'
```

Usando esta habilidad, `lib.d.ts` ahora tiene un nuevo tipo `Required<T>`.
Este tipo quita los modificadores `?` de todas las propiedades de `T`, por lo que todas las propiedades son necesarias.

#### Ejemplo

```ts
type Required<T> = { [P in keyof T]-?: T[P] };
```

Ten en cuenta que en el modo [`strictNullChecks`](/tsconfig#strictNullChecks), cuando un tipo mapeado homomórfico elimina un modificador `?` de una propiedad en el tipo subyacente, también elimina `undefined` del tipo de esa propiedad:

#### Ejemplo

```ts
type Foo = { a?: string }; // Igual que { a?: string | undefined }
type Bar = Required<Foo>; // Igual que { a: string }
```

## `keyof` mejorado con intersección de tipos

Con *TypeScript 2.8*, `keyof` aplicado a una intersección de tipos se transforma en una unión de `keyof` aplicada a cada constituyente de la intersección.
En otras palabras, los tipos de la forma `keyof(A & B)` se transforman en `keyof A | keyof B`.
Este cambio debería abordar las inconsistencias con la inferencia de las expresiones `keyof`.

#### Ejemplo

```ts
type A = { a: string };
type B = { b: string };

type T1 = keyof (A & B); // "a" | "b"
type T2<T> = keyof (T & B); // keyof T | "b"
type T3<U> = keyof (A & U); // "a" | keyof U
type T4<T, U> = keyof (T & U); // keyof T | keyof U
type T5 = T2<A>; // "a" | "b"
type T6 = T3<B>; // "a" | "b"
type T7 = T4<A, B>; // "a" | "b"
```

## Mejor manejo de patrones de espacio de nombres en archivos `.js`

*TypeScript 2.8* agrega soporte para comprender más patrones de espacio de nombres en archivos `.js`.
Las declaraciones de objetos literales vacíos en el nivel superior, al igual que las funciones y clases, ahora se reconocen como declaraciones de espacio de nombres en *JavaScript*.

```js
var ns = {}; // reconocido como una declaración para un espacio de nombres `ns`
ns.constant = 1; // reconocido como una declaración `constant` para var
```

Las asignaciones en el nivel superior se deben comportar de la misma manera; en otras palabras, no se requiere una declaración `var` o `const`.

```js
app = {}; // NO necesita ser `var app = {}`
app.C = class {};
app.f = function () {};
app.prop = 1;
```

### *IIFE*s como declaraciones de espacio de nombres

Un *IIFE* que devuelve una función, clase u objeto literal vacío, también se reconoce como un espacio de nombres:

```js
var C = (function () {
  function C(n) {
    this.p = n;
  }
  return C;
})();
C.staticProperty = 1;
```

### Declaraciones incumplidas

Las "declaraciones predeterminadas" permiten iniciadores que hacen referencia al nombre declarado en el lado izquierdo de una lógica o:

```js
my = window.my || {};
my.app = my.app || {};
```

### Asignación de prototipos

Puedes asignar un objeto literal directamente a la propiedad del prototipo. Las asignaciones de prototipos individuales también funcionan:

```ts
var C = function (p) {
  this.p = p;
};
C.prototype = {
  m() {
    console.log(this.p);
  },
};
C.prototype.q = function (r) {
  return this.p === r;
};
```

### Declaraciones anidadas y fusionadas

El anidamiento funciona a cualquier nivel ahora y se fusiona correctamente en todos los archivos. Anteriormente tampoco era el caso.

```js
var app = window.app || {};
app.C = class {};
```

## Fábricas *JSX* por archivo

*TypeScript 2.8* agrega soporte para un nombre de fábrica *JSX* configurable por archivo usando el paradigma `@jsx dom`.
*JSX factory* se puede configurar para una compilación usando [`jsxFactory`](/tsconfig#jsxFactory) (el valor predeterminado es `React.createElement`). Con *TypeScript 2.8* puedes redefinir esto por archivo agregando un comentario al principio del archivo.

#### Ejemplo

```ts
/** @jsx dom */
import { dom } from "./renderer";
<h></h>;
```

Genera:

```js
var renderer_1 = require("./renderer");
renderer_1.dom("h", null);
```

## Espacios de nombres *JSX* de ámbito local

La verificación de tipo *JSX* está impulsada por definiciones en un espacio de nombres *JSX*, por ejemplo, `JSX.Element` para el tipo de un elemento *JSX* y `JSX.IntrinsicElements` para elementos integrados.
Antes de *TypeScript 2.8*, se esperaba que el espacio de nombres `JSX` estuviera en el espacio de nombres global y, por lo tanto, solo permitiera definir uno en un proyecto.
A partir de *TypeScript 2.8*, el espacio de nombres `JSX` se buscará debajo del `jsxNamespace` (por ejemplo, `React`), lo que permite múltiples fábricas `jsx` en una compilación.
Para compatibilidad con versiones anteriores, el espacio de nombres global `JSX` se utiliza como respaldo si no se definió ninguno en la función de fábrica.
Combinado con el paradigma por archivo `@jsx`, cada archivo puede tener una fábrica *JSX* diferente.

## Nuevo `--emitDeclarationsOnly`

`--emitDeclarationsOnly` *sólo* permite generar archivos de declaración; la generación de salida `.js`/`.jsx` se omitirá con esta marca. La marca es útil cuando la generación de salida `.js` es manejada por un transpilador diferente como *Babel*.

## TypeScript 2.7

## Propiedades con nombre constante

*TypeScript 2.7* agrega soporte para declarar propiedades con nombre constante en tipos, incluidos los símbolos *ECMAScript*.

#### Ejemplo

```ts
// Lib
export const SERIALIZE = Symbol("serialize-method-key");

export interface Serializable {
  [SERIALIZE](obj: {}): string;
}
```

```ts
// consumidor

import { SERIALIZE, Serializable } from "lib";

class JSONSerializableItem implements Serializable {
  [SERIALIZE](obj: {}) {
    return JSON.stringify(obj);
  }
}
```

Esto también se aplica a literales numéricos y de cadena.

#### Ejemplo

```ts
const Foo = "Foo";
const Bar = "Bar";

let x = {
  [Foo]: 100,
  [Bar]: "hello",
};

let a = x[Foo]; // tiene tipo 'number'
let b = x[Bar]; // tiene tipo 'string'
```

### `unique symbol`

Para permitir el tratamiento de símbolos como literales únicos, está disponible un nuevo tipo `unique symbol`.
El `unique symbol` es un subtipo de `symbol` y se produce únicamente a partir de la llamada a `Symbol()` o `Symbol.for()`, o de anotaciones de tipo explícitas.
El nuevo tipo solo está permitido en declaraciones `const` y propiedades `readonly static`, y para hacer referencia a un símbolo único específico, tendrás que usar el operador `typeof`.
Cada referencia a un `unique symbol` implica una identidad completamente única que está vinculada a una determinada declaración.

#### Ejemplo

```ts
// ¡Funciona!
declare const Foo: unique symbol;

// ¡Error! 'Bar' no es una constante.
let Bar: unique symbol = Symbol();

// ¡Funciona! - se refiere a un símbolo único, pero su identidad está ligada a 'Foo'.
let Baz: typeof Foo = Foo;

// También funciona.
class C {
  static readonly StaticSymbol: unique symbol = Symbol();
}
```

Debido a que cada `unique symbol` tiene una identidad completamente separada, no hay dos tipos de `unique symbol` asignables o comparables entre sí.

#### Ejemplo

```ts
const Foo = Symbol();
const Bar = Symbol();

// Error: no se pueden comparar dos símbolos únicos.
if (Foo === Bar) {
  // ...
}
```

## Iniciación de clase estricta

*TypeScript 2.7* introduce una nueva marca llamada [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization).
Este indicador realiza comprobaciones para garantizar que cada propiedad de instancia de una clase se inicie en el cuerpo del constructor o mediante un iniciador de propiedad.
Por ejemplo

```ts
class C {
  foo: number;
  bar = "hello";
  baz: boolean;
  //  ~~~
  //  ¡Error! La propiedad 'baz' no tiene iniciador y definitivamente no está asignada en el
  //         constructor.

  constructor() {
    this.foo = 42;
  }
}
```

En lo anterior, si realmente queríamos que `baz` potencialmente fuera `undefined`, deberíamos haberlo declarado con el tipo `boolean | undefined`.

Hay ciertos escenarios en los que las propiedades se pueden iniciar indirectamente (tal vez mediante un método auxiliar o una biblioteca de inyección de dependencias), en cuyo caso puedes usar los nuevos *modificadores de aserción de asignación definida* para tus propiedades (que se describen a continuación).

```ts
class C {
  foo!: number;
  // ^
  // Nota este '!' modificador.
  // Esta es la "aserción de asignación definida"

  constructor() {
    this.initialize();
  }

  initialize() {
    this.foo = 0;
  }
}
```

Ten en cuenta que [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization) se activará junto con otros indicadores de modo [`strict`](/tsconfig#strict), que pueden afectar tu proyecto.
Puedes establecer la configuración de [`strictPropertyInitialization`](/tsconfig#strictPropertyInitialization) en `false` en las `compilerOptions` de tu `tsconfig.json`, o en `--strictPropertyInitialization false` en la línea de comandos para desactivar esta comprobación.

## Aserciones de asignaciones definidas

La aserción de asignación definida es una característica que permite colocar un `!` después de la propiedad de instancia y las declaraciones de variables para transmitir a *TypeScript* que una variable está efectivamente asignada para todos los propósitos, incluso si los análisis de *TypeScript* no lo pueden detectar.

Por ejemplo:

```ts
let x: number;
initialize();
console.log(x + x);
//          ~   ~
// ¡Error! La variable 'x' se usa antes de ser asignada.

function initialize() {
  x = 10;
}
```

Con aserciones de asignación definidas, podemos acertar que `x` realmente se asigna agregando un `!` a su declaración:

```ts
// Observa el '!'
let x!: number;
initialize();

// ¡No hay error!
console.log(x + x);

function initialize() {
  x = 10;
}
```

En cierto sentido, el operador de aserción de asignación definida es el dual del operador de aserción no nula (en la que *expresiones* se fijan posteriormente con un `!`), que también podríamos haber usado en el ejemplo.

```ts
let x: number;
initialize();

// ¡No hay error!
console.log(x! + x!);

function initialize() {
    x = 10;
}
```

En nuestro ejemplo, sabíamos que todos los usos de `x` se inician, por lo que tiene más sentido usar aserciones de asignación definidas que aserciones no nulas.

## Tuplas de longitud fija

En *TypeScript 2.6* y versiones anteriores, `[number, string, string]` se consideraba un subtipo de `[number, string]`.
Esto fue motivado por la naturaleza estructural de *TypeScript*; el primer y segundo elementos de un `[number, string, string]` son respectivamente subtipos del primero y segundo elementos de `[number, string]`.
Sin embargo, después de examinar el uso de tuplas en el mundo real, notamos que la mayoría de las situaciones en las que esto estaba permitido normalmente eran indeseables.

En *TypeScript 2.7*, las tuplas de diferentes aridades ya no se pueden asignar entre sí.
Gracias a una solicitud de extracción de [Kiara Grouwstra](https://github.com/KiaraGrouwstra), los tipos de tuplas ahora codifican su aridad en el tipo de su respectiva propiedad de `length`.
Esto se logra aprovechando los tipos literales numéricos, que ahora permiten que las tuplas sean distintas de las tuplas de diferentes aridades.

Conceptualmente, podrías considerar que el tipo `[number, string]` es equivalente a la siguiente declaración de `NumStrTuple`:

```ts
interface NumStrTuple extends Array<number | string> {
  0: number;
  1: string;
  length: 2; // usando el tipo literal numérico '2'
}
```

Ten en cuenta que este es un cambio importante para algún código.
Si necesitas recurrir al comportamiento original en el que las tuplas solo imponen una longitud mínima, puedes usar una declaración similar que no defina explícitamente una propiedad `length`, volviendo a `number`.

```ts
interface MinimumNumStrTuple extends Array<number | string> {
  0: number;
  1: string;
}
```

Ten en cuenta que esto no implica que las tuplas representen arreglos inmutables, pero es una convención implícita.

## Inferencia de tipo mejorada para literales de objetos

*TypeScript 2.7* mejora la inferencia de tipos para múltiples literales de objetos que ocurren en el mismo contexto.
Cuando varios tipos de literales de objetos contribuyen a un tipo unión, ahora *normalizamos* los tipos literales de objetos de manera que todas las propiedades estén presentes en cada constituyente del tipo unión.

Considera:

```ts
const obj = test ? { text: "hello" } : {}; // { text: string } | { text?: undefined }
const s = obj.text; // string | undefined
```

Anteriormente, el tipo `{}` se infirió para `obj` y, posteriormente, la segunda línea provocó un error porque `obj` parecería no tener propiedades.
Eso obviamente, no fue lo ideal.

#### Ejemplo

```ts
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = [{ a: 1, b: 2 }, { a: "abc" }, {}][0];
obj.a; // string | number | undefined
obj.b; // number | undefined
```

Las inferencias de tipo literal de objeto múltiple para el mismo parámetro de tipo se contraen de manera similar en un solo tipo de unión normalizada:

```ts
declare function f<T>(...items: T[]): T;
// let obj: { a: number, b: number } |
//     { a: string, b?: undefined } |
//     { a?: undefined, b?: undefined }
let obj = f({ a: 1, b: 2 }, { a: "abc" }, {});
obj.a; // string | number | undefined
obj.b; // number | undefined
```

## Manejo mejorado de clases estructuralmente idénticas y expresiones `instanceof`

*TypeScript 2.7* mejora el manejo de clases estructuralmente idénticas en tipos unión y expresiones `instanceof`:

- Los tipos de clase estructuralmente idénticos, pero distintos, ahora se conservan en tipos unión (en lugar de eliminar todos menos uno).
- La reducción de subtipos del tipo unión solo elimina un tipo de clase si es una subclase de *y* deriva de otro tipo de clase en la unión.
- La comprobación de tipo del operador `instanceof` ahora se basa en si el tipo del operando izquierdo *deriva de* el tipo indicado por el operando derecho (a diferencia de una comprobación de subtipo estructural).

Esto significa que los tipos de unión e `instanceof` distinguen correctamente entre clases estructuralmente idénticas.

#### Ejemplo:

```ts
class A {}
class B extends A {}
class C extends A {}
class D extends A {
  c: string;
}
class E extends D {}

let x1 = !true ? new A() : new B(); // A
let x2 = !true ? new B() : new C(); // B | C (previously B)
let x3 = !true ? new C() : new D(); // C | D (previously C)

let a1 = [new A(), new B(), new C(), new D(), new E()]; // A[]
let a2 = [new B(), new C(), new D(), new E()]; // (B | C | D)[] (previously B[])

function f1(x: B | C | D) {
  if (x instanceof B) {
    x; // B (previously B | D)
  } else if (x instanceof C) {
    x; // C
  } else {
    x; // D (previously never)
  }
}
```

## Guardias de tipo inferidos desde el operador `in`

El operador `in` ahora actúa como una expresión restrictiva para los tipos.

Para una expresión `n in x`, donde `n` es un tipo cadena literal o literal de cadena y `x` es un tipo unión, la rama `"true"` se restringe a tipos que tienen una propiedad `n` opcional o requerida, y la rama `"false"` se restringe a tipos que tienen una propiedad `n` opcional o faltante.

#### Ejemplo

```ts
interface A {
  a: number;
}
interface B {
  b: string;
}

function foo(x: A | B) {
  if ("a" in x) {
    return x.a;
  }
  return x.b;
}
```

## Soporte para `import d from "cjs"` de módulos *CommonJS* con `--esModuleInterop`

*TypeScript 2.7* actualiza la emisión del módulo *CommonJS*/*AMD*/*UMD* para sintetizar registros de espacio de nombres en función de la presencia de un indicador `__esModule` en [`esModuleInterop`](/tsconfig#esModuleInterop).
El cambio acerca la salida generada de *TypeScript* a la generada por *Babel*.

Anteriormente, los módulos *CommonJS*/*AMD*/*UMD* se trataban de la misma manera que los módulos *ES6*, lo que generaba un par de problemas. A saber:

- *TypeScript* trata una importación de espacio de nombres (es decir, `import * as foo from "foo"`) para un módulo *CommonJS*/*AMD*/*UMD* como equivalente a `const foo = require("foo")`.
  Las cosas son simples aquí, pero no funcionan si el objeto principal que se está importando es un primitivo, una clase o una función.
  La especificación *ECMAScript* estipula que un registro de espacio de nombres es un objeto simple y que una importación de espacio de nombres (`foo` en el ejemplo anterior) no es invocable, aunque *TypeScript* lo permite

- De manera similar, una importación predeterminada (es decir, `import d from "foo"`) para un módulo *CommonJS*/*AMD*/*UMD* como equivalente a `const d = require("foo").default`.
  La mayoría de los módulos *CommonJS*/*AMD*/*UMD* disponibles en la actualidad no tienen una exportación `default`, lo que hace que este patrón de importación sea prácticamente inutilizable para importar módulos que no son de *ES* (es decir, *CommonJS*/*AMD*/*UMD*). Por ejemplo, `import fs from "fs"` o `import express from "express"` no están permitidos.

Bajo el nuevo [`esModuleInterop`](/tsconfig#esModuleInterop) se deben abordar estos dos problemas:

- Una importación de espacio de nombres (es decir, `import * as foo from "foo"`) ahora está correctamente marcado como no calculable. Llamarlo resultará en un error.
- Las importaciones predeterminadas a *CommonJS*/*AMD*/*UMD* ahora están permitidas (por ejemplo, `import fs from "fs"`) y deberían funcionar como se esperaba.

> Nota: El nuevo comportamiento se agrega bajo una bandera para evitar interrupciones injustificadas en las bases de código existentes. Recomendamos encarecidamente aplicarlo tanto a proyectos nuevos como existentes.
> Para proyectos existentes, importaciones de espacio de nombres (`import * as express from "express"; express();`) deberá convertirse a importaciones predeterminadas (`import express from "express"; express();`).

#### Ejemplo

Con [`esModuleInterop`](/tsconfig#esModuleInterop) se generan dos nuevos ayudantes `__importStar` y `__importDefault` para importar `*` e importar `default` respectivamente.
Por ejemplo, ingresa como:

```ts
import * as foo from "foo";
import b from "bar";
```

Generará:

```js
"use strict";
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var foo = __importStar(require("foo"));
var bar_1 = __importDefault(require("bar"));
```

## Separadores numéricos

*TypeScript 2.7* ofrece soporte para [Separadores numéricos *ES*](https://github.com/tc39/proposal-numeric-separator).
Los literales numéricos ahora se pueden separar en segmentos usando `_`.

##### Ejemplo

```ts
const milion = 1_000_000;
const phone = 555_734_2231;
const bytes = 0xff_0c_00_ff;
const word = 0b1100_0011_1101_0001;
```

## Salida más limpia en modo `--watch`

El modo `--watch` de *TypeScript* ahora borra la pantalla después de que se solicita una recompilación.

## Salida `--pretty` más bonita

El indicador [`pretty`](/tsconfig#pretty) de *TypeScript* puede hacer que los mensajes de error sean más fáciles de leer y administrar.
[`pretty`](/tsconfig#pretty) ahora usa colores para nombres de archivos, códigos de diagnóstico y números de línea.
Los nombres de archivo y las posiciones ahora también están formateados para permitir la navegación en terminales comunes (por ejemplo, terminal de *Visual Studio Code*).

## TypeScript 2.6

## Tipos de funciones estrictas

*TypeScript 2.6* introduce una nueva marca de verificación estricta, [`strictFunctionTypes`](/tsconfig#strictFunctionTypes).
El modificador [`strictFunctionTypes`](/tsconfig#strictFunctionTypes) es parte de la familia de modificadores [`strict`](/tsconfig#strict), lo cual significa que por omisión está activado en modo [`strict`](/tsconfig#strict).
Puedes optar por no participar configurando `--strictFunctionTypes false` en tu línea de comandos o en tu `tsconfig.json`.

En [`StrictFunctionTypes`](/tsconfig#StrictFunctionTypes), las posiciones de los parámetros del tipo de función se comprueban *contrariamente* en lugar de *bivariadamente*.
Para conocer algunos antecedentes sobre lo que significa la varianza para los tipos de función, consulta [¿Qué son la covarianza y la contravarianza?](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance).

La comprobación más estricta se aplica a todos los tipos de funciones, *excepto* las que se originan en declaraciones de métodos o constructores.
Los métodos se excluyen específicamente para garantizar que las clases e interfaces genéricas (como `Array<T>`) continúen relacionándose principalmente de forma covariable.

Considera el siguiente ejemplo en el que `Animal` es el supertipo de `Dog` y `Cat`:

```ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
declare let f3: (x: Cat) => void;
f1 = f2; // Error con --strictFunctionTypes
f2 = f1; // Bien
f2 = f3; // Error
```

La primera asignación, de manera predeterminada, está permitida en el modo de comprobación de tipos, pero marcada como un error en el modo de tipos de funciones estrictas.
Intuitivamente, el modo predeterminado permite la asignación porque *posiblemente* es sólido, mientras que el modo de tipos de función estricta lo convierte en un error porque *probablemente* no es sólido.
En cualquier modo, la tercera asignación es un error porque *nunca* suena.

Otra forma de describir el ejemplo es que el tipo `(x: T) => void` es *bivariante* (es decir, covariante *o* contravariante) para `T` en el modo de verificación de tipo predeterminado, pero *contravariante* para `T` en el modo de tipos de función estrictos.

#### Ejemplo

```ts
interface Comparer<T> {
  compare: (a: T, b: T) => number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer; // Error
dogComparer = animalComparer; // Bien
```

La primera asignación ahora es un error. Efectivamente, `T` es contravariante en `Comparer<T>` porque se usa solo en posiciones de parámetros de tipo `function`.

Por cierto, ten en cuenta que mientras que algunos lenguajes (por ejemplo, *C#* y *Scala*) requieren anotaciones de varianza (`out`/`in` o `+`/`-`), la varianza surge naturalmente del uso real de un parámetro de tipo dentro de un tipo genérico debido al sistema de tipos estructurales de *TypeScript*.

#### Nota:

En [`StrictFunctionTypes`](/tsconfig#StrictFunctionTypes) la primera asignación aún está permitida si `compare` se declaró como un método.
Efectivamente, `T` es bivariante en `Comparer<T>`porque se usa solo en las posiciones de los parámetros del método.

```ts
interface Comparer<T> {
  compare(a: T, b: T): number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer; // Bien debido a la bivariancia
dogComparer = animalComparer; // Bien
```

*TypeScript 2.6* también mejora la inferencia de tipos que involucran posiciones contravariantes:

```ts
function combine<T>(...funcs: ((x: T) => void)[]): (x: T) => void {
  return (x) => {
    for (const f of funcs) f(x);
  };
}

function animalFunc(x: Animal) {}
function dogFunc(x: Dog) {}

let combined = combine(animalFunc, dogFunc); // (x: Dog) => void
```

Arriba, todas las inferencias para "T" se originan en posiciones contravariantes y, por lo tanto, inferimos el *subtipo común más común* para `T`.
Esto contrasta con las inferencias de posiciones covariantes, donde inferimos el *mejor supertipo común*.

## Soporte para la sintaxis de fragmentos *JSX*

*TypeScript 2.6.2* agrega soporte para la nueva sintaxis `<>...</>` para fragmentos en *JSX*.
Frecuentemente, es deseable devolver varios hijos de un componente.
Sin embargo, esto no es válido, por lo que el enfoque habitual ha sido envolver el texto en un elemento adicional, como un `<div>` o `<span>` como se muestra a continuación.

```tsx
render() {
    return (
        <div>
            Algún texto.
            <h2>Un título</h2>
            Más texto.
        </div>
    );
}
```

Para abordar este patrón, *React* introdujo el componente `React.Fragment`, que proporciona una forma dedicada de envolver dichos elementos sin agregar un elemento al *DOM*.
En consecuencia, se agregó la sintaxis `<>...</>` a *JSX* para facilitar esta nueva construcción. Por lo tanto, el escenario anterior se convierte en:

```tsx
render() {
    return (
        <>
            Algún texto.
            <h2>Un título</h2>
            Más texto.
        </>
    );
}
```

En `--jsx preserve`, la nueva sintaxis no se modifica para la emisión de *TypeScript*. De lo contrario, para `--jsx react`, `<>...</>` se compila en `React.createElement(React.Fragment, null, ...)`, donde `React.createElement` respeta [`jsxFactory`](/tsconfig#jsxFactory).
Ten en cuenta que es un error usar `<>...</>` cuando `--jsx react` y [`jsxFactory`](/tsconfig#jsxFactory) están habilitados.

Consulta [el blog de *React*](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html) para obtener más detalles sobre los fragmentos y la nueva sintaxis.

## Caché de objetos de plantilla etiquetados en módulos

*TypeScript 2.6* corrige la emisión de la cadena de plantilla etiquetada para alinearse mejor con la especificación *ECMAScript*.
Según la [especificación *ECMAScript*](https://tc39.github.io/ecma262/#sec-gettemplateobject), cada vez que se evalúa una etiqueta de plantilla, el objeto de cadenas de plantilla `same` (el mismo `TemplateStringsArray`) se debe pasar como el primer argumento.
Antes de *TypeScript 2.6*, la salida generada era un objeto de plantilla completamente nuevo cada vez.
Aunque el contenido de la cadena es el mismo, esta emisión afecta a las bibliotecas que utilizan la identidad de la cadena para fines de invalidación de caché, p. ej. [`lit-html`](https://github.com/PolymerLabs/lit-html/issues/58).

#### Ejemplo

```ts
export function id(x: TemplateStringsArray) {
  return x;
}

export function templateObjectFactory() {
  return id`hello world`;
}

let result = templateObjectFactory() === templateObjectFactory(); // true en TS 2.6
```

Resultados en el siguiente código generado:

```js
"use strict";
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, "raw", { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };

function id(x) {
  return x;
}

var _a;
function templateObjectFactory() {
  return id(
    _a || (_a = __makeTemplateObject(["hello world"], ["hello world"]))
  );
}

var result = templateObjectFactory() === templateObjectFactory();
```

> Nota: Este cambio trae un nuevo asistente de emisión, `__makeTemplateObject`;
> si estás utilizando [`importHelpers`](/tsconfig#importHelpers) con [`tslib`](https://github.com/Microsoft/tslib), una actualización a la versión 1.8 o posterior.

## Diagnóstico localizado en la línea de comandos

El paquete *TypeScript 2.6* `npm` se envía con versiones localizadas de mensajes de diagnóstico para 13 idiomas.
Los mensajes localizados están disponibles cuando se usa el indicador `--locale` en la línea de comandos.

#### Ejemplo

Mensajes de error en ruso:

```sh
c:\ts>tsc --v
Version 2.6.0-dev.20171003

c:\ts>tsc --locale ru --pretty c:\test\a.ts

../test/a.ts(1,5): error TS2322: Тип ""string"" не может быть назначен для типа "number".

1 var x: number = "string";
      ~
```

Y ayuda en japonés:

```sh
PS C:\ts> tsc --v
Version 2.6.0-dev.20171003

PS C:\ts> tsc --locale ja-jp
バージョン 2.6.0-dev.20171003
構文: tsc [オプション] [ファイル ...]

例:  tsc hello.ts
    tsc --outFile file.js file.ts
    tsc @args.txt

オプション:
 -h, --help                                 このメッセージを表示します。
 --all                                      コンパイラ オプションをすべて表示します。
 -v, --version                              コンパイラのバージョンを表示します。
 --init                                     TypeScript プロジェクトを初期化して、tsconfig.json ファイルを作成します。
 -p ファイルまたはディレクトリ, --project ファイルまたはディレクトリ  構成ファイルか、'tsconfig.json' を含むフォルダーにパスが指定されたプロジェクトをコ
ンパイルします。
 --pretty                                   色とコンテキストを使用してエラーとメッセージにスタイルを適用します (試験的)。
 -w, --watch                                入力ファイルを監視します。
 -t バージョン, --target バージョン                   ECMAScript のターゲット バージョンを指定します: 'ES3' (既定)、'ES5'、'ES2015'、'ES2016'、'ES2017'、'ES
NEXT'。
 -m 種類, --module 種類                         モジュール コード生成を指定します: 'none'、'commonjs'、'amd'、'system'、'umd'、'es2015'、'ESNext'。
 --lib                                      コンパイルに含めるライブラリ ファイルを指定します:
                                              'es5' 'es6' 'es2015' 'es7' 'es2016' 'es2017' 'esnext' 'dom' 'dom.iterable' 'webworker' 'scripthost' 'es201
5.core' 'es2015.collection' 'es2015.generator' 'es2015.iterable' 'es2015.promise' 'es2015.proxy' 'es2015.reflect' 'es2015.symbol' 'es2015.symbol.wellkno
wn' 'es2016.array.include' 'es2017.object' 'es2017.sharedmemory' 'es2017.string' 'es2017.intl' 'esnext.asynciterable'
 --allowJs                                  javascript ファイルのコンパイルを許可します。
 --jsx 種類                                   JSX コード生成を指定します: 'preserve'、'react-native'、'react'。
 -d, --declaration                          対応する '.d.ts' ファイルを生成します。
 --sourceMap                                対応する '.map' ファイルを生成します。
 --outFile ファイル                             出力を連結して 1 つのファイルを生成します。
 --outDir ディレクトリ                            ディレクトリへ出力構造をリダイレクトします。
 --removeComments                           コメントを出力しないでください。
 --noEmit                                   出力しないでください。
 --strict                                   strict 型チェックのオプションをすべて有効にします。
 --noImplicitAny                            暗黙的な 'any' 型を含む式と宣言に関するエラーを発生させます。
 --strictNullChecks                         厳格な null チェックを有効にします。
 --noImplicitThis                           暗黙的な 'any' 型を持つ 'this' 式でエラーが発生します。
 --alwaysStrict                             厳格モードで解析してソース ファイルごとに "use strict" を生成します。
 --noUnusedLocals                           使用されていないローカルに関するエラーを報告します。
 --noUnusedParameters                       使用されていないパラメーターに関するエラーを報告します。
 --noImplicitReturns                        関数の一部のコード パスが値を返さない場合にエラーを報告します。
 --noFallthroughCasesInSwitch               switch ステートメントに case のフォールスルーがある場合にエラーを報告します。
 --types                                    コンパイルに含む型宣言ファイル。
 @<ファイル>
```

## Suprime errores en archivos `.ts` usando comentarios '//@ts-ignore'

*TypeScript 2.6* admite la supresión de errores en archivos `.js` usando comentarios `//@ ts-ignore` colocados encima de las líneas ofensivas.

#### Ejemplo

```ts
if (false) {
  // @ts-ignore: Error de código inalcanzable
  console.log("hello");
}
```

Un comentario `//@ts-ignore` suprime todos los errores que se originan en la siguiente línea.
Es una práctica recomendada que el resto del comentario que sigue a `@ts-ignore` explique qué error se está suprimiendo.

Ten en cuenta que este comentario solo suprime el informe de errores y te recomendamos que utilices este comentario *con moderación*.

## `tsc --watch` más rápido

*TypeScript 2.6* trae una implementación más rápida de `--watch`.
La nueva versión optimiza la generación de código y la verificación de código base utilizando módulos `ES`.
Los cambios detectados en un archivo de módulo darán como resultado regenerar *solo* el módulo modificado y los archivos que dependen de él, en lugar de todo el proyecto.
Los proyectos con una gran cantidad de archivos se deberían beneficiar al máximo de este cambio.

La nueva implementación también trae mejoras de rendimiento a la visualización en `tsserver`.
La lógica del observador se ha reescrito por completo para responder más rápido a los eventos de cambio.

## Las referencias de solo escritura ahora están marcadas como no utilizadas

*TypeScript 2.6* agrega la implementación revisada de [`noUnusedLocals`](/tsconfig#noUnusedLocals) y [`noUnusedParameters`](/tsconfig#noUnusedParameters) [opciones del compilador](/docs/handbook/compiler-options.html).
Las declaraciones solo se escriben pero nunca se leen desde ahora están marcadas como no utilizadas.

#### Ejemplo

A continuación, tanto `n` como `m` se marcarán como no utilizados, porque sus valores nunca se leen. Anteriormente, *TypeScript* solo verificaba si sus valores estaban *referenciados*.

```ts
function f(n: number) {
  n = 0;
}

class C {
  private m: number;
  constructor() {
    this.m = 0;
  }
}
```

Además, las funciones que solo se llaman dentro de sus propios cuerpos se consideran no utilizadas.

#### Ejemplo

```ts
function f() {
  f(); // Error: Se declara 'f' pero su valor nunca se lee
}
```

## TypeScript 2.5

## Variables opcionales de cláusula `catch`

Gracias al trabajo realizado por [`@tinganho`](https://github.com/tinganho), *TypeScript 2.5* implementa una nueva función *ECMAScript* que permite a los usuarios omitir la variable en las cláusulas `catch`.
Por ejemplo, al usar `JSON.parse`, es posible que debas envolver las llamadas a la función con un `try`/`catch`, pero es posible que no termines usando el `SyntaxError` que aparece cuando la entrada es errónea.

```ts
let input = "...";
try {
  JSON.parse(input);
} catch {
  // ^ Observa que nuestra cláusula `catch` no declara una variable.
  console.log("Invalid JSON given\n\n" + input);
}
```

## Escribe la sintaxis de aserción/transmisión en el modo `checkJs`/`@ts-check`

*TypeScript 2.5* introduce la capacidad de [acertar el tipo de expresiones cuando se usa *JavaScript* simple en tus proyectos](https://github.com/Microsoft/TypeScript/issues/5158).
La sintaxis es un comentario `/**@type {...} */` de anotación seguido de una expresión entre paréntesis cuyo tipo se necesita reevaluar.
Por ejemplo:

```ts
var x = /** @type {SomeType} */ AnyParenthesizedExpression;
```

## Paquetes duplicados y redirigidos

Al importar usando la estrategia de resolución del módulo `Node` en *TypeScript 2.5*, el compilador ahora verificará si los archivos se originan en paquetes "idénticos".
Si un archivo se origina en un paquete con un `package.json` que contiene los mismos campos de `name` y `versión` que un paquete encontrado anteriormente, *TypeScript* se redirigirá al paquete superior.
Esto ayuda a resolver problemas donde dos paquetes pueden contener declaraciones de clases idénticas, pero que contienen miembros `private` que hacen que sean estructuralmente incompatibles.

Como una buena ventaja, esto también puede reducir la huella de memoria y el entorno de ejecución del compilador y el servicio de lenguaje al evitar cargar archivos `.d.ts` de paquetes duplicados.

## La bandera del compilador `--preserveSymlinks`

*TypeScript 2.5* trae el indicador [`preserveSymlinks`](/tsconfig#preserveSymlinks), que es paralelo al comportamiento de [el indicador `--preserve-symlinks` en *Node.js*](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
Esta bandera también exhibe el comportamiento opuesto a la opción `resolve.symlinks` de *Webpack* (es decir, configurando [`preserveSymlinks`](/tsconfig#preserveSymlinks) de *TypeScript* en `true` paralelos configurando `resolve.symlinks` de *Webpack* en `false`, y viceversa al revés).

En este modo, las referencias a módulos y paquetes (por ejemplo, las directivas `import`s y `/// <reference type = "..." />`) se resuelven en relación con la ubicación del archivo de enlace simbólico, en lugar de relativo a la ruta a la que se resuelve el enlace simbólico.
Para un ejemplo más concreto, nos remitiremos a [la documentación en el sitio web de *Node.js*](https://nodejs.org/api/cli.html#cli_preserve_symlinks).

## TypeScript 2.4

## Expresiones de importación dinámica

Las expresiones `import` dinámicas son una característica nueva y parte de *ECMAScript* que permite a los usuarios solicitar de forma asincrónica un módulo en cualquier punto arbitrario de tu programa.

Esto significa que puedes importar de forma condicional y diferida otros módulos y bibliotecas.
Por ejemplo, aquí hay una función `async` que solo importa una biblioteca de utilidades cuando es necesaria:

```ts
async function getZipFile(name: string, files: File[]): Promise<File> {
  const zipUtil = await import("./utils/create-zip-file");
  const zipContents = await zipUtil.getContentAsBlob(files);
  return new File(zipContents, name);
}
```

Muchos paquetes tienen soporte para dividir automáticamente paquetes de salida basados ​​en estas expresiones `import`, así que considera usar esta nueva característica con el destino del módulo `esnext`.

## Enumeraciones `string`

*TypeScript 2.4* ahora permite que los miembros de enumeración contengan iniciadores de cadena.

```ts
enum Colors {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
```

La advertencia es que las enumeraciones iniciadas con cadena no se pueden asignar de forma inversa para obtener el nombre del miembro de la enumeración original.
En otras palabras, no puede escribir `Colors["RED"]` para obtener la cadena `"Red"`.

## Inferencia mejorada para genéricos

*TypeScript 2.4* introduce algunos cambios maravillosos en la forma en que se infieren los genéricos.

### Tipos de retorno como objetivos de inferencia

Por un lado, *TypeScript* ahora puedes hacer inferencias para el tipo de retorno de una llamada.
Esto puede mejorar tu experiencia y detectar errores.
Algo que ahora funciona:

```ts
function arrayMap<T, U>(f: (x: T) => U): (a: T[]) => U[] {
  return (a) => a.map(f);
}

const lengths: (a: string[]) => number[] = arrayMap((s) => s.length);
```

Como ejemplo de nuevos errores, puedes detectar como resultado:

```ts
let x: Promise<string> = new Promise((resolve) => {
  resolve(10);
  //      ~~ Error!
});
```

### Inferencia de parámetros de tipo a partir de tipos contextuales

Antes de *TypeScript 2.4*, en el siguiente ejemplo

```ts
let f: <T>(x: T) => T = (y) => y;
```

`y` tendría el tipo `any`.
Esto significaba que el programa verificaría el tipo, pero técnicamente podría hacer cualquier cosa con `y`, como lo siguiente:

```ts
let f: <T>(x: T) => T = (y) => y() + y.foo.bar;
```

Ese último ejemplo no es realmente seguro para los tipos.

En *TypeScript 2.4*, la función del lado derecho implícitamente *gana* parámetros de tipo, y se infiere que `y` tiene el tipo de ese parámetro de tipo.

Si usas `y` de una manera que la restricción del parámetro de tipo no es compatible, obtendrás correctamente un error.
En este caso, la restricción de `T` era (implícitamente) `{}`, por lo que el último ejemplo fallará apropiadamente.

### Comprobación más estricta de funciones genéricas

*TypeScript* ahora intenta unificar el tipo de los parámetros al comparar dos tipos de firma única.
Como resultado, obtendrás controles más estrictos al relacionar dos firmas genéricas y puede detectar algunos errores.

```ts
type A = <T, U>(x: T, y: U) => [T, U];
type B = <S>(x: S, y: S) => [S, S];

function f(a: A, b: B) {
  a = b; // Error
  b = a; // Bien
}
```

## Contravarianza estricta para los parámetros de devolución de llamada

*TypeScript* siempre ha comparado parámetros de forma bivariante.
Hay varias razones para esto, pero en general, esto no fue un gran problema para nuestros usuarios hasta que vimos algunos de los efectos adversos que tuvo con `Promise`s y `Observable`s.

*TypeScript 2.4* introduce esto más estricto cuando se relacionan dos tipos de devolución de llamada. Por ejemplo:

```ts
interface Mappable<T> {
  map<U>(f: (x: T) => U): Mappable<U>;
}

declare let a: Mappable<number>;
declare let b: Mappable<string | number>;

a = b;
b = a;
```

Antes de *TypeScript 2.4*, este ejemplo tendría éxito.
Al relacionar los tipos `map`, *TypeScript* relacionaría bidireccionalmente sus parámetros (es decir, el tipo de `f`).
Al relacionar cada `f`, *TypeScript* también relacionaría bidireccionalmente el tipo de *esos* parámetros.

Al relacionar el tipo `map` en *TS 2.4*, el lenguaje verificará si cada parámetro es un tipo de devolución de llamada y, de ser así, se asegurará de que esos parámetros se verifiquen de manera contravariante con respecto a la relación actual.

En otras palabras, *TypeScript* ahora detecta el error anterior, que puede ser un cambio importante para algunos usuarios, pero será de gran ayuda.

## Detección débil de tipo

*TypeScript 2.4* introduce el concepto de "tipos débiles".
Cualquier tipo que no contenga nada más que un conjunto de propiedades totalmente opcionales se considera *débil*.
Por ejemplo, este tipo de `Opciones` es un tipo débil:

```ts
interface Options {
  data?: string;
  tiempoTerminado?: number;
  maxRetries?: number;
}
```

En *TypeScript 2.4*, ahora es un error asignar algo a un tipo débil cuando no hay superposición en las propiedades.
Por ejemplo:

```ts
function sendMessage(options: Options) {
  // ...
}

const opts = {
  payload: "hello world!",
  retryOnFail: true,
};

// ¡Error!
sendMessage(opts);
// No hay superposición entre el tipo de 'opts' y 'Options' en sí.
// Quizás queríamos usar 'data'/ 'maxRetries' en lugar de 'payload'/ 'retryOnFail'.
```

Puedes pensar en esto como que *TypeScript* "endurece" las débiles garantías de estos tipos para detectar lo que de otro modo serían errores silenciosos.

Dado que se trata de un cambio importante, es posible que debas conocer las soluciones alternativas que son las mismas que las de las comprobaciones estrictas de objetos literales:

1. Declara las propiedades si realmente existen.
2. Agrega un índice de firma al tipo débil (es decir, `[propName: string]: {}`).
3. Utiliza una aserción de tipo (es decir, `opt as Options").

## TypeScript 2.3

## Generadores e iteración para *ES5*/*ES3*

*Primero algo de terminología ES2016*:

#### Iteradores

[*ES2015* introdujo `Iterator`](http://www.ecma-international.org/ecma-262/6.0/#sec-iteration), que es un objeto que expone tres métodos, `next`, `return` y `throw`, según la siguiente interfaz:

```ts
interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}
```

Este tipo de iterador es útil para iterar sobre valores disponibles sincrónicamente, como los elementos de un arreglo o las claves de un mapa.
Se dice que un objeto que admite iteración es "iterable" si tiene un método `Symbol.iterator` que devuelve un objeto `Iterator`.

El protocolo `Iterator` también define el objetivo de algunas de las características de *ES2015* como `for..of` y el operador de propagación y el resto del arreglo en las asignaciones de desestructuración.

#### Generadores

[*ES2015* también introdujo "Generadores"](https://www.ecma-international.org/ecma-262/6.0/#sec-generatorfunction-objects), que son funciones que se pueden utilizar para producir resultados de cálculo parciales a través de la función de la interfaz `Iterator` y la palabra clave `yield`.
Los generadores también pueden delegar llamadas internamente a otro iterable a través de `yield*`. Por ejemplo:

```ts
function* f() {
  yield 1;
  yield* [2, 3];
}
```

#### Nuevo `--downlevelIteration`

Anteriormente, los generadores solo eran compatibles si el objetivo era *ES6*/*ES2015* o posterior.
Además, las construcciones que operan en el protocolo Iterator, p. ej. `for..of` solo se admitían si operan en arreglos para objetivos por debajo de *ES6*/*ES2015*.

*TypeScript 2.3* agrega soporte completo para generadores y el protocolo `Iterator` para objetivos *ES3* y *ES5* con el indicador [`downlevelIteration`](/tsconfig#downlevelIteration).

Con [`downlevelIteration`](/tsconfig#downlevelIteration), el compilador usa un nuevo comportamiento de verificación y emisión de tipos que intenta llamar a un método `[Symbol.iterator]()` en el objeto iterado si se encuentra, y crea un iterador de arreglo sobre el objeto si no es así.

> Ten en cuenta que esto requiere un `Symbol.iterator` nativo o `Symbol.iterator` en el entorno de ejecución para cualquier valor que no sea de arreglo.

Las declaraciones `for..of`, Desestructuración y Dispersión de elementos en expresiones `Array`, `Call` y `New` admiten `Symbol.iterator` en *ES5*/*E3* si está disponible cuando se usa [`downlevelIteration`](/tsconfig#downlevelIteration), pero lo puede utilizar un `Array` incluso si no define `Symbol.iterator` en el entorno de ejecución o en tiempo de diseño.

## Iteración asincrónica

*TypeScript 2.3* agrega soporte para los iteradores y generadores asíncronos como se describe en la [propuesta *TC39*](https://github.com/tc39/proposal-async-iteration) actual.

#### Iteradores asíncronos

La iteración asincrónica introduce un `AsyncIterator`, que es similar a `Iterator`.
La diferencia radica en el hecho de que los métodos `next`, `return` y `throw` de un `AsyncIterator` devuelven una `Promise` para el resultado de la iteración, en lugar del resultado en sí. Esto permite al llamador a enlistarse en una notificación asincrónica para el tiempo en el que el `AsyncIterator` ha avanzado hasta el punto de dar un valor.
Un `AsyncIterator` tiene la siguiente forma:

```ts
interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}
```

Se dice que un objeto que admite la iteración asíncrona es "iterable" si tiene un método `Symbol.asyncIterator` que devuelve un objeto `AsyncIterator`.

#### Generadores asincrónicos

La [propuesta de iteración asíncrona](https://github.com/tc39/proposal-async-iteration) presenta "generadores asíncronos", que son funciones asíncronas que también se pueden utilizar para producir resultados de cálculo parciales. Los generadores asíncronos también pueden delegar llamadas a través de `yield*` a un iterable o `async` iterable:

```ts
async function* g() {
  yield 1;
  await sleep(100);
  yield* [2, 3];
  yield* (async function* () {
    await sleep(100);
    yield 4;
  })();
}
```

Al igual que con los generadores, los generadores asíncronos solo pueden ser declaraciones de función, expresiones de función o métodos de clases u objetos literales. Las funciones de flecha no pueden ser generadores asíncronos. Los generadores asíncronos requieren una implementación global válida de `Promise` (ya sea nativa o un `polyfill` compatible con *ES2015*), además de una referencia válida de `Symbol.asyncIterator` (ya sea un símbolo nativo o un `shim`).

#### La declaración `for-await-of`

Finalmente, *ES2015* introdujo la declaración `for..of` como un medio de iterar sobre un iterable.
De manera similar, la propuesta de iteración asíncrona introduce la declaración `for..await..of` para iterar sobre un iterable asíncrono:

```ts
async function f() {
  for await (const x of g()) {
    console.log(x);
  }
}
```

La instrucción `for..await..of` solo es legal dentro de una función asíncrona o un generador asíncrono.

#### Advertencias

- Ten en cuenta que nuestro soporte para iteradores asíncronos depende del soporte para que `Symbol.asyncIterator` exista en el entorno de ejecución.
  Es posible que debas realizar un `polyfill` `Symbol.asyncIterator`, que para propósitos simples puede ser tan simple como: `(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.from("Symbol.asyncIterator");`
- También necesitas incluir `esnext` en tu opción [`lib`](/tsconfig#lib), para obtener la declaración `AsyncIterator` si aún no la tienes.
- Finalmente, si tu objetivo es *ES5* o *ES3*, también deberás configurar el indicador `--downlevelIterators`.

## Valores predeterminados de parámetros genéricos

*TypeScript 2.3* agrega soporte para declarar valores predeterminados para parámetros de tipo genérico.

#### Ejemplo

Considera una función que crea un nuevo `HTMLElement`, llamarlo sin argumentos genera un `Div`; opcionalmente, también puedes pasar una lista de hijos. Previamente lo tendrías que definir como:

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

Con valores predeterminados de parámetros genéricos podemos reducirlo a:

```ts
declare function create<T extends HTMLElement = HTMLDivElement, U = T[]>(
  element?: T,
  children?: U
): Container<T, U>;
```

Un parámetro genérico predeterminado sigue las siguientes reglas:

- Un parámetro de tipo se considera opcional si tiene un parámetro predeterminado.
- Los parámetros de tipo obligatorios no deben seguir a los parámetros de tipo opcionales.
- Los tipos predeterminados para un parámetro de tipo deben satisfacer la restricción del parámetro de tipo, si existe.
- Al especificar argumentos de tipo, solo debes especificar argumentos de tipo para el tipo de los parámetros requeridos. Los parámetros de tipo no especificados se resolverán a sus tipos predeterminados.
- Si se especifica un tipo predeterminado y la inferencia no puede elegir un candidato, se infiere el tipo predeterminado.
- Una declaración de clase o interfaz que se fusiona con una declaración de clase o interfaz existente puede introducir un parámetro por predefinido para un tipo existente.
- Una declaración de clase o interfaz que se fusiona con una declaración de clase o interfaz existente puede introducir un nuevo parámetro de tipo siempre que especifique un valor predeterminado.

## Nueva opción maestra `--strict`

Las nuevas comprobaciones agregadas a *TypeScript* a menudo están desactivadas de forma predeterminada para evitar romper los proyectos existentes. Si bien evitar la rotura es algo bueno, esta estrategia tiene el inconveniente de hacer que sea cada vez más complejo elegir el nivel más alto de seguridad de tipos, y hacerlo requiere una acción explícita de inclusión voluntaria en cada versión de *TypeScript*. Con la opción [`strict`](/tsconfig#strict) es posible elegir la máxima seguridad de tipos con el entendimiento de que las versiones más recientes del compilador pueden informar errores adicionales a medida que se agregan características mejoradas de verificación de tipos.

La nueva opción del compilador [`strict`](/tsconfig#strict) representa la configuración recomendada de varias opciones de verificación de tipos. Específicamente, especificar [`strict`](/tsconfig#strict) corresponde a especificar todas las siguientes opciones (y en el futuro puede incluir más opciones):

- [`strictNullChecks`](/tsconfig#strictNullChecks)
- [`noImplicitAny`](/tsconfig#noImplicitAny)
- [`noImplicitThis`](/tsconfig#noImplicitThis)
- [`alwaysStrict`](/tsconfig#alwaysStrict)

En términos exactos, la opción [`strict`](/tsconfig#strict) establece el valor `default` para las opciones del compilador enumeradas anteriormente. Esto significa que aún es posible controlar individualmente las opciones. Por ejemplo:

```
`--strict --noImplicitThis false`
```

tiene el efecto de activar todas las opciones estrictas *excepto* la opción [`noImplicitThis`](/tsconfig#noImplicitThis). Usando este esquema es posible expresar configuraciones que consisten en *todas* las opciones estrictas excepto algunas opciones listadas explícitamente. En otras palabras, ahora es posible establecer de forma predeterminada el nivel más alto de seguridad de tipos pero optar por no participar en determinadas comprobaciones.

A partir de *TypeScript 2.3*, el `tsconfig.json` predeterminado generado por `tsc --init` incluye un `"strict": true` en la sección `"compilerOptions"`. Por lo tanto, los proyectos nuevos que se inicien con `tsc --init` tendrán, de manera predeterminada, habilitado el nivel más alto de seguridad de tipos.

## Salida mejorada de `--init`

Además de configurar [`strict`](/tsconfig#strict) de forma predeterminada, `tsc --init` tiene una salida mejorada. Los archivos predeterminados `tsconfig.json` generados por `tsc --init` ahora incluyen un conjunto de opciones comunes del compilador junto con sus descripciones comentadas. Simplemente elimina los comentarios de la configuración que deseas establecer para obtener el comportamiento deseado; esperamos que la nueva salida simplifique la configuración de nuevos proyectos y mantenga los archivos de configuración legibles a medida que crecen los proyectos.

## Errores en archivos `.js` con `--checkJs`

De forma predeterminada, el compilador de *TypeScript* no informa ningún error en los archivos `.js`, incluido el uso de [`allowJs`](/tsconfig#allowJs). Con *TypeScript 2.3*, los errores de verificación de tipo también se pueden informar en archivos `.js` con [`checkJs`](/tsconfig#checkJs).

Puedes omitir la comprobación de algunos archivos agregando comentarios `//@ts-nocheck`; a la inversa, puedes optar por comprobar sólo unos pocos archivos `.js` añadiendo comentarios `//@ts-check` sobre ellos sin establecer [`checkJs`](/tsconfig#checkJs). También puedes ignorar errores en líneas específicas agregando `//@ts-ignore` en la línea anterior.

Los archivos `.js` se siguen comprobando para garantizar que solo incluyan funciones estándar de *ECMAScript*; las anotaciones de tipo solo se permiten en archivos `.ts` y se marcan como errores en los archivos `.js`. Los comentarios *JSDoc* se pueden utilizar para agregar información de tipo a tu código *JavaScript*, consulta [Documentación de soporte *JSDoc*](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript) para obtener más detalles sobre las Construcciones *JSDoc*.

Consulta la [Documentación de archivos sobre la comprobación de tipos *JavaScript*](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files) para obtener más detalles.

## TypeScript 2.2

## Soporte para clases mixtas

*TypeScript 2.2* agrega soporte para el patrón de clase mixin *ECMAScript 2015* (ve la [Descripción MDN de Mixin](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Classes#Mix-ins) y [Mixins "Real" con Clases *JavaScript*](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) para obtener más detalles), así como reglas para combinar firmas de construcción mixin con firmas de construcción regulares en tipos de intersección.

##### Primero algo de terminología:

- Un **tipo de constructor mixin** se refiere a un tipo que tiene una única firma de construcción con un único argumento `rest` de tipo `any[]` y un tipo de retorno similar a un objeto. Por ejemplo, dado un tipo de objeto `X`, `new (...args: any[]) => X` es un tipo de constructor mixin con un tipo de instancia `X`.

- Una **clase mixin** es una declaración de clase o expresión que `extends` una expresión de un tipo de parámetro de tipo. Las siguientes reglas se aplican a las declaraciones de clases mixtas:

* El tipo de parámetro de tipo de la expresión `extends` se debe limitar a un tipo de constructor mixin.
* El constructor de una clase mixin (si lo hay) debe tener un único parámetro `rest` de tipo `any[]` y debe usar el operador de propagación para pasar esos parámetros como argumentos en una llamada a `super(... args)`.

Dada una expresión `Base` de un tipo paramétrico `T` con una restricción `X`, una clase mixin `class C extends Base {...}` se procesa como si `Base` tuviera el tipo `X` y el tipo resultante es la intersección `typeof C & T`. En otras palabras, una clase mixin se representa como una intersección entre el tipo de constructor de la clase mixin y el tipo de constructor de la clase base paramétrica.

Al obtener las firmas de construcción de un tipo de intersección que contiene tipos de constructor mixin, las firmas de construcción mixin se descartan y sus tipos de instancia se mezclan con los tipos de retorno de las otras firmas de construcción en el tipo de intersección. Por ejemplo, el tipo de intersección `{new(...args: any[]) => A } & { new(s: string) => B }`tiene una única firma de construcción `new(s: string) => A & B`.

##### Poniendo todas las reglas anteriores juntas en un ejemplo:

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

class Person {
  constructor(public name: string) {}
}

type Constructor<T> = new (...args: any[]) => T;

function Tagged<T extends Constructor<{}>>(Base: T) {
  return class extends Base {
    _tag: string;
    constructor(...args: any[]) {
      super(...args);
      this._tag = "";
    }
  };
}

const TaggedPoint = Tagged(Point);

let point = new TaggedPoint(10, 20);
point._tag = "hello";

class Customer extends Tagged(Person) {
  accountBalance: number;
}

let customer = new Customer("Joe");
customer._tag = "test";
customer.accountBalance = 0;
```

Las clases de mezcla pueden restringir los tipos de clases en las que se pueden mezclar especificando un tipo de retorno de firma de construcción en la restricción para el parámetro de tipo. Por ejemplo, la siguiente función `WithLocation` implementa una fábrica de subclase que agrega un método `getLocation` a cualquier clase que satisfaga la interfaz `Point` (es decir, que tenga propiedades `x` e `y` de tipo `number`).

```ts
interface Point {
  x: number;
  y: number;
}

const WithLocation = <T extends Constructor<Point>>(Base: T) =>
  class extends Base {
    getLocation(): [number, number] {
      return [this.x, this.y];
    }
  };
```

## Tipo `object`

*TypeScript* no tiene un tipo que represente el tipo no primitivo, es decir, cualquier cosa que no sea `number` | `string` | `boolean` | `symbol` | `null` | `undefined`. Introduce el nuevo tipo `object`.

Con el tipo `object`, las *API*s como `Object.create` se pueden representar mejor. Por ejemplo:

```ts
declare function create(o: object | null): void;

create({ prop: 0 }); // Bien
create(null); // Bien

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

## Soporte para `new.target`

La metapropiedad `new.target` es una nueva sintaxis introducida en *ES2015*. Cuando se crea una instancia de un constructor a través de `new`, el valor de `new.target` se establece como una referencia a la función del constructor utilizada inicialmente para asignar la instancia. Si se llama a una función en lugar de construirla a través de `new`, `new.target` se establece en `undefined`.

`new.target` es útil cuando `Object.setPrototypeOf` o `__proto__` se deben configurar en un constructor de clases. Uno de esos casos de uso es heredar de `Error` en *NodeJS v4* y superior.

#### Ejemplo

```ts
class CustomError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' rompe la cadena del prototipo aquí
    Object.setPrototypeOf(this, new.target.prototype); // restaura la cadena de prototipos
  }
}
```

Esto da como resultado el *JS* generado

```js
var CustomError = (function (_super) {
  __extends(CustomError, _super);
  function CustomError() {
    var _newTarget = this.constructor;
    var _this = _super.apply(this, arguments); // 'Error' rompe la cadena del prototipo aquí
    _this.__proto__ = _newTarget.prototype; // restaura la cadena de prototipos
    return _this;
  }
  return CustomError;
})(Error);
```

`new.target` también es útil para escribir funciones construibles, por ejemplo:

```ts
function f() {
  if (new.target) {
    /* llamado a través de 'new' */
  }
}
```

Lo que se traduce en:

```js
function f() {
  var _newTarget = this && this instanceof f ? this.constructor : void 0;
  if (_newTarget) {
    /* llamado a través de 'new' */
  }
}
```

## Mejor comprobación de `null`/`undefined` en operandos de expresiones

*TypeScript 2.2* mejora la comprobación de operandos que aceptan valores `NULL` en expresiones. Específicamente, estos ahora están marcados como errores:

- Si cualquiera de los operandos de un operador `+` es anulable, y ninguno de los operandos es de tipo `any` o `string`.
- Si cualquiera de los operandos de un `-`, `*`, `**`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, o el operador `^` es anulable.
- Si cualquiera de los operandos de un operador `<`, `>`, `<=`, `>=` o `in` es anulable.
- Si el operando derecho de un operador `instanceof` es anulable.
- Si el operando de un operador unario `+`, `-`, `~`, `++` o `--` es anulable.

Un operando se considera anulable si el tipo del operando es `null` o `undefined` o un tipo unión que incluye `null` o `undefined`. Ten en cuenta que el caso del tipo unión solo se produce en el modo [`strictNullChecks`](/tsconfig#strictNullChecks) porque `null` y `undefined` desaparecen de las uniones en el modo de comprobación de tipo clásico.

## Propiedad punteada para tipos con índice de firmas de cadena

Los tipos con un índice de firma de cadena se pueden indexar usando la notación `[]`, pero no se les permitió usar el `.`. A partir de *TypeScript 2.2* se debe permitir el uso de cualquiera.

```ts
interface StringMap<T> {
  [x: string]: T;
}

const map: StringMap<number>;

map["prop1"] = 1;
map.prop2 = 2;
```

Esto solo se aplica a los tipos con un índice de firma de cadena *explicito*. Sigue siendo un error acceder a propiedades desconocidas en un tipo utilizando la notación `.`.

## Soporte para el operador de propagación en elementos *JSX* secundarios

*TypeScript 2.2* agrega soporte para usar `spread` en un elemento *JSX* secundario. Consulta [`facebook/jsx#57`](https://github.com/facebook/jsx/issues/57) para obtener más detalles.

#### Ejemplo

```ts
function Todo(prop: { key: number; todo: string }) {
  return <div>{prop.key.toString() + prop.todo}</div>;
}

function TodoList({ todos }: TodoListProps) {
  return (
    <div>{...todos.map((todo) => <Todo key={todo.id} todo={todo.todo} />)}</div>
  );
}

let x: TodoListProps;

<TodoList {...x} />;
```

## Nuevo `jsx: react-native`

La canalización de compilación nativa de *React* espera que todos los archivos tengan extensiones `.js` incluso si el archivo contiene sintaxis *JSX*. El nuevo valor de [`jsx`](/tsconfig#jsx) `react-native` mantendrá la sintaxis *JSX* en el archivo de salida, pero le dará una extensión `.js`.

## TypeScript 2.1

## `keyof` y tipos de búsqueda

En *JavaScript*, es bastante común tener *API*s que esperan nombres de propiedad como parámetros, pero hasta ahora no ha sido posible expresar las relaciones de tipos que ocurren en esas *API*s.

Ingresa el índice de la Consulta de tipo o `keyof`;
Una consulta de tipo indexado `keyof T` produce el tipo de nombres de propiedad permitidos para `T`.
Un tipo `keyof T` se considera un subtipo de `string`.

##### Ejemplo

```ts
interface Person {
  name: string;
  age: number;
  location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[]; // "length" | "push" | "pop" | "concat" | ...
type K3 = keyof { [x: string]: Person }; // string
```

El dual de esto es *tipos de acceso indexados*, también llamados *tipos de búsqueda*.
Sintácticamente, se ven exactamente como un acceso a elementos, pero están escritos como tipos:

##### Ejemplo

```ts
type P1 = Person["name"]; // string
type P2 = Person["name" | "age"]; // string | number
type P3 = string["charAt"]; // (pos: number) => string
type P4 = string[]["push"]; // (...items: string[]) => number
type P5 = string[][0]; // string
```

Puedes utilizar este patrón con otras partes del sistema de tipos para obtener búsquedas con seguridad de tipos.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]; // El tipo inferido es T[K]
}

function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  obj[key] = value;
}

let x = { foo: 10, bar: "hello!" };

let foo = getProperty(x, "foo"); // number
let bar = getProperty(x, "bar"); // string

let oops = getProperty(x, "wargarbl"); // ¡Error! "wargarbl" no es "foo" | "bar"

setProperty(x, "foo", "string"); // Error!, cadena esperada número
```

## Tipos mapeados

Una tarea común es tomar un tipo existente y hacer que cada una de sus propiedades sea completamente opcional.
Digamos que tenemos una interfaz `Person`:

```ts
interface Person {
  name: string;
  age: number;
  location: string;
}
```

Una versión parcial sería:

```ts
interface PartialPerson {
  nombre?: string;
  age?: number;
  location?: string;
}
```

con tipos asignados, `PartialPerson` se puede escribir como una transformación generalizada en el tipo `Person` como:

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type PartialPerson = Partial<Person>;
```

Los tipos mapeados se producen tomando una unión de tipos literales y calculando un conjunto de propiedades para un nuevo tipo de objeto.
Son como [listas por comprensión en *Python*](https://docs.python.org/2/tutorial/datastructures.html#nested-list-comprehensions), pero en lugar de producir nuevos elementos en una lista, producen nuevas propiedades en un tipo.

Además de `Partial`, los tipos asignados pueden expresar muchas transformaciones útiles en los tipos:

```ts
// Mantiene los tipos iguales, pero hace que cada propiedad sea de solo lectura.
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Los mismos nombres de propiedad, pero hacen que el valor sea una promesa en lugar de una concreta
type Deferred<T> = {
  [P in keyof T]: Promise<T[P]>;
};

// Envuelve proxies alrededor de las propiedades de T
type Proxify<T> = {
  [P in keyof T]: { get(): T[P]; set(v: T[P]): void };
};
```

## `Partial`, `Readonly`, `Record`, y `Pick`

`Parcial` y `Readonly`, como se describió anteriormente, son construcciones muy útiles.
Puedes usarlos para describir algunas rutinas *JS* comunes como:

```ts
function assign<T>(obj: T, props: Partial<T>): void;
function freeze<T>(obj: T): Readonly<T>;
```

Por eso, ahora se incluyen de forma predeterminada en la biblioteca estándar.

También incluimos otros dos tipos de servicios públicos: `Record` y `Pick`.

```ts
// A partir de T elige un conjunto de propiedades K
declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

const nameAndAgeOnly = pick(person, "name", "age"); // { name: string, age: number }
```

```ts
// Para cada propiedad K de tipo T, transfórmala en U
function mapObject<K extends string, T, U>(
  obj: Record<K, T>,
  f: (x: T) => U
): Record<K, U>;

const names = { foo: "hello", bar: "world", baz: "bye" };
const lengths = mapObject(names, (s) => s.length); // { foo: number, bar: number, baz: number }
```

## Propagación de objetos y `rest`

*TypeScript 2.1* ofrece soporte para [*ES2017* `Spread` y `Rest`](https://github.com/sebmarkbage/ecmascript-rest-spread).

De manera similar a la distribución de arreglo, la distribución de un objeto puede ser útil para obtener una copia superficial:

```ts
let copy = { ...original };
```

Del mismo modo, puedes fusionar varios objetos diferentes.
En el siguiente ejemplo, `merged` tendrá propiedades de `foo`, `bar` y `baz`.

```ts
let merged = { ...foo, ...bar, ...baz };
```

También puedes redefinir propiedades existentes y agregar nuevas:

```ts
let obj = { x: 1, y: "string" };
var newObj = { ...obj, z: 3, y: 4 }; // { x: number, y: number, z: number }
```

El orden de especificar las operaciones de propagación determina qué propiedades terminan en el objeto resultante;
las propiedades de los diferenciales posteriores "ganan" sobre las propiedades creadas previamente.

Los restos de objetos son el doble de las extensiones de objetos, ya que pueden extraer cualquier propiedad adicional que no se recoja al desestructurar un elemento:

```ts
let obj = { x: 1, y: 1, z: 1 };
let { z, ...obj1 } = obj;
obj1; // {x: number, y: number};
```

## Funciones asincrónicas de nivel inferior

Esta característica era compatible antes de *TypeScript 2.1*, pero solo cuando estaba dirigida a *ES6*/*ES2015*.
*TypeScript 2.1* brinda la capacidad a los entornos de ejecución de *ES3* y *ES5*, lo cual significa que la podrás aprovechar sin importar el entorno que estés utilizando.

> Nota: Primero, debemos asegurarnos de que nuestro entorno de ejecución tenga una `Promise` compatible con *ECMAScript* disponible a nivel global.
> Eso podría implicar tomar [un `polyfill`](https://github.com/stefanpenner/es6-promise) para `Promise`, o confiar en uno que pueda tener en el entorno de ejecución al que está apuntando.
> También nos debemos asegurar de que *TypeScript* sabe que existe `Promise` configurando la opción [`lib`](/tsconfig#lib) en algo como `"dom", "es2015"` o `"dom", "es2015".promise", "es5"`

##### Ejemplo

##### tsconfig.json

```json tsconfig
{
  "compilerOptions": {
    "lib": ["dom", "es2015.promise", "es5"]
  }
}
```

##### `dramaticWelcome.ts`

```ts
function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function dramaticWelcome() {
  console.log("Hello");

  for (let i = 0; i < 3; i++) {
    await delay(500);
    console.log(".");
  }

  console.log("World!");
}

dramaticWelcome();
```

La compilación y ejecución de la salida debería dar como resultado el comportamiento correcto en un motor *ES3*/*ES5*.

## Soporte para biblioteca auxiliares externas (`tslib`)

*TypeScript* inyecta un puñado de funciones auxiliares como `__extends` para la herencia, `__assign` para el operador de propagación en literales de objeto y elementos *JSX*, y `__awaiter` para funciones asíncronas.

Anteriormente había dos opciones:

1.  inyectar auxiliares en *cada* archivo que los necesite, o
2.  ningún ayudante con [`noEmitHelpers`](/tsconfig#noEmitHelpers).

Las dos opciones dejaban más que desear;
agrupar los ayudantes en cada archivo era un problema para los clientes que intentaban mantener pequeño el tamaño de su paquete.
Y sin incluir ayudantes, significaba que los clientes tenían que mantener su propia biblioteca de ayudantes.

*TypeScript 2.1* permite incluir estos archivos en tu proyecto una vez en un módulo separado, y el compilador emitirá importaciones a ellos según sea necesario.

Primero, instala la biblioteca de utilidades [`tslib`](https://github.com/Microsoft/tslib):

```sh
npm install tslib
```

Segundo, compila tus archivos usando [`importHelpers`](/tsconfig#importHelpers):

```sh
tsc --module commonjs --importHelpers a.ts
```

Entonces, dada la siguiente entrada, el archivo `.js` resultante incluirá una importación a `tslib` y usará el ayudante `__assign` en lugar de incluirlo.

```ts
export const o = { a: 1, name: "o" };
export const copy = { ...o };
```

```js
"use strict";
var tslib_1 = require("tslib");
exports.o = { a: 1, name: "o" };
exports.copy = tslib_1.__assign({}, exports.o);
```

## Importaciones sin tipo

*TypeScript* tradicionalmente ha sido demasiado estricto sobre cómo importar módulos.
Esto fue para evitar errores tipográficos y evitar que los usuarios utilicen los módulos incorrectamente.

Sin embargo, muchas veces, es posible que desees importar un módulo existente que no tenga su propio archivo `.d.ts`.
Anteriormente, esto era un error.
Comenzar con *TypeScript 2.1* ahora es mucho más fácil.

Con *TypeScript 2.1*, puedes importar un módulo *JavaScript* sin necesidad de una declaración de tipo.
Una declaración de tipo (como `declare module "foo" {...}` o `node_modules/@types/foo`) todavía tiene prioridad si existe.

Una importación a un módulo sin un archivo de declaración todavía se marcará como un error en [`noImplicitAny`](/tsconfig#noImplicitAny).

##### Ejemplo

```ts
// Tiene éxito si `node_modules/asdf/index.js` existe, o si `node_modules/asdf/package.json` define un punto de entrada "main" válido
import { x } from "asdf";
```

## Soporte para `--target ES2016`, `--target ES2017` y `--target ESNext`

*TypeScript 2.1* admite tres nuevos valores de destino `--target ES2016`, `--target ES2017` y `--target ESNext`.

El uso de target `--target ES2016` indicará al compilador que no transforme las características específicas de *ES2016*, p. ej. el operador `**`.

De manera similar, `--target ES2017` indicará al compilador que no transforme características específicas de *ES2017* como `async`/`await`.

`--target ESNext` apunta a las últimas [características propuestas de *ES* admitidas](https://github.com/tc39/proposals).

## Inferencia `any` mejorada

Anteriormente, si `TypeScript` no podía averiguar el tipo de una variable, elegiría el tipo `any`.

```ts
let x; // implícitamente 'any'
let y = []; // implícitamente 'any[]'

let z: any; // explícitamente 'any'.
```

Con *TypeScript 2.1*, en lugar de simplemente elegir `any`, *TypeScript* inferirá los tipos en función de lo que termines asignando más adelante.

Esto solo está habilitado si se establece [`noImplicitAny`](/tsconfig#noImplicitAny).

##### Ejemplo

```ts
let x;

// Aún puedes asignar cualquier cosa que desees a 'x'.
x = () => 42;

// Después de esa última asignación, TypeScript 2.1 sabe que 'x' tiene tipo '() => number'.
let y = x();

// ¡Gracias a eso, ahora te dirá que no puedes agregar un número a una función!
console.log(x + y);
//          ~~~~~
// ¡Error! El operador '+' no se puede aplicar a los tipos '() => number' y 'number'.

// TypeScript todavía te permite asignar cualquier cosa que desees a 'x'.
x = "Hello world!";

// ¡Pero ahora también sabe que 'x' es una 'string'!
x.toLowerCase();
```

El mismo tipo de seguimiento ahora también se realiza para arreglos vacíos.

Una variable declarada sin anotación de tipo y un valor inicial de `[]` se considera una variable implícita `any[]`.
Sin embargo, cada operación posterior de `x.push(value)`, `x.unshift(value)` o `x[n] = value` *evoluciona* el tipo de variable de acuerdo con los elementos que se le agregan.

```ts
function f1() {
  let x = [];
  x.push(5);
  x[1] = "hello";
  x.unshift(true);
  return x; // (string | number | boolean)[]
}

function f2() {
  let x = null;
  if (cond()) {
    x = [];
    while (cond()) {
      x.push("hello");
    }
  }
  return x; // string[] | null
}
```

## Cualquier error implícito

Un gran beneficio de esto es que verás *mucho menos* errores implícitos de `any` cuando se ejecute con [`noImplicitAny`](/tsconfig#noImplicitAny).
Los errores `any` implícitos solo se informan cuando el compilador no puede saber el tipo de una variable sin una anotación de tipo.

##### Ejemplo

```ts
function f3() {
  let x = []; // Error: La variable 'x' implícitamente tiene el tipo 'any[]' en algunas ubicaciones donde no se puede determinar su tipo.
  x.push(5);
  function g() {
    x; // Error: La variable 'x' tiene implícitamente un tipo 'any[]'.
  }
}
```

## Mejor inferencia para tipos literales

Los tipos literales de cadena, numéricos y booleanos (p. ej., `"abc"`, `1` y `true`) se infirieron anteriormente solo en presencia de una anotación de tipo explícita.
A partir de *TypeScript 2.1*, los tipos literales *siempre* se infieren para las variables `const` y las propiedades `readonly`.

El tipo inferido para una variable `const` o propiedad `readonly` sin una anotación de tipo es el tipo del iniciador literal.
El tipo inferido para una variable `let`, una variable `var`, un parámetro o una propiedad que no sea `readonly` con un iniciador y sin una anotación de tipo es el tipo literal ampliado del iniciador.
Donde el tipo ampliado para un tipo de literal de cadena es `string`, `number` para los tipos de literal numérico, `boolean`o para `true` o `false` y la enumeración que lo contiene para los tipos de enumeración literal.

##### Ejemplo

```ts
const c1 = 1; // Tipo 1
const c2 = c1; // Tipo 1
const c3 = "abc"; // Tipo "abc"
const c4 = true; // Tipo true
const c5 = cond ? 1 : "abc"; // Tipo 1 | "abc"

let v1 = 1; // Tipo number
let v2 = c2; // Tipo number
let v3 = c3; // Tipo string
let v4 = c4; // Tipo boolean
let v5 = c5; // Tipo number | string
```

El ensanchamiento de tipo literal se puede controlar mediante anotaciones de tipo explícitas.
Específicamente, cuando se infiere una expresión de un tipo literal para una ubicación constante sin una anotación de tipo, esa variable `const` obtiene un tipo de literal ampliado inferido.
Pero cuando una ubicación `const` tiene una anotación de tipo literal explícita, la variable `const` obtiene un tipo literal que no se ensancha.

##### Ejemplo

```ts
const c1 = "hello"; // Ampliación de tipo "hola"
let v1 = c1; // Tipo string

const c2: "hello" = "hello"; // Tipo "hello"
let v2 = c2; // Tipo "hello"
```

## Usa valores devueltos de super llamadas como `this`

En *ES2015*, los constructores que devuelven un objeto sustituyen implícitamente el valor de `this` por cualquier llamador de `super()`.
Como resultado, es necesario capturar cualquier valor de retorno potencial de `super()` y reemplazarlo con `this`.
Este cambio permite trabajar con [Elementos personalizados](https://w3c.github.io/webcomponents/spec/custom/#htmlelement-constructor), que aprovecha esto para iniciar elementos asignados al navegador con constructores escritos por el usuario.

##### Ejemplo

```ts
class Base {
  x: number;
  constructor() {
    // devuelve un nuevo objeto que no sea "this"
    return {
      x: 1,
    };
  }
}

class Derived extends Base {
  constructor() {
    super();
    this.x = 2;
  }
}
```

Genera:

```js
var Derived = (function (_super) {
  __extends(Derived, _super);
  function Derived() {
    var _this = _super.call(this) || this;
    _this.x = 2;
    return _this;
  }
  return Derived;
})(Base);
```

> Este cambio implica una ruptura en el comportamiento de extender clases integradas como `Error`, `Array`, `Map`, etc. Consulta la [extensión de la documentación de cambios de ruptura incorporados](https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and -map-may-no-longer-work) para obtener más detalles.

## Herencia de la configuración

A menudo, un proyecto tiene varios objetivos de resultados, p. ej. `ES5` y `ES2015`, depuración y producción o `CommonJS` y `System`;
Solo unas pocas opciones de configuración cambian entre estos dos destinos, y mantener varios archivos `tsconfig.json` puede ser una molestia.

*TypeScript 2.1* admite la configuración heredada usando `extends`, donde:

- `extends` es una nueva propiedad de nivel superior en `tsconfig.json` (junto con `compilerOptions`, [`files`](/tsconfig#files), [`include`](/tsconfig#include) y `exclude` ).
- El valor de `extends` debe ser una cadena que contenga una ruta a otro archivo de configuración del que heredar.
- La configuración del archivo base se carga primero y luego se reemplaza por las del archivo de configuración heredado.
- No se permite la circularidad entre archivos de configuración.
- [`files`](/tsconfig#files), [`include`](/tsconfig#include) y `exclude` del archivo de configuración heredado *sobrescribe* los del archivo de configuración base.
- Todas las rutas relativas que se encuentren en el archivo de configuración se resolverán en relación con el archivo de configuración en el que se originaron.

##### Ejemplo

`configs/base.json`:

```json tsconfig
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

`tsconfig.json`:

```json tsconfig
{
  "extends": "./configs/base",
  "files": ["main.ts", "supplemental.ts"]
}
```

`tsconfig.nostrictnull.json`:

```json tsconfig
{
  "extends": "./tsconfig",
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

## Nuevo `--alwaysStrict`

Invocar el compilador con [`alwaysStrict`](/tsconfig#alwaysStrict) causa:

1. Analiza todo el código en modo estricto.
2. Escribe la directiva `"use strict";` encima de cada archivo generado.

Los módulos, automáticamente, se analizan en modo estricto.
La nueva bandera se recomienda para código que no es de módulo.

## TypeScript 2.0

## `Null-` y tipos conocidos `undefined`

*TypeScript* tiene dos tipos especiales, `Null` y `Undefined`, que tienen los valores `null` y `undefined` respectivamente.
Anteriormente, no era posible nombrar explícitamente estos tipos, pero ahora se pueden usar `null` y `undefined` como nombres de tipos independientemente del modo de verificación de tipos.

El verificador de tipos anteriormente se consideraba `null` e `undefined` asignable a cualquier cosa.
Efectivamente, `null` y `undefined` eran valores válidos de *todo* tipo y no era posible excluirlos específicamente (y por lo tanto no era posible detectar un uso erróneo de ellos).

### `--strictNullChecks`

[`strictNullChecks`](/tsconfig#strictNullChecks) cambia a un nuevo modo de comprobación nulo estricto.

En el modo de comprobación `null` estricto, los valores `null` y `undefined` *no* son en el dominio de todos los tipos y solo se pueden asignar a ellos mismos y a `any` (la única excepción es que `undefined` también se puede asignar a `void`) .
Entonces, mientras que `T` y `T | undefined` se consideran sinónimos en el modo de verificación de tipo normal (porque `undefined` se considera un subtipo de cualquier `T`), son tipos diferentes en el modo de comprobación de tipo estricto, y solo `T | undefined` permite valores `undefined`. Lo mismo es cierto para la relación de `T` a `T | null`.

#### Ejemplo

```ts
// Compilado con --strictNullChecks
let x: number;
let y: number | undefined;
let z: number | null | undefined;
x = 1; // Bien
y = 1; // Bien
z = 1; // Bien
x = undefined; // Error
y = undefined; // Bien
z = undefined; // Bien
x = null; // Error
y = null; // Error
z = null; // Bien
x = y; // Error
x = z; // Error
y = x; // Bien
y = z; // Error
z = x; // Bien
z = y; // Bien
```

### Comprobación asignada antes del uso

En el modo de comprobación estricta de `null`, el compilador requiere que cada referencia a una variable local de un tipo que no incluya `undefined` esté precedida por una asignación a esa variable en cada posible ruta de código anterior.

#### Ejemplo

```ts
// Compilado con --strictNullChecks
let x: number;
let y: number | null;
let z: number | undefined;
x; // Error, referencia no precedida por asignación
y; // Error, referencia no precedida por asignación
z; // Bien
x = 1;
y = null;
x; // Bien
y; // Bien
```

El compilador verifica que las variables estén definitivamente asignadas realizando *análisis de tipo basado en el control de flujo*. Consulta más adelante para obtener más detalles sobre este tema.

### Parámetros y propiedades opcionales

Los parámetros y propiedades opcionales automáticamente tienen `undefined` agregado a sus tipos, incluso cuando sus anotaciones de tipo no incluyan a `undefined` específicamente.
Por ejemplo, los dos siguientes tipos son idénticos:

```ts
// Compilado con --strictNullChecks
type T1 = (x?: number) => string; // x tiene tipo number | undefined
type T2 = (x?: number | undefined) => string; // x tiene tipo number | undefined
```

### Guardias de tipo no `null` y no `undefined`

Un acceso a la propiedad o una llamada a una función produce un error en tiempo de compilación si el objeto o la función es de un tipo que incluye `null` o `undefined`.
Sin embargo, las protecciones de tipos se amplían para admitir comprobaciones no nulas ni indefinidas.

#### Ejemplo

```ts
// Compilado con --strictNullChecks
declare function f(x: number): string;
let x: number | null | undefined;
if (x) {
  f(x); // Bien, aquí el tipo de x es number
} else {
  f(x); // Error, ¿el tipo de x es number? aquí
}
let a = x != null ? f(x) : ""; // El tipo de a es string
let b = x && f(x); // El tipo de b es string | 0 | null | undefined
```

Los guardias de tipos no nulos y no indefinidos pueden usar el operador `==`, `!=`, `===` o `!==` para comparar con `null` o `undefined`, como en `x != null` o `x === undefined`.
Los efectos sobre los tipos de variables de sujeto reflejan con precisión la semántica de *JavaScript* (por ejemplo, los operadores de doble igual comprueban ambos valores sin importar cuál se especifique, mientras que triple igual solo comprueba el valor especificado).

### Nombres punteados en protectores de tipo

Los protectores de tipos anteriormente solo admitían la verificación de variables y parámetros locales.
Los protectores de tipo ahora admiten la comprobación de "nombres con puntos" que consisten en un nombre de parámetro o variable seguido de uno o más accesos a la propiedad.

#### Ejemplo

```ts
interface Options {
  location?: {
    x?: number;
    y?: number;
  };
}

function foo(options?: Options) {
  if (options && options.location && options.location.x) {
    const x = options.location.x; // El tipo de x es number
  }
}
```

Los protectores de tipo para nombres con puntos también trabajan con las funciones de protección de tipos definidas por el usuario y los operadores `typeof` e `instanceof` y no dependen de la opción del compilador [`strictNullChecks`](/tsconfig#strictNullChecks).

Un protector de tipo para un nombre con puntos no tiene ningún efecto después de una asignación a cualquier parte del nombre con puntos.
Por ejemplo, un protector de tipo para `x.y.z` no tendrá ningún efecto después de una asignación a `x`, `x.y` o `x.y.z`.

### Expresión de operadores

La expresión de operadores permiten que los tipos de operandos incluyan `null` y/o `undefined`, pero siempre producen valores de tipos no nulos y no indefinidos.

```ts
// Compilado con --strictNullChecks
function sum(a: number | null, b: number | null) {
  return a + b; // Produce valor de tipo number
}
```

El operador `&&` agrega `null` y/o `undefined` al tipo de operando derecho dependiendo de cuáles estén presentes en el tipo del operando izquierdo, y el operador `||` elimina tanto `null` como `undefined` del tipo del operando izquierdo en el tipo de unión resultante.

```ts
// Compilado con --strictNullChecks
interface Entity {
  name: string;
}
let x: Entity | null;
let s = x && x.name; // s es de tipo string | null
let y = x || { name: "test" }; // y es de tipo Entity
```

### Tipo `widening`

Los tipos `null` y `undefined` *no* se amplían a `any` en el modo de comprobación estricto de `null`.

```ts
let z = null; // El tipo de z es null
```

En el modo de verificación de tipo regular, el tipo inferido de `z` es `any` debido al ensanchamiento, pero en el modo de verificación estricta de `null`, el tipo inferido de `z` es `null` (y por lo tanto, en ausencia de una anotación de tipo, `null` es el único valor posible para `z`).

### Operador de aserción no nula

Se puede usar un nuevo operador `!` de expresión a la posterior corrección para afirmar que su operando no es nulo y no está definido en contextos donde el verificador de tipos no puede concluir ese hecho.
Específicamente, la operación `x!` produce un valor del tipo de `x` con `null` y `undefined` excluidos.
Similar a las afirmaciones de tipo de las formas `<T>x` y `x as T`, el operador de aserción no nula `!` simplemente se elimina en el código *JavaScript* emitido.

```ts
// Compilado con --strictNullChecks
function validateEntity(e?: Entity) {
  // Lanza una excepción si e es una entidad nula o inválida
}

function processEntity(e?: Entity) {
  validateEntity(e);
  let s = e!.name; // Acierta que e no es null y el nombre de acceso
}
```

### Compatibilidad

Las nuevas funciones están diseñadas de modo que se puedan utilizar tanto en el modo de comprobación nulo estricto como en el modo de comprobación de tipo regular.
En particular, los tipos `null` e `undefined` se borran automáticamente de los tipos de unión en el modo de verificación de tipos normal (porque son subtipos de todos los demás tipos), y el operador de expresión de aserción no nulo `!` está permitido pero no tiene efecto en el modo de verificación de tipo regular. Por lo tanto, los archivos de declaración que se actualizan para usar nulos y los tipos con reconocimiento de indefinidos todavía se pueden usar en el modo de verificación de tipos normal para compatibilidad con versiones anteriores.

En términos prácticos, el modo de comprobación nulo estricto requiere que todos los archivos de una compilación sean nulos- e indefinido-consciente.

## Análisis de tipo basado en control de flujo

*TypeScript 2.0* implementa un análisis de tipo basado en control de flujo para variables y parámetros locales.
Anteriormente, el análisis de tipos realizado para los protectores de tipo se limitaba a declaraciones `if` y `?:` expresiones condicionales y no incluía efectos de asignaciones y construcciones de control de flujo como declaraciones `return` y `break`.
Con *TypeScript 2.0*, el verificador de tipos analiza todos los posibles flujos de control en declaraciones y expresiones para producir el tipo más específico posible (el *tipo reducido*) en cualquier ubicación dada para una variable o parámetro local que se declara que tiene un tipo unión.

#### Ejemplo

```ts
function foo(x: string | number | boolean) {
  if (typeof x === "string") {
    x; // aquí el tipo de x es string
    x = 1;
    x; // aquí el tipo de x es number
  }
  x; // aquí el tipo de x es number | boolean
}

function bar(x: string | number) {
  if (typeof x === "number") {
    return;
  }
  x; // aquí el tipo de x es string
}
```

El análisis de tipos basado en el control de flujo es particularmente relevante en el modo [`strictNullChecks`](/tsconfig#strictNullChecks) porque los tipos que aceptan valores `NULL` se representan mediante tipos unión:

```ts
function test(x: string | null) {
  if (x === null) {
    return;
  }
  x; // el tipo de x es string en el resto de la función
}
```

Además, en el modo [`strictNullChecks`](/tsconfig#strictNullChecks), el análisis de tipo basado en el control de flujo incluye *análisis de asignación definida* para variables locales de tipos que no permiten el valor `undefined`.

```ts
function mumble(check: boolean) {
  let x: number; // El tipo no permite undefined
  x; // Error, x is undefined
  if (check) {
    x = 1;
    x; // Bien
  }
  x; // Error, x posiblemente es undefined
  x = 2;
  x; // Bien
}
```

## Tipos unión etiquetados

*TypeScript 2.0* implementa soporte para tipos unión etiquetados (o discriminados).
Específicamente, el compilador de *TS* ahora admite protecciones de tipos que reducen los tipos de unión en función de las pruebas de una propiedad discriminante y, además, amplían esa capacidad a las declaraciones `switch`.

#### Ejemplo

```ts
interface Square {
  kind: "square";
  size: number;
}

interface Rectángulo {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Forma = Cuadro | Rectángulo | Círculo;

function area(s: Shape) {
  // En la siguiente declaración `switch`, el tipo de `s` se reduce en cada cláusula `case`
  // de acuerdo con el valor de la propiedad discriminante, permitiendo así que las otras propiedades
  // de esa variante para acceder sin una aserción de tipo.
  switch (f.clase) {
    case "square":
      return s.size * s.size;
    case "rectangle":
      return s.width * s.height;
    case "circle":
      return Math.PI * s.radius * s.radius;
  }
}

function test1(s: Shape) {
  if (s.kind === "square") {
    s; // Square
  } else {
    s; // Rectangle | Circle
  }
}

function test2(s: Shape) {
  if (s.kind === "square" || s.kind === "rectangle") {
    return;
  }
  s; // Circle
}
```

Un tipo de propiedad *guardia discriminante* es una expresión de la forma `x.p == v`, `xp === v`, `x.p != v`, o `x.p !== v`, donde `p` y `v` son una propiedad y una expresión de un tipo literal de cadena o una unión de tipos de cadenas literales.
La protección de tipo de propiedad discriminante reduce el tipo de `x` a los tipos constituyentes de `x` que tienen una propiedad discriminante `p` con uno de los valores posibles de `v`.

Ten en cuenta que actualmente solo admitimos propiedades discriminantes de tipos de cadenas literales.
Tenemos la intención de agregar más adelante soporte para tipos literales booleanos y numéricos.

## El tipo `never`

*TypeScript 2.0* introduce un nuevo tipo primitivo `never`.
El tipo `never` representa el tipo de valores que nunca ocurren.
Específicamente, `never` es el tipo de retorno para funciones que nunca regresan y `never` es el tipo de variables bajo protecciones de tipo que nunca son `true`.

El tipo `never` tiene las siguientes características:

- `never` es un subtipo y se puede asignar a todos los tipos.
- Ningún tipo es un subtipo de o asignable a `never` (excepto `never` en sí mismo).
- En una expresión de función o función de flecha sin anotación de tipo de retorno, si la función no tiene declaraciones `return`, o solo declaraciones `return` con expresiones de tipo `never`, y si el punto final de la función no es accesible (como determinado por el análisis de control de flujo ), el tipo de retorno inferido para la función es `never`.
- En una función con una anotación explícita de tipo de retorno `never`, todas las declaraciones de `return` (si las hay) deben tener expresiones de tipo `never` y el punto final de la función no debe ser accesible.

Debido a que `never` es un subtipo de todos los tipos, siempre se omite de los tipos unión y se ignora en la inferencia del tipo de retorno de la función siempre que se devuelvan otros tipos.

Algunos ejemplos de funciones que regresan `never`:

```ts
// La función que regresa never debe tener un punto final inalcanzable
function error(message: string): never {
  throw new Error(message);
}

// El tipo de retorno inferido es never
function fail() {
  return error("Algo falló");
}

// La función que regresa never debe tener un punto final inalcanzable
function infiniteLoop(): never {
  while (true) {}
}
```

Algunos ejemplos de uso de funciones que devuelven `never`:

```ts
// El tipo de retorno inferido es number
function move1(direction: "up" | "down") {
  switch (direction) {
    case "up":
      return 1;
    case "down":
      return -1;
  }
  return error("Should never get here");
}

// El tipo de retorno inferido es number
function move2(direction: "up" | "down") {
  return direction === "up"
    ? 1
    : direction === "down"
    ? -1
    : error("Should never get here");
}

// El tipo de retorno inferido es T
function check<T>(x: T | undefined) {
  return x || error("Undefined value");
}
```

Debido a que `never` se puede asignar a todos los tipos, se puede usar una función que devuelva `never` cuando se requiera una devolución de llamada que devuelva un tipo más específico:

```ts
function test(cb: () => string) {
  let s = cb();
  return s;
}

test(() => "hello");
test(() => fail());
test(() => {
  throw new Error();
});
```

## Propiedades de solo lectura e índice de firmas

Ahora se puede declarar una propiedad o un índice de firma con el modificador `readonly` que se considera de solo lectura.

Las propiedades de solo lectura pueden tener iniciadores y se pueden asignar en constructores dentro de la misma declaración de clase, pero de lo contrario no se permiten las asignaciones a propiedades de solo lectura.

Además, las entidades *implícitamente* son de solo lectura en varias situaciones:

- Una propiedad declarada con un descriptor de acceso `get` y sin descriptor de acceso `set` se considera de solo lectura.
- En el tipo de un objeto `enum`, los miembros `enum` se consideran propiedades de solo lectura.
- En el tipo de objeto `module`, las variables `const` exportadas se consideran propiedades de solo lectura.
- Una entidad declarada en una declaración de `import` se considera de solo lectura.
- Una entidad a la que se accede a través de una importación de espacio de nombres *ES2015* se considera de solo lectura (por ejemplo, `foo.x` es de solo lectura cuando `foo` se declara como `import * as foo from "foo"`).

#### Ejemplo

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}

var p1: Point = { x: 10, y: 20 };
p1.x = 5; // Error, p1.x es de solo lectura

var p2 = { x: 1, y: 1 };
var p3: Point = p2; // Bien, alias de solo lectura para p2
p3.x = 5; // Error, p3.x es de solo lectura
p2.x = 5; // Bien, pero también cambia p3.x debido al alias
```

```ts
class Foo {
  readonly a = 1;
  readonly b: string;
  constructor() {
    this.b = "hello"; // Asignación permitida en constructor
  }
}
```

```ts
let a: Array<number> = [0, 1, 2, 3, 4];
let b: ReadonlyArray<number> = a;
b[5] = 5; // Error, los elementos son de solo lectura
b.push(5); // Error, no hay método de inserción (porque muta el arreglo)
b.length = 3; // Error, length es de solo lectura
a = b; // Error, faltan métodos mutantes
```

## Especificar el tipo de `this` para funciones

Después de especificar el tipo de `this` en una clase o interfaz, las funciones y los métodos ahora pueden declarar el tipo de `this` que esperan.

De manera predeterminada, el tipo de `this` dentro de una función es `any`.
A partir de *TypeScript 2.0*, puedes proporcionar un parámetro `this` explícito.
Los parámetros `this` son parámetros falsos que aparecen primero en la lista de parámetros de una función:

```ts
function f(this: void) {
  // asegúrate de que `this` no se pueda usar en esta función independiente
}
```

### Parámetros `this` en devoluciones de llamada

Las bibliotecas también pueden usar los parámetros `this` para declarar cómo se invocarán las devoluciones de llamada.

#### Ejemplo

```ts
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

`this: void` significa que `addClickListener` espera que `onclick` sea una función que no requiera un tipo `this`.

Ahora, si anotas el código de llamada con `this`:

```ts
class Handler {
  info: string;
  onMalClic(this: Controlador, e: Event) {
    // oops, usé `this` aquí. el uso de esta devolución de llamada se bloqueará en el entorno de ejecución
    this.info = e.message;
  }
}
let h = new Handler();
uiElement.addClickListener(h.onClickBad); // ¡error!
```

### `--noImplicitThis`

También se agrega una nueva marca en *TypeScript 2.0* para marcar todos los usos de `this` en funciones sin una anotación de tipo explícita.

## Soporte global en `tsconfig.json`

¡¡El soporte global está aquí!! El soporte global ha sido [una de las características más solicitadas](https://github.com/Microsoft/TypeScript/issues/1927).

Los patrones de archivo tipo globo son compatibles con dos propiedades [`include`](/tsconfig#include) y `exclude`.

#### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true,
    "outFile": "../../built/local/tsc.js",
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

Los comodines admitidos de `glob` son:

- `*` coincide con cero o más caracteres (excluyendo los separadores de directorio)
- `?` coincide con cualquier carácter (excluyendo los separadores de directorio)
- `**/` coincide de forma recursiva con cualquier subdirectorio

Si un segmento de un patrón `glob` incluye solo `*` o `.*`, entonces solo se incluyen archivos con extensiones compatibles (por ejemplo, `.ts`, `.tsx` y `.d.ts` de manera predeterminada con `. js` y `.jsx` si [`allowJs`](/tsconfig#allowJs) se establece en `true`).

Si [`files`](/tsconfig#files) e [`include`](/tsconfig#include) se dejan sin especificar, el compilador de manera predeterminada incluye todos los *TypeScript* (`.ts`, `.d.ts` y `.tsx`) en el directorio y subdirectorios que los contienen, excepto los excluidos mediante la propiedad `exclude`. Los archivos *JS* (`.js` y `.jsx`) también se incluyen si [`allowJs`](/tsconfig#allowJs) se establece en `true`.

Si se especifican las propiedades [`files`](/tsconfig#files) o [`include`](/tsconfig#include), el compilador incluirá en su lugar la unión de los archivos incluidos por esas dos propiedades.
Los archivos en el directorio especificado usando la opción del compilador [`outDir`](/tsconfig#outDir) siempre se excluyen a menos que se incluyan explícitamente a través de la propiedad [`files`](/tsconfig#files) (incluso cuando se especifica la propiedad `exclude` ).

Los archivos incluidos usando [`include`](/tsconfig#include) se pueden filtrar usando la propiedad `exclude`.
Sin embargo, los archivos incluidos explícitamente usando la propiedad [`files`](/tsconfig#files) siempre se incluyen independientemente de `exclude`.
La propiedad `exclude` de manera predeterminada excluye los directorios `node_modules`, `bower_components` y `jspm_packages` cuando no se especifican.

## Mejoras en la resolución de módulos: `BaseUrl`, mapeo de rutas, `rootDirs` y rastreo

*TypeScript 2.0* proporciona un conjunto de botones de resolución de módulo adicionales para *informar* al compilador dónde encontrar declaraciones para un módulo determinado.

Consulta la documentación de [Resolución de módulo](http://www.typescriptlang.org/docs/handbook/module-resolution.html) para obtener más detalles.

### *URL* base

El uso de [`baseUrl`](/tsconfig#baseUrl) es una práctica común en aplicaciones que usan cargadores de módulos *AMD* donde los módulos se "implementan" en un solo directorio en el entorno de ejecución.
Se supone que todas las importaciones de módulos con nombres no relativos son relativas a [`baseUrl`](/tsconfig#baseUrl).

#### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": "./modules"
  }
}
```

Ahora las importaciones a `"moduleA"` se buscarían en `./Modules/moduleA`

```ts
import A from "moduleA";
```

### Mapeo de rutas

A veces, los módulos no se encuentran directamente en `baseUrl`.
Los cargadores utilizan una configuración de mapeo para asignar nombres de módulos a archivos en el entorno de ejecución, consulta la [documentación de *RequireJs*](http://requirejs.org/docs/api.html#config-paths) y la [documentación de *SystemJS*](https://github.com/systemjs/systemjs/blob/master/docs/import-maps.md).

El compilador `TypeScript` admite la declaración de tales mapeos usando la propiedad [`path`(/tsconfig#path) en los archivos `tsconfig.json`.

#### Ejemplo

Por ejemplo, una importación a un módulo `"jquery"` se traduciría en el entorno de ejecución a `"node_modules/jquery/dist/jquery.slim.min.js"`.

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": "./node_modules",
    "paths": {
      "jquery": ["jquery/dist/jquery.slim.min"]
    }
}
```

El uso de [`paths`](/tsconfig#paths) también permite mapeos más sofisticados que incluyen múltiples ubicaciones alternativas.
Considera una configuración de proyecto en la que solo algunos módulos están disponibles en una ubicación y el resto en otra.

### Directorios virtuales con `rootDirs`

Usar `'rootDirs'`, puede informar al compilador de las `roots` que componen este directorio "virtual";
y así el compilador puede resolver las importaciones de módulos relativos dentro de estos directorios "virtuales" *como si* estuvieran fusionados en un directorio.

#### Ejemplo

Dada esta estructura de proyecto:

```tree
 src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

Un paso de compilación copiará los archivos en `/src/views` y `/generated/templates/views` en el mismo directorio en la salida.
En el entorno de ejecución, una vista puede esperar que su plantilla exista junto a ella y, por lo tanto, debería importarla usando un nombre relativo como `"./template"`.

[`rootDirs`[(/tsconfig#rootDirs) especifica una lista de `roots` cuyo contenido se espera que se fusionen en el entorno de ejecución.
Entonces, siguiendo nuestro ejemplo, el archivo `tsconfig.json` se debería ver así:

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src/views", "generated/templates/views"]
  }
}
```

### Seguimiento de la resolución de módulo

[`traceResolution`](/tsconfig#traceResolution) ofrece una forma práctica de comprender cómo el compilador ha resuelto los módulos.

```shell
tsc --traceResolution
```

## Declaración de módulos ambientales abreviados

Si no deseas tomarte el tiempo para escribir declaraciones antes de usar un nuevo módulo, ahora puedes usar una declaración abreviada para comenzar rápidamente.

#### `declarations.d.ts`

```ts
declare module "hot-new-module";
```

Todas las importaciones de una declaración abreviada de módulo tendrán el tipo `any`.

```ts
import x, { y } from "hot-new-module";
x(y);
```

## Carácter comodín en los nombres de los módulos

Importar recursos sin código utilizando la extensión de cargadores de módulos (por ejemplo, [*AMD*](https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md) o [*SystemJS*](https://github.com/systemjs/systemjs/blob/master/docs/module-types.md)) no ha sido fácil antes;
previamente se tenía que definir una declaración de módulo ambiental para cada recurso.

*TypeScript 2.0* admite el uso del carácter comodín (`*`) para declarar una "familia" de nombres de módulo;
de esta manera, solo se requiere una declaración una vez para una extensión y no para cada recurso.

#### Ejemplo

```ts
declare module "*!text" {
  const content: string;
  export default content;
}
// Algunos lo hacen al revés.
declare module "json!*" {
  const value: any;
  export default value;
}
```

Ahora puedes importar cosas que coincidan con `"*!text"` o `"json!*"`.

```ts
import fileContent from "./xyz.txt!text";
import data from "json!http://example.com/data.json";
console.log(data, fileContent);
```

Los nombres de los módulos comodín pueden ser incluso más útiles cuando se migra desde un código base sin tipar.
Combinado con declaraciones de módulos ambientales abreviados, un conjunto de módulos se puede declarar fácilmente como `any`.

#### Ejemplo

```ts
declare module "myLibrary/*";
```

Todas las importaciones a cualquier módulo bajo `myLibrary` serían consideradas como de tipo `any` por el compilador;
por lo tanto, cerrando cualquier control sobre las formas o tipos de estos módulos.

```ts
import { readFile } from "myLibrary/fileSystem/readFile";

readFile(); // readFile es 'any'
```

## Soporte para definiciones de módulos *UMD*

Algunas bibliotecas están diseñadas para usarse en muchos cargadores de módulos o sin carga de módulos (variables globales).
Estos se conocen como módulos [*UMD*](https://github.com/umdjs/umd) o [*Isomorphic*](http://isomorphic.net).
Se puede acceder a estas bibliotecas mediante una importación o una variable global.

Por ejemplo:

##### math-lib.d.ts

```ts
export const isPrime(x: number): boolean;
export as namespace mathLib;
```

Luego, la biblioteca se puede usar como una importación dentro de los módulos:

```ts
import { isPrime } from "math-lib";
isPrime(2);
mathLib.isPrime(2); // ERROR: no puedes usar la definición global desde dentro de un módulo
```

También se puede utilizar como variable global, pero solo dentro de un script.
(Un script es un archivo sin importaciones ni exportaciones).

```ts
mathLib.isPrime(2);
```

## Propiedades de clase opcionales

Las propiedades y métodos opcionales ahora se pueden declarar en clases, de manera similar a lo que ya está permitido en las interfaces.

#### Ejemplo

```ts
class Bar {
  a: number;
  b?: number;
  f() {
    return 1;
  }
  g?(): number; // El cuerpo del método opcional se puede omitir
  h?() {
    return 2;
  }
}
```

Cuando se compilan en modo [`strictNullChecks`](/tsconfig#strictNullChecks), las propiedades y métodos opcionales tienen automáticamente incluido `undefined` en su tipo. Por lo tanto, la propiedad `b` anterior es de tipo `number | undefined` y el método `g` anterior es de tipo `(() => number) | undefined`.
Los protectores de tipos se pueden utilizar para eliminar la parte `undefined` del texto:

```ts
function test(x: Bar) {
  x.a; // number
  x.b; // number | undefined
  x.f; // () => number
  x.g; // (() => number) | undefined
  let f1 = x.f(); // number
  let g1 = x.g && x.g(); // number | undefined
  let g2 = x.g ? x.g() : 0; // number
}
```

## Constructores privados y protegidos

Un constructor de clase puede estar marcado como `private` o `protected`.
No se puede crear una instancia de una clase con un constructor privado fuera del cuerpo de la clase y no se puede extender.
No se puede crear una instancia de una clase con un constructor protegido fuera del cuerpo de la clase, pero se puede extender.

#### Ejemplo

```ts
class Singleton {
  private static instance: Singleton;

  private constructor() {}

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

let e = new Singleton(); // Error: El constructor de 'Singleton' es privado.
let v = Singleton.getInstance();
```

## Propiedades abstractas y descriptores de acceso

Una clase abstracta puede declarar propiedades abstractas y/o descriptores de acceso.
Cualquier subclase deberá declarar las propiedades abstractas o marcarse como abstracta.
Las propiedades abstractas no pueden tener un iniciador.
Los descriptores de acceso abstractos no pueden tener cuerpo.

#### Ejemplo

```ts
abstract class Base {
  abstract name: string;
  abstract get value();
  abstract set value(v: number);
}

class Derived extends Base {
  name = "derived";

  value = 1;
}
```

## Índice de firmas implícito

Un tipo literal de objeto ahora se puede asignar a un tipo con un índice de firma si todas las propiedades conocidas en el objeto literal se pueden asignar a ese índice de firmas. Esto hace posible pasar una variable que se inició con un objeto literal como parámetro a una función que espera un mapa o diccionario:

```ts
function httpService(path: string, headers: { [x: string]: string }) {}

const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
};

httpService("", { "Content-Type": "application/x-www-form-urlencoded" }); // Bien
httpService("", headers); // Ahora bien, antes no
```

## Incluyendo declaraciones de tipo integradas con `--lib`

Llegar a las declaraciones de *API*s incorporadas de *ES6*/*ES2015* solo se limitaron a `target: ES6`.
Ingresa [`lib`](/tsconfig#lib); con [`lib`](/tsconfig#lib) puedes especificar una lista de grupos de declaración de *API*s incorporados que puedes elegir incluir en tu proyecto.
Por ejemplo, si esperas que tu entorno de ejecución sea compatible con `Map`, `Set` y `Promise` (por ejemplo, la mayoría de los navegadores perenne de la actualidad), solo incluyen `--lib es2015.collection, es2015.promise`.
Del mismo modo, puedes excluir declaraciones que no deseas incluir en tu proyecto, p. ej. *DOM* si estás trabajando en un proyecto de nodo usando `--lib es5, es6`.

Aquí hay una lista de grupos *API* disponibles:

- `dom`
- `webworker`
- `es5`
- `es6/es2015`
- `es2015.core`
- `es2015.collection`
- `es2015.iterable`
- `es2015.promise`
- `es2015.proxy`
- `es2015.reflect`
- `es2015.generator`
- `es2015.symbol`
- `es2015.symbol.wellknown`
- `es2016`
- `es2016.array.include`
- `es2017`
- `es2017.object`
- `es2017.sharedmemory`
- `scripthost`

#### Ejemplo

```bash
tsc --target es5 --lib es5,es2015.promise
```

```json tsconfig
"compilerOptions": {
    "lib": ["es5", "es2015.promise"]
}
```

## Marca las declaraciones no utilizadas con `--noUnusedParameters` y `--noUnusedLocals`

*TypeScript 2.0* tiene dos nuevos indicadores para ayudarte a mantener una código base limpio.
[`noUnusedParameters`](/tsconfig#noUnusedParameters) marca cualquier función no utilizada o errores de parámetros de método.
[`noUnusedLocals`](/tsconfig#noUnusedLocals) marca cualquier declaración local no utilizada (no exportada) como variables, funciones, clases, importaciones, etc.
Además, los miembros privados no utilizados de una clase se marcarían como errores en [`noUnusedLocals`](/tsconfig#noUnusedLocals).

#### Ejemplo

```ts
import B, { readFile } from "./b";
//     ^ Error: `B` declarado pero nunca usado
readFile();

export function write(message: string, args: string[]) {
  //                                 ^^^^  Error: 'arg' declarado pero nunca usado.
  console.log(message);
}
```

La declaración de parámetros con nombres que comienzan con `_` están exentas de la verificación de parámetros no utilizados.
p.ej.:

```ts
function returnNull(_a) {
  // Bien
  return null;
}
```

## Los identificadores de módulo permiten la extensión `.js`

Antes de *TypeScript 2.0*, siempre se suponía que un identificador de módulo no tenía extensión;
por ejemplo, dada una importación como `import d from "./moduleA.js"`, el compilador buscó la definición de `"moduleA.js"` en `./moduleA.js.ts` o `./moduleA.js.d.ts`.
Esto dificultó el uso de herramientas de agrupación/carga como [*SystemJS*](https://github.com/systemjs/systemjs) que esperan *URI* en su identificador de módulo.

Con *TypeScript 2.0*, el compilador buscará la definición de `"moduleA.js"` en `./ModuleA.ts` o `./ModuleA.d.ts`.

## Soporte de `'target`: es5'` con `'module: es6'`

Anteriormente marcado como una combinación de banderas no válida, `target: es5` y `'module: es6'` ahora es compatible.
Esto debería facilitar el uso de vibradores de árboles basados ​​en *ES2015* como [`rollup`](https://github.com/rollup/rollup).

## Comas finales en listas de parámetros y argumentos de funciones

Ahora se permiten las comas finales en las listas de parámetros y argumentos de la función.
Esta es una implementación para una [propuesta de *ECMAScript* de etapa 3](https://jeffmo.github.io/es-trailing-function-commas/) que emite hasta un *ES3*/*ES5*/*ES6* válido.

#### Ejemplo

```ts
function foo(
  bar: Bar,
  baz: Baz // las comas finales están bien en las listas de parámetros
) {
  // Implementación...
}

foo(
  bar,
  baz // y en listas de argumentos
);
```

## Nuevo `--skipLibCheck`

*TypeScript 2.0* agrega una nueva opción de compilador [`skipLibCheck`](/tsconfig#skipLibCheck) que hace que se omita la verificación de tipos de archivos de declaración (archivos con extensión `.d.ts`).
Cuando un programa incluye archivos de declaración grandes, el compilador pasa mucho tiempo verificando declaraciones que ya se sabe que no contienen errores, y los tiempos de compilación se pueden reducir significativamente al omitir las verificaciones del tipo de archivo de declaración.

Dado que las declaraciones en un archivo pueden afectar la verificación de tipos en otros archivos, es posible que algunos errores no se detecten cuando se especifica [`skipLibCheck`](/tsconfig#skipLibCheck).
Por ejemplo, si un archivo de no declaración aumenta un tipo declarado en un archivo de declaración, se pueden producir errores que solo se informan cuando se comprueba el archivo de declaración.
Sin embargo, en la práctica estas situaciones son raras.

## Permitir identificadores duplicados en declaraciones

Esta ha sido una fuente común de errores de definición duplicados.
Múltiples archivos de declaración que definen los mismos miembros en interfaces.

*TypeScript 2.0* relaja esta restricción y permite identificadores duplicados en bloques, siempre que tengan tipos *idénticos*.

Dentro del mismo bloque, las definiciones duplicadas aún no están permitidas.

#### Ejemplo

```ts
interface Error {
  stack?: string;
}

interface Error {
  code?: string;
  path?: string;
  stack?: string; // Bien
}
```

## Nueva `--declarationDir`

[`declarationDir`](/tsconfig#declarationDir) permite generar archivos de declaración en una ubicación diferente a los archivos *JavaScript*.

## TypeScript 1.8

## Escribe parámetros como restricciones

Con *TypeScript 1.8* es posible que una restricción de parámetro de tipo haga referencia a parámetros de tipo de la misma lista de parámetros de tipo. Anteriormente, esto era un error. Esta capacidad generalmente se conoce como [Polimorfismo delimitado por `F`](https://wikipedia.org/wiki/Bounded_quantification#F-bounded_quantification).

##### Ejemplo

```ts
function assign<T extends U, U>(target: T, source: U): T {
  for (let id in source) {
    target[id] = source[id];
  }
  return target;
}

let x = { a: 1, b: 2, c: 3, d: 4 };
assign(x, { b: 10, d: 20 });
assign(x, { e: 0 }); // Error
```

## Controlar errores de análisis de flujo

*TypeScript 1.8* introduce el análisis de control de flujo para ayudar a detectar errores comunes con los que los usuarios tienden a encontrarse.
Sigue leyendo para obtener más detalles y ver estos errores en acción:

![cfa](https://cloud.githubusercontent.com/assets/8052307/5210657/c5ae0f28-7585-11e4-97d8-86169ef2a160.gif)

### Código inalcanzable

Las declaraciones que se garantiza que no se ejecutarán en entorno de ejecución ahora se marcan correctamente como errores de código inalcanzable. Por ejemplo, las declaraciones que siguen a declaraciones incondicionales `return`, `throw`, `break` o `continue` se consideran inalcanzables. Utiliza [`allowUnreachableCode`](/tsconfig#allowUnreachableCode) para deshabilitar la detección y los informes de código inaccesible.

##### Ejemplo

A continuación, se muestra un ejemplo sencillo de un error de código inalcanzable:

```ts
function f(x) {
  if (x) {
    return true;
  } else {
    return false;
  }

  x = 0; // Error: Código inaccesible detectado.
}
```

Un error más común que detecta esta característica es agregar una nueva línea después de una declaración `return`:

```ts
function f() {
  return; // Inserción automática de punto y coma activada en nueva línea
  {
    x: "string"; // Error: Código inaccesible detectado.
  }
}
```

Dado que *JavaScript* termina automáticamente la declaración `return` al final de la línea, el objeto literal se convierte en un bloque.

### Etiquetas no utilizadas

Las etiquetas no utilizadas también se marcan. Al igual que las comprobaciones de código inalcanzable, están activadas de forma predeterminada; usa [`allowUnusedLabels`](/tsconfig#allowUnusedLabels) para dejar de reportar estos errores.

##### Ejemplo

```ts
loop: while (x > 0) {
  // Error: Etiqueta no utilizada.
  x++;
}
```

### Devoluciones implícitas

Las funciones con rutas de código que no devuelven un valor en *JS* devuelven implícitamente `undefined`. Ahora el compilador los puede marcar como devoluciones implícitas. La verificación está desactivada de forma predeterminada; usa [`noImplicitReturns`](/tsconfig#noImplicitReturns) para activarla.

##### Ejemplo

```ts
function f(x) {
  // Error: No todas las rutas de código devuelven un valor.
  if (x) {
    return false;
  }

  // devuelve implícitamente "undefined"
}
```

### Fallos de la cláusula `case`

*TypeScript* puede informar errores para casos fallidos en la instrucción `switch` donde la cláusula `case` no está vacía.
Esta verificación está desactivada de forma predeterminada y se puede habilitar usando [`noFallthroughCasesInSwitch`](/tsconfig#noFallthroughCasesInSwitch).

##### Ejemplo

Con [`noFallthroughCasesInSwitch`](/tsconfig#noFallthroughCasesInSwitch), este ejemplo desencadenará un error:

```ts
switch (x % 2) {
  case 0: // Error: Caso de caída en el switch.
    console.log("par");

  case 1:
    console.log("impar");
    break;
}
```

Sin embargo, en el siguiente ejemplo, no se reportará ningún error porque el caso alternativo está vacío:

```ts
switch (x % 3) {
  case 0:
  case 1:
    console.log("Acceptable");
    break;

  case 2:
    console.log("This is *two much*!");
    break;
}
```

## Componentes de la función sin estado en *React*

*TypeScript* ahora admite [componentes de función sin estado](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions).
Estos son componentes ligeros que conforman fácilmente otros componentes:

```ts
// Utiliza la desestructuración de parámetros y los valores predeterminados para una fácil definición del tipo 'props'
const Greeter = ({ name = "world" }) => <div>Hello, {name}!</div>;

// Las propiedades se validan
let example = <Greeter name="TypeScript 1.8" />;
```

Para esta función y accesorios simplificados, asegúrate de utilizar la [última versión de `react.d.ts`](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/react).

## Gestión simplificada de tipos `props` en *React*

En *TypeScript 1.8* con la última versión de `react.d.ts` (ve arriba), también hemos simplificado enormemente la declaración de tipos `props`.

Específicamente:

- Ya no es necesario declarar explícitamente `ref` y `key` o `extend React.Props`
- Las propiedades `ref` y `key` aparecerán con los tipos correctos en todos los componentes
- La propiedad `ref` está correctamente prohibida en instancias de componentes de función sin estado

## Aumento del alcance (global/módulo) de los módulos

Los usuarios ahora pueden declarar cualquier aumento que quieran hacer, o que cualquier otro consumidor ya haya hecho, a un módulo existente.
Los aumentos de módulos se ven como declaraciones simples de módulos ambientales antiguos (es decir, la sintaxis `declare module "foo" {}`), y están anidados directamente en sus propios módulos o en otro módulo externo del ambiente de nivel superior.

Además, *TypeScript* también tiene la noción de aumentos *global*es de la forma `declare global {}`.
Esto permite que los módulos aumenten los tipos globales como `Array` si es necesario.

El nombre de un aumento de módulo se resuelve utilizando el mismo conjunto de reglas que los especificadores de módulo en las declaraciones de importación y exportación.
Las declaraciones en un aumento de módulo se fusionan con cualquier declaración existente de la misma manera que lo harían si estuvieran declaradas en el mismo archivo.

Ni los aumentos de módulo ni los aumentos globales pueden agregar nuevos elementos al alcance de nivel superior. sólo pueden "parchear" declaraciones existentes.

##### Ejemplo

Aquí, `map.ts` puede declarar que parcheará internamente el tipo `Observable` de `observable.ts` y le agregará el método `map`.

```ts
// observable.ts
export class Observable<T> {
  // ...
}
```

```ts
// map.ts
import { Observable } from "./observable";

// Crea un aumento para "./observable"
declare module "./observable" {

    // Aumenta la definición de la clase 'Observable' con la combinación de interfaces
    interface Observable<T> {
        map<U>(proj: (el: T) => U): Observable<U>;
    }

}

Observable.prototype.map = /*...*/;
```

```ts
// consumer.ts
import { Observable } from "./observable";
import "./map";

let o: Observable<number>;
o.map((x) => x.toFixed());
```

De manera similar, el alcance global se puede aumentar a partir de módulos usando declaraciones `declare global`:

##### Ejemplo

```ts
// Se asegura de que se trate como un módulo.
export {};

declare global {
  interface Array<T> {
    mapToNumbers(): number[];
  }
}

Array.prototype.mapToNumbers = function () {
  /* ... */
};
```

## Tipos de cadena literal

No es raro que una *API* espere un conjunto específico de cadenas para ciertos valores.
Por ejemplo, considera una biblioteca de la *IU* que puede mover elementos a través de la pantalla mientras controla la ["suavización" de la animación](https://wikipedia.org/wiki/Inbetweening).

```ts
declare class UIElement {
  animate(options: AnimationOptions): void;
}

interface AnimationOptions {
  deltaX: number;
  deltaY: number;
  easing: string; // Puede ser de "entrada fácil", "salida fácil", "fácil entrada y salida"
}
```

Sin embargo, esto es propenso a errores ⏤ no hay nada que impida que un usuario accidentalmente escriba mal uno de los valores de aceleración válidos:

```ts
// Sin errores
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

Con *TypeScript 1.8*, hemos introducido tipos de cadenas literales.
Estos tipos se escriben de la misma forma que las cadenas literales, pero en posiciones de tipo.

Los usuarios ahora se pueden asegurar de que el sistema de tipos detectará tales errores.
Aquí están nuestras nuevas `AnimationOptions` usando tipos de cadenas literales:

```ts
interface AnimationOptions {
  deltaX: number;
  deltaY: number;
  easing: "ease-in" | "ease-out" | "ease-in-out";
}

// Error: El tipo '"ease-inout"' no se puede asignar al tipo "ease-in" | "ease-out" | "ease-in-out"'
new UIElement().animate({ deltaX: 100, deltaY: 100, easing: "ease-inout" });
```

## Inferencia de tipo unión/intersección mejorada

*TypeScript 1.8* mejora la inferencia de tipos que involucran lados de origen y destino que son tipos unión o intersección.
Por ejemplo, al inferir `string | string[]` a `string | T`, reducimos los tipos a `string[]` y `T`, infiriendo así `string[]` para `T`.

##### Ejemplo

```ts
type Maybe<T> = T | void;

function isDefined<T>(x: Maybe<T>): x is T {
  return x !== undefined && x !== null;
}

function isUndefined<T>(x: Maybe<T>): x is void {
  return x === undefined || x === null;
}

function getOrElse<T>(x: Maybe<T>, defaultValue: T): T {
  return isDefined(x) ? x : defaultValue;
}

function test1(x: Maybe<string>) {
  let x1 = getOrElse(x, "Undefined"); // string
  let x2 = isDefined(x) ? x : "Undefined"; // string
  let x3 = isUndefined(x) ? "Undefined" : x; // string
}

function test2(x: Maybe<number>) {
  let x1 = getOrElse(x, -1); // number
  let x2 = isDefined(x) ? x : -1; // number
  let x3 = isUndefined(x) ? -1 : x; // number
}
```

## Concatenar los módulos `AMD` y `System` con `--outFile`

Especificar [`outFile`](/tsconfig#outFile) junto con `--module amd` o `--module system` concatenará todos los módulos en la compilación en un solo archivo de salida que contiene múltiples cierres de módulos.

Se calculará un nombre de módulo para cada módulo en función de su ubicación relativa a [`rootDir`](/tsconfig#rootDir).

##### Ejemplo

```ts
// file src/a.ts
import * as B from "./lib/b";
export function createA() {
  return B.createB();
}
```

```ts
// archivo src/lib/b.ts
export function createB() {
  return {};
}
```

Resultados en:

```js
define("lib/b", ["require", "exports"], function (require, exports) {
  "use strict";
  function createB() {
    return {};
  }
  exports.createB = createB;
});
define("a", ["require", "exports", "lib/b"], function (require, exports, B) {
  "use strict";
  function createA() {
    return B.createB();
  }
  exports.createA = createA;
});
```

## Soporte para la interoperabilidad de importación `default` con *SystemJS*

Los cargadores de módulos como *SystemJS* envuelven los módulos *CommonJS* y los exponen como una importación *ES6* `default`. Esto hace que sea imposible compartir los archivos de definición entre la implementación de *SystemJS* y *CommonJS* del módulo, ya que la forma del módulo se ve diferente según el cargador.

Establecer la nueva marca del compilador [`allowSyntheticDefaultImports`](/tsconfig#allowSyntheticDefaultImports) indica que el cargador del módulo realiza algún tipo de creación de miembros de importación predeterminados sintéticos no indicados en los `.ts` o `.d.ts` importados. El compilador inferirá la existencia de una exportación `default` que tiene la forma de todo el módulo.

Los módulos del sistema tienen esta bandera activada de forma predeterminada.

## Permite `let`/`const` capturados en bucles

Anteriormente un error, ahora compatible con *TypeScript 1.8*.
Las declaraciones `let`/`const` dentro de los bucles y capturadas en funciones ahora se emiten para coincidir correctamente con la fresca semántica de `let`/`const`.

##### Ejemplo

```ts
let list = [];
for (let i = 0; i < 5; i++) {
  list.push(() => i);
}

list.forEach((f) => console.log(f()));
```

is compiled to:

```js
var list = [];
var _loop_1 = function (i) {
  list.push(function () {
    return i;
  });
};
for (var i = 0; i < 5; i++) {
  _loop_1(i);
}
list.forEach(function (f) {
  return console.log(f());
});
```

Y resulta en

```Shell
0
1
2
3
4
```

## Comprobación mejorada de declaraciones `for..in`

Anteriormente, el tipo de una variable `for..in` se infería como `any`; que permitía al compilador ignorar los usos no válidos dentro del cuerpo `for..in`.

Comenzando con *TypeScript 1.8*:

- El tipo de una variable declarada en una instrucción `for..in` implícitamente es `string`.
- Cuando un objeto con un índice de firma numérico de tipo `T` (como un arreglo) es indexado por una variable `for..in` de una declaración que contiene `for..in` para un objeto *con* un índice de firma numérico y *sin* un índice de firma de cadena (nuevamente como un arreglo), el valor producido es de tipo `T`.

##### Ejemplo

```ts
var a: MyObject[];
for (var x in a) {
  // El tipo de x implícitamente es string
  var obj = a[x]; // El tipo de obj es MyObject
}
```

## Los módulos ahora se emiten con un prólogo `"use strict";`

Los módulos siempre se analizaron en modo estricto según *ES6*, pero para los objetivos que no son de *ES6*, esto no se respetó en el código generado. A partir de *TypeScript 1.8*, los módulos emitidos siempre están en modo estricto. Esto no debería tener ningún cambio visible en la mayoría del código, ya que *TS* considera los errores de modo más estrictos como errores en tiempo de compilación, pero significa que algunas cosas que solían fallar silenciosamente en el entorno de ejecución en tu código *TS*, como asignar a `NaN`, ahora falla en voz alta. Puedes consultar el [artículo de *MDN*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Strict_mode) en modo estricto para obtener una lista detallada de las diferencias entre el modo estricto y el modo regular.

## Incluyendo archivos `.js` con `--allowJs`

A menudo, hay archivos fuente externos en tu proyecto que pueden no estar creados en *TypeScript*.
Alternativamente, es posible que estés en medio de convertir un código *JS* base en *TS*, pero aún deseas agrupar todo tu código *JS* en un solo archivo con la salida de tu nuevo código *TS*.

Los archivos `.js` ahora se permiten como entrada a `tsc`.
El compilador de *TypeScript* comprueba los archivos de entrada `.js` en busca de errores de sintaxis y emite una salida válida basada en los indicadores [`target`](/tsconfig#target) y [`module`](/tsconfig#module).
La salida también se puede combinar con otros archivos `.ts`.
Los mapas de fuente se siguen generando para archivos `.js` al igual que con los archivos `.ts`.

## Fábricas *JSX* personalizadas usando `--reactNamespace`

Pasar `--reactNamespace<JSX factory Name>` junto con `--jsx react` permite usar una fábrica *JSX* diferente de la`React` predeterminada.

El nuevo nombre de fábrica se utilizará para llamar a las funciones `createElement` y `__spread`.

##### Ejemplo

```ts
import { jsxFactory } from "jsxFactory";

var div = <div>Hello JSX!</div>;
```

Compilado con:

```shell
tsc --jsx react --reactNamespace jsxFactory --m commonJS
```

Resultados en:

```js
"use strict";
var jsxFactory_1 = require("jsxFactory");
var div = jsxFactory_1.jsxFactory.createElement("div", null, "Hello JSX!");
```

## Guardias basados ​​en el tipo de `this`

*TypeScript 1.8* extiende [funciones protectoras de tipo definido por el usuario](#funciones-protectoras-de-tipo-definido-por-el-usuario) a métodos de clase e interfaz.

`this is T` ahora es una anotación de tipo de retorno válida para métodos en clases e interfaces.
Cuando se usa en una posición de restricción de tipo (p. ej., declaración `if`), el tipo del objeto destino de la expresión de llamada se limitaría a `T`.

##### Ejemplo

```ts
class FileSystemObject {
  isFile(): this is File {
    return this instanceof File;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}

class File extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}
class Directory extends FileSystemObject {
  children: FileSystemObject[];
}
interface Networked {
  host: string;
}

let fso: FileSystemObject = new File("foo/bar.txt", "foo");
if (fso.isFile()) {
  fso.content; // fso es archivo
} else if (fso.isDirectory()) {
  fso.children; // fso es directorio
} else if (fso.isNetworked()) {
  fso.host; // fso está en red
}
```

## Paquete *NuGet* oficial de *TypeScript*

A partir de *TypeScript 1.8*, los paquetes oficiales de *NuGet* están disponibles para el compilador de *TypeScript* (`tsc.exe`), así como para la integración de *MSBuild* (`Microsoft.TypeScript.targets` y `Microsoft.TypeScript.Tasks.dll`).

Los paquetes estables están disponibles aquí:

- [`Microsoft.TypeScript.Compiler`](https://www.nuget.org/packages/Microsoft.TypeScript.Compiler/)
- [`Microsoft.TypeScript.MSBuild`](https://www.nuget.org/packages/Microsoft.TypeScript.MSBuild/)

Además, un paquete *NuGet* nocturno para que coincida con el [paquete `npm` nocturno](http://blogs.msdn.com/b/typescript/archive/2015/07/27/introducing-typescript-nightlies.aspx) está disponible en https://myget.org:

- [`TypeScript-Preview`](https://www.myget.org/gallery/typescript-preview)

## Mensajes de error más bonitos de `tsc`

Entendemos que una tonelada de salida monocromática puede ser un poco difícil para la vista.
Los colores pueden ayudar a discernir dónde comienza y termina un mensaje, y estas pistas visuales son importantes cuando la salida de errores se vuelve abrumadora.

Con solo pasar la opción de línea de comando [`pretty`](/tsconfig#pretty), *TypeScript* ofrece una salida más colorida con contexto sobre dónde van mal las cosas.

![Muestra bonitos mensajes de error en ConEmu](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/pretty01.png)

## Coloración del código *JSX* en *VS 2015*

Con *TypeScript 1.8*, las etiquetas *JSX* ahora están clasificadas y coloreadas en *Visual Studio 2015*.

![jsx](https://cloud.githubusercontent.com/assets/8052307/12271404/b875c502-b90f-11e5-93d8-c6740be354d1.png)

La clasificación se puede personalizar aún más cambiando la configuración de fuente y color para la configuración de fuente y color de `VB XML` a través de la página `Herramientas` ▹ `Opciones` ▹ `Entorno` ▹ `Fuentes y colores`.

## El indicador `--project` (`-p`) ahora puede tomar cualquier ruta de archivo

La opción de línea de comando `--project` originalmente solo podía tomar rutas a un directorio que contenía un `tsconfig.json`.
Dados los diferentes escenarios para las configuraciones de compilación, tenía sentido permitir que `--project` apunte a cualquier otro archivo *JSON* compatible.
Por ejemplo, un usuario puede querer apuntar a *ES2015* con módulos *CommonJS* para el *Node 5*, pero *ES5* con módulos *AMD* para el navegador.
Con este nuevo trabajo, los usuarios pueden administrar fácilmente dos destinos de compilación separados usando solo `tsc` sin tener que realizar soluciones improvisadas como colocar archivos `tsconfig.json` en directorios separados.

El comportamiento anterior sigue siendo el mismo si se le da un directorio ⏤ el compilador intentará encontrar en el directorio un archivo llamado `tsconfig.json`.

## Permitir comentarios en `tsconfig.json`

¡Siempre es bueno poder documentar tu configuración!
`tsconfig.json` ahora acepta comentarios de una o varias líneas.

```ts
{
    "compilerOptions": {
        "target": "ES2015", // ejecutándose en el node v5, yaay!
        "sourceMap": true   // facilita la depuración
    },
    /*
     * Archivos excluidos
      */
    "exclude": [
        "file.d.ts"
    ]
}
```

## Soporte de salida a archivos controlados por *IPC*

*TypeScript 1.8* permite a los usuarios usar el argumento [`outFile`](/tsconfig#outFile) con entidades especiales del sistema de archivos como tuberías con nombre, dispositivos, etc.

Como ejemplo, en muchos sistemas similares a *Unix*, se puede acceder al flujo de salida estándar mediante el archivo `/dev/stdout`.

```shell
tsc foo.ts --outFile /dev/stdout
```

Esto también se puede usar para canalizar la salida entre comandos.

Como ejemplo, podemos canalizar nuestro *JavaScript* emitido a una impresora bonita como [`pretty-js`](https://www.npmjs.com/package/pretty-js):

```shell
tsc foo.ts --outFile /dev/stdout | pretty-js
```

## Soporte mejorado para `tsconfig.json` en *Visual Studio 2015*

*TypeScript 1.8* permite archivos `tsconfig.json` en todos los tipos de proyectos.
Esto incluye proyectos *ASP.NET v4*, *Console Application* y *Html Application con tipos de proyectos TypeScript*.
Además, ya no estás limitado a un solo archivo `tsconfig.json`, sino que puedes agregar varios, y cada uno se creará como parte del proyecto.
Esto te permite separar la configuración para diferentes partes de tu aplicación sin tener que usar varios proyectos diferentes.

![Mostrando tsconfig.json en Visual Studio](https://raw.githubusercontent.com/wiki/Microsoft/TypeScript/images/new-in-typescript/tsconfig-in-vs.png)

También deshabilitamos la página de propiedades del proyecto cuando agregas un archivo `tsconfig.json`.
Esto significa que todos los cambios de configuración se deben realizar en el propio archivo `tsconfig.json`.

### Algunas limitaciones:

- Si agregas un archivo `tsconfig.json`, los archivos *TypeScript* que no se consideran parte de ese contexto no se compilan.
- Las aplicaciones de *Apache Cordova* todavía tienen la limitación existente de un solo archivo `tsconfig.json`, que debe estar en el directorio raíz o en el directorio `scripts`.
- No existe una plantilla para `tsconfig.json` en la mayoría de los tipos de proyectos.

## TypeScript 1.7

## Compatibilidad con `async`/`await` en los destinos *ES6* (*Node v4+*)

*TypeScript* ahora admite funciones asíncronas para motores que tienen soporte nativo para generadores *ES6*, p. ej. *Node v4* y superior.
Las funciones asincrónicas tienen como prefijo la palabra clave `async`; `await` suspende la ejecución hasta que se cumpla una promesa de devolución de función asíncrona y desenvuelve el valor de la `Promise` devuelta.

##### Ejemplo

En el siguiente ejemplo, cada elemento de entrada se imprimirá uno a la vez con un retraso de 200 ms:

```ts
"use strict";

// printDelayed es una 'Promise<void>'
async function printDelayed(elements: string[]) {
  for (const element of elements) {
    await delay(200);
    console.log(element);
  }
}

async function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

printDelayed(["Hello", "beautiful", "asynchronous", "world"]).then(() => {
  console.log();
  console.log("Printed every element!");
});
```

Para obtener más información, consulta la publicación de blog [Funciones asíncronas](http://blogs.msdn.com/b/typescript/archive/2015/11/03/what-about-async-await.aspx).

## Soporte para `--target ES6` con `--module`

*TypeScript 1.7* agrega `ES6` a la lista de opciones disponibles para la opción [`module`](/tsconfig#module) y te permite especificar la salida del módulo al apuntar a `ES6`. Esto proporciona más flexibilidad para apuntar exactamente a las funciones que deseas en entornos de ejecución específicos.

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "amd",
    "target": "es6"
  }
}
```

## `this`-tipado

Es un patrón común devolver el objeto actual (es decir, `this`) de un método para crear [*API*s de estilo fluido](https://wikipedia.org/wiki/Fluent_interface).
Por ejemplo, considera el siguiente módulo `BasicCalculator`:

```ts
export default class BasicCalculator {
  public constructor(protected value: number = 0) {}

  public currentValue(): number {
    return this.value;
  }

  public add(operand: number) {
    this.value += operand;
    return this;
  }

  public subtract(operand: number) {
    this.value -= operand;
    return this;
  }

  public multiply(operand: number) {
    this.value *= operand;
    return this;
  }

  public divide(operand: number) {
    this.value /= operand;
    return this;
  }
}
```

Un usuario podría expresar `2 * 5 + 1` como

```ts
import calc from "./BasicCalculator";

let v = new calc(2).multiply(5).add(1).currentValue();
```

Esto a menudo abre formas muy elegantes de escribir código; sin embargo, hubo un problema para las clases que querían extenderse desde `BasicCalculator`.
Imagina que un usuario quisiera empezar a escribir una 'Calculadora científica':

```ts
import BasicCalculator from "./BasicCalculator";

export default class ScientificCalculator extends BasicCalculator {
  public constructor(value = 0) {
    super(value);
  }

  public square() {
    this.value = this.value ** 2;
    return this;
  }

  public sin() {
    this.value = Math.sin(this.value);
    return this;
  }
}
```

Debido a que *TypeScript* solía inferir el tipo `BasicCalculator` para cada método en `BasicCalculator` que devolvía `this`, el sistema de tipos olvidaría que tenía `ScientificCalculator` siempre que se usara un método `BasicCalculator`.

Por ejemplo:

```ts
import calc from "./ScientificCalculator";

let v = new calc(0.5)
  .square()
  .divide(2)
  .sin() // Error: 'BasicCalculator' has no 'sin' method.
  .currentValue();
```

Este ya no es el caso ⏤ *TypeScript* ahora infiere que `this` tiene un tipo especial llamado `this` siempre que esté dentro de un método de instancia de una clase.
El tipo `this` se escribe así, y básicamente significa "el tipo del lado izquierdo del punto en una llamada a un método".

El tipo `this` también es útil con tipos de intersección para describir bibliotecas (por ejemplo, *Ember.js*) que usan patrones de estilo mixin para describir la herencia:

```ts
interface MyType {
  extend<T>(other: T): this & T;
}
```

## Operador de exponenciación *ES7*

*TypeScript 1.7* admite los próximos [operadores de exponenciación *ES7*/*ES2016*](https://github.com/rwaldron/exponentiation-operator): `**` y `**=`. Los operadores se transformarán en la salida a *ES3*/*ES5* usando `Math.pow`.

##### Ejemplo

```ts
var x = 2 ** 3;
var y = 10;
y **= 2;
var z = -(4 ** 3);
```

Generará la siguiente salida de *JavaScript*:

```js
var x = Math.pow(2, 3);
var y = 10;
y = Math.pow(y, 2);
var z = -Math.pow(4, 3);
```

## Comprobación mejorada de la desestructuración del objeto literal

*TypeScript 1.7* hace que la verificación de patrones de desestructuración con un objeto literal o iniciadores de arreglo literal sea menos rígida y más intuitiva.

Cuando un objeto literal se escribe contextualmente por el tipo implícito de un patrón de vinculación de objeto:

- Las propiedades con valores predeterminados en el patrón de vinculación de objetos se vuelven opcionales en el objeto literal.
- Las propiedades del patrón de vinculación de objetos que no coinciden en el objeto literal deben tener un valor predeterminado en el patrón de vinculación de objetos y se agregan automáticamente al tipo del objeto literal.
- Las propiedades del objeto literal que no coinciden con el patrón de vinculación del objeto son un error.

Cuando un arreglo literal se escribe contextualmente por el tipo implícito de un patrón de enlace de arreglo:

- Los elementos del patrón de enlace de arreglo que no coinciden en el arreglo literal deben tener un valor predeterminado en el patrón de enlace de arreglo y se agregan automáticamente al tipo de arreglo literal.

##### Ejemplo

```ts
// El tipo de f1 es (arg ?: { x?: number, y?: number }) => void
function f1({ x = 0, y = 0 } = {}) {}

// Y se puede llamar como:
f1();
f1({});
f1({ x: 1 });
f1({ y: 1 });
f1({ x: 1, y: 1 });

// El tipo de f2 es (arg?: (x: number, y?: number) => void
function f2({ x, y = 0 } = { x: 0 }) {}

f2();
f2({}); // Error, x no es opcional
f2({ x: 1 });
f2({ y: 1 }); // Error, x no es opcional
f2({ x: 1, y: 1 });
```

## Soporte para decoradores al apuntar a *ES3*

Los decoradores ahora están permitidos al apuntar a *ES3*. *TypeScript 1.7* elimina el uso específico de *ES5* de `reduceRight` del ayudante `__decorate`. Los cambios también incluyen llamadas en línea a `Object.getOwnPropertyDescriptor` y a `Object.defineProperty` de una manera compatible con versiones anteriores que permite limpiar el emisor para *ES5* y luego eliminando varias llamadas repetitivas a los métodos de `Object` antes mencionados.

## TypeScript 1.6

## Soporte *JSX*

*JSX* es una sintaxis similar a *XML* incrustable. Está destinada a transformarse en *JavaScript* válido, pero la semántica de esa transformación es específica de la implementación. *JSX* se hizo popular con la biblioteca *React*, pero desde entonces ha visto otras aplicaciones. *TypeScript 1.6* admite la incrustación, la verificación de tipos y, opcionalmente, la compilación de *JSX* directamente en *JavaScript*.

#### Nueva extensión de archivo `.tsx` y el operador `as`

*TypeScript 1.6* introduce una nueva extensión de archivo `.tsx`. Esta extensión hace dos cosas: habilita *JSX* dentro de los archivos de *TypeScript*, y hace que el nuevo operador `as` sea la forma predeterminada de emitir (eliminando cualquier ambigüedad entre las expresiones *JSX* y el operador de conversión de prefijos de *TypeScript*). Por ejemplo:

```ts
var x = <any>foo;
// es equivalente a:
var x = foo as any;
```

#### Usar *React*

Para usar el soporte *JSX* con *React*, debes usar [tipado *React*](https://github.com/borisyankov/DefinitelyTyped/tree/master/react). Esta tipificación define el espacio de nombres `JSX` para que *TypeScript* pueda verificar correctamente las expresiones *JSX* para *React+. Por ejemplo:

```ts
/// <reference path="react.d.ts" />

interface Props {
  name: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>;
  }
}

<MyComponent name="bar" />; // Bien
<MyComponent name={0} />; // error, `name` is not a number
```

#### Usar otros marcos *JSX*

Los nombres y propiedades de los elementos *JSX* se validan con el espacio de nombres `JSX`. Consulta la página *wiki* de *JSX* para definir el espacio de nombres `JSX` para tu marco.

#### Generar salida

*TypeScript* se envía con dos modos *JSX*: `preserve` y `react`.

- El modo `preserve` mantendrá las expresiones *JSX* como parte de la salida para ser consumidas por otro paso de transformación. *Adicionalmente, la salida tendrá una extensión de archivo `.jsx`*.
- El modo `react` emitirá `React.createElement`, no necesita pasar por una transformación *JSX* antes de su uso, y la salida tendrá una extensión de archivo `.js`.

Consulta la página *wiki* de *JSX* para obtener más información sobre el uso de *JSX* en *TypeScript*.

## Intersección de tipos

*TypeScript 1.6* presenta la intersección de tipos, el complemento lógico de los tipos unión. Un tipo unión `A | B` representa una entidad que es de tipo `A` o de tipo `B`, mientras que una intersección de tipo `A & B` representa una entidad que es tanto de tipo `A` como de tipo `B`.

##### Ejemplo

```ts
function extend<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in primera) {
    result[id] = first[id];
  }
  for (let id in segunda) {
    if (!result.hasOwnProperty(id)) {
      result[id] = second[id];
    }
  }
  return result;
}

var x = extend({ a: "hello" }, { b: 42 });
var s = x.a;
var n = x.b;
```

```ts
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
  name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

```ts
interface A {
  a: string;
}
interface B {
  b: string;
}
interface C {
  c: string;
}

var abc: A & B & C;
abc.a = "hello";
abc.b = "hello";
abc.c = "hello";
```

Consulta la [incidencia #1256](https://github.com/Microsoft/TypeScript/issues/1256) para obtener más información.

## Declaraciones de tipo local

Las declaraciones locales de clase, interfaz, enumeración y alias de tipo ahora pueden aparecer dentro de las declaraciones de función. Los tipos locales tienen un ámbito de bloque, similar a las variables declaradas con `let` y `const`. Por ejemplo:

```ts
function f() {
  if (true) {
    interface T {
      x: number;
    }
    let v: T;
    v.x = 5;
  } else {
    interface T {
      x: string;
    }
    let v: T;
    v.x = "hello";
  }
}
```

El tipo de retorno inferido de una función puede ser un tipo declarado localmente dentro de la función. No es posible que los llamadores de la función hagan referencia a un tipo local de este tipo, pero, por supuesto, puede coincidir estructuralmente. Por ejemplo:

```ts
interface Point {
  x: number;
  y: number;
}

function getPointFactory(x: number, y: number) {
  class P {
    x = x;
    y = y;
  }
  return P;
}

var PointZero = getPointFactory(0, 0);
var PointOne = getPointFactory(1, 1);
var p1 = new PointZero();
var p2 = new PointZero();
var p3 = new PointOne();
```

Los tipos locales pueden hacer referencia a parámetros de tipo envolvente y la clase local y las interfaces pueden ser en sí mismas genéricas. Por ejemplo:

```ts
function f3() {
  function f<X, Y>(x: X, y: Y) {
    class C {
      public x = x;
      public y = y;
    }
    return C;
  }
  let C = f(10, "hello");
  let v = new C();
  let x = v.x; // number
  let y = v.y; // string
}
```

## Expresiones `Class`

*TypeScript 1.6* agrega soporte para expresiones de clase *ES6*. En una expresión de clase, el nombre de la clase es opcional y, si se especifica, solo está dentro del alcance de la expresión de clase en sí. Es similar al nombre opcional de una expresión de función. No es posible hacer referencia al tipo de instancia de clase de una expresión de clase fuera de la expresión de clase, pero, por supuesto, el tipo puede coincidir estructuralmente. Por ejemplo:

```ts
let Point = class {
  constructor(public x: number, public y: number) {}
  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
};
var p = new Point(3, 4); // p tiene un tipo de clase anónimo
console.log(p.length());
```

## Extender expresiones

*TypeScript 1.6* agrega soporte para clases que extienden expresiones arbitrarias que calculan una función constructora. Esto significa que los tipos integrados ahora se pueden extender en declaraciones de clases.

La cláusula `extends` de una clase requería previamente que se especificara una referencia de tipo. Ahora acepta una expresión seguida opcionalmente por una lista de argumentos de tipo. El tipo de la expresión debe ser un tipo de función constructora con al menos una firma de construcción que tenga el mismo número de parámetros de tipo que el número de argumentos de tipo especificado en la cláusula `extends`. El tipo de retorno de la(s) firma(s) del constructor coincidente es el tipo base del cual hereda el tipo de instancia de clase. Efectivamente, esto permite que tanto clases reales como expresiones "similares a clases" se especifiquen en la cláusula `extends`.

Algunos ejemplos:

```ts
// Amplía los tipos integrados

class MyArray extends Array<number> {}
class MyError extends Error {}

// Ampliar la clase base calculada

class ThingA {
  getGreeting() {
    return "Hello from A";
  }
}

class ThingB {
  getGreeting() {
    return "Hello from B";
  }
}

interface Greeter {
  getGreeting(): string;
}

interface GreeterConstructor {
  new (): Greeter;
}

function getGreeterBase(): GreeterConstructor {
  return Math.random() >= 0.5 ? ThingA : ThingB;
}

class Test extends getGreeterBase() {
  sayHello() {
    console.log(this.getGreeting());
  }
}
```

## clases y métodos `abstract`os

*TypeScript 1.6* agrega soporte para la palabra clave `abstract` para las clases y sus métodos. Una clase `abstract`a puede tener métodos sin implementación y no se puede construir.

##### Ejemplos

```ts
abstract class Base {
  abstract getThing(): string;
  getOtherThing() {
    return "hello";
  }
}

let x = new Base(); // Error, 'Base' es abstracta

// Error, debe ser 'abstract'a o implementar el 'getThing' concreto
class Derived1 extends Base {}

class Derivada2 extends Base {
  getThing() {
    return "hello";
  }
  foo() {
    super.getThing(); // Error: no puede invocar miembros abstractos a través de 'super'
  }
}

var x = new Derived2(); // Bien
var y: Base = new Derived2(); // También está bien
y.getThing(); // Bien
y.getOtherThing(); // Bien
```

## Alias ​​de tipo genérico

Con *TypeScript 1.6*, los alias de tipo pueden ser genéricos. Por ejemplo:

```ts
type Lazy<T> = T | (() => T);

var s: Lazy<string>;
s = "eager";
s = () => "lazy";

interface Tuple<A, B> {
  a: A;
  b: B;
}

type Pair<T> = Tuple<T, T>;
```

## Comprobación de asignación literal de objetos más estricta

*TypeScript 1.6* impone comprobaciones de asignación literal de objetos más estrictas con el fin de detectar propiedades en exceso o mal escritas. Específicamente, cuando se asigna un nuevo objeto literal a una variable o se pasa como argumento para un tipo de destino no vacío, es un error que el literal de objeto especifique propiedades que no existen en el tipo de destino.

##### Ejemplos

```ts
var x: { foo: number };
x = { foo: 1, baz: 2 }; // Error, exceso de propiedad `baz`

var y: { foo: number; bar?: number };
y = { foo: 1, baz: 2 }; // Error, exceso o propiedad mal escrita `baz`
```

Un tipo puede incluir un índice de firma para indicar explícitamente que se permiten propiedades en exceso:

```ts
var x: { foo: number; [x: string]: any };
x = { foo: 1, baz: 2 }; // Bien, `baz` coincide con el índice de firma
```

## Generadores *ES6*

*TypeScript 1.6* agrega soporte para generadores cuando apunta a *ES6*.

Una función generadora puede tener una anotación de tipo de retorno, al igual que una función. La anotación representa el tipo de generador devuelto por la función. Aquí tienes un ejemplo:

```ts
function* g(): Iterable<string> {
  for (var i = 0; i < 100; i++) {
    yield ""; // string es asignable a string
  }
  yield* otherStringGenerator(); // otherStringGenerator debe ser iterable y el tipo de elemento asignable a string
}
```

Una función generadora sin anotación de tipo puede tener la anotación de tipo inferida. Entonces, en el siguiente caso, el tipo se deducirá de las declaraciones de rendimiento:

```ts
function* g() {
  for (var i = 0; i < 100; i++) {
    yield ""; // infer string
  }
  yield* otherStringGenerator(); // infer element type of otherStringGenerator
}
```

## Soporte experimental para funciones `async`

*TypeScript 1.6* introduce soporte experimental de funciones `async` cuando se dirige a *ES6*. Se espera que las funciones asincrónicas invoquen una operación asincrónica y esperen su resultado sin bloquear la ejecución normal del programa. Esto se logró mediante el uso de una implementación de `Promise` compatible con *ES6* y la transposición del cuerpo de la función a una forma compatible para reanudar la ejecución cuando se complete la operación asincrónica esperada.

Una *función asíncrona* es una función o método que ha sido prefijado con el modificador `async`. Este modificador informa al compilador que se requiere la transposición del cuerpo de la función y que la palabra clave `await` debe tratarse como una expresión unaria en lugar de un identificador. Una *Función asincrónica* debe proporcionar una anotación de tipo de retorno que apunte a un tipo de `Promise` compatible. La inferencia de tipo de retorno solo se puede utilizar si hay un tipo de `Promise` compatible y definido globalmente.

##### Ejemplo

```ts
var p: Promise<number> = /* ... */;
async function fn(): Promise<number> {
  var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
  return 1 + i;
}

var a = async (): Promise<number> => 1 + await p; // suspende la ejecución.
var a = async () => 1 + await p; // suspende la ejecución. el tipo de retorno se infiere como "Promise<number>" cuando se compila con --target ES6
var fe = async function(): Promise<number> {
  var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
  return 1 + i;
}

class C {
  async m(): Promise<number> {
    var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
    return 1 + i;
  }

  async get p(): Promise<number> {
    var i = await p; // suspender la ejecución hasta que se resuelva 'p'. 'i' has type "number"
    return 1 + i;
  }
}
```

## Construcciones nocturnas

Si bien no es estrictamente un cambio de lenguaje, las compilaciones nocturnas ahora están disponibles mediante la instalación con el siguiente comando:

```shell
npm install -g typescript@next
```

## Ajustes en la lógica de resolución del módulo

A partir de la versión 1.6, el compilador de *TypeScript* utilizará un conjunto diferente de reglas para resolver los nombres de los módulos cuando se dirija a 'commonjs'. Estas [reglas](https://github.com/Microsoft/TypeScript/issues/2338) intentaron modelar el procedimiento de búsqueda de módulos utilizado por *Node*. Esto significa efectivamente que los módulos de `node` pueden incluir información sobre sus tipificaciones y el compilador de *TypeScript* podrá encontrarla. Sin embargo, el usuario puede redefinir las reglas de resolución del módulo elegidas por el compilador usando la opción de línea de comando [`moduleResolution`](/tsconfig#moduleResolution). Los valores posibles son:

- `'classic'` ⏤ reglas de resolución del módulo utilizadas por el compilador *TypeScript* anterior a 1.6
- `'node'` ⏤ resolución de módulo similar a `node`

## Fusión de clase ambiental y declaración de interfaz

El lado de la instancia de una declaración de clase ambiental se puede extender usando una declaración de interfaz. El constructor de objetos de la clase no está modificado. Por ejemplo:

```ts
declare class Foo {
  public x: number;
}

interface Foo {
  y: string;
}

function bar(foo: Foo) {
  foo.x = 1; // Bien, declarado en la clase Foo
  foo.y = "1"; // Bien, declarado en la interfaz Foo
}
```

## Funciones protectoras de tipo definidas por el usuario

*TypeScript 1.6* agrega una nueva forma de limitar un tipo de variable dentro de un bloque `if`, además de `typeof` e `instanceof`. Una función protectora de tipo definida por el usuario es aquella con una anotación de tipo de retorno de la forma `x is T`, donde `x` es un parámetro declarado en la firma y `T` es cualquier tipo. Cuando se invoca una función protectora de tipo definida por el usuario en una variable en un bloque `if`, el tipo de la variable se reducirá a `T`.

##### Ejemplos

```ts
function isCat(a: any): a is Cat {
  return a.name === "kitty";
}

var x: Cat | Dog;
if (isCat(x)) {
  x.meow(); // Bien, x es Cat en este bloque
}
```

## Soporte de propiedad `exclude` en `tsconfig.json`

Un archivo `tsconfig.json` que no especifica una propiedad de archivos (y por lo tanto hace referencia implícitamente a todos los archivos `\*.ts` en todos los subdirectorios) ahora puede contener una propiedad de exclusión que especifica una lista de archivos y/o directorios para excluir de la compilación. La propiedad de exclusión debe ser un arreglo de cadenas, cada una de las cuales especifica un nombre de archivo o directorio en relación con la ubicación del archivo `tsconfig.json`. Por ejemplo:

```json tsconfig
{
  "compilerOptions": {
    "out": "test.js"
  },
  "exclude": ["node_modules", "test.ts", "utils/t2.ts"]
}
```

La lista `exclude` no admite tarjetas comodines. Simplemente debe ser una lista de archivos y/o directorios.

## Opción de línea de comando `--init`

Ejecuta `tsc --init` en un directorio para crear un `tsconfig.json` inicial en este directorio con los valores predeterminados. Opcionalmente, pasa los argumentos de la línea de comandos junto con `--init` para que se almacenen en tu `tsconfig.json` inicial en el momento de la creación.

## TypeScript 1.5

## Módulos *ES6*

*TypeScript 1.5* admite módulos *ECMAScript 6* (*ES6*). Los módulos *ES6* efectivamente son módulos externos de *TypeScript* con una nueva sintaxis: Los módulos *ES6* son archivos fuente cargados por separado que posiblemente importan otros módulos y proporcionan una serie de exportaciones accesibles desde el exterior. Los módulos *ES6* cuentan con varias declaraciones de importación y exportación nuevas. Se recomienda que las bibliotecas y aplicaciones de *TypeScript* se actualicen para usar la nueva sintaxis, pero esto no es un requisito. La nueva sintaxis del módulo *ES6* coexiste con las construcciones de módulos internos y externos originales de *TypeScript* y las construcciones se pueden mezclar y combinar a voluntad.

#### Declaraciones `export`

Además del soporte existente de *TypeScript* para decorar declaraciones con `export`, los miembros del módulo también se pueden exportar usando declaraciones de exportación separadas, especificando opcionalmente diferentes nombres para las exportaciones usando cláusulas `as`.

```ts
interface Stream { ... }
function writeToStream(stream: Stream, data: string) { ... }
export { Stream, writeToStream as write };  // writeToStream exportado como escritura
```

Las declaraciones `import`, también, pueden usar opcionalmente cláusulas `as` para especificar diferentes nombres locales para las importaciones. Por ejemplo:

```ts
import { read, write, standardOutput as stdout } from "./inout";
var s = read(stdout);
write(stdout, s);
```

Como alternativa a las importaciones individuales, se puede utilizar una importación de espacio de nombres para importar un módulo completo:

```ts
import * as io from "./inout";
var s = io.read(io.standardOutput);
io.write(io.standardOutput, s);
```

#### Reexportar

Al usar la cláusula `from`, un módulo puede copiar las exportaciones de un módulo dado al módulo actual sin introducir nombres locales.

```ts
export { read, write, standardOutput as stdout } from "./inout";
```

puede utilizar `export *` para reexportar todas las exportaciones de otro módulo. Esto es útil para crear módulos que agreguen las exportaciones de varios otros módulos.

```ts
export function transform(s: string): string { ... }
export * from "./mod1";
export * from "./mod2";
```

#### Exportación predeterminada

Una declaración `export default` especifica una expresión que se convierte en la exportación predeterminada de un módulo:

```ts
export default class Greeter {
  sayHello() {
    console.log("Greetings!");
  }
}
```

Que a su vez se pueden importar usando `import default`:

```ts
import Greeter from "./greeter";
var g = new Greeter();
g.sayHello();
```

#### Importación simple

Se puede utilizar una "importación simple" para importar un módulo solo por sus efectos secundarios.

```ts
import "./polyfills";
```

Para obtener más información sobre el módulo, consulta la [especificación de compatibilidad del módulo *ES6*](https://github.com/Microsoft/TypeScript/issues/2242).

## Desestructuración en declaraciones y asignaciones

*TypeScript 1.5* agrega compatibilidad con las declaraciones y asignaciones de desestructuración de *ES6*.

#### Declaración de variables

Una declaración de desestructuración introduce una o más variables con nombre y las inicia con valores extraídos de las propiedades de un objeto o elementos de un arreglo.

Por ejemplo, el siguiente ejemplo declara las variables `x`, `y` y `z`, y las inicia en `getSomeObject().x`, `getSomeObject().y` y `getSomeObject().z` respectivamente:

```ts
var { x, y, z } = getSomeObject();
```

Las declaraciones de desestructuración también funcionan para extraer valores de arreglos:

```ts
var [x, y, z = 10] = getSomeArray();
```

Del mismo modo, la desestructuración se puede utilizar en declaraciones de parámetros de función:

```ts
function drawText({ text = "", location: [x, y] = [0, 0], bold = false }) {
  // Dibuja texto
}

// Llama a drawText con un objeto literal
var item = { text: "someText", location: [1, 2, 3], style: "italics" };
drawText(item);
```

#### Asignaciones

Los patrones de desestructuración también se pueden utilizar en expresiones de asignación regulares. Por ejemplo, el intercambio de dos variables se puede escribir como una sola asignación de desestructuración:

```ts
var x = 1;
var y = 2;
[x, y] = [y, x];
```

## Palabra clave `namespace`

*TypeScript* usó la palabra clave `module` para definir tanto "módulos internos" como "módulos externos"; esto ha sido un poco confuso para los nuevos desarrolladores en *TypeScript*. Los "módulos internos" están más cerca de lo que la mayoría de la gente llamaría un espacio de nombres; del mismo modo, los "módulos externos" en *JS* ahora son realmente módulos.

> Nota: Aún se admite la sintaxis anterior que define los módulos internos.

**Antes**:

```ts
module Math {
    export function add(x, y) { ... }
}
```

**Después**:

```ts
namespace Math {
    export function add(x, y) { ... }
}
```

## Soporte para `let` y `const`

Las declaraciones `let` y `const` de *ES6* ahora son compatibles cuando se apunta a *ES3* y *ES5*.

#### `const`

```ts
const MAX = 100;

++MAX; // Error: El operando de un incremento o decremento
//        el operador no puede ser una constante.
```

#### Bloque de alcance

```ts
if (true) {
  let a = 4;
  // usa a
} else {
  let a = "string";
  // usa a
}

alert(a); // Error: a no está definido en este alcance
```

## Soporte para `for..of`

*TypeScript 1.5* agrega soporte *ES6* para bucles `for...of` en arreglos para *ES3*/*ES5*, así como soporte completo para interfaces `Iterator` cuando apunta a *ES6*.

##### Ejemplo

El compilador de *TypeScript* se transpilará para `for...of` de arreglos a *JavaScript* *ES3*/*ES5* idiomático cuando se dirige a esas versiones:

```ts
for (var v of expr) {
}
```

se emitirá como:

```js
for (var _i = 0, _a = expr; _i < _a.length; _i++) {
  var v = _a[_i];
}
```

## Decoradores

> Los decoradores de *TypeScript* se basan en la [propuesta de decorador de *ES7*](https://github.com/wycats/javascript-decorators).

Un decorador es:

- una expresión
- que evalúa a una función
- que toma el destino, el nombre y el descriptor de propiedad como argumentos
- y, opcionalmente, devuelve un descriptor de propiedad para instalar en el objeto destino

> Para obtener más información, consulta la propuesta de [Decoradores](https://github.com/Microsoft/TypeScript/issues/2249).

##### Ejemplo

Los decoradores `readonly` y `enumerable(false)` se aplicarán a la propiedad `method` antes de que se instale en la clase `C`. Esto permite al decorador cambiar la implementación y, en este caso, aumentar el descriptor para que se pueda escribir: `false` y `enumerable`: `false`.

```ts
class C {
  @readonly
  @enumerable(false)
  method() {}
}

function readonly(target, key, descriptor) {
  descriptor.writable = false;
}

function enumerable(value) {
  return function (target, key, descriptor) {
    descriptor.enumerable = value;
  };
}
```

## Propiedades calculadas

Iniciar un objeto con propiedades dinámicas puede ser un poco complicado. Toma el siguiente ejemplo:

```ts
type NeighborMap = { [name: string]: Node };
type Node = { name: string; neighbors: NeighborMap };

function makeNode(name: string, initialNeighbor: Node): Node {
  var neighbors: NeighborMap = {};
  neighbors[initialNeighbor.name] = initialNeighbor;
  return { name: name, neighbors: neighbors };
}
```

Aquí necesitamos crear una variable para mantener el mapa de vecinos para que podamos iniciarlo. Con *TypeScript 1.5*, podemos dejar que el compilador haga el trabajo pesado:

```ts
function makeNode(name: string, initialNeighbor: Node): Node {
  return {
    name: name,
    neighbors: {
      [initialNeighbor.name]: initialNeighbor,
    },
  };
}
```

## Soporte para salida de módulo `UMD` y `System`

Además de los cargadores de módulos `AMD` y `CommonJS`, *TypeScript* ahora admite módulos emisores `UMD` ([Definición de módulo universal](https://github.com/umdjs/umd)) y [`System`](https://github.com/systemjs/systemjs) formatos de módulo.

**Uso**:

> `tsc --module umd`

y

> `tsc --module system`

## El punto de código Unicode se escapa en cadenas

*ES6* introduce escapes que permiten a los usuarios representar un punto de código Unicode usando un solo escape.

Como ejemplo, considera la necesidad de escapar de una cadena que contiene el carácter '𠮷'. En *UTF-16*/*UCS2*, '𠮷' se representa como un par sustituto, lo cual significa que se codifica utilizando un par de unidades de valores de código de 16 bits, específicamente `0xD842` y `0xDFB7`. Anteriormente, esto significaba que tendrías que escapar del punto de código como `"\uD842\uDFB7"`. Esto tiene la mayor desventaja de que es difícil distinguir dos caracteres independientes de una pareja sustituta.

Con los escapes de puntos de código de *ES6*, puedes representar claramente ese carácter exacto en cadenas y cadenas de plantillas con un solo escape: `"\u{20bb7}"`. *TypeScript* emitirá la cadena en *ES3*/*ES5* como `" \uD842\uDFB7"`.

## Cadenas de plantilla etiquetadas en *ES3*/*ES5*

En *TypeScript 1.4*, agregamos soporte para cadenas de plantilla para todos los objetivos y plantillas etiquetadas solo para ES6. Gracias a un trabajo considerable realizado por [*@ivogabe*](https://github.com/ivogabe), cerramos la brecha para las plantillas etiquetadas en *ES3* y *ES5*.

Al apuntar a *ES3*/*ES5*, el siguiente código

```ts
function oddRawStrings(strs: TemplateStringsArray, n1, n2) {
  return strs.raw.filter((raw, index) => index % 2 === 1);
}

oddRawStrings`Hello \n${123} \t ${456}\n world`;
```

será emitido como

```js
function oddRawStrings(strs, n1, n2) {
  return strs.raw.filter(function (raw, index) {
    return index % 2 === 1;
  });
}
(_a = ["Hello \n", " \t ", "\n world"]),
  (_a.raw = ["Hello \\n", " \\t ", "\\n world"]),
  oddRawStrings(_a, 123, 456);
var _a;
```

## Nombres opcionales de dependencia de *AMD*

`/// <amd-dependency path="x"/>` informa al compilador sobre una dependencia de un módulo que no es *TS* que se debe inyectar en la llamada `require` del módulo resultante; sin embargo, no había forma de consumir este módulo en el código *TS*.

La nueva propiedad `amd-dependency name` permite pasar un nombre opcional para una dependencia `amd`:

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA: MyType;
moduleA.callStuff();
```

Código *JS* generado:

```js
define(["require", "exports", "legacy/moduleA"], function (
  require,
  exports,
  moduleA
) {
  moduleA.callStuff();
});
```

## Soporte de proyectos a través de `tsconfig.json`

Agrega un archivo `tsconfig.json` en un directorio indica que el directorio es la raíz de un proyecto de *TypeScript*. El archivo `tsconfig.json` especifica los archivos raíz y las opciones de compilación requeridas para compilar el proyecto. Un proyecto se compila de una de las siguientes maneras:

- Invocar a `tsc` sin archivos de entrada, en cuyo caso el compilador busca el archivo `tsconfig.json` comenzando en el directorio actual y continuando hacia arriba en la cadena del directorio principal.
- Invocar `tsc` sin archivos de entrada y una opción de línea de comandos `-project` (o simplemente `-p`) que especifica la ruta de un directorio que contiene un archivo `tsconfig.json`.

##### Ejemplo

```json tsconfig
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "sourceMap": true
  }
}
```

Consulta la [página *wiki* de `tsconfig.json`](https://github.com/Microsoft/TypeScript/wiki/tsconfig.json) para obtener más detalles.

## Opción de línea de comandos `--rootDir`

La opción [`outDir`](/tsconfig#outDir) duplica la jerarquía de entrada en la salida. El compilador calcula la raíz de los archivos de entrada como la ruta común más larga de todos los archivos de entrada; y luego lo usa para replicar toda su subestructura en la salida.

A veces esto no es deseable, por ejemplo, las entradas `FolderA/FolderB/1.ts` y `FolderA/FolderB/2.ts` darían como resultado una estructura de salida que reflejara `FolderA/FolderB/`. Ahora, si se agrega un nuevo archivo `FolderA/3.ts` a la entrada, la estructura de salida aparecerá para reflejar `FolderA/`.

[`rootDir`](/tsconfig#rootDir) especifica el directorio de entrada que se reflejará en la salida en lugar de calcularlo.

## Opción de línea de comandos `--noEmitHelpers`

El compilador de *TypeScript* emite algunos ayudantes como `__extends` cuando es necesario. Los ayudantes se emiten en cada archivo en el que se les hace referencia. Si deseas consolidar todos los ayudantes en un solo lugar, o redefinir el comportamiento predeterminado, usa [`noEmitHelpers`](/tsconfig#noEmitHelpers) para indicar al compilador que no los emita.

## Opción de línea de comandos `--newLine`

De manera predeterminada, el carácter de nueva línea de salida es `\r\n` en sistemas basados ​​en *Windows* y `\n` en sistemas basados ​​en `\*nix`. [`newLine`](/tsconfig#newLine) el indicador de línea de comandos permite redefinir este comportamiento y especificar el carácter de nueva línea que se utilizará en los archivos de salida generados.

## Opciones de línea de comandos `--inlineSourceMap` e `inlineSources`

[`inlineSourceMap`](/tsconfig#inlineSourceMap) hace que los archivos de mapas fuente se escriban en línea en los archivos `.js` generados en lugar de en un archivo `.js.map` independiente. [`inlineSources`](/tsconfig#inlineSources) permite incluir adicionalmente el archivo `.ts` fuente en él.

## TypeScript 1.4

## Tipos unión

### Descripción general

Los tipos unión son una forma poderosa de expresar un valor que puede ser de varios tipos. Por ejemplo, puede tener una *API* para ejecutar un programa que toma una línea de comandos como un `string`, un `string[]` o una función que devuelve un `string`. Ahora puedes escribir:

```ts
interface RunOptions {
  program: string;
  commandline: string[] | string | (() => string);
}
```

La asignación a tipos unión funciona de manera muy intuitiva ⏤ todo lo que puedas asignar a uno de los miembros del tipo unión se puede asignar a la unión:

```ts
var opts: RunOptions = /* ... */;
opts.commandline = '-hello world'; // Bien
opts.commandline = ['-hello', 'world']; // Bien
opts.commandline = [42]; // Error, el número no es una string o una string[]
```

Al leer de un tipo unión, puedes ver las propiedades que comparten:

```ts
if (opts.length === 0) {
  // Bien, la string y string[] tienen la propiedad 'length'
  console.log("it's empty");
}
```

Con `Type Guards`, puedes trabajar fácilmente con una variable de un tipo unión:

```ts
function formatCommandline(c: string | string[]) {
  if (typeof c === "string") {
    return c.trim();
  } else {
    return c.join(" ");
  }
}
```

### Genéricos más estrictos

Con tipos unión capaces de representar una amplia gama de escenarios de tipos, hemos decidido mejorar el rigor de ciertas llamadas genéricas. Anteriormente, un código como este se compilaría (sorprendentemente) sin errores:

```ts
function equal<T>(lhs: T, rhs: T): boolean {
  return lhs === rhs;
}

// Previamente: No hay error
// Nuevo comportamiento: Error, no hay mejor tipo común entre 'string' y 'number'
var e = equal(42, "hello");
```

Con los tipos unión, ahora puedes especificar el comportamiento deseado tanto en el sitio de declaración de función como en el sitio de llamada:

```ts
// función 'choose' donde los tipos deben coincidir
function choose1<T>(a: T, b: T): T {
  return Math.random() > 0.5 ? a : b;
}
var a = choose1("hello", 42); // Error
var b = choose1<string | number>("hello", 42); // Bien

// función 'choose' donde los tipos no tienen por qué coincidir
function choose2<T, U>(a: T, b: U): T | U {
  return Math.random() > 0.5 ? a : b;
}
var c = choose2("bar", "foo"); // Bien, c: string
var d = choose2("hello", 42); // Bien, d: string|number
```

### Mejor inferencia de tipos

Los tipos unión también permiten una mejor inferencia de tipos en arreglos y otros lugares donde puedes tener varios tipos de valores en una colección:

```ts
var x = [1, "hello"]; // x: Array<string|number>
x[0] = "world"; // Bien
x[0] = false; // Error, booleano no es una string ni un number
```

## Declaraciones `let`

En *JavaScript*, las declaraciones `var` se" elevan "a la parte superior de su ámbito adjunto. Esto puede resultar en errores confusos:

```ts
console.log(x); // quería escribir 'y' aquí
/* más tarde en el mismo bloque * /
var x = "hello";
```

La nueva palabra clave `let` de *ES6*, ahora compatible con *TypeScript*, declara una variable con semántica de" bloque" más intuitiva. Solo se puede hacer referencia a una variable `let` después de su declaración, y tiene como ámbito el bloque sintáctico donde se define:

```ts
if (foo) {
  console.log(x); // Error, no se puede hacer referencia a x antes de su declaración
  let x = "hello";
} else {
  console.log(x); // Error, x no se declara en este bloque
}
```

`let` solo está disponible cuando se dirige a *ECMAScript 6* (`--target ES6`).

## Declaraciones `const`

El otro nuevo tipo de declaración de *ES6* compatible con *TypeScript* es `const`. No se puede asignar una variable `const` y se debe iniciar donde se declara. Esto es útil para declaraciones en las que no desea cambiar el valor después de su iniciación:

```ts
const halfPi = Math.PI / 2;
halfPi = 2; // Error, no se puede asignar a una `const`
```

`const` solo está disponible cuando se dirige a *ECMAScript 6* (`--target ES6`).

## Cadenas de plantilla

*TypeScript* ahora admite cadenas de plantilla *ES6*. Éstas son una manera fácil de incrustar expresiones arbitrarias en cadenas:

```ts
var name = "TypeScript";
var greeting = `Hello, ${name}! Your name has ${name.length} characters`;
```

Al compilar en destinos anteriores a *ES6*, la cadena se descompone:

```js
var name = "TypeScript!";
var greeting =
  "Hello, " + name + "! Your name has " + name.length + " characters";
```

## `Type Guards`

Un patrón común en *JavaScript* es usar `typeof` o `instanceof` para examinar el tipo de una expresión en el entorno de ejecución. *TypeScript* ahora comprende estas condiciones y cambiará la inferencia de tipo en consecuencia cuando se use en un bloque `if`.

Usar `typeof` para probar una variable:

```ts
var x: any = /* ... */;
if(typeof x === 'string') {
    console.log(x.subtr(1)); // Error, 'subtr' no existe en 'string'
}
// x todavía está aquí
x.unknown(); // Bien
```

Usar `typeof` con tipos unión y `else`:

```ts
var x: string | HTMLElement = /* ... */;
if(typeof x === 'string') {
    // x es una string aquí, como se muestra arriba
}
else {
    // x is HTMLElement here
    console.log(x.innerHTML);
}
```

Usar `instanceof` con clases y tipos unión:

```ts
class Dog { woof() { } }
class Cat { meow() { } }
var pet: Dog|Cat = /* ... */;
if (pet instanceof Dog) {
    pet.woof(); // Bien
}
else {
    pet.woof(); // Error
}
```

## Alias de tipo

Ahora puedes definir un *alias* para un tipo usando la palabra clave `type`:

```ts
type PrimitiveArray = Array<string | number | boolean>;
type MyNumber = number;
type NgScope = ng.IScope;
type Callback = () => void;
```

Los alias de tipo son exactamente los mismos que sus tipos originales; simplemente son nombres alternativos.

## `const enum` (enumeraciones completamente en línea)

Las enumeraciones son muy útiles, pero algunos programas en realidad no necesitan el código generado y se beneficiarían simplemente de incluir todas las instancias de miembros de enumeración con sus equivalentes numéricos. La nueva declaración `const enum` funciona como una `enum` normal para la seguridad de tipos, pero se borra completamente en tiempo de compilación.

```ts
const enum Suit {
  Clubs,
  Diamonds,
  Hearts,
  Spades,
}
var d = Suit.Diamonds;
```

Compila exactamente:

```js
var d = 1;
```

*TypeScript* ahora también calculará los valores de enumeración cuando sea posible:

```ts
enum MyFlags {
  None = 0,
  Neat = 1,
  Cool = 2,
  Awesome = 4,
  Best = Neat | Cool | Awesome,
}
var b = MyFlags.Best; // emite var b = 7;
```

## Opción de línea de comandos `-noEmitOnError`

El comportamiento predeterminado del compilador de *TypeScript* es seguir emitiendo archivos `.js` si hubo errores de tipo (por ejemplo, un intento de asignar un `string` a un `number`). Esto puede ser indeseable en servidores de compilación u otros escenarios donde solo se desea la salida de una compilación "limpia". El nuevo indicador [`noEmitOnError`](/tsconfig#noEmitOnError) evita que el compilador emita código `.js` si hubiera algún error.

Ahora es el valor predeterminado para los proyectos de *MSBuild*; esto permite que la compilación incremental de *MSBuild* funcione como se esperaba, ya que los resultados solo se generan en compilaciones limpias.

## Nombres de módulos *AMD*

De manera predeterminada, los módulos *AMD* se generan de forma anónima. Esto puede generar problemas cuando se utilizan otras herramientas para procesar los módulos resultantes, como los paquetes (por ejemplo, `r.js`).

La nueva etiqueta `amd-module name` permite pasar un nombre de módulo opcional al compilador:

```ts
//// [amdModule.ts]
///<amd-module name='NamedModule'/>
export class C {}
```

Dará como resultado la asignación del nombre `NamedModule` al módulo como parte de la llamada a *AMD* `define`:

```js
//// [amdModule.js]
define("NamedModule", ["require", "exports"], function (require, exports) {
  var C = (function () {
    function C() {}
    return C;
  })();
  exports.C = C;
});
```

## TypeScript 1.3

## `protected`

El nuevo modificador `protected` en las clases funciona como lo hace en lenguajes familiares como *C++*, *C#* y *Java*. Un miembro `protected` de una clase es visible solo dentro de las subclases de la clase en la que está declarado:

```ts
class Thing {
  protected doSomething() {
    /* ... */
  }
}

class MyThing extends Thing {
  public myMethod() {
    // Bien, puede acceder al miembro protegido de la subclase
    this.doSomething();
  }
}
var t = new MyThing();
t.doSomething(); // Error, no se puede llamar a un miembro protegido desde fuera de la clase
```

## Tipos `tupla`

Los tipos `tupla` expresan un arreglo en la que se conoce el tipo de ciertos elementos, pero no es necesario que sea el mismo. Por ejemplo, es posible que desees representar un arreglo con un `string` en la posición 0 y un `number` en la posición 1:

```ts
// Declara un tipo tupla
var x: [string, number];
// La inicia
x = ["hello", 10]; // Bien
// La Inicia incorrectamente
x = [10, "hello"]; // Error
```

Al acceder a un elemento con un índice conocido, se recupera el tipo correcto:

```ts
console.log(x[0].substr(1)); // Bien
console.log(x[1].substr(1)); // Error, 'number' no tiene 'substr'
```

Ten en cuenta que en *TypeScript 1.4*, al acceder a un elemento fuera del conjunto de índices conocidos, se usa un tipo `union` en su lugar:

```ts
x[3] = "world"; // Bien
console.log(x[5].toString()); // Bien, 'string' y 'number' ambos tienen 'toString'
x[6] = true; // Error, booleano no es un número ni una cadena
```

## TypeScript 1.1

## Mejoras de rendimiento

El compilador 1.1 suele ser 4 veces más rápido que cualquier versión anterior. Consulta [esta publicación de blog para ver algunos gráficos impresionantes](http://blogs.msdn.com/b/typescript/archive/2014/10/06/announcing-typescript-1-1-ctp.aspx)

## Mejores reglas de visibilidad del módulo

*TypeScript* ahora solo aplica estrictamente la visibilidad de los tipos en los módulos si se proporciona el indicador [`declaration`](/tsconfig#declaration). Esto es muy útil para escenarios *Angular*, por ejemplo:

```ts
module MyControllers {
  interface ZooScope extends ng.IScope {
    animals: Animal[];
  }
  export class ZooController {
    // Solía ​​ser un error (no se puede exponer ZooScope), pero ahora solo es
    // un error al intentar generar archivos .d.ts
    constructor(public $scope: ZooScope) {}
    /* más código */
  }
}
```
