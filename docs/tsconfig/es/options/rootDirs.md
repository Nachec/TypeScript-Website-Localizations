---
display: "Root Dirs"
oneline: "Permite que varios directorios se traten como uno solo al resolver módulos."
---

Usar `rootDirs`, puede informar al compilador que hay muchos directorios "virtuales" que actúan como una única raíz.
Esto permite al compilador resolver las importaciones relativas de módulos dentro de estos directorios "virtuales", como si estuvieran fusionados en un directorio.

Por ejemplo:

```
 src
 └── views
     └── view1.ts (can import "./template1", "./view2`)
     └── view2.ts (can import "./template1", "./view1`)

 generated
 └── templates
         └── views
             └── template1.ts (can import "./view1", "./view2")
```

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src/views", "generated/templates/views"]
  }
}
```

Esto no afecta la forma en que *TypeScript* emite *JavaScript*, solo emula la suposición de que podrán
trabajar a través de esas rutas relativas en el entorno de ejecución.

`rootDirs` se puede usar para proporcionar una "capa `type`" separada a los archivos que no son *TypeScript* o *JavaScript* proporcionando un hogar para los archivos `.d.ts` generados en otro directorio. Esta técnica es útil para aplicaciones empaquetadas en las que se utiliza la `import`ación de archivos que no necesariamente son código:

```sh
 src
 └── index.ts
 └── css
     └── main.css
     └── navigation.css

 generated
 └── css
     └── main.css.d.ts
     └── navigation.css.d.ts
```

```json tsconfig
{
  "compilerOptions": {
    "rootDirs": ["src", "generated"]
  }
}
```

Esta técnica te permite generar tipos con anticipación para los archivos fuente sin código. Las importaciones luego funcionan de forma natural en función de la ubicación del archivo fuente.
Por ejemplo, `./src/index.ts` puede importar el archivo`./src/css/main.css` y *TypeScript* conocerá el comportamiento del paquete para ese tipo de archivo a través del archivo de declaración generado correspondiente.

```ts twoslash
// @filename: main.css.d.ts
export const appClass = "mainClassF3EC2";
// ---cut---
// @filename: index.ts
import { appClass } from "./main.css";
```
