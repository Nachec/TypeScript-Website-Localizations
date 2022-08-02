---
title: Compatibilidad de tipo
layout: docs
permalink: /docs/handbook/type-compatibility.html
oneline: Cómo funciona la verificación de tipos en TypeScript
translatable: true
---

La compatibilidad de tipos en *TypeScript* se basa en subtipos estructurales.
La tipificación estructural es una forma de relacionar tipos basándose únicamente en sus miembros.
Esto contrasta con el tipado nominal.
Considera el siguiente código:

```ts
interface Pet {
  name: string;
}

class Dog {
  name: string;
}

let pet: Pet;
// Bien, debido al tipado estructural
pet = new Dog();
```

En lenguajes de tipado nominal como *C#* o *Java*, el código equivalente sería un error porque la clase `Dog` no se describe explícitamente como un implementador de la interfaz `Pet`.

El sistema de tipos estructurales de *TypeScript* se diseñó en función de cómo se escribe normalmente el código *JavaScript*.
Debido a que *JavaScript* utiliza ampliamente objetos anónimos como expresiones de función y literales de objeto, es mucho más natural representar los tipos de relaciones que se encuentran en las bibliotecas de *JavaScript* con un sistema de tipos estructurales en lugar de uno nominal.

## Una nota sobre solidez

El sistema de tipos de *TypeScript* permite que ciertas operaciones que no se pueden conocer en tiempo de compilación sean seguras. Cuando un sistema de tipos tiene esta propiedad, se dice que no es "sólido". Los lugares donde *TypeScript* permite un comportamiento inadecuado se consideraron cuidadosamente y, a lo largo de este documento, explicaremos dónde ocurren y los escenarios motivadores detrás de ellos.

## Empecemos

La regla básica para el sistema de tipos estructurales de *TypeScript* es que `x` es compatible con `y` si `y` tiene al menos los mismos miembros que `x`. Por ejemplo, considera el siguiente código que involucra una interfaz llamada `Pet` que tiene una propiedad `name`:

```ts
interface Pet {
  name: string;
}

let pet: Pet;
// el tipo inferido de dog es { name: string; owner: string; }
let dog = { name: "Lassie", owner: "Rudd Weatherwax" };
pet = dog;
```

Para comprobar si se puede asignar `dog` a `pet`, el compilador comprueba cada propiedad de `pet` para encontrar una propiedad compatible correspondiente en `dog`.
En este caso, `dog` debe tener un miembro llamado `name` que sea una cadena. Lo hace, por lo que la asignación está permitida.

La misma regla para la asignación se usa cuando se verifican los argumentos de llamadas a funciones:

```ts
interface Pet {
  name: string;
}

let dog = { name: "Lassie", owner: "Rudd Weatherwax" };

function greet(pet: Pet) {
  console.log("Hello, " + pet.name);
}
greet(dog); // Bien
```

Ten en cuenta que `dog` tiene una propiedad de `owner` adicional, pero esto no crea un error.
Solo los miembros del tipo de destino (`Pet` en este caso) se consideran al verificar la compatibilidad.

Este proceso de comparación procede de forma recursiva, explorando el tipo de cada miembro y submiembro.

## Comparar dos funciones

Si bien comparar tipos primitivos y tipos de objetos es relativamente sencillo, la cuestión de qué tipos de funciones se deben considerar compatibles es un poco más complicada.
Comencemos con un ejemplo básico de dos funciones que difieren solo en sus listas de parámetros:

```ts
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // Bien
x = y; // Error
```

Para comprobar si `x` se puede asignar a `y`, primero miramos la lista de parámetros.
Cada parámetro en `x` debe tener un parámetro correspondiente en `y` con un tipo compatible.
Ten en cuenta que no se consideran los nombres de los parámetros, solo sus tipos.
En este caso, cada parámetro de `x` tiene un parámetro compatible correspondiente en `y`, por lo que la asignación está permitida.

La segunda asignación es un error, porque `y` tiene un segundo parámetro requerido que `x` no tiene, por lo que la asignación no está permitida.

Quizás te preguntes por qué permitimos 'descartar' parámetros como en el ejemplo `y = x`.
La razón por la que se permite esta asignación es que ignorar los parámetros de funciones adicionales es bastante común en *JavaScript*.
Por ejemplo, `Array#forEach` proporciona tres parámetros a la función de devolución de llamada: el elemento del arreglo, su índice y el arreglo que lo contiene.
Sin embargo, es muy útil proporcionar una devolución de llamada que solo usa el primer parámetro:

```ts
let items = [1, 2, 3];

// No fuerces estos parámetros adicionales
items.forEach((item, index, array) => console.log(item));

// ¡Debería estar bien!
items.forEach((item) => console.log(item));
```

