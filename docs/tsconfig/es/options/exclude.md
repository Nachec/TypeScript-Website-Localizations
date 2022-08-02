---
display: "Exclude"
oneline: "Filtra los resultados de la opción [`include`](#include)."
---

Especifica un arreglo de nombres de archivo o patrones que se deben omitir al resolver [`include`](#include).

**Importante**: `exclude` *solo* cambia qué archivos se incluyen como resultado de la configuración [`include`](#include).
Un archivo especificado por `exclude` aún se puede convertir en parte de tu código base debido a una declaración `import` en tu código, una inclusión de `tipos`, una directiva `/// <reference`, o ser especificado en la lista [`files`](#files).

No es un mecanismo que **previene** un archivo para que no se incluya en el código base ⏤ simplemente cambia lo que encuentra la configuración [`include`](#include).
