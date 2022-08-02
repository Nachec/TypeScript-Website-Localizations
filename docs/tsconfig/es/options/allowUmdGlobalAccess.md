---
display: "Permitir acceso global a Umd"
oneline: "Permitir acceder a global a UMD desde módulos."
---

Cuando se establece en `true`, `allowUmdGlobalAccess` te permite acceder a las exportaciones *UMD* como globales desde los archivos del módulo interno. Un archivo de módulo es un archivo que tiene importaciones y/o exportaciones. Sin esta bandera, el uso de una exportación desde un módulo *UMD* requiere una declaración de importación.

Un caso de uso de ejemplo para esta marca sería un proyecto web en el que sabes que la biblioteca en particular (como *jQuery* o *Lodash*) siempre estará disponible en el entorno de ejecución, pero no puedes acceder a ella con una importación.
