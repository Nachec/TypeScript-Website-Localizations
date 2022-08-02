---
display: "Out File"
oneline: "Especifique un archivo que agrupe todas las salidas en un archivo JavaScript. Si [`declaration`](#declaration) es `true`, también designa un archivo que agrupa toda la salida `.d.ts`."
---

Si se especifica, todos los archivos *global* (que no sean de módulo) se concatenarán en el archivo de salida único especificado.

Si `module` es `system` o `amd`, todos los archivos de módulo también se concatenarán en este archivo después de todo el contenido global.

Nota: `outFile` no se puede usar a menos que `module` sea `None`,  `System` o `AMD`.
Esta opción *no* se puede utilizar para agrupar módulos *CommonJS* o *ES6*.
