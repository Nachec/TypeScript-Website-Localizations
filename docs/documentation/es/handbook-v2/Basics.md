---
title: Conceptos básicos
layout: docs
permalink: /docs/handbook/2/basic-types.html
oneline: "Paso uno para aprender TypeScript: Tipos básicos."
preamble: >
  <p>Bienvenido a la primera página del manual. Si esta es tu primera experiencia con TypeScript ⏤ es posible que desees comenzar en una de las guías de '<a href='https://www.typescriptlang.org/docs/handbook/intro.html#get-started'>primeros pasos</a>'</p>
---

Todos y cada uno de los valores en *JavaScript* tienen un conjunto de comportamientos que puedes observar al ejecutar diferentes operaciones.
Eso suena abstracto, pero como un ejemplo rápido, considera algunas operaciones que podríamos ejecutar en una variable llamada `message`.

```js
// Accede a la propiedad 'toLowerCase'
// en 'message' y luego la llama
message.toLowerCase();

// Llama a 'message'
message();
```

Si la desglosamos, la primera línea de código ejecutable accede a una propiedad llamada `toLowerCase` y luego la llama.
La segunda intenta llamar a `message` directamente.

Pero asumiendo que no conocemos el valor de `message` ⏤ y eso es bastante común ⏤ no podemos decir de manera confiable qué resultados obtendremos al intentar ejecutar cualquiera de este código.
El comportamiento de cada operación depende completamente del valor que teníamos en primer lugar.

- ¿Se puede llamar a `message`?
- ¿Tiene una propiedad llamada `toLowerCase`?
- Si es así, ¿se puede llamar a `toLowerCase`?
- Si ambos valores son invocables, ¿qué devuelven?

Las respuestas a estas preguntas suelen ser cosas que tenemos en la cabeza cuando escribimos *JavaScript*, y tenemos que esperar a tener todos los detalles correctos.

Digamos que `message` se definió de la siguiente manera.

```js
const message = "Hello World!";
```

Como probablemente puedas adivinar, si intentamos ejecutar `message.toLowerCase()`, obtendremos la misma cadena solo en minúsculas.

¿Qué pasa con esa segunda línea de código?
Si estás familiarizado con *JavaScript*, sabrás que esto falla con una excepción:

```text
TypeError: message is not a function
```

Sería genial si pudiéramos evitar errores como este.

Cuando ejecutamos nuestro código, la forma en que nuestro entorno de ejecución de *JavaScript* elige qué hacer es averiguar el *tipo* del valor: qué tipo de comportamientos y capacidades tiene.
Eso es parte de lo que se refiere a *TypeError* ⏤ está diciendo que la cadena `"¡hello world!"` no se puede llamar como una función.

Para algunos valores, como los primitivos `string` y `number`, podemos identificar su tipo en el entorno de ejecución usando el operador `typeof`.
Pero para otras cosas como funciones, no existe un mecanismo del entorno de ejecución correspondiente para identificar sus tipos.
Por ejemplo, considera esta función:

```js
function fn(x) {
  return x.flip();
}
```

Podemos *observar* leyendo el código que esta función solo trabajará si se le da un objeto con una propiedad `flip` invocable, pero *JavaScript* no muestra esta información de una manera que podamos revisar mientras el código se está ejecutando.
En *JavaScript* puro, la única forma de saber qué hace `fn` con un valor particular es llamarla y ver qué sucede.
Este tipo de comportamiento hace que sea difícil predecir qué hará el código antes de que se ejecute, lo cual significa que es más difícil saber qué hará tu código mientras lo escribes.

Visto de esta manera, un `type` es el concepto de describir qué valores se pueden pasar a `fn` y cuáles fallarán.
*JavaScript* solo proporciona verdadero *tipado dinámico* ⏤ ejecuta el código para ver qué sucede.

La alternativa es usar un sistema de tipo `static` para hacer predicciones sobre qué código se espera *antes* de que se ejecute.

## Comprobación estática de tipo

Piensa en ese `TypeError` que obtuvimos antes al intentar llamar a un `string` como función.
A la mayoría de la gente no le gusta recibir ningún tipo de error al ejecutar su código. ¡esos se consideran errores!
Y cuando escribimos un nuevo código, hacemos todo lo posible para evitar introducir nuevos errores.

