---
display: "Adquisición de tipo"
oneline: "Especificar opciones para la adquisición automática de archivos de declaración."
---

Cuando tienes un proyecto *JavaScript* en tu editor, *TypeScript* proporcionará tipos para tus `node_modules` automáticamente usando el conjunto `DefinitelyTyped` de definiciones de `@types`.
Esto se denomina adquisición automática de tipos y puedes personalizarlo utilizando el objeto `typeAcquisition` en tu configuración.

Si deseas deshabilitar o personalizar esta función, crea un `jsconfig.json` en la raíz de tu proyecto:

```json
{
  "typeAcquisition": {
    "enable": false
  }
}
```

Si tienes un módulo específico que se debería incluir (pero no está en `node_modules`):

```json
{
  "typeAcquisition": {
    "include": ["jest"]
  }
}
```

Si un módulo no se debe adquirir automáticamente, por ejemplo, si la biblioteca está disponible en tus `node_modules` pero tu equipo ha acordado no usarlo:

```json
{
  "typeAcquisition": {
    "exclude": ["jquery"]
  }
}
```
