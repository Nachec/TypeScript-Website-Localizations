---
display: "watchDirectory"
oneline: "Especifica cómo se ven los directorios en los sistemas que carecen de la funcionalidad de observación recursiva de archivos."
---

La estrategia de cómo se observan árboles de directorios completos en sistemas que carecen de la funcionalidad de observación recursiva de archivos.

- `fixedPollingInterval` ⏤ Compruebe cada directorio para ver si hay cambios varias veces por segundo en un intervalo fijo.
- `dynamicPriorityPolling` ⏤ Utiliza una cola dinámica en la que los directorios modificados con menos frecuencia se verifican en intervalos más largos.
- `useFsEvents` (la predeterminada) ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para cambios de directorio.
