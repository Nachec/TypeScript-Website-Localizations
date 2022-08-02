---
title: TypeScript para el nuevo programador
short: TypeScript para el nuevo programador
layout: docs
permalink: /docs/handbook/typescript-from-scratch.html
oneline: Aprende TypeScript desde cero
---

Felicitaciones por elegir *TypeScript* como uno de tus primeros lenguajes — ¡ya estás tomando buenas decisiones!

Probablemente ya hayas escuchado que *TypeScript* es un "sabor" o "variante" de *JavaScript*.
La relación entre *TypeScript* (*TS*) y *JavaScript* (*JS*) es bastante única entre los lenguajes de programación modernos, por lo que aprender más sobre esta relación te ayudará a comprender cómo se agrega *TypeScript* a *JavaScript*.

## ¿Qué es JavaScript? Una breve historia

*JavaScript* (también conocido como *ECMAScript*) comenzó su vida como un lenguaje de programación simple para navegadores.
En el momento en que se inventó, se esperaba que se usara para pequeños fragmentos de código incrustados en una página web; escribir más de unas pocas docenas de líneas de código habría sido algo inusual.
Debido a esto, los primeros navegadores web ejecutaban dicho código con bastante lentitud.
Sin embargo, con el tiempo, *JS* se hizo cada vez más popular y los desarrolladores web comenzaron a usarlo para crear experiencias interactivas.

Los desarrolladores de navegadores web respondieron a este aumento en el uso de *JS* optimizando sus motores de ejecución (compilación dinámica) y ampliando lo que se podía hacer con ellos (agregando *API*), lo que a su vez hizo que los desarrolladores web lo usaran aún más.
En los sitios web modernos, tu navegador ejecuta con frecuencia aplicaciones que abarcan cientos de miles de líneas de código.
Se trata de un crecimiento prolongado y gradual de "la web", comenzando como una simple red de páginas estáticas y evolucionando hacia una plataforma para aplicaciones ricas de todo tipo.

Más que esto, *JS* se ha vuelto lo suficientemente popular como para usarse fuera del contexto de los navegadores, como la implementación de servidores *JS* usando *node.js*.
La naturaleza de "ejecutar en cualquier lugar" de *JS* lo convierte en una opción atractiva para el desarrollo multiplataforma.
¡Hay muchos desarrolladores en estos días que *sólo* usan *JavaScript* para programar toda su pila!

En resumen, tenemos un lenguaje que fue diseñado para usos rápidos y luego se convirtió en una herramienta completa para escribir aplicaciones con millones de líneas.
Cada lenguaje tiene sus propias *peculiaridades* — rarezas y sorpresas, y el humilde comienzo de *JavaScript* hace que tenga *muchas* de estas. Algunos ejemplos:

- El operador de igualdad de *JavaScript* (`==`) *coacciona* sus argumentos, lo que lleva a un comportamiento inesperado:

  ```js
  if ("" == 0) {
    // ¡Ya está! ¿Pero por qué?
  }
  if (1 < x < 3) {
    // ¡True para cualquier valor de x!
  }
  ```

- *JavaScript* también permite acceder a propiedades que no están presentes:

  ```js
  const obj = { width: 10, height: 15 };
  // ¿Por qué esto es NaN? ¡La ortografía es difícil!
  const area = obj.width * obj.heigth;
  ```

La mayoría de los lenguajes de programación arrojarían un error cuando ocurre este tipo de errores, algunos lo harían durante la compilación ⏤ antes de que se ejecute cualquier código.
Al escribir programas pequeños, estas peculiaridades son molestas pero manejables; al escribir aplicaciones con cientos o miles de líneas de código, estas constantes sorpresas son un grave problema.

## *TypeScript*: Un comprobador de tipo estático

Anteriormente dijimos que algunos lenguajes no permitirían que esos programas con errores se ejecuten en absoluto.
La detección de errores en el código sin ejecutarlo se denomina *comprobación estática*.
La determinación de qué es un error y qué no, se basa en los tipos de valores en los que se opera y se conoce como comprobación estática de *tipo*.

