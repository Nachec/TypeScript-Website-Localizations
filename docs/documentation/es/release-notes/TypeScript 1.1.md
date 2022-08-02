---
title: TypeScript 1.1
layout: docs
permalink: /docs/handbook/release-notes/typescript-1-1.html
oneline: Notas de la versión de TypeScript 1.1
---

## Mejoras de rendimiento

El compilador 1.1 suele ser 4 veces más rápido que cualquier versión anterior. Consulta [esta publicación de blog para ver algunos gráficos impresionantes](http://blogs.msdn.com/b/typescript/archive/2014/10/06/announcing-typescript-1-1-ctp.aspx)

## Mejores reglas de visibilidad del módulo

*TypeScript* ahora solo aplica estrictamente la visibilidad de los tipos en los módulos si se proporciona el indicador [`declaration`](/tsconfig#declaration). Esto es muy útil para escenarios *Angular*, por ejemplo:

```ts
module MyControllers {
  interface ZooScope extends ng.IScope {
    animals: Animal[];
  }
  export class ZooController {
    // Solía ​​ser un error (no se puede exponer ZooScope), pero ahora solo es
    // un error al intentar generar archivos .d.ts
    constructor(public $scope: ZooScope) {}
    /* más código */
  }
}
```
