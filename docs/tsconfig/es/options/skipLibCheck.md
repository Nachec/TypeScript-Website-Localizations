---
display: "Omitir comprobación de Lib"
oneline: "Omite la comprobación de tipo de todos los archivos `.d.ts`."
---

Omite la verificación de tipo de archivos de declaración.

Esto puede ahorrar tiempo durante la compilación a expensas de la precisión del sistema de tipos. Por ejemplo, dos bibliotecas podrían
definir dos copias del mismo `type` de forma inconsistente. En lugar de realizar una comprobación completa de todos los archivos `d.ts`, *TypeScript*
comprobará el código al que se refiere específicamente en el código fuente de tu aplicación.

Un caso común en el que podrías pensar en usar `skipLibCheck` es cuando hay dos copias de los tipos de una biblioteca en
tu `node_modules`. En estos casos, deberías considerar utilizar una función como [resoluciones `yarn`](https://yarnpkg.com/lang/en/docs/selective-version-resolutions/)
para asegurarte de que solo haya una copia de esa dependencia en tu árbol o investigar cómo asegurarte de que solo haya
una copia al comprender la resolución de dependencias para solucionar el problema sin herramientas adicionales.

Otra posibilidad es cuando estás migrando entre versiones de *TypeScript* y los cambios causan roturas en `node_modules` y las bibliotecas estándar de *JS* con las que no deseas tratar durante la actualización de *TypeScript*. 

Ten en cuenta que si estos problemas provienen de la biblioteca estándar de *TypeScript*, puedes reemplazar la biblioteca usando la técnica de [reemplazo de biblioteca de *TypeScript 4.5*](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-lib-from-node_modules).
