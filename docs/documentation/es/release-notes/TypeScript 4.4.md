---
title: TypeScript 4.4
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-4.html
oneline: Notas de la versión de TypeScript 4.4
---

## Análisis de control de flujo de condiciones con alias y discriminantes

En *JavaScript*, a menudo tenemos que probar un valor de diferentes maneras y hacer algo diferente una vez que sepamos más sobre su tipo.
*TypeScript* comprende estas comprobaciones y las llama *protectores de tipo*.
En lugar de tener que convencer a *TypeScript* del tipo de una variable cada vez que la usamos, el comprobador de tipos aprovecha algo llamado *análisis de control de flujo* para ver si hemos usado un protector de tipo antes de un fragmento de determinado código.

Por ejemplo, podemos escribir algo como

```ts twoslash
function foo(arg: unknown) {
  if (typeof arg === "string") {
    console.log(arg.toUpperCase());
    //           ^?
  }
}
```

En este ejemplo, verificamos si `arg` era un `string`.
*TypeScript* reconoció la comprobación `typeof arg === "string"`, que consideraba un tipo de protección, y sabía que `arg` era un `string` dentro del cuerpo del bloque `if`.
Eso nos permite acceder a métodos `string` como `toUpperCase()` sin obtener un error.

Sin embargo, ¿qué pasaría si moviéramos la condición a una constante llamada `argIsString`?

```ts
// En TS 4.3 y por debajo

function foo(arg: unknown) {
  const argIsString = typeof arg === "string";
  if (argIsString) {
    console.log(arg.toUpperCase());
    //              ~~~~~~~~~~~
    // ¡Error! La propiedad 'toUpperCase' no existe en el tipo 'unknown'.
  }
}
```

En versiones anteriores de *TypeScript*, esto sería un error: a pesar de que a `argIsString` se le asignó el valor de un potector de tipo, *TypeScript* simplemente perdió esa información.
Eso es lamentable, ya que es posible que deseemos volver a utilizar la misma comprobación en varios lugares.
Para evitar eso, los usuarios a menudo tienen que repetirse o usar afirmaciones de tipo (alias conversiones).

En *TypeScript 4.4*, ese ya no es el caso.
¡El ejemplo anterior funciona sin errores!
Cuando *TypeScript* ve que estamos probando un valor constante, hará un poco de trabajo adicional para ver si contiene un protector de tipo.
Si ese protector de tipo opera en una propiedad `const`, una propiedad `readonly` o un parámetro no modificado, *TypeScript* puede reducir ese valor de manera apropiada.

Se conservan diferentes tipos de condiciones de protección de tipo ⏤ no solo comprobaciones de tipo `typeof`.
Por ejemplo, los controles sobre las uniones discriminadas funcionan a la perfección.

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; sideLength: number };

function area(shape: Shape): number {
  const isCircle = shape.kind === "circle";
  if (isCircle) {
    // ¡Sabemos que tenemos un círculo aquí!
    return Math.PI * shape.radius ** 2;
  } else {
    // ¡Sabemos que nos quedamos con un cuadrado aquí!
    return shape.sideLength ** 2;
  }
}
```

El análisis sobre discriminantes en 4.4 también es un poco más profundo: ahora podemos extraer discriminantes y *TypeScript* puede reducir el objeto original.

```ts twoslash
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; sideLength: number };

