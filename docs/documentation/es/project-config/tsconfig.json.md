---
title: ¿Qué es un tsconfig.json?
layout: docs
permalink: /docs/handbook/tsconfig-json.html
oneline: Más información sobre cómo funciona TSConfig
translatable: true
---

## Descripción general

La presencia de un archivo `tsconfig.json` en un directorio indica que el directorio es la raíz de un proyecto *TypeScript*.
El archivo `tsconfig.json` especifica los archivos raíz y las opciones de compilación requeridas para compilar el proyecto.

Los proyectos *JavaScript* pueden usar un archivo `jsconfig.json` en su lugar, que actúa casi de la misma manera pero tiene algunos indicadores de compilador relacionados con *JavaScript* habilitados de forma predeterminada.

Un proyecto se compila de una de las siguientes maneras:

## Usan `tsconfig.json` o `jsconfig.json`

- Invocando a `tsc` sin archivos de entrada, en cuyo caso el compilador busca el archivo `tsconfig.json` comenzando en el directorio actual y continuando hacia arriba en la cadena del directorio principal.
- Invocando a `tsc` sin archivos de entrada y una opción de línea de comando `--project` (o simplemente `-p`) que especifica la ruta de un directorio que contiene un archivo `tsconfig.json`, o una ruta a un archivo `.json` válido que contiene las configuraciones.

Cuando los archivos de entrada se especifican en la línea de comandos, los archivos `tsconfig.json` se ignoran.

## Ejemplos

Archivos `tsconfig.json` de ejemplo:

- Usar la propiedad [`files`](/tsconfig#files)

  ```json tsconfig
  {
    "compilerOptions": {
      "module": "commonjs",
      "noImplicitAny": true,
      "removeComments": true,
      "preserveConstEnums": true,
      "sourceMap": true
    },
    "files": [
      "core.ts",
      "sys.ts",
      "types.ts",
      "scanner.ts",
      "parser.ts",
      "utilities.ts",
      "binder.ts",
      "checker.ts",
      "emitter.ts",
      "program.ts",
      "commandLineParser.ts",
      "tsc.ts",
      "diagnosticInformationMap.generated.ts"
    ]
  }
  ```

- Usar las propiedades [`include`](/tsconfig#include) y `exclude`

  ```json  tsconfig
  {
    "compilerOptions": {
      "module": "system",
      "noImplicitAny": true,
      "removeComments": true,
      "preserveConstEnums": true,
      "outFile": "../../built/local/tsc.js",
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.spec.ts"]
  }
  ```

## Bases de `TSConfig`

Dependiendo del entorno de ejecución de *JavaScript* en el que pretendas ejecutar tu código, puede haber una configuración base que puedes usar en [github.com/tsconfig/bases](https://github.com/tsconfig/bases/).
Estos son archivos `tsconfig.json` de los cuales se extiende tu proyecto y que simplifican tu `tsconfig.json` al manejar el soporte de el entorno de ejecución.

Por ejemplo, si estabas escribiendo un proyecto que usa *Node.js* versión 12 y superior, entonces podrías usar el módulo `npm` [`@tsconfig/node12`](https://www.npmjs.com/package/@tsconfig/node12):

```json tsconfig
{
  "extends": "@tsconfig/node12/tsconfig.json",

  "compilerOptions": {
    "preserveConstEnums": true
  },

  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

Esto le permite a tu `tsconfig.json` enfocarse en las opciones únicas para tu proyecto, y no en todas las mecánicas de ejecución. Ya hay algunas bases de `tsconfig` y esperamos que la comunidad pueda agregar más para diferentes entornos.

- [Recomendada](https://www.npmjs.com/package/@tsconfig/recommended)
- [*Node 10*](https://www.npmjs.com/package/@tsconfig/node10)
- [*Node 12*](https://www.npmjs.com/package/@tsconfig/node12)
- [*Node 14*](https://www.npmjs.com/package/@tsconfig/node14)
- [Node 16](https://www.npmjs.com/package/@tsconfig/node16)
- [*Deno*](https://www.npmjs.com/package/@tsconfig/deno)
- [*React Native*](https://www.npmjs.com/package/@tsconfig/react-native)
- [*Svelte*](https://www.npmjs.com/package/@tsconfig/svelte)

## Detalles

Se puede omitir la propiedad `"compilerOptions"`, en cuyo caso se utilizan los valores predeterminados del compilador. Consulta nuestra lista completa de [Opciones compatibles del compilador](/tsconfig).

## Referencia de `TSConfig`

Para obtener más información sobre los cientos de opciones de configuración en la [Referencia de *TSConfig*](/tsconfig).

## Esquema

El esquema `tsconfig.json` se puede encontrar en [el almacén de esquemas *JSON*](http://json.schemastore.org/tsconfig).
