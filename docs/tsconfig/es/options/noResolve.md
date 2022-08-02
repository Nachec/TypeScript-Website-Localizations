---
display: "Sin resolve"
oneline: "No permite que las `import`s, `require`s o `<reference>`s expandan el número de archivos que TypeScript debe agregar a un proyecto."
---

De forma predeterminada, *TypeScript* examinará el conjunto inicial de archivos para las directivas `import` y  <reference` y agregará estos archivos resueltos a tu programa.

Si se establece `noResolve`, este proceso no ocurre.
Sin embargo, las declaraciones `import` aún se verifican para ver si se resuelven en un módulo válido, por lo que deberás asegurarte de que esto se cumpla por otros medios.
