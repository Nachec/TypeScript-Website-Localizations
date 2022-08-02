---
title: Referencia de proyectos
layout: docs
permalink: /docs/handbook/project-references.html
oneline: Cómo dividir un gran proyecto de TypeScript
translatable: true
---

Las referencias de proyectos son una nueva característica de *TypeScript 3.0* que te permite estructurar tus programas *TypeScript* en partes más pequeñas.

Al hacer esto, puedes mejorar en gran medida los tiempos de compilación, reforzar la separación lógica entre componentes y organizar tu código de nuevas y mejores formas.

También estamos introduciendo un nuevo modo para `tsc`, el indicador `--build`, que funciona de la mano con las referencias del proyecto para permitir compilaciones de *TypeScript* más rápidas.

## Un proyecto de ejemplo

Veamos un programa bastante normal y veamos cómo las referencias de proyectos pueden ayudarnos a organizarlo mejor.
Imagina que tienes un proyecto con dos módulos, `converter` y `units`, y un archivo de prueba correspondiente para cada uno:

```
/
├── src/
│   ├── converter.ts
│   └── units.ts
├── test/
│   ├── converter-tests.ts
│   └── units-tests.ts
└── tsconfig.json
```

Los archivos de prueba importan los archivos de implementación y realizan algunas pruebas:

```ts
// converter-tests.ts
import * as converter from "../converter";

assert.areEqual(converter.celsiusToFahrenheit(0), 32);
```

Anteriormente, era bastante incómodo trabajar con esta estructura si usabas un solo archivo `tsconfig`:

- Era posible que los archivos de implementación importaran los archivos de prueba.
- No era posible construir `test` y `src` al mismo tiempo sin que apareciera `src` en el nombre del directorio de salida, lo que probablemente no quieras
- Cambiar solo los *internals* en los archivos de implementación requeridos por las pruebas `typechecking` nuevamente, aunque esto nunca causaría nuevos errores
- Cambiar solo las pruebas requería verificar la implementación nuevamente, incluso si nada cambió

Puedes usar varios archivos `tsconfig` para resolver *algunos* de esos problemas, pero aparecerán otros nuevos:

- No hay una verificación de actualización incorporada, por lo que siempre terminas ejecutando `tsc` dos veces
- Invocar `tsc` dos veces implica más tiempo de inicio de sobrecarga
- `tsc -w` no se puede ejecutar en varios archivos de configuración a la vez

Las referencias de proyectos pueden resolver todos estos problemas y más.

## ¿Qué es una referencia de proyecto?

