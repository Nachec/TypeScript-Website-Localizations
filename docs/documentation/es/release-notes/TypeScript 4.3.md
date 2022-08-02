---
title: TypeScript 4.3
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-3.html
oneline: Notas de la versión de TypeScript 4.3
---

## Escritura de tipos independientes en las propiedades

En *JavaScript*, es bastante común que las *API*s conviertan los valores que se pasan antes de almacenarlos.
Esto también sucede a menudo con captadores y definidores.
Por ejemplo, imaginemos que tenemos una clase con un definidor que siempre convierte un valor en un `number` antes de guardarlo en un campo privado.

```js twoslash
class Thing {
  #size = 0;

  get size() {
    return this.#size;
  }
  set size(value) {
    let num = Number(value);

    // No permite NaN y esas cosas.
    if (!Number.isFinite(num)) {
      this.#size = 0;
      return;
    }

    this.#size = num;
  }
}
```

¿Cómo escribiríamos este código *JavaScript* en *TypeScript*?
Bueno, técnicamente no tenemos que hacer nada especial aquí ⏤ *TypeScript* puede ver esto sin tipos explícitos y puedes descubrir que "tamaño" (`size`) es un número.

El problema es que el `size` te permite asignar más que solo `number`.
Podríamos evitar esto diciendo que `size` tiene el tipo `unknown` o `any` como en este fragmento:

```ts
class Thing {
  // ...
  get size(): unknown {
    return this.#size;
  }
}
```

Pero eso no es bueno ⏤ `unknown` obliga a las personas que leen `size` a hacen una aserción de tipo, y `any` no detectará ningún error.
Si realmente queremos modelar *API*s que conviertan valores, las versiones anteriores de *TypeScript* nos obligaron a elegir entre ser precisos (lo que facilita la lectura de valores y la escritura más difícil) y ser permisivos (lo que facilita la escritura de valores y la lectura más difícil).

Es por eso que *TypeScript 4.3* te permite especificar tipos para leer y escribir en las propiedades.

```ts twoslash
class Thing {
  #size = 0;

  get size(): number {
    return this.#size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // No permite NaN y esas cosas.
    if (!Number.isFinite(num)) {
      this.#size = 0;
      return;
    }

    this.#size = num;
  }
}
```

En el ejemplo anterior, nuestro descriptor de acceso `set` toma un conjunto más amplio de tipos (`string`s, `boolean`os y `number`s), pero nuestro descriptor de acceso `get` siempre garantiza que será un `number`.
¡Ahora finalmente podemos asignar otros tipos a estas propiedades sin errores!

```ts twoslash
class Thing {
  #size = 0;

  get size(): number {
    return this.#size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // No permite NaN y esas cosas.
    if (!Number.isFinite(num)) {
      this.#size = 0;
      return;
    }

    this.#size = num;
  }
}
// ---cut---
let thing = new Thing();

// ¡La asignación de otros tipos a `thing.size` funciona!
thing.size = "hello";
thing.size = true;
thing.size = 42;

// ¡Leer `thing.size` siempre produce un número!
let mySize: number = thing.size;
```

Al considerar cómo dos propiedades con el mismo nombre se relacionan entre sí, *TypeScript* solo usará el tipo `reading` (por ejemplo, el tipo en el descriptor de acceso `get` de arriba).
Los tipos de "escritura" solo se consideran cuando se escribe directamente en una propiedad.

Ten en cuenta que este no es un patrón que se limita a las clases.
Puedes escribir captadores y definidores con diferentes tipos en objetos literales.

```ts
function makeThing(): Thing {
  let size = 0;
  return {
    get size(): number {
      return size;
    },
    set size(value: string | number | boolean) {
      let num = Number(value);

      // No permite NaN y esas cosas.
      if (!Number.isFinite(num)) {
        size = 0;
        return;
      }

      size = num;
    },
  };
}
```

De hecho, hemos agregado sintaxis a tipos interfaces/objetos para admitir diferentes tipos de lectura/escritura en las propiedades.

```ts
// ¡Ahora válido!
interface Thing {
    get size(): number
    set size(value: number | string | boolean);
}
```

