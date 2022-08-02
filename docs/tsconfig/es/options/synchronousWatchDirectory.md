---
display: "SynchronousWatchDirectory"
oneline: "Llama sincrónicamente a las devoluciones de llamada y actualiza el estado de los observadores de directorios en plataformas que no admiten la visualización recursiva de forma nativa."
---

Llama sincrónicamente a las devoluciones de llamada y actualiza el estado de los observadores de directorios en plataformas que no admiten la visualización recursiva de forma nativa. En lugar de dar un pequeño tiempo de espera para permitir que se produzcan posibles múltiples ediciones en un archivo.

```json tsconfig
{
  "watchOptions": {
    "synchronousWatchDirectory": true
  }
}
```
