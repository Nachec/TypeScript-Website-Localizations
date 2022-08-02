---
display: "Out Dir"
oneline: "Especifica un directorio de salida para todos los archivos emitidos."
---

Si se especifica, los archivos `.js` (así como `.d.ts`, `.js.map`, etc.) se emitirán en este directorio.
Se conserva la estructura de directorios de los archivos fuente originales; ve [`rootDir`](#rootDir) si la raíz calculada no es la que pretendías.

Si no se especifica, los archivos `.js` se emitirán en el mismo directorio que los archivos `.ts` desde los que se generaron:

```sh
$ tsc

example
├── index.js
└── index.ts
```

Con un `tsconfig.json` como este:

```json tsconfig
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

Ejecutar `tsc` con esta configuración mueve los archivos al directorio `dist` especificado:

```sh
$ tsc

example
├── dist
│   └── index.js
├── index.ts
└── tsconfig.json
```
