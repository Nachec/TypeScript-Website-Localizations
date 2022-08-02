---
display: "Paths"
oneline: "Especifica un conjunto de entradas que reasignen las importaciones a ubicaciones de búsqueda adicionales."
---

Una serie de entradas que reasignan importaciones a ubicaciones de búsqueda relativas a [`baseUrl`](#baseUrl). Hay una mayor cobertura de `paths` en [el manual](/docs/handbook/module-resolution.html#mapeo-de-rutas).

`paths` te permite declarar cómo *TypeScript* debe resolver una importación en tus `require`/`import`s.

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": ".", // esto se debe precisar si se especifica "paths".
    "paths": {
      "jquery": ["node_modules/jquery/dist/jquery"] // esta asignación es relativa a "baseUrl"
    }
  }
}
```

Esto te permitiría poder escribir `import "jquery"`, y obtener todo el tipado correcto localmente.

```json tsconfig
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
        "app/*": ["app/*"],
        "config/*": ["app/_config/*"],
        "environment/*": ["environments/*"],
        "shared/*": ["app/_shared/*"],
        "helpers/*": ["helpers/*"],
        "tests/*": ["tests/*"]
    },
}
```

En este caso, puedes decirle al solucionador de archivos de *TypeScript* que admita una serie de prefijos personalizados para buscar código.
Este patrón se puede utilizar para evitar rutas relativas largas dentro de tu código base.
