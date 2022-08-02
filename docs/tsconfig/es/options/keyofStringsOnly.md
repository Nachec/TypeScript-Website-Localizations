---
display: "Keyof Strings Only"
oneline: "Hacer keyof solo devuelve cadenas en lugar de cadenas, números o símbolos. Opción heredada."
---

Esta bandera cambia el operador de tipo `keyof` para devolver `string` en lugar de `string | number` cuando se aplica a un tipo con un índice de firma de cadena.

Esta marca se usa para ayudar a las personas a evitar este comportamiento [antes del lanzamiento de *TypeScript 2.9*](docs/handbook/release-notes/typescript-2-9.html#support-number-and-symbol-named-properties-with-keyof-and-mapped-types).
