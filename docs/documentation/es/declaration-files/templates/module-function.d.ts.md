---
title: "Módulo: Function"
layout: docs
permalink: /docs/handbook/declaration-files/templates/module-function-d-ts.html
---

Por ejemplo, cuando desees trabajar con código JavaScript que se parece a:

```ts
import greeter from "super-greeter";

greeter(2);
greeter("Hello world");
```

Para manejar tanto la importación a través de *UMD* como los módulos:

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Este es el archivo de plantilla de módulo para módulos de función.
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

/*~ Si este módulo es un módulo UMD que expone una variable global 'myFuncLib' cuando
 *~ se carga fuera de un entorno cargador de módulos, declara que aquí es global.
 *~ De lo contrario, elimina esta declaración.
 */
export as namespace myFuncLib;

/*~ Esta declaración especifica que la función
 *~ es el objeto exportado del archivo
 */
export = Greeter;

/*~ Este ejemplo muestra cómo tener múltiples sobrecargas para tu función */
declare function Greeter(name: string): Greeter.NamedReturnType;
declare function Greeter(length: number): Greeter.LengthReturnType;

/*~ Si también deseas exponer tipos de tu módulo, puedes
 *~ colocarlos en este bloque. A menudo querrás describir la
 *~ forma del tipo de retorno de la función; ese tipo se debería
 *~ declarar aquí, como muestra este ejemplo.
 *~
 *~ Ten en cuenta que si decides incluir este espacio de nombres, el módulo se puede
 *~ importar incorrectamente como un objeto de espacio de nombres, a menos que
 *~ --esModuleInterop esté configurado:
 *~   import * as x from '[~EL MODULO~]'; // ¡INCORRECTO! ¡NO HAGAS ESTO!
 */
declare namespace Greeter {
  export interface LengthReturnType {
    width: number;
    height: number;
  }
  export interface NamedReturnType {
    firstName: string;
    lastName: string;
  }

  /*~ Si el módulo también tiene propiedades, decláralas aquí. Por ejemplo:
   *~ esta declaración dice que este código es legal:
   *~   import f = require('super-greeter');
   *~   console.log(f.defaultName);
   */
  export const defaultName: string;
  export let defaultLength: number;
}
```
