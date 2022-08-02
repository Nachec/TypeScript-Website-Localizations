---
display: "Include"
oneline: "Especifica una lista de patrones globales que coincidan con los archivos que se incluirán en la compilación."
---

Especifica un arreglo de nombres de archivo o patrones para incluir en el programa.
Estos nombres de archivo se resuelven en relación con el directorio que contiene el archivo `tsconfig.json`.

```json
{
  "include": ["src/**/*", "tests/**/*"]
}
```

Que incluiría:

<!-- TODO: #135
```diff
  .
- ├── scripts
- │   ├── lint.ts
- │   ├── update_deps.ts
- │   └── utils.ts
+ ├── src
+ │   ├── client
+ │   │    ├── index.ts
+ │   │    └── utils.ts
+ │   ├── server
+ │   │    └── index.ts
+ ├── tests
+ │   ├── app.test.ts
+ │   ├── utils.ts
+ │   └── tests.d.ts
- ├── package.json
- ├── tsconfig.json
- └── yarn.lock
``` -->

```
.
├── scripts                ⨯
│   ├── lint.ts            ⨯
│   ├── update_deps.ts     ⨯
│   └── utils.ts           ⨯
├── src                    ✓
[parcial]│   ├── client
│   │    ├── index.ts      ✓
│   │    └── utils.ts      ✓
│   ├── server             ✓
│   │    └── index.ts      ✓
├── tests                  ✓
│   ├── app.test.ts        ✓
│   ├── utils.ts           ✓
│   └── tests.d.ts         ✓
├── package.json
├── tsconfig.json
└── yarn.lock
```

`include` y `exclude` admiten caracteres comodín para crear patrones globales:

- `*` coincide con cero o más caracteres (excluyendo los separadores de directorio)
- `?` coincide con cualquier carácter (excluyendo los separadores de directorio)
- `**/` coincide con cualquier directorio anidado en cualquier nivel

Si un patrón `glob` no incluye una extensión de archivo, solo se incluyen los archivos con extensiones compatibles (por ejemplo, `.ts`, `.tsx` y `.d.ts` de forma predeterminada, con `.js` y `. jsx` si [`allowJs`](#allowJs) se establece en `true`).
