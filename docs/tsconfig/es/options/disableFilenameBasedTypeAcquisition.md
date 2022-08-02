---
display: "disableFilenameBasedTypeAcquisition"
oneline: "Desactiva la inferencia para la adquisición de tipos al mirar los nombres de archivo en un proyecto."
---

La adquisición de tipos de *TypeScript* puede inferir qué tipos se deben agregar en función de los nombres de archivo en un proyecto. Esto significa que tener un archivo como `jquery.js` en tu proyecto descargaría automáticamente los tipos para *JQuery* de *DefinitelyTyped*.

Puedes desactivar esto a través de `disableFilenameBasedTypeAcquisition`.

```json
{
  "typeAcquisition": {
    "disableFilenameBasedTypeAcquisition": true
  }
}
```
