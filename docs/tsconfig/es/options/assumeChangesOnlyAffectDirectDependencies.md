---
display: "Asume que los cambios solo afectan a las dependencias directas"
oneline: "Tener recompilaciones en proyectos que usan [`incremental`](#incremental) y el modo `watch` suponen que los cambios dentro de un archivo solo afectarán a los archivos que dependan directamente de él."
---

Cuando esta opción está habilitada, *TypeScript* evitará volver a verificar/reconstruir todos los archivos posiblemente afectados realmente, y solo volverá a verificar/reconstruir los archivos que hayan cambiado, así como los archivos que los importen directamente.

Esto se puede considerar una implementación 'rápida y flexible' del algoritmo de observación, que puede reducir drásticamente los tiempos de reconstrucción incrementales a expensas de tener que ejecutar la compilación completa ocasionalmente para obtener todos los mensajes de error del compilador.
