---
display: "Importar ayudantes"
oneline: "Permite importar funciones auxiliares desde 'tslib' una vez por proyecto, en lugar de incluirlas por archivo."
---

Para ciertas operaciones de bajada de nivel, *TypeScript* usa algún código auxiliar para operaciones como extender clases, extender arreglos u objetos y operaciones asíncronas.
De forma predeterminada, estos ayudantes se insertan en archivos que los utilizan.
Esto puede resultar en la duplicación de código si se usa el mismo ayudante en muchos módulos diferentes.

Si el indicador `importHelpers` está activado, estas funciones auxiliares se importan desde el módulo [`tslib`](https://www.npmjs.com/package/tslib).
Deberás asegurarte de que el módulo `tslib` se pueda importar en el entorno de ejecución.
Esto solo afecta a los módulos; los archivos de scripts globales no intentarán importar módulos.

Por ejemplo, con este *TypeScript*:

```ts
export function fn(arr: number[]) {
  const arr2 = [1, ...arr];
}
```

Activar [`downlevelIteration`](#downlevelIteration) e `importHelpers` sigue siendo `false`:

```ts twoslash
// @showEmit
// @target: ES5
// @downleveliteration
export function fn(arr: number[]) {
  const arr2 = [1, ...arr];
}
```

Luego, activando [`downlevelIteration`](#downlevelIteration) y `importHelpers`:

```ts twoslash
// @showEmit
// @target: ES5
// @downleveliteration
// @importhelpers
// @noErrors
export function fn(arr: number[]) {
  const arr2 = [1, ...arr];
}
```

Puedes usar [`noEmitHelpers`](#noEmitHelpers) cuando proporciones tus propias implementaciones de estas funciones.