*TypeScript* comprueba un programa en busca de errores antes de la ejecución, y lo hace en función de los *tipos de valores*, es un *comprobador estático de tipo*.
Por ejemplo, el último fragmento de código anterior tiene un error debido al `type` de `obj`.
Aquí está el error que *TypeScript* encontró:

```ts twoslash
// @errors: 2551
const obj = { width: 10, height: 15 };
const area = obj.width * obj.heigth;
```

### Un superconjunto tipado de *JavaScript*

Sin embargo, ¿cómo se relaciona *TypeScript* con *JavaScript*?

#### Sintaxis

*TypeScript* es un lenguaje que es un *superconjunto* de *JavaScript*: La sintaxis de *JS* es, por tanto, *TS* legal.
La sintaxis se refiere a la forma en que escribimos texto para formar un programa.
Por ejemplo, este código tiene un error de *sintaxis* porque le falta un `)`:

```ts twoslash
// @errors: 1005
let a = (4
```

*TypeScript* no considera que algún código *JavaScript* sea un error debido a su sintaxis.
Esto significa que puedes tomar cualquier código *JavaScript* que funcione y colocarlo en un archivo *TypeScript* sin preocuparte por cómo está escrito exactamente.

#### Tipos

Sin embargo, *TypeScript* es un superconjunto *tipado*, lo cual significa que agrega reglas sobre cómo se pueden usar diferentes tipos de valores.
El error anterior sobre `obj.heigth` no era un error de *sintaxis*: es un error utilizar algún tipo de valor (un *tipo*) de forma incorrecta.

Como otro ejemplo, este es el código *JavaScript* que puedes ejecutar en tu navegador, y registrará un valor:

```js
console.log(4 / []);
```

Este programa sintácticamente legal registra `Infinity`.
*TypeScript*, sin embargo, considera que la división de números entre un arreglo es una operación sin sentido y generará un error:

```ts twoslash
// @errors: 2363
console.log(4 / []);
```

Es posible que realmente *tuviste* la intención de dividir un número por un arreglo, quizás solo para ver qué sucede, pero la mayoría de las veces, esto es un error de programación.
El comprobador de tipos de *TypeScript* está diseñado para permitir el paso de los programas correctos sin dejar de detectar tantos errores comunes como sea posible.
(Más adelante, aprenderemos acerca de las configuraciones que puedes usar para ajustar qué tan estrictamente *TypeScript* comprueba tu código).

Si mueves algún código de un archivo *JavaScript* a un archivo *TypeScript*, es posible que veas *errores de tipo* según cómo esté escrito el código.
Estos pueden ser problemas legítimos con el código o que *TypeScript* sea demasiado conservador.
A lo largo de esta guía, demostraremos cómo agregar varias sintaxis de *TypeScript* para eliminar tales errores.

#### Comportamiento en el entorno de ejecución

*TypeScript* también es un lenguaje de programación que conserva el *comportamiento en el entorno de ejecución* de *JavaScript*.
Por ejemplo, dividir entre cero en *JavaScript* produce `Infinity` en lugar de lanzar una excepción en el entorno de ejecución.
Como principio, *TypeScript* **nunca** cambia el comportamiento en el entorno de ejecución del código *JavaScript*.

Esto significa que si mueves código de *JavaScript* a *TypeScript*, está **garantizado** que se ejecute de la misma manera, incluso si *TypeScript* piensa que el código tiene errores de tipo.

Mantener el mismo comportamiento en el entorno de ejecución que *JavaScript* es una promesa fundamental de *TypeScript* porque significa que puedes realizar una transición fácil entre los dos lenguajes sin preocuparte por las sutiles diferencias que podrían hacer que tu programa deje de funcionar.

<!--
Falta una subsección sobre el hecho de que TS extiende JS para agregar sintaxis para la especificación
de tipo.  (Dado que el texto inmediatamente anterior estaba entusiasmado
cómo se puede usar el código JS en TS).
-->

#### Tipos borrados

Hablando en términos generales, una vez que el compilador de *TypeScript* termina de revisar tu código, *borra* los tipos para producir el código "compilado" resultante.
Esto significa que una vez que se compila tu código, el código *JavaScript* puro resultante no tiene información de tipo.

