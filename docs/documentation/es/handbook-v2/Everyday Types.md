---
title: Tipos cotidianos
layout: docs
permalink: /docs/handbook/2/everyday-types.html
oneline: "Los primitivos del lenguaje."
---

En este capítulo, cubriremos algunos de los tipos de valores más comunes que encontrarás en el código *JavaScript* y explicaremos las formas correspondientes de describir esos tipos en *TypeScript*.
Esta no es una lista exhaustiva y los capítulos futuros describirán más formas de nombrar y utilizar otros tipos.

Los tipos también pueden aparecer en muchos más *lugares* que solo en anotaciones de tipo.
A medida que aprendamos sobre los tipos en sí, también aprenderemos sobre los lugares donde podemos hacer referencia a estos tipos para formar nuevas construcciones.

Comenzaremos revisando los tipos más básicos y comunes que puedes encontrar al escribir código *JavaScript* o *TypeScript*.
Estos formarán más adelante los bloques de construcción centrales de tipos más complejos.

## Los primitivos: `string`, `number` y `boolean`

*JavaScript* tiene tres [primitivos](https://developer.mozilla.org/docs/Glossary/Primitivo) de uso muy común: `string`, `number` y `boolean`.
Cada uno tiene un tipo correspondiente en *TypeScript*.
Como era de esperar, estos son los mismos nombres que verías si utilizaras el operador `typeof` de *JavaScript* en un valor de esos tipos:

- `string` representa valores de cadena como `"Hola, mundo"`
- `number` es para números como `42`. *JavaScript* no tiene un valor especial en el entorno de ejecución para enteros, por lo que no hay equivalente a `int` o `float` ⏤ todo simplemente es `number`
- `boolean` es para los dos valores `true` y `false`

> Los nombres de tipo `String`, `Number` y `Boolean` (que comienzan con letras mayúsculas) son legales, pero se refieren a algunos tipos incorporados especiales que rara vez aparecerán en tu código. *Siempre* usa `string`, `number` o `boolean` para los tipos.

## Arreglos

Para especificar el tipo de un arreglo como `[1, 2, 3]`, puedes usar la sintaxis `number[]`; esta sintaxis funciona para cualquier tipo (por ejemplo, `string[]` es un arreglo de cadenas, y así sucesivamente).
También puedes ver esto escrito como `Array<number>`, que significa lo mismo.
Aprenderemos más sobre la sintaxis `T<U>` cuando cubramos `generics`.

> Ten en cuenta que `[number]` es una cosa diferente; consulta la sección sobre [Tuplas](/docs/handbook/2objects.html#tipos-tupla).


## `any`

*TypeScript* también tiene un tipo especial, `any`, que puedes usar siempre que no desees que un valor en particular cause errores de comprobación de tipo.

Cuando un valor es del tipo `any`, puedes acceder a cualquier propiedad del mismo (que a su vez será del tipo `any`), llamarlo como una función, asignarlo a (o desde) un valor de cualquier tipo, o prácticamente cualquier otra cosa que sintácticamente sea legal:

```ts twoslash
let obj: any = { x: 0 };
// Ninguna de las siguientes líneas de código arrojará errores del compilador.
// El uso de `any` deshabilita todas las comprobaciones de tipo posteriores, 
// y se asume que conoces el entorno mejor que TypeScript.
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

El tipo `any` es útil cuando no deseas escribir un tipo `long` solo para convencer a *TypeScript* de que una línea de código en particular está bien.

### `noImplicitAny`

Cuando no especificas un tipo, y *TypeScript* no lo puede inferir a partir del contexto, el compilador normalmente tomará el valor predeterminado de `any`.

Sin embargo, normalmente querrás evitar esto, porque de `any` no se comprueba el tipo.
Usa la marca del compilador [`noImplicitAny`](/tsconfig#noImplicitAny) para marcar cualquier `any` implícito como un error.

## Anotaciones de tipo en variables

Cuando declaras una variable usando `const`, `var` o `let`, puedes agregar opcionalmente una anotación de tipo para especificar explícitamente el tipo de la variable:

```ts twoslash
let myName: string = "Alice";
//        ^^^^^^^^ Anotación de tipo
```

> *TypeScript* no usa declaraciones al estilo de "tipos a la izquierda" como `int x = 0;`
> Las anotaciones de tipo siempre irán *después* de lo que se está tipando.

En la mayoría de los casos, sin embargo, esto no es necesario.
Siempre que sea posible, *TypeScript* intenta *inferir* automáticamente los tipos en tu código.
Por ejemplo, el tipo de una variable se infiere en función del tipo de su iniciador:

```ts twoslash
// No se necesita anotación de tipo -- 'myName' se infiere como de tipo 'string'
let myName = "Alice";
```

En su mayor parte, no necesitas aprender explícitamente las reglas de inferencia.
Si estás comenzando, intenta usar menos anotaciones de tipo de las que crees ⏤ es posible que te sorprendas de lo poco que necesitas para que *TypeScript* comprenda completamente lo que está sucediendo.

## Funciones

Las funciones son el medio principal de transmitir datos en *JavaScript*.
*TypeScript* te permite especificar los tipos de valores de entrada y salida de funciones.

### Anotaciones de tipo de parámetro

Cuando declaras una función, puedes agregar anotaciones de tipo después de cada parámetro para declarar qué tipos de parámetros acepta la función.
Las anotaciones de tipo de parámetro van después del nombre del parámetro:

```ts twoslash
// Anotación de tipo de parámetro
function greet(name: string) {
  //                 ^^^^^^^^
  console.log("Hello, " + name.toUpperCase() + "!!");
}
```

Cuando un parámetro tiene una anotación de tipo, se comprobarán los argumentos de esa función:

```ts twoslash
// @errors: 2345
declare function greet(name: string): void;
// ---cut---
// ¡Sería un error en el entorno de ejecución si se ejecutara!
greet(42);
```

> Incluso si no tienes anotaciones de tipo en tus parámetros, *TypeScript* comprobará que hayas pasado la cantidad correcta de argumentos.

### Anotaciones de tipo de retorno

También puedes agregar anotaciones del tipo de retorno.
Las anotaciones del tipo de retorno aparecen después de la lista de parámetros:

```ts twoslash
function getFavoriteNumber(): number {
  //                        ^^^^^^^^
  return 26;
}
```

Al igual que las anotaciones de tipo de variable, normalmente no necesitas una anotación de tipo de retorno porque *TypeScript* inferirá el tipo de retorno de la función de acuerdo a sus declaraciones `return`.
La anotación de tipo en el ejemplo anterior no cambia nada.
Algún código base especificará explícitamente un tipo de retorno con fines de documentación, para evitar cambios accidentales o simplemente por preferencia personal.

### Funciones anónimas

Las funciones anónimas son un poco diferentes de las declaraciones de funciones.
Cuando una función aparece en un lugar donde *TypeScript* puede determinar cómo se llamará, los parámetros de esa función reciben tipos automáticamente.

Aquí tienes un ejemplo:

```ts twoslash
// @errors: 2551
// Aquí no hay anotaciones de tipo, pero TypeScript puede detectar el error
const names = ["Alice", "Bob", "Eve"];

// Tipificación contextual para función
names.forEach(function (s) {
  console.log(s.toUppercase());
});

// La tipificación contextual también se aplica a las funciones de flecha
names.forEach((s) => {
  console.log(s.toUppercase());
});
```

Aunque el parámetro `s` no tenía una anotación de tipo, *TypeScript* usó los tipos de la función `forEach`, junto con el tipo inferido del arreglo, para determinar el tipo que tendrá `s`.

Este proceso se llama *tipificación contextual* porque el *contexto* en el que ocurre la función informa qué tipo debería tener.

De manera similar a las reglas de inferencia, no es necesario que aprendas explícitamente cómo sucede esto, pero comprender qué *sucede* puede ayudar a darte cuenta de cuándo no se necesitan anotaciones de tipo.
Más adelante, veremos más ejemplos de cómo el contexto en el que ocurre un valor puede afectar su tipo.

## Tipos Objeto

Aparte de los primitivos, el tipo más común que encontrarás es un *tipo objeto*.
Esto se refiere a cualquier valor de *JavaScript* con propiedades, ¡que son casi todos!
Para definir un tipo objeto, simplemente enumeramos sus propiedades y sus tipos.

Por ejemplo, aquí hay una función que toma un objeto con forma de punto:

```ts twoslash
// La anotación de tipo del parámetro es un tipo objeto
function printCoord(pt: { x: number; y: number }) {
  //                      ^^^^^^^^^^^^^^^^^^^^^^^^
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

Aquí, anotamos el parámetro con un tipo con dos propiedades ⏤ `x` e `y` ⏤ que ambos son de tipo `number`.
Puedes usar `,` o `;` para separar las propiedades, y el último separador es opcional de cualquier manera.

La parte de tipo de cada propiedad también es opcional.
Si no especificas un tipo, se asumirá que es `any`.

### Propiedades opcionales

Los tipos objeto también pueden especificar que algunas o todas sus propiedades son *opcionales*.
Para hacer esto, agrega un signo de interrogación (`?`) después del nombre de la propiedad:

```ts twoslash
function printName(obj: { first: string; last?: string }) {
  // ...
}
// Ambos bien
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
```

En *JavaScript*, si accedes a una propiedad que no existe, obtendrás el valor `undefined` en lugar de un error en el entorno de ejecución.
Debido a esto, cuando *lees* desde una propiedad opcional, tendrás que comprobar si hay `undefined` antes de usarla.

```ts twoslash
// @errors: 2532
function printName(obj: { first: string; last?: string }) {
  // Error - ¡podría fallar si no se proporcionó 'obj.last'!
  console.log(obj.last.toUpperCase());
  if (obj.last !== undefined) {
    // Bien
    console.log(obj.last.toUpperCase());
  }

  // Una alternativa segura que usa la sintaxis de JavaScript moderno:
  console.log(obj.last?.toUpperCase());
}
```

## Tipos unión

El sistema de tipos de *TypeScript* te permite crear nuevos tipos a partir de los existentes utilizando una gran variedad de operadores.
Ahora que sabemos cómo escribir algunos tipos, es hora de empezar a *combinarlos* de formas interesantes.

### Definición de un tipo unión

La primera forma de combinar tipos que puedes ver es un tipo `union`.
Un tipo `union` es un tipo formado por otros dos o más tipos, que representan valores que pueden ser *cualquiera* de esos tipos.
Nos referimos a cada uno de estos tipos como *miembros* de la unión.

Escribamos una función que pueda operar con cadenas o números:

```ts twoslash
// @errors: 2345
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// Bien
printId(101);
// Bien
printId("202");
// Error
printId({ myID: 22342 });
```

### Trabajar con tipos unión

Es fácil *proporcionar* un valor que coincida con un tipo `union` ⏤ simplemente proporciona un tipo que coincida con cualquiera de los miembros de la `union`.
Si *tienes* un valor de tipo unión, ¿cómo trabajas con él?

*TypeScript* solo te permitirá hacer una operación si es válida para *todos* los miembros de la unión.
Por ejemplo, si tienes la unión `string | number`, no puedes usar métodos que solo están disponibles en `string`:

```ts twoslash
// @errors: 2339
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```

La solución es *reducir* la unión con código, lo mismo que harías en *JavaScript* sin anotaciones de tipo.
La *reducción* ocurre cuando *TypeScript* puede deducir un tipo más específico para un valor basado en la estructura del código.

Por ejemplo, *TypeScript* sabe que solo un valor `string` tendrá un valor `typeof` de "`string`":

```ts twoslash
function printId(id: number | string) {
  if (typeof id === "string") {
    // En esta rama, id es de tipo 'string'
    console.log(id.toUpperCase());
  } else {
    // Aquí, id es de tipo 'number'
    console.log(id);
  }
}
```

Otro ejemplo es usar una función como `Array.isArray`:

```ts twoslash
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Aquí: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Aquí: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}
```

Observa que en la rama `else`, no necesitamos hacer nada especial ⏤ si `x` no era un `string[]`, entonces debe haber sido un `string`.

A veces tendrás una unión donde todos los miembros tienen algo en común.
Por ejemplo, tanto los arreglos como las cadenas tienen un método `slice`.
Si todos los miembros de una unión tienen una propiedad en común, puedes usar esa propiedad sin reducción.

```ts twoslash
// El tipo de retorno se infiere como number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

> Puede resultar confuso que una `union` de tipos parezca tener la *intersección* de las propiedades de esos tipos.
> Esto no es un accidente ⏤ el nombre `union` proviene de la teoría de tipos.
> La `union` `number | string` se compone de tomar la unión *de los valores* de cada tipo.
> Observa que, dados dos conjuntos con hechos correspondientes sobre cada conjunto, solo la *intersección* de esos hechos se aplica a la *unión* de los conjuntos mismos.
> Por ejemplo, si tuviéramos una sala de gente alta con sombrero y otra sala de hispanohablantes con sombrero, después de combinar esas habitaciones, lo único que sabemos de *toda* persona es que debe llevar sombrero.

## Alias de tipo

Hemos estado usando tipos objeto y tipos unión escribiéndolos directamente en anotaciones de tipo.
Esto es conveniente, pero es común querer usar el mismo tipo más de una vez y referirse a él por un solo nombre.

Un *alias de tipo* es exactamente eso ⏤ un *nombre* para cualquier *tipo*.
La sintaxis de un alias de tipo es:

```ts twoslash
type Point = {
  x: number;
  y: number;
};

// Exactamente igual que el ejemplo anterior
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

De hecho, puedes usar un alias de tipo para dar un nombre a cualquier tipo, no solo a un tipo objeto.
Por ejemplo, un alias de tipo puede nombrar un tipo unión:

```ts twoslash
type ID = number | string;
```

Ten en cuenta que los alias *solo* son alias ⏤ no puedes usar alias de tipo para crear "versiones" diferentes/distintas del mismo tipo.
Cuando usas el alias, es exactamente como si hubieras escrito el tipo con alias.
En otras palabras, este código puede parecer ilegal, pero está bien según *TypeScript* porque ambos tipos son alias del mismo tipo:

```ts twoslash
declare function getInput(): string;
declare function sanitize(str: string): string;
// ---cut---
type UserInputSanitizedString = string;

function sanitizeInput(str: string): UserInputSanitizedString {
  return sanitize(str);
}

// Crea una entrada sanitizada
let userInput = sanitizeInput(getInput());

// Aunque todavía se puede reasignar con una cadena
userInput = "new input";
```

## Interfaces

Una *declaración de interfaz* es otra forma de nombrar un tipo objeto:

```ts twoslash
interface Point {
  x: number;
  y: number;
}

function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

Al igual que cuando usamos un alias de tipo arriba, el ejemplo funciona como si hubiéramos usado un tipo de objeto anónimo.
*TypeScript* solo se preocupa por la *estructura* del valor que le pasamos a `printCoord` ⏤ solo le importa que tenga las propiedades esperadas.
Estar preocupado solo por la estructura y las capacidades de los tipos es la razón por la que llamamos a *TypeScript* un sistema de tipos *tipificado estructuralmente*.

### Diferencias entre los alias de tipo y las interfaces

Los alias de tipo y las interfaces son muy similares y, en muchos casos, puedes elegir entre ellos libremente.
Casi todas las características de una "interfaz" están disponibles en "`type`", la distinción clave es que un tipo no se puede volver a abrir para agregar nuevas propiedades frente a una interfaz que siempre es extensible.

<table class='full-width-table'>
  <tbody>
    <tr>
      <th><code>Interfaz</code></th>
      <th><code>Tipo</code></th>
    </tr>
    <tr>
      <td>
        <p>Extender una interfaz</p>
        <code><pre>
interface Animal {
  name: string
}<br/>
interface Bear extends Animal {
  honey: boolean
}<br/>
const bear = getBear() 
bear.name
bear.honey
        </pre></code>
      </td>
      <td>
        <p>Extender un tipo a través de intersecciones</p>
        <code><pre>
type Animal = {
  name: string
}<br/>
type Bear = Animal & { 
  honey: boolean 
}<br/>
const bear = getBear();
bear.name;
bear.honey;
        </pre></code>
      </td>
    </tr>
    <tr>
      <td>
        <p>Agregar nuevos campos a una interfaz existente</p>
        <code><pre>
interface Window {
  title: string
}<br/>
interface Window {
  ts: TypeScriptAPI
}<br/>
const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
        </pre></code>
      </td>
      <td>
        <p>Un tipo no se puede cambiar después de haber sido creado</p>
        <code><pre>
type Window = {
  title: string
}<br/>
type Window = {
  ts: TypeScriptAPI
}<br/>
<span style="color: #A31515"> // Error: Identificador 'Window' duplicado .</span><br/>
        </pre></code>
      </td>
    </tr>
    </tbody>
</table>

Aprenderás más sobre estos conceptos en capítulos posteriores, así que no te preocupes si no comprendes todos estos conceptos de inmediato.

- Antes de la versión 4.2 de *TypeScript*, nombres alias de tipo [*pueden* aparecer en mensajes de error](/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWZWhfYAjABMAMwALA+gbsVjoADqgjKESytQPxCHghAByXigYgBfr8LAsYj8aQMUASbDQcRSExCeCwFiIQh+AKfAYyBiQFgOPyIaikSGLQo0Zj-aazaY+dSaXjLDgAGXgAC9CKhDqAALxJaw2Ib2RzOISuDycLw+ImBYKQflCkWRRD2LXCw6JCxS1JCdJZHJ5RAFIbFJU8ADKC3WzEcnVZaGYE1ABpFnFOmsFhsil2uoHuzwArO9SmAAEIsSFrZB-GgAjjA5gtVN8VCEc1o1C4Q4AGlR2AwO1EsBQoAAbvB-gJ4HhPgB5aDwem-Ph1TCV3AEEirTp4ELtRbTPD4vwKjOfAuioSQHuDXBcnmgACC+eCONFEs73YAPGGZVT5cRyyhiHh7AAON7lsG3vBggB8XGV3l8-nVISOgghxoLq9i7io-AHsayRWGaFrlFauq2rg9qaIGQHwCBqChtKdgRo8TxRjeyB3o+7xAA), a veces en lugar del tipo anónimo equivalente (lo cual puede ser deseable o no). Las interfaces siempre se nombrarán en los mensajes de error.
- Los alias de tipo no pueden participar [en la combinación de declaraciones, pero las interfaces sí pueden](/play?#code/PTAEEEDtQS0gXApgJwGYEMDGjSfdAIx2UQFoB7AB0UkQBMAoEUfO0Wgd1ADd0AbAK6IAzizp16ALgYM4SNFhwBZdAFtV-UAG8GoPaADmNAcMmhh8ZHAMMAvjLkoM2UCvWad+0ARL0A-GYWVpA29gyY5JAWLJAwGnxmbvGgALzauvpGkCZmAEQAjABMAMwALLkANBl6zABi6DB8okR4Jjg+iPSgABboovDk3jjo5pbW1d6+dGb5djLwAJ7UoABKiJTwjThpnpnGpqPBoTLMAJrkArj4kOTwYmycPOhW6AR8IrDQ8N04wmo4HHQCwYi2Waw2W1S6S8HX8gTGITsQA).
- Las interfaces solo se pueden usar para [declarar las formas de los objetos, no cambiar el nombre de los primitivos](/play?#code/PTAEAkFMCdIcgM6gC4HcD2pIA8CGBbABwBtIl0AzUAKBFAFcEBLAOwHMUBPQs0XFgCahWyGBVwBjMrTDJMAshOhMARpD4tQ6FQCtIE5DWoixk9QEEWAeV37kARlABvaqDegAbrmL1IALlAEZGV2agBfampkbgtrWwMAJlAAXmdXdy8ff0Dg1jZwyLoAVWZ2Lh5QVHUJflAlSFxROsY5fFAWAmk6CnRoLGwmILzQQmV8JmQmDzI-SOiKgGV+CaYAL0gBBdyy1KCQ-Pn1AFFplgA5enw1PtSWS+vCsAAVAAtB4QQWOEMKBuYVUiVCYvYQsUTQcRSBDGMGmKSgAAa-VEgiQe2GLgKQA).
- Los nombres de las interfaces [*siempre* aparecerán en su forma original](/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWY2Q-YAjABMAMwALA+gbsVjNXW8yxySoAADaAA0CCaZbPh1XYqXgOIY0ZgmcK0AA0nyaLFhhGY8F4AHJmEJILCWsgZId4NNfIgGFdcIcUTVfgBlZTOWC8T7kAJ42G4eT+GS42QyRaYbCgXAEEguTzeXyCjDBSAAQSE8Ai0Xsl0K9kcziExDeiQs1lAqSE6SyOTy0AKQ2KHk4p1V6s1OuuoHuzwArMagA) en los mensajes de error, pero *sólo* cuando se utilizan por su nombre.

En su mayor parte, puedes elegir según tus preferencias personales, y *TypeScript* te dirá si necesitas algo para ser otro tipo de declaración. Si deseas una heurística, usa `interface` hasta que necesites usar las funciones de `type`.

## Aserciones de tipo

A veces, tendrás información sobre el tipo de un valor que *TypeScript* no puede conocer.

Por ejemplo, si estás usando `document.getElementById`, *TypeScript* solo sabe que esto devolverá *algún* tipo de `HTMLElement`, pero debes saber que tu página siempre tendrá un `HTMLCanvasElement` con un determinado *ID*.

En esta situación, puedes utilizar una *aserción de tipo* para especificar un tipo más específico:

```ts twoslash
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

Al igual que una anotación de tipo, el compilador elimina las aserciones de tipo y no afectarán el comportamiento en el entorno de ejecución de tu código.

También puedes utilizar la sintaxis de corchetes angulares (excepto si el código está en un archivo `.tsx`), que es equivalente:

```ts twoslash
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

> Recuerda: Debido a que las aserciones de tipo se eliminan en tiempo de compilación, no hay una comprobación en el entorno de ejecución asociada con una aserción de tipo.
> No se generará una excepción o un `null` si la aserción de tipo es incorrecta.

*TypeScript* solo permite aserciones de tipo que se convierten en una versión *más específica* o *menos específica* de un tipo.
Esta regla previene coerciones "imposibles" como:

```ts twoslash
// @errors: 2352
const x = "hello" as number;
```

A veces, esta regla puede ser demasiado conservadora y no permitirá coerciones más complejas que podrían ser válidas.
Si esto sucede, puedes usar dos aserciones, primero para `any` (o `unknown`, que presentaremos más adelante), luego para el tipo deseado:

```ts twoslash
declare const expr: any;
type T = { a: 1; b: 2; c: 3 };
// ---cut---
const a = (expr as any) as T;
```

## Tipos literales

Además de los tipos generales `string` y `number`, podemos referirnos a cadenas y números *específicos* en posiciones de tipo.

Una forma de pensar en esto es considerar cómo *JavaScript* viene con diferentes formas de declarar una variable. Tanto `var` como `let` permiten cambiar lo que se mantiene dentro de la variable, y `const` no. Esto se refleja en cómo *TypeScript* crea tipos para literales.

```ts twoslash
let changingString = "Hello World";
changingString = "Olá Mundo";
// Dado que `changingString` puede representar cualquier cadena posible,
// eso es como TypeScript lo describe en el sistema de tipos
changingString;
// ^?

const constantString = "Hello World";
// Dado que `constantString` solo puede representar 1 cadena
// tiene una representación de tipo literal
constantString;
// ^?
```

Por sí mismos, los tipos literales no son muy valiosos:

```ts twoslash
// @errors: 2322
let x: "hello" = "hello";
// Bien
x = "hello";
// ...
x = "howdy";
```

¡No sirve de mucho tener una variable que solo puede tener un valor!

Pero al *combinar* literales en uniones, puedes expresar un concepto mucho más útil: por ejemplo, funciones que solo aceptan un determinado conjunto de valores conocidos:

```ts twoslash
// @errors: 2345
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
```

Los tipos literales numéricos funcionan de la misma manera:

```ts twoslash
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
```

Por supuesto, los puedes combinar con tipos no literales:

```ts twoslash
// @errors: 2345
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
```

Hay un tipo más de tipo literal: Booleanos literales
Solo hay dos tipos de literales booleanos y, como puedes adivinar, son los tipos `true` y `false`.
El tipo `boolean` en sí mismo en realidad solo es un alias para la unión `true | false`.

### Inferencia literal

Cuando inicias una variable con un objeto, *TypeScript* asume que las propiedades de ese objeto pueden cambiar los valores más adelante.
Por ejemplo, si escribes un código como este:

```ts twoslash
declare const someCondition: boolean;
// ---cut---
const obj = { counter: 0 };
if (someCondition) {
  obj.counter = 1;
}
```

*TypeScript* no asume que la asignación de `1` a un campo que anteriormente tenía `0` es un error.
Otra forma de decir esto es que `obj.counter` debe tener el tipo `number`, no `0`, porque los tipos se utilizan para determinar tanto el comportamiento de lectura como de escritura.

Lo mismo se aplica a las cadenas:

```ts twoslash
// @errors: 2345
declare function handleRequest(url: string, method: "GET" | "POST"): void;
// ---cut---
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```

En el ejemplo anterior, `req.method` se infiere como `string`, no como `"GET"`. Debido a que el código se puede evaluar entre la creación de `req` y la llamada de `handleRequest` que podría asignar una nueva cadena como `"GUESS"` a `req.method`, *TypeScript* considera que este código tiene un error.

Hay dos formas de solucionar este problema.

1. Puedes cambiar la inferencia agregando una aserción de tipo en cualquier ubicación:

   ```ts twoslash
   declare function handleRequest(url: string, method: "GET" | "POST"): void;
   // ---cut---
   // Cambio 1:
   const req = { url: "https://example.com", method: "GET" as "GET" };
   // Cambio 2
   handleRequest(req.url, req.method as "GET");
   ```

   El cambio 1 significa "Tengo la intención de que `req.method` tenga siempre el *tipo literal* `"GET"`", evitando la posible asignación de `"GUESS"` a ese campo después.
   El cambio 2 significa "Sé por otras razones que `req.method` tiene el valor `"GET"`".

2. Puedes usar `as const` para convertir todo el objeto en tipos literales:

   ```ts twoslash
   declare function handleRequest(url: string, method: "GET" | "POST"): void;
   // ---cut---
   const req = { url: "https://example.com", method: "GET" } as const;
   handleRequest(req.url, req.method);
   ```

El sufijo `as const` actúa como `const`, pero para el sistema de tipos, asegurando que a todas las propiedades se les asigne el tipo literal en lugar de una versión más general como `string` o `number`.

## `null` y `undefined`

*JavaScript* tiene dos valores primitivos que se utilizan para señalar un valor ausente o no iniciado: `null` y `undefined`

*TypeScript* tiene dos *tipos* correspondientes con los mismos nombres. El comportamiento de estos tipos depende de si tienes activada la opción [`strictNullChecks`](/tsconfig#strictNullChecks).

### `strictNullChecks` desactivado

Con [`strictNullChecks`](/tsconfig#strictNullChecks) `off`, los valores que podrían ser `null` o `undefined` todavía se pueden acceder normalmente, y los valores `null` y `undefined` se pueden asignar a una propiedad de cualquier tipo.
Esto es similar a cómo se comportan los lenguajes sin comprobaciones nulas (por ejemplo, *C#*, *Java*).
La falta de verificación de estos valores tiende a ser una fuente importante de errores; siempre recomendamos a las personas que activen [`strictNullChecks`](/tsconfig#strictNullChecks) si es práctico hacerlo en su código base.

### `strictNullChecks` activo

Con [`strictNullChecks`](/tsconfig#strictNullChecks) `on`, cuando un valor es `null` o `undefined`, necesitarás probar esos valores antes de usar métodos o propiedades en ese valor.
Al igual que buscar `undefined` antes de usar una propiedad opcional, podemos usar *reducción* para comprobar valores que podrían ser `null`:

```ts twoslash
function doSomething(x: string | null) {
  if (x === null) {
    // hace nada
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
```

### Operador de aserción no nulo (sufijo `!`)

*TypeScript* también tiene una sintaxis especial para eliminar `null` y `undefined` de un tipo sin realizar ninguna comprobación explícita.
Escribir `!` después de cualquier expresión es efectivamente una aserción de tipo de que el valor no es `null` o `undefined`:

```ts twoslash
function liveDangerously(x?: number | null) {
  // No hay error
  console.log(x!.toFixed());
}
```

Al igual que otras aserciones de tipo, esto no cambia el comportamiento en el entorno de ejecución de tu código, por lo que es importante usar solo `!` cuando sepas que el valor *no puede* ser `null` o `undefined`.

## Enumeraciones

Las enumeraciones son una característica agregada a *JavaScript* por *TypeScript* que permite describir un valor que podría ser uno de un conjunto de posibles constantes nombradas. A diferencia de la mayoría de las funciones de *TypeScript*, esto *no* es una adición de nivel de tipo a *JavaScript*, sino algo que se agrega al lenguaje y al entorno de ejecución. Debido a esto, es una característica que debes saber que existe, pero tal vez dejes de usarla a menos que estés seguro. Puedes leer más sobre enumeraciones en la [página de referencia de Enum](/docs/handbook/enums.html).

## Primitivos menos comunes

Vale la pena mencionar el resto de los primitivos en *JavaScript* que están representados en el sistema de tipos.
Aunque no profundizaremos aquí.

#### `bigint`

Desde *ES2020* en adelante, hay un primitivo en *JavaScript* usado para enteros muy grandes, `BigInt`:

```ts twoslash
// @target: es2020

// Crea un bigint a través de la función BigInt
const oneHundred: bigint = BigInt(100);

// Crea un BigInt a través de la sintaxis literal
const anotherHundred: bigint = 100n;
```

Puedes obtener más información sobre `BigInt` en [las notas de la versión de *TypeScript 3.2*](/docs/handbook/release-notes/typescript-3-2.html#bigint).

#### `symbol`

Hay un primitivo en *JavaScript* que se usa para crear una referencia global única a través de la función `Symbol()`:

```ts twoslash
// @errors: 2367
const firstName = Symbol("name");
const secondName = Symbol("name");

if (firstName === secondName) {
  // No puede suceder nunca
}
```

Puedes obtener más información sobre ellos en la [página de referencia de símbolos](/docs/handbook/symbols.html).
