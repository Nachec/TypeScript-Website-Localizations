---
display: "Files"
oneline: "Incluye una lista de archivos. Esto no admite patrones globales, a diferencia de [`include`](#include)."
---

Especifica una lista de archivos permitidos para incluir en el programa. Se produce un error si no se puede encontrar alguno de los archivos.

```json tsconfig
{
  "compilerOptions": {},
  "files": [
    "core.ts",
    "sys.ts",
    "types.ts",
    "scanner.ts",
    "parser.ts",
    "utilities.ts",
    "binder.ts",
    "checker.ts",
    "tsc.ts"
  ]
}
```

Esto es útil cuando solo tienes una pequeña cantidad de archivos y no necesitas usar un `glob` para hacer referencia a muchos archivos.
Si lo necesitas, utiliza [`include`](#include).
