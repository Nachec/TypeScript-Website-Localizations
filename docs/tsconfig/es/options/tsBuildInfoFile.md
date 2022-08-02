---
display: "Archivo de información de compilación TS"
oneline: "Especifica el directorio para los archivos de compilación incremental `.tsbuildinfo`."
---

Esta configuración te permite especificar un archivo para almacenar información de compilación incremental como parte de proyectos compuestos, lo que permite una
construcción de códigos base *TypeScript* más grandes. Puedes leer más sobre proyectos compuestos [en el manual](/docs/handbook/project-reference.html).

Esta opción ofrece una forma de configurar el lugar donde *TypeScript* realiza un seguimiento de los archivos que almacena en el disco para
indicar el estado de compilación de un proyecto; de forma predeterminada, están en el mismo directorio que el *JavaScript* emitido.
