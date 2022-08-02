---
display: "watchFile"
oneline: "Especifica cómo funciona el modo de observación de TypeScript."
---

La estrategia de cómo se observan archivos individuales.

- `fixedPollingInterval` ⏤ Comprueba cada archivo para ver si hay cambios varias veces por segundo en un intervalo fijo.
- `priorityPollingInterval` ⏤ Verifica cada archivo en busca de cambios varias veces por segundo, pero usa la heurística para revisar ciertos tipos de archivos con menos frecuencia que otros.
- `dynamicPriorityPolling` ⏤ Utiliza una cola dinámica en la que los archivos modificados con menos frecuencia se verifican con menos frecuencia.
- `useFsEvents` (la predeterminada) ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para realizar cambios en los archivos.
- `useFsEventsOnParentDirectory` ⏤ Intenta utilizar los eventos nativos del sistema operativo/sistema de archivos para escuchar cambios en el directorio principal de un archivo
