---
display: "Comprobación estricta"
---

Recomendamos usar la [opción `strict` del compilador](#strict) para optar por todas las mejoras posibles a medida que se compilan.

*TypeScript* admite un amplio espectro de patrones *JavaScript* y los valores predeterminados permiten una gran flexibilidad para adaptarse a estos estilos.
A menudo, la seguridad y la escalabilidad potencial de un código base pueden estar en desacuerdo con algunas de estas técnicas.

Debido a la variedad de *JavaScript* admitido, la actualización a una nueva versión de *TypeScript* puede descubrir dos tipos de errores:

- Errores que ya existen en tu código base, que *TypeScript* ha descubierto porque el lenguaje ha perfeccionado su comprensión de *JavaScript*.
- Un nuevo conjunto de errores que abordan un nuevo dominio de problemas.

*TypeScript* generalmente agregará una marca de compilador para el último conjunto de errores y, de forma predeterminada, estos no están habilitados.
