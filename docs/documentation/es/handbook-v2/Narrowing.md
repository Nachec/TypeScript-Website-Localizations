---
title: Reducción
layout: docs
permalink: /docs/handbook/2/narrowing.html
oneline: "Comprender cómo TypeScript utiliza el conocimiento de JavaScript para reducir la cantidad de sintaxis de tipos en tus proyectos."
---

Imagina que tenemos una función llamada `padLeft`.

```ts twoslash
function padLeft(padding: number | string, input: string): string {
  throw new Error("Not implemented yet!");
}
```

Si `padding` es un `number`, lo tratará como el número de espacios que queremos anteponer a `input`.
Si `padding` es un `string`, debería anteponer `padding` a `input`.
Intentemos implementar la lógica para cuando a `padLeft` se le pasa un `number` para `padding`.

```ts twoslash
// @errors: 2345
function padLeft(padding: number | string, input: string) {
  return " ".repeat(padding) + input;
}
```

¡Hum!, estamos recibiendo un error en `padding`.
*TypeScript* nos advierte que agregar un `number` a un `number | string` podría no darnos lo que queremos, y es correcto.
En otras palabras, no hemos comprobado explícitamente si `padding` es un `number` primero, ni estamos manejando el caso donde es un `string`, así que hagamos exactamente eso.

```ts twoslash
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

Si esto parece un código *JavaScript* poco interesante, ese es el punto.
Aparte de las anotaciones que colocamos, este código *TypeScript* se parece a *JavaScript*.
La idea es que el sistema de tipos de *TypeScript* tiene como objetivo hacer que sea lo más fácil posible escribir código *JavaScript* típico sin volver atrás para obtener seguridad de tipos.

Si bien puede que no parezca mucho, en realidad hay muchas cosas ocultas aquí.
Al igual que *TypeScript* analiza los valores en el entorno de ejecución usando tipos estáticos, superpone el análisis de tipos en las construcciones de control de flujo  del entorno de ejecución de *JavaScript* como `if/else`, condicionales ternarias, bucles, comprobaciones de verdad, etc., que pueden afectar esos tipos.

Dentro de nuestra comprobación `if`, *TypeScript* ve `typeof padding === "number"` y lo entiende como una forma especial de código conocido como *protección de tipo*.
*TypeScript* sigue las posibles rutas de ejecución que nuestros programas pueden tomar para analizar el tipo más específico posible de un valor en una determinada posición.
Examina estas comprobaciones especiales (llamadas *protección de tipo*) y asignaciones, y el proceso de refinar tipos a tipos más específicos que los declarados se denomina *reducción*.
En muchos editores podemos observar estos tipos a medida que cambian, e incluso lo haremos en nuestros ejemplos.

```ts twoslash
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
    //                ^?
  }
  return padding + input;
  //     ^?
}
```

Hay un par de construcciones diferentes que *TypeScript* entiende por reducción.

## Protector de tipo `typeof`

Como hemos visto, *JavaScript* admite un operador `typeof` que puede proporcionar información muy básica sobre el tipo de valores que tenemos en el entorno de ejecución.
*TypeScript* espera que esto devuelva un determinado conjunto de cadenas:

- `"string"`
- `"number"`
- `"bigint"`
- `"boolean"`
- `"symbol"`
- `"undefined"`
- `"object"`
- `"function"`

Como vimos con `padLeft`, este operador aparece con bastante frecuencia en varias bibliotecas de *JavaScript*, y *TypeScript* puede entenderlo para restringir tipos en diferentes ramas.

En *TypeScript*, la comprobación con el valor devuelto por `typeof` es una protección de tipo.
Debido a que *TypeScript* codifica cómo opera `typeof` en diferentes valores, conoce algunas de sus peculiaridades en *JavaScript*.
Por ejemplo, observa que en la lista anterior, `typeof` no devuelve la cadena `null`.
Mira el siguiente ejemplo:

```ts twoslash
// @errors: 2531
function printAll(strs: string | string[] | null) {
  if (typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  } else {
    // hace nada
  }
}
```

En la función `printAll`, intentamos comprobar si `strs` es un objeto para ver si es un tipo de arreglo (ahora podría ser un buen momento para reforzar que los arreglos son tipos de objetos en *JavaScript*).
¡Pero resulta que en *JavaScript*, `typeof null` en realidad es `"object"`!
Este es uno de esos lamentables accidentes de la historia.

Es posible que los usuarios con suficiente experiencia no se sorprendan, pero no todos se han encontrado con esto en *JavaScript*; afortunadamente, *TypeScript* nos permite saber que `strs` solo se redujo a `string[] | null` en lugar de solo a `string[]`.

Esta podría ser una buena transición a lo que llamaremos comprobación de "verdad".

# Reducción de verdad

"Truthiness" (traducida como "verdad") puede no ser una palabra que encuentres en el diccionario, pero es algo que escucharás en *JavaScript*.

En *JavaScript*, podemos usar cualquier expresión en condicionales, `&&`s, `||`s, declaraciones `if`, negaciones booleanas (`!`), y más.
Como ejemplo, las declaraciones `if` no esperan que su condición siempre tenga el tipo `boolean`.

```ts twoslash
function getUsersOnlineMessage(numUsersOnline: number) {
  if (numUsersOnline) {
    return `There are ${numUsersOnline} online now!`;
  }
  return "Nobody's here. :(";
}
```

En *JavaScript*, construcciones como `if` primero "coaccionan" sus condiciones a "booleanos" para que tengan sentido, y luego eligen sus ramas dependiendo de si el resultado es `true` o `false`.
Valores como

- `0`
- `NaN`
- `""` (la cadena vacía)
- `0n` (la versión `bigint` de cero)
- `null`
- `undefined`

todos coaccionan a `false`, y otros valores se convierten en `true`.
Siempre puedes convertir los valores en `boolean` ejecutándolos a través de la función `Boolean` o usando la doble negación booleana más corta. (Esta última tiene la ventaja de que *TypeScript* infiere un tipo booleano literal reducido a `true`, mientras que infiere el primero como tipo `boolean`).

```ts twoslash
// ambos resultan en 'true'
Boolean("hello"); // type: boolean, value: true
!!"world"; // type: true,    value: true
```

Es bastante popular aprovechar este comportamiento, especialmente para protegerse contra valores como `null` o `undefined`.
Como ejemplo, intentemos usarlo para nuestra función `printAll`.

```ts twoslash
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
```

Notarás que nos hemos deshecho del error anterior comprobando si `strs` es verdad.
Esto al menos, nos evita los temidos errores cuando ejecutamos nuestro código como:

```text
TypeError: null is not iterable
```

Sin embargo, ten en cuenta que la comprobación de verdad en primitivos a menudo puede ser propenso a errores.
Como ejemplo, considera un intento diferente de escribir `printAll`

```ts twoslash {class: "do-not-do-this"}
function printAll(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  ¡NO HAGAS ESTO!
  //   SIGUE LEYENDO
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

Envolvimos todo el cuerpo de la función en una comprobación de verdad, pero esto tiene una sutil desventaja: es posible que ya no estemos manejando correctamente el caso de cadenas vacías.

*TypeScript* no nos hace ningún daño aquí, pero este es un comportamiento que vale la pena señalar si estás menos familiarizado con *JavaScript*.
*TypeScript* a menudo te puede ayudar a detectar errores desde el principio, pero si eliges hacer *nada* con un valor, hay mucho que puedes hacer sin ser demasiado prescriptivo.
Si lo deseas, te puedes asegurar de manejar situaciones como estas con un `linter`.

Una última palabra sobre la reducción de verdad es que las negaciones booleanas con `!` se filtran desde las ramas negadas.

```ts twoslash
function multiplyAll(
  values: number[] | undefined,
  factor: number
): number[] | undefined {
  if (!values) {
    return values;
  } else {
    return values.map((x) => x * factor);
  }
}
```

## Reducción de igualdad

*TypeScript* también usa declaraciones `switch` y comprobaciones de igualdad como `===`, `!==`, `==` y `!=` para reducir tipos.
Por ejemplo:

```ts twoslash
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // Ahora podemos llamar a cualquier método de 'string' en 'x' o 'y'.
    x.toUpperCase();
    // ^?
    y.toLowerCase();
    // ^?
  } else {
    console.log(x);
    //          ^?
    console.log(y);
    //          ^?
  }
}
```

Cuando comprobamos que `x` e `y` son iguales en el ejemplo anterior, *TypeScript* sabía que sus tipos también tenían que ser iguales.
Dado que `string` es el único tipo común que pueden adoptar tanto `x` como `y`, *TypeScript* sabe que `x` e `y` deben ser un `string` en la primera rama.

También funciona la comprobación con valores literales específicos (a diferencia de las variables).
En nuestra sección sobre la reducción de verdad, escribimos una función `printAll` que era propensa a errores porque accidentalmente no manejaba correctamente las cadenas vacías.
En su lugar, podríamos haber hecho una comprobación específica para bloquear los `null`s, y *TypeScript* aún elimina correctamente `null`s del tipo `strs`.

```ts twoslash
function printAll(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) {
        //            ^?
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
      //          ^?
    }
  }
}
```

Los controles de igualdad más flexibles de *JavaScript* con `==` y `!=` también se reducen correctamente.
Si no estás familiarizado, comprobar si algo `== null` en realidad no solo verifica si es específicamente el valor `null` ⏤ también comprueba si potencialmente es `undefined`.
Lo mismo se aplica a `== undefined`: comprueba si un valor es `null` o `undefined`.

```ts twoslash
interface Container {
  value: number | null | undefined;
}

function multiplyValue(container: Container, factor: number) {
  // Elimina tanto 'null' como 'undefined' del tipo.
  if (container.value != null) {
    console.log(container.value);
    //                    ^?

    // Ahora podemos multiplicar con seguridad 'container.value'.
    container.value *= factor;
  }
}
```

## El operador  `in` reducido

*JavaScript* tiene un operador para determinar si un objeto tiene una propiedad con un nombre: el operador `in`.
*TypeScript* tiene esto en cuenta como una forma de reducir los tipos potenciales.

Por ejemplo, con el código: `"value" in x`. donde `"value"` es un literal de cadena y `x` es un tipo `union`.
La rama "`true`" limita los tipos de `x` que tienen una propiedad `value` opcional u obligatoria, y la rama "`false`" se reduce a los tipos que tienen una propiedad `value` opcional o faltante.

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }

  return animal.fly();
}
```

Repito, las propiedades opcionales existirán en ambos lados por la reducción, por ejemplo, un humano podría nadar y volar (con el equipo adecuado) y, por lo tanto, debería aparecer en ambos lados de la marca `in`:

<!-- prettier-ignore -->
```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Human = { swim?: () => void; fly?: () => void };

function move(animal: Fish | Bird | Human) {
  if ("swim" in animal) {
    animal;
//  ^?
  } else {
    animal;
//  ^?
  }
}
```

## Reducción `instanceof`

*JavaScript* tiene un operador para comprobar si un valor es una "instancia" de otro valor.
Específicamente, en *JavaScript*, `x instanceof Foo` comprueba si la *cadena de prototipos* de `x` contiene `Foo.prototype`.
Si bien no profundizaremos aquí, y verás más de esto cuando entremos en las clases, aún pueden ser útiles para la mayoría de los valores que se pueden construir con `new`.
Como habrás adivinado, `instanceof` también es un protector de tipo, y *TypeScript* se reduce en las ramas protegidas por `instanceof`s.

```ts twoslash
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
    //          ^?
  } else {
    console.log(x.toUpperCase());
    //          ^?
  }
}
```

## Asignaciones

Como mencionamos anteriormente, cuando asignamos a cualquier variable, *TypeScript* mira el lado derecho de la asignación y reduce el lado izquierdo apropiadamente.

```ts twoslash
let x = Math.random() < 0.5 ? 10 : "hello world!";
//  ^?
x = 1;

console.log(x);
//          ^?
x = "goodbye!";

console.log(x);
//          ^?
```

Observa que cada una de estas asignaciones es válida.
Aunque el tipo observado de `x` cambió a `number` después de nuestra primera asignación, pudimos asignar un `string` a `x`.
Esto se debe a que el *tipo declarado* de `x` ⏤ el tipo con el que comenzó `x` ⏤ es `string | number`, y la asignabilidad siempre se compara con el tipo declarado.

Si hubiéramos asignado un `boolean` a `x`, habríamos visto un error ya que no era parte del tipo declarado.

```ts twoslash
// @errors: 2322
let x = Math.random() < 0.5 ? 10 : "hello world!";
//  ^?
x = 1;

console.log(x);
//          ^?
x = true;

console.log(x);
//          ^?
```

## Análisis del control de flujo

Hasta este punto, hemos analizado algunos ejemplos básicos de cómo *TypeScript* se reduce dentro de ramas específicas.
Pero hay algo más en juego que simplemente recorrer cada variable y buscar protección de tipos en condicionales, `if`s, `while`s, etc.
Por ejemplo

```ts twoslash
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

`padLeft` regresa desde dentro de su primer bloque `if`.
*TypeScript* pudo analizar este código y ver el resto del cuerpo (`return padding + input;`) es *inalcanzable* en el caso donde `padding` es un `number`.
Como resultado, fue capaz de eliminar `number` del tipo de `padding` (reduciendo de `string | number` a `string`) para el resto de la función.

Este análisis de código basado en la accesibilidad se denomina *análisis de control de flujo*, y *TypeScript* utiliza este análisis de flujo para restringir los tipos a medida que encuentra protección de tipos y asignaciones.
Cuando se analiza una variable, el control de flujo se puede dividir y volverse a fusionar una y otra vez, y se puede observar que esa variable tiene un tipo diferente en cada punto.

```ts twoslash
function example() {
  let x: string | number | boolean;

  x = Math.random() < 0.5;

  console.log(x);
  //          ^?

  if (Math.random() < 0.5) {
    x = "hello";
    console.log(x);
    //          ^?
  } else {
    x = 100;
    console.log(x);
    //          ^?
  }

  return x;
  //     ^?
}
```

## Usar predicados de tipo

Hasta ahora, hemos trabajado con construcciones de *JavaScript* existentes para manejar la reducción, sin embargo, a veces deseas un control más directo sobre cómo cambian los tipos a lo largo de tu código.

Para definir una protección de tipo definida por el usuario, simplemente tenemos que definir una función cuyo tipo de retorno sea un *predicado de tipo*:

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
// ---cut---
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

nuestro *predicado de tipo* en este ejemplo es `pet is Fish`.
Un predicado toma la forma `parameterName is Type`, donde `parameterName` debe ser el nombre de un parámetro de la firma de la función actual.

Cada vez que se llama a `isFish` con alguna variable, *TypeScript* *reducirá* esa variable a ese tipo específico si el tipo original es compatible.

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
// Ambas llamadas a 'swim' y 'fly' ahora están bien.
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

Ten en cuenta que *TypeScript* no solo sabe que `pet` es un `Fish` en la rama `if`;
también sabe en la rama `else` que, *no* tienes un `Fish`, por lo que debes tener un `Bird`.

Puedes utilizar la protección de tipo `isFish` para filtrar un arreglo de `Fish | Bird` y obtener un arreglo de `Fish`:

```ts twoslash
type Fish = { swim: () => void; name: string };
type Bird = { fly: () => void; name: string };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater1: Fish[] = zoo.filter(isFish);
// o, el equivalente
const underWater2: Fish[] = zoo.filter(isFish) as Fish[];

// El predicado puede necesitar repetirse para ejemplos
// más complejos
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === "sharkey") return false;
  return isFish(pet);
});
```

Además, las clases pueden [usar `this is Type`](/docs/handbook/2/classes.html#this-based-type-guards) para reducir su tipo.

# Uniones discriminadas

La mayoría de los ejemplos que hemos visto hasta ahora se han centrado en reducir variables individuales con tipos simples como `string`, `boolean` y `number`.
Si bien esto es común, la mayoría de las veces en *JavaScript* trataremos con estructuras un poco más complejas.

Para motivarnos, imaginemos que estamos tratando de codificar formas como círculos y cuadrados.
Los círculos realizan un seguimiento de sus radios y los cuadrados realizan un seguimiento de la longitud de sus lados.
Usaremos un campo llamado `kind` para decir con qué forma estamos tratando.
Aquí hay un primer intento de definir `Shape`.

```ts twoslash
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}
```

Observa que estamos usando una unión de tipos literales de cadena: `"circle"` y `"square"` para decirnos si debemos tratar la forma como un círculo o un cuadrado respectivamente.
Utilizando `"circle" | "square"` en lugar de `string`, podemos evitar problemas de ortografía.

```ts twoslash
// @errors: 2367
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function handleShape(shape: Shape) {
  // oops!
  if (shape.kind === "rect") {
    // ...
  }
}
```

Podemos escribir una función `getArea` que aplique la lógica correcta en función de si se trata de un círculo o un cuadrado.
Primero intentaremos tratar con círculos.

```ts twoslash
// @errors: 2532
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

<!-- PENDIENTE -->

Bajo [`strictNullChecks`](/tsconfig#strictNullChecks) que nos da un error ⏤ lo cual es apropiado ya que es posible que `radius` no esté definido.
Pero, ¿y si realizamos las comprobaciones adecuadas en la propiedad `kind`?

```ts twoslash
// @errors: 2532
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
}
```

Hmm, *TypeScript* todavía no sabe qué hacer aquí.
Hemos llegado a un punto en el que sabemos más sobre nuestros valores que el comprobador de tipos.
Podríamos intentar usar una aserción no nula (un `!` después de `shape.radius`) para decir que definitivamente `radius` está presente.

```ts twoslash
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius! ** 2;
  }
}
```

Pero esto no se siente ideal.
Tuvimos que gritarle un poco al comprobador de tipos con esas afirmaciones no nulas (`!`) para convencerlo de que se definió `shape.radius`, pero esas afirmaciones son propensas a errores si comenzamos a mover el código.
Además, fuera de [`strictNullChecks`](/tsconfig#strictNullChecks) podemos acceder accidentalmente a cualquiera de esos campos de todos modos (ya que se supone que las propiedades opcionales siempre están presentes al leerlas).
Definitivamente podemos hacerlo mejor.

El problema con esta codificación de `Shape` es que el comprobador de tipo no tiene ninguna forma de saber si `radius` o `sideLength` están presentes en función de la propiedad `kind`.
Necesitamos comunicar lo que *sabemos* al comprobador de tipos.
Con eso en mente, demos otro giro para definir `Shape`.

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;
```

Aquí, hemos separado correctamente `Shape` en dos tipos con valores diferentes para la propiedad `kind`, pero `radius` y `sideLength` se declaran como propiedades obligatorias en sus respectivos tipos.

Veamos qué sucede aquí cuando intentamos acceder al `radius` de una `Shape`.

```ts twoslash
// @errors: 2339
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

Al igual que con nuestra primera definición de `Shape`, esto sigue siendo un error.
Cuando `radius` era opcional, obtuvimos un error (solo en [`strictNullChecks`](/tsconfig#strictNullChecks)) porque *TypeScript* no podía determinar si la propiedad estaba presente.
Ahora que `Shape` es una unión, *TypeScript* nos dice que `shape` podría ser un `Square` y que los `Square`s no tienen un `radius` definido.
Ambas interpretaciones son correctas, pero solo la codificación de la unión de `Shape` causará un error fuera de [`strictNullChecks`](/tsconfig#strictNullChecks).

Pero, ¿y si intentamos comprobar la propiedad `kind` de nuevo?

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
    //               ^?
  }
}
```

¡Eso eliminó el error!
Cuando cada tipo en una unión contiene una propiedad común con tipos literales, *TypeScript* considera que es una *unión discriminada* y puede limitar los miembros de la unión.

En este caso, `kind` era esa propiedad común (que es lo que se considera una propiedad *discriminante* de `Shape`).
comprobar si la propiedad `kind` era `"circle"` eliminó todos los tipos en `Shape` que no tenían una propiedad `kind` con el tipo `"circle"`.
Esa `shape` reducida al tipo `Circle`.

La misma comprobación también funciona con las declaraciones `switch`.
Ahora podemos intentar escribir nuestra `getArea` completa sin ninguna molesta aserción `!` no nula.

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    //                 ^?
    case "square":
      return shape.sideLength ** 2;
    //       ^?
  }
}
```

Lo importante aquí fue la codificación de `Shape`.
Comunicar la información correcta a *TypeScript* ⏤ que `Circle` y `Square` en realidad eran dos tipos separados con campos específicos de `kind` ⏤ fue crucial.
Hacer eso nos permite escribir código *TypeScript* de tipo seguro que no se ve diferente al *JavaScript* que habríamos escrito de otra manera.
A partir de ahí, el sistema de tipos pudo hacer lo "correcto" y descubrir los tipos en cada rama de nuestra declaración `switch`.

> Como acotación al margen, intenta jugar con el ejemplo anterior y elimina algunas de las palabras clave `return`.
> Verás que la comprobación de tipos puede ayudar a evitar errores cuando se cae accidentalmente en diferentes cláusulas en una declaración `switch`.

Las uniones discriminadas son útiles para algo más que hablar de círculos y cuadros.
Son buenas para representar cualquier tipo de esquema de mensajería en *JavaScript*, como al enviar mensajes a través de la red (comunicación cliente/servidor) o codificar mutaciones en un marco de gestión de estado.

# El tipo `never`

Al reducir, puedes limitar las opciones de una unión hasta un punto en el que hayas eliminado todas las posibilidades y no quede nada.
En esos casos, *TypeScript* utilizará un tipo `never` para representar un estado que no debería existir.

# Comprobación exhaustiva

El tipo `never` es un subtipo de, y asignable a, cada tipo; sin embargo, *ningún* tipo es un subtipo de, o asignable a, `never` (excepto `never` en sí mismo). Esto significa que puedes usar la reducción y confiar en que "nunca" aparecerá `never` para realizar una comprobación exhaustiva en una declaración switch.

Por ejemplo, agregar un `default` a nuestra función `getArea` que intenta asignar la forma a `never` se activará cuando no se hayan manejado todos los casos posibles.

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}
// ---cut---
type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

Agregar un nuevo miembro a la unión `Shape` provocará un error de *TypeScript*:

```ts twoslash
// @errors: 2322
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}
// ---cut---
interface Triangle {
  kind: "triangle";
  sideLength: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```
