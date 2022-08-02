---
display: "Emit BOM"
oneline: "Emite una marca de orden de bytes (BOM) UTF-8 al principio de los archivos de salida."
---

Controla si *TypeScript* emitirá una [marca de orden de bytes (BOM)](https://wikipedia.org/wiki/Byte_order_mark) al escribir archivos de salida.
Algunos entornos de ejecución requieren una lista de materiales para interpretar correctamente los archivos *JavaScript*; otros requieren que no esté presente.
El valor predeterminado de `false` generalmente es mejor a menos que tengas una razón para cambiarlo.
