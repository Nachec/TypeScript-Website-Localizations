---
display: "disableReferencedProjectLoad"
oneline: "Reduce el número de proyectos cargados automáticamente por TypeScript."
---

En los programas de *TypeScript* multiproyecto, *TypeScript* cargará todos los proyectos disponibles en la memoria para proporcionar resultados precisos para las respuestas del editor que requieren un gráfico de conocimiento completo como 'Buscar todas las referencias'.

Si tu proyecto es grande, puedes usar la marca `disableReferencedProjectLoad` para deshabilitar la carga automática de todos los proyectos. En cambio, los proyectos se cargan dinámicamente a medida que abres archivos a través de tu editor.