Si agregamos solo un poco de código, guardamos nuestro archivo, volvemos a ejecutar el código e inmediatamente vemos el error, es posible que podamos aislar el problema rápidamente; pero ese no siempre es el caso.
Es posible que no hayamos probado la función lo suficientemente a fondo, por lo que es posible que nunca nos encontremos con que arrojaría un potencial error.
O si tuviéramos la suerte de presenciar el error, podríamos haber terminado haciendo grandes refactorizaciones y agregando un montón de código diferente que nos vemos obligados a revisar.

Idealmente, podríamos tener una herramienta que nos ayude a encontrar estos errores *antes* de que se ejecute nuestro código.
Eso es lo que hace un comprobador estático de tipos como *TypeScript*.
Los *sistemas de tipos estáticos* describen las formas y comportamientos de cuáles serán nuestros valores cuando ejecutemos nuestros programas.
Un comprobador de tipos como *TypeScript* usa esa información y nos dice cuándo las cosas se podrían estar saliendo de los rieles.

```ts twoslash
// @errors: 2349
const message = "hello!";

message();
```

Ejecutar ese último ejemplo con *TypeScript* nos dará un mensaje de error antes de ejecutar el código en primer lugar.

## Fallos sin excepciones

Hasta ahora hemos estado discutiendo ciertas cosas como errores en el entorno de ejecución: casos en los que el entorno de ejecución de *JavaScript* nos dice que cree que algo no tiene sentido.
Esos casos surgen porque [la especificación *ECMAScript*](https://tc39.github.io/ecma262/) tiene instrucciones explícitas sobre cómo se debe comportar el lenguaje cuando se encuentra con algo inesperado.

Por ejemplo, la especificación dice que intentar llamar a algo que no se puede llamar debería generar un error.
Tal vez eso suene como un "comportamiento obvio", pero te podrías imaginar que acceder a una propiedad que no existe en un objeto también debería generar un error.
En cambio, *JavaScript* nos da un comportamiento diferente y devuelve el valor `undefined`:

```js
const user = {
  name: "Daniel",
  age: 26,
};

user.location; // devuelve undefined
```

En última instancia, un sistema de tipado estático tiene que realizar la llamada sobre qué código se debe marcar como error en tu sistema, incluso si es *JavaScript* "válido" que no arrojará un error de inmediato.
En *TypeScript*, el siguiente código produce un error acerca de que `location` no está definida:

```ts twoslash
// @errors: 2339
const user = {
  name: "Daniel",
  age: 26,
};

user.location;
```

Si bien, a veces eso implica una compensación en lo que puedes expresar, la intención es detectar errores legítimos en nuestros programas.
Y *TypeScript* detecta *muchos* errores legítimos.

Por ejemplo: errores tipográficos,

```ts twoslash
// @noErrors
const announcement = "Hello World!";

// ¿Qué tan rápido puedes detectar los errores tipográficos?
announcement.toLocaleLowercase();
announcement.toLocalLowerCase();

// Probablemente quisimos escribir esto...
announcement.toLocaleLowerCase();
```

funciones no llamadas,

```ts twoslash
// @noUnusedLocals
// @errors: 2365
function flipCoin() {
  // Pretende ser Math.random()
  return Math.random < 0.5;
}
```

o errores lógicos básicos.

```ts twoslash
// @errors: 2367
const value = Math.random() < 0.5 ? "a" : "b";
if (value !== "a") {
  // ...
} else if (value === "b") {
  // Vaya, inalcanzable
}
```

## Herramientas para tipos

*TypeScript* puede detectar fallos cuando cometemos errores en nuestro código.
Eso es genial, pero *TypeScript* también puede evitar que cometamos esos errores en primer lugar.

El comprobador de tipos tiene información para revisar cosas como si estamos accediendo a las propiedades correctas en las variables y otras propiedades.
Una vez que tenga esa información, también puede comenzar a *sugerir* qué propiedades puedes querer usar.

Eso significa que *TypeScript* también se puede aprovechar para editar código, y el comprobador de tipos central puede proporcionar mensajes de error y completar el código a medida que escribes en el editor.
Eso es parte de lo que la gente suele referir cuando habla de herramientas en *TypeScript*.

<!-- prettier-ignore -->
```ts twoslash
// @noErrors
// @esModuleInterop
import express from "express";
const app = express();

app.get("/", function(req, res) {
  res.sen
//       ^|
});

app.listen(3000);
```

*TypeScript* se toma muy en serio las herramientas y eso va más allá de la compleción y los errores a medida que escribes.
Un editor que admita *TypeScript* puede ofrecer "soluciones rápidas" para corregir errores automáticamente, refactorizaciones para reorganizar fácilmente el código y funciones de navegación útiles para saltar a las definiciones de una variable o encontrar todas las referencias a una determinada variable.
Todo esto se basa en el comprobador de tipos y es completamente multiplataforma, por lo que es probable que [tu editor favorito tenga disponible compatibilidad con *TypeScript*](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support).

## `tsc`, el compilador de *TypeScript*

Hemos estado hablando de comprobación de tipos, pero aún no hemos usado nuestro *comprobador* de tipos.
Conozcamos a nuestro nuevo amigo `tsc`, el compilador de *TypeScript*.
Primero, necesitaremos obtenerlo a través de `npm`.

```sh
npm install -g typescript
```

> Esto instala globalmente el compilador `tsc` de *TypeScript*.
> Puedes usar `npx` o herramientas similares si prefieres ejecutar `tsc` desde un paquete `node_modules` local.

Ahora vayamos a un directorio vacío e intentemos escribir nuestro primer programa *TypeScript*: `hello.ts`:

```ts twoslash
// Saluda al mundo.
console.log("Hello world!");
```

Observa que aquí no hay lujos; este programa "hello world" parece idéntico a lo que escribirías para un programa "hello world" en *JavaScript*.
Y ahora comprobemos el tipo ejecutando el comando `tsc` que fue instalado por el paquete `typescript`.

```sh
tsc hello.ts
```

¡Tada!

Espera, ¿*exactamente qué es "tada"*?
Ejecutamos `tsc` y ¡no pasó nada!.
Bueno, no hubo errores de tipo, por lo que no obtuvimos ningún resultado en nuestra consola ya que no había nada que informar.

Pero revisa de nuevo ⏤ obtuvimos como  resultado un nuevo *archivo* en su lugar.
Si buscamos en nuestro directorio actual, veremos un archivo `hello.js` junto a `hello.ts`.
Esa es la salida de nuestro archivo `hello.ts` después de que `tsc` *compila* o *transforma* en un archivo *JavaScript* puro.
Y si revisamos el contenido, veremos lo que *TypeScript* escupe después de que procesa un archivo `.ts`:

```js
// Saluda al mundo.
console.log("Hello world!");
```

En este caso, *TypeScript* tenía muy poco que transformar, por lo que parece idéntico a lo que escribimos.
El compilador intenta emitir un código legible y limpio que parece algo que una persona escribiría.
Si bien eso no siempre es tan fácil, *TypeScript* aplica sangrías de manera consistente, es consciente de cuándo nuestro código abarca diferentes líneas de código e intenta mantener los comentarios.

¿Qué pasa si *nosotros* introdujimos un error de comprobación de tipo?
Reescribamos `hello.ts`:

```ts twoslash
// @noErrors
// Esta es una función de bienvenida de uso general y grado industrial:
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date}!`);
}

