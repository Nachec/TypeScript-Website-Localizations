---
title: "Global: Modificar módulo"
layout: docs
permalink: /docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html
---

## Módulos `global-modifying`

Un *módulo `global-modifying`* altera los valores existentes en el ámbito global cuando se importan.
Por ejemplo, podría existir una biblioteca que agregue nuevos miembros a `String.prototype` cuando se importe.
Este patrón es algo peligroso debido a la posibilidad de conflictos en el entorno de ejecución,
pero aún podemos escribir un archivo de declaración para ello.

## Identificación de módulos de modificación global

Los módulos de modificación global generalmente son fáciles de identificar desde su documentación.
En general, son similares a los complementos globales, pero necesitan una llamada `require` para activar sus efectos.

Es posible que veas documentación como esta:

```js
// llamada 'require' que no usa su valor de retorno
var unused = require("magic-string-time");
/* o */
require("magic-string-time");

var x = "hello, world";
// Crea nuevos métodos en tipos integrados
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Crea nuevos métodos en tipos integrados
console.log(y.reverseAndSort());
```

Aquí hay un ejemplo

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Este es el archivo de plantilla de módulo de modificación global. Debes cambiarle el nombre a index.d.ts
 *~ y colócalo en un directorio con el mismo nombre que el módulo.
 *~ Por ejemplo, si estabas escribiendo un archivo para "super-greeter", este
 *~ archivo debe ser 'super-greeter/index.d.ts'
 */

/*~ Nota: Si tu módulo de modificación global es invocable o construible,
 *~ necesitas combinar los patrones aquí con los de la clase-módulo o módulo-función
 *~ archivos de plantilla
 */
declare global {
  /*~ Aquí, declaras cosas que van en el espacio de nombres global, o aumenta
   *~ declaraciones existentes en el espacio de nombres global
   */
  interface String {
    fancyFormat(opts: StringFormatOptions): string;
  }
}

/*~ Si tu módulo exporta tipos o valores, escríbelos como de costumbre */
export interface StringFormatOptions {
  fancinessLevel: number;
}

/*~ Por ejemplo, declarar un método en el módulo (además de sus efectos secundarios globales) */
export function doSomething(): void;

/*~ Si tu módulo no exporta nada, necesitará esta línea. De lo contrario, elimínala */
export {};
```