Esto también significa que *TypeScript* nunca cambia el *comportamiento* de tu programa según los tipos que infirió.
La conclusión es que, si bien es posible que veas errores de tipo durante la compilación, el sistema de tipos en sí no influye en cómo funciona tu programa cuando se ejecuta.

Finalmente, *TypeScript* no proporciona bibliotecas de el entorno de ejecución adicionales.
Tus programas utilizarán la misma biblioteca estándar (o bibliotecas externas) que los programas de *JavaScript*, por lo que no hay un marco adicional específico de *TypeScript* para aprender.

<!--
Deberías ampliar este párrafo para decir que hay una excepción
lo que te permite utilizar funciones JS más nuevas y transpilar el código a un antiguo
JS, y esto podría agregar pequeños apéndices de funcionalidad cuando sea necesario.  (Tal vez
con un ejemplo --- algo como `?.` sería bueno para mostrar a los lectores
que este documento se mantiene.)
-->

## Aprender *JavaScript* y *TypeScript*

Con frecuencia vemos la pregunta "¿Debo aprender *JavaScript* o *TypeScript*?".

¡La respuesta es que no se puede aprender *TypeScript* sin aprender *JavaScript*!
*TypeScript* comparte la sintaxis y el comportamiento en el entorno de ejecución con *JavaScript*, por lo que todo lo que aprendas sobre *JavaScript* te ayudará a aprender *TypeScript* al mismo tiempo.

Hay muchos, muchos recursos disponibles para que los programadores aprendan *JavaScript*; *no* debes ignorar estos recursos si estás escribiendo *TypeScript*.
Por ejemplo, hay alrededor de 20 veces más preguntas etiquetadas de `StackOverflow` con `javascript` que con `typescript`, pero *todas* las preguntas de `javascript` también se aplican a `TypeScript`.

Si buscas algo sobre "cómo ordenar una lista en *TypeScript*", recuerda: ***TypeScript* es el entorno de ejecución de *JavaScript* con un comprobador de tipos en tiempo de compilación**.
La forma en que ordenas una lista en *TypeScript* es la misma que lo haces en *JavaScript*.
Si encuentras un recurso que usa *TypeScript* directamente, eso también es genial, pero no te limites a pensar que necesitas respuestas específicas de *TypeScript* para preguntas cotidianas sobre cómo realizar tareas en el entorno de ejecución.

## Próximos pasos

Esta fue una breve descripción general de la sintaxis y las herramientas que se utilizan todos los días en *TypeScript*. A partir de aquí puedes:

- Aprender algunos de los fundamentos de *JavaScript*, te recomendamos:

  - [Recursos *JavaScript* de *Microsoft*](https://docs.microsoft.com/javascript/) o
  - [Guía de *JavaScript* en *Mozilla Web Docs*](https://developer.mozilla.org/docs/Web/JavaScript/Guide)

- Continúa con [*TypeScript* para programadores de *JavaScript*](/docs/handbook/typescript-in-5-minutes.html).
- Leer el manual completo [de principio a fin](/docs/handbook/intro.html) (30 min)
- Explorar los [ejemplos en *Playground*](/play#show-examples)

<!-- Nota: Estaré feliz de escribir lo siguiente ... -->
<!--
## Tipos

    * ¿Qué es un tipo? (Para novatos)
      * Un tipo es una *clase* de valor
      * Los tipos definen implícitamente qué operaciones tienen sentido en ellos
      * Muchos tipos diferentes, no solo primitivos.
      * Podemos hacer descripciones para todo tipo de valores.
      * El tipo `any` -- una descripción rápida, qué es y por qué es malo
    * Inferencia 101
      * Ejemplos
      * *TypeScript* puede descubrir tipos la mayor parte del tiempo
      * En dos lugares te preguntaremos cuál es el tipo: Límites de funciones y valores iniciados posteriormente
    * Coaprendizaje de *JavaScript*
      * Puedes+debes leer los recursos *JS* existentes
      * Solo pégalo y mira qué pasa
      * Considera desactiva`strict` -->
