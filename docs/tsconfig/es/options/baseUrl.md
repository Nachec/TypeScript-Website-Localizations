---
display: "URL base"
oneline: "Especifica el directorio base para resolver nombres de módulos no relativos."
---

Te permite establecer un directorio base para resolver nombres de módulos no absolutos.

Puedes definir un directorio raíz donde puedes hacer una resolución de archivo absoluta. por ejemplo:

```
baseUrl
├── ex.ts
├── hello
│   └── world.ts
└── tsconfig.json
```

Con `"baseUrl": "./" `dentro de este proyecto, *TypeScript* buscará archivos que comiencen en el mismo directorio que el `tsconfig.json`.

```ts
import { helloWorld } from "hello/world";

console.log(helloWorld);
```

Si te cansas de que las importaciones siempre parezcan `"../"` o `"./"`, o necesites
cambiarlas a medida que mueves archivos, esta es una excelente manera de solucionarlo.
