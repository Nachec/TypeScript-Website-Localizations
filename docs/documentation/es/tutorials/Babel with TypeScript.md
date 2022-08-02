---
title: Usar Babel con TypeScript
layout: docs
permalink: /docs/handbook/babel-with-typescript.html
oneline: Cómo crear un proyecto híbrido Babel + TypeScript
translatable: true
---

## *Babel* vs `tsc` para *TypeScript*

Al hacer un proyecto de *JavaScript* moderno, te puedes preguntar cuál es la forma correcta de convertir archivos de *TypeScript* a *JavaScript*.

Muchas veces la respuesta es *"depende"* o *"alguien puede haber decidido por ti"* dependiendo del proyecto. Si estás creando tu proyecto con un marco existente como [`tsdx`](https://tsdx.io), [*Angular*](https://angular.io/), [*NestJS*](https://nestjs.com/ ) o cualquier marco mencionado en la [Introducción](/docs/home), esta decisión se gestiona por ti.

Sin embargo, una heurística útil podría ser:

- ¿La salida de la compilación es mayormente la misma que la de los archivos de entrada fuente? Usa `tsc`
- ¿Necesitas una canalización de compilación con múltiples resultados potenciales? Utiliza `babel` para transpilar y `tsc` para la comprobación de tipos

## *Babel* para transpilar, `tsc` para tipos

Este es un patrón común para proyectos con infraestructura de compilación existente que puede haber sido portado de un código base *JavaScript* a *TypeScript*.

Esta técnica es un enfoque híbrido, usando [`preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript) de *Babel* para generar tus archivos *JS*, y luego usando *TypeScript* para hacer la comprobación de tipos y generación de archivos `d.ts`.

Al utilizar el soporte de *babel* para *TypeScript*, obtienes la capacidad de trabajar con tuberías de compilación existentes y es más probable que tengas un tiempo de emisión *JS* más rápido porque *Babel* no revisa tu código.

#### Comprobación de tipos y generación de archivos `d.ts`

La desventaja de usar *babel* es que no obtienes la comprobación de tipos durante la transición de *TS* a *JS*. Esto puede significar que los errores de tipo que se pierden en tu editor se podrían colar en el código de producción.

Además de eso, *Babel* no puede crear archivos `.d.ts` para tu *TypeScript*, lo que puede dificultar el trabajo con tu proyecto si es una biblioteca.

Para solucionar estos problemas, probablemente desees configurar un comando para comprobar los tipos en tu proyecto usando *TSC*. Esto probablemente signifique duplicar algunas de tus configuraciones de *babel* en un [`tsconfig.json`](/tsconfig) correspondiente y asegurarte de que estos indicadores estén habilitados:

```json tsconfig
"compilerOptions": {
  // Asegúrate de que `tsc` cree los archivos `.d.ts`, pero no los archivos `.js`
  "declaration": true,
  "emitDeclarationOnly": true,
  // Asegúrate de que Babel pueda transpilar archivos de forma segura en el proyecto de TypeScript
  "isolatedModules": true
}
```

Para obtener más información sobre estas banderas:

- [`isolatedModules`](/tsconfig#isolatedModules)
- [`declaration`](/tsconfig#declaration), [`emitDeclarationOnly`](/tsconfig#emitDeclarationOnly)