greet("Brendan");
```

Si ejecutamos `tsc hola.ts` nuevamente, ¡observa que obtenemos un error en la línea de comandos!

```text
Expected 2 arguments, but got 1.
```

*TypeScript* nos dice que olvidamos pasar un argumento a la función `greet`, y con razón.
Hasta ahora solo hemos escrito *JavaScript* estándar y, sin embargo, la comprobación de tipos aún pudo encontrar problemas con nuestro código.
¡Gracias *TypeScript*!

## Emitir con errores

Una cosa que quizás no hayas notado en el último ejemplo es que nuestro archivo `hello.js` cambió nuevamente.
Si abrimos ese archivo, veremos que el contenido sigue siendo básicamente el mismo que nuestro archivo de entrada.
Eso podría ser un poco sorprendente dado que `tsc` informó un error sobre nuestro código, pero esto se basa en uno de los valores centrales de *TypeScript*: la mayor parte del tiempo, *tú* sabrás mejor que *TypeScript*.

Para reiterar lo anterior, el código de comprobación de tipos limita el tipo de programas que puedes ejecutar, por lo que hay una compensación en el tipo de cosas que un comprobador de tipos considera aceptables.
La mayoría de las veces está bien, pero hay escenarios en los que esos controles se interponen.
Por ejemplo, imagínate migrando código *JavaScript* a *TypeScript* e introduciendo errores de comprobación de tipos.
Con el tiempo, podrás limpiar las cosas para el comprobador de tipos, ¡pero ese código *JavaScript* original ya estaba funcionando!
¿Por que convertirlo?, ¿*TypeScript* debería evitar que lo ejecutes?

Entonces *TypeScript* no se interpone en tu camino.
Por supuesto, con el tiempo, es posible que desees estar un poco más a la defensiva contra los errores y hacer que *TypeScript* actúe de manera un poco más estricta.
En ese caso, puedes utilizar la opción [`noEmitOnError`](/tsconfig#noEmitOnError) del compilador.
Intenta cambiar tu archivo `hello.ts` y ejecutar `tsc` con ese indicador:

```sh
tsc --noEmitOnError hello.ts
```

Notarás que `hello.js` nunca se actualiza.

## Tipos explícitos

Hasta ahora, no le hemos dicho a *TypeScript* qué es `person` o qué es `date`.
Editemos el código para decirle a *TypeScript* que `person` es un `string` y que `date` debe ser un objeto `Date`.
También usaremos el método `toDateString()` en `date`.

```ts twoslash
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

