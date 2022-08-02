---
display: "Conservar enlaces simbólicos"
oneline: "Desactiva la resolución de enlaces simbólicos a su ruta real. Esto se correlaciona con la misma bandera en el node."
---

Esto es para reflejar la misma bandera en *Node.js*; que no resuelve la ruta real de los enlaces simbólicos.

Esta marca también exhibe el comportamiento opuesto a la opción `resolve.symlinks` de *Webpack* (es decir, establecer `preserveSymlinks` de *TypeScript* en paralelos verdaderos y establecer `resolve.symlinks` de *Webpack* en `false`, y viceversa).

Con esto habilitado, las referencias a módulos y paquetes (por ejemplo, directivas `import`s y `/// <reference type = "..." />`) se resuelven en relación con la ubicación del archivo de enlace simbólico, en lugar de relativo a la ruta a la que se resuelve el enlace simbólico.
