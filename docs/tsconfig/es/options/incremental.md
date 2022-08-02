---
display: "Incremental"
oneline: "Guarda los archivos `.tsbuildinfo` para permitir la compilación incremental de proyectos."
---

Le dice a *TypeScript* que guarde información sobre el gráfico del proyecto desde la última compilación en archivos almacenados en el disco. Este
crea una serie de archivos `.tsbuildinfo` en el mismo directorio que la salida de la compilación. No son utilizados por tu
entorno de ejecución *JavaScript* y se puede eliminar de forma segura. Puedes leer más sobre la bandera en las [notas de la versión 3.4](/docs/handbook/release-notes/typescript-3-4.html#rapid-later-builds-with-the---incremental-flag).

Para controlar en qué directorios deseas que se compilen los archivos, usa la opción de configuración [`tsBuildInfoFile`](#tsBuildInfoFile).