Lo que hicimos fue agregar *anotaciones de tipo* en `person` y `date` para describir con qué tipos de valores se puede llamar a `greet`.
Puedes leer esa firma como "`greet` toma una `person` de tipo `string` y un `date` de tipo `Date` ".

Con esto, *TypeScript* nos puede informar sobre otros casos en los que se podría haber llamado incorrectamente a `greet`.
Por ejemplo...

```ts twoslash
// @errors: 2345
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", Date());
```

¿Eh?
*TypeScript* informó un error en nuestro segundo argumento, pero ¿por qué?

Quizás sorprendentemente, llamar a `Date()` en *JavaScript* devuelve un `string`.
Por otro lado, construir un `Date` con `new Date()` en realidad nos da lo que esperábamos.

De todos modos, podemos corregir rápidamente el error:

```ts twoslash {4}
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

Ten en cuenta que no siempre tenemos que escribir anotaciones de tipo explícitas.
En muchos casos, *TypeScript* puede incluso *inferir* (o "averiguar") los tipos por nosotros a pesar de que los omitamos.

```ts twoslash
let msg = "hello there!";
//  ^?
```

Aunque no le dijimos a *TypeScript* que `msg` tenía el tipo `string`, no obstante fue capaz de averiguarlo.
Esa es una característica, y es mejor no agregar anotaciones cuando el sistema de tipos terminaría infiriendo el mismo tipo de todos modos.

> Nota: La burbuja de mensaje dentro del código de ejemplo anterior es lo que tu editor mostraría si hubieras pasado el cursor sobre la palabra.

## Tipos borrados

Echemos un vistazo a lo que sucede cuando compilamos la función anterior `saludar` con `tsc` para generar *JavaScript*:

```ts twoslash
// @showEmit
// @target: es5
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

Nota dos cosas aquí:

