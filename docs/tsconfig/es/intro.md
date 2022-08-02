---
header: Introducción a la referencia de TSConfig
firstLine: Un archivo TSConfig en un directorio indica que el directorio es la raíz de un proyecto de TypeScript o JavaScript...
---

Un archivo *TSConfig* en un directorio indica que el directorio es la raíz de un proyecto de *TypeScript* o *JavaScript*.
El archivo *TSConfig* puede ser un `tsconfig.json` o un `jsconfig.json`, ambos tienen el mismo conjunto de variables de configuración.

Esta página cubre todas las diferentes opciones disponibles dentro de un archivo *TSConfig*. Hay más de 100 opciones y esta página no está diseñada para leerse de arriba a abajo. En cambio, tiene cinco secciones principales:

- Una descripción general categorizada de todos los indicadores del compilador
- Los [campos raíz](#Project_Files_0) para que *TypeScript* sepa qué archivos están disponibles
- Los campos [`compilerOptions`](#compilerOptions), esta es la mayor parte del documento
- Los campos [`watchOptions`](#watchOptions), para ajustar el modo observador
- Los campos [`typeAcquisition`](#typeAcquisition), para ajustar cómo se agregan los tipos a los proyectos de *JavaScript*

Si estás iniciando un *TSConfig* desde cero, puedes considerar usar `tsc --init` para arrancar o usar un [*TSConfig* base](https://github.com/tsconfig/bases#centralized-recommendations-for-tsconfig-base).