function area(shape: Shape): number {
  // Primero extrae el campo 'kind'.
  const { kind } = shape;

  if (kind === "circle") {
    // ¡Sabemos que tenemos un círculo aquí!
    return Math.PI * shape.radius ** 2;
  } else {
    // ¡Sabemos que nos quedamos con un cuadrado aquí!
    return shape.sideLength ** 2;
  }
}
```

Como otro ejemplo, aquí hay una función que verifica si dos de sus entradas tienen contenido.

```ts twoslash
function doSomeChecks(
  inputA: string | undefined,
  inputB: string | undefined,
  shouldDoExtraWork: boolean
) {
  const mustDoWork = inputA && inputB && shouldDoExtraWork;
  if (mustDoWork) {
    // ¡Podemos acceder a las propiedades de 'string' tanto en 'inputA' como en 'inputB'!
    const upperA = inputA.toUpperCase();
    const upperB = inputB.toUpperCase();
    // ...
  }
}
```

*TypeScript* puede entender que tanto `inputA` como `inputB` están presentes si `mustDoWork` es `true`.
Eso significa que no tenemos que escribir una afirmación no nula como `inputA!` Para convencer a *TypeScript* de que `inputA` no es `undefined`.

Una característica interesante aquí es que este análisis funciona de manera transitiva.
*TypeScript* pasará por constantes para comprender qué tipo de comprobaciones ya has realizado.

<!-- prettier-ignore -->
```ts twoslash
function f(x: string | number | boolean) {
  const isString = typeof x === "string";
  const isNumber = typeof x === "number";
  const isStringOrNumber = isString || isNumber;
  if (isStringOrNumber) {
    x;
//  ^?
  } else {
    x;
//  ^?
  }
}
```

Ten en cuenta que hay un límite ⏤ *TypeScript* no profundiza arbitrariamente al verificar estas condiciones, pero su análisis es lo suficientemente profundo para la mayoría de las verificaciones.

Esta característica debería hacer que una gran cantidad de código *JavaScript* intuitivo "simplemente funcione" en *TypeScript* sin que se interponga en tu camino.
Para obtener más detalles, [consulta la implementación en *GitHub*](https://github.com/microsoft/TypeScript/pull/44730).

## Índices de Firmas del patrón `string` de símbolo y plantilla

*TypeScript* nos permite describir objetos en los que cada propiedad debe tener un tipo determinado mediante *índice de firmas*.
Esto nos permite usar estos objetos como tipos de diccionario, donde podemos usar claves de cadena para indexarlos con corchetes.

Por ejemplo, podemos escribir un tipo con un índice de firma que toma claves de `string` y se asigna a valores `boolean`.
Si intentamos asignar algo que no sea un valor `boolean`, obtendremos un error.

```ts twoslash
// @errors: 2322 2375
interface BooleanDictionary {
  [key: string]: boolean;
}

declare let myDict: BooleanDictionary;

// Válido para asignar valores booleanos
myDict["foo"] = true;
myDict["bar"] = false;

// Error, "oops" no es un booleano
myDict["baz"] = "oops";
```

Si bien [un `Map` podría ser una mejor estructura de datos aquí](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) (específicamente, una cadena de `Map<string, boolean>`), los objetos de *JavaScript* a menudo son más convenientes de usar o simplemente son lo que se nos da para trabajar.

De manera similar, `Array<T>` ya define un índice de firma `number` que nos permite insertar/recuperar valores de tipo `T`.

```ts
// @errors: 2322 2375
// Esto es parte de la definición de *TypeScript* del tipo `Array` incorporado.
interface Array<T> {
  [index: number]: T;

  // ...
}

let arr = new Array<string>();

// Válido
arr[0] = "hello!";

// Error, esperando un valor 'string' aquí
arr[1] = 123;
```

Los índices de firmas son muy útiles para expresar mucho código en la naturaleza;
sin embargo, hasta ahora se han limitado a las claves de `string` y `number` (y los índices de firmas de `string` tienen una peculiaridad intencional en la que pueden aceptar claves de `number` ya que de todos modos se convertirán en cadenas).
Eso significa que *TypeScript* no permitía indexar objetos con claves `symbol`.
*TypeScript* tampoco pudo modelar un índice de firma de algunos *subconjuntos* de claves `string` ⏤ por ejemplo, un índice de firma que describe solo propiedades cuyos nombres comienzan con el texto `data-`.

*TypeScript 4.4* aborda estas limitaciones y permite índices de firmas para patrones de cadenas de plantillas y símbolos.

Por ejemplo, *TypeScript* ahora nos permite declarar un tipo que se puede teclear en `symbol`os arbitrarios.

```ts twoslash
// @errors: 2322 2375
interface Colors {
  [sym: symbol]: number;
}

const red = Symbol("red");
const green = Symbol("green");
const blue = Symbol("blue");

let colors: Colors = {};

// Se permite la asignación de un número
colors[red] = 255;
let redVal = colors[red];
//  ^?

colors[blue] = "da ba dee";
```

De manera similar, podemos escribir un índice de firma con el tipo de patrón de cadena de plantilla.
Un uso de esto podría ser eximir las propiedades que comienzan con `data-` de la comprobación de exceso de propiedad de *TypeScript*.
Cuando pasamos un objeto literal a algo con un tipo esperado, *TypeScript* buscará propiedades en exceso que no fueron declaradas en el tipo esperado.

```ts
// @errors: 2322 2375
interface Options {
    width?: number;
    height?: number;
}

