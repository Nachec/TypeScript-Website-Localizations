---
display: "enable"
oneline: "Deshabilita la adquisición de tipos para proyectos de JavaScript"
---

Ofrece una configuración para deshabilitar la adquisición de tipos en proyectos de *JavaScript*:

```ts
{
  "typeAcquisition": {
    "enable": false
  }
}
```

Esto podría eliminar todo el autocompletado del editor para tu proyecto. Si deseas recuperarlo, puedes usar [`Type Search`](https://www.typescriptlang.org/dt/search) para encontrar paquetes `@types` o paquetes con tipos en ellos.
