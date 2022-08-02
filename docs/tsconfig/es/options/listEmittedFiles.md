---
display: "Lista de archivos emitidos"
oneline: "Imprime los nombres de los archivos emitidos después de una compilación."
---

Imprime los nombres de los archivos generados como parte de la compilación en el terminal.

Esta bandera es útil en dos casos:

- Deseas transpilar *TypeScript* como parte de una cadena de compilación en la terminal donde se procesan los nombres de archivo en el siguiente comando.
- No estás seguro de que *TypeScript* haya incluido un archivo que esperaba, como parte de la depuración de la [configuración de inclusión de archivos](#Project_Files_0).

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
    "declaration": true,
    "listFiles": true
  }
}
```

Haría eco de rutas como:

```
$ npm run tsc

ruta/a/example/index.js
ruta/a/example/index.d.ts
```

Normalmente, *TypeScript* volvería silenciosamente en caso de éxito.
