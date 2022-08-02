---
display: "Plugins"
oneline: "Especifica una lista de complementos de servicios de idioma a incluir."
---

Lista de complementos de servicios de idioma para ejecutar dentro del editor.

Los complementos de servicios de idioma son una forma de proporcionar información adicional a un usuario basada en archivos *TypeScript* existentes. Pueden mejorar los mensajes existentes entre *TypeScript* y un editor, o proporcionar tus propios mensajes de error.

Por ejemplo:

- [`ts-sql-plugin`](https://github.com/xialvjun/ts-sql-plugin#readme) &mdash; Agrega lucimiento `SQL` con un constructor `SQL` de cadenas de plantilla.
- [`typescript-styled-plugin`](https://github.com/Microsoft/typescript-styled-plugin) &mdash; Proporciona revestimiento *CSS* dentro de las cadenas de plantilla.
- [`typecript-eslint-language-service`](https://github.com/Quramy/typescript-eslint-language-service) &mdash; Proporciona mensajes de error `eslint` y arreglos dentro de la salida del compilador.
- [`ts-graphql-plugin`](https://github.com/Quramy/ts-graphql-plugin) &mdash; Proporciona validación y completado automática dentro de las cadenas de plantillas de consultas de `GraphQL`.

*VS Code* tiene la capacidad de una extensión para [incluir automáticamente complementos de servicios de idiomas](https://code.visualstudio.com/api/references/contribution-points#contributes.typescriptServerPlugins), por lo que es posible que tengas algunos ejecutándose en tu editor sin necesidad de definirlos en tu `tsconfig.json`.
