---
title: TypeScript para programadores de Java/C#
short: TS para programadores Java/C#
layout: docs
permalink: /docs/handbook/typescript-in-5-minutes-oop.html
oneline: Aprende TypeScript si tienes experiencia en lenguajes orientados a objetos
---

*TypeScript* es una opción popular para los programadores acostumbrados a otros lenguajes con tipado estático, como *C#* y *Java*.

El sistema de tipos de *TypeScript* ofrece muchos de los mismos beneficios, como una mejor compleción del código, una detección más temprana de errores y una comunicación más clara entre las partes de tu programa.
Si bien *TypeScript* proporciona muchas características familiares para estos desarrolladores, vale la pena dar un paso atrás para ver cómo *JavaScript* (y por lo tanto *TypeScript*) difieren de los lenguajes de *POO* tradicionales.
Comprender estas diferencias te ayudará a escribir mejor código *JavaScript* y evitará los errores comunes en los que pueden caer los programadores que pasan directamente de *C#*/*Java* a *TypeScript*.

## Coaprendizaje de *JavaScript*

Si ya estás familiarizado con *JavaScript*, pero principalmente eres un programador de *Java* o *C#*, esta página de introducción puede ayudarte a explicar algunas de las ideas equivocadas y trampas comunes a las que podrías ser susceptible.
Algunas de las formas en que los tipos de modelos de *TypeScript* son bastante diferentes de *Java* o *C#*, y es importante tenerlas en cuenta al aprender *TypeScript*.

Si eres un programador de *Java* o *C#* que es nuevo en *JavaScript* en general, te recomendamos que primero aprendas un poco de *JavaScript sin* tipos para comprender el comportamiento en el entorno de ejecución de *JavaScript*.
Debido a que *TypeScript* no cambia la forma en que se ejecuta tu código, aún tendrás que aprender cómo funciona *JavaScript* para escribir código que realmente haga algo.

Es importante recordar que *TypeScript* usa el mismo entorno de ejecución que *JavaScript*, por lo que cualquier recurso sobre cómo lograr un comportamiento específico en el entorno de ejecución (convertir una cadena en un número, mostrar una alerta, escribir un archivo en el disco, etc.) siempre se aplicará igualmente bien a Programas *TypeScript*.
¡No te limites a recursos específicos de *TypeScript*!

## Repensar la clase

*C#* y *Java* son lo que podríamos llamar lenguajes de *POO obligatorios*.
En estos lenguajes, la *clase* es la unidad básica de organización del código, y también el contenedor básico de todos los datos *y* comportamiento en el entorno de ejecución.
Forzar que toda la funcionalidad y los datos se mantengan en clases puede ser un buen modelo de dominio para algunos problemas, pero no todos los dominios *necesitan* estar representados de esta manera.

### Funciones y datos libres

En *JavaScript*, las funciones pueden vivir en cualquier lugar y los datos se pueden pasar libremente sin estar dentro de una `clase` o `estructura` predefinida.
Esta flexibilidad es extremadamente poderosa.
Las funciones "libres" (las que no están asociadas con una clase) que trabajan sobre datos sin una jerarquía *POO* implícita tienden a ser el modelo preferido para escribir programas en *JavaScript*.

### Clases estáticas

Además, ciertas construcciones de *C#* y *Java*, como `singletons` y clases estáticas, son innecesarias en *TypeScript*.

## *POO*  en  *TypeScript*

Dicho esto, ¡aún puedes usar las clases si quieres!
Algunos problemas son adecuados para ser resueltos por una jerarquía *POO* tradicional, y el soporte de *TypeScript* para clases de *JavaScript* hará que estos modelos sean aún más poderosos.
*TypeScript* admite muchos patrones comunes, como la implementación de interfaces, herencia y métodos estáticos.

Cubriremos las clases más adelante en esta guía.

## Repensar los tipos

La comprensión de *TypeScript* de un *tipo* en realidad es bastante diferente de la de *C#* o *Java*.
Exploremos algunas diferencias.

### Sistema de tipo nominal materializado

En *C#* o *Java*, cualquier valor u objeto dado tiene un tipo exacto: ya sea `null`, un tipo primitivo o una clase conocida.
Podemos llamar a métodos como `value.GetType()` o `value.getClass()` para consultar el tipo exacto en el entorno de ejecución.
La definición de este tipo residirá en una clase en algún lugar con algún nombre, y no podemos usar dos clases con formas similares una en lugar de la otra a menos que haya una relación de herencia explícita o una interfaz común implementada.

Estos aspectos describen un sistema de tipo *materializado, nominal*.
Los tipos que escribimos en el código están presentes en el entorno de ejecución y los tipos están relacionados mediante sus declaraciones, no sus estructuras.

### Tipos como conjuntos

En *C#* o *Java*, es significativo pensar en una correspondencia uno a uno entre los tipos del entorno de ejecución y sus declaraciones en tiempo de compilación.

En *TypeScript*, es mejor pensar en un tipo como un *conjunto de valores* que comparten algo en común.
Dado que los tipos son solo conjuntos, un valor particular puede pertenecer a *muchos* conjuntos al mismo tiempo.

