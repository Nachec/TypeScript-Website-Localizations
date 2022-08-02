---
display: "Composite"
oneline: "Habilita las restricciones que permiten utilizar un proyecto de TypeScript con referencias de proyecto."
---

La opción `composite` impone ciertas restricciones que hacen posible que las herramientas de compilación (incluido *TypeScript*
en sí mismo, en el modo `--build`) para determinar rápidamente si un proyecto ya se ha creado.

Cuando esta configuración está activada:

- La configuración [`rootDir`](#rootDir), si no se establece explícitamente, se establece de forma predeterminada en el directorio que contiene el archivo `tsconfig.json`.

- Todos los archivos de implementación deben coincidir con un patrón [`include`](#include) o aparecer en el arreglo [`files`](#files). Si se viola esta restricción, `tsc` te informará qué archivos no se especificaron.

- [`declaration`](#declaration) de manera predeterminada es `true`

Puedes encontrar documentación sobre proyectos de *TypeScript* en [el manual](https://www.typescriptlang.org/docs/handbook/project-references.html).
