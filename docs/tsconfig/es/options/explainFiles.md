---
display: "explainFiles"
oneline: "Imprime los archivos leídos durante la compilación, incluido el motivo por el que se incluyeron."
---

Imprime los nombres de los archivos que *TypeScript* ve como parte de tu proyecto y la razón por la que son parte de la compilación.

Por ejemplo, con este proyecto de un solo archivo `index.ts`

```sh
example
├── index.ts
├── package.json
└── tsconfig.json
```

Usando un `tsconfig.json` que tiene `explainFiles` establecido en `true`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "explainFiles": true
  }
}
```

Ejecutar *TypeScript* en este directorio tendría un resultado como este:

```
❯ tsc
node_modules/typescript/lib/lib.d.ts
  Default library for target 'es5'
node_modules/typescript/lib/lib.es5.d.ts
  Library referenced via 'es5' from file 'node_modules/typescript/lib/lib.d.ts'
node_modules/typescript/lib/lib.dom.d.ts
  Library referenced via 'dom' from file 'node_modules/typescript/lib/lib.d.ts'
node_modules/typescript/lib/lib.webworker.importscripts.d.ts
  Library referenced via 'webworker.importscripts' from file 'node_modules/typescript/lib/lib.d.ts'
node_modules/typescript/lib/lib.scripthost.d.ts
  Library referenced via 'scripthost' from file 'node_modules/typescript/lib/lib.d.ts'
index.ts
  Coincide con el patrón de inclusión '**/*' en `tsconfig.json`
```

La salida anterior muestra:

- La búsqueda inicial de `lib.d.ts` basada en [`target`](#target) y la cadena de archivos `.d.ts` a los que se hace referencia
- El archivo `index.ts` ubicado a través del patrón predeterminado de [`include`](#include)

Esta opción está pensada para depurar cómo un archivo se ha convertido en parte de tu compilación.
