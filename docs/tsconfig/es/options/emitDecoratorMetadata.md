---
display: "Emitir metadatos del decorador"
oneline: "Emite metadatos de tipo diseño para declaraciones decoradas en archivos fuente."
---

Habilita el soporte experimental para la emisión de metadatos de tipo para decoradores que funciona con el módulo [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata).

Por ejemplo, aquí está el *TypeScript*

```ts twoslash
// @experimentalDecorators
function LogMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}

class Demo {
  @LogMethod
  public foo(bar: number) {
    // hace nada
  }
}

const demo = new Demo();
```

Con `emitDecoratorMetadata` no establecido en `true` (predeterminado) el emitido en *JavaScript* es:

```ts twoslash
// @experimentalDecorators
// @showEmit
function LogMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}

class Demo {
  @LogMethod
  public foo(bar: number) {
    // hace nada
  }
}

const demo = new Demo();
```

Con `emitDecoratorMetadata` establecido en `true` el *JavaScript* emitido es:

```ts twoslash
// @experimentalDecorators
// @showEmit
// @emitDecoratorMetadata
function LogMethod(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}

class Demo {
  @LogMethod
  public foo(bar: number) {
    // hace nada
  }
}

const demo = new Demo();
```
