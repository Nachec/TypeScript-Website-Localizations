---
title: Declarar variable
layout: docs
permalink: /docs/handbook/variable-declarations.html
oneline: Cómo maneja TypeScript la declaración de variables
translatable: true
---

`let` y `const` son dos conceptos relativamente nuevos para declaraciones de variables en *JavaScript*.
[Como mencionamos anteriormente](/docs/handbook/basic-types.html#a-note-about-let), `let` es similar a `var` en algunos aspectos, pero permite a los usuarios evitar algunos de los " errores "que los usuarios encuentran en *JavaScript*.

`const` es un aumento de `let` en el sentido de que evita la reasignación a una variable.

Dado que *TypeScript* es una extensión de *JavaScript*, el lenguaje naturalmente admite `let` y `const`.
Aquí profundizaremos más en estas nuevas declaraciones y por qué son preferibles a `var`.

Si has utilizado *JavaScript* de forma descuidada, la siguiente sección podría ser una buena forma de refrescar tu memoria.
Si estás íntimamente familiarizado con todas las peculiaridades de las declaraciones `var` en *JavaScript*, puede que te resulte más fácil saltar adelante.

## Declaraciones `var`

La declaración de una variable en *JavaScript* tradicionalmente se ha hecho siempre con la palabra clave `var`.

```ts
var a = 10;
```

Como te habrás dado cuenta, acabamos de declarar una variable llamada `a` con el valor `10`.

También podemos declarar una variable dentro de una función:

```ts
function f() {
  var message = "Hello, world!";

  return message;
}
```

y también podemos acceder a esas mismas variables dentro de otras funciones:

```ts
function f() {
  var a = 10;
  return function g() {
    var b = a + 1;
    return b;
  };
}

var g = f();
g(); // returns '11'
```

En este ejemplo anterior, `g` capturó la variable `a` declarada en `f`.
En cualquier momento en el que se llame a `g`, el valor de `a` estará vinculado al valor de `a` en `f`.
Incluso si se llama a `g` una vez que se haya terminado de ejecutar `f`, podrás acceder y modificar `a`.

```ts
function f() {
  var a = 1;

  a = 2;
  var b = g();
  a = 3;

  return b;

  function g() {
    return a;
  }
}

f(); // returns '2'
```

## Reglas de alcance

Las declaraciones `var` tienen algunas reglas de alcance extrañas a las que se usan en otros lenguajes.
Toma el siguiente ejemplo:

```ts
function f(shouldInitialize: boolean) {
  if (shouldInitialize) {
    var x = 10;
  }

  return x;
}

f(true); // returns '10'
f(false); // returns 'undefined'
```

Algunos lectores podrían dar una doble vuelta a este ejemplo.
La variable `x` fue declarada *dentro del bloque `if`* y, sin embargo, pudimos acceder a ella desde fuera de ese bloque.
Esto se debe a que las declaraciones `var` son accesibles en cualquier lugar dentro de su función, módulo, espacio de nombres o alcance global que las contiene. todo lo cual repasaremos más adelante ⏤ independientemente del bloque contenedor.
Algunas personas llaman a esto *`var`-scoping* o *`function`-scoping*.
Los parámetros también tienen un ámbito de función.

Estas reglas de determinación del alcance pueden provocar varios tipos de errores.
Un problema que agravan es el hecho de que no es un error declarar la misma variable varias veces:

```ts
function sumMatrix(matrix: number[][]) {
  var sum = 0;
  for (var i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (var i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

Tal vez fue fácil detectar para algunos experimentados desarrolladores de *JavaScript*, pero el bucle `for` interno sobrescribirá accidentalmente la variable `i` porque `i` se refiere a la misma variable en el ámbito de la función.
Como ya saben los desarrolladores experimentados, tipos similares de errores se escabullen en las revisiones de código y pueden ser una fuente inagotable de frustración.

## Captura peculiaridades de variable

Tómate un segundo para adivinar cuál es el resultado del siguiente fragmento:

```ts
for (var i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

Para aquellos que no estén familiarizados, `setTimeout` intentará ejecutar una función después de una cierta cantidad de milisegundos (aunque esperando que cualquier otra cosa deje de ejecutarse).

¿Listo? Echa un vistazo:

```
10
10
10
10
10
10
10
10
10
10
```

Muchos desarrolladores de *JavaScript* están íntimamente familiarizados con este comportamiento, pero si te sorprende, ciertamente no estás solo.
La mayoría de la gente espera que la salida sea

```
0
1
2
3
4
5
6
7
8
9
```

¿Recuerdas lo que mencionamos anteriormente sobre la captura de variables?
Cada expresión de función que pasamos a `setTimeout` en realidad se refiere a la misma `i` del mismo ámbito.

Tomemos un minuto para considerar lo que eso significa.
`setTimeout` ejecutará una función después de algunos milisegundos, *pero solo* después de que el ciclo `for` se haya dejado de ejecutar;
Para cuando el ciclo `for` haya dejado de ejecutarse, el valor de `i` es `10`.
¡Así que cada vez que se llame a la función dada, imprimirá `10`!

Una solución común es utilizar una *IIFE*: una expresión de función invocada inmediatamente ⏤ para capturar `i` en cada iteración:

```ts
for (var i = 0; i < 10; i++) {
  // captura el estado actual de 'i'
  // invocando una función con su valor actual
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 100 * i);
  })(i);
}
```

Este patrón de aspecto extraño es bastante común.
La `i` en la lista de parámetros en realidad oculta a la `i` declarada en el bucle `for`, pero como los nombramos de la misma manera, no tuvimos que modificar demasiado el cuerpo del bucle.

## Declaraciones `let`

A estas alturas ya te habrás dado cuenta de que `var` tiene algunos problemas, que es precisamente la razón por la que se introdujeron las declaraciones `let`.
Aparte de la palabra clave utilizada, las declaraciones `let` se escriben de la misma manera que las declaraciones `var`.

```ts
let hello = "Hello!";
```

La diferencia clave no está en la sintaxis, sino en la semántica, en la que ahora nos sumergiremos.

## Alcance de bloque

Cuando una variable se declara usando `let`, usa lo que algunos llaman *alcance léxico* o *alcance de bloque*.
A diferencia de las variables declaradas con `var` cuyos alcances se filtran a su función contenedora, las variables de alcance de bloque no son visibles fuera de su bloque contenedor más cercano o del bucle `for`.

```ts
function f(input: boolean) {
  let a = 100;

  if (input) {
    // Todavía está bien hacer referencia a 'a'
    let b = a + 1;
    return b;
  }

  // Error: 'b' no existe aquí
  return b;
}
```

Aquí, tenemos dos variables locales `a` y `b`.
El alcance de `a` está limitado al cuerpo de `f` mientras que el alcance de `b` está limitado al bloque de la declaración `if` que lo contiene.

Las variables declaradas en una cláusula `catch` también tienen reglas de alcance similares.

```ts
try {
  throw "oh no!";
} catch (e) {
  console.log("Oh well.");
}

// Error: 'e' doesn't exist here
console.log(e);
```

Otra propiedad de las variables de alcance de bloque es que no se puede leer ni escribir en ellas antes de que se declaren.
Si bien estas variables están "presentes" en todo su ámbito, todos los puntos hasta su declaración son parte de su *zona muerta temporal*.
Esta es solo una sofisticada forma de decir que no puedes acceder a ellos antes de la declaración `let` y, afortunadamente, *TypeScript* te lo hará saber.

```ts
a++; // ilegal usar 'a' antes de que se declare;
let a;
```

Algo a tener en cuenta es que aún puede *capturar* una variable de ámbito de bloque antes de que sea declarada.
El único inconveniente es que es ilegal llamar a esa función antes de la declaración.
Si tienes como objetivo *ES2015*, un entorno de ejecución moderno arrojará un error; sin embargo, en este momento *TypeScript* es permisivo y no informará esto como un error.

```ts
function foo() {
  // bien para capturar 'a'
  return a;
}

// llamada ilegal a 'foo' antes de que se declare 'a'
// los entornos de ejecución deberían arrojar un error aquí
foo();

let a;
```

Para obtener más información sobre las zonas muertas temporales, consulta el contenido relevante en [Mozilla Developer Network](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let).

## Redeclaración y sombreado

Con las declaraciones `var`, mencionamos que no importa cuántas veces declaraste tus variables; solo tienes una.

```ts
function f(x) {
  var x;
  var x;

  if (true) {
    var x;
  }
}
```

En el ejemplo anterior, todas las declaraciones de `x` en realidad se refieren a la *misma* `x`, y esto es perfectamente válido.
Esto a menudo termina siendo una fuente de errores.
Afortunadamente, las declaraciones `let` no son tan indulgentes.

```ts
let x = 10;
let x = 20; // error: no se puede volver a declarar 'x' en el mismo ámbito
```

No es necesario que las variables tengan un alcance de bloque para que *TypeScript* nos diga que hay un problema.

```ts
function f(x) {
  let x = 100; // error: interfiere con la declaración de parámetros
}

function g() {
  let x = 100;
  var x = 100; // error: no puedes tener ambas declaraciones de 'x'
}
```

Eso no quiere decir que una variable de ámbito de bloque nunca pueda declararse con una variable de ámbito de función.
La variable de ámbito de bloque solo necesita declararse dentro de un bloque claramente diferente.

```ts
function f(condition, x) {
  if (condition) {
    let x = 100;
    return x;
  }

  return x;
}

f(false, 0); // returns '0'
f(true, 0); // returns '100'
```

Al acto de introducir un nuevo nombre en un ámbito más anidado se llama *ensombrecer*.
Es un arma de doble filo ya que puede introducir ciertos errores por sí solo en caso de ensombrecimiento accidental, al tiempo que previene ciertos errores.
Por ejemplo, imagina que hemos escrito nuestra función anterior `sumMatrix` usando variables `let`.

```ts
function sumMatrix(matrix: number[][]) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (let i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

Esta versión del bucle realmente realizará la suma correctamente porque la `i` del bucle interno ensombrece a la `i` del bucle externo.

Normalmente, se debe evitar el ensombrecimiento en aras de escribir un código más claro.
Si bien hay algunos escenarios en los que puede ser apropiado aprovecharlo, debes usar tu mejor criterio.

## Captura de variables con ámbito de bloque

Cuando abordamos por primera vez la idea de la captura de variables con la declaración `var`, analizamos brevemente cómo actúan las variables una vez capturadas.
Para dar una mejor intuición de esto, cada vez que se ejecuta un alcance, crea un "entorno" de variables.
Ese entorno y sus variables capturadas pueden existir incluso después de que todo dentro de su alcance haya se terminado de ejecutar.

```ts
function theCityThatAlwaysSleeps() {
  let getCity;

  if (true) {
    let city = "Seattle";
    getCity = function () {
      return city;
    };
  }

  return getCity();
}
```

Debido a que hemos capturado `city` desde su entorno, todavía podemos acceder a él a pesar de que el bloque `if` terminó de ejecutarse.

Recuerda que con nuestro ejemplo anterior de `setTimeout`, terminamos necesitando usar una *IIFE* para capturar el estado de una variable para cada iteración del bucle `for`.
En efecto, lo que estábamos haciendo era crear un nuevo entorno de variables para nuestras variables capturadas.
Eso fue un poco molesto, pero afortunadamente, nunca tendrás que volver a hacer eso en *TypeScript*.

Las declaraciones `let` tienen un comportamiento drásticamente diferente cuando se declaran como parte de un bucle.
En lugar de simplemente introducir un nuevo entorno al bucle en sí, estas declaraciones crean un nuevo alcance *por iteración*.
Dado que esto es lo que estábamos haciendo de todos modos con nuestro *IIFE*, podemos cambiar nuestro antiguo ejemplo `setTimeout` para usar una declaración `let`.

```ts
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

y como se esperaba, esto se imprimirá

```
0
1
2
3
4
5
6
7
8
9
```

## Declaraciones `const`

Las declaraciones `const` son otra forma de declarar variables.

```ts
const numLivesForCat = 9;
```

Son como declaraciones `let` pero, como su nombre lo indica, su valor no se puede cambiar una vez que están vinculados.
En otras palabras, tienen las mismas reglas de alcance que `let`, pero no puedes reasignarlas.

Esto no se debe confundir con la idea de que los valores a los que se refieren son *inmutables*.

```ts
const numLivesForCat = 9;
const kitty = {
  name: "Aurora",
  numLives: numLivesForCat,
};

// Error
kitty = {
  name: "Danielle",
  numLives: numLivesForCat,
};

// todo "bien"
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;
```

A menos que tomes medidas específicas para evitarlo, el estado interno de una variable `const` aún es modificable.
Afortunadamente, *TypeScript* te permite especificar que los miembros de un objeto son de "solo lectura" (`readonly`).
El [capítulo sobre interfaces](/docs/handbook/interfaces.html) tiene los detalles.

## `let` vs. `const`

Dado que tenemos dos tipos de declaraciones con semántica de alcance similar, es natural que nos preguntemos cuál usar.
Como la mayoría de las preguntas generales, la respuesta es: depende.

Aplicando el [principio de privilegio mínimo](https://wikipedia.org/wiki/Principle_of_least_privilege), todas las declaraciones que no sean las que planeas modificar deben usar `const`.
La razón es que si no es necesario escribir en una variable, otras personas que trabajen en el mismo código base no deberían poder escribir automáticamente en el objeto y deberán considerar si realmente necesitan reasignar a la variable.
El uso de `const` también hace que el código sea más predecible al razonar sobre el flujo de datos.

Usa tu mejor juicio y, si corresponde, consulta el asunto con el resto de tu equipo.

La mayor parte de este manual utiliza declaraciones `let`.

## Desestructuración

Otra característica de *ECMAScript 2015* que tiene *TypeScript* es la desestructuración.
Para obtener una referencia completa, consulta [el artículo sobre Mozilla Developer Network](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).
En esta sección, daremos una breve descripción.

## Desestructuración de arreglo

La forma más simple de desestructuración es la asignación de desestructuración de arreglos:

```ts
let input = [1, 2];
let [first, second] = input;
console.log(first); // salidas 1
console.log(second); // salidas 2
```

Esto crea dos nuevas variables llamadas `first` y `second`.
Esto es equivalente a usar la indexación, pero es mucho más conveniente:

```ts
first = input[0];
second = input[1];
```

La desestructuración también funciona con variables ya declaradas:

```ts
// intercambia variables
[first, second] = [second, first];
```

Y con parámetros a una función:

```ts
function f([first, second]: [number, number]) {
  console.log(first);
  console.log(second);
}
f([1, 2]);
```

Puedes crear una variable para los elementos restantes en una lista usando la sintaxis `...`:

```ts
let [first, ...rest] = [1, 2, 3, 4];
console.log(first); // salidas 1
console.log(rest); // outputs [ 2, 3, 4 ]
```

Por supuesto, dado que esto es *JavaScript*, puedes ignorar los elementos finales que no te interesan:

```ts
let [first] = [1, 2, 3, 4];
console.log(first); // salidas 1
```

U otros elementos:

```ts
let [, second, , fourth] = [1, 2, 3, 4];
console.log(second); // salidas 2
console.log(fourth); // outputs 4
```

## Desestructuración de tuplas

Las tuplas se pueden desestructurar como arreglos; las variables de desestructuración obtienen los tipos de los elementos de tupla correspondientes:

```ts
let tuple: [number, string, boolean] = [7, "hello", true];

let [a, b, c] = tuple; // a: number, b: string, c: boolean
```

Es un error desestructurar una tupla más allá del rango de sus elementos:

```ts
let [a, b, c, d] = tuple; // Error, ningún elemento en el índice 3
```

Al igual que con los arreglos, puedes desestructurar el resto de la tupla con `...`, para obtener una tupla más corta:

```ts
let [a, ...bc] = tuple; // bc: [string, boolean]
let [a, b, c, ...d] = tuple; // d: [], the empty tuple
```

O ignora los elementos finales u otros elementos:

```ts
let [a] = tuple; // a: number
let [, b] = tuple; // b: string
```

## Desestructuración de objetos

También puedes desestructurar objetos:

```ts
let o = {
  a: "foo",
  b: 12,
  c: "bar",
};
let { a, b } = o;
```

Esto crea nuevas variables `a` y `b` de `o.a` y `o.b`.
Ten en cuenta que puedes omitir `c` si no la necesitas.

Al igual que la desestructuración de arreglos, puedes tener una asignación sin declaración:

```ts
({ a, b } = { a: "baz", b: 101 });
```

Observa que tuvimos que rodear esta declaración entre paréntesis.
*JavaScript* normalmente analiza un `{` como el inicio del bloque.

Puedes crear una variable para los elementos restantes en un objeto usando la sintaxis `...`:

```ts
let { a, ...passthrough } = o;
let total = passthrough.b + passthrough.c.length;
```

### Renombrar propiedades

También puedes dar diferentes nombres a las propiedades:

```ts
let { a: newName1, b: newName2 } = o;
```

Aquí la sintaxis comienza a volverse confusa.
Puedes leer `a: newName1` as "`a` as `newName1`".
La dirección es de izquierda a derecha, como si hubieras escrito:

```ts
let newName1 = o.a;
let newName2 = o.b;
```

Confusamente, los dos puntos aquí *no* indican el tipo.
El tipo, si lo especifica, aún se debe escribir después de toda la desestructuración:

```ts
let { a: newName1, b: newName2 }: { a: string; b: number } = o;
```

### Valores predeterminados

Los valores predeterminados te permiten especificar un valor predeterminado en caso de que una propiedad no esté definida:

```ts
function keepWholeObject(wholeObject: { a: string; b?: number }) {
  let { a, b = 1001 } = wholeObject;
}
```

En este ejemplo, `b?` Indica que `b` es opcional, por lo que puede ser `undefined`.
`keepWholeObject` ahora tiene una variable para `wholeObject` así como las propiedades `a` y `b`, incluso si `b` no está definido.

## Declaración de función

La desestructuración también funciona en declaraciones de funciones.
Para casos simples, esto es sencillo:

```ts
type C = { a: string; b?: number };
function f({ a, b }: C): void {
  // ...
}
```

Pero especificar valores predeterminados es más común para los parámetros, y obtener valores predeterminados correctos con la desestructuración puede ser complicado.
En primer lugar, debes recordar poner el patrón antes del valor predeterminado.

```ts
function f({ a = "", b = 0 } = {}): void {
  // ...
}
f();
```

> El fragmento de arriba es un ejemplo de inferencia de tipo, explicado anteriormente en el manual.

Luego, debes recordar dar un valor predeterminado para las propiedades opcionales en la propiedad desestructurada en lugar del iniciador principal.
Recuerda que `C` se definió con `b` opcional:

```ts
function f({ a, b = 0 } = { a: "" }): void {
  // ...
}
f({ a: "yes" }); // ok, default b = 0
f(); // bien, predeterminado a {a: ""}, que luego tiene un valor predeterminado de b = 0
f({}); // error, se requiere 'a' si proporciona un argumento
```

Usa la desestructuración con cuidado.
Como demuestra el ejemplo anterior, todo lo que no sea la expresión de desestructuración más simple es confuso.
Esto especialmente es cierto con la desestructuración profundamente anidada, que *realmente* se vuelve difícil de entender incluso sin acumular cambios de nombre, valores predeterminados y anotaciones de tipo.
Trata de que las expresiones de desestructuración sean pequeñas y simples.
Siempre puedes escribir las asignaciones que te generaría la desestructuración.

## Propagar

El operador de propagación es lo opuesto a la desestructuración.
Te permite extender un arreglo a otro arreglo, o un objeto a otro objeto.
Por ejemplo:

```ts
let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];
```

Esto le da a `bothPlus` el valor `[0, 1, 2, 3, 4, 5]`.
La difusión crea una copia superficial de `first` y `second`.
No se modifican con la propagación.

También puedes esparcir objetos:

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { ...defaults, food: "rich" };
```

Ahora `search` es `{ food: "rich", price: "$$", ambiance: "noisy" }`.
La distribución de objetos es más compleja que la distribución de arreglos.
Al igual que la distribución de arreglos, procede de izquierda a derecha, pero el resultado sigue siendo un objeto.
Esto significa que las propiedades que vienen más adelante en el objeto de distribución sobrescriben las propiedades que vienen antes.
Entonces, si modificamos el ejemplo anterior para propagar al final:

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { food: "rich", ...defaults };
```

Luego, la propiedad `food` en `defaults` sobrescribe `food: "rich"`, que no es lo que queremos en este caso.

La propagación de objetos también tiene un par de otros límites sorprendentes.
Primero, solo incluye un objeto
[propiedades enumerables propias](https://developer.mozilla.org/docs/Web/JavaScript/Enumerability_and_ownership_of_properties).
Básicamente, eso significa que pierdes métodos cuando propagas instancias de un objeto:

```ts
class C {
  p = 12;
  m() {}
}
let c = new C();
let clone = { ...c };
clone.p; // Bien
clone.m(); // ¡error!
```

En segundo lugar, el compilador de *TypeScript* no permite la propagación de parámetros del tipo de funciones genéricas.
Esa característica se espera en futuras versiones del lenguaje.
