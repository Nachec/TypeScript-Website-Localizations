---
title: TypeScript 4.7
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-7.html
oneline: Notas de la versión de TypeScript 4.7
---

## Soporte del módulo *ECMAScript* en *Node.js*

Durante los últimos años, *Node.js* ha estado trabajando para admitir la ejecución de *módulos ECMAScript* (*ESM*).
Esta ha sido una característica muy difícil de soportar, ya que la base del ecosistema *Node.js* se basa en un sistema de módulos diferente llamado *CommonJS* (*CJS*).
Interoperar entre los dos trae grandes desafíos, con muchas características nuevas para hacer malabares;
sin embargo, el soporte para *ESM* en *Node.js* ahora se implementa en gran medida en *Node.js 12* y versiones posteriores.
Alrededor de *TypeScript 4.5*, implementamos soporte solo por la noche para *ESM* en *Node.js* para obtener algunos comentarios de los usuarios y permitir que los autores de la biblioteca se preparen para un soporte más amplio.

*TypeScript 4.7* agrega esta funcionalidad con dos nuevas configuraciones de `module`: `node16` y `nodenext`.

```jsonc
{
    "compilerOptions": {
        "module": "node16",
    }
}
```

Estos nuevos modos traen algunas características de alto nivel que exploraremos aquí.

### `type` en `package.json` y nuevas extensiones

