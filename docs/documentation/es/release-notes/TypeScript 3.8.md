---
title: TypeScript 3.8
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-8.html
oneline: Notas de la versión de TypeScript 3.8
---

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

```jsonc tsconfig
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

`watchOptions` contiene 4 nuevas opciones que se pueden configurar:

- [`watchFile`](/tsconfig#watchFile) ⏤ la estrategia de cómo se ven los archivos individuales. Esto se puede configurar a

  - `fixedPollingInterval` ⏤ Comprueba cada archivo para ver si hay cambios varias veces por segundo en un intervalo fijo.
  - `priorityPollingInterval` ⏤ Verifica cada archivo en busca de cambios varias veces por segundo, pero usa la heurística para revisar ciertos tipos de archivos con menos frecuencia que otros.
  - `dynamicPriorityPolling` ⏤ Utiliza una cola dinámica en la que los archivos modificados con menos frecuencia se verifican con menos frecuencia.
  - `useFsEvents` (la predeterminada) ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para realizar cambios en los archivos.
  - `useFsEventsOnParentDirectory` ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para escuchar los cambios en los directorios que contienen un archivo. Esto puede usar menos observadores de archivos, pero puede ser menos preciso.

- [`watchDirectory`](/tsconfig#watchDirectory) ⏤ la estrategia de cómo se observan árboles de directorios completos en sistemas que carecen de la funcionalidad de observación recursiva de archivos. Esto se puede configurar en:

  - `fixedPollingInterval` ⏤ Compruebe cada directorio para ver si hay cambios varias veces por segundo en un intervalo fijo.
  - `dynamicPriorityPolling` ⏤ Utiliza una cola dinámica en la que los directorios modificados con menos frecuencia se verifican en intervalos más largos.
  - `useFsEvents` (la predeterminada) ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para cambios de directorio.

- [`fallbackPolling`](/tsconfig#fallbackPolling) ⏤ cuando se usan eventos del sistema de archivos, esta opción especifica la estrategia de sondeo que se usa cuando el sistema se queda sin observadores de archivos nativos y/o no admite observadores de archivos nativos. Esto se puede configurar a
  - `fixedPollingInterval` ⏤ (*Ve más arriba*).
  - `priorityPollingInterval` ⏤ (*Ve más arriba*).
  - `dynamicPriorityPolling` ⏤ (*Ve más arriba*).
  - `synchronousWatchDirectory` ⏤ Desactiva la vigilancia diferida en directorios. La vigilancia diferida es útil cuando pueden ocurrir muchos cambios de archivo a la vez (por ejemplo, un cambio en `node_modules` al ejecutar `npm install`), pero es posible que desees deshabilitarla con esta marca para algunas configuraciones menos comunes.

Para obtener más información sobre estos cambios, [dirígete a *GitHub* para ver la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/35615) para leer más.

## Comprobación incremental "rápida y flexible"

*TypeScript 3.8* introduce una nueva opción de compilador llamada [`AssumChangesOnlyAffectDirectDependencies`](/tsconfig#AssumChangesOnlyAffectDirectDependencies).
Cuando esta opción está habilitada, *TypeScript* evitará volver a verificar/reconstruir todos los archivos posiblemente afectados realmente, y solo volverá a verificar/reconstruir los archivos que hayan cambiado, así como los archivos que los importen directamente.

Por ejemplo, considera un archivo `fileD.ts` que importa `fileC.ts` que importa `fileB.ts` que importa `fileA.ts` de la siguiente manera:

```
fileA.ts <- fileB.ts <- fileC.ts <- fileD.ts
```

En el modo `--watch`, un cambio en `fileA.ts` normalmente significaría que *TypeScript* necesitaría al menos volver a verificar `fileB.ts`, `fileC.ts` y `fileD.ts`.
Bajo [`asumeChangesOnlyAffectDirectDependencies`](/tsconfig#asumeChangesOnlyAffectDirectDependencies), un cambio en `fileA.ts` significa que solo se deben volver a verificar `fileA.ts` y `fileB.ts`.

En un código base como *Visual Studio Code*, esto redujo los tiempos de reconstrucción para cambios en ciertos archivos de aproximadamente 14 segundos a aproximadamente 1 segundo.
Si bien no recomendamos necesariamente esta opción para todos los códigos base, es posible que te interese si tienes un código base extremadamente grande y estás dispuesto a diferir los errores completos del proyecto hasta más adelante (por ejemplo, una compilación dedicada a través de un `tsconfig.fullbuild.json` o en *CI*).

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/35711).
