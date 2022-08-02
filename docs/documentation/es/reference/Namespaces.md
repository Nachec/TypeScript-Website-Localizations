---
title: Espacios de nombres
layout: docs
permalink: /docs/handbook/namespaces.html
oneline: Cómo funcionan los espacios de nombres de TypeScript
translatable: true
---

> **Una nota sobre terminología:**
> Es importante tener en cuenta que en *TypeScript 1.5*, la nomenclatura ha cambiado.
> Los "módulos internos" ahora son "espacios de nombres".
> Los "módulos externos" ahora son simplemente "módulos", en consonancia con la terminología de [*ECMAScript 2015*](http://www.ecma-international.org/ecma-262/6.0/), (es decir, que `module X {`es equivalente al ahora preferido `namespace X {`).

Esta publicación describe las diversas formas de organizar tu código utilizando espacios de nombres (anteriormente "módulos internos") en *TypeScript*.
Como mencionamos en nuestra nota sobre terminología, los "módulos internos" ahora se denominan "espacios de nombres".
Además, en cualquier lugar donde se haya usado la palabra clave `module` al declarar un módulo interno, la palabra clave `namespace` puede y se debe usar en su lugar.
Esto evita confundir a los nuevos usuarios al sobrecargarlos con términos con nombres similares.

## Primeros pasos

Comencemos con el programa que usaremos como ejemplo a lo largo de esta página.
Hemos escrito un pequeño conjunto de validadores de cadenas simplistas, como podría escribir para verificar la entrada de un usuario en un formulario en una página web o verificar el formato de un archivo de datos proporcionado externamente.

## Validadores en un solo archivo

```ts
interface StringValidator {
  isAcceptable(s: string): boolean;
}

let lettersRegexp = /^[A-Za-z]+$/;
let numberRegexp = /^[0-9]+$/;

class LettersOnlyValidator implements StringValidator {
  isAcceptable(s: string) {
    return lettersRegexp.test(s);
  }
}

class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}

// Algunas muestras para probar
let strings = ["Hello", "98052", "101"];

// Validadores a utilizar
let validators: { [s: string]: StringValidator } = {};
validators["ZIP code"] = new ZipCodeValidator();
validators["Letters only"] = new LettersOnlyValidator();

// Muestra si cada cadena pasó cada validador
for (let s of strings) {
  for (let name in validators) {
    let isMatch = validators[name].isAcceptable(s);
    console.log(`'${s}' ${isMatch ? "matches" : "does not match"} '${name}'.`);
  }
}
```

## Espacios de nombres

A medida que agreguemos más validadores, querremos tener algún tipo de esquema de organización para poder realizar un seguimiento de nuestros tipos y no preocuparnos por las colisiones de nombres con otros objetos.
En lugar de poner muchos nombres diferentes en el espacio de nombres global, envolvemos nuestros objetos en un espacio de nombres.

En este ejemplo, trasladaremos todas las entidades relacionadas con el validador a un espacio de nombres llamado `Validation`.
Debido a que queremos que las interfaces y clases aquí sean visibles fuera del espacio de nombres, las precedemos con `export`.
Por el contrario, las variables `lettersRegexp` y `numberRegexp` son detalles de implementación, por lo que no se exportan y no serán visibles para el código fuera del espacio de nombres.
En el código de prueba en la parte inferior del archivo, ahora necesitamos calificar los nombres de los tipos cuando se usan fuera del espacio de nombres, p. ej. `Validation.LettersOnlyValidator`.

## Validadores de espacio de nombres

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

// Algunas muestras para probar
let strings = ["Hello", "98052", "101"];

// Validadores a utilizar
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Muestra si cada cadena pasó cada validador
for (let s of strings) {
  for (let name in validators) {
    console.log(
      `"${s}" - ${
        validators[name].isAcceptable(s) ? "matches" : "does not match"
      } ${name}`
    );
  }
}
```

## Dividir entre archivos

A medida que nuestra aplicación crezca, querremos dividir el código en varios archivos para que sea más fácil de mantener.

## Espacios de nombres de varios archivos

Aquí, dividiremos nuestro espacio de nombres de `Validation` en muchos archivos.
Aunque los archivos están separados, cada uno puede contribuir al mismo espacio de nombres y se pueden consumir como si estuvieran todos definidos en un solo lugar.
Debido a que existen dependencias entre archivos, agregaremos etiquetas de referencia para informar al compilador sobre las relaciones entre los archivos.
Nuestro código de prueba no ha cambiado.

##### `Validation.ts`

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
}
```

##### `LettersOnlyValidator.ts`

```ts
/// <reference path="Validation.ts" />
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/;
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}
```

##### `ZipCodeValidator.ts`

```ts
/// <reference path="Validation.ts" />
namespace Validation {
  const numberRegexp = /^[0-9]+$/;
  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}
```

##### `Test.ts`

```ts
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// Algunas muestras para probar
let strings = ["Hello", "98052", "101"];

// Validadores a utilizar
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Muestra si cada cadena pasó cada validador
for (let s of strings) {
  for (let name in validators) {
    console.log(
      `"${s}" - ${
        validators[name].isAcceptable(s) ? "matches" : "does not match"
      } ${name}`
    );
  }
}
```

Una vez que haya varios archivos involucrados, tendremos que asegurarnos de que se cargue todo el código compilado.
Hay dos formas de hacer esto.

Primero, podemos usar la salida concatenada usando el indicador [`outFile`](/tsconfig#outFile) para compilar todos los archivos de entrada en un solo archivo de salida *JavaScript*:

```shell
tsc --outFile sample.js Test.ts
```

El compilador ordenará automáticamente el archivo de salida en función de las etiquetas de referencia presentes en los archivos. También puedes especificar cada archivo individualmente:

```shell
tsc --outFile sample.js Validation.ts LettersOnlyValidator.ts ZipCodeValidator.ts Test.ts
```

Alternativamente, podemos usar la compilación por archivo (la predeterminada) para emitir un archivo *JavaScript* para cada archivo de entrada.
Si se producen varios archivos *JS*, necesitaremos usar etiquetas `<script>` en nuestra página web para cargar cada archivo emitido en el orden apropiado, por ejemplo:

##### `MyTestPage.html` (extracto)

```HTML
<script src="Validation.js" type="text/javascript" />
<script src="LettersOnlyValidator.js" type="text/javascript" />
<script src="ZipCodeValidator.js" type="text/javascript" />
<script src="Test.js" type="text/javascript" />
```

## Alias

Otra forma de simplificar el trabajo con espacios de nombres es usar `import q = x.y.z` para crear nombres más cortos para los objetos de uso común.
No debes confundirte con la sintaxis `import x = require("nombre")` usada para cargar módulos, esta sintaxis simplemente crea un alias para el símbolo especificado.
Puedes utilizar este tipo de importaciones (comúnmente conocidas como alias) para cualquier tipo de identificador, incluidos los objetos creados a partir de importaciones de módulos.

```ts
namespace Shapes {
  export namespace Polygons {
    export class Triangle {}
    export class Square {}
  }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square(); // Igual que 'new Shapes.Polygons.Square()'
```

Ten en cuenta que no usamos la palabra clave `require`; en su lugar, asignamos directamente desde el nombre calificado del símbolo que estamos importando.
Esto es similar al uso de `var`, pero también funciona con el tipo y los significados del espacio de nombres del símbolo importado.
Es importante destacar que, para los valores, `import` es una referencia distinta del símbolo original, por lo que los cambios a una `var` con alias no se reflejarán en la variable original.

## Trabajar con otras bibliotecas de *JavaScript*

Para describir la forma de las bibliotecas que no están escritas en *TypeScript*, debemos declarar la *API* que expone la biblioteca.
Debido a que la mayoría de las bibliotecas de *JavaScript* exponen solo unos pocos objetos de nivel superior, los espacios de nombres son una buena forma de representarlos.

Llamamos "ambiente" a las declaraciones que no definen una implementación.
Normalmente, estos se definen en archivos `.d.ts`.
Si estás familiarizado con *C*/*C++*, los puedes considerar como archivos `.h`.
Veamos algunos ejemplos.

## Espacios de nombres ambientales

La popular biblioteca *D3* define su funcionalidad en un objeto global llamado `d3`.
Debido a que esta biblioteca se carga a través de una etiqueta `<script>` (en lugar de un cargador de módulo), su declaración usa espacios de nombres para definir su forma.
Para que el compilador de *TypeScript* ve esta forma, usamos una declaración de espacio de nombres ambiental.
Por ejemplo, podríamos empezar a escribirlo de la siguiente manera:

##### `D3.d.ts` (extracto simplificado)

```ts
declare namespace D3 {
  export interface Selectors {
    select: {
      (selector: string): Selection;
      (element: EventTarget): Selection;
    };
  }

  export interface Event {
    x: number;
    y: number;
  }

  export interface Base extends Selectors {
    event: Event;
  }
}

declare var d3: D3.Base;
```
