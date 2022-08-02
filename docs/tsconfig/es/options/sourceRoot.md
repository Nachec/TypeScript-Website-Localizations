---
display: "Raíz fuente"
oneline: "Especifica la ruta raíz para que los depuradores encuentren el código fuente de referencia."
---

Especifica la ubicación donde un depurador debe ubicar los archivos de *TypeScript* en lugar de las ubicaciones fuente relativas.
Esta cadena se trata literalmente dentro del mapa fuente donde puedes usar una ruta o una *URL*:

```json tsconfig
{
  "compilerOptions": {
    "sourceMap": true,
    "sourceRoot": "https://my-website.com/debug/source/"
  }
}
```

Declararía que `index.js` tendrá un archivo fuente en `https://my-website.com/debug/source/index.ts`.
