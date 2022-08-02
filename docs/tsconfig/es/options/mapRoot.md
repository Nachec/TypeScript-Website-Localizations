---
display: "Mapa raíz"
oneline: "Especifica la ubicación donde el depurador debe encontrar los archivos de mapa en lugar de las ubicaciones generadas."
---

Especifica la ubicación donde el depurador debe encontrar los archivos de mapa en lugar de las ubicaciones generadas.
Esta cadena se trata literalmente dentro del mapa fuente, por ejemplo:

```json tsconfig
{
  "compilerOptions": {
    "sourceMap": true,
    "mapRoot": "https://my-website.com/debug/sourcemaps/"
  }
}
```

Declararía que `index.js` tendrá mapas fuente en `https://my-website.com/debug/sourcemaps/index.js.map`.
