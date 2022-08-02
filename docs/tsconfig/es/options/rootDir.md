---
display: "Root Dir"
oneline: "Especifica el directorio raíz dentro de tus archivos fuente."
---

**Predeterminado**: La ruta común más larga de todos los archivos de entrada sin declaración. Si se establece [`composite`](#composite), el valor predeterminado es en cambio el directorio que contiene el archivo `tsconfig.json`.

Cuando *TypeScript* compila archivos, mantiene la misma estructura de directorios en el directorio de salida existente en el directorio de entrada.

Por ejemplo, digamos que tienes algunos archivos de entrada:

```
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
│   ├── sub
│   │   ├── c.ts
├── types.d.ts
```

El valor inferido para `rootDir` es la ruta común más larga de todos los archivos de entrada sin declaración, que en este caso es `core/`.

Si tu [`outDir`](#outDir) fuera `dist`, *TypeScript* escribiría este árbol:

```
MyProj
├── dist
│   ├── a.js
│   ├── b.js
│   ├── sub
│   │   ├── c.js
```

Sin embargo, es posible que hayas tenido la intención de que `core` sea parte de la estructura del directorio de salida.
Configurando `rootDir: "."` en `tsconfig.json`, *TypeScript* escribiría este árbol:

```
MyProj
├── dist
│   ├── core
│   │   ├── a.js
│   │   ├── b.js
│   │   ├── sub
│   │   │   ├── c.js
```

Es importante destacar que `rootDir` **no afecta qué archivos pasan a formar parte de la compilación**.
No tiene interacción con la configuración de [`include`](#include), `exclude` o [`files`](#files) en `tsconfig.json`.

Ten en cuenta que *TypeScript* nunca escribirá un archivo de salida en un directorio fuera de [`outDir`](#outDir), y nunca omitirá la emisión de un archivo.
Por esta razón, `rootDir` también obliga a que todos los archivos que necesitan ser emitidos estén debajo de la ruta de `rootDir`.

Por ejemplo, digamos que tenías este árbol:

```
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
├── helpers.ts
```

Sería un error especificar `rootDir` como `core` *e* [`include`](#include) como `*` porque crea un archivo (`helpers.ts`) que debería ser emitido *fuera* del [`outDir`](#outDir) (es decir, `../helpers.js`).
