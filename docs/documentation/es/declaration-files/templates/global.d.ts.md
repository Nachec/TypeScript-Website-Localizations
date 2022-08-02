---
title: ".d.ts Global"
layout: docs
permalink: /docs/handbook/declaration-files/templates/global-d-ts.html
---

## Bibliotecas globales

<!-- 
TODO:

1. mencionar que global casi siempre significa "navegador"
2. Si tienes una biblioteca global que sospechas que es UMD, busca instrucciones en
   a. como importarla
   b. -OR- cómo hacer que funcione con webpack
3. Haz que la página siga la estructura de documentación, uso, fuente de ejemplo.

-->

Una biblioteca *global* es aquella a la que se puede acceder desde el ámbito global (es decir, sin utilizar ninguna forma de `import`ación).
Muchas bibliotecas simplemente exponen una o más variables globales para su uso.
Por ejemplo, si usabas [`jQuery`](https://jquery.com/), la variable `$` se puede usar simplemente refiriéndose a ella:

```ts
$(() => {
  console.log("¡hola!");
});
```

Por lo general, verás una guía en la documentación de una biblioteca global sobre cómo usar la biblioteca en una etiqueta `script` de *HTML*:

```HTML
<script src="http://a.great.cdn.for/algunaBib.js"></script>
```

En la actualidad, las bibliotecas más populares y de acceso global se escriben en realidad como bibliotecas *UMD* (ve a continuación).
La documentación de la biblioteca *UMD* es difícil de distinguir de la documentación de la biblioteca global.
Antes de escribir un archivo de declaración global, asegúrate de que la biblioteca no sea realmente *UMD*.

## Identificar una biblioteca global a partir del código

El código de la biblioteca global suele ser extremadamente simple.
Una biblioteca global "Hola, mundo" se podría ver así:

```js
function createGreeting(s) {
  return "Hello, " + s;
}
```

o así:

```js
window.createGreeting = function (s) {
  return "Hello, " + s;
};
```

Al mirar el código de una biblioteca global, generalmente verás:

- Declaraciones `var` de nivel superior o declaraciones `function`
- Una o más asignaciones a `window.someName`
- Supuestos de que existen *DOM* primitivos como `document` o `window`

*No* verás:

- Comprueba o utiliza cargadores de módulos como `require` o `define`
- Importaciones al estilo *CommonJS*/*Node.js* de la forma `var fs = require ("fs");`
- Llamadas a `define(...)`
- Documentación que describe cómo `require` o importar la biblioteca

## Ejemplos de bibliotecas globales

Debido a que generalmente es fácil convertir una biblioteca global en una biblioteca *UMD*, muy pocas bibliotecas populares todavía se escriben en el estilo global.
Sin embargo, las bibliotecas que son pequeñas y requieren *DOM* (o *no* tienen dependencias) pueden seguir siendo globales.

## Plantilla de biblioteca global

Puedes ver un ejemplo de DTS a continuación:

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Si esta biblioteca es invocable (por ejemplo, se puede invocar como myLib(3)),
 *~ incluye esas firmas de llamada aquí.
 *~ De lo contrario, elimina esta sección.
 */
declare function myLib(a: string): string;
declare function myLib(a: number): number;

/*~ Si deseas que el nombre de esta biblioteca sea un nombre de tipo válido,
 *~ puedes hacerlo aquí.
 *~
 *~ Por ejemplo, esto nos permite escribir 'var x: myLib';
 *~ ¡Asegúrate de que esto realmente tenga sentido! Si no es así, solo
 *~ borra esta declaración y agrega tipos dentro del espacio de nombres de abajo.
 */
interface myLib {
  name: string;
  length: number;
  extras?: string[];
}

/*~ Si tu biblioteca tiene propiedades expuestas en una variable global,
 *~ colócalas aquí.
 *~ También debes colocar tipos (interfaces y tipo de alias) aquí.
 */
declare namespace myLib {
  //~ Podemos escribir 'myLib.timeout = 50;'
  let timeout: number;

  //~ Podemos acceder a 'myLib.version', pero no cambiarlo
  const version: string;

  //~ Hay alguna clase que podemos crear a través de 'let c = new myLib.Cat(42)'
  //~ O referencia, p. ej. 'function f(c: myLib.Cat) { ... }
  class Cat {
    constructor(n: number);

    //~ Podemos leer 'c.age' de una instancia 'Cat'
    readonly age: number;

    //~ Podemos invocar 'c.purr()' desde una instancia de 'Cat'
    purr(): void;
  }

  //~ Podemos declarar una variable como
  //~   'var s: myLib.CatSettings = { weight: 5, name: "Maru" };'
  interface CatSettings {
    weight: number;
    name: string;
    tailLength?: number;
  }

  //~ Podemos escribir 'const v: myLib.VetID = 42;'
  //~  o 'const v: myLib.VetID = "bob";'
  type VetID = string | number;

  //~ Podemos invocar 'myLib.checkCat(c)' o 'myLib.checkCat(c, v);'
  function checkCat(c: Cat, s?: VetID);
}
```
