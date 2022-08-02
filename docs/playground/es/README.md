# Código de ejemplo de *TypeScript*

Estos ejemplos están diseñados para hiperenlazarlos entre sí.
en un entorno de espacio aislado como *TypeScript Playground*.

Cada ejemplo tiene como objetivo cubrir una o dos características específicas para
ya sea cómo funciona JavaScript en TypeScript, o características que
TypeScript ha agregado al lenguaje.

Un ejemplo debe hacer suposiciones de que el lector está en un
entorno monaco/tipo IDE que tiene un TSServer ejecutándose para
proporcionar un análisis adicional. Además de una menor fluidez en
JavaScript.

Estos ejemplos no están escritos en piedra y estamos abiertos a nuevas
ideas. Si deseas ayudar y hablas más de un
idioma, nos encantaría ver traducciones.

## Agregar una nueva sección de ejemplo

Cree un directorio en este repositorio, luego subdirectorios por sección. A continuación,
edita `generateTOC.js` con el conjunto de directorios que debería tomar
alrededor de la línea 30, luego edita el `const toc` más abajo para
agregar una nueva sección. Si necesitas un orden personalizado, utiliza el
arreglo `sortedSubSections` para establecer tu orden.