*Node.js* admite [una nueva configuración en `package.json`](https://nodejs.org/api/packages.html#packages_package_json_and_file_extensions) llamado `type`.
`"type"` se puede configurar como `"module"` o `"commonjs"`.

```jsonc
{
    "name": "my-package",
    "type": "module",

    "//": "...",
    "dependencies": {
    }
}
```

Esta configuración controla si los archivos `.js` se interpretan como *módulos ES* o módulos *CommonJS*, y los valores predeterminados son *CommonJS* cuando no se configuran.
Cuando un archivo se considera un *módulo ES*, entran en juego algunas reglas diferentes en comparación con *CommonJS*:

* Se pueden usar declaraciones `import`/`export`.
* Se pueden usar declaraciones `await` de nivel superior
* Las rutas de importación relativas necesitan extensiones completas (tenemos que escribir `import "./foo.js"` en lugar de `import "./foo"`)
* Las importaciones se pueden resolver de manera diferente a las dependencias en `node_modules`
* Ciertos valores de tipo global como `require` y `module` no se pueden usar directamente.
* Los módulos *CommonJS* se importan bajo ciertas reglas especiales.

Volveremos a algunos de estos.

Para superponer la forma en que *TypeScript* funciona en este sistema, los archivos `.ts` y `.tsx` ahora funcionan de la misma manera.
Cuando *TypeScript* encuentra un archivo `.ts`, `.tsx`, `.js` o `.jsx`, buscará un `package.json` para ver si ese archivo es un *módulo ES* y que usará para determinar:

* cómo encontrar otros módulos que importan ese archivo
* y cómo transformar ese archivo si produce resultados

Cuando un archivo `.ts` se compila como un *módulo ES*, la sintaxis de *ECMAScript* `import`/ `export` se deja sola en la salida de `.js`;
cuando se compila como un módulo *CommonJS*, producirá el mismo resultado que obtienes hoy en `--module commonjs`.

Esto también significa que las rutas se resuelven de manera diferente entre los archivos `.ts` que son *módulos ES* y los que son módulos *CJS*.
Por ejemplo, digamos que tiene el siguiente código hoy:

```ts
// ./foo.ts
export function helper() {
    // ...
}

// ./bar.ts
import { helper } from "./foo"; // solo trabaja en CJS

helper();
```

Este código funciona en los *módulos CommonJS*, pero fallará en los *módulos ES* porque las rutas de importación relativas necesitan usar extensiones.
Como resultado, se tendrá que reescribir para usar la extensión *output* de `foo.ts` ⏤ así que `bar.ts` tendrá que importar desde `./foo.js`.

```ts
// ./bar.ts
import { helper } from "./foo.js"; // trabaja en MES y CJS

helper();
```

Esto puede parecer un poco engorroso al principio, pero las herramientas de *TypeScript*, como las importaciones automáticas y el completado de la ruta, normalmente lo harán por ti.

Otra cosa a mencionar es el hecho de que esto también se aplica a los archivos `.d.ts`.
Cuando *TypeScript* encuentra un archivo `.d.ts` en el paquete, se interpreta según el paquete que lo contiene.

### Nuevas extensiones de archivo

El campo `type` en `package.json` es bueno porque nos permite continuar usando las extensiones de archivo `.ts` y `.js` que pueden ser convenientes;
sin embargo, ocasionalmente necesitarás escribir un archivo que difiera de lo que especifica `type`.
También es posible que prefieras ser explícito siempre.

*Node.js* admite dos extensiones para ayudar con esto: `.mjs` y `.cjs`.
Los archivos `.mjs` siempre son *módulos ES*, y los archivos `.cjs` siempre son *módulos CommonJS*, y no hay forma de anularlos.

A su vez, *TypeScript* admite dos nuevas extensiones de archivo fuente: `.mts` y `.cts`.
Cuando *TypeScript* los emite a archivos *JavaScript*, los emitirá a `.mjs` y `.cjs` respectivamente.

Además, *TypeScript* también admite dos nuevas extensiones de archivo de declaración: `.d.mts` y `.d.cts`.
Cuando *TypeScript* genera archivos de declaración para `.mts` y `.cts`, sus extensiones correspondientes serán `.d.mts` y `.d.cts`.

El uso de estas extensiones es completamente opcional, pero a menudo será útil incluso si eliges no usarlas como parte de tu flujo de trabajo principal.

### Interoperavilidad *CommonJS*

*Node.js* permite a los *módulos ES* importar *módulos CommonJS* como si fueran *módulos ES* con una exportación predeterminada.

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import foo from "./foo.cjs";

// imprime "¡hello world!"
foo.helper();
```

En algunos casos, *Node.js* también sintetiza exportaciones con nombre de *módulos CommonJS*, lo que puede ser más conveniente.
En estos casos, los *módulos ES* pueden utilizar una importación al "estilo de espacio de nombres" (es decir, `import * as foo from "..."`), o importaciones con nombre (es decir,`import { helper } from "..."`).

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import { helper } from "./foo.cjs";

// imprime "¡hello world!"
helper();
```

No siempre hay una forma de que *TypeScript* sepa si estas importaciones con nombre se sintetizarán, pero *TypeScript* se equivocará al ser permisivo y usará algunas heurísticas al importar desde un archivo que definitivamente es un *módulo CommonJS*.

Una nota específica de *TypeScript* sobre la interoperabilidad es la siguiente sintaxis:

```ts
import foo = require("foo");
```

En un *módulo CommonJS*, esto se reduce a una llamada `require()`, y en un *módulo ES*, esto importa [`createRequire`](https://nodejs.org/api/module.html#module_module_createrequire_filename) para lograr la misma cosa.
Esto hará que el código sea menos portátil en entornos de ejecución como el navegador (que no admite `require()`), pero a menudo será útil para la interoperabilidad.
A su vez, puedes escribir el ejemplo anterior usando esta sintaxis de la siguiente manera:

```ts
// ./foo.cts
export function helper() {
    console.log("hello world!");
}

// ./bar.mts
import foo = require("./foo.cjs");

foo.helper()
```

Finalmente, vale la pena señalar que la única forma de importar archivos *MES* desde un *módulo CJS* es usando llamadas dinámicas `import()`.
Esto puede presentar desafíos, pero es el comportamiento en *Node.js* hoy.

Puedes [leer más sobre la interoperabilidad de *MES*/*CommonJS* en *Node.js* aquí](https://nodejs.org/api/esm.html#esm_interoperability_with_commonjs).

### `package.json` Exportaciones, importaciones y autorreferencia

*Node.js* admite [un nuevo campo para definir puntos de entrada en `package.json` llamado `"exports"`](https://nodejs.org/api/packages.html#packages_exports).
Este campo es una alternativa más poderosa para definir `"main"` en `package.json`, y puede controlar qué partes de tu paquete están expuestas a los consumidores.

Aquí hay un `package.json` que admite puntos de entrada separados para `CommonJS` y `ESM`:

```jsonc
// `package.json`
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Punto de entrada para `import "mi-paquete"` en *MES*
            "import": "./esm/index.js",

            // Punto de entrada para `require("my-package")` en CJS
            "require": "./commonjs/index.cjs",
        },
    },

    // Recurso de CJS para versiones anteriores de Node.js
    "principal": "./commonjs/index.cjs",
}
```

Hay mucho en esta característica, [sobre la que puedes leer más en la documentación de *Node.js*](https://nodejs.org/api/packages.html).
Aquí intentaremos centrarnos en cómo lo admite *TypeScript*.

Con el soporte de *Node* original de *TypeScript*, buscaría un campo `"main"` y luego buscaría archivos de declaración que correspondieran a esa entrada.
Por ejemplo, si `"main"` apunta a `./lib/index.js`, *TypeScript* buscará un archivo llamado `./lib/index.d.ts`.
El autor de un paquete podría anular esto especificando un campo separado llamado `"types"` (por ejemplo, `"types"`: "./types/index.d.ts"`).

El nuevo soporte funciona de manera similar con [condiciones de importación](https://nodejs.org/api/packages.html).
De forma predeterminada, *TypeScript* superpone las mismas reglas con las condiciones de importación: si escribes una `import` desde un *módulo ES*, buscará el campo `import` y, desde un *módulo CommonJS*, buscará el campo `require`.
Si los encuentra, buscará el archivo de declaración correspondiente.
Si necesitas apuntar a una ubicación diferente para tus declaraciones de tipo, puedes agregar una condición de importación `"types"`.

```jsonc
// `package.json`
{
    "name": "my-package",
    "type": "module",
    "exports": {
        ".": {
            // Punto de entrada para `import "mi-paquete"` en *MES*
            "import": {
                // Dónde se verá TypeScript.
                "tipos": "./types/esm/index.d.ts",

                // Dónde se verá Node.js.
                "default": "./esm/index.js"
            },
            // Punto de entrada para `require("my-package")` en CJS
            "require": {
                // Dónde se verá TypeScript.
                "tipos": "./types/commonjs/index.d.cts",

                // Dónde se verá Node.js.
                "default": "./commonjs/index.cjs"
            },
        }
    },

    // Respaldo para versiones anteriores de TypeScript
    "tipos": "./types/index.d.ts",

    // Recurso de CJS para versiones anteriores de Node.js
    "principal": "./commonjs/index.cjs"
}
```

<aside>

Ten en cuenta que la condición `"types"` siempre debe aparecer primero en `"exports"`.

</aside>

*TypeScript* también es compatible con [el campo `"imports"` de `package.json`](https://nodejs.org/api/packages.html#packages_imports) de manera similar al buscar archivos de declaración junto con los archivos correspondientes y admite [paquetes que hacen referencia a sí mismos](https://nodejs.org/api/packages.html#packages_self_referencing_a_package_using_its_name).
Estas características generalmente no son tan complicadas de configurar, pero son admisibles.

### ¡Se buscan tus comentarios!

A medida que continuamos trabajando en *TypeScript 4.7*, esperamos ver más documentación y pulir esta funcionalidad.
Apoyar estas nuevas funciones ha sido una tarea ambiciosa, ¡y por eso estamos buscando comentarios tempranos al respecto!
Pruébalo y haznos saber cómo te funcionan.

Para obtener más información, [puedes ver la *SE* de implementación aquí](https://github.com/microsoft/TypeScript/pull/44501).

## Control sobre la detección de módulos

Un problema con la introducción de módulos en *JavaScript* fue la ambigüedad entre el código del "script" existente y el código del nuevo módulo.
El código *JavaScript* en un módulo se ejecuta de manera ligeramente diferente y tiene diferentes reglas de alcance, por lo que las herramientas tienen que tomar decisiones sobre cómo se ejecuta cada archivo.
Por ejemplo, *Node.js* requiere que los puntos de entrada del módulo se escriban en `.mjs`, o que tengan un `package.json` cercano con `"type": "module"`.
*TypeScript* trata un archivo como un módulo cada vez que encuentra cualquier declaración `import` o `export` en un archivo, pero de lo contrario, asumirá que un archivo `.ts` o `.js` es un archivo de script que actúa en el ámbito global.

Esto no coincide con el comportamiento de *Node.js* donde `package.json` puede cambiar el formato de un archivo, o `--jsx` configurando `react-jsx`, donde cualquier archivo *JSX* contiene una `import` implícita a una fábrica *JSX*.
Tampoco coincide con las expectativas modernas donde la mayoría de los nuevos códigos *TypeScript* se escriben con módulos en mente.

Es por eso que *TypeScript 4.7* presenta una nueva opción llamada `moduleDetection`.
`moduleDetection` puede tomar 3 valores: `"auto"` (predeterminado), `"legacy"` (el mismo comportamiento que 4.6 y anteriores) y `"force"`.

En el modo `"auto"`, *TypeScript* no solo buscará declaraciones de `import` y `export`, sino que también comprobará si:

* el campo `"type"` en `package.json` se establece en `"module"` cuando se ejecuta bajo `--module nodenext`/`--module node16`, y
* comprueba si el archivo actual es un archivo *JSX* cuando se ejecuta bajo `--jsx react-jsx`

En los casos en los que desee que todos los archivos se traten como un módulo, la configuración `"force"` garantiza que todos los archivos que no sean de declaración se traten como un módulo.
Esto será cierto independientemente de cómo se configuren `module`, `moduleResoluton` y `jsx`.

Mientras tanto, la opción `"legacy"` simplemente vuelve al antiguo comportamiento de buscar únicamente declaraciones `import` y `export` para determinar si un archivo es un módulo.

Puedes [leer más sobre este cambio en la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/47495).

## Análisis del control de flujo para acceso a elementos entre paréntesis

*TypeScript 4.7* ahora limita los tipos de acceso a elementos cuando las claves indexadas son tipos literales y símbolos únicos.
Por ejemplo, toma el siguiente código:

```ts
const key = Symbol();

const numberOrString = Math.random() < 0.5 ? 42 : "hello";

const obj = {
    [key]: numberOrString,
};

if (typeof obj[key] === "string") {
    let str = obj[key].toUpperCase();
}
```

Anteriormente, *TypeScript* no consideraba ningún tipo de protección en `obj[key]` y no tenía idea de que `obj[key]` era realmente un `string`.
En su lugar, pensaría que `obj[key]` todavía es un `string | number` y acceder a `toUpperCase()` generaría un error.

*TypeScript 4.7* ahora sabe que `obj[key]` es una cadena.

Esto también significa que bajo `--strictPropertyInitialization`, *TypeScript* puede comprobar correctamente que las propiedades calculadas se inicializan al final del cuerpo de un constructor.

```ts
// 'key' has type 'unique symbol'
const key = Symbol();

class C {
    [key]: string;

    constructor(str: string) {
        // oops, forgot to set 'this[key]'
    }

    screamString() {
        return this[key].toUpperCase();
    }
}
```

Bajo *TypeScript 4.7*, `--strictPropertyInitialization` informa un error que nos dice que la propiedad `[key]` no se asignó definitivamente al final del constructor.

¡Nos gustaría extender nuestra gratitud a [Oleksandr Tarasiuk](https://github.com/a-tarasyuk) que proporcionó [este cambio](https://github.com/microsoft/TypeScript/pull/45974)!

## Inferencia de funciones mejorada en objetos y métodos

*TypeScript 4.7* ahora puede realizar inferencias más granulares a partir de funciones dentro de objetos y arreglos.
Esto permite que los tipos de estas funciones fluyan consistentemente de izquierda a derecha, al igual que para los argumentos simples.

```ts
declare function f<T>(arg: {
    produce: (n: string) => T,
    consume: (x: T) => void }
): void;

// ¡Funciona!
f({
    produce: () => "hello",
    consume: x => x.toLowerCase()
});

// ¡Funciona!
f({
    produce: (n: string) => n,
    consume: x => x.toLowerCase(),
});

// Anteriormente era un error, ¡ahora funciona!
f({
    produce: n => n,
    consume: x => x.toLowerCase(),
});

// Anteriormente era un error, ¡ahora funciona!
f({
    produce: function () { return "hello"; },
    consume: x => x.toLowerCase(),
});

// Anteriormente era un error, ¡ahora funciona!
f({
    produce() { return "hello" },
    consume: x => x.toLowerCase(),
});
```

La inferencia falló en algunos de estos ejemplos porque conocer el tipo de sus funciones `produce` solicitaría indirectamente el tipo de `arg` antes de encontrar un buen tipo para `T`.
*TypeScript* ahora reúne funciones que podrían contribuir al tipo inferido de `T` y deduce de ellas relajadamente.

Para obtener más información, puedes [echar un vistazo a las modificaciones específicas de nuestro proceso de inferencia](https://github.com/microsoft/TypeScript/pull/48538).

## Expresiones de instanciación

Ocasionalmente, las funciones pueden ser un poco más generales de lo que queremos.
Por ejemplo, digamos que tenemos una función `makeBox`.

```ts
interface Caja<T> {
    value: T;
}

function makeBox<T>(value: T) {
    return { value };
}
```

Tal vez queramos crear un conjunto de funciones más especializado para hacer `Boxes` de `Wrench`s y `Hammer`s.
Para hacer eso hoy, tendríamos que envolver `makeBox` en otras funciones, o usar un tipo explícito para un alias de `makeBox`.

```ts
function makeHammerBox(hammer: Hammer) {
    return makeBox(hammer);
}

// o...

const makeWrenchBox: (wrench: Wrench) => Box<Wrench> = makeBox;
```

Estos funcionan, pero envolver una llamada a `makeBox` es un poco derrochador, y escribir la firma completa de `makeWrenchBox` podría ser difícil de manejar.
Idealmente, podríamos decir que solo queremos alias `makeBox` mientras reemplazamos todos los genéricos en su firma.

¡*TypeScript 4.7* permite exactamente eso!
Ahora podemos tomar funciones y constructores y alimentarlos con argumentos de tipo directamente.

```ts
const makeHammerBox = makeBox<Hammer>;
const makeWrenchBox = makeBox<Wrench>;
```

Entonces, con esto, podemos especializar `makeBox` para aceptar tipos más específicos y rechazar cualquier otra cosa.

```ts
const makeStringBox = makeBox<string>;

// TypeScript rechaza esto correctamente.
makeStringBox(42);
```

Esta lógica también trabaja para funciones constructoras como `Array`, `Map` y `Set`.

```ts
// Tiene tipo `new () => Map<string, Error>`
const ErrorMap = Map<string, Error>;

// Tiene el tipo `// Map<string, Error>`
const errorMap = new ErrorMap();
```

Cuando a una función o constructor se le dan argumentos de tipo, producirá un nuevo tipo que mantendrá todas las firmas con listas de parámetros de tipo compatibles y reemplazará los parámetros de tipo correspondientes con los argumentos de tipo dados.
Cualquier otra firma se elimina, ya que *TypeScript* asumirá que no están destinadas a ser utilizadas.

Para obtener más información sobre esta función, [consulta la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/47607).

## Restricciones `extends` en variables de tipo `infer`

Los tipos condicionales son un poco una función de usuario avanzado.
Nos permiten emparejar e inferir contra la forma de los tipos, y tomar decisiones basadas en ellos.
Por ejemplo, podemos escribir un tipo condicional que devuelva el primer elemento de un tipo tupla si es un tipo tipo `string`.

```ts
type FirstIfString<T> =
    T extends [infer S, ...unknown[]]
        ? S extends string ? S : never
        : never;

 // string
type A = FirstIfString<[string, number, number]>;

// "hello"
type B = FirstIfString<["hello", number, number]>;

// "hello" | "world"
type C = FirstIfString<["hello" | "world", boolean]>;

// never
type D = FirstIfString<[boolean, number, string]>;
```

`FirstIfString` coincide con cualquier tupla con al menos un elemento y toma el tipo del primer elemento como `S`.
Luego verifica si `S` es compatible con `string` y devuelve ese tipo si lo es.

Ten en cuenta que tuvimos que usar dos tipos condicionales para escribir esto.
Podríamos haber escrito `FirstIfString` de la siguiente manera:

```ts
type FirstIfString<T> =
    T extends [string, ...unknown[]]
        // Toma el primer tipo de `T`
        ? T[0]
        : never;
```

Esto funciona, pero es un poco más "manual" y menos declarativo.
En lugar de simplemente hacer coincidir el patrón en el tipo y dar un nombre al primer elemento, tenemos que buscar el elemento '0' de 'T' con 'T[0]'.
Si estuviéramos tratando con tipos más complejos que las tuplas, esto podría ser mucho más complicado, por lo que `infer` puede simplificar las cosas.

Usar condicionales anidados para inferir un tipo y luego compararlo con ese tipo inferido es bastante común.
Para evitar ese segundo nivel de anidamiento, *TypeScript 4.7* ahora te permite colocar una restricción en cualquier tipo `infer`.

```ts
type FirstIfString<T> =
    T extends [infer S extends string, ...unknown[]]
        ? S
        : never;
```

De esta manera, cuando *TypeScript* coincide con `S`, también asegura que `S` tiene que ser un `string`.
Si `S` no es un `string`, toma la ruta falsa, que en estos casos es `never`.

Para obtener más detalles, puedes [leer sobre el cambio en *GitHub*](https://github.com/microsoft/TypeScript/pull/48112).

## Anotaciones opcionales de varianza para el tipo de parámetros

Tomemos los siguientes tipos.

```ts
interface Animal {
    animalStuff: any;
}

interface Dog extends Animal {
    dogStuff: any;
}

// ...

type Getter<T> = () => T;

type Setter<T> = (value: T) => void;
```

Imagina que tuviéramos dos instancias diferentes de `Getter`s.
Averigua si dos 'Getters' diferentes son sustituibles entre sí depende completamente de `T`.
En el caso de si una asignación de `Getter<Dog>`&nbsp;&rarr;&nbsp;`Getter<Animal>` es válida, tenemos que comprobar si `Dog`&nbsp;&rarr;&nbsp;`Animal` es válida.
Debido a que cada tipo de `T` simplemente se relaciona en la misma "dirección", decimos que el tipo `Getter` es *covariante* en 'T'.
Por otro lado, comprobar si `Setter<Dog>`&nbsp;&rarr;&nbsp;`Setter<Animal>` es válido implica comprobar si `Animal`&nbsp;&rarr;&nbsp;`Dog` es válido.
Ese "cambio" de dirección es algo así como en matemáticas, comprobando si &minus;*x*&nbsp;&lt;&nbsp;*&minus;y* es lo mismo que comprobar si *y*&nbsp;&lt;&nbsp;*x*.
Cuando tenemos que cambiar direcciones como esta para comparar `T`, decimos que `Setter` es *contravariante* en 'T'.

Con *TypeScript 4.7*, ahora podemos especificar *explícitamente* la variación en los parámetros de tipo.

Así que ahora, si queremos hacer explícito que `Getter` es covariante de `T`, ahora podemos darle un modificador `out`.

```ts
type Getter<out T> = () => T;
```

Y de manera similar, si también queremos hacer explícito que `Setter` es contravariante de `T`, podemos darle un modificador `in`.

```ts
type Setter<in T> = (value: T) => void;
```

`out` y `in` se usan aquí porque la varianza de un parámetro de tipo depende de si se usa en una *salida* o una *entrada*.
En lugar de pensar en la varianza, puedes pensar si se usa `T` en las posiciones de entrada y salida.

También hay casos para usar tanto `in` como `out`.

```ts
interface State<in out T> {
    get: () => T;
    set: (value: T) => void;
}
```

Cuando se usa una `T` tanto en una posición de salida como de entrada, se vuelve *invariable*.
Dos `State<T>` diferentes no se pueden intercambiar a menos que sus `T` sean iguales.
En otras palabras, `State<Dog>` y `State<Animal>` no son sustituibles entre sí.

Ahora, técnicamente hablando, en un sistema de tipo puramente estructural, los parámetros de tipo y su variación realmente no importan. simplemente puedes conectar tipos en lugar de cada parámetro de tipo y verificar si cada miembro coincidente es estructuralmente compatible.
Entonces, si *TypeScript* usa un sistema de tipo estructural, ¿por qué estamos interesados ​​en la variación de los parámetros de tipo?
¿Y por qué querríamos anotarlos?

Una razón es que puede ser útil para un lector ver explícitamente cómo se usa un parámetro de tipo de un vistazo.
Para tipos mucho más complejos, puede ser difícil saber si un tipo está destinado a ser leído, escrito o ambos.
*TypeScript* también nos ayudará si olvidamos mencionar cómo se usa ese parámetro de tipo.
Como ejemplo, si olvidamos especificar tanto `in` como `out` en `State`, obtendríamos un error.

```ts
interface State<out T> {
    //          ~~~~~
    // ¡error!
    // El tipo 'Estado<sub-T>' no se puede asignar al tipo 'Estado<super-T>' como implica la anotación de varianza.
    //   Los tipos de propiedad 'set' son incompatibles.
    //     Tipo '(value: sub-T) => void' no se puede asignar al tipo '(value: super-T) => void'.
    //       Los parámetros de tipo 'value' y 'value' son incompatibles.
    //         El tipo 'super-T' no se puede asignar al tipo 'sub-T'.
    get: () => T;
    set: (value: T) => void;
}
```

¡Otra razón es la precisión y la velocidad!
*TypeScript* ya intenta inferir la variación de los parámetros de tipo como una optimización.
Al hacer esto, puede verificar el tipo de tipos estructurales más grandes en una cantidad de tiempo razonable.
Calcular la varianza con anticipación permite que el verificador de tipos omita comparaciones más profundas y solo compare argumentos de tipo que pueden ser *mucho* más rápido que comparar la estructura completa de un tipo una y otra vez.
Pero a menudo hay casos en los que este cálculo sigue siendo bastante costoso y el cálculo puede encontrar circularidades que no se pueden resolver con precisión, lo cual significa que no hay una respuesta clara para la varianza de un tipo.

```ts
type Foo<T> = {
    x: T;
    f: Bar<T>;
}

type Bar<U> = (x: Baz<U[]>) => void;

type Baz<V> = {
    value: Foo<V[]>;
}

declare let foo1: Foo<unknown>;
declare let foo2: Foo<string>;

foo1 = foo2;  // Debería ser un error pero no lo es ❌
foo2 = foo1;  // Error - correct ✅
```

Proporcionar una anotación explícita puede acelerar la verificación de tipos en estas circularidades y proporcionar una mayor precisión.
Por ejemplo, marcar `T` como invariable en el ejemplo anterior puede ayudar a detener la asignación problemática.

```diff
- type Foo<T> = {
+ type Foo<in out T> = {
      x: T;
      f: Bar<T>;
  }
```

No recomendamos necesariamente anotar cada parámetro de tipo con su varianza;
Por ejemplo, es posible (pero no recomendado) hacer que la varianza sea un poco más estricta de lo necesario, por lo que *TypeScript* no te impedirá marcar algo como invariable si en realidad es solo covariante, contravariante o incluso independiente.
Por lo tanto, si eliges agregar marcadores de varianza explícitos, te recomendamos que los uses con cuidado y precisión.

Pero si estás trabajando con tipos profundamente recursivos, especialmente si eres autor de una biblioteca, puedes estar interesado en usar estas anotaciones en beneficio de tus usuarios.
Esas anotaciones pueden proporcionar ganancias tanto en precisión como en velocidad de verificación de tipos, lo que incluso puede afectar tu experiencia de edición de código.
La determinación de cuándo el cálculo de la varianza es un cuello de botella en el tiempo de verificación de tipos se puede hacer de forma experimental y se puede determinar usando herramientas como nuestra utilidad [analyze-trace](https://github.com/microsoft/typescript-analyze-trace).


Para obtener más detalles sobre esta característica, puedes [leer sobre la solicitud de extracción] (https://github.com/microsoft/TypeScript/pull/48240).

## Personalización de resolución con `moduleSuffixes`

*TypeScript 4.7* ahora admite una opción `moduleSuffixes` para personalizar cómo se buscan los especificadores de módulos.

```jsonc
{
    "compilerOptions": {
        "moduleSuffixes": [".ios", ".native", ""]
    }
}
```

Dada la configuración anterior, una importación como la siguiente...

```ts
import * as foo from "./foo";
```

intentará buscar en los archivos relativos `./foo.ios.ts`, `./foo.native.ts` y finalmente `./foo.ts`.

<aside>

Ten en cuenta que la cadena vacía `""` en `moduleSuffixes` es necesaria para que *TypeScript* también busque `./foo.ts`.
En cierto sentido, el valor predeterminado para `moduleSuffixes` es `[""]`.

</aside>

Esta característica puede ser útil para proyectos *React Native* donde cada plataforma destino puede usar un `tsconfig.json` separado con diferentes `moduleSuffixes`.

¡[La opción `moduleSuffixes`](https://github.com/microsoft/TypeScript/pull/48189) fue aportada gracias a [Adam Foxman](https://github.com/afoxman)!

## `resolution-mode`

Con la resolución *ECMAScript* de *Node*, el modo del archivo contenedor y la sintaxis que usa determina cómo se resuelven las importaciones;
sin embargo, sería útil hacer referencia a los tipos de un módulo *CommonJS* desde un módulo *ECMAScript*, o viceversa.

*TypeScript* ahora permite las directivas `/// <reference types="..." />`.

```ts
/// <reference types="pkg" resolution-mode="require" />

// o

/// <reference types="pkg" resolution-mode="import" />
```

Además, en las versiones nocturnas de *TypeScript*, el `import type` puede especificar una afirmación de importación para lograr algo similar.

```ts
// Resuelve `pkg` como si estuviéramos importando con `require()`
import type { TypeFromRequire } from "pkg" assert {
    "resolution-mode": "require"
};

// Resuelve `pkg` como si estuviéramos importando con `import`
import type { TypeFromImport } from "pkg" assert {
    "resolution-mode": "import"
};

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

Las llamadas `import()` dinámicas también pueden usar aserciones de importación a través de un segundo argumento.

```ts
export type TypeFromRequire =
    import("pkg", { assert: { "resolution-mode": "require" } }).TypeFromRequire;

export type TypeFromImport =
    import("pkg", { assert: { "resolution-mode": "import" } }).TypeFromImport;

export interface MergedType extends TypeFromRequire, TypeFromImport {}
```

Las sintaxis `import type` e `import()` solo admiten el `resolution-mode` en [compilaciones nocturnas de *TypeScript*](https://www.typescriptlang.org/docs/handbook/nightly-builds.html).
Es probable que obtengas un error como

```
Las aserciones del modo de resolución son inestables. Usa *TypeScript* nocturno para silenciar este error. Intenta actualizar con 'npm install -D typescript@next'.
```

Si te encuentras usando esta función en versiones nocturnas de *TypeScript*, [considera proporcionar comentarios sobre este problema](https://github.com/microsoft/TypeScript/issues/49055).

Puedes ver los cambios respectivos [para directivas de referencia](https://github.com/microsoft/TypeScript/pull/47732) y [para aserciones de importación de tipos](https://github.com/microsoft/TypeScript/ tirar/ 47807).

## Ir a la fuente de la definición

*TypeScript 4.7* contiene soporte para un nuevo comando de editor experimental llamado *Ir a la fuente de la definición*.
Es similar a *Ir a la definición*, pero nunca devuelve resultados dentro de los archivos de declaración.
En su lugar, trata de encontrar los archivos de la *implementación* correspondiente (como archivos `.js` o `.ts`), y busca definitivamente allí &mdash; si incluso esos archivos normalmente están sombreados por archivos `.d.ts`.

Esto es muy útil cuando necesitas echar un vistazo a la implementación de una función que es importante desde una biblioteca en lugar de su declaración de tipo en un archivo `.d.ts`.

![El comando "Ir a la fuente de la definición" en el uso del paquete *yargs* lleva al editor a un archivo `index.cjs` en `yargs`](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2022/05/go-to-source-definition-4-7-v1.gif).

Puedes probar este nuevo comando en las más recientes versiones de *Visual Studio Code*.
Ten en cuenta, sin embargo, que esta funcionalidad aún está en versión preliminar y existen algunas limitaciones conocidas.
En algunos casos, *TypeScript* usa heurística para adivinar qué archivo `.js` corresponde al resultado dado de una definición, por lo que estos resultados pueden ser inexactos.
*Visual Studio Code* tampoco indica aún si un resultado fue una suposición, pero es algo en lo que estamos colaborando.

Puedes dejar comentarios sobre la característica, leer acerca de las limitaciones conocidas u obtener más información en [nuestros comentarios dedicados del problema](https://github.com/microsoft/TypeScript/issues/49003).

## Importaciones de organizaciones conscientes de grupos

*TypeScript* tiene `Organize imports` función de editor para *JavaScript* y *TypeScript*.
Desafortunadamente, podría ser un instrumento un poco contundente y, a menudo, ordenaría ingeniosamente tus declaraciones `import`.

Por ejemplo, si ejecutas `Organize imports` en el siguiente archivo...

```ts
// local code
import * as bbb from "./bbb";
import * as ccc from "./ccc";
import * as aaa from "./aaa";

// integrada
import * as path from "path";
import * as child_process from "child_process"
import * as fs from "fs";

// algún código...
```

Deberías obtener algo como lo siguiente

```ts
// local code
import * as child_process from "child_process";
import * as fs from "fs";
// integrada
import * as path from "path";
import * as aaa from "./aaa";
import * as bbb from "./bbb";
import * as ccc from "./ccc";


// algún código...
```

Eso... no es ideal.
Claro, nuestras importaciones se ordenan por sus rutas, y nuestros comentarios y nuevas líneas se conservan, pero no de la manera que esperábamos.
La mayor parte del tiempo, si tenemos nuestras importaciones agrupadas de una manera específica, entonces queremos mantenerlas así.

*TypeScript 4.7* realiza `Organize imports` de manera grupal.
Ejecutarlo en el código anterior se parece un poco más a lo que esperarías:

```ts
// local code
import * as aaa from "./aaa";
import * as bbb from "./bbb";
import * as ccc from "./ccc";

// integrada
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";

// algún código...
```

Nos gustaría extender nuestro agradecimiento a [Minh Quy](https://github.com/MQuy) que proporcionó [esta característica](https://github.com/microsoft/TypeScript/pull/48330).

## Compleción de fragmentos de métodos de objeto

*TypeScript* ahora proporciona compleciones de fragmentos para métodos literales de objetos.
Al completar miembros en un objeto, *TypeScript* proporcionará una entrada de compleción típica solo para el nombre de un método, junto con una entrada de compleción separada para la definición completa del método.

![Completar una firma de método completo de un objeto](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2022/05/object-method-completions-4-7-v2. gif)

Para obtener más detalles, [consulta la implementación en la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/48168).

## Ruptura por cambios

### Actualizaciones de `lib.d.ts`

Si bien *TypeScript* se esfuerza por evitar interrupciones importantes, incluso los pequeños cambios en las bibliotecas integradas pueden causar problemas.
No esperamos interrupciones importantes como resultado de las actualizaciones del `DOM` y `lib.d.ts`, pero puede haber algunas pequeñas.

### Comprobaciones de propagación más estrictas en *JSX*

Al escribir un `...spread` en *JSX*, *TypeScript* ahora impone controles más estrictos de que el tipo dado es en realidad un objeto.
Como resultado, los valores con los tipos `unknown` y `never` (y muy raramente, simplemente `null` y `undefined`) ya no se pueden distribuir en elementos *JSX*.

Entonces, para el siguiente ejemplo:

```tsx
import * as React from "react";

interface Props {
    stuff?: string;
}

function MyComponent(props: unknown) {
    return <div {...props} />;
}
```

Ahora puedes recibir un error como el siguiente:

```
Los tipos `Spread` solo se pueden crear a partir de tipos de objetos.
```

Esto hace que este comportamiento sea más coherente con los diferenciales en los objetos literales.

Para obtener más detalles, [ve el cambio en *GitHub*](https://github.com/microsoft/TypeScript/pull/48570).

### Comprobaciones más estrictas con expresiones de cadena de plantilla

Cuando se usa un valor de `symbol` en una cadena de plantilla, se activará un error de tiempo de ejecución en *JavaScript*.

```js
let str = `hello ${Symbol()}`;
// TypeError: No se puede convertir un valor de símbolo en una cadena
```

Como resultado, *TypeScript* también emitirá un error;
sin embargo, *TypeScript* ahora también verifica si un valor genérico que está restringido a un símbolo de alguna manera se usa en una cadena de plantilla.

```ts
function logKey<S extends string | symbol>(key: S): S {
    // Ahora da un error
    console.log(`${key} is the key`);
    return key;
}

function get<T, K extends keyof T>(obj: T, key: K) {
    // Ahora da un error
    console.log(`Grabbing property '${key}'.`);
    return obj[key];
}
```

*TypeScript* ahora emitirá el siguiente error:

```
La conversión implícita de un `symbol` a un `string` fallará en tiempo de ejecución. Considera envolver esta expresión en `String(...)`.
```

En algunos casos, puedes evitar esto envolviendo la expresión en una llamada a `String`, tal como sugiere el mensaje de error.

```ts
function logKey<S extends string | symbol>(key: S): S {
    // Ahora da un error
    console.log(`${String(key)} is the key`);
    return key;
}
```

En otros, este error es demasiado pedante, y es posible que ni siquiera te importe permitir las claves `symbol` cuando uses `keyof`.
En tales casos, puedes cambiar a `string & keyof ...`:

```ts
function get<T, K extends string & keyof T>(obj: T, key: K) {
    // Ahora da un error
    console.log(`Grabbing property '${key}'.`);
    return obj[key];
}
```

Para obtener más información, puedes [ver la implementación en la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/44578).

### El método `readFile` ya no es opcional en `LanguageServiceHost`

Si estás creando instancias de `LanguageService`, los `LanguageServiceHost` proporcionados deberán proveer un método `readFile`.
Este cambio fue necesario para admitir la nueva opción del compilador `moduleDetection`.

Puedes [leer más sobre el cambio aquí](https://github.com/microsoft/TypeScript/pull/47495).

### Las tuplas `readonly` tienen una propiedad `readonly` `length`

Una tupla `readonly` ahora tratará su propiedad `length` como `readonly`.
Esto casi nunca fue presenciable para las tuplas de longitud fija, pero fue un descuido que se pudo observar para las tuplas con tipos de elementos finales opcionales y resto.

Como resultado, el siguiente código ahora fallará:

```ts
function overwriteLength(tuple: readonly [string, string, string]) {
    // Ahora da un errores.
    tuple.length = 7;
}
```

Puedes [leer más sobre este cambio aquí](https://github.com/microsoft/TypeScript/pull/47717).
