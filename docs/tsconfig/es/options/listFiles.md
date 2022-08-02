---
display: "Lista de archivos"
oneline: "Imprime todos los archivos leídos durante la compilación."
---

Imprime los nombres de los archivos que forman parte de la compilación. Esto es útil cuando no estás seguro de que *TypeScript* tenga
incluido un archivo que esperabas.

Por ejemplo:

```
example
├── index.ts
├── package.json
└── tsconfig.json
```

Con:

```json tsconfig
{
  "compilerOptions": {
    "listFiles": true
  }
}
```

Haría eco de rutas como:

```
$ npm run tsc
ruta/a/example/node_modules/typescript/lib/lib.d.ts
ruta/a/example/node_modules/typescript/lib/lib.es5.d.ts
ruta/a/example/node_modules/typescript/lib/lib.dom.d.ts
ruta/a/example/node_modules/typescript/lib/lib.webworker.importscripts.d.ts
ruta/a/example/node_modules/typescript/lib/lib.scripthost.d.ts
ruta/a/example/index.ts
```

Ten en cuenta que si usas *TypeScript 4.2*, prefiere [`explainFiles`](#explainFiles) que ofrece una explicación de por qué también se agregó un archivo.
