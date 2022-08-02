---
title: Resolución de módulo
layout: docs
permalink: /docs/handbook/module-resolution.html
oneline: Cómo resuelve TypeScript módulos en JavaScript
translatable: true
---

> Esta sección asume algunos conocimientos básicos sobre módulos.
> Consulta la documentación de [Módulos](/docs/handbook/modules.html) para obtener más información.

*Resolución de módulo* es el proceso que utiliza el compilador para averiguar a qué se refiere una importación.
Considera una declaración de importación como `import {a} from "moduleA"`;
Para comprobar cualquier uso de `a`, el compilador necesita saber exactamente lo que representa, y deberá comprobar su definición en `moduleA`.

En este punto, el compilador preguntará "¿cuál es la forma de `moduleA`?"
Si bien esto suena sencillo, `moduleA` podría se definir en uno de sus propios archivos `.ts`/`.tsx`, o en un `.d.ts` del que depende tu código.

Primero, el compilador intentará localizar un archivo que represente el módulo importado.
Para hacerlo, el compilador sigue una de dos diferentes estrategias: [`Classic`](#classic) o [`Node`](#node).
Estas estrategias le dicen al compilador *donde* buscar `moduleA`.

Si eso no funcionó y si el nombre del módulo no es relativo (y en el caso de `"moduleA"`, lo es), entonces el compilador intentará localizar una [declaración de módulos ambientales](/docs/handbook/modules.html#modulos-ambientales).
A continuación, cubriremos las importaciones no relativas.

Finalmente, si el compilador no pudo resolver el módulo, registrará un error.
En este caso, el error sería algo así como `error TS2307: No se puede encontrar el módulo 'moduleA'`.

## Importación de módulos relativos vs. no relativos

Las importaciones de módulos se resuelven de manera diferente en función de si la referencia del módulo es relativa o no relativa.

Una *importación relativa* es aquella que comienza con `/`,  `. /` o `../`.
Algunos ejemplos incluyen:

- `import Entry from "./components/Entry";`
- `import { DefaultHeaders } from "../constants/http";`
- `import "/mod";`

Cualquier otra importación se considera **no relativa**.
Algunos ejemplos incluyen:

- `import * as $ from "jquery";`
- `import { Component } from "@angular/core";`

Una importación relativa se resuelve en relación con el archivo de importación y *no se puede resolver* en una declaración de módulo ambiental.
Debes usar importaciones relativas para tus propios módulos que está garantizado que mantienes su ubicación relativa en el entorno de ejecución.

Una importación no relativa se puede resolver en relación con [`baseUrl`](/tsconfig#baseUrl), o mediante el mapeo de rutas, que cubriremos a continuación.
También se pueden resolver en [declaraciones de módulos ambientales](/docs/handbook/modules.html#modulos-ambientales).
Utiliza rutas no relativas al importar cualquiera de tus dependencias externas.

## Estrategias de resolución de módulos

Hay dos posibles estrategias de resolución de módulos: [`Node`](#node) y [`Classic`](#classic).
Puedes usar la opción [`moduleResolution`](/tsconfig#moduleResolution) para especificar la estrategia de resolución del módulo.
Si no se especifica, el valor predeterminado es [`Node`](#node) para `--module commonjs`, y [`Classic`](#classic) de lo contrario (incluso cuando [`module`](/tsconfig#module) se establece en `amd`, `system`, `umd`, `es2015`, `esnext`, etc.).

> Nota: La resolución del módulo `node` es la más utilizada en la comunidad *TypeScript* y se recomienda para la mayoría de los proyectos.
> Si tienes problemas de resolución con `import`s y `export`s en *TypeScript*, intenta configurar `moduleResolution: "node"` para ver si solucionas el problema.

### `Classic`

Esta solía ser la estrategia de resolución predeterminada de *TypeScript*.
Hoy en día, esta estrategia está presente principalmente por compatibilidad con versiones anteriores.

Se resolverá una importación relativa en relación con el archivo de importación.
Entonces, `import {b} from "./moduleB "` en el archivo fuente `/root/src/folder/A.ts` resultaría en las siguientes búsquedas:

1. `/root/src/folder/moduleB.ts`
2. `/root/src/folder/moduleB.d.ts`

Sin embargo, para las importaciones de módulos no relativos, el compilador recorre el árbol de directorios comenzando con el directorio que contiene el archivo de importación, tratando de localizar un archivo de definición coincidente.

Por ejemplo:

Una importación no relativa a `moduleB` como `import {b} from "moduleB"`, en un archivo fuente `/root/src/folder/A.ts`, resultaría en intentar las siguientes ubicaciones para localizar `"moduleB"`:

1. `/root/src/folder/moduleB.ts`
2. `/root/src/folder/moduleB.d.ts`
3. `/root/src/moduleB.ts`
4. `/root/src/moduleB.d.ts`
5. `/root/moduleB.ts`
6. `/root/moduleB.d.ts`
7. `/moduleB.ts`
8. `/moduleB.d.ts`

### Node

Esta estrategia de resolución intenta imitar el mecanismo de resolución de módulos [`Node.js`](https://nodejs.org/) en el entorno de ejecución.
El algoritmo de resolución completo de `Node.js` se describe en la [documentación del módulo `Node.js`](https://nodejs.org/api/modules.html#modules_all_together).

#### Cómo resuelve `Node.js` los módulos

Para comprender qué pasos seguirá el compilador de *TS*, es importante arrojar algo de luz sobre los módulos de `Node.js`.
Tradicionalmente, las importaciones en `Node.js` se realizan llamando a una función llamada `require`.
El comportamiento que adopte `Node.js` será diferente dependiendo de si a `require` se le da una ruta relativa o una ruta no relativa.

Las rutas relativas son bastante sencillas.
Como ejemplo, consideremos un archivo ubicado en `/root/src/moduleA.js`, que contiene la importación `var x = require("./moduleB");`
`Node.js` resuelve esa importación en el siguiente orden:

1. Pregunta al archivo llamado `/root/src/moduleB.js`, si existe.

2. Pregunte al directorio `/root/src/moduleB` si contiene un archivo llamado `package.json` que especifica un módulo `"main"`.
   En nuestro ejemplo, si `Node.js` encuentra el archivo `/root/src/moduleB/package.json` que contiene `{ "main": "lib/mainModule.js" }`, entonces `Node.js` se referirá a `/root/src/moduleB/lib/mainModule.js`.

3. Pregunta al directorio `/root/src/moduleB` si contiene un archivo llamado `index.js`.
   Ese archivo se considera implícitamente el módulo `"main"` de ese directorio.

Puedes leer más sobre esto en la documentación de `Node.js` en [archivos de módulo](https://nodejs.org/api/modules.html#modules_file_modules) y [directorio de módulos](https://nodejs.org/api/modules.html#modules_folders_as_modules).

Sin embargo, la resolución para un [nombre de módulo no relativo](#importaciones-de-modulo-relativo-vs-no-relativo) se realiza de manera diferente.
*Node* buscará tus módulos en directorios especiales llamados `node_modules`.
Un directorio `node_modules` puede estar en el mismo nivel que el archivo actual, o más arriba en la cadena de directorios.
*Node* recorrerá la cadena de directorios, mirando a través de cada `node_modules` hasta que encuentre el módulo que intentó cargar.

Siguiendo nuestro ejemplo anterior, considera si `/root/src/moduleA.js` en su lugar usó una ruta no relativa y tenía la importación `var x = require("moduleB");`.
Entonces, *Node* intentaría resolver `moduleB` en cada una de las ubicaciones hasta que una funcione.

1. `/root/src/node_modules/moduleB.js`
2. `/root/src/node_modules/moduleB/package.json` (si especifica una propiedad `"main"`)
3. `/root/src/node_modules/moduleB/index.js`
   <br /><br />
4. `/root/node_modules/moduleB.js`
5. `/root/node_modules/moduleB/package.json` (si especifica una propiedad `"main"`)
6. `/root/node_modules/moduleB/index.js`
   <br /><br />
7. `/node_modules/moduleB.js`
8. `/node_modules/moduleB/package.json` (si especifica una propiedad `"main"`)
9. `/node_modules/moduleB/index.js`

Observa que `Node.js` subió un directorio en los pasos (4) y (7).

Puedes leer más sobre el proceso en la documentación de `Node.js` en [cargar módulos desde `node_modules`](https://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders).

#### Cómo resuelve los módulos *TypeScript*

*TypeScript* imitará la estrategia de resolución en el entorno de ejecución de `Node.js` para localizar archivos de definición de módulos en tiempo de compilación.
Para lograr esto, *TypeScript* superpone las extensiones de archivo fuente de *TypeScript* (`.ts`, `.tsx` y `.d.ts`) sobre la lógica de resolución de *Node*.
*TypeScript* también usa un campo en `package.json` llamado `"types"` para reflejar el propósito de`"main"` ⏤ el compilador lo usará para encontrar el archivo de definición `"main"` para consultar.

Por ejemplo, una declaración de importación como `import{b} from "./moduleB"` en `/root/src/moduleA.ts` daría como resultado intentar las siguientes ubicaciones para localizar `"./moduleB"`:

1. `/root/src/moduleB.ts`
2. `/root/src/moduleB.tsx`
3. `/root/src/moduleB.d.ts`
4. `/root/src/moduleB/package.json` (si especifica una propiedad `types`)
5. `/root/src/moduleB/index.ts`
6. `/root/src/moduleB/index.tsx`
7. `/root/src/moduleB/index.d.ts`

Recuerda que `Node.js` buscó un archivo llamado `moduleB.js`, luego un `package.json` aplicable, y luego un `index.js`.

De manera similar, una importación no relativa seguirá la lógica de resolución de `Node.js`, primero buscando un archivo y luego buscando un directorio aplicable.
Entonces, `import { b } from "moduleB"` en el archivo fuente `/root/src/moduleA.ts` resultaría en las siguientes búsquedas:

1. `/root/src/node_modules/moduleB.ts`
2. `/root/src/node_modules/moduleB.tsx`
3. `/root/src/node_modules/moduleB.d.ts`
4. `/root/src/node_modules/moduleB/package.json` (si especifica una propiedad `types`)
5. `/root/src/node_modules/@types/moduleB.d.ts`
6. `/root/src/node_modules/moduleB/index.ts`
7. `/root/src/node_modules/moduleB/index.tsx`
8. `/root/src/node_modules/moduleB/index.d.ts`
   <br /><br />
9. `/root/node_modules/moduleB.ts`
10. `/root/node_modules/moduleB.tsx`
11. `/root/node_modules/moduleB.d.ts`
12. `/root/node_modules/moduleB/package.json` (si especifica una propiedad `types`)
13. `/root/node_modules/@types/moduleB.d.ts`
14. `/root/node_modules/moduleB/index.ts`
15. `/root/node_modules/moduleB/index.tsx`
16. `/root/node_modules/moduleB/index.d.ts`
    <br /><br />
1. `/node_modules/moduleB.ts`
1. `/node_modules/moduleB.tsx`
1. `/node_modules/moduleB.d.ts`
1. `/node_modules/moduleB/package.json` (si especifica una propiedad `types`)
1. `/node_modules/@types/moduleB.d.ts`
1. `/node_modules/moduleB/index.ts`
1. `/node_modules/moduleB/index.tsx`
1. `/node_modules/moduleB/index.d.ts`

No te dejes intimidar por la cantidad de pasos aquí ⏤ *TypeScript* solo está saltando directorios dos veces en los pasos (9) y (17).
En realidad, esto no es más complejo que lo que hace `Node.js`.

## Indicadores de resolución de módulo adicional

La composición de una fuente de proyecto a veces no coincide con la de la salida.
Por lo general, un conjunto de pasos de construcción dan como resultado la generación del resultado final.
Estos incluyen compilar archivos `.ts` en `.js` y copiar dependencias de diferentes ubicaciones de origen a una única ubicación de salida.
El resultado neto es que los módulos en el entorno de ejecución pueden tener nombres diferentes a los de los archivos fuente que contienen sus definiciones.
O las rutas de los módulos en la salida final pueden no coincidir con sus rutas de archivo fuente correspondientes en el momento de la compilación.

El compilador de *TypeScript* tiene un conjunto de indicadores adicionales para *informar* al compilador de las transformaciones que se espera que sucedan en las fuentes para generar el resultado final.

Es importante notar que el compilador *no* realizará ninguna de estas transformaciones;
simplemente usa estos datos para guiar el proceso de resolución de la importación de un módulo a su archivo de definición.

### *URL* base

El uso de [`baseUrl`](/tsconfig#baseUrl) es una práctica común en aplicaciones que usan cargadores de módulos *AMD* donde los módulos se "implementan" en un solo directorio en el entorno de ejecución.
Las fuentes de estos módulos pueden residir en diferentes directorios, pero un script de compilación los pondrá todos juntos.

La configuración de [`baseUrl`](/tsconfig#baseUrl) informa al compilador dónde encontrar módulos.
Se supone que todas las importaciones de módulos con nombres no relativos son relativas a [`baseUrl`](/tsconfig#baseUrl).

El valor de `baseUrl` se determina como:

- valor del argumento `baseUrl` de la línea de comandos (si la ruta dada es relativa, se calcula en base al directorio actual)
- valor de la propiedad `baseUrl` en `'tsconfig.json'` (si la ruta dada es relativa, se calcula en función de la ubicación de `'tsconfig.json'`)

Ten en cuenta que las importaciones relativas de módulos no se ven afectadas por la configuración de `baseUrl`, ya que siempre se resuelven en relación con sus archivos de importación.

Puedes encontrar más documentación sobre `baseUrl` en [`RequireJS`](http://requirejs.org/docs/api.html#config-baseUrl) y en la documentación de [`SystemJS`](https://github.com/systemjs/systemjs/blob/main /docs/api.md).

### Mapeo de rutas

A veces, los módulos no se encuentran directamente en `baseUrl`.
Por ejemplo, una importación a un módulo `"jquery"` se traduciría en el entorno de ejecución a `"node_modules/jquery/dist/jquery.slim.min.js"`.
Los cargadores utilizan una configuración de mapeo para asignar nombres de módulos a archivos en el entorno de ejecución, consulta la [documentación de `RequireJS`](http://requirejs.org/docs/api.html#config-paths) y la [documentación de `SystemJS`](https://github.com/systemjs/systemjs/blob/main/docs/import-maps.md).

El compilador `TypeScript` admite la declaración de tales mapeos usando la propiedad [`path`(/tsconfig#path) en los archivos `tsconfig.json`.
Aquí hay un ejemplo de cómo especificar la propiedad [`path`](/tsconfig#path) para `jquery`.

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": ".", // Esto se debe especificar si "paths" es.
    "paths": {
      "jquery": ["node_modules/jquery/dist/jquery"] // Este mapeo es relativo a "baseUrl"
    }
  }
}
```

Ten en cuenta que [`paths`](/tsconfig#paths) se resuelven en relación con [`baseUrl`](/tsconfig#baseUrl).
Al configurar [`baseUrl`](/tsconfig#baseUrl) a otro valor que`"."`, es decir, el directorio de `tsconfig.json`, las asignaciones se deben cambiar en consecuencia.
Digamos, que estableces `"baseUrl"` en: `"./src"` en el ejemplo anterior, entonces `jquery` se debe mapear a `"../node_modules/jquery/dist/jquery"`.

El uso de [`paths`](/tsconfig#paths) también permite mapeos más sofisticados que incluyen múltiples ubicaciones de respaldo.
Considera una configuración de proyecto en la que solo algunos módulos están disponibles en una ubicación y el resto en otra.
Un paso de construcción los pondría a todos juntos en un solo lugar.
La composición del proyecto se puede ver así:

```tree
projectRoot
├── folder1
│   ├── file1.ts (imports 'folder1/file2' y 'folder2/file3')
│   └── file2.ts
├── generated
│   ├── folder1
│   └── folder2
│       └── file3.ts
└── tsconfig.json
```

El `tsconfig.json` correspondiente se vería así:

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": ["*", "generated/*"]
    }
  }
}
```

Esto le dice al compilador que para cualquier importación de módulo que coincida con el patrón `"*"` (es decir, todos los valores), busque en dos ubicaciones:

1.  `"*"`: es decir, el mismo nombre sin cambios, así que mapee `<moduleName>` => `<baseUrl>/<moduleName>`
2.  `"generated/*"` es decir, el nombre del módulo con un prefijo añadido `"generated"`, así que mapee `<moduleName>` => `<baseUrl>/generated/<moduleName>`

Siguiendo esta lógica, el compilador intentará resolver las dos importaciones tal como:

import 'folder1/file2':

1.  el patrón `'\*'` coincide y el comodín captura todo el nombre del módulo
2.  prueba la primera sustitución en la lista: `'\*' -> folder1/file2`
3.  el resultado de la sustitución es un nombre no relativo ⏤ combínalo con `baseUrl` -> `projectRoot/folder1/file2.ts`.
4.  El archivo existe. Hecho.

import 'folder2/file3':

1.  el patrón `'\*'` coincide y el comodín captura todo el nombre del módulo
2.  prueba la primera sustitución en la lista: '\*' -> `folder2/file3`
3.  el resultado de la sustitución es un nombre no relativo ⏤ combínalo con `baseUrl` -> `projectRoot/folder2/file3.ts`.
4.  El archivo no existe, pasa a la segunda sustitución
5.  segunda sustitución 'generated/\*' -> `generated/folder2/file3`
6.  el resultado de la sustitución es un nombre no relativo ⏤ combínalo con `baseUrl` -> `projectRoot/ generated/folder2/file3.ts`.
7.  El archivo existe. Hecho.

### Directorios virtuales con `rootDirs`

A veces, las fuentes del proyecto de varios directorios en tiempo de compilación se combinan para generar un único directorio de salida.
Esto se puede ver como un conjunto de directorios de origen que crea un directorio "virtual".

Usar `rootDirs`, puedes informar al compilador de las `roots` que componen este directorio "virtual";
y así el compilador puede resolver las importaciones de módulos relativos dentro de estos directorios "virtuales" *como si* estuvieran fusionados en un directorio.

Por ejemplo, considera la estructura de este proyecto:

```tree
 src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

Los archivos en `src/views` son código de usuario para algunos controles de IU.
Los archivos en `generated/templates` son código de enlace de plantillas de IU generados automáticamente por un generador de plantillas como parte de la compilación.
Un paso de compilación copiará los archivos en `/src/views` y `/generated/templates/views` en el mismo directorio en la salida.
En el entorno de ejecución, una vista puede esperar que su plantilla exista junto a ella y, por lo tanto, debería importarla usando un nombre relativo como `"./template"`.

Para especificar esta relación al compilador, usa [`rootDirs`](/tsconfig#rootDirs).
[`rootDirs`[(/tsconfig#rootDirs) especifica una lista de `roots` cuyo contenido se espera que se fusionen en el entorno de ejecución.
Entonces, siguiendo nuestro ejemplo, el archivo `tsconfig.json` se debería ver así:

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src/views", "generated/templates/views"]
  }
}
```

Cada vez que el compilador ve una importación de módulo relativa en un subdirectorio de uno de los [`rootDirs`](/tsconfig#rootDirs), intentará buscar esta importación en cada una de las entradas de [`rootDirs`](/tsconfig#rootDirs).

La flexibilidad de [`rootDirs`](/tsconfig#rootDirs) no se limita a especificar una lista de directorios de origen físicos que se fusionan lógicamente. El arreglo proporcionado puede incluir cualquier número de nombres de directorio arbitrarios ad hoc, independientemente de si existen o no. Esto permite que el compilador capture sofisticadas características de agrupación y el entorno de ejecución, como la inclusión condicional y los complementos de carga específicos del proyecto, de forma segura.

Considera un escenario de internacionalización en el que una herramienta de compilación automáticamente genera paquetes específicos de configuración regional interpolando un `token` de ruta especial, por ejemplo, `#{locale}`, como parte de una ruta de módulo relativa como `./#{locale}/messages`. En esta hipotética configuración, la herramienta enumera las configuraciones regionales admitidas, mapeando la ruta abstraída en `./zh/messages`, `./de/messages`, y así sucesivamente.

Supongamos que cada uno de estos módulos exporta un arreglo de cadenas. Por ejemplo, `./zh/messages` podría contener:

```ts
export default ["您好吗", "很高兴认识你"];
```

Aprovechando [`rootDirs`](/tsconfig#rootDirs) podemos informar al compilador de este mapeo y así permitir que resuelva de forma segura `./#{locale}/messages`, aunque el directorio nunca existirá. Por ejemplo, con el siguiente `tsconfig.json`:

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src/zh", "src/de", "src/#{locale}"]
  }
}
```

El compilador ahora resolverá `import mensajes de './#{locale}/messages'`  a `import messages from, './zh/messages'` para propósitos de las herramientas, permitiendo el desarrollo de una manera independiente de la configuración regional sin comprometer el tiempo de diseño.

## Seguimiento de la resolución de módulo

Como se explicó anteriormente, el compilador puede visitar archivos fuera del directorio actual al resolver un módulo.
Esto puede ser difícil al diagnosticar por qué un módulo no se resuelve o se resuelve con una definición incorrecta.
Habilitar el seguimiento de la resolución de módulos del compilador usando [`traceResolution`](/tsconfig#traceResolution) proporciona información sobre lo que sucedió durante el proceso de resolución del módulo.

Digamos que tenemos una aplicación de ejemplo que usa el módulo `typecsript`.
`app.ts` tiene una importación como `import * as ts from "typescript"`.

```tree
│   tsconfig.json
├───node_modules
│   └───typescript
│       └───lib
│               typescript.d.ts
└───src
        app.ts
```

Invocar al compilador con [`traceResolution`](/tsconfig#traceResolution)

```shell
tsc --traceResolution
```

Da como resultado una salida como:

```text
======== Resolving module 'typescript' from 'src/app.ts'. ========
Module resolution kind is not specified, using 'NodeJs'.
Loading module 'typescript' from 'node_modules' folder.
File 'src/node_modules/typescript.ts' does not exist.
File 'src/node_modules/typescript.tsx' does not exist.
File 'src/node_modules/typescript.d.ts' does not exist.
File 'src/node_modules/typescript/package.json' does not exist.
File 'node_modules/typescript.ts' does not exist.
File 'node_modules/typescript.tsx' does not exist.
File 'node_modules/typescript.d.ts' does not exist.
Found 'package.json' at 'node_modules/typescript/package.json'.
'package.json' has 'types' field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.
File 'node_modules/typescript/lib/typescript.d.ts' exist - use it as a module resolution result.
======== Module name 'typescript' was successfully resolved to 'node_modules/typescript/lib/typescript.d.ts'. ========
```

#### Cosas a tener en cuenta

- Nombre y ubicación de la importación

> ======== Resolving module **'typescript'** from **'src/app.ts'**. ========

- La estrategia que sigue el compilador

> Module resolution kind is not specified, using **'NodeJs'**.

- Carga de tipos de paquetes `npm`

> 'package.json' has **'types'** field './lib/typescript.d.ts' that references 'node_modules/typescript/lib/typescript.d.ts'.

- Resultado final

> ======== Module name 'typescript' was **successfully resolved** to 'node_modules/typescript/lib/typescript.d.ts'. ========

## Usar `--noResolve`

Normalmente, el compilador intentará resolver todas las importaciones de módulos antes de iniciar el proceso de compilación.
Cada vez que resuelve con éxito una `import` a un archivo, el archivo se agrega al conjunto de archivos que el compilador procesará más adelante.

Las opciones [`noResolve`](/tsconfig#noResolve) del compilador le indican al compilador que no "agregue" ningún archivo a la compilación que no se haya pasado en la línea de comandos.
Seguirá intentando resolver el módulo en archivos, pero si no se especifica el archivo, no se incluirá.

Por ejemplo:

#### app.ts

```ts
import * as A from "moduleA"; // Bien, 'moduleA' pasó en la línea de comandos
import * as B from "moduleB"; // Error TS2307: No se puede encontrar el módulo 'moduleB'.
```

```shell
tsc app.ts moduleA.ts --noResolve
```

Compilar `app.ts` usando [`noResolve`](/tsconfig#noResolve) debería resultar en:

- Encontrar correctamente `moduleA` tal como se pasó en la línea de comandos.
- Error por no encontrar `moduleB` porque no fue aprobado.

## Preguntas comunes

### ¿Por qué el compilador sigue seleccionando un módulo de la lista de exclusión?

`tsconfig.json` convierte un directorio en un "proyecto".
Sin especificar ninguna entrada `"exclude"` o `"files"`, todos los archivos del directivo que contiene el "tsconfig.json" y todos sus subdirectorios se incluyen en su compilación.
Si deseas excluir algunos de los archivos, utiliza `"exclude"`, si prefieres especificar todos los archivos en lugar de dejar que el compilador los busque, utiliza `"files"`.

Esa fue la inclusión automática de `tsconfig.json`.
Eso no incrusta la resolución del módulo como se explicó anteriormente.
Si el compilador identificó un archivo como destino de la importación de un módulo, se incluirá en la compilación independientemente de si se excluyó en los pasos anteriores.

Entonces, para excluir un archivo de la compilación, lo debes excluir y **todos** los archivos que tienen una directiva `import` o `/// <reference path="..." />`.
