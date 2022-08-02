## Opciones de compilación

La adquisición de tipos solo es importante para proyectos de *JavaScript*. En los proyectos de *TypeScript*, debes incluir los tipos en tus proyectos de forma explícita. Sin embargo, para proyectos de *JavaScript*, las herramientas de *TypeScript* descargarán tipos para tus módulos en segundo plano y fuera de tu directorio `node_modules`.

Es posible que no desees esto, en cuyo caso puedes desactivar la adquisición de tipos si tienes este `jsconfig.json` en la raíz de tu proyecto:

```json
{
  "typeAcquisition": {
    "enable": false
  }
}
```

Los usos comunes de esta sección de un `jsconfig.json` es decirle a *TypeScript* que descargue definiciones adicionales para tu experiencia con las herramientas:

```json
{
  "typeAcquisition": {
    "include": ["jquery"]
  }
}
```