Una limitación de usar diferentes tipos para leer y escribir propiedades es que el tipo para leer una propiedad tiene que ser asignable al tipo que estás escribiendo.
En otras palabras, el tipo de captador tiene que ser asignable al configurador.
Esto asegura cierto nivel de coherencia, de modo que una propiedad siempre se pueda asignar a sí misma.

Para obtener más información sobre esta función, consulta [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/42425).

## `override` y el indicador `--noImplicitOverride`

Al extender clases en *JavaScript*, el lenguaje hace que sea muy fácil (juego de palabras) redefinir métodos: pero, desafortunadamente, hay algunos errores con los que puedes encontrarte.

A uno grande le faltan cambios de nombre.
Por ejemplo, toma las siguientes clases:

```ts
class SomeComponent {
  show() {
    // ...
  }
  hide() {
    // ...
  }
}

class SpecializedComponent extends SomeComponent {
  show() {
    // ...
  }
  hide() {
    // ...
  }
}
```

`SpecializedComponent` subclases de `SomeComponent`, y redefine los métodos `show` y `hide`.
¿Qué sucede si alguien decide eliminar `show` y `hide` y reemplazarlos con un solo método?

```diff
 class SomeComponent {
-    show() {
-        // ...
-    }
-    hide() {
-        // ...
-    }
+    setVisible(value: boolean) {
+        // ...
+    }
 }
 class SpecializedComponent extends SomeComponent {
     show() {
         // ...
     }
     hide() {
         // ...
     }
 }
```

*¡Oh no!*
Nuestro `SpecializedComponent` no se actualizó.
Ahora solo estás agregando estos dos métodos inútiles `show` y `hide` que probablemente no serán llamados.

Parte del problema aquí es que un usuario no puede dejar en claro si tenía la intención de agregar un nuevo método o anular uno existente.
Es por eso que *TypeScript 4.3* agrega la palabra clave `override`.

```ts
class SpecializedComponent extends SomeComponent {
    override show() {
        // ...
    }
    override hide() {
        // ...
    }
}
```

Cuando un método está marcado con `override`, *TypeScript* siempre se asegurará de que exista un método con el mismo nombre en la clase base.

```ts twoslash
// @noImplicitOverride
// @errors: 4113
class SomeComponent {
    setVisible(value: boolean) {
        // ...
    }
}
class SpecializedComponent extends SomeComponent {
    override show() {

    }
}
```

Esta es una gran mejora, pero no ayuda si *olvidas* escribir `override` en un método ⏤ y ese es un gran error con el que se pueden encontrar los usuarios.

Por ejemplo, podrías "pisotear" accidentalmente un método que existe en una clase base sin darte cuenta.

```ts
class Base {
  someHelperMethod() {
    // ...
  }
}

class Derived extends Base {
  // Oops! No estábamos tratando de redefinir aquí
  // solo necesitábamos escribir un método auxiliar local.
  someHelperMethod() {
    // ...
  }
}
```

