---
title: Declaraciones type
layout: docs
permalink: /docs/handbook/2/type-declarations.html
oneline: "TypeScript cómo proporciona tipos sin tipo para JavaScript."
---

A lo largo de las secciones que haz leído hasta ahora, hemos estado demostrando conceptos básicos de *TypeScript* utilizando las funciones integradas presentes en todos los entornos de ejecución de *JavaScript*.
Sin embargo, casi todos los *JavaScript* actuales incluyen muchas bibliotecas para realizar tareas comunes.
Tener tipos para las partes de tu aplicación que *no son* tu código mejorará enormemente tu experiencia con *TypeScript*.
¿De dónde provienen estos tipos?

## ¿Qué aspecto tienen las declaraciones de tipo?

Digamos que escribes un código como este:

```ts twoslash
// @errors: 2339
const k = Math.max(5, 6);
const j = Math.mix(7, 8);
```

¿Cómo supo *TypeScript* que `max` estaba presente pero no `mix`, aunque la implementación de `Math` no formaba parte de tu código?

La respuesta es que existen *archivos de declaración* que describen estos objetos integrados.
Un archivo de declaración proporciona una forma de *declarar* la existencia de algunos tipos o valores sin proporcionar implementaciones para esos valores.

## Archivos `.d.ts`

*TypeScript* tiene dos tipos de archivos principales.
Los archivos `.ts` son archivos de *implementación* que contienen tipos y código ejecutable.
Estos son los archivos que producen salida `.js`, y es donde normalmente escribirías tu código.

Los archivos `.d.ts` son archivos de *declaración* que *sólo* contienen información de tipo.
Estos archivos no producen salida `.js`; solo se utilizan para la comprobación de tipos.
Más adelante aprenderemos más sobre cómo escribir nuestros propios archivos de declaración.

## Definiciones de tipo integradas

*TypeScript* incluye archivos de declaración para todas las *API* integradas estandarizadas disponibles en los entornos de ejecución de *JavaScript*.
Esto incluye cosas como métodos y propiedades de tipos integrados como `string` o `function`, nombres de nivel superior como `Math` y `Object`, y sus tipos asociados.
De forma predeterminada, *TypeScript* también incluye tipos de cosas disponibles cuando se ejecutan dentro del navegador, como `window` y `document`; estos se conocen colectivamente como las *API* del *DOM*.

*TypeScript* nombra estos archivos de declaración con el patrón `lib.[algo].d.ts`.
Si navegas en un archivo con ese nombre, puedes saber que estás tratando con una parte integrada de la plataforma, no con el código de usuario.

### configuración de `target`

Los métodos, propiedades y funciones disponibles para ti en realidad varían según la *versión* del *JavaScript* en la que se ejecuta tu código.
Por ejemplo, el método de cadenas `startsWith` está disponible solo a partir de la versión de *JavaScript* denominada *ECMAScript 6*.

Es importante saber en qué versión de *JavaScript* se ejecuta finalmente tu código porque no deseas utilizar *APIs* que sean de una versión más reciente que la plataforma en la que implementas.
Esta es una función de la configuración del compilador [`target`](/tsconfig#target).

*TypeScript* ayuda con este problema variando qué archivos `lib` se incluyen de forma predeterminada en función de su configuración de [`target`](/tsconfig#target).
Por ejemplo, si [`target`](/tsconfig#target) es `ES5`, verás un error si intentas utilizar el método `startsWith`, porque ese método solo está disponible en `ES6` o posterior.

### Configuración de `lib`

La configuración [`lib`](/tsconfig#lib) permite un control más detallado de qué archivos de declaración incorporados se consideran disponibles en tu programa.
Consulta la página de documentación en [`lib`](/tsconfig#lib) para obtener más información.

## Definiciones externas

Para las *API* no integradas, hay varias formas de obtener archivos de declaración.
La forma de hacerlo depende de exactamente para qué tipo de biblioteca estás obteniendo.

### Tipos empaquetados

Si una biblioteca que estás utilizando está publicada como un paquete `npm`, es posible que ya incluya archivos de declaración de tipos como parte de su distribución.
Puedes leer la documentación del proyecto para averiguarlo, o simplemente intentar importar el paquete y ver si *TypeScript* puede resolver automáticamente los tipos.

Si eres un autor de paquetes que está considerando agrupar definiciones de tipos con tu paquete, puedes leer nuestra guía sobre [agrupar definiciones de tipos](/docs/handbook/statement-files/ publishing.html#incluir-declaraciones-en-tu-paquete-npm).

### `DefinitelyTyped`/`@types`

El [repositorio `DefinitelyTyped`](https://github.com/DefinitelyTyped/DefinitelyTyped/) es un repositorio centralizado que almacena archivos de declaración para miles de bibliotecas.
La gran mayoría de las bibliotecas de uso común tienen archivos de declaración disponibles en `DefinitelyTyped`.

Las definiciones en `DefinitelyTyped` también se publican automáticamente en `npm` bajo el alcance de `@types`.
El nombre del paquete de tipos siempre es el mismo que el nombre del paquete subyacente.
Por ejemplo, si instalaste el paquete `react` de `npm`, puedes instalar sus tipos correspondientes ejecutando

```sh
npm install --save-dev @types/react
```

*TypeScript* automáticamente encuentra definiciones de tipo en `node_modules/@types`, por lo que no es necesario ningún otro paso para que estos tipos estén disponibles en tu programa.

### Tus propias definiciones

En el caso poco común de que una biblioteca no agrupe sus propios tipos y no tenga una definición en `DefinitelyTyped`, puedes escribir un archivo de declaración tú mismo.
Consulta el apéndice [Redactar archivos de declaración](/docs/handbook/Declaration-files/Introduction.html) para obtener una guía.

Si deseas silenciar las advertencias sobre un módulo en particular sin escribir un archivo de declaración, también puedes declarar rápidamente el módulo como tipo `any` colocando una declaración vacía en un archivo `.d.ts` en tu proyecto.
Por ejemplo, si quisieras usar un módulo llamado `algun-modulo-sin-tipo` sin tener definiciones para él, escribiría:

```ts twoslash
declare module "algun-modulo-sin-tipo";
```
