---
title: Creación de archivos .d.ts a partir de archivos .js
layout: docs
permalink: /docs/handbook/declaration-files/dts-from-js.html
oneline: "Cómo agregar la generación d.ts a proyectos JavaScript"
translatable: true
---

[Con *TypeScript 3.7*](/docs/handbook/release-notes/typescript-3-7.html#-declaration-and---allowjs),
*TypeScript* agregó soporte para generar archivos `.d.ts` desde *JavaScript* utilizando la sintaxis `JSDoc`.

Esta configuración significa que puedes poseer la experiencia de editor de los editores con tecnología *TypeScript* sin trasladar tu proyecto a *TypeScript* o tener que mantener archivos `.d.ts` en tu código base.
*TypeScript* admite la mayoría de las etiquetas `JSDoc`, puedes encontrar [la referencia aquí](/docs/handbook/type-check-javascript-files.html#supported-jsdoc).

## Configuración de tu proyecto para emitir archivos `.d.ts`

Para agregar la creación de archivos `.d.ts` en tu proyecto, deberás realizar hasta cuatro pasos:

- Agrega *TypeScript* a tus dependencias de desarrollo
- Agrega un `tsconfig.json` para configurar *TypeScript*
- Ejecuta el compilador de *TypeScript* para generar los archivos `d.ts` correspondientes para archivos *JS*
- (opcional) Edita tu `package.json` para hacer referencia a los tipos

### Adición de *TypeScript*

Puedes aprender cómo hacer esto en nuestra [página de instalación](/download).

### `TSConfig`

`TSConfig` es un archivo `jsonc` que configura los dos indicadores del compilador y declara dónde encontrar los archivos.
En este caso, querrás un archivo como el siguiente:

```jsonc tsconfig
{
  // Cambia esto para que coincida con tu proyecto
  "include": ["src/**/*"],

  "compilerOptions": {
    // Le dice a TypeScript que lea archivos JS, como
    // normalmente se ignoran como archivos fuente
    "allowJs": true,
    // Genera archivos d.ts
    "declaration": true,
    // Esta ejecución del compilador solo
    // genera archivos d.ts
    "emitDeclarationOnly": true,
    // Los tipos deben ir a este directorio.
    // Eliminar esto colocaría los archivos .d.ts
    // junto a los archivos .js
    "outDir": "dist",
    // va al archivo js cuando estás usando funciones IDE como
    // "Ir a la definición" en VSCode
    "declarationMap": true
  }
}
```

Puedes obtener más información sobre las opciones en la [referencia de tsconfig](/tsconfig).
Una alternativa al uso de un archivo `TSConfig` es la `CLI`, este es el mismo comportamiento que un comando `CLI`.

```sh
npx -p typescript tsc src/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types
```

## Ejecuta el compilador

Puedes aprender cómo hacer esto en nuestra [página de instalación](/download).
Deseas asegurarte de que estos archivos estén incluidos en tu paquete si los tienes en el archivo `.gitignore` de tu proyecto.

## Editar el `package.json`

*TypeScript* replica la resolución de `node` para módulos en un `package.json`, con un paso adicional para encontrar archivos `.d.ts`.
Aproximadamente, la resolución primero verificará el campo opcional `types`, luego el campo `"main"`, y finalmente probará `index.d.ts` en la raíz.

| `Package.json`              | Ubicación de los `.d.ts` predeterminados |
| :------------------------ | :----------------------------- |
| Sin campo `"types"`         | comprueba `"main"`, luego `index.d.ts`   |
| `"types": "main.d.ts"`      | `main.d.ts`                              |
| `"types": "./dist/main.js" | ./dist/main.d.ts               |

Si está ausente, se usa "main"

| `Package.json`              | Ubicación de los `.d.ts predeterminados` |
| :----------------------- | :------------------------ |
| Sin campo `"main"`          | `index.d.ts`                             |
| `"main": "index.js"`        | `index.d.ts`                             |
| `"main": "./dist/index.js"` | `./dist/index.d.ts`                      |

## Consejos

Si deseas escribir pruebas para tus archivos `.d.ts`, intenta [`tsd`](https://github.com/SamVerschueren/tsd).