Es por eso que *TypeScript 4.3* *también* proporciona un nuevo indicador [`noImplicitOverride`](/tsconfig#noImplicitOverride).
Cuando esta opción está activada, se convierte en un error redefinir cualquier método de una superclase a menos que uses explícitamente una palabra clave `override`.
En ese último ejemplo, *TypeScript* produciría un error en [`noImplicitOverride`](/tsconfig#noImplicitOverride) y nos daría una pista de que probablemente necesitemos cambiar el nombre de nuestro método dentro de `Derived`.

Aquí, nos gustaría extender nuestro agradecimiento a nuestra comunidad por la implementación.
El trabajo para estos elementos se implementó en [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/39669) por [Wenlu Wang](https://github.com/Kingwl), aunque una versión anterior que implementa solo la palabra clave `override` de [Paul Cody Johnston](https://github.com/pcj) sirvió como base para la dirección y discusión.
Extendemos nuestro agradecimiento por dedicar tiempo a estas características.

## Mejoras en el tipo `template string`

En versiones recientes, *TypeScript* introdujo `new` para construcción de tipo: los tipos de cadenas de plantillas.
Estos son tipos que construyen nuevos tipos similares a cadenas concatenando...

```ts
type Color = "red" | "blue";
type Quantity = "one" | "two";

type SeussFish = `${Quantity | Color} fish`;
// igual que
//   type SeussFish = "one fish" | "two fish"
//                  | "red fish" | "blue fish";
```

...o hacer coincidir patrones de otros tipos similares a cadenas.

```ts
declare let s1: `${number}-${number}-${number}`;
declare let s2: `1-2-3`;

// ¡Trabaja!
s1 = s2;
```

El primer cambio que hicimos es cuando *TypeScript* inferirá un tipo de `template string`.
Cuando una cadena de plantilla es *tipada contextualmente* por un tipo de cadena literal (es decir, cuando *TypeScript* ve que estamos pasando una cadena de plantilla a algo que toma un tipo literal), intentará darle a esa expresión un tipo de plantilla.

```ts
function bar(s: string): `hello ${string}` {
    // Anteriormente era un error, ¡ahora funciona!
    return `hello ${s}`;
}
```

Esto también se activa cuando se infieren tipos, y el parámetro de tipo `extends string`

```ts
declare let s: string;
declare function f<T extends string>(x: T): T;

// Previamente: string
// Ahora      : `hello ${string}`
let x2 = f(`hello ${s}`);
```

El segundo cambio importante aquí es que *TypeScript* ahora puede relacionar mejor e *inferir entre* diferentes tipos de cadenas de plantillas.

Para ver esto, toma el siguiente código de ejemplo:

```ts
declare let s1: `${number}-${number}-${number}`;
declare let s2: `1-2-3`;
declare let s3: `${number}-2-3`;

s1 = s2;
s1 = s3;
```

Al comparar con un tipo de literal de cadena como en `s2`, *TypeScript* podría coincidir con el contenido de la cadena y descubrir que `s2` era compatible con `s1` en la primera asignación;
sin embargo, tan pronto como vio otra cadena de plantilla, simplemente se rindió.
Como resultado, asignaciones como `s3` a `s1` simplemente no funcionaron.

*TypeScript* ahora realmente hace el trabajo para demostrar si cada parte de una cadena de plantilla puede coincidir con éxito.
Ahora puedes mezclar y combinar cadenas de plantillas con diferentes sustituciones y *TypeScript* hará un buen trabajo para averiguar si son realmente compatibles.

```ts
declare let s1: `${number}-${number}-${number}`;
declare let s2: `1-2-3`;
declare let s3: `${number}-2-3`;
declare let s4: `1-${number}-3`;
declare let s5: `1-2-${number}`;
declare let s6: `${number}-2-${number}`;

// Ahora ¡*todo esto* trabaja!
s1 = s2;
s1 = s3;
s1 = s4;
s1 = s5;
s1 = s6;
```

Al hacer este trabajo, también estábamos seguros de agregar mejores capacidades de inferencia.
Puedes ver un ejemplo de esto en acción:

```ts
declare function foo<V extends string>(arg: `*${V}*`): V;

function test<T extends string>(s: string, n: number, b: boolean, t: T) {
    let x1 = foo("*hello*");            // "hello"
    let x2 = foo("**hello**");          // "*hello*"
    let x3 = foo(`*${s}*` as const);    // string
    let x4 = foo(`*${n}*` as const);    // `${number}`
    let x5 = foo(`*${b}*` as const);    // "true" | "false"
    let x6 = foo(`*${t}*` as const);    // `${T}`
    let x7 = foo(`**${s}**` as const);  // `*${string}*`
}
```

Para obtener más información, consulta [la solicitud de extracción original sobre el aprovechamiento de tipos contextuales](https://github.com/microsoft/TypeScript/pull/43376), junto con [la solicitud de extracción que mejoró la inferencia y la verificación entre tipos de plantilla](https://github.com/microsoft/TypeScript/pull/43361).

## Elementos `#private` de la clase *ECMAScript*

*TypeScript 4.3* expande qué elementos de una clase pueden recibir `#private` `#names` para que sean realmente privados en el entorno de ejecución.
Además de las propiedades, los métodos y los descriptores de acceso también pueden recibir nombres privados.

```ts
class Foo {
  #someMethod() {
    //...
  }

  get #someValue() {
    return 100;
  }

  publicMethod() {
    // Estos trabaja.
    // Podemos acceder a miembros con nombre privado dentro de esta clase.
    this.#someMethod();
    return this.#someValue;
  }
}

new Foo().#someMethod();
//        ~~~~~~~~~~~
// ¡error!
// La propiedad '#someMethod' no es accesible
// fuera de la clase 'Foo' porque tiene un identificador privado.

new Foo().#someValue;
//        ~~~~~~~~~~
// ¡error!
// La propiedad '#someValue' no es accesible
// fuera de la clase 'Foo' porque tiene un identificador privado.
```

Aún más ampliamente, los miembros estáticos ahora también pueden tener nombres privados.

```ts
class Foo {
  static #someMethod() {
    // ...
  }
}

Foo.#someMethod();
//  ~~~~~~~~~~~
// ¡error!
// La propiedad '#someMethod' no es accesible
// fuera de la clase 'Foo' porque tiene un identificador privado.
```

Esta función fue creada [en una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/42458) de nuestros amigos de Bloomberg ⏤ escrito por [Titian Cernicova-Dragomir](https://github.com/dragomirtitian) y [Kubilay Kahveci](https://github.com/mkubilayk), con el apoyo y la experiencia de [Joey Watts](https://github.com/joeywatts), [Rob Palmer](https://github.com/robpalme) y [Tim McClure](https://github.com/tim-mc).
¡Nos gustaría extender nuestro agradecimiento a todos ellos!

## `ConstructorParameters` funciona en clases abstractas

En *TypeScript 4.3*, el ayudante de tipo `ConstructorParameters` ahora funciona en clases `abstract`as.

```ts
abstract class C {
  constructor(a: string, b: number) {
    // ...
  }
}

// Tiene el tipo '[a: string, b: number]'.
type CParams = ConstructorParameters<typeof C>;
```

Esto es gracias al trabajo realizado en *TypeScript 4.2*, donde las firmas de construcción se pueden marcar como abstractas:

```ts
type MyConstructorOf<T> = {
    abstract new(...args: any[]): T;
}

// o usando la sintaxis abreviada:

type MyConstructorOf<T> = abstract new (...args: any[]) => T;
```

Puedes [ver el cambio con más detalle en *GitHub*](https://github.com/microsoft/TypeScript/pull/43380).

## Delimitación contextual para genéricos

*TypeScript 4.3* ahora incluye una lógica de reducción de tipo ligeramente más inteligente en valores genéricos.
Esto permite que *TypeScript* acepte más patrones y, a veces, incluso detecte errores.

Para motivarnos, digamos que estamos tratando de escribir una función llamada `makeUnique`.
Tomará un "Conjunto" (`Set`) o un `Array` de elementos, y si se le das un `Array`, ordenará ese arreglo para eliminar los duplicados de acuerdo con alguna función de comparación.
Después de todo eso, devolverá la colección original.

```ts
function makeUnique<T>(
  collection: Set<T> | T[],
  comparer: (x: T, y: T) => number
): Set<T> | T[] {
  // Rescate anticipado si tenemos un set.
  // Asumimos que los elementos ya son únicos.
  if (collection instanceof Set) {
    return collection;
  }

  // Ordena el arreglo, luego elimina los duplicados consecutivos.
  collection.sort(comparer);
  for (let i = 0; i < collection.length; i++) {
    let j = i;
    while (
      j < collection.length &&
      comparer(collection[i], collection[j + 1]) === 0
    ) {
      j++;
    }
    collection.splice(i + 1, j - i);
  }
  return collection;
}
```

Dejemos a un lado las preguntas sobre la implementación de estas funciones y supongamos que surgió de los requisitos de una aplicación más amplia.
Algo que puedes notar es que la firma no captura el tipo original de `collection`.
Podemos hacerlo agregando un parámetro de tipo llamado `C` en lugar de donde hemos escrito `Set<T> | T[]`.

```diff
- function makeUnique<T>(collection: Set<T> | T[], comparer: (x: T, y: T) => number): Set<T> | T[]
+ function makeUnique<T, C extends Set<T> | T[]>(collection: C, comparer: (x: T, y: T) => number): C
```

En *TypeScript 4.2* y versiones anteriores, terminarías con un montón de errores tan pronto como lo intentaras.

```ts
function makeUnique<T, C extends Set<T> | T[]>(
  collection: C,
  comparer: (x: T, y: T) => number
): C {
  // Rescate anticipado si tenemos un set.
  // Asumimos que los elementos ya son únicos.
  if (collection instanceof Set) {
    return collection;
  }

  // Ordena el arreglo, luego elimina los duplicados consecutivos.
  collection.sort(comparer);
  //         ~~~~
  // error: Property 'sort' does not exist on type 'C'.
  for (let i = 0; i < collection.length; i++) {
    //                             ~~~~~~
    // error: La propiedad 'length' no existe en el tipo 'C'.
    let j = i;
    while (
      j < collection.length &&
      comparer(collection[i], collection[j + 1]) === 0
    ) {
      //                    ~~~~~~
      // error: La propiedad 'length' no existe en el tipo 'C'.
      //                                       ~~~~~~~~~~~~~  ~~~~~~~~~~~~~~~~~
      // error: El elemento tiene implícitamente un tipo 'any' porque la expresión del tipo 'number'
      //        no se puede utilizar para indexar el tipo 'Set<T> | T[]'.
      j++;
    }
    collection.splice(i + 1, j - i);
    //         ~~~~~~
    // error: La propiedad 'splice' no existe en el tipo 'C'.
  }
  return collection;
}
```

¡Ew, errores!
¿Por qué *TypeScript* es tan malo con nosotros?

El problema es que cuando realizamos nuestra comprobación de `collection instanceof Set`, esperamos que actúe como una protección de tipo que reduce el tipo de `Set<T> | T[]` a `Set<T>` y `T[]` dependiendo de la rama en la que estemos;
sin embargo, no estamos tratando con un `Set<T> | T[]`, estamos tratando de reducir el valor genérico `collection`, cuyo tipo es `C`.

Es una distinción muy sutil, pero marca la diferencia.
*TypeScript* no puede simplemente tomar la restricción de `C` (que es `Set<T> | T[]`) y limitar eso.
Si *TypeScript* intentó reducir desde `Set<T> | T[]`, olvidaría que `collection` también es una `C` en cada rama porque no hay una manera fácil de preservar esa información.
Si hipotéticamente *TypeScript* intentara ese enfoque, rompería el ejemplo anterior de una manera diferente.
En las posiciones de retorno, donde la función espera valores con el tipo `C`, obtendríamos un `Set<T>` y una `T[]` en cada rama, que *TypeScript* rechazaría.

```ts
function makeUnique<T>(
  collection: Set<T> | T[],
  comparer: (x: T, y: T) => number
): Set<T> | T[] {
  // Rescate anticipado si tenemos un set.
  // Asumimos que los elementos ya son únicos.
  if (collection instanceof Set) {
    return collection;
    //     ~~~~~~~~~~
    // error: Type 'Set<T>' is not assignable to type 'C'.
    //          'Set<T>' se puede asignar a la restricción de tipo 'C', pero
    //          Se podría crear una instancia de 'C' con un subtipo de restricción diferente 'Set<T> | T[]'.
  }

  // ...

  return collection;
  //     ~~~~~~~~~~
  // error: El tipo 'T[]' no se puede asignar al tipo 'C'.
  //          'T[]' se puede asignar a la restricción de tipo 'C', pero
  //          Se podría crear una instancia de 'C' con un subtipo de restricción diferente 'Set<T> | T[]'.
}
```

Entonces, ¿cómo cambia las cosas *TypeScript 4.3*?
Bueno, básicamente en algunos lugares clave al escribir código, todo lo que realmente le importa al sistema de tipos es la restricción de un tipo.
Por ejemplo, cuando escribimos `collection.length`, *TypeScript* no se preocupa por el hecho de que `collection` tenga el tipo `C`, solo se preocupa por las propiedades disponibles, que están determinadas por la restricción `T[] | Set<T>`.

En casos como este, *TypeScript* tomará el tipo reducido de restricción porque eso te dará los datos que te interesan;
sin embargo, en cualquier otro caso, intentaremos limitar el tipo genérico original (ya menudo terminamos con el tipo genérico original).

En otras palabras, según cómo uses un valor genérico, *TypeScript* lo reducirá de manera un poco diferente.
El resultado final es que todo el ejemplo anterior se compila sin errores de comprobación de tipo.

Para obtener más detalles, puedes [ver la solicitud de extracción original en *GitHub*](https://github.com/microsoft/TypeScript/pull/43183).

## Comprobación de promesas siempre verdaderas

En [`strictNullChecks`](/tsconfig#strictNullChecks), comprobar si una `Promise` es "veraz" en un condicional desencadenará un error.

```ts
async function foo(): Promise<boolean> {
  return false;
}

async function bar(): Promise<string>
  if (foo()) {
    //  ~~~~~
    // ¡Error!
    // Esta condición siempre devolverá true ya que
    // esta 'Promise<boolean>' parece estar siempre definida.
    // ¿Olvidaste usar 'await'?
    return "true";
  }
  return "false";
}
```

[Este cambio](https://github.com/microsoft/TypeScript/pull/39175) fue contribuido por [Jack Works](https://github.com/Jack-Works), ¡y les extendemos nuestro agradecimiento!

## Índice de firmas`static`

Los índices de firmas nos permiten establecer más propiedades en un valor de las que un tipo declara explícitamente.

```ts
class Foo {
  hila = "hola";
  mundo = 1234;

  // Este es un índice de firma.
  [nombrePropiedad: string]: string | number | undefined;
}

let instance = new Foo();

// Asignación válida
instance["whatever"] = 42;

// Tiene el tipo 'string | number | undefined'.
let x = instance["something"];
```

Hasta ahora, un índice de firma solo podía declararse en el lado de la instancia de una clase.
Gracias a [una solicitud de extracción](https://github.com/microsoft/TypeScript/pull/37797) de [Wenlu Wang](https://github.com/microsoft/TypeScript/pull/37797), los índices de firmas ahora se pueden declarar como `static`.

```ts
class Foo {
  static hello = "hello";
  static world = 1234;

  static [propName: string]: string | number | undefined;
}

// Válido.
Foo["whatever"] = 42;

// Tiene el tipo 'string | number | undefined'
let x = Foo["something"];
```

Se aplican los mismos tipos de reglas para los índices de firmas en el lado estático de una clase que para el lado de la instancia: es decir, que todas las demás propiedades estáticas deben ser compatibles con el índice de firma.

```ts
class Foo {
  static prop = true;
  //     ~~~~
  // ¡Error! Propiedad 'prop' de tipo 'boolean'
  // no se puede asignar al tipo de índice string
  // 'string | number | undefined'.

  static [propName: string]: string | number | undefined;
}
```

## Mejoras en el tamaño de `.tsbuildinfo`

En *TypeScript 4.3*, los archivos `.tsbuildinfo` que se generan como parte de compilaciones [`incremental`](/tsconfig#incremental) deberían ser significativamente más pequeños.
Esto es gracias a varias optimizaciones en el formato interno, creando tablas con identificadores numéricos para usar en todo el archivo en lugar de repetir rutas completas e información similar.
Este trabajo fue encabezado por [Tobias Koppers](https://github.com/sokra) en [su solicitud de extracción](https://github.com/microsoft/TypeScript/pull/43079), y sirvió de inspiración para [la solicitud de extracción resultante](https://github.com/microsoft/TypeScript/pull/43155) y [optimizaciones adicionales](https://github.com/microsoft/TypeScript/pull/43695).

Hemos visto reducciones significativas de los tamaños de archivo `.tsbuildinfo`, incluyendo

- 1MB a 411 KB
- 14.9MB a 1MB
- 1345MB a 467MB

No hace falta decir que este tipo de ahorro de tamaño también se traduce en tiempos de construcción ligeramente más rápidos.

## Cálculos más relajados en compilaciones `--incremental` y `--watch`

Uno de los problemas con los modos [`incremental`](/tsconfig#incremental) y `--watch` es que si bien hacen que las compilaciones posteriores sean más rápidas, la compilación inicial puede ser un poco más lenta ⏤ en algunos casos, significativamente más lento.
Esto se debe a que estos modos tienen que realizar un montón de contabilidad, computar información sobre el proyecto actual y, a veces, guardar esos datos en un archivo `.tsbuildinfo` para compilaciones posteriores.

Es por eso que, además de las mejoras de tamaño de `.tsbuildinfo`, *TypeScript 4.3* también incluye algunos cambios en los modos [`incremental`](/tsconfig#incremental) y `--watch` que hacen la primera compilación de un proyecto con estas banderas tal como ¡Rápido como una construcción ordinaria!
Para hacer esto, gran parte de la información que normalmente se calcularía por adelantado se realiza a pedido para compilaciones posteriores.
Si bien esto puede agregar algo de sobrecarga a una compilación posterior, las funciones de *TypeScript* [`incremental`](/tsconfig#incremental) y `--watch` seguirán operando normalmente en un conjunto de archivos mucho más pequeño, y cualquier información necesaria se guardará posteriormente.
En cierto sentido, las compilaciones [`incremental`](/tsconfig#incremental) y `--watch` se "calentarán" y serán más rápidas en la compilación de archivos una vez que los hayas actualizado varias veces.

En un repositorio con 3000 archivos, **¡esto redujo los tiempos de compilación inicial a casi un tercio**!

[Este trabajo fue iniciado](https://github.com/microsoft/TypeScript/pull/42960) por [Tobias Koppers](https://github.com/sokra), cuyo trabajo siguió en [el cambio final resultante](https://github.com/microsoft/TypeScript/pull/43314) para esta funcionalidad.
¡Nos gustaría extender un gran agradecimiento a Tobias por ayudarnos a encontrar estas oportunidades de mejora!

## Completado de declaraciones de importación

Uno de los mayores problemas con los que se encuentran los usuarios es con las declaraciones de importación y exportación en *JavaScript* es el orden ⏤ específicamente que las importaciones se escriben como

```ts
import { func } from "./module.js";
```

en lugar de

```ts
from "./module.js" import { func };
```

Esto causa algunos problemas al escribir una declaración de importación completa desde cero porque la función de autocompletar no pudo funcionar correctamente.
Por ejemplo, si comienzas a escribir algo como `import {`, *TypeScript* no tiene idea de qué módulo estás planeando importar, por lo que no podría proporcionar ningún completado limitado.

Para aliviar esto, ¡hemos aprovechado el poder de las importaciones automáticas!
Las importaciones automáticas ya abordan el problema de no poder reducir los completados de un módulo específico ⏤ su objetivo es proporcionar todas las exportaciones posibles e insertar automáticamente una declaración de importación en la parte superior de tu archivo.

Entonces, cuando empieces a escribir una declaración `import` que no tiene una ruta, te proporcionaremos una lista de posibles importaciones.
Cuando confirmes un completado, finalizaremos la declaración de importación completa, incluida la ruta que ibas a escribir.

![Completado de declaración de importación](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/05/auto-import-statement-4-3.gif)

Este trabajo requiere editores que admitan específicamente la característica.
Podrás probar esto utilizando las últimas [versiones Insiders de *Visual Studio Code*](https://code.visualstudio.com/insiders/).

Para obtener más información, consulta [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/43149).

## Soporte del editor para etiquetas `@link`

*TypeScript* ahora puede comprender las etiquetas `@link` e intentará resolver las declaraciones a las que se vinculan.
Lo que esto significa es que podrás pasar el cursor sobre los nombres dentro de las etiquetas `@link` y obtener información rápida, o usar comandos como ir a la definición o buscar todas las referencias.

Por ejemplo, podrás ir a la definición en `bar` en `@link bar` en el siguiente ejemplo y un editor compatible con *TypeScript* saltará a la declaración de la función `bar`.

```ts
/**
 * Se llamará entre 70 y 80 días después de {@link plantCarrot}.
 */
function harvestCarrot(carrot: Carrot) {}

/**
 * Llama a principios de la primavera para obtener mejores resultados. Agregada en v2.1.0.
 * @param seed ¡Asegúrate de que sea una semilla de zanahoria!
 */
function plantCarrot(seed: Seed) {
  // TODO: some gardening
}
```

![Saltar a la definición y solicitar información rápida en una etiqueta `@link` para](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/05/link-tag-4-3.gif)

Para obtener más información, consulta [la solicitud de extracción en *GitHub*](https://github.com/microsoft/TypeScript/pull/41877).

## Ir a la definición en rutas de archivo que no son de *JavaScript*

Muchos cargadores permiten a los usuarios incluir activos en sus aplicaciones mediante importaciones *JavaScript*.
Por lo general, se escribirán como algo como `import "./styles.css"` o similar.

Hasta ahora, la funcionalidad del editor de *TypeScript* ni siquiera intentaba leer este archivo, por lo que la definición de acceso generalmente fallaba.
En el mejor de los casos, ir a la definición saltaría a una declaración como `declare module "*.css"` si pudiera encontrar algo en ese sentido.

El servicio de lenguaje de *TypeScript* ahora intenta saltar al archivo correcto cuando realiza una definición de acceso en rutas de archivo relativas, ¡incluso si no son archivos *JavaScript* o *TypeScript*!
Pruébalo con importaciones a *CSS*, *SVG*, *PNG*, archivos de tipos de letra, archivos *Vue* y más.

Para obtener más información, puedes consultar [la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/42539).

## Ruptura por cambios

### Cambios `lib.d.ts`

Como con todas las versiones de *TypeScript*, las declaraciones para `lib.d.ts` (especialmente las declaraciones generadas para contextos web), han cambiado.
En esta versión, aprovechamos [`Mozilla's browser-compat-data`](https://github.com/mdn/browser-compat-data) para eliminar las *API*s que ningún navegador implementa.
Si bien es diferente de lo que estás usando, *API*s como `Account`, `AssertionOptions`, `RTCStatsEventInit`, `MSGestureEvent`, `DeviceLightEvent`, `MSPointerEvent`, `ServiceWorkerMessageEvent` y `WebAuthentication` se han eliminado de `lib.d.ts`.
Esto se discute [con cierto detalle aquí](https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/991).

https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/991

### `useDefineForClassFields` ahora de manera predeterminada es `true` en `esnext` y eventualmente en `es2022`

En 2021, la función de campos de clase se agregó a la especificación de *JavaScript* con un comportamiento que difería de cómo la había implementado *TypeScript*. En preparación para esto, en *TypeScript 3.7*, se agregó una marca ([`useDefineForClassFields`](/tsconfig#useDefineForClassFields)) para migrar a *JavaScript* emitido para que coincida con el comportamiento estándar de *JavaScript*.

Ahora que la función está en *JavaScript*, cambiaremos el valor predeterminado a `true` para *ES2022* y superior, incluido *ESNext*.

### Errores en la comprobación de promesas siempre verdaderas

En [`strictNullChecks`](/tsconfig#strictNullChecks), el uso de una `Promise` que siempre parece estar definida dentro de una verificación de condición ahora se considera un error.

```ts
declare var p: Promise<number>;

if (p) {
  //  ~
  // ¡Error!
  // Esta condición siempre devolverá true ya que
  // esta 'Promise<number>' parece estar siempre definida.
  //
  // ¿Olvidaste usar 'await'?
}
```

Para obtener más detalles, [consulta el cambio original](https://github.com/microsoft/TypeScript/pull/39175).

### Las enumeraciones de unión no se pueden comparar con números arbitrarios

Ciertas `enum`s se consideran *union `enum`s* cuando sus miembros se completan automáticamente o se escriben trivialmente.
En esos casos, una enumeración puede recordar cada valor que potencialmente representa.

En *TypeScript 4.3*, si un valor con un tipo unión `enum` se compara con un literal numérico al que nunca podría ser igual, entonces el comprobador de tipo emitirá un error.

```ts
enum E {
  A = 0,
  B = 1,
}

function doSomething(x: E) {
  // ¡Error! Esta condición siempre devolverá 'false' ya que los tipos 'E' y '-1' no se superponen.
  if (x === -1) {
    // ...
  }
}
```

Como solución alternativa, puedes volver a escribir una anotación para incluir el tipo de literal apropiado.

```ts
enum E {
  A = 0,
  B = 1,
}

// Incluye -1 en el tipo, si estamos realmente seguros de que -1 puede pasar.
function doSomething(x: E | -1) {
  if (x === -1) {
    // ...
  }
}
```

También puedes usar una aserción de tipo en el valor.

```ts
enum E {
  A = 0,
  B = 1,
}

function doSomething(x: E) {
  // Usa una aserción de tipo en 'x' porque sabemos que en realidad no solo estamos tratando con valores de 'E'.
  if ((x as number) === -1) {
    // ...
  }
}
```

Alternativamente, puedes volver a declarar tu enumeración para que tenga un iniciador no trivial de modo que cualquier número sea asignable y comparable a esa enumeración. Esto puede ser útil si la intención es que la enumeración especifique algunos valores conocidos.

```ts
enum E {
  // el + inicial en 0 opta que TypeScript no infiera una enumeración de unión.
  A = +0,
  B = 1,
}
```

Para obtener más detalles, [consulta el cambio original](https://github.com/microsoft/TypeScript/pull/42472)
