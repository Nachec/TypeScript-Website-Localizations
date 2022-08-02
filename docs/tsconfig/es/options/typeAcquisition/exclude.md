---
display: "Exclude"
oneline: "Especifica una lista de módulos a excluir de la adquisición de tipos."
---

Ofrece una configuración para deshabilitar la adquisición de tipos para un determinado módulo en proyectos *JavaScript*. Esto puede ser útil para proyectos que incluyen otras bibliotecas en la infraestructura de prueba que no son necesarias en la aplicación principal.

```json
{
  "typeAcquisition": {
    "exclude": ["jest", "mocha"]
  }
}
```
