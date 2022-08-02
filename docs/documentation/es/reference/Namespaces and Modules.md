---
title: Módulos y espacios de nombres
layout: docs
permalink: /docs/handbook/namespaces-and-modules.html
oneline: Cómo organizar el código en TypeScript a través de módulos o espacios de nombres
translatable: true
---

Esta publicación describe las diversas formas de organizar tu código utilizando módulos y espacios de nombres en *TypeScript*.
También repasaremos algunos temas avanzados sobre cómo usar espacios de nombres y módulos, y abordaremos algunos errores comunes al usarlos en *TypeScript*.

Consulta la documentación de [Módulos](/docs/handbook/modules.html) para obtener más información sobre los módulos *ES*.
Consulta la documentación de [espacios de nombres](/docs/handbook/namespaces.html) para obtener más información sobre los espacios de nombres de *TypeScript*.

Nota: En *muy* antiguas versiones de los espacios de nombres de *TypeScript* se llamaban 'Módulos internos',  anteriores a estos sistemas de módulos *JavaScript*.

## Usar módulos

Los módulos pueden contener tanto código como declaraciones.

Los módulos también dependen de un cargador de módulos (como `CommonJs`/`Require.js`) o de un entorno de ejecución que admita módulos *ES*.
Los módulos proporcionan una mejor reutilización del código, un aislamiento más fuerte y un mejor soporte de herramientas para la agrupación.

También vale la pena señalar que, para las aplicaciones `Node.js`, los módulos son los predeterminados y **recomendamos módulos sobre los espacios de nombres en el código moderno**.

A partir de *ECMAScript 2015*, los módulos son parte nativa del lenguaje y deben ser compatibles con todas las implementaciones de motores compatibles.
Por lo tanto, para los nuevos proyectos, los módulos serían el mecanismo de organización del código recomendado.

## Usar espacios de nombres

Los espacios de nombres son una forma específica de *TypeScript* para organizar el código.  
Los espacios de nombres se denominan simplemente objetos *JavaScript* en el espacio de nombres global.
Esto hace que los espacios de nombres sean una construcción muy simple de usar.
A diferencia de los módulos, pueden abarcar varios archivos y pueden concatenarse usando [`outFile`](/tsconfig#outFile).
Los espacios de nombres pueden ser una buena manera de estructurar tu código en una aplicación web, con todas las dependencias incluidas como etiquetas `<script>` en tu página *HTML*.

Al igual que toda la contaminación del espacio de nombres global, puede ser difícil identificar las dependencias de los componentes, especialmente en una aplicación grande.

## Errores de los espacios de nombres y los módulos

En esta sección, describiremos varios errores comunes en el uso de espacios de nombres y módulos, y cómo evitarlos.

## `/// <reference>`-ar un módulo

Un error común es intentar usar la sintaxis `/// <referencia ... />` para referirse a un archivo de módulo, en lugar de usar una instrucción `import`.
Para entender la distinción, primero necesitamos entender cómo el compilador puede ubicar la información de tipo para un módulo basado en la ruta de una `import` (por ejemplo, los `...` en `import x from "...";` , `import x = require("...");`, etc.).

El compilador intentará encontrar un `.ts`, `.tsx`, y luego un `.d.ts` con la ruta apropiada.
Si no se pudo encontrar un archivo específico, el compilador buscará una *declaración de módulo ambiental*.
Recuerda que estos se deben declarar en un archivo `.d.ts`.

- `myModules.d.ts`

  ```ts
  // En un archivo .d.ts o .ts que no es un módulo:
  declare module "SomeModule" {
    export function fn(): string;
  }
  ```

- `myOtherModule.ts`

  ```ts
  /// <reference path="myModules.d.ts" />
  import * as m from "SomeModule";
  ```

La etiqueta de referencia aquí nos permite ubicar el archivo de declaración que contiene la declaración para el módulo ambiental.
Así es como se consume el archivo `node.d.ts` que utilizan varias de las muestras de *TypeScript*.

## Espacio de nombres innecesario

Si estás convirtiendo un programa de espacios de nombres a módulos, puede ser fácil terminar con un archivo que se ve así:

- `shapes.ts`

  ```ts
  export namespace Shapes {
    export class Triangle {
      /* ... */
    }
    export class Square {
      /* ... */
    }
  }
  ```

El espacio de nombres de nivel superior aquí `Shapes` envuelve `Triangle` y `Square` sin ningún motivo.
Esto es confuso y molesto para los consumidores de tu módulo:

- `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
  ```

Una característica clave de los módulos en *TypeScript* es que dos módulos diferentes nunca contribuirán con nombres al mismo ámbito.
Debido a que el consumidor de un módulo decide qué nombre asignarle, no es necesario envolver proactivamente los símbolos exportados en un espacio de nombres.

Para reiterar por qué no deberías intentar usar espacios de nombres en el contenido del módulo, la idea general del espacio de nombres es proporcionar agrupaciones de construcciones lógicas y evitar colisiones de nombres.
Debido a que el archivo de módulo en sí ya es una agrupación lógica y su nombre de nivel superior está definido por el código que lo importa, no es necesario utilizar una capa de módulo adicional para los objetos exportados.

Aquí hay un ejemplo revisado:

- `shapes.ts`

  ```ts
  export class Triangle {
    /* ... */
  }
  export class Square {
    /* ... */
  }
  ```

- `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Triangle();
  ```

## Compensación de módulos

Así como existe una correspondencia uno a uno entre los archivos *JS* y los módulos, *TypeScript* tiene una correspondencia uno a uno entre los archivos fuente del módulo y sus archivos *JS* emitidos.
Un efecto de esto es que no es posible concatenar múltiples archivos fuente de módulos dependiendo del sistema de módulos al que se dirige.
Por ejemplo, no puedes usar la opción [`outFile`](/tsconfig#outFile) mientras apuntas a `commonjs` o `umd`, pero con *TypeScript 1.8* y versiones posteriores, [es posible](./release-notes/typescript-1-8.html#concatenate-amd-and-system-modules-with--- outfile) para usar [`outFile`](/tsconfig#outFile) al apuntar a `amd` o `system`.