let a: Options = {
    width: 100,
    height: 100,

    "data-blah": true,
};

interface OptionsWithDataProps extends Options {
    // Permitir cualquier propiedad que comience con 'data-'.
    [optName: `data-${string}`]: unknown;
}

let b: OptionsWithDataProps = {
    width: 100,
    height: 100,
    "data-blah": true,

    // Falla por una propiedad que no se conoce, ni
    // comienza con 'data-'
    "unknown-property": true,
};
```

Una nota final sobre los índices de firmas es que ahora permiten tipos `union`, siempre que sean una unión de tipos primitivos de dominio infinito ⏤ específicamente:

- `string`
- `number`
- `symbol`
- patrones de cadena de plantilla (por ejemplo, `` `hello - ${string}` ``)

Un índice de firma cuyo argumento sea una unión de estos tipos eliminará el azúcar sintáctico en varios índices de firmas diferentes.

```ts
interface Data {
  [optName: string | symbol]: any;
}

// Equivalente a

interface Data {
  [optName: string]: any;
  [optName: symbol]: any;
}
```

Para obtener más detalles, [lee sobre la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/44512)

## De forma predeterminada al tipo `unknown` en las variables de captura (`--useUnknownInCatchVariables`)

En *JavaScript*, cualquier tipo de valor se puede lanzar con `throw` y atrapar en una cláusula `catch`.
Debido a esto, *TypeScript* históricamente escribía las variables de cláusula catch como `any` y no permitía ningún otro tipo de anotación:

```ts
try {
  // Quién sabe lo que esto podría arrojar...
  executeSomeThirdPartyCode();
} catch (err) {
  // err: `any`
  console.error(err.message); // Permitido, porque 'any'
  err.thisWillProbablyFail(); // Permitido, porque 'any' :(
}
```

Una vez que *TypeScript* agregó el tipo `unknown`, quedó claro que `unknown` era una mejor opción que `any` en las variables de la cláusula `catch` para los usuarios que desean el mayor grado de corrección y seguridad de tipos, ya que reduce mejor y nos fuerza a probar contra valores arbitrarios.
Eventualmente, *TypeScript 4.0* permitió a los usuarios especificar una anotación de tipo explícita de `unknown` (o `any`) en cada variable de cláusula `catch` para que pudiéramos optar por tipos más estrictos caso por caso;
sin embargo, para algunos, especificar `:unknown` manualmente en cada cláusula `catch` era una tediosa tarea.

Es por eso que *TypeScript 4.4* introduce una nueva marca llamada [`useUnknownInCatchVariables`](/tsconfig#useUnknownInCatchVariables).
Esta marca cambia el tipo predeterminado de variables de cláusula `catch` de `any` a `unknown`.

```ts twoslash
// @errors: 2571
declare function executeSomeThirdPartyCode(): void;
// ---cut---
try {
  executeSomeThirdPartyCode();
} catch (err) {
  // err: unknown

  // ¡Error! La propiedad 'message' no existe en el tipo 'unknown'.
  console.error(err.message);

  // ¡Trabaja! Podemos limitar 'err' de 'unknown' a 'Error'.
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

Esta bandera está habilitada bajo la familia de opciones [`strict`](/tsconfig#strict).
Eso significa que si compruebas tu código usando [`strict`](/tsconfig#strict), esta opción se activará automáticamente.
Puedes terminar con errores en *TypeScript 4.4* como

```
La propiedad 'message' no existe en el tipo 'unknown'.
La propiedad 'name' no existe en el tipo 'unknown'.
La propiedad 'stack' no existe en el tipo 'unknown'.
```

En los casos en los que no queremos tratar con una variable `unknown` en una cláusula `catch`, siempre podemos agregar una anotación `any` explícita para que podamos optar por tipos más estrictos.

<!-- prettier-ignore -->
```ts twoslash
declare function executeSomeThirdPartyCode(): void;
// ---cut---
try {
  executeSomeThirdPartyCode();
} catch (err: any) {
  console.error(err.message); // ¡Funciona de nuevo!
}
```

Para obtener más información, consulta [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/41013).

## Tipos de propiedad opcionales exactos (`--exactOptionalPropertyTypes`)

En *JavaScript*, la lectura de una propiedad faltante en un objeto produce el valor `undefined`.
También es posible *tener* una propiedad real con el valor `undefined`.
Una gran cantidad de código en *JavaScript* tiende a tratar estas situaciones de la misma manera, por lo que inicialmente *TypeScript* simplemente interpretó cada propiedad opcional como si un usuario hubieras escrito `undefined` en el tipo.
Por ejemplo:

```ts
interface Person {
  name: string;
  age?: number;
}
```

fue considerado equivalente a

```ts
interface Person {
  name: string;
  age?: number | undefined;
}
```

Lo que esto significaba es que un usuario podía escribir explícitamente `undefined` en lugar de `age`.

```ts
const p: Person = {
  name: "Daniel",
  age: undefined, // Esto está bien por omisión.
};
```

Entonces, de forma predeterminada, *TypeScript* no distingue entre una propiedad presente con el valor `undefined` y una propiedad faltante.
Si bien esto funciona la mayor parte del tiempo, no todo el código en *JavaScript* hace las mismas suposiciones.
Las funciones y operadores como `Object.assign`, `Object.keys`, `object spread` (`{... obj}`) y los bucles `for`-`in` se comportan de manera diferente dependiendo de si una propiedad existe o no en un objeto.
En el caso de nuestro ejemplo de `Person`a, esto ⏤potencialmente⏤ podría conducir a errores en el entorno de ejecución si la propiedad `age` se observa en un contexto donde su presencia es importante.

En *TypeScript 4.4*, la nueva marca [`exactOptionalPropertyTypes`](/tsconfig#exactOptionalPropertyTypes) especifica que los tipos de propiedad opcionales se deben interpretar exactamente como están escritos, lo cual significa que `| undefined` no se agrega al tipo:

```ts twoslash
// @exactOptionalPropertyTypes
// @errors: 2322 2375
interface Person {
  name: string;
  age?: number;
}
// ---cut---
// Con 'exactOptionalPropertyTypes' en:
const p: Person = {
  name: "Daniel",
  age: undefined, // ¡Error! undefined no es un número
};
```

Esta bandera **no**es parte de la familia [`strict`](/tsconfig#strict) y se debe activar explícitamente si deseas este comportamiento.
También requiere que [`strictNullChecks`](/tsconfig#strictNullChecks) también esté habilitado.
Hemos estado actualizando `DefinitelyTyped` y otras definiciones para intentar que la transición sea lo más sencilla posible, pero es posible que encuentres algo de fricción con esto dependiendo de cómo esté estructurado tu código.

Para obtener más información, puedes [echar un vistazo a la solicitud de extracción de la implementación aquí](https://github.com/microsoft/TypeScript/pull/43947).

## Bloque`static` en Clases

*TypeScript 4.4* ofrece soporte para [bloques `static` en clases](https://github.com/tc39/proposal-class-static-block#ecmascript-class-static-initialization-blocks), una próxima función de *ECMAScript* que puede ayudar escribe un código de iniciación más complejo para miembros estáticos.

```ts twoslash
declare function someCondition(): boolean
// ---cut---
class Foo {
    static count = 0;

    // Este es un bloque estático:
    static {
        if (someCondition()) {
            Foo.count++;
        }
    }
}
```

Estos bloques estáticos te permiten escribir una secuencia de declaraciones con su propio alcance que puede acceder a campos privados dentro de la clase contenedora.
Eso significa que podemos escribir código de iniciación con todas las capacidades de escribir declaraciones, sin fugas de variables y acceso completo a los componentes internos de nuestra clase.

```ts twoslash
declare function loadLastInstances(): any[]
// ---cut---
class Foo {
    static #count = 0;

    get count() {
        return Foo.#count;
    }

    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
```

Sin bloques `static`, escribir el código anterior era posible, pero a menudo implicaba varios tipos diferentes de improvisaciones que tenían que comprometerse de alguna manera.

Ten en cuenta que una clase puede tener varios bloques `static` y se ejecutan en el mismo orden en que están escritos.

```ts twoslash
// Imprime
//    1
//    2
//    3
class Foo {
    static prop = 1
    static {
        console.log(Foo.prop++);
    }
    static {
        console.log(Foo.prop++);
    }
    static {
        console.log(Foo.prop++);
    }
}
```

Nos gustaría extender nuestro agradecimiento a [Wenlu Wang](https://github.com/Kingwl) por la implementación de esta función en *TypeScript*.
Para obtener más detalles, puedes [ver esa solicitud de extracción aquí](https://github.com/microsoft/TypeScript/pull/43370).

## `tsc --help` Actualizaciones y mejoras

¡La opción `--help` de *TypeScript* se ha actualizado!
Gracias al trabajo en parte de [Song Gao](https://github.com/ShuiRuTian), hemos introducido cambios para [actualizar las descripciones de nuestras opciones del compilador](https://github.com/microsoft/TypeScript/pull/44409) y [cambiar el estilo del menú `--help`](https://github.com/microsoft/TypeScript/pull/44157) con colores y otra separación visual.

![El nuevo menú TypeScript `--help` donde la salida se agrupa en varias áreas diferentes](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/08/tsc-help-ps-wt-4-4.png)

Puedes leer más en [el hilo de la propuesta original](https://github.com/microsoft/TypeScript/issues/44074).

## Mejoras de rendimiento

### Emisión de declaraciones más rápida

*TypeScript* ahora almacena en caché si los símbolos internos son accesibles en diferentes contextos, junto con cómo se deben imprimir tipos específicos.
Estos cambios pueden mejorar el rendimiento general de *TypeScript* en código con tipos bastante complejos, y se observan especialmente cuando se emiten archivos `.d.ts` bajo el indicador [`declaration`](/tsconfig#declaration).

[Ve más detalles aquí](https://github.com/microsoft/TypeScript/pull/43973).

### Normalización de ruta más rápida

*TypeScript* a menudo tiene que realizar varios tipos de "normalización" en las rutas de los archivos para obtener un formato coherente que el compilador pueda usar en todas partes.
Esto implica cosas como reemplazar barras invertidas con barras, o eliminar segmentos intermedios de rutas `/./` y `/../`.
Cuando *TypeScript* tiene que operar sobre millones de estas rutas, estas operaciones terminan siendo un poco lentas.
En *TypeScript 4.4*, las rutas primero se someten a comprobaciones rápidas para ver si necesitan alguna normalización en primer lugar.
Estas mejoras juntas reducen el tiempo de carga del proyecto en un 5-10% en proyectos más grandes y significativamente más en proyectos masivos que hemos probado internamente.

Para obtener más detalles, puedes [ver la *SE* para la normalización del segmento de ruta](https://github.com/microsoft/TypeScript/pull/44173) junto con [la *SE* para la normalización de la barra diagonal](https://github.com/microsoft/TypeScript/pull/44100).

### Mapeo de rutas más rápido

*TypeScript* ahora almacena en caché la forma en que construye mapeos de rutas (usando la opción [`paths`](/tsconfig#paths) en `tsconfig.json`).
Para proyectos con varios cientos de asignaciones, la reducción es significativa.
Puedes ver más [sobre el cambio en sí](https://github.com/microsoft/TypeScript/pull/44078).

### Compilaciones incrementales más rápidas con `--strict`

En lo que era efectivamente un error, *TypeScript* terminaría rehaciendo el trabajo de comprobación de tipos en compilaciones [`incremental`](/tsconfig#incremental) si [`strict`](/tsconfig#strict) estaba activado.
Esto llevó a que muchas compilaciones fueran tan lentas como si [`incremental`] (/tsconfig#incremental) estuviera desactivado.
*TypeScript 4.4* corrige esto, aunque el cambio también se ha actualizado a *TypeScript 4.3*.

Ve más [aquí](https://github.com/microsoft/TypeScript/pull/44394).

### Generación de mapas fuente más rápida para grandes resultados

*TypeScript 4.4* agrega una optimización para la generación de mapas fuente en archivos de salida extremadamente grandes.
Al crear una versión anterior del compilador de *TypeScript*, esto da como resultado una reducción de alrededor del 8% en el tiempo de emisión.

Nos gustaría extender nuestro agradecimiento a [David Michon](https://github.com/dmichon-msft) quien proporcionó un [cambio simple y limpio](https://github.com/microsoft/TypeScript/pull/44031) para permitir que este rendimiento gane.

### Compilaciones de `--force` más rápidas

Cuando se usa el modo `--build` en referencias de proyectos, *TypeScript* tiene que realizar comprobaciones actualizadas para determinar qué archivos se deben reconstruir.
Sin embargo, al realizar una compilación [`--force`](/tsconfig#force), esa información es irrelevante ya que cada dependencia del proyecto se reconstruirá desde cero.
En *TypeScript 4.4*, las compilaciones [`--force`](/tsconfig#force) evitan esos pasos innecesarios y comienzan una compilación completa.
Obtén más información sobre el cambio [aquí](https://github.com/microsoft/TypeScript/pull/43666).

## Sugerencias ortográficas para *JavaScript*

*TypeScript* potencia la experiencia de edición de *JavaScript* en editores como *Visual Studio* y *Visual Studio Code*.
La mayoría de las veces, *TypeScript* intenta mantenerse al margen de los archivos *JavaScript*;
sin embargo, *TypeScript* a menudo tiene mucha información para hacer sugerencias confiables y formas de hacer surgir sugerencias que no son *demasiado* invasivas.

Es por eso que *TypeScript* ahora emite sugerencias de ortografía en archivos *JavaScript* simples: los que no tienen `//@ts-check` o en un proyecto con [`checkJs`](/tsconfig#checkJs) desactivado.
Estas son las mismas sugerencias *"¿Quiero decir...?"* que los archivos *TypeScript* ya tienen, y ahora están disponibles en *todos* los archivos *JavaScript* de alguna forma.

Estas sugerencias de ortografía pueden proporcionar una pista sutil de que tu código es incorrecto.
¡Logramos encontrar algunos errores en el código existente mientras probamos esta función!

Para obtener más detalles sobre esta nueva función, [échale un vistazo a la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/44271).

## Sugerencias de incrustación

*TypeScript 4.4* proporciona soporte para *sugerencias de incrustación* que pueden ayudar a mostrar información útil como nombres de parámetros y tipos de retorno en tu código.
Puedes pensar en ellos como una especie de "texto fantasma" amistoso.

![Una vista previa de las sugerencias de incrustación en Visual Studio Code](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/08/inlayHints-4.4-rc-ghd.png)

Esta característica fue creada por [Wenlu Wang](https://github.com/Kingwl) cuya [solicitud de extracción](https://github.com/microsoft/TypeScript/pull/42089) tiene más detalles.

Wenlu también contribuyó con [la integración de sugerencias de incrustación en *Visual Studio Code*](https://github.com/microsoft/vscode/pull/113412) que se envió como [parte de la versión de julio de 2021 (1.59)](https://code.visualstudio.com/updates/v1_59#_typescript-44).
Si deseas probar las sugerencias de incrustación, asegúrate de que estás utilizando una versión [estable](https://code.visualstudio.com/updates/v1_59) reciente o [insiders](https: //code.visualstudio.com/insiders/) del editor.
También puedes modificar cuándo y dónde se muestran las sugerencias de incrustación en la configuración de *Visual Studio Code*.

## Las importaciones automáticas muestran rutas verdaderas en listas de completado

Cuando editores como *Visual Studio Code* muestran una lista de completado, las sugerencias que incluyen importaciones automáticas se muestran con una ruta al módulo dado;
sin embargo, esta ruta generalmente no es lo que *TypeScript* termina colocando en un especificador de módulo.
La ruta suele ser algo relativo al *espacio de trabajo*, lo cual significa que si estás importando desde un paquete como `moment`, a menudo verás una ruta como `node_modules/moment`.

![Una lista de completado que contiene rutas difíciles de manejar que contienen 'node_modules'. Por ejemplo, la etiqueta para `'calendarFormat'` es `'node_modules/moment/moment'` en lugar de `'moment'`](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/08/completion-import-labels-pre-4-4.png).

Estas rutas terminan siendo difíciles de manejar y, a menudo, engañosas, especialmente dado que la ruta que realmente se inserta en tu archivo debe considerar la resolución `node_modules` de *Node*, las asignaciones de ruta, los enlaces simbólicos y las reexportaciones.

¡Es por eso que con *TypeScript 4.4*, la etiqueta del elemento de completado ahora muestra la ruta del módulo *actual* que se utilizará para la importación!

![Una lista de completado que contiene rutas limpias sin `'node_modules'` intermedios. Por ejemplo, la etiqueta de `'calendarFormat'` es `'moment'` en lugar de `'node_modules/moment/moment'`](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/08/completion-import-labels-4-4.png).

Dado que este cálculo puede ser costoso, las listas de completado que contienen muchas importaciones automáticas pueden completar los especificadores finales del módulo en lotes a medida que ingresas más caracteres. Es posible que a veces todavía veas las antiguas etiquetas de ruta relativas al espacio de trabajo; sin embargo, a medida que tu experiencia de edición "se calienta", se debería reemplazar con la ruta real después de una o dos pulsaciones más.

## Ruptura por cambios

### Cambios de `lib.d.ts` para *TypeScript 4.4*

Como con todas las versiones de *TypeScript*, las declaraciones para `lib.d.ts` (especialmente las declaraciones generadas para contextos web), han cambiado.
Puedes consultar [nuestra lista de cambios conocidos de `lib.dom.d.ts`](https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-869224737) para comprender qué es impactado.

### Llamadas indirectas más compatibles para funciones importadas

En versiones anteriores de *TypeScript*, llamar a una importación desde *CommonJS*, *AMD* y otros sistemas de módulos que no son de *ES* establecería el valor `this` de la función llamada.
Específicamente, en el siguiente ejemplo, al llamar a `fooModule.foo()`, el método `foo()` tendrá `fooModule` establecido como el valor de `this`.

```ts
// Imagina que este es nuestro módulo importado y tiene una exportación llamada 'foo'.
let fooModule = {
  foo() {
    console.log(this);
  },
};

fooModule.foo();
```

Esta no es la forma en que se supone que trabajan las funciones exportadas en *ECMAScript* cuando las llamamos.
Es por eso que *TypeScript 4.4* descarta intencionalmente el valor `this` al llamar a funciones importadas, utilizando la siguiente emisión.

```ts
// Imagina que este es nuestro módulo importado y tiene una exportación llamada 'foo'.
let fooModule = {
  foo() {
    console.log(this);
  },
};

// Observa que en realidad estamos llamando '(0, fooModule.foo)' ahora, que es sutilmente diferente.
(0, fooModule.foo)();
```

Puedes [leer más sobre los cambios aquí](https://github.com/microsoft/TypeScript/pull/44624).

### Usar `unknown` en las variables `Catch`

Los usuarios que ejecutan con el indicador [`strict`](/tsconfig#strict) pueden ver nuevos errores alrededor de las variables `catch` que son `unknown`, especialmente si el código existente asume que solo se han detectado valores de `Error`.
Esto a menudo da como resultado mensajes de error como:

```
La propiedad 'message' no existe en el tipo 'unknown'.
La propiedad 'name' no existe en el tipo 'unknown'.
La propiedad 'stack' no existe en el tipo 'unknown'.
```

Para evitar esto, puedes agregar específicamente comprobaciones de el entorno de ejecución para asegurarte de que el tipo lanzado coincide con el tipo esperado.
De lo contrario, puedes usar una aserción de tipo, agregar un `:any` explícito en tu variable `catch`, o apagar [`useUnknownInCatchVariables`](/tsconfig#useUnknownInCatchVariables).

### Comprobaciones más amplias de promesas siempre verdaderas

En versiones anteriores, *TypeScript* introdujo "comprobaciones de `Promise` Siempre Verdadera" para detectar el código donde se puede haber olvidado un `await`;
sin embargo, las comprobaciones solo se aplicaron a declaraciones con nombre.
Eso significaba que si bien este código recibiría correctamente un error...

```ts
async function foo(): Promise<boolean> {
  return false;
}

async function bar(): Promise<string>
  const fooResult = foo();
  if (fooResult) {
    // <- ¡error! :D
    return "true";
  }
  return "false";
}
```

...el siguiente código no lo tendría.

```ts
async function foo(): Promise<boolean> {
  return false;
}

async function bar(): Promise<string>
  if (foo()) {
    // <- no error :(
    return "true";
  }
  return "false";
}
```

*TypeScript 4.4* ahora marca ambos.
Para obtener más información, [lee sobre el cambio original](https://github.com/microsoft/TypeScript/pull/44491).

### Las propiedades abstractas no permiten iniciadores

El siguiente código ahora es un error porque es posible que las propiedades abstractas no tengan iniciadores:

```ts
abstract class C {
  abstract prop = 1;
  //       ~~~~
  // La propiedad 'prop' no puede tener un iniciador porque está marcada como abstracta.
}
```

En su lugar, solo puedes especificar un tipo para la propiedad:

```ts
abstract class C {
  abstract prop: number;
}
```
