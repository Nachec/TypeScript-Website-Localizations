---
title: Introducción
layout: docs
permalink: /docs/handbook/declaration-files/introduction.html
oneline: "Cómo escribir un archivo de declaración TypeScript (d.ts) de alta calidad"
---

La sección Archivos de la declaración está diseñada para enseñarte cómo escribir un archivo de declaración *TypeScript* de alta calidad. Necesitamos asumir una familiaridad básica con el lenguaje *TypeScript* para comenzar.

Si aún no lo has hecho, deberías leer el [Manual de *TypeScript*](/docs/handbook/2/basic-types.html)
para familiarizarte con los conceptos básicos, especialmente los tipos y los módulos.

El caso más común para aprender cómo funcionan los archivos `.d.ts` es que estás escribiendo un paquete `npm` sin tipos. 
En ese caso, puedes ir directamente a [Módulos `.d.ts`](/docs/handbook/statement-files/templates/module-d-ts.html).

La sección Archivos de la declaración se divide en las siguientes secciones.

## [Referencia de declaración](/docs/handbook/statement-files/by-example.html)

A menudo nos enfrentamos a escribir un archivo de declaración cuando solo tenemos ejemplos de la biblioteca subyacente para guiarnos.
La sección [Referencia de declaración](/docs/handbook/statement-files/by-example.html) muestra muchos patrones de *API*s comunes y cómo escribir declaraciones para cada uno de ellos.
Esta guía está dirigida al principiante de *TypeScript* que quizás aún no esté familiarizado con todas las construcciones del lenguaje *TypeScript*.

## [Estructura de bibliotecas](/docs/handbook/declaration-files/library-structures.html)

La guía [Estructura de bibliotecas](/docs/handbook/declaration-files/library-structures.html) te ayuda a comprender los formatos de biblioteca comunes y cómo escribir un archivo de declaración adecuado para cada formato.
Si estás editando un archivo existente, probablemente no necesites leer esta sección.
Se recomienda encarecidamente a los autores de nuevos archivos de declaración que lean esta sección para comprender correctamente cómo el formato de la biblioteca influye en la escritura del archivo de declaración. 

En la sección Plantilla encontrarás varios archivos de declaración que sirven como un punto de partida útil
al escribir un nuevo archivo. Si ya sabes cuál es tu estructura, consulta la sección Plantilla `d.ts` en la barra lateral.

## [Qué hacer y qué no hacer](/docs/handbook/declaration-files/do-s-and-don-ts.html)

Muchos errores comunes en los archivos de declaración se pueden evitar fácilmente.
La sección [Qué hacer y qué no hacer](/docs/handbook/declaration-files/do-s-and-don-ts.html) identifica errores comunes, 
describe cómo detectarlos, 
y cómo solucionarlos.
Todos deben leer esta sección para ayudarse a sí mismos a evitar errores comunes.

## [Análisis profundo](/docs/handbook/statement-files/deep-dive.html)

Para los autores experimentados interesados en la mecánica subyacente de cómo funcionan los archivos de declaración, 
la sección [Análisis profundo](/docs/handbook/statement-files/deep-dive.html) explica muchos conceptos avanzados en la redacción de declaraciones, 
y muestra cómo aprovechar estos conceptos para crear archivos de declaración más limpios e intuitivos.

## [Publicar en `npm`](/docs/handbook/statement-files/publishing.html)

La sección [Publicación](/docs/handbook/statement-files/publishing.html) explica cómo publicar tus archivos de declaración en un paquete npm y muestra cómo administrar tus paquetes dependientes.

## [Buscar e instalar archivos de declaración](/docs/handbook/statement-files/consumer.html)

Para los usuarios de la biblioteca *JavaScript*, la sección [Consumo](/docs/handbook/statement-files/consumer.html) ofrece unos sencillos pasos para localizar e instalar los archivos de declaración correspondientes.
