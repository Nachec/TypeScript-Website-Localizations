---
title: Configurar Watch
layout: docs
permalink: /docs/handbook/configuring-watch.html
oneline: Cómo configurar el modo observador de TypeScript
translatable: true
---

El compilador admite la configuración de cómo ver archivos y directorios usando indicadores del compilador en *TypeScript 3.8+* y variables de entorno antes de eso.

## Antecedentes

La implementación `--watch` del compilador se basa en el uso de `fs.watch` y `fs.watchFile` que proporcionan *node*, ambos métodos tienen pros y contras.

`fs.watch` usa eventos del sistema de archivos para notificar los cambios en el archivo/directorio. Pero esto depende del sistema operativo y la notificación no es completamente confiable y no funciona como se espera en muchos sistemas operativos. También podría haber un límite en la cantidad de vigilantes que se pueden crear, p. ej. linux y podríamos agotarlo bastante rápido con programas que incluyen una gran cantidad de archivos. Pero debido a que esto usa eventos del sistema de archivos, no hay muchos ciclos de *CPU* involucrados. El compilador generalmente usa `fs.watch` para ver directorios (por ejemplo, directorios fuente incluidos en el archivo de configuración, directorios en los que falló la resolución del módulo, etc.). Estos pueden manejar la precisión que falta al notificar los cambios. Pero la observación recursiva solo es compatible con *Windows* y *OSX*. Eso significa que necesitamos algo para reemplazar la naturaleza recursiva en otros sistemas operativos.

`fs.watchFile` utiliza sondeo y, por lo tanto, implica ciclos del *CPU*. Sin embargo, `fs.watchFile` es el mecanismo más confiable para obtener la actualización del estado del archivo/directorio. El compilador normalmente usa `fs.watchFile` para ver archivos fuente, archivos de configuración y archivos faltantes (referencias de archivos faltantes). Esto significa que el uso de la *CPU* cuando se usa `fs.watchFile` depende de la cantidad de archivos en el programa.

## Configurar la observación de archivos usando un `tsconfig.json`

```json tsconfig
{
  // Algunas opciones típicas del compilador
  "compilerOptions": {
    "target": "es2020",
    "moduleResolution": "node"
    // ...
  },

  // NUEVO: Opciones para ver archivos/directorios
  "watchOptions": {
    // Usa eventos del sistema de archivos nativo para archivos y directorios
    "watchFile": "useFsEvents",
    "watchDirectory": "useFsEvents",

    // Sondeo de archivos para actualizaciones con más frecuencia
    // cuando se actualizan mucho.
    "fallbackPolling": "dynamicPriority",

    // No fusionar la notificación del observador
    "synchronousWatchDirectory": true,

    // Finalmente, dos configuraciones adicionales para reducir la cantidad de posibles
    // archivos para rastrear el trabajo de estos directorios
    "excludeDirectories": ["**/node_modules", "_build"],
    "excludeFiles": ["build/fileWhichChangesOften.ts"]
  }
}
```

Puedes leer más sobre esto en [las notas de la versión](/docs/handbook/release-notes/typescript-3-8.html#better-directory-watching-on-linux-and-watchoptions).

## Configurar la observación de archivos utilizando la variable de entorno `TSC_WATCHFILE`

<!-- prettier-ignore -->
Opción                                          | Descripción
--------------------|-------------------
`PriorityPollingInterval` | Usa `fs.watchFile` pero usa diferentes intervalos de sondeo para archivos fuente, archivos de configuración y archivos faltantes
`DynamicPriorityPolling` | Utiliza una cola dinámica donde los archivos modificados con frecuencia se sondearán a intervalos más cortos y los archivos sin cambios se sondearán con menos frecuencia
`UseFsEvents` | Usa `fs.watch` el cual usa eventos del sistema de archivos (pero puede que no sea exacto en un sistema operativo diferente) para obtener las notificaciones de los cambios/creación/eliminación de archivos. Ten en cuenta que pocos sistemas operativos, p. ej. linux tiene un límite en el número de observadores y si no se crea un observador con `fs.watch`, se creará con `fs.watchFile`
`UseFsEventsWithFallbackDynamicPolling` | Esta opción es similar a `UseFsEvents` excepto que al no crear un observar usando `fs.watch`, la observación alternativa se realiza a través de colas de sondeo dinámicas (como se explica en `DynamicPriorityPolling`)
`UseFsEventsOnParentDirectory` | Esta opción observa el directorio principal del archivo con `fs.watch` (usando eventos del sistema de archivos), por lo que ocupa poca *CPU* pero puede comprometer la precisión.
predeterminado (sin valor especificado) | Si la variable de entorno `TSC_NONPOLLING_WATCHER` se establece en `true`, observa el directorio principal de archivos (al igual que `UseFsEventsOnParentDirectory`). De lo contrario, observa los archivos usando `fs.watchFile` con `250ms` como tiempo de espera para cualquier archivo

## Configurar la observación de directorios usando la variable de entorno `TSC_WATCHDIRECTORY`

La observación de directorio en plataformas que no admiten la observación recursiva de directorios de forma nativa en `node`, se admite mediante la creación recursiva de un observador de directorios para los directorios secundarios utilizando diferentes opciones seleccionadas por `TSC_WATCHDIRECTORY`. Ten en cuenta que en las plataformas que admiten la observación recursiva nativa de directorios (por ejemplo, *Windows*), se ignora el valor de esta variable de entorno.

<!-- prettier-ignore -->
Opción                                          | Descripción
--------------------|-------------------
`RecursiveDirectoryUsingFsWatchFile` | Utiliza `fs.watchFile` para observar los directorios y directorios secundarios, que es un reloj de sondeo (consumiendo ciclos de *CPU*)
`RecursiveDirectoryUsingDynamicPriorityPolling` | Utiliza la cola de sondeo dinámico para sondear los cambios en el directorio y los directorios secundarios.
predeterminado (sin valor especificado) | Usa `fs.watch` para observar directorios y directorios secundarios
