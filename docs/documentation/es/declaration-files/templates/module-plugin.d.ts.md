---
title: "Módulo: Complementos"
layout: docs
permalink: /docs/handbook/declaration-files/templates/module-plugin-d-ts.html
---

Por ejemplo, cuando desees trabajar con código *JavaScript* que amplía otra biblioteca.

```ts
import { greeter } from "super-greeter";

// *API* Greeter normal
greeter(2);
greeter("Hello world");

// Ahora ampliamos el objeto con una nueva función en el entorno de ejecución
import "hyper-super-greeter";
greeter.hyperGreet();
```

La definición de "super-greeter":

```ts
/*~ Este ejemplo muestra cómo tener múltiples sobrecargas para tu función */
export interface GreeterFunction {
  (nombre: string): void
  (time: number): void
}

/*~ Este ejemplo muestra cómo exportar una función especificada por una interfaz */
export const greeter: GreeterFunction;
```

Podemos extender el módulo existente de la siguiente manera:

```ts
// Definiciones de tipo para [~NOMBRE BIBLIOTECA~] [~OPCIONAL NUMERO VERSION~]
// Proyecto: [~NOMBRE PROYECTO~]
// Definiciones por: [~TU NOMBRE~] <[~UNA URL TUYA~]>

/*~ Este es el archivo de plantilla del complemento del módulo. Debes cambiarle el nombre a index.d.ts
 *~ y colócalo en un directorio con el mismo nombre que el módulo.
 *~ Por ejemplo, si estabas escribiendo un archivo para "super-greeter", este
 *~ archivo debe ser 'super-greeter/index.d.ts'
 */

/*~ En esta línea, importa el módulo que este módulo agrega */
import { greeter } from "super-greeter";

/*~ Aquí, declara el mismo módulo que el que importaste arriba
 *~ luego expandimos la declaración existente de la función de bienvenida
 */
export module "super-greeter" {
  export interface GreeterFunction {
    /** ¡Saluda aún mejor! */
    hyperGreet(): void;
  }
}
```

Esto usa [combinación de declaraciones](/docs/handbook/statement-merging.html)

## El impacto de *ES6* en el módulo *Plugins*

Algunos complementos agregan o modifican las exportaciones de alto nivel en módulos existentes.
Aunque esto es legal en `CommonJS` y otros cargadores, los módulos *ES6* se consideran inmutables y el patrón no será posible.
Debido a que *TypeScript* es independiente del cargador, no existe una aplicación en tiempo de compilación de esta política, pero los desarrolladores que tengan la intención de realizar una transición a un cargador de módulos *ES6* deben tenerlo en cuenta.
