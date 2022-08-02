---
display: "fallbackPolling"
oneline: "Especifica qué enfoque debe utilizar el observador si el sistema se queda sin observadores de archivos nativos."
---

Cuando se usan eventos del sistema de archivos, esta opción especifica la estrategia de sondeo que se usa cuando el sistema se queda sin observadores de archivos nativos y/o no admite observadores de archivos nativos.

- `fixedPollingInterval` ⏤ Comprueba cada archivo para ver si hay cambios varias veces por segundo en un intervalo fijo.
- `priorityPollingInterval` ⏤ Verifica cada archivo en busca de cambios varias veces por segundo, pero usa la heurística para revisar ciertos tipos de archivos con menos frecuencia que otros.
- `dynamicPriorityPolling` ⏤ Utiliza una cola dinámica en la que los archivos modificados con menos frecuencia se verifican con menos frecuencia.
- `synchronousWatchDirectory` ⏤ Desactiva la vigilancia diferida en directorios. La vigilancia diferida es útil cuando pueden ocurrir muchos cambios de archivo a la vez (por ejemplo, un cambio en `node_modules` al ejecutar `npm install`), pero es posible que desees deshabilitarla con esta marca para algunas configuraciones menos comunes.
