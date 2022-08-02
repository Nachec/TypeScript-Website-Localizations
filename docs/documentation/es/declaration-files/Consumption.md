---
title: Consumo
layout: docs
permalink: /docs/handbook/declaration-files/consumption.html
oneline: "Cómo descargar archivos d.ts para tu proyecto"
---

## Descargar

Obtener declaraciones de tipos no requiere herramientas aparte de npm.

Como ejemplo, obtener las declaraciones de una biblioteca como `lodash` no lleva más que el siguiente comando:

```Shell
npm install --save-dev @types/lodash
```

Vale la pena señalar que si el paquete npm ya incluye su archivo de declaración como se describe en [Publicación](/docs/handbook/statement-files/publishing.html), no es necesario descargar el paquete `@types` correspondiente.

## Consumir

A partir de ahí, podrás usar `lodash` en tu código *TypeScript* sin problemas.
Esto funciona tanto para los módulos como para el código global.

Por ejemplo, una vez que hayas `npm install`ado tus declaraciones de tipo, puedes usar importaciones y escribir:

```ts
import * as _ from "lodash";
_.padStart("Hola TypeScript!", 20, " ");
```

o si no estás usando módulos, puedes simplemente usar la variable global `_`.

```ts
_.padStart("Hola TypeScript!", 20, " ");
```

## Buscar

En su mayor parte, los paquetes de declaración de tipo siempre deben tener el mismo nombre que el nombre del paquete `npm`, pero con el prefijo `@types/`,
pero si lo necesitas, puedes consultar [este tipo de búsqueda](https://aka.ms/types) para encontrar el paquete de tu biblioteca favorita.

> Nota: Si el archivo de declaración que estás buscando no está presente, siempre puedes contribuir con uno y ayudar al próximo desarrollador que lo busque.
> Consulta la [página de pautas de contribución `DefinitelyTyped`](https://definitelytyped.org/guides/contributing.html) para obtener más detalles.
