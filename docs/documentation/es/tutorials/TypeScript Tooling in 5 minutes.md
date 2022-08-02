---
title: Herramientas de TypeScript en 5 minutos
layout: docs
permalink: /docs/handbook/typescript-tooling-in-5-minutes.html
oneline: Un tutorial para entender cómo crear un pequeño sitio web con TypeScript
translatable: true
---

Comencemos creando una sencilla aplicación *web* con *TypeScript*.

## Instalar *TypeScript*

Hay dos formas principales de hacer que *TypeScript* esté disponible para tu proyecto:

- A través de `npm` (el administrador de paquetes de *Node.js*)
- Instalar los complementos de *Visual Studio* para *TypeScript*

*Visual Studio 2017* y *Visual Studio 2015 Actualización 3* incluyen compatibilidad con el lenguaje *TypeScript* de forma predeterminada, pero no incluyen el compilador de *TypeScript*, `tsc`.
Si no instalaste *TypeScript* con *Visual Studio*, aún lo puedes [descargar](/download).

Para usuarios de `npm`:

```shell
> npm install -g typescript
```

## Construir su primer archivo *TypeScript*

En tu editor, escribe el siguiente código *JavaScript* en `greeter.ts`:

```ts twoslash
// @noImplicitAny: false
function saludar(persona) {
  return "Hello, " + person;
}

let user = "Jane User";

document.body.textContent = greeter(user);
```

## Compilar tu código

Utilizamos una extensión `.ts`, pero este código solo es *JavaScript*.
Podrías haber copiado/pegado esto directamente desde una aplicación *JavaScript* existente.

En la línea de comandos, ejecuta el compilador *TypeScript*:

```shell
tsc greeter.ts
```

El resultado será un archivo `greeter.ts` que contiene el mismo *JavaScript* que introdujiste.
¡Estamos en funcionamiento usando *TypeScript* en nuestra aplicación *JavaScript*!

Ahora podemos comenzar a aprovechar algunas de las nuevas herramientas que ofrece *TypeScript*.
Agrega una `:string` de anotación de tipo al argumento de la función `'person'`a como se muestra aquí:

```ts twoslash
function greeter(person: string) {
  return "Hello, " + person;
}

let user = "Jane User";

document.body.textContent = greeter(user);
```

## Anotación de tipo

Las anotaciones de tipo en *TypeScript* son formas ligeras de registrar el contrato previsto de la función o variable.
En este caso, pretendemos llamar a la función `saludar` con un solo parámetro de cadena.
Podemos intentar cambiar la llamada a `saludar` para pasar un arreglo en su lugar:

```ts twoslash
// @errors: 2345
function greeter(person: string) {
  return "Hello, " + person;
}

let usuario = [0, 1, 2];

document.body.textContent = greeter(user);
```

Al volver a compilar, ahora verás un error:

```shell
error TS2345: El argumento de tipo 'number[]' no se puede asignar al parámetro de tipo 'string'.
```

Del mismo modo, intenta eliminar todos los argumentos de la llamada a `greeter`.
*TypeScript* te informará que has llamado a esta función con un número inesperado de parámetros.
En ambos casos, *TypeScript* puede ofrecer un análisis estático basado tanto en la estructura de tu código como en las anotaciones de tipo que proporciones.

Ten en cuenta que aunque hubo errores, el archivo `greeter.js` todavía se crea.
Puedes usar *TypeScript* incluso si hay errores en tu código. Pero en este caso, *TypeScript* advierte que tu código probablemente no se ejecutará como se esperaba.

## Interfaces

Desarrollemos más nuestro ejemplo. Aquí usaremos una interfaz que describe objetos que tienen un campo `name` y otro `lastName`.
En *TypeScript*, dos tipos son compatibles si su estructura interna es compatible.
Esto nos permite implementar una interfaz simplemente teniendo la forma que requiere la interfaz, sin una cláusula `implements` explícita.

```ts twoslash
interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}

let user = { firstName: "Jane", lastName: "User" };

document.body.textContent = greeter(user);
```

## Clases

Finalmente, extendamos el ejemplo una última vez con clases.
*TypeScript* admite nuevas características en *JavaScript*, como el soporte para programación orientada a objetos basada en clases.

Aquí vamos a crear una clase `Estudiante` con un constructor y algunos campos públicos.
Observa que las clases y las interfaces juegan bien juntas, permitiendo que el programador decida sobre el nivel correcto de abstracción.

También es de destacar que el uso de `public` en argumentos para el constructor es una abreviatura que nos permite crear automáticamente propiedades con ese nombre.

```ts twoslash
class Estudiante {
  fullName: string;
  constructor(
    public firstName: string,
    public middleInitial: string,
    public lastName: string
  ) {
    this.fullName = firstName + " " + middleInitial + " " + lastName;
  }
}

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}

let usuario = new Estudiante("Jenny", "M.", "Usuario");

document.body.textContent = greeter(user);
```

Vuelve a ejecutar `tsc bienvenida.ts` y verás que el *JavaScript* generado es el mismo que el código anterior.
Las clases en *TypeScript* son solo una abreviatura para el mismo prototipo basado en *OO* que se usa con frecuencia en *JavaScript*.

## Ejecutar tu aplicación web *TypeScript*

Ahora escribe lo siguiente en `greeter.html`:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <title>TypeScript Greeter</title>
  </head>
  <body>
    <script src="bienvenida.js"></script>
  </body>
</html>
```

¡Abre `greeter.html` en el navegador para ejecutar tu primer aplicación *web TypeScript*!

Opcional: Abre `greeter.ts` en *Visual Studio* o copia el código en el *playground* de *TypeScript*.
Puedes pasar el cursor sobre los identificadores para ver sus tipos.
Ten en cuenta que en algunos casos estos tipos se infieren automáticamente para ti.
Vuelve a escribir la última línea y ve las listas de terminación y la ayuda de parámetros en función de los tipos de elementos del *DOM*.
Coloca el cursor sobre la referencia a la función `saludar` y presiona *F12* para ir a su definición.
Observa también que puedes hacer clic con el botón derecho en un símbolo y usar la refactorización para cambiarle el nombre.

La información de tipo proporcionada funciona junto con las herramientas para trabajar con *JavaScript* a escala de la aplicación.
Para obtener más ejemplos de lo que es posible en *TypeScript*, consulta la sección de Ejemplos del sitio *web*.

![Imagen de Visual Studio](/images/docs/greet_person.png)
