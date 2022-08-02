---
display: "Profundidad máxima de JS de Node Module"
oneline: "Especifica la profundidad máxima del directorio utilizado para comprobar archivos JavaScript de `node_modules`. Solo aplicable con [`allowJs`](#allowJs)."
---

La profundidad de dependencia máxima para buscar en `node_modules` y cargar archivos *JavaScript*.

Esta marca solo se puede usar cuando [`allowJs`](#allowJs) está habilitado, y se usa si quieres que *TypeScript* infiera tipos para todo el *JavaScript* dentro de tus `node_modules`.

Idealmente, esto debería permanecer en 0 (el valor predeterminado), y los archivos `d.ts` se deberían usar para definir explícitamente la forma de los módulos.
Sin embargo, hay casos en los que es posible que desees activarlo a expensas de la velocidad y la potencial precisión.
