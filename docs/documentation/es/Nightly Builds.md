---
title: Construcciones nocturnas
layout: docs
permalink: /docs/handbook/nightly-builds.html
oneline: Cómo usar una compilación nocturna de TypeScript
translatable: true
---

Una compilación nocturna de la rama [`main`](https://github.com/Microsoft/TypeScript/tree/main) de *TypeScript*  se publica a `npm` antes de la medianoche *PST*.
Así es como lo puedes obtener y usar con tus herramientas.

## Usar `npm`

```shell
npm install -g typescript@next
```

## Actualizar tu *IDE* para usar las compilaciones nocturnas

También puedes actualizar tu *IDE* para usar el servicio nocturno.
Primero deberás instalar el paquete a través de `npm`.
Puedes instalar el paquete `npm` globalmente o en un directorio `node_modules` local.

El resto de esta sección asume que `typecript@next` ya está instalado.

### Visual Studio Code

Actualiza `.vscode/settings.json` con lo siguiente:

```json
"typecript.tsdk": "<ruta a tu directorio>/node_modules/typescript/lib"
```

Hay más información disponible en la [documentación de *VSCode*](https://code.visualstudio.com/Docs/languages/typescript#_using-newer-typescript-versions).

### *Sublime Text*

Actualiza el archivo de `Configuración ⏤ User` con lo siguiente:

```json
"typescript_tsdk": "<ruta a tu directorio>/node_modules/typescript/lib"
```

Hay más información disponible en el [Complemento de *TypeScript* para la documentación de instalación de *Sublime Text*](https://github.com/Microsoft/TypeScript-Sublime-Plugin#installation).

### *Visual Studio* 2013 y 2015

> Nota: La mayoría de los cambios no requieren que instales una nueva versión del complemento *VS TypeScript*.

Actualmente, la compilación nocturna no incluye la configuración completa del complemento, pero también estamos trabajando para publicar un instalador todas las noches.

1. Descarga el script [*VSDevMode.ps1*](https://github.com/Microsoft/TypeScript/blob/main/scripts/VSDevMode.ps1).

   > Consulta también nuestra página wiki sobre [uso de un archivo de servicio de lenguaje personalizado](https://github.com/Microsoft/TypeScript/wiki/Dev-Mode-in-Visual-Studio#using-a-custom-language-service-file).

2. Desde una ventana de comandos de *PowerShell*, ejecuta:

Para *VS 2015*:

```posh
VSDevMode.ps1 14 -tsScript <ruta a tu directorio>/node_modules/typescript/lib
```

Para *VS 2013*:

```posh
VSDevMode.ps1 12 -tsScript <ruta a tu directorio>/node_modules/typescript/lib
```

### *IntelliJ IDEA* (*Mac*)

Ve a `Preferencias` ▹ `Lenguajes y marcos` ▹ `TypeScript`:

> TypeScript Version: Si instalaste con `npm`: `/usr/local/lib/node_modules/typescript/lib`

### *IntelliJ IDEA* (*Windows*)

Ve a `Archivo` ▹ ` Configuración` ▹ `Lenguajes y marcos` ▹ `TypeScript`:

> TypeScript Version: Si instalaste con `npm`: `C:\Users\NOMBREUSUARIO\AppData\Roaming\npm\node_modules\typescript\lib`
