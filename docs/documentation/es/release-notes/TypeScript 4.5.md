---
title: TypeScript 4.5
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-5.html
oneline: Notas de la versión de TypeScript 4.5
---

## ¿Qué hay de nuevo desde la Beta y RC?

Desde nuestra [publicación de lanzamiento beta](https://devblogs.microsoft.com/typescript/anounce-typescript-4-5-beta) y [publicación de lanzamiento RC](https://devblogs.microsoft.com/typescript/anounce-typescript-4-5-rc), 4.5 ha sufrido algunos cambios.

El mayor cambio que hemos realizado desde la versión beta es que [la compatibilidad del módulo ECMAScript para Node.js 12 se pospuso](#esm-nodejs) a una versión futura, y ahora solo está disponible como indicador experimental en versiones nocturnas.
Esta no fue una decisión fácil, pero nuestro equipo tenía una combinación de [inquietudes sobre la preparación del ecosistema y orientación general sobre cómo y cuándo usar la función](https://github.com/microsoft/TypeScript/issues/46452).
Pensamos que sería mejor suavizar la experiencia del usuario en lugar de lanzar algo que, en última instancia, sería demasiado frustrante para la mayoría de las personas.
Sin embargo, mientras tanto, aún puedes usar el nuevo soporte para `--module nodenext` y `--moduleResolution nodenext` como características experimentales en [construcciones nocturnas de TypeScript](https://www.typescriptlang.org/docs/handbook/nightly-builds.html).
Si intentas usar esta configuración en *TypeScript 4.5*, recibirás un mensaje de error que te indicará que uses una compilación nocturna en su lugar.

Desde nuestra publicación *RC*, agregamos notas sobre [nuevas características de JSDoc](#jsdoc-const-and-type-arg-defaults).
Si bien estas características en realidad se incluyeron en el *RC*, no se incluyeron en nuestras notas de la versión anterior.

Desde el lado de la edición de idiomas, hemos introducido más fragmentos completados desde *TypeScript 4.5 beta* — [específicamente, para la implementación y redefinición de métodos](#subclass-method-snippets).

También [abordamos una regresión de rendimiento en el modo `--build`](https://github.com/microsoft/TypeScript/pull/46209) debido a llamadas `realpath` excesivas para archivos `package.json`.
Este cambio se realizó para *TypeScript 4.5*, pero también se adaptó a *TypeScript 4.4.4*.
Si esta regresión te impidió probar *TypeScript 4.4*, deberías ver una velocidad comparable o mejor en el modo `--build` en comparación con las versiones anteriores.

### Compatible con `lib` de `node_modules`

Para garantizar que la compatibilidad con *TypeScript* y *JavaScript* funcione correctamente desde el primer momento, *TypeScript* incluye una serie de archivos de declaración (archivos `.d.ts`).
Estos archivos de declaración representan las *API*s disponibles en el lenguaje *JavaScript* y las *APIs DOM* estándar del navegador.
Si bien existen algunos valores predeterminados razonables basados ​​en tu [`target`](/tsconfig#target), puedes elegir qué archivos de declaración usa tu programa configurando [`lib`](https://www.typescriptlang.org/tsconfig#lib) en el archivo `tsconfig.json`.

Sin embargo, hay dos desventajas ocasionales de incluir estos archivos de declaración con *TypeScript*:

- Cuando actualizas *TypeScript*, también te ves obligado a manejar los cambios en los archivos de declaración integrados de *TypeScript*, y esto puede ser un desafío cuando las *APIs DOM* cambian con tanta frecuencia como lo hacen.
- Es difícil personalizar estos archivos para que coincidan tus necesidades con las necesidades de las dependencias de tu proyecto (por ejemplo, si tus dependencias declaran que usan las *APIs DOM*, es posible que también se vea obligado a usar las *APIs DOM*).

*TypeScript 4.5* introduce una forma de redefinir una `lib` incorporada específica de una manera similar a cómo funciona el soporte de `@types/`.
Al decidir qué archivos `lib` debes incluir *TypeScript*, primero buscará un paquete `@typescript/lib-*` con alcance en `node_modules`.
Por ejemplo, al incluir `dom` como una opción en `lib`, *TypeScript* usará los tipos en `node_modules/@typescript/lib-dom` si están disponibles.

A continuación, puedes usar tu administrador de paquetes para instalar un paquete específico que se hará cargo de una determinada `lib`
Por ejemplo, hoy día *TypeScript* publica versiones de las *APIs DOM* en `@types/web`.
Si deseas bloquear tu proyecto en una versión específica de las *APIs DOM*, puedes agregar esto a tu `package.json`:

```json
{
  "dependencies": {
    "@typescript/lib-dom": "npm:@types/web"
  }
}
```

Luego, desde 4.5 en adelante, puedes actualizar *TypeScript* y el archivo de bloqueo de tu administrador de dependencias se asegurará de que uses exactamente la misma versión de los tipos del *DOM*.
Eso significa que puedes actualizar tus tipos en tus propios términos.

Nos gustaría agradecer a [saschanaz](https://github.com/saschanaz) que ha sido de gran ayuda y paciencia mientras desarrollamos y experimentamos con esta función.

Para obtener más información, puedes [ver la implementación de este cambio](https://github.com/microsoft/TypeScript/pull/45771).

## Mejoras de tipo `Awaited` y `Promise`

*TypeScript 4.5* introduce un nuevo tipo utilitario llamado tipo `Awaited`.
Este tipo está destinado a modelar operaciones como `await` en funciones `async`, o el método `.then()` en `Promise`s ⏤ específicamente, la forma en que desenvuelven de forma recursiva las `Promise`s.

```ts
// A = string
type A = Awaited<Promise<string>>;

// B = number
type B = Awaited<Promise<Promise<number>>>;

// C = boolean | number
type C = Awaited<boolean | Promise<number>>;
```

El tipo `Awaited` puede ser útil para modelar las *API*s existentes, incluidas las incorporaciones de *JavaScript* como `Promise.all`, `Promise.race`, etc.
De hecho, algunos de los problemas relacionados con la inferencia con `Promise.all` sirvieron como motivaciones para `Awaited`.
Aquí hay un ejemplo que falla en *TypeScript 4.4* y versiones anteriores.

```ts
declare function MaybePromise<T>(value: T): T | Promise<T> | PromiseLike<T>;

async function doSomething(): Promise<[number, number]> {
  const result = await Promise.all([MaybePromise(100), MaybePromise(200)]);

  // ¡Error!
  //
  //    [number | Promise<100>, number | Promise<200>]
  //
  // no se puede asignar a type
  //
  //    [number, number]
  return result;
}
```

Ahora `Promise.all` combina ciertas características con `Awaited` para dar mejores resultados de inferencia, y el ejemplo anterior funciona.

Para obtener más información, [puedes leer sobre este cambio en *GitHub*](https://github.com/microsoft/TypeScript/pull/45350).

### Tipos cadenas de plantilla como discriminantes

*TypeScript 4.5* ahora puedes limitar los valores que tienen tipos de cadena de plantilla y también reconoce los tipos de cadena de plantilla como discriminantes.

Como ejemplo, lo siguiente solía fallar, pero ahora se verifica con éxito el tipo en *TypeScript 4.5*.

```ts twoslash
export interface Success {
    type: `${string}Success`;
    body: string;
}

export interface Error {
    type: `${string}Error`;
    message: string
}

export function handler(r: Success | Error) {
    if (r.type === "HttpSuccess") {
        const token = r.body;
        //            ^?
    }
}
```

Para obtener más información, [consulta el cambio que habilita esta característica](https://github.com/microsoft/TypeScript/pull/46137).

### `module es2022`

Gracias a [Kagami S. Rosylight](https://github.com/saschanaz), *TypeScript* ahora admite una nueva configuración de `module`: `es2022`.
La característica principal en [`module es2022`](/tsconfig#module) es `await` de nivel superior, lo cual significa que puedes usar `await` fuera de las funciones `async`.
Esto ya estaba admitido en `--module esnext` (y ahora [`--module nodenext`](/tsconfig#target)), pero `es2022` es el primer objetivo estable para esta característica.

Puedes [leer más sobre este cambio aquí](https://github.com/microsoft/TypeScript/pull/44656).

### Eliminación de la cola recursiva en tipos condicionales

*TypeScript* a menudo necesita fallar con gracia cuando detecta una recursividad posiblemente infinita o cualquier expansión de tipo que pueda llevar mucho tiempo y afectar la experiencia de tu editor.
Como resultado, *TypeScript* tiene heurísticas para asegurarse de que no se salga de los rieles al intentar separar un tipo infinitamente profundo o al trabajar con tipos que generan muchos resultados intermedios.

```ts
type InfiniteBox<T> = { item: InfiniteBox<T> };

type Unpack<T> = T extends { item: infer U } ? Unpack<U> : T;

// error: La instanciación de tipos es excesivamente profunda y posiblemente infinita.
type Test = Unpack<InfiniteBox<number>>;
```

El ejemplo anterior ⏤intencionalmente⏤ es simple e inútil, pero hay muchos tipos que son realmente útiles y desafortunadamente activan nuestras heurísticas.
Como ejemplo, el siguiente tipo `TrimLeft` elimina los espacios del comienzo de un tipo similar a una cadena.
Si se le da un tipo `string` que tiene un espacio al principio, inmediatamente alimenta el resto de la cadena de nuevo a `TrimLeft`.

```ts
type TrimLeft<T extends string> =
    T extends ` ${infer Rest}` ? TrimLeft<Rest> : T;

// Test = "hello" | "world"
type Test = TrimLeft<"   hello" | " world">;
```

Este tipo puede ser útil, pero si una cadena tiene 50 espacios iniciales, obtendrás un error.

```ts
type TrimLeft<T extends string> =
    T extends ` ${infer Rest}` ? TrimLeft<Rest> : T;

// error: La instanciación de tipos es excesivamente profunda y posiblemente infinita.
type Test = TrimLeft<"                                                oops">;
```

Eso es lamentable, porque esta clase de tipos tienden a ser extremadamente útiles en las operaciones de modelado en cadenas. por ejemplo, analizadores para enrutadores de *URL*.
Para empeorar las cosas, un tipo más útil normalmente crea más instancias de tipo y, a su vez, tiene aún más limitaciones en la longitud de entrada.

Pero hay una gracia salvadora: `TrimLeft` está escrito en forma de *cola recursiva* en una rama.
Cuando se vuelve a llamar a sí misma, inmediatamente devuelve el resultado y no hace nada con él.
Debido a que estos tipos no necesitan crear ningún resultado intermedio, se pueden implementar más rápidamente y de una manera que evite desencadenar muchas de las heurísticas de recursividad de tipos que están integradas en *TypeScript*.

Es por eso que *TypeScript 4.5* realiza una eliminación de la cola recursiva en tipos condicionales.
Siempre que una rama de un tipo condicional sea simplemente otro tipo condicional, *TypeScript* puede evitar instancias intermedias.
Todavía hay heurísticas para garantizar que estos tipos no se descarrilen, pero son mucho más generosos.

Ten en cuenta que el siguiente tipo *no* se optimizará, ya que usa el resultado de un tipo condicional al agregarlo a una unión.

```ts
type GetChars<S> =
    S extends `${infer Char}${infer Rest}` ? Char | GetChars<Rest> : never;
```

Si deseas que sea de cola recursiva, puedes introducir un ayudante que tome un parámetro de tipo "acumulador", al igual que con las funciones de cola recursiva.

```ts
type GetChars<S> = GetCharsHelper<S, never>;
type GetCharsHelper<S, Acc> =
    S extends `${infer Char}${infer Rest}` ? GetCharsHelper<Rest, Char | Acc> : Acc;
```

Puedes leer más sobre la implementación [aquí](https://github.com/microsoft/TypeScript/pull/45711).

### Deshabilitar el desvanecimiento de `import`

Hay algunos casos en los que *TypeScript* no puede detectar que está utilizando una importación.
Por ejemplo, toma el siguiente código:

```ts
import { Animal } from "./animal.js";

eval("console.log(new Animal().isDangerous())");
```

De forma predeterminada, *TypeScript* siempre elimina esta importación porque parece que no se utiliza.
En *TypeScript 4.5*, puedes habilitar una nueva marca llamada [`preserveValueImports`](/tsconfig#preserveValueImports) para evitar que *TypeScript* elimine cualquier valor importado de tus salidas de *JavaScript*.
Las buenas razones para usar `eval` son pocas y distantes entre sí, pero algo muy similar a esto sucede en *Svelte*:

```HTML
<!-- Un archivo .svelte ->
<script>
  import { someFunc } from "./some-module.js";
</script>

<button on:click="{someFunc}">Click me!</button>
```

junto con en *Vue.js*, usando su función `<script setup>`:

```HTML
<!-- Un archivo .vue ->
<script setup>
  import { someFunc } from "./some-module.js";
</script>

<button @click="someFunc">Click me!</button>
```

Estos marcos generan algo de código basado en el marcado fuera de sus etiquetas `<script>`, pero *TypeScript sólo* ve código dentro de las etiquetas `<script>`.
Eso significa que *TypeScript* eliminará automáticamente la importación de `someFunc`, ¡y el código anterior no se podrá ejecutar!
Con *TypeScript 4.5*, puedes usar [`preserveValueImports`](/tsconfig#preserveValueImports) para evitar estas situaciones.

Ten en cuenta que esta bandera tiene un requisito especial cuando se combina con [`--isolatedModules`](/tsconfig#isolatedModules): importado
Los tipos *deben* estar marcados como de solo tipo porque los compiladores que procesan archivos individuales a la vez no tienen forma de saber si las importaciones son valores que parecen no utilizados o un tipo que se debe eliminar para evitar una falla en el entorno de ejecución.

```ts
// ¿Cuál de estos es un valor que se debería conservar? tsc lo sabe, pero `ts.transpileModule`,
// ts-loader, esbuild, etc. no lo hacen, por lo que `isolatedModules` da un error.
import { someFunc, BaseType } from "./some-module.js";
//                 ^^^^^^^^
// Error: 'BaseType' es un tipo y se debe importar mediante una importación de solo tipo
// cuando 'preserveValueImports' e 'isolatedModules' están habilitados.
```

Eso hace que otra característica de *TypeScript 4.5*, [modificadores de tipo en los nombres de importación](#type-on-import-names), sea especialmente importante.

Para obtener más información, [consulta la solicitud de extracción aquí](https://github.com/microsoft/TypeScript/pull/44619).

### Modificadores `type` en los nombres de importación

Como se mencionó anteriormente, [`preserveValueImports`](/tsconfig#preserveValueImports) y [`isolatedModules`](/tsconfig#isolatedModules) tienen requisitos especiales para que no haya ambigüedad para las herramientas de compilación si es seguro eliminar las importaciones de tipos.

```ts
// ¿Cuál de estos es un valor que se debería conservar? tsc lo sabe, pero `ts.transpileModule`,
// ts-loader, esbuild, etc. no lo hacen, por lo que `isolatedModules` emite un error.
import { someFunc, BaseType } from "./some-module.js";
//                 ^^^^^^^^
// Error: 'BaseType' es un tipo y se debe importar mediante una importación de solo tipo
// cuando 'preserveValueImports' e 'isolatedModules' están habilitados.
```

Cuando se combinan estas opciones, necesitamos una forma de señalar cuándo se puede descartar legítimamente una importación.
*TypeScript* ya tiene algo para esto con `import type`:

```ts
import type { BaseType } from "./some-module.js";
import { someFunc } from "./some-module.js";

export class Thing implements BaseType {
  // ...
}
```

Esto funciona, pero sería bueno evitar dos declaraciones de importación para el mismo módulo.
Esa es parte de la razón por la que *TypeScript 4.5* permite un modificador `type` en importaciones con nombre individuales, para que puedas mezclar y combinar según sea necesario.

```ts
import { someFunc, type BaseType } from "./some-module.js";

export class Thing implements BaseType {
    someMethod() {
        someFunc();
    }
}
```

En el ejemplo anterior, siempre se garantiza que `BaseType` se borrará y `someFunc` se conservará en [`preserveValueImports`](/tsconfig#preserveValueImports), dejándonos con el siguiente código:

```js
import { someFunc } from "./some-module.js";

export class Thing {
  someMethod() {
    someFunc();
  }
}
```

Para obtener más información, consulta [los cambios en *GitHub*](https://github.com/microsoft/TypeScript/pull/45998).

### Comprobaciones de presencia de campo privado

*TypeScript 4.5* admite una propuesta de *ECMAScript *para comprobar si un objeto tiene un campo privado.
Ahora puedes escribir una clase con un miembro de campo `#private` y ver si otro objeto tiene el mismo campo usando el operador `in`.

```ts
class Person {
    #name: string;
    constructor(name: string) {
        this.#name = name;
    }

    equals(other: unknown) {
        return other &&
            typeof other === "object" &&
            #name in other && // <- ¡Esto es nuevo!
            this.#name === other.#name;
    }
}
```

Un aspecto interesante de esta característica es que la comprobación `#name in other` implica que `other` debe haber sido construido como una `Person`a, ya que no hay otra forma en que ese campo podría estar presente.
En realidad, esta es una de las características clave de la propuesta, y es por eso que la propuesta se denomina "controles ergonómicos de marca" ⏤ porque los campos privados a menudo actúan como una "marca" para protegerse contra objetos que no son instancias de su clase.
Como tal, *TypeScript* es capaz de reducir adecuadamente el tipo de `other` en cada comprobación, hasta que termina con el tipo `Person`a.

Nos gustaría extender un gran agradecimiento a nuestros amigos de *Bloomberg* [quienes contribuyeron con esta solicitud de extracción](https://github.com/microsoft/TypeScript/pull/44648): [Ashley Claymore](https://github.com/acutmore), [Titian Cernicova-Dragomir](https://github.com/dragomirtitian), [Kubilay Kahveci](https://github.com/mkubilayk) y [Rob Palmer](https://github.com/robpalme).

### Importar aserciones

*TypeScript 4.5* admite una propuesta de *ECMAScript* para *aserciones de importación*.
Esta es una sintaxis utilizada por los entornos de ejecución para asegurarse de que una importación tenga el formato esperado.

```ts
import obj from "./something.json" assert { type: "json" };
```

*TypeScript* no comprueba el contenido de estas aserciones, ya que son específicas del alojamiento y simplemente se dejan solo para que los navegadores y los entornos de ejecución puedan manejarlos (y posiblemente errores).

```ts
// *TypeScript* está bien con esto.
// ¿Pero tu navegador? Probablemente no.
import obj from "./something.json" assert {
    type: "fluffy bunny"
};
```

Las llamadas `import()` dinámicas también pueden usar aserciones de importación a través de un segundo argumento.

```ts
const obj = await import("./something.json", {
  assert: { type: "json" },
});
```

El tipo esperado de ese segundo argumento está definido por un nuevo tipo llamado `ImportCallOptions`, y actualmente solo acepta una propiedad `assert`.

¡Nos gustaría agradecer a [Wenlu Wang](https://github.com/Kingwl/) por [implementar esta función](https://github.com/microsoft/TypeScript/pull/40698)!

### Tiempo de carga más rápido con `realPathSync.native`

*TypeScript* ahora aprovecha una implementación nativa del sistema de la función *Node.js* `realPathSync` en todos los sistemas operativos.

Anteriormente, esta función solo se usaba en *Linux*, pero en *TypeScript 4.5* se ha adoptado para sistemas operativos que generalmente no distinguen entre mayúsculas y minúsculas, como *Windows* y *MacOS*.
En ciertos códigos base, este cambio aceleró la carga del proyecto entre un 5 y un 13% (según el sistema operativo del alojamiento).

Para obtener más información, consulta [el cambio original aquí](https://github.com/microsoft/TypeScript/pull/44966), junto con [los cambios específicos de 4.5 aquí](https://github.com/microsoft/TypeScript/pull/44966).

### Complementos de fragmentos para atributos *JSX*

*TypeScript 4.5* trae *completado de fragmentos* para atributos *JSX*.
Al escribir un atributo en una etiqueta *JSX*, *TypeScript* ya proporcionará sugerencias para esos atributos;
pero con el completado de fragmentos, pueden ahorrar un poco de escritura adicional agregando un iniciador y luego colocando el cursor en el lugar correcto.

![Completado de fragmentos para atributos JSX. Para una propiedad de cadena, las comillas se agregan automáticamente. Para propiedades numéricas, se agregan llaves.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/10/jsx-attributes-snippets-4-5.gif)

*TypeScript* normalmente usará el tipo de atributo para averiguar qué tipo de iniciador insertar, pero puede personalizar este comportamiento en *Visual Studio Code*.

![Configuración en *VS Code* para completado de atributos JSX](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/10/jsx-snippet-settings-4-5.png)

Ten en cuenta que esta característica solo funcionará en versiones más recientes de *Visual Studio Code*, por lo que es posible que debas usar una compilación *Insiders* para que esto funcione.
Para obtener más información, [lee sobre la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/45903)

### Mejor compatibilidad con el editor para tipos no resueltos

En algunos casos, los editores aprovecharán un modo semántico ligero "parcial" ⏤ ya sea mientras el editor espera a que se cargue el proyecto completo o en contextos como el [editor basado en web de *GitHub*](https://docs.github.com/en/codespaces/developing-in-codespaces/web-based-editor ).

En versiones anteriores de *TypeScript*, si el servicio de lenguaje no podía encontrar un tipo, simplemente imprimía `any`.

![Al pasar el cursor sobre una firma donde no se encuentra el `Buffer`, TypeScript lo reemplaza con `any`.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/10 /quick-info-unresolved-4-4.png)

En el ejemplo anterior, no se encontró `Buffer`, por lo que *TypeScript* lo reemplazó con `any` en `quick info`.
En *TypeScript 4.5*, *TypeScript* hará todo lo posible para preservar lo que escribiste.

![Pasando el cursor sobre una firma donde no se encuentra `Buffer`, continúa usando el nombre `Buffer`.](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021 /10/quick-info-unresolved-4-5.png)

Sin embargo, si colocas el cursor sobre el propio `Buffer`, obtendrás una pista de que *TypeScript* no pudo encontrar el `Buffer`.

![TypeScript muestra `type Buffer = /* unresolved */ any;`](https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2021/10/quick-info-unresolved-on-type-4-5.png)

En conjunto, esto proporciona una experiencia más fluida cuando *TypeScript* no tiene disponible el programa completo.
Ten en cuenta que siempre obtendrás un error en situaciones normales para indicarte cuando no se encuentra un tipo.

Para obtener más información, [consulta la implementación aquí](https://github.com/microsoft/TypeScript/pull/45976).

### Ruptura por cambios

#### Cambios `lib.d.ts`

*TypeScript 4.5* contiene cambios en sus archivos de declaración integrados que pueden afectar tu compilación;
sin embargo, [estos cambios fueron convenientemente mínimos](https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1143), y esperamos que la mayoría del código no se vea afectado.

#### Cambios de inferencia de `Awaited`

Debido a que `Awaited` ahora se usa en `lib.d.ts` y como resultado de `await`, es posible que veas ciertos cambios de tipos genéricos que pueden causar incompatibilidades;
sin embargo, dadas muchas decisiones de diseño intencionales en torno a `Awaited` para evitar roturas, esperamos que la mayoría del código no se vea afectado.

#### Comprobación de las opciones del compilador en la raíz de `tsconfig.json`

Es un error fácil olvidarse accidentalmente de la sección `compilerOptions` en un `tsconfig.json`.
Para ayudar a detectar este error, en *TypeScript 4.5*, es un error agregar un campo de nivel superior que coincida con cualquiera de las opciones disponibles en `compilerOptions` *sin* haber definido también `compilerOptions` en ese `tsconfig.json`.