1. Nuestros parámetros `person` y `date` ya no tienen anotaciones de tipo.
2. Nuestra "cadena de plantilla" ⏤ esa cadena que usó comillas invertidas (el carácter `` ` ``) ⏤ se convirtió en cadenas simples con concatenaciones.

Abordaremos este segundo punto más adelante, pero centrémonos ahora en ese primer punto.
Las anotaciones de tipo no son parte de *JavaScript* (o *ECMAScript* para ser precisos), por lo que realmente no hay navegadores u otros entornos de ejecución que puedan ejecutar *TypeScript* sin modificaciones.
Es por eso que *TypeScript* necesita un compilador en primer lugar ⏤ necesita alguna forma de eliminar o transformar cualquier código específico de *TypeScript* para que puedas ejecutarlo.
La mayor parte del código específico de *TypeScript* se borra y, de la misma manera, aquí nuestras anotaciones de tipo se borraron por completo.

> **Recuerda** ⏤ Las anotaciones de tipo nunca cambian el comportamiento en el entorno de ejecución de tu programa.

## Degradar el nivel

Otra diferencia con respecto a lo anterior fue que nuestra cadena de plantilla se reescribió desde

```js
`Hello ${person}, today is ${date.toDateString()}!`;
```

a

```js
"Hello " + person + ", today is " + date.toDateString() + "!";
```

¿Por qué pasó esto?

Las cadenas de plantilla son una característica de una versión de *ECMAScript* llamada *ECMAScript 2015* (alias *ECMAScript 6*, *ES2015*, *ES6*, etc. ⏤ *no preguntes*).
*TypeScript* tiene la capacidad de reescribir código de versiones más nuevas de *ECMAScript* a versiones más antiguas como *ECMAScript 3* o *ECMAScript 5* (también conocido como *ES3* y *ES5*).
Este proceso de pasar de una versión más nueva o "superior" de *ECMAScript* a una más antigua o "inferior" a veces se denomina *degradar el nivel*.

De forma predeterminada, *TypeScript* tiene como objetivo *ES3*, una versión extremadamente antigua de *ECMAScript*.
Podríamos haber elegido algo un poco más reciente usando la opción [`target`](/tsconfig#target).
La ejecución con `--target es2015` cambia el destino de *TypeScript* a *ECMAScript 2015*, lo cual significa que el código se debería poder ejecutar donde sea que se admita *ECMAScript 2015*.
Entonces, ejecutar `tsc --target es2015 hola.ts` nos da el siguiente resultado:

```js
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

> Si bien el destino predeterminado es *ES3*, la gran mayoría de los navegadores actuales admiten *ES2015*.
> Por lo tanto, la mayoría de los desarrolladores pueden especificar con seguridad *ES2015* o superior como destino, a menos que sea importante la compatibilidad con ciertos navegadores antiguos.

## Rigurosidad

Diferentes usuarios llegan a *TypeScript* en busca de diferentes cosas en un comprobador de tipos.
Algunas personas buscan una experiencia de suscripción más flexible que pueda ayudar a validar solo algunas partes de su programa y aún así tener herramientas decentes.
Esta es la experiencia predeterminada con *TypeScript*, donde los tipos son opcionales, la inferencia toma los tipos más indulgentes y no hay comprobación de valores potencialmente nulos/indefinidos.
Al igual que la forma en que se emite `tsc` ante los errores, estos valores predeterminados se implementan para mantenerse fuera de tu camino.
Si estás migrando *JavaScript* existente, ese podría ser un primer paso deseable.

Por el contrario, muchos usuarios prefieren que *TypeScript* valide todo lo que pueda de inmediato, y es por eso que el lenguaje también proporciona configuraciones rigurosas.
Estas rigurosas configuraciones convierten la comprobación estática de tipo de un switch (ya sea que tu código esté comprobado o no) en algo más cercano a un dial.
Cuanto más suba este dial, *TypeScript* más comprobará por ti.
Esto puede requerir un poco de trabajo adicional, pero en general, se amortiza a largo plazo y permite comprobaciones más exhaustivas y herramientas más precisas.
Cuando sea posible, un nuevo código base siempre debe activar estos controles rigurosos.

*TypeScript* tiene varios indicadores de rigurosidad de comprobación de tipo que se pueden activar o desactivar, y todos nuestros ejemplos se escribirán con todos ellos habilitados a menos que se indique lo contrario.
El indicador [`strict`](/tsconfig#strict) en la *CLI*, o `"strict": true` en un [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) los activa todos simultáneamente, pero podemos optar por activarlos individualmente.
Los dos más importantes que debes conocer son [`noImplicitAny`](/tsconfig#noImplicitAny) y [`strictNullChecks`](/tsconfig#strictNullChecks).

## `noImplicitAny`

Recuerda que en algunos lugares, *TypeScript* no intenta inferir tipos por nosotros y, en cambio, recurre al tipo más indulgente: `any`.
Esto no es lo peor que puede pasar ⏤ después de todo, volver a `any` simplemente es la experiencia de *JavaScript* puro de todos modos.

Sin embargo, usar `any`, a menudo frustra el propósito de usar *TypeScript* en primer lugar.
Cuanto más asignes tipos en tu programa, más validación y herramientas obtendrás, lo cual significa que te encontrarás con menos errores a medida que codificas.
Al activar la marca [`noImplicitAny`](/tsconfig#noImplicitAny) se generará un error en cualquier variable cuyo tipo se infiera implícitamente como `any`.

## `strictNullChecks`

De forma predeterminada, valores como `null` y `undefined` se pueden asignar a cualquier otro tipo.
Esto puede hacer que escribir código sea más fácil, pero olvidarse de manejar `null` y `undefined` es la causa de innumerables errores en el mundo ⏤ ¡algunos lo consideran un [error de mil millones de dólares](https://www.youtube.com/watch?v=ybrQvs4x0Ps)!
El indicador [`strictNullChecks`](/tsconfig#strictNullChecks) hace que el manejo de `null` y `undefined` sea más explícito, y nos *evita* preocuparnos por si *olvidamos* manejar `null` y `undefined`.
