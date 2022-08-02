---
title: Crear tipos a partir de tipos
layout: docs
permalink: /docs/handbook/2/types-from-types.html
oneline: "Una descripción general de las formas en que puedes crear más tipos a partir de tipos existentes."
---

El sistema de tipos de *TypeScript* es muy poderoso porque permite expresar tipos *en términos de otros tipos*.

La forma más simple de esta idea son los genéricos, en realidad tenemos disponible una amplia variedad de *operadores de tipo* para usar.
También es posible expresar tipos en términos de *valores* que ya tenemos.

Al combinar varios operadores de tipo, podemos expresar operaciones y valores complejos de una manera sucinta y fácil de mantener.
En esta sección cubriremos formas de expresar un nuevo tipo en términos de un tipo o valor existente.

- [Genéricos](/docs/handbook/2/generics.html) ⏤ Tipos que toman parámetros
- [Operador de tipo `Keyof`](/docs/handbook/2/keyof-types.html) ⏤ Usar el operador `keyof` para crear nuevos tipos
- [Operador de tipo `typeof`](/docs/handbook/2/typeof-types.html) ⏤ Usar el operador `typeof` para crear nuevos tipos
- [acceso a tipos indexados](/docs/handbook/2/indexed-access-types.html) ⏤ Usar la sintaxis `Type['a'] `para acceder a un subconjunto de un tipo
- [Tipos condicionales](/docs/handbook/2/conditional-types.html) ⏤ Tipos que actúan como declaraciones `if` en el sistema de tipos
- [Tipos asignados](/docs/handbook/2/mapped-types.html) ⏤ Crear tipos mapeando cada propiedad en un tipo existente
- [Tipos de plantillas literales](/docs/handbook/2/template-literal-types.html) ⏤ Tipos mapeados que cambian las propiedades a través de cadenas de plantillas literales