Ahora veamos cómo se tratan los tipos de retorno, usando dos funciones que se diferencian solo por su tipo de retorno:

```ts
let x = () => ({ name: "Alice" });
let y = () => ({ name: "Alice", location: "Seattle" });

x = y; // Bien
y = x; // Error, porque x() carece de una propiedad location
```

El sistema de tipos exige que el tipo de retorno de la función de origen sea un subtipo del tipo de retorno del tipo destino.

## Función Parámetro Bivarianza

Al comparar los tipos de parámetros de función, la asignación se realiza correctamente si el parámetro de origen se puede asignar al parámetro de destino o viceversa.
Esto no es correcto porque una persona que llama podría terminar recibiendo una función que toma un tipo más especializado, pero invoca a la función con un tipo menos especializado.
En la práctica, este tipo de error es poco común y permitirlo habilita muchos patrones comunes de *JavaScript*. Un breve ejemplo:

```ts
enum EventType {
  Mouse,
  Keyboard,
}

interface Event {
  timestamp: number;
}
interface MyMouseEvent extends Event {
  x: number;
  y: number;
}
interface MyKeyEvent extends Event {
  keyCode: number;
}

function listenEvent(eventType: EventType, handler: (n: Event) => void) {
  /* ... */
}

// Insensible, pero útil y común
listenEvent(EventType.Mouse, (e: MyMouseEvent) => console.log(e.x + "," + e.y));

// Alternativas indeseables en presencia de solidez
listenEvent(EventType.Mouse, (e: Event) =>
  console.log((e as MyMouseEvent).x + "," + (e as MyMouseEvent).y)
);
listenEvent(EventType.Mouse, ((e: MyMouseEvent) =>
  console.log(e.x + "," + e.y)) as (e: Event) => void);

// Aún no permitido (error claro). Seguridad de tipos aplicada para tipos totalmente incompatibles
listenEvent(EventType.Mouse, (e: number) => console.log(e));
```

