---
display: "moduleSuffixes"
oneline: "Lista de sufijos de nombre de archivo para buscar al resolver un módulo."
---

Proporciona una forma de sobrescribir la lista predeterminada de sufijos de nombre de archivo para buscar al resolver un módulo.
 
```json tsconfig
{
    "compilerOptions": {
        "moduleSuffixes": [".ios", ".native", ""]
    }
}
```

Dada la configuración anterior, una `import` como la siguiente...

```ts
import * as foo from "./foo";
```

*Typescript* intentará buscar en los archivos relativos `./foo.ios.ts`, `./foo.native.ts` y finalmente `./foo.ts`.

Ten en cuenta que la cadena vacía `""` en [`moduleSuffixes`](#moduleSuffixes) es necesaria para que *TypeScript* también busque `./foo.ts`. 

Esta característica puede ser útil para proyectos *React Native* donde cada plataforma destino puede usar un `tsconfig.json` separado con diferentes `moduleSuffixes`.