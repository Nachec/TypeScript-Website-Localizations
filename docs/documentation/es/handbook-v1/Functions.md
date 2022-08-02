---
title: Funciones
layout: docs
permalink: /docs/handbook/functions.html
oneline: Cómo agregar tipos a una función
handbook: "true"
deprecated_by: /docs/handbook/2/functions.html
---

Las funciones son el componente fundamental de cualquier aplicación en *JavaScript*.
Es como construyes capas de abstracción, imitando clases, ocultando información y módulos.
En *TypeScript*, aunque hay clases, espacios de nombres y módulos, las funciones siguen desempeñando un papel clave en la descripción de cómo *hacer* cosas.
*TypeScript* también agrega algunas nuevas capacidades a las funciones *JavaScript* estándar para facilitar tu trabajo.

## Funciones

Para comenzar, al igual que en *JavaScript*, las funciones de *TypeScript* se pueden crear como una función con nombre o como una función anónima.
Esto te permite elegir el enfoque más apropiado para tu aplicación, ya sea que estés creando una lista de funciones en una *API* o una única función para pasar a otra función.

Para recapitular rápidamente cómo se ven estos dos enfoques en *JavaScript*:

```ts twoslash
// @strict: false
// Función nombrada
function add(x, y) {
  return x + y;
}

// Función anónima
let myAdd = function (x, y) {
  return x + y;
};
```

Al igual que en *JavaScript*, las funciones se pueden referir a variables fuera del cuerpo de la función.
Cuando lo hacen, se dice que *capturan* esas variables.
Si bien comprender cómo funciona esto (y las desventajas al usar esta técnica) está fuera del alcance de este artículo, tener una comprensión firme de cómo funciona esta mecánica es una pieza importante para trabajar con *JavaScript* y *TypeScript*.

```ts twoslash
// @strict: false
let z = 100;

function addToZ(x, y) {
  return x + y + z;
}
```

## Tipos función

## Tipar la función

Agreguemos tipos a nuestros ejemplos simples de antes:

```ts twoslash
function add(x: number, y: number): number {
  return x + y;
}

let myAdd = function (x: number, y: number): number {
  return x + y;
};
```

Podemos agregar un tipo a cada uno de los parámetros y luego a la función misma para añadir un tipo de retorno.
*TypeScript* puede calcular el tipo de retorno al observar las declaraciones de retorno, por lo que opcionalmente también lo podemos omitir en muchos casos.

## Escribir el tipo de la función

Ahora que hemos escrito la función, vamos a escribir el tipo completo de la función mirando cada parte del tipo de la función.

```ts twoslash
let myAdd: (x: number, y: number) => number = function (
  x: number,
  y: number
): number {
  return x + y;
};
```

El tipo de una función tiene las mismas dos partes: el tipo de los argumentos y el tipo de retorno.
Al escribir todo el tipo de la función, se requieren ambas partes.
Escribimos los tipos de parámetros como una lista de parámetros, dando a cada parámetro un nombre y un tipo.
Este nombre es solo para ayudar con la legibilidad.
Podríamos haber escrito esto en su lugar:

```ts twoslash
let myAdd: (baseValue: number, increment: number) => number = function (
  x: number,
  y: number
): number {
  return x + y;
};
```

Mientras los tipos de parámetros se alineen, se considera un tipo válido para la función, independientemente de los nombres que le des a los parámetros en el tipo de la función.

La segunda parte es el tipo de retorno.
Dejamos claro cuál es el tipo de retorno usando una flecha (`=>`) entre los parámetros y el tipo de retorno.
Como se mencionó anteriormente, esta es una parte requerida del tipo de función, por lo que si la función no devuelve un valor, usarás `void` en lugar de omitirlo.

Cabe destacar que solo los parámetros y el tipo de retorno constituyen el tipo de la función.
Las variables capturadas no se reflejan en el tipo.
En efecto, las variables capturadas son parte del "estado oculto" de cualquier función y no constituyen su *API*.

## Infiriendo los tipos

Al jugar con el ejemplo, puedes notar que el compilador de *TypeScript* puede descubrir el tipo incluso si solo tienes tipos en un lado de la ecuación:

```ts twoslash
// Los parámetros 'x' e 'y' tienen el tipo 'number'
let myAdd = function (x: number, y: number): number {
  return x + y;
};

// myAdd tiene el tipo de la función completo
let myAdd2: (baseValue: number, increment: number) => number = function (x, y) {
  return x + y;
};
```

Esto se llama "escritura contextual", una forma de inferencia de tipos.
Esto ayuda a reducir la cantidad de esfuerzo para mantener tipado tu programa.

## Parámetros opcionales y predeterminados

En *TypeScript*, se supone que cada parámetro es requerido por la función.
Esto no significa que no se pueda dar `null` o `undefined`, sino que, cuando se llama a la función, el compilador comprobará que el usuario haya proporcionado un valor para cada parámetro.
El compilador también supone que estos parámetros son los únicos parámetros que se pasarán a la función.
En resumen, el número de argumentos dados a una función tiene que coincidir con el número de parámetros que la función espera.

```ts twoslash
// @errors: 2554
function buildName(firstName: string, lastName: string) {
  return firstName + " " + lastName;
}

let result1 = buildName("Bob"); // error, demasiados parámetros
let result2 = buildName("Bob", "Adams", "Sr."); // error, demasiados parámetros
let result3 = buildName("Bob", "Adams"); // ah, exacto
```

En *JavaScript*, cada parámetro es opcional, y los usuarios pueden dejarlos como mejor les parezca.
Cuando lo hacen, su valor es `undefined`.
Podemos obtener esta funcionalidad en *TypeScript* agregando un signo de `?` al final de los parámetros que queremos que sean opcionales.
Por ejemplo, supongamos que queremos que el parámetro `lastName` anterior sea opcional:

```ts twoslash
// @errors: 2554
function buildName(firstName: string, lastName?: string) {
  if (lastName) return firstName + " " + lastName;
  else return firstName;
}

let result1 = buildName("Bob"); // funciona correctamente ahora
let result2 = buildName("Bob", "Adams", "Sr."); // error, demasiados parámetros
let result3 = buildName("Bob", "Adams"); // ah, exacto
```

Cualquier parámetro opcional debe seguir a los parámetros requeridos.
Si quisiéramos hacer que el `name` fuera opcional, en lugar del `lastName`, tendríamos que cambiar el orden de los parámetros en la función, colocando primero el `lastName` en la lista.

En *TypeScript*, también podemos establecer un valor que se asignará a un parámetro si el usuario no proporciona uno, o si el usuario pasa `undefined` en su lugar.
Estos se denominan parámetros iniciados por omisión.
Tomemos el ejemplo anterior y establezcamos el apellido como "`Smith`".

```ts twoslash
// @errors: 2554
function buildName(firstName: string, lastName = "Smith") {
  return firstName + " " + lastName;
}

let result1 = buildName("Bob"); // funciona correctamente ahora, devuelve "Bob Smith"
let result2 = buildName("Bob", undefined); // todavía funciona, también devuelve "Bob Smith"
let result3 = buildName("Bob", "Adams", "Sr."); // error, demasiados parámetros
let result4 = buildName("Bob", "Adams"); // ah, exacto
```

Los parámetros iniciados por omisión que vienen después de que todos los parámetros requeridos se traten como opcionales, y al igual que los parámetros opcionales, se pueden omitir al llamar a su respectiva función.
Esto significa que los parámetros opcionales y los parámetros predeterminados finales compartirán elementos comunes en sus tipos, por lo que ambas

```ts
function buildName(firstName: string, lastName?: string) {
  // ...
}
```

y

```ts
function buildName(firstName: string, lastName = "Smith") {
  // ...
}
```

comparten el mismo tipo `(firstName: string, lastName?: string) => string`.
El valor predeterminado de `lastName` desaparece en el tipo, solo dejando atrás el hecho de que el parámetro es opcional.

A diferencia de los parámetros opcionales simples, los parámetros predeterminados iniciados *no necesitan* ocurrir después de los parámetros requeridos.
Si un parámetro predeterminado iniciado viene antes que un parámetro requerido, los usuarios deben pasar explícitamente `undefined` para obtener el valor iniciado predeterminado.
Por ejemplo, podríamos escribir nuestro último ejemplo con solo un iniciador predeterminado en `firstName`:

```ts twoslash
// @errors: 2554
function buildName(firstName = "Will", lastName: string) {
  return firstName + " " + lastName;
}

let result1 = buildName("Bob"); // error, demasiados parámetros
let result2 = buildName("Bob", "Adams", "Sr."); // error, demasiados parámetros
let result3 = buildName("Bob", "Adams"); // bien y devuelve "Bob Adams"
let result4 = buildName(undefined, "Adams"); // bien y devuelve "Will Adams"
```

## Parámetros `rest`

Los parámetros requeridos, opcionales y predeterminados tienen una cosa en común: hablan de un parámetro a la vez.
A veces, deseas trabajar con múltiples parámetros como grupo, o puede ser que no sepas cuántos parámetros tomará una función en última instancia.
En *JavaScript*, puedes trabajar con los argumentos directamente usando la variable `arguments` que es visible dentro del cuerpo de cada función.

En *TypeScript*, puedes reunir estos argumentos en una variable:

```ts twoslash
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

// employeeName will be "Joseph Samuel Lucas MacKinzie"
let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinzie");
```

Los *parámetros `rest`* se tratan como un número ilimitado de parámetros opcionales.
Al pasar argumentos para un parámetro `rest`, puedes usar tantos como desees; incluso puedes pasar ninguno.
El compilador construirá un arreglo de los argumentos pasados ​​con el nombre dado después de los puntos suspensivos (`...`), permitiéndote usarlo en tu función.

La elipsis también se usan en el tipo de la función con parámetros `rest`:

```ts twoslash
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}

let buildNameFun: (fname: string, ...rest: string[]) => string = buildName;
```

## `this`

Aprender a usar `this` en *JavaScript* es algo así como un rito de iniciación.
Dado que *TypeScript* es un superconjunto de *JavaScript*, los desarrolladores de *TypeScript* también necesitan aprender a usar `this` y cómo detectar cuándo no se usa correctamente.
Afortunadamente, *TypeScript* te permite detectar usos incorrectos de `this` con un par de técnicas.
Sin embargo, si necesitas aprender cómo funciona `this` en *JavaScript*, lee primero [Comprender la invocación de la función *JavaScript* y "`this`"](http://yehudakatz.com/2011/08/11/understanding-javascript-function-invocation-and-this/) de Yehuda Katz.
El artículo de Yehuda explica muy bien el funcionamiento interno de `this`, así que aquí, solo cubriremos los conceptos básicos.

## `this` y las funciones de flecha

En *JavaScript*, `this` es una variable que se establece cuando se llama a una función.
Esto la convierte en una característica muy potente y flexible, pero tiene el costo de tener que saber siempre el contexto en el que se ejecuta una función.
Esto es notoriamente confuso, especialmente cuando se devuelve una función o se pasa una función como argumento.

Veamos un ejemplo:

```ts twoslash
// @strict: false
let deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  createCardPicker: function () {
    return function () {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  },
};

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

Observa que `createCardPicker` es una función que en sí misma devuelve una función.
Si intentamos ejecutar el ejemplo, obtendremos un error en lugar del cuadro de alerta esperado.
Esto se debe a que el `this` que se usa en la función creada por `createCardPicker` se establecerá en `window` en lugar de nuestro objeto `deck`.
Eso es porque llamamos a `cardPicker()` por sí solo.
Una llamada con sintaxis de nivel superior sin método usará `window` para `this`.
(Nota: en modo estricto, `this` será `undefined` en lugar de `window`).

Podemos arreglar esto asegurándonos de que la función esté vinculada al '`this`' correcto antes de devolver la función que se utilizará más adelante.
De esta manera, independientemente de cómo se use más tarde, aún podrá ver el objeto `deck` original.
Para hacer esto, cambiamos la expresión de la función para usar la sintaxis de flecha *ECMAScript 6*.
Las funciones de flecha capturan el '`this`' donde se crea la función en lugar de en donde se invoca:

```ts twoslash
// @strict: false
let deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  createCardPicker: function () {
    // **Nota**: la línea de abajo ahora es una función de flecha, lo que nos permite capturar `this` aquí mismo
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  },
};

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

Aún mejor, *TypeScript* te advertirá cuando cometas este error si pasas la marca [`noImplicitThis`](/tsconfig#noImplicitThis) al compilador.
Señalará que `this` en `this.suits[pickedSuit]` es del tipo `any`.

## Parámetros `this`

Desafortunadamente, el tipo de `this.suits[pickedSuit]` sigue siendo `any`.
Esto se debe a que `this` proviene de la expresión de la función dentro del objeto literal.
Para solucionar esto, puedes proporcionar un parámetro `this` explícito.
Los parámetros `this` son parámetros falsos que aparecen primero en la lista de parámetros de una función:

```ts
function f(this: void) {
  // asegúrate de que `this` no se pueda usar en esta función independiente
}
```

Agreguemos un par de interfaces a nuestro ejemplo anterior, `Card` y `Deck`, para que los tipos sean más claros y fáciles de reutilizar:

```ts twoslash
interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  // **Nota**: La función ahora especifica explícitamente que su destinatario debe ser del tipo Baraja
  createCardPicker: function (this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  },
};

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

Ahora *TypeScript* sabe que `createCardPicker` espera ser llamado en un objeto `Deck`.
Eso significa que `this` es del tipo `Deck` ahora, no `any`, por lo que [`noImplicitThis`](/tsconfig#noImplicitThis) no causará ningún error.

### Parámetros `this` en devoluciones de llamada

También puedes encontrar errores con `this` en devoluciones de llamada, cuando pasas funciones a una biblioteca que luego las llamará.
Debido a que la biblioteca que llama a tu devolución de llamada la llamará como una función normal, `this` será `undefined`.
Con algo de trabajo, puedes usar los parámetros `this` para evitar errores con devoluciones de llamada también.
Primero, el autor de la biblioteca necesita anotar el tipo de la devolución de llamada con `this`:

```ts twoslash
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

`this: void` significa que `addClickListener` espera que `onclick` sea una función que no requiera un tipo `this`.
En segundo lugar, anota tu código de llamada con `this`:

```ts twoslash
// @strict: false
// @errors: 2345
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
interface Event {
  message: string;
}
declare const uiElement: UIElement;
// ---cut---
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

Con `this` anotado, haces explícito que `onMalClic` se debe llamar en una instancia de `Handler`.
Entonces *TypeScript* detectará que `addClickListener` requiere una función que tenga `this: void`.
Para corregir el error, cambia el tipo de `this`:

```ts twoslash
// @strict: false
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
interface Event {
  message: string;
}
declare const uiElement: UIElement;
// ---cut---
class Handler {
  info: string;
  onClickGood(this: void, e: Event) {
    // ¡No puedo usar `this` aquí porque es de tipo void!
    console.log('¡Hiciste clic!');
  }
}

let h = new Handler();
uiElement.addClickListener(h.onClickGood);
```

Debido a que `onClickGood` especifica su tipo `this` como `void`, es legal pasarlo a `addClickListener`.
Por supuesto, esto también significa que no puedes usar `this.info`.
Si quieres ambas, tendrás que usar una función de flecha:

```ts twoslash
// @strict: false
interface UIElement {
  addClickListener(onclick: (this: void, e: Event) => void): void;
}
interface Event {
  message: string;
}
declare const uiElement: UIElement;
// ---cut---
class Handler {
  info: string;
  onClickGood = (e: Event) => {
    this.info = e.message;
  };
}
```

Esto funciona porque las funciones de flecha usan el `this` externo, por lo que siempre las puedes pasar a algo que espera `this: void`.
La desventaja es que se crea una función de flecha por objeto de tipo `Handler`.
Los métodos, por otro lado, solo se crean una vez y se unen al prototipo de `Handler`.
Se comparten entre todos los objetos de tipo `Handler`.

## Sobrecargas

*JavaScript* inherentemente es un lenguaje muy dinámico.
No es raro que una sola función de *JavaScript* devuelva diferentes tipos de objetos en función de la forma de los argumentos pasados.

```ts twoslash
// @strict: false
let suits = ["hearts", "spades", "clubs", "diamonds"];

function pickCard(x: any): any {
  // Comprueba si estamos trabajando con un objeto/arreglo
  // si es así, nos dieron la baraja y elegiremos el naipe
  if (typeof x == "object") {
    let pickedCard = Math.floor(Math.random() * x.length);
    return pickedCard;
  }
  // De lo contrario, simplemente déjalos elegir el naipe
  else if (typeof x == "number") {
    let pickedSuit = Math.floor(x / 13);
    return { suit: suits[pickedSuit], card: x % 13 };
  }
}

let myDeck = [
  { suit: "diamonds", card: 2 },
  { suit: "spades", card: 10 },
  { suit: "hearts", card: 4 },
];

let pickedCard1 = myDeck[pickCard(myDeck)];
alert("card: " + pickedCard1.card + " of " + pickedCard1.suit);

let pickedCard2 = pickCard(15);
alert("card: " + pickedCard2.card + " of " + pickedCard2.suit);
```

Aquí, la función `pickCard` devolverá dos cosas diferentes según lo que el usuario haya pasado.
Si los usuarios pasan un objeto que representa la baraja, la función seleccionará el naipe.
Si el usuario elige el naipe, le decimos qué naipe ha elegido.
Pero, ¿cómo le describimos esto al sistema de tipos?

La respuesta es proporcionar múltiples tipos de funciones para la misma función como una lista de sobrecargas.
Esta lista es lo que usará el compilador para resolver las llamadas a funciones.
Creemos una lista de sobrecargas que describan lo que acepta nuestra `pickCard` y lo que devuelve.

```ts twoslash
let suits = ["hearts", "spades", "clubs", "diamonds"];

function pickCard(x: { suit: string; card: number }[]): number;
function pickCard(x: number): { suit: string; card: number };
function pickCard(x: any): any {
  // Comprueba si estamos trabajando con un objeto/arreglo
  // si es así, nos dieron la baraja y elegiremos el naipe
  if (typeof x == "object") {
    let pickedCard = Math.floor(Math.random() * x.length);
    return pickedCard;
  }
  // De lo contrario, simplemente déjalos elegir el naipe
  else if (typeof x == "number") {
    let pickedSuit = Math.floor(x / 13);
    return { suit: suits[pickedSuit], card: x % 13 };
  }
}

let myDeck = [
  { suit: "diamonds", card: 2 },
  { suit: "spades", card: 10 },
  { suit: "hearts", card: 4 },
];

let pickedCard1 = myDeck[pickCard(myDeck)];
alert("card: " + pickedCard1.card + " of " + pickedCard1.suit);

let pickedCard2 = pickCard(15);
alert("card: " + pickedCard2.card + " of " + pickedCard2.suit);
```

Con este cambio, las sobrecargas ahora nos dan llamadas de tipo comprobado a la función `pickCard`.

Para que el compilador elija la comprobación de tipo correcta, sigue un proceso similar al *JavaScript* subyacente.
Examina la lista de sobrecarga y, siguiendo con la primera sobrecarga, intenta llamar a la función con los parámetros proporcionados.
Si encuentra una coincidencia, elige esa sobrecarga como la sobrecarga correcta.
Por esta razón, es costumbre ordenar sobrecargas de más específicas a menos específicas.

Ten en cuenta que la parte `function pickCard(x): any` no forma parte de la lista de sobrecargas, por lo que solo tiene dos sobrecargas: una que toma un objeto y otra que toma un número.
Llamar a `pickCard` con cualquier otro tipo de parámetro podría causar un error.