Una vez que empiezas a pensar en los tipos como conjuntos, ciertas operaciones se vuelven muy naturales.
Por ejemplo, en *C#*, es incómodo pasar un valor que es *ya sea* un `string` o `int`, porque no hay un solo tipo que represente este tipo de valor.

En *TypeScript*, esto se vuelve muy natural una vez que te das cuenta de que cada tipo es solo un conjunto.
¿Cómo se describe un valor que pertenece al conjunto `string` o al conjunto `number`?
Simplemente pertenece a la *unión* de esos conjuntos: `string | number`.

*TypeScript* proporciona una serie de mecanismos para trabajar con tipos de una manera teórica de conjuntos, y los encontrarás más intuitivos si piensas en los tipos como conjuntos.

### Tipos estructurales borrados

En *TypeScript*, los objetos *no* son de un solo tipo exacto.
Por ejemplo, si construimos un objeto que satisface una interfaz, podemos usar ese objeto donde se espera esa interfaz aunque no haya una relación declarativa entre los dos.

```ts twoslash
interface Pointlike {
  x: number;
  y: number;
}
interface Named {
  name: string;
}

function logPoint(point: Pointlike) {
  console.log("x = " + point.x + ", y = " + point.y);
}

function logName(x: Named) {
  console.log("Hello, " + x.name);
}

const obj = {
  x: 0,
  y: 0,
  name: "Origen",
};

logPoint(obj);
logName(obj);
```

El sistema de tipos de *TypeScript* es *estructural*, no nominal: Podemos usar `obj` como un `Pointlike` porque tiene propiedades `x` e `y` que ambas son números.
Las relaciones entre tipos están determinadas por las propiedades que contienen, no por si se declararon con alguna relación en particular.

El sistema de tipos de *TypeScript* tampoco está *materializado*: No hay nada en el entorno de ejecución que nos diga que `obj` es `Pointlike`.
De hecho, el tipo `Pointlike` no está presente *en ninguna forma* en el entorno de ejecución.

Volviendo a la idea de *tipos como conjuntos*, podemos pensar en `obj` como un miembro tanto del conjunto de valores `Pointlike` como del conjunto de valores `Named`.

### Consecuencias de la tipificación estructural

Los programadores de *POO* a menudo se sorprenden por dos aspectos particulares de la tipificación estructural.

#### Tipos vacíos

La primera es que el *tipo vacío* (`empty`) parece desafiar las expectativas:

```ts twoslash
class Empty {}

function fn(arg: Empty) {
  // ¿hace algo?
}

// No hay error, pero esto no es un 'Empty'?
fn({ k: 10 });
```

*TypeScript* determina si la llamada a `fn` aquí es válida al ver si el argumento proporcionado es un `Empty` válido.
Lo hace examinando la *estructura* de `{ k: 10 }` y `class Empty { }`.
Podemos ver que `{ k: 10 }` tiene *todas* las propiedades que tiene `Empty`, porque `Empty` no tiene propiedades.
Por lo tanto, esta es una llamada válida.

Esto puede parecer sorprendente, pero en última instancia es una relación muy similar a la que se aplica en los lenguajes *POO* nominales.
Una subclase no puede *eliminar* una propiedad de su clase base, porque hacerlo destruiría la relación de subtipo natural entre la clase derivada y su base.
Los sistemas de tipos estructurales simplemente identifican implícitamente esta relación al describir subtipos en términos de tener propiedades de tipos compatibles.

#### Tipos idénticos

Otra frecuente fuente de sorpresas viene con tipos idénticos:

```ts
class Car {
  drive() {
    // pisa el acelerador
  }
}
class Golfer {
  drive() {
    // golpea fuerte la pelota
  }
}

// ¿No hay error?
let w: Car = new Golfer();
```

Nuevamente, esto no es un error porque las *estructuras* de estas clases son las mismas.
Si bien esto puede parecer una potencial fuente de confusión, en la práctica, las clases idénticas que no deberían estar relacionadas no son comunes.

Aprenderemos más sobre cómo las clases se relacionan entre sí en el capítulo Clases.

### Reflexión

Los programadores de *POO* están acostumbrados a poder consultar el tipo de cualquier valor, incluso uno genérico:

```csharp
// C#
static void LogType<T>() {
    Console.WriteLine(typeof(T).Name);
}
```

Debido a que el sistema de tipos de *TypeScript* se borra por completo, la información sobre p. ej. la creación de la instancia de un parámetro de tipo genérico no está disponible en el entorno de ejecución.

*JavaScript* tiene algunos primitivos limitados como `typeof` e `instanceof`, pero recuerda que estos operadores todavía están trabajando en los valores tal como existen en el código de salida del tipo borrado.
Por ejemplo, `typeof (new Car())` será `"object"`, no `Car` o `"Car"`.

## Próximos pasos

Esta fue una breve descripción general de la sintaxis y las herramientas que se utilizan todos los días en *TypeScript*. A partir de aquí puedes:

- Leer el manual completo [de principio a fin](/docs/handbook/intro.html) (30 min)
- Explorar los [ejemplos en *Playground*](/play#show-examples)