Puedes hacer que *TypeScript* genere errores cuando esto suceda a través de la marca del compilador [`strictFunctionTypes`](/tsconfig#strictFunctionTypes).

## Parámetros opcionales y parámetros `rest`

Al comparar funciones para compatibilidad, los parámetros opcionales y obligatorios son intercambiables.
Los parámetros opcionales adicionales del tipo de la fuente no son un error, y los parámetros opcionales del tipo de destino sin los parámetros correspondientes en el tipo fuente no son un error.

Cuando una función tiene un parámetro `rest`, se trata como si fuera una serie infinita de parámetros opcionales.

Esto no es correcto desde la perspectiva del sistema de tipos, pero desde el punto de vista del entorno de ejecución, la idea de un parámetro opcional generalmente no se aplica bien, ya que pasar `undefined` en esa posición es equivalente para la mayoría de las funciones.

El ejemplo motivador es el patrón común de una función que toma una devolución de llamada y la invoca con un número de argumentos predecible (para el programador) pero desconocido (para el sistema de tipos):

```ts
function invokeLater(args: any[], callback: (...args: any[]) => void) {
  /* ... Invoca a la devolución de llamada con 'args' ... * /
}

// Insensato - invokeLater "podría" proporcionar cualquier número de argumentos
invokeLater([1, 2], (x, y) => console.log(x + ", " + y));

// Confuso (x e y realmente son necesarios) e indescifrable
invokeLater([1, 2], (x?, y?) => console.log(x + ", " + y));
```

## Funciones con sobrecargas

Cuando una función tiene sobrecargas, cada sobrecarga en el tipo de origen debe coincidir con una firma compatible en el tipo de destino.
Esto asegura que la función de destino se pueda llamar en todas las mismas situaciones que la función de origen.

## Enumeraciones

Las enumeraciones son compatibles con los números y los números son compatibles con las enumeraciones. Los valores de enumeración de diferentes tipos de enumeración se consideran incompatibles. Por ejemplo:

```ts
enum Status {
  Ready,
  Waiting,
}
enum Color {
  Red,
  Blue,
  Green,
}

let status = Status.Ready;
status = Color.Green; // Error
```

## Clases

Las clases funcionan de manera similar a los tipos e interfaces de objetos literales con una excepción: tienen un tipo estático y uno de instancia.
Al comparar dos objetos de un tipo de clase, solo se comparan los miembros de la instancia.
Los miembros y constructores estáticos no afectan la compatibilidad.

```ts
class Animal {
  feet: number;
  constructor(name: string, numFeet: number) {}
}

class Size {
  feet: number;
  constructor(numFeet: number) {}
}

let a: Animal;
let s: Size;

a = s; // Bien
s = a; // Bien
```

## Miembros privados y protegidos en clases

Los miembros privados y protegidos de una clase afectan su compatibilidad.
Cuando se comprueba la compatibilidad de una instancia de una clase, si el tipo de destino contiene un miembro privado, el tipo de origen también debe contener un miembro privado que se originó en la misma clase.
Asimismo, lo mismo se aplica a una instancia con un miembro protegido.
Esto permite que una clase sea compatible con la asignación de su superclase, pero *no* con clases de una jerarquía de herencia diferente que de otra manera tienen la misma forma.

## Genéricos

Dado que *TypeScript* es un sistema de tipos estructurales, los parámetros de tipos solo afectan al tipo resultante cuando se consumen como parte del tipo de un miembro. Por ejemplo:

```ts
interface Empty<T> {}
let x: Empty<number>;
let y: Empty<string>;

x = y; // Bien, porque y coincide con la estructura de x
```

En lo anterior, `x` e `y` son compatibles porque sus estructuras no usan el argumento de tipo de manera diferenciadora.
Cambiar este ejemplo agregando un miembro a `Empty<T>` muestra cómo funciona esto:

```ts
interface NotEmpty<T> {
  data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;

x = y; // Error, porque x e y no son compatibles
```

De esta manera, un tipo genérico que tiene sus argumentos de tipo especificados actúa como un tipo no genérico.

Para los tipos genéricos que no tienen sus argumentos de tipo especificados, la compatibilidad se verifica especificando `any` en lugar de todos los argumentos de tipo no especificados.
A continuación, se comprueba la compatibilidad de los tipos resultantes, al igual que en el caso no genérico.

Por ejemplo:

```ts
let identity = function <T>(x: T): T {
  // ...
};

let reverse = function <U>(y: U): U {
  // ...
};

identity = reverse; // Bien, porque (x: any) => any coincide con (y: any) => any
```

## Temas avanzados

## Subtipo vs Asignación

Hasta ahora, hemos utilizado "compatible", que no es un término definido en la especificación del lenguaje.
En *TypeScript*, hay dos tipos de compatibilidad: subtipo y asignación.
Estos difieren solo en que la asignación extiende la compatibilidad de subtipos con las reglas para permitir la asignación desde y hacia `any`, y hacia y desde `enum` con los valores numéricos correspondientes.

Los diferentes lugares del lenguaje utilizan uno de los dos mecanismos de compatibilidad, según la situación.
A efectos prácticos, la compatibilidad de tipos viene dictada por la compatibilidad de asignaciones, incluso en los casos de las cláusulas `implements` y `extends`.

## Asignabilidad de `any`, `unknown`, `object`, `void`, `undefined`, `null` y `never`

La siguiente tabla resume la asignabilidad entre algunos tipos abstractos.
Las filas indican a qué se puede asignar cada uno, las columnas indican qué se les puede asignar.
Un "<span class='black-tick'>✓</span>" indica una combinación que es compatible solo cuando [`strictNullChecks`](/tsconfig#strictNullChecks) está desactivado.

<!-- Esta es la forma renderizada de https://github.com/microsoft/TypeScript-Website/pull/1490 -->
<table class="data">
<thead>
<tr>
<th></th>
<th align="center">any</th>
<th align="center">unknown</th>
<th align="center">object</th>
<th align="center">void</th>
<th align="center">undefined</th>
<th align="center">null</th>
<th align="center">never</th>
</tr>
</thead>
<tbody>
<tr>
<td>any ▹</td>
<td align="center"></td>
<td align="center"><span class="blue-tick" style="
    color: #007aff;
">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>unknown ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>object ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>void ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>undefined ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>null ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>never ▹</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
</tr>
</tbody>
</table>

Reiterando [Los conceptos básicos](/handbook/2/basic-types.html):

- Todo es asignable a sí mismo.
- `any` y `unknown` son lo mismo en términos de lo que se les puede asignar, diferentes en que `unknown` no se puede asignar a nada excepto a `any`.
- `unknown` y `never` son inversos entre sí.
  Todo se puede asignar a `unknown`, `never` se puede asignar a todo.
  Nada se puede asignar a `never`, `unknown` no se puede asignar a nada (excepto a `any`).
- `void` no es asignable a o desde nada, con las siguientes excepciones: `any`, `unknown`, `never`, `undefined` y `null` (si [`strictNullChecks`](/tsconfig#strictNullChecks) está desactivado, consulta la tabla para obtener más detalles).
- Cuando [`strictNullChecks`](/tsconfig#strictNullChecks) está desactivado, `null` y `undefined` son similares a `never`: asignables a la mayoría de los tipos, la mayoría de los tipos no son asignables a ellos.
  Son asignables entre sí.
- Cuando [`strictNullChecks`](/tsconfig#strictNullChecks) está activado, `null` y `undefined` se comportan más como `void`: no se puede asignar a ni desde nada, excepto para `any`, `unknown`, `never` y `void` (`undefined` siempre se puede asignar a `void`).
