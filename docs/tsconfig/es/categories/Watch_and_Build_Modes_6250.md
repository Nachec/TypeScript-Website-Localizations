---
display: "Opciones de observación"
---

*TypeScript 3.8* envió una nueva estrategia para ver directorios, que es crucial para recoger de manera eficiente los cambios en `node_modules`.

En sistemas operativos como *Linux*, *TypeScript* instala observadores de directorios (a diferencia de los observadores de archivos) en `node_modules` y muchos de sus subdirectorios para detectar cambios en las dependencias.
Esto se debe a que la cantidad de observadores de archivos disponibles a menudo se ve eclipsada por la cantidad de archivos en `node_modules`, mientras que hay muchos menos directorios para rastrear.

Debido a que cada proyecto podría funcionar mejor bajo diferentes estrategias, y este nuevo enfoque podría no funcionar bien para tus flujos de trabajo, *TypeScript 3.8* presenta un nuevo campo `watchOptions` que permite a los usuarios decirle al compilador/servicio de lenguaje qué estrategias de observación se deben usar para realizar un seguimiento de archivos y directorios.
