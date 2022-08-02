---
display: "excludeDirectories"
oneline: "Elimina una lista de directorios del proceso de observación."
---

Puedes usar [`excludeFiles`](#excludeFiles) para reducir drásticamente el número de archivos que se ven durante `--watch`. Esta puede ser una forma útil de reducir la cantidad de archivos abiertos que *TypeScript* rastrea en *Linux*.

```json tsconfig
{
  "watchOptions": {
    "excludeDirectories": ["**/node_modules", "_build", "temp/*"]
  }
}
```
