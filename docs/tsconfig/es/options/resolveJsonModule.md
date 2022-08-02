---
display: "Resolver módulo JSON"
oneline: "Habilitar la importación de archivos .json."
---

Permite importar módulos con una extensión `.json`, que es una práctica común en los proyectos `node`. Esto incluye
generar un tipo para la `import` basado en la forma *JSON* estática.

*TypeScript* no admite la resolución de archivos *JSON* de forma predeterminada:

```ts twoslash
// @errors: 2732
// @filename: settings.json
{
    "repo": "TypeScript",
    "dry": false,
    "debug": false
}
// @filename: index.ts
import settings from "./settings.json";

settings.debug === true;
settings.dry === 2;
```

Habilitar la opción permite importar *JSON* y validar los tipos en ese archivo *JSON*.

```ts twoslash
// @errors: 2367
// @resolveJsonModule
// @module: commonjs
// @moduleResolution: node
// @filename: settings.json
{
    "repo": "TypeScript",
    "dry": false,
    "debug": false
}
// @filename: index.ts
import settings from "./settings.json";

settings.debug === true;
settings.dry === 2;
```
