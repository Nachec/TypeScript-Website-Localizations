---
display: "Include"
oneline: "Especifica una lista de módulos para los que adquirir tipos."
---

Si tienes un proyecto *JavaScript* en el que *TypeScript* necesita orientación adicional para comprender las dependencias globales, o has desactivado la inferencia incorporada a través de [`disableFilenameBasedTypeAcquisition`](#disableFilenameBasedTypeAcquisition).

Puedes usar `include` para especificar qué tipos se deben usar de `DefinitelyTyped`:

```json
{
  "typeAcquisition": {
    "include": ["jquery"]
  }
}
```
