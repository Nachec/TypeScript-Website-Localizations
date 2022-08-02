---
display: "Declaración Dir"
oneline: "Especifica el directorio de salida para los archivos de declaración generados."
---

Ofrece una forma de configurar el directorio raíz donde se emiten los archivos de declaración.

```
example
├── index.ts
├── package.json
└── tsconfig.json
```

con este `tsconfig.json`:

```json tsconfig
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./types"
  }
}
```

Colocaría los `d.ts` para el `index.ts` en un directorio `types`:

```
example
├── index.js
├── index.ts
├── package.json
├── tsconfig.json
└── types
    └── index.d.ts
```
