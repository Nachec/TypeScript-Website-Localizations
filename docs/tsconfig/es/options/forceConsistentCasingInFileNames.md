---
display: "Forzar mayúsculas y minúsculas coherentes en los nombres de archivo"
oneline: "Asegúrate de que la carcasa sea la correcta en las importaciones."
---

*TypeScript* sigue las reglas de distinción entre mayúsculas y minúsculas del sistema de archivos en el que se ejecuta.
Esto puede ser problemático si algunos desarrolladores están trabajando en un sistema de archivos que distingue entre mayúsculas y minúsculas y otros no.
Si un archivo intenta importar `fileManager.ts` especificando `./FileManager.ts`, el archivo se encontrará en un sistema de archivos que no distingue entre mayúsculas y minúsculas, pero no en un sistema de archivos que distinga entre mayúsculas y minúsculas.

Cuando se establece esta opción, *TypeScript* emitirá un error si un programa intenta incluir un archivo en una carcasa diferente a la carcasa en el disco.
