---
display: "Módulos aislados"
oneline: "Se asegura de que cada archivo se pueda transpilar de forma segura sin depender de otras importaciones."
---

Si bien puede usar *TypeScript* para producir código JavaScript a partir de código *TypeScript*, también es común usar otros transpiladores como [*Babel*](https://babeljs.io) para hacer esto.
Sin embargo, otros transpiladores solo operan en un solo archivo a la vez, lo que significa que no pueden aplicar transformaciones de código que dependan de la comprensión del sistema de tipos completo.
Esta restricción también se aplica a la *API* `ts.transpileModule` de *TypeScript*, que utilizan algunas herramientas de compilación.

Estas limitaciones pueden causar problemas en el entorno de ejecución con algunas características de *TypeScript* como `const enum`s y `namespace`s.
La configuración de la marca `isolatedModules` le dice a *TypeScript* que le advierta si escribes cierto código que no se puede interpretar correctamente por un proceso de transpilación de un solo archivo.

No cambia el comportamiento de tu código, ni cambia el comportamiento del proceso de verificación y emisión de *TypeScript*.

Algunos ejemplos de código que no funcionan cuando `isolatedModules` está habilitado.

#### Exportación de identificadores sin valor

En *TypeScript*, puedes importar un *tipo* y luego exportarlo:

```ts twoslash
// @noErrors
import { someType, someFunction } from "someModule";

someFunction();

export { someType, someFunction };
```

Debido a que no hay valor para `someType`, la `export` emitida no intentará exportarlo (esto sería un error del entorno de ejecución en *JavaScript*):

```js
export { someFunction };
```

Los transpiladores de un solo archivo no saben si `someType` produce un valor o no, por lo que es un error exportar un nombre que solo se refiere a un tipo.

#### Archivos que no son de módulo

Si se establece `isolatedModules`, todos los archivos de implementación deben ser *módulos* (lo cual significa que tiene alguna forma de `import`/`export`). Se produce un error si algún archivo no es un módulo:

```ts twoslash
// @errors: 1208
// @isolatedModules
function fn() {}
```

Esta restricción no se aplica a los archivos `.d.ts`.

#### Referencias a miembros de `const enum`

En *TypeScript*, cuando haces referencia a un miembro `const enum`, la referencia se reemplaza por su valor real en el *JavaScript* emitido. Cambia este *TypeScript*:

```ts twoslash
declare const enum Numbers {
  Zero = 0,
  One = 1,
}
console.log(Numbers.Zero + Numbers.One);
```

A este *JavaScript*:

```ts twoslash
// @showEmit
// @removeComments
declare const enum Numbers {
  Zero = 0,
  One = 1,
}
console.log(Numbers.Zero + Numbers.One);
```

Sin el conocimiento de los valores de estos miembros, otros transpiladores no pueden reemplazar las referencias a `Numbers`, lo que sería un error del entorno de ejecución si se deja solo (ya que no hay ningún objeto de `Numbers` en el entorno de ejecución).
Debido a esto, cuando se establece `isolatedModules`, es un error hacer referencia a un miembro del alcance `const enum`.
