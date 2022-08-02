---
title: El manual de TypeScript
layout: docs
permalink: /docs/handbook/intro.html
oneline: Tu primer paso para aprender TypeScript
handbook: "true"
---

## Acerca de este manual

Más de 20 años después de su introducción a la comunidad de programación, *JavaScript* ahora es uno de los lenguajes multiplataforma más difundidos jamás creado. Comenzó como un pequeño lenguaje de scripting para agregar interactividad trivial a las páginas web, *JavaScript* se ha convertido en un lenguaje de elección tanto para aplicaciones de usuario como para servidor de todos los tamaños. Si bien el tamaño, el alcance y la complejidad de los programas escritos en *JavaScript* ha crecido exponencialmente, la capacidad del lenguaje *JavaScript* para expresar las relaciones entre diferentes unidades de código no lo ha hecho. Combinado con la semántica en el entorno de ejecución bastante peculiar de *JavaScript*, este desajuste entre el lenguaje y la complejidad del programa ha hecho que el desarrollo de *JavaScript* sea una tarea difícil de administrar a escala.

Los tipos de errores más comunes que escriben los programadores pueden describirse como errores de tipo: se utilizó un cierto tipo de valor cuando se esperaba un tipo de valor diferente. Esto se podría deber a errores tipográficos simples, una falta de comprensión de la superficie de la *API* de una biblioteca, suposiciones incorrectas sobre el comportamiento del entorno de ejecución u otros errores. El objetivo de *TypeScript* es ser un comprobador de tipos estático para programas *JavaScript* ⏤ en otras palabras, una herramienta que se ejecuta antes de que se ejecute tu código (estático) y garantiza que los tipos de programa sean correctos (se verifica el tipo).

Si llegas a *TypeScript* sin experiencia en *JavaScript*, con la intención de que *TypeScript* sea tu primer lenguaje, te recomendamos que primero comiences a leer la documentación en el [Tutorial *aprende JavaScript* de *Microsoft*](https://docs.microsoft.com/javascript/) o leas [*JavaScript* en Mozilla Web Docs](https://developer.mozilla.org/docs/Web/JavaScript/Guide).
Si tienes experiencia en otros lenguajes, deberías poder captar la sintaxis de *JavaScript* con bastante rapidez leyendo el manual.

## ¿Cómo está estructurado este manual?

El manual se divide en dos secciones:

- **El manual**

  *El Manual de TypeScript* está destinado a ser un documento completo que explica *TypeScript* a los programadores cotidianos. Puedes leer el manual yendo de arriba a abajo en la barra de navegación de la izquierda.

  Debes esperar que cada capítulo o página te proporcione una sólida comprensión de los conceptos dados. *El Manual de TypeScript* no es una especificación completa del lenguaje, pero está destinado a ser una guía completa de todas las características y comportamientos del lenguaje.

  Un lector que completa el *tutorial paso a paso* debería poder:

  - Leer y comprender la sintaxis y los patrones de *TypeScript* de uso común
  - Explicar los efectos de las opciones importantes del compilador.
  - Predecir correctamente el comportamiento del sistema de tipos en la mayoría de los casos

  En aras de la claridad y brevedad, el contenido principal del manual no explorará todos los casos extremos o minucias de las características que se tratan. Puedes encontrar más detalles sobre conceptos particulares en los artículos de referencia.

- **Archivos de referencia**

  La sección de referencia debajo del manual en la navegación está diseñada para proporcionar una comprensión más completa de cómo funciona una parte particular de *TypeScript*. Lo puedes leer de arriba a abajo, pero cada sección tiene como objetivo proporcionar una explicación más profunda de un solo concepto: lo cual significa que no hay ningún objetivo de continuidad.

### Sin objetivos

El manual también pretende ser un documento conciso que se pueda leer cómodamente en unas pocas horas. Ciertos temas no se cubrirán para que las cosas sean breves.

Específicamente, el manual no presenta completamente los conceptos básicos de *JavaScript* como funciones, clases y cierres. Cuando corresponda, incluiremos enlaces a la lectura de antecedentes que puedes utilizar para leer sobre esos conceptos.

El manual tampoco pretende sustituir una especificación del lenguaje. En algunos casos, los casos extremos o las descripciones formales de la conducta se omitirán en favor de explicaciones de alto nivel y más fáciles de entender. En cambio, hay páginas de referencia separadas que describen de manera más precisa y formal muchos aspectos del comportamiento de *TypeScript*. Las páginas de referencia no están destinadas a lectores que no estén familiarizados con *TypeScript*, por lo que pueden utilizar terminología avanzada o temas de referencia sobre los que aún no has leído.

Finalmente, el manual no cubrirá cómo interactúa *TypeScript* con otras herramientas, excepto cuando sea necesario. Temas sobre cómo configurar *TypeScript* con `webpack`, `rollup`, `parcel`, `react`, `babel`, `closures`, `lerna`, `rush`, `bazel`, `preact`, `vue`, `angular`, `svelte`, `jquery`, `yarn` o `npm` están fuera del alcance ⏤ puedes encontrar estos recursos en otros lugares de la web.

## Empecemos

Antes de comenzar con [Conceptos básicos](/docs/handbook/2/basic-types.html), recomendamos leer una de las siguientes páginas introductorias. Estas introducciones están destinadas a resaltar las similitudes y diferencias clave entre *TypeScript* y tu lenguaje de programación favorito, y aclarar conceptos erróneos comunes específicos de esos lenguajes.

- [*TypeScript* para nuevos programadores](/docs/handbook/typescript-from-scratch.html)
- [*TypeScript* para programadores de *JavaScript*](/docs/handbook/typescript-in-5-minutes.html)
- [*TypeScript* para programadores *POO*](/docs/handbook/typescript-in-5-minutes-oop.html)
- [*TypeScript* para programadores funcionales](/docs/handbook/typescript-in-5-minutes-func.html)

De lo contrario, ve a [Conceptos básicos](/docs/handbook/2/basic-types.html) o consigue una copia en formato [*Epub*](/assets/typescript-handbook.epub) o [*PDF*](/assets/typescript-handbook.pdf).