Los archivos `tsconfig.json` tienen una nueva propiedad de nivel superior, [`references`](/tsconfig#referencias). Es un arreglo de objetos que especifica proyectos a los que hacer referencia:

```js tsconfig
{
    "compilerOptions": {
        // Lo normal
    },
    "references": [
        { "path": "../src" }
    ]
}
```

La propiedad `path` de cada referencia puede apuntar a un directorio que contenga un archivo `tsconfig.json`, o al archivo de configuración en sí (que puede tener cualquier nombre).

Cuando haces referencia a un proyecto, suceden cosas nuevas:

- La importación de módulos de un proyecto referido cargará su archivo de declaración `output` (`.d.ts`)
- Si el proyecto al que se hace referencia produce un [`outFile`](/tsconfig#outFile), las declaraciones del archivo de salida `.d.ts` serán visibles en este proyecto
- El modo de construcción (ve más abajo) construirá automáticamente el proyecto al que se hace referencia si es necesario

Al separarse en varios proyectos, puedes mejorar en gran medida la velocidad de la verificación de tipos y la compilación, reducir el uso de memoria al usar un editor y mejorar la aplicación de las agrupaciones lógicas de tu programa.

## `composite`

Los proyectos referenciados deben tener habilitada la nueva configuración [`composite`](/tsconfig#composite).
Esta configuración es necesaria para garantizar que *TypeScript* pueda determinar rápidamente dónde encontrar las salidas del proyecto al que se hace referencia.
Habilitar el indicador [`composite`](/tsconfig#composite) cambia algunas cosas:

- La configuración [`rootDir`](/tsconfig#rootDir), si no se establece explícitamente, se establece de forma predeterminada en el directorio que contiene el archivo `tsconfig`
- Todos los archivos de implementación deben coincidir con un patrón [`include`](/tsconfig#include) o aparecer en el arreglo [`files`](/tsconfig#files). Si se viola esta restricción, `tsc` te informará qué archivos no se especificaron
- [`declaration`](/tsconfig#declaration) debe estar activada

## `declarationMap`s

También hemos agregado soporte para [mapas fuente de declaración](https://github.com/Microsoft/TypeScript/issues/14479).
Si habilita [`DeclarationMap`](/tsconfig#DeclarationMap), podrá utilizar funciones del editor como "Ir a la definición" y Renombrar para navegar y editar código de forma transparente a través de los límites del proyecto en editores compatibles.

## `prepend` con `outFile`

También puedes habilitar anteponer la salida de una dependencia usando la opción `prepend` en una referencia:

```js
   "references": [
       { "path": "../utils", "prepend": true }
   ]
```

Anteponer un proyecto incluirá el resultado del proyecto por encima del resultado del proyecto actual.
Todos los archivos de salida (`.js`, `.d.ts`, `.js.map`, `.d.ts.map`) se emitirán correctamente.

`tsc` solo usará archivos existentes en el disco para realizar este proceso, por lo que es posible crear un proyecto donde no se puede generar un archivo de salida correcto porque la salida de algún proyecto estaría presente más de una vez en el archivo resultante.
Por ejemplo:

```text
   A
  ^ ^
 /   \
B     C
 ^   ^
  \ /
   D
```

Es importante en esta situación no anteponer cada referencia, porque terminará con dos copias de "A" en la salida de "D" ⏤ esto puede dar lugar a resultados inesperados.

## Advertencias para las referencias de proyectos

Las referencias de proyectos tienen algunas ventajas y desventajas que debes conocer.

Debido a que los proyectos dependientes hacen uso de archivos `.d.ts` que se construyen a partir de sus dependencias, tendrás que verificar ciertos resultados de compilación *o* compilar un proyecto después de clonarlo antes de poder navegar por el proyecto en un editor sin ver falsos errores.

Cuando usamos *VS Code* (desde *TS 3.7*) tenemos un proceso de generación de `.d.ts` en memoria detrás de la escena que debería poder mitigar esto, pero tiene algunas implicaciones de rendimiento. Para proyectos compuestos muy grandes, puedes deshabilitar esto usando la [opción `disableSourceOfProjectReferenceRedirect`](/tsconfig#disableSourceOfProjectReferenceRedirect).

Además, para preservar la compatibilidad con los flujos de trabajo de compilación existentes, `tsc` *no* creará dependencias automáticamente a menos que se invoque con el modificador `--build`.
Aprendamos más sobre `--build`.

## Modo de compilación para *TypeScript*

Una característica largamente esperada son las compilaciones incrementales inteligentes para proyectos *TypeScript*.
En 3.0 puedes usar la bandera `--build` con `tsc`.
Este efectivamente es un nuevo punto de entrada para `tsc` que se comporta más como un orquestador de compilación que como un simple compilador.

Ejecutar `tsc --build` (`tsc -b` para abreviar) hará lo siguiente:

- Encuentra todos los proyectos referidos
- Detecta si están actualizados
- Crea proyectos desactualizados en el orden correcto

Puedes proporcionar `tsc -b` con múltiples rutas de archivo de configuración (por ejemplo, `tsc -b src test`).
Al igual que con `tsc -p`, especificar el nombre del archivo de configuración en sí no es necesario si se llama `tsconfig.json`.

## Línea de comandos `tsc -b`

Puedes especificar cualquier número de archivos de configuración:

```shell
 > tsc -b                            # Usa el tsconfig.json en el directorio actual
 > tsc -b src                        # Usa src/tsconfig.json
 > tsc -b foo/prd.tsconfig.json bar  # Usa foo/prd.tsconfig.json y bar/tsconfig.json
```

No te preocupes por ordenar los archivos que pasas en la línea de comandos: `tsc` los reordenará si es necesario para que las dependencias siempre se construyan primero.

También hay algunos indicadores específicos para `tsc -b`:

- [`--verbose`](/tsconfig#verbose): Imprime un registro detallado para explicar lo que está sucediendo (se puede combinar con cualquier otra bandera)
- `--dry`: Muestra lo que se haría pero en realidad no construye nada.
- `--clean`: Elimina los resultados de los proyectos especificados (se puede combinar con `--dry`)
- [`--force`](/tsconfig#force): Actúa como si todos los proyectos estuvieran desactualizados
- `--watch`: Modo observador (no se puede combinar con ninguna bandera excepto [`--verbose`](/tsconfig#verbose))

## Advertencias

Normalmente, `tsc` producirá salidas (`.js` y `.d.ts`) en presencia de errores de sintaxis o tipo, a menos que [`noEmitOnError`](/tsconfig#noEmitOnError) esté activado.
Hacer esto en un sistema de compilación incremental sería muy malo. si una de tus dependencias desactualizadas tuviera un nuevo error, solo lo vería *una vez* porque una compilación posterior omitiría la compilación del proyecto ahora actualizado.
Por esta razón, `tsc -b` actúa efectivamente como si [`noEmitOnError`](/tsconfig#noEmitOnError) estuviera habilitado para todos los proyectos.

Si verificas alguna salida de compilación (`.js`, `.d.ts`, `.d.ts.map`, etc.), es posible que debas ejecutar un [`--force`](/tsconfig#force) compila después de ciertas operaciones de control de fuente dependiendo de si tu herramienta de control de fuente conserva marcas de tiempo entre la copia local y la copia remota.

## `MSBuild`

Si tienes un proyecto de `msbuild`, puedes habilitar el modo de compilación agregando

```xml
    <TypeScriptBuildMode>true</TypeScriptBuildMode>
```

a tu archivo de proyecto. Esto permitirá la construcción incremental automática así como la limpieza.

Ten en cuenta que, al igual que con `tsconfig.json` / `-p`, no se respetarán las propiedades del proyecto *TypeScript* existente ⏤ todas las configuraciones se deben administrar usando tu archivo `tsconfig`.

Algunos equipos han configurado flujos de trabajo basados ​​en `msbuild` en los que los archivos `tsconfig` tienen el mismo orden de gráficos `implicit` que los proyectos administrados con los que están emparejados.
Si tu solución es así, puedes continuar usando `msbuild` con `tsc -p` junto con las referencias del proyecto; estos son completamente interoperables.

## Guía

## Estructura general

Con más archivos `tsconfig.json`, normalmente querrás usar [Herencia del archivo de configuración](/docs/handbook/tsconfig-json.html) para centralizar las opciones comunes del compilador.
De esta forma, puedes cambiar una configuración en un archivo en lugar de tener que editar varios archivos.

Otra buena práctica es tener un archivo `"solution"` de `tsconfig.json` que simplemente tenga [`references`](/tsconfig#references) a todos tus proyectos de hoja `node` y establezcas [`files`](/tsconfig#files) en un arreglo vacío (de lo contrario, el archivo de solución provocará una doble compilación de archivos). Ten en cuenta que a partir de 3.0, ya no es un error tener un arreglo de [`files`](/tsconfig#files) vacío si tienes al menos una `reference` en un archivo `tsconfig.json`.

Esto presenta un punto de entrada simple; p.ej. en el repositorio de *TypeScript* simplemente ejecutamos `tsc -b src` para construir todos los puntos finales porque enumeramos todos los subproyectos en `src/tsconfig.json`

Puedes ver estos patrones en el repositorio de *TypeScript*: ve `src/tsconfig_base.json`, `src/tsconfig.json` y `src/tsc/tsconfig.json` como ejemplos clave.

## Estructurar módulos relativos

En general, no se necesita mucho para realizar la transición de un repositorio utilizando módulos relativos.
Simplemente coloca un archivo `tsconfig.json` en cada subdirectorio de un determinado directorio principal y agrega `references` a estos archivos de configuración para que coincidan con las capas previstas del programa.
Necesitarás establecer el [`outDir`](/tsconfig#outDir) en un subdirectorio explícito del directorio de salida, o establecer el [`rootDir`](/tsconfig#rootDir) en la raíz común de todos los directorios del proyecto.

## Estructurar para `outFiles`

El diseño para compilaciones usando [`outFile`](/tsconfig#outFile) es más flexible porque las rutas relativas no importan tanto.
Una cosa a tener en cuenta es que, por lo general, no querrás usar `prepend` hasta el "last" proyecto ⏤ esto mejorará los tiempos de construcción y reducirá la cantidad de *E/S* necesaria en cualquier construcción dada.
El repositorio de *TypeScript* en sí mismo es una buena referencia aquí: tenemos algunos proyectos de "biblioteca" y algunos proyectos de "punto final"; los proyectos `"endpoint"` se mantienen lo más pequeños posible y solo incorporan las bibliotecas que necesitan.

<!--
## Estructurar para *monorepos*

TODO: Experimente más y descubre esto. Rush y Lerna parecen tener diferentes modelos que implican diferentes cosas de nuestra parte.
-->
