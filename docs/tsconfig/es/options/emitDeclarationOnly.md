---
display: "Emite declaración solamente"
oneline: "sólo produce archivos d.ts y no archivos JavaScript."
---

*Sólo* emite archivos `.d.ts`; no emite archivos `.js`.

Esta configuración es útil en dos casos:

- Estás utilizando un transpilador que no sea *TypeScript* para generar tu *JavaScript*.
- Estás utilizando *TypeScript* para generar solo archivos `d.ts` para tus consumidores.
