---
title: Directivas de triple barra
layout: docs
permalink: /docs/handbook/triple-slash-directives.html
oneline: Cómo usar las directivas de triple barra en TypeScript
translatable: true
---

Las directivas de triple barra son comentarios de una sola línea que contienen una sola etiqueta *XML*.
El contenido del comentario se utiliza como directivas del compilador.

Las directivas de triple barra **solo** son válidas en la parte superior de su archivo contenedor.
Una directiva de triple barra solo puede ir precedida de comentarios de una o varias líneas, incluidas otras directivas de triple barra.
Si se encuentran después de una declaración o instrucción, se tratan como comentarios regulares de una sola línea y no tienen un significado especial.

## `/// <reference path="..." />`

La directiva `/// <reference path="..."/>` es la más común de este grupo.
Sirve como una declaración de *dependencia* entre archivos.

Las referencias de triple barra indican al compilador que incluya archivos adicionales en el proceso de compilación.

También sirven como un método para ordenar la salida cuando se usa [`out`](/tsconfig#out) o [`outFile`](/tsconfig#outFile).
Los archivos se emiten a la ubicación del archivo de salida en el mismo orden que la entrada después de la pasada de preprocesamiento.

### Procesamiento previo de archivos de entrada

El compilador realiza una pasada de preprocesamiento en los archivos de entrada para resolver todas las directivas de referencia de triple barra.
Durante este proceso, se agregan archivos adicionales a la compilación.

El proceso comienza con un conjunto de *archivos raíz*;
Estos son los nombres de archivo especificados en la línea de comandos o en la lista [`files`](/tsconfig#files) del archivo `tsconfig.json`.
Estos archivos raíz se preprocesan en el mismo orden en que se especifican.
Antes de agregar un archivo a la lista, se procesan todas las referencias de triple barra y se incluyen sus destinos.
Las referencias de triple barra se resuelven primero en profundidad, en el orden en que se han visto en el archivo.

Una ruta de referencia de triple barra se resuelve en relación con el archivo que la contiene, si se utiliza una ruta relativa.

### Errores

Es un error hacer referencia a un archivo que no existe.
Es un error que un archivo tenga una referencia de triple barra a sí mismo.

### Usar `--noResolve`

Si se especifica el indicador del compilador [`noResolve`](/tsconfig#noResolve), se ignoran las referencias de triple barra; no dan como resultado la adición de nuevos archivos ni cambian el orden de los archivos proporcionados.

## `/// <reference types="..." />`

Similar a una directiva `/// <reference path="..."/>`, que sirve como una declaración de *dependencia*, una directiva `/// <reference types="..."/>` declara una dependencia en un paquete.

El proceso de resolución de estos nombres de paquetes es similar al proceso de resolución de nombres de módulos en una declaración `import`.
Una forma fácil de pensar en las directivas de referencia de tipos de triple barra es como una `import` para la declaración de paquetes.

Por ejemplo, incluye `/// <reference types="node"/>` en un archivo de declaración que declara este archivo usa nombres declarados en `@types/node/index.d.ts`;
y por lo tanto, este paquete se debe incluir en la compilación junto con el archivo de declaración.

Utiliza estas directivas solo cuando estés creando un archivo `d.ts` a mano.

Para los archivos de declaración generados durante la compilación, el compilador agregará automáticamente `/// <reference types="..."/>` para ti;
Un `/// <reference types="..."/>` en un archivo de declaración generado se agrega *si y solo si* el archivo resultante usa cualquier declaración del paquete referenciado.

Para declarar una dependencia en un paquete `@types` en un archivo `.ts`, usa [`types`](/tsconfig#types) en la línea de comando o en tu `tsconfig.json` en su lugar.
Consulta [uso de `@types`, `typeRoots` y `types` en archivos `tsconfig.json`](/docs/handbook/tsconfig-json.html#types-typeroots-and-types) para obtener más detalles.

## `/// <reference lib="..." />`

Esta directiva permite que un archivo incluya explícitamente un archivo `lib` incorporado existente.

Los archivos `lib` incorporados se referencian de la misma manera que la opción [`lib`](/tsconfig#lib) del compilador en `tsconfig.json` (por ejemplo, usa `lib="es2015"` y no `lib="lib.es2015.d.ts"`, etc.).

Para los autores de archivos de declaración que se basan en tipos integrados, p. ej. se recomiendan las *API DOM* o los constructores *JS* incorporados en el entorno de ejecución como `Symbol` o `Iterable`, las directivas `lib` de referencia de triple barra inclinada. Anteriormente, estos archivos `.d.ts` tenían que agregar declaraciones de reenvío/duplicado de este tipo.

Por ejemplo, agregar `/// <reference lib="es2017.string"/>` a uno de los archivos en una compilación es equivalente a compilar con `--lib es2017.string`.

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```

## `/// <reference no-default-lib="true"/>`

Esta directiva marca un archivo como una *biblioteca predeterminada*.
Verás este comentario en la parte superior de `lib.d.ts` y sus diferentes variantes.

Esta directiva le indica al compilador que *no* incluya la biblioteca predeterminada (es decir, `lib.d.ts`) en la compilación.
El impacto aquí es similar a pasar [`noLib`](/tsconfig#noLib) en la línea de comandos.

También ten en cuenta que al pasar [`skipDefaultLibCheck`](/tsconfig#skipDefaultLibCheck), el compilador solo saltará los archivos de verificación con `/// <reference no-default-lib="true" />`.

## `/// <amd-module />`

De manera predeterminada, los módulos *AMD* se generan de forma anónima.
Esto puede generar problemas cuando se utilizan otras herramientas para procesar los módulos resultantes, como los paquetes (por ejemplo, `r.js`).

La directiva `amd-module` permite pasar un nombre de módulo opcional al compilador:

##### `amdModule.ts`

```ts
///<amd-module name="NamedModule"/>
export class C {}
```

Dará como resultado la asignación del nombre `NamedModule` al módulo como parte de la llamada a *AMD* `define`:

##### `amdModule.js`

```js
define("NamedModule", ["require", "exports"], function (require, exports) {
  var C = (function () {
    function C() {}
    return C;
  })();
  exports.C = C;
});
```

## `/// <amd-dependency />`

> **Nota**: esta directiva ha quedado obsoleta. Utiliza instrucciones `import "nombreModulo";` en su lugar.

`/// <amd-dependency path="x"/>` informa al compilador sobre una dependencia de un módulo que no es *TS* que se debe inyectar en la llamada `require` del módulo resultante.

La directiva `amd-dependency` también puede tener una propiedad `name` opcional; esto permite pasar un nombre opcional para una dependencia `amd`:

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA: MyType;
moduleA.callStuff();
```

Código *JS* generado:

```js
define(["require", "exports", "legacy/moduleA"], function (
  require,
  exports,
  moduleA
) {
  moduleA.callStuff();
});
```
