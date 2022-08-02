---
display: "Tipo Roots"
oneline: "Especifica varios directorios que actúen como `./Node_modules/@types`."
---

De manera predeterminada, todos los paquetes *visibles* "`@types`" están incluidos en tu compilación.
Los paquetes en `node_modules/@types` de cualquier directorio adjunto se consideran *visibles*.
Por ejemplo, eso significa paquetes dentro de `./node_modules/@types/`, `../node_modules/@types/`, `../../node_modules/@types/`, y así sucesivamente.

Si se especifica `typeRoots`, se incluirán *sólo* paquetes bajo `typeRoots`. Por ejemplo:

```json tsconfig
{
  "compilerOptions": {
    "typeRoots": ["./typings", "./vendor/types"]
  }
}
```

Este archivo de configuración incluirá *todos* los paquetes en `./Typings` y `./vendor/types`, y ningún paquete de `. /node_modules/@types`.
Todas las rutas son relativas al `tsconfig.json`.
