---
title: "Módulo: Class"
layout: docs
permalink: /docs/handbook/declaration-files/templates/module-class-d-ts.html
---

<!--
TODO:

1. No está claro por qué se incluye UMD aquí.
2. Proporciona ejemplos ambos módulos commonjs y ES.
-->

Por ejemplo, cuando desees trabajar con código JavaScript que se parece a:

```ts
const Greeter = require("super-greeter");

const greeter = new Greeter();
greeter.greet();
```

Para manejar tanto la importación a través de *UMD* como los módulos:

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Este es el archivo de plantilla de módulo para módulos de clase.
 *~ Deberías cambiarle el nombre a index.d.ts y colocarlo en un directorio con el mismo nombre que el módulo.
 *~ Por ejemplo, si estabas escribiendo un archivo para "super-greeter", este
 *~ archivo debe ser 'super-greeter/index.d.ts'
 */

// Ten en cuenta que los módulos *ES6* no pueden exportar directamente objetos de clase.
// Este archivo se debe importar usando el estilo CommonJS:
//   import x = require('[~EL MODULO~]');
//
// Alternativamente, si --allowSyntheticDefaultImports o
// --esModuleInterop está activado, este archivo también se puede
// importar como importación 'default':
//   import x from '[~EL MODULO~]';
//
// Consulta la documentación de TypeScript en
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// para comprender soluciones alternativas comunes para esta limitación de los módulos ES6.

/*~ Si este módulo es un módulo UMD que expone una variable global 'myClassLib' cuando
 *~ se carga fuera de un entorno cargador de módulos, declara que aquí es global.
 *~ De lo contrario, elimina esta declaración.
 */
export as namespace "super-greeter";

/*~ Esta declaración especifica que la función constructora de la clase
 *~ es el objeto exportado del archivo
 */
export = Greeter;

/*~ Escribe los métodos y propiedades de tu módulo en esta clase */
declare class Greeter {
  constructor(customGreeting?: string);

  greet: void;

  myMethod(opts: MyClass.MyClassMethodOptions): number;
}

/*~ Si también deseas exponer tipos de tu módulo, puedes
 *~ colocarlos en este bloque.
 *~
 *~ Ten en cuenta que si decides incluir este espacio de nombres, el módulo se puede
 *~ importar incorrectamente como un objeto de espacio de nombres, a menos que
 *~ --esModuleInterop esté configurado:
 *~   import * as x from '[~EL MODULO~]'; // ¡INCORRECTO! ¡NO HAGAS ESTO!
 */
declare namespace MyClass {
  export interface MyClassMethodOptions {
    width?: number;
    height?: number;
  }
}
```
