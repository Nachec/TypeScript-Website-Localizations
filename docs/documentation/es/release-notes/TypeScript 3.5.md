---
title: TypeScript 3.5
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-5.html
oneline: Notas de la versión de TypeScript 3.5
---

## Mejoras de velocidad

*TypeScript 3.5* introduce varias optimizaciones en torno a la verificación de tipos y las compilaciones incrementales.

### Aceleración de verificación de tipo

*TypeScript 3.5* contiene ciertas optimizaciones sobre *TypeScript 3.4* para la verificación de tipos de manera más eficiente.
Estas mejoras son significativamente más pronunciadas en escenarios del editor donde la verificación de tipos impulsa operaciones como listas de completado de código.

### Mejoras `--incrementales`

*TypeScript 3.5* mejora el modo de compilación [`incremental`](/tsconfig#incremental) de 3.4, al guardar información sobre cómo se calculó el estado del mundo ⏤ la configuración del compilador, por qué se buscaron los archivos, dónde se encontraron los archivos, etc.
En escenarios que involucran cientos de proyectos que usan referencias de proyectos *TypeScript* en modo `--build`, [hemos encontrado que la cantidad de tiempo de reconstrucción se puede reducir hasta en un 68% en comparación con *TypeScript 3.4*](https://github.com/Microsoft/TypeScript/pull/31101)!

Para obtener más detalles, puedes ver las solicitudes de extracción para

- [resolución del módulo `cache`](https://github.com/Microsoft/TypeScript/pull/31100)
- [configuración de caché calculada a partir de `tsconfig.json`](https://github.com/Microsoft/TypeScript/pull/31101)

## El tipo de ayudante `Omit`

*TypeScript 3.5* introduce el nuevo tipo de ayudante `Omit`, que crea un nuevo tipo con algunas propiedades eliminadas del original.

```ts
type Person = {
  name: string;
  age: number;
  location: string;
};

type QuantumPerson = Omit<Person, "location">;

// equivalente a
type QuantumPerson = {
  name: string;
  age: number;
};
```

Aquí pudimos copiar todas las propiedades de `Person` excepto por `location` usando el ayudante `Omit`.

Para obtener más detalles, [consulta la solicitud de extracción en *GitHub* para agregar `Omit`](https://github.com/Microsoft/TypeScript/pull/30552), así como [el cambio para usar `Omit` para el resto de los objetos](https://github.com/microsoft/TypeScript/pull/31134).

### Controles de exceso de propiedad mejorados en tipos unión

En *TypeScript 3.4* y versiones anteriores, se permitían ciertas propiedades en exceso en situaciones en las que realmente no deberían haber estado.
Por ejemplo, *TypeScript 3.4* permitía la propiedad `name` incorrecta en el objeto literal, aunque sus tipos no coinciden entre `Point` y `Label`.

```ts
type Point = {
  x: number;
  y: number;
};

type Label = {
  name: string;
};

const thing: Point | Label = {
  x: 0,
  y: 0,
  name: true // ¡Uh oh!
};
```

Anteriormente, una unión no discriminada no tendría verificación de exceso de propiedades realizada en sus miembros y, como resultado, la propiedad `name` escrita incorrectamente y pasada desapercibida.

En *TypeScript 3.5*, el verificador de tipo al menos comprueba que todas las propiedades proporcionadas pertenecen a *algún* miembro de la unión y tienen el tipo apropiado, lo cual significa que el ejemplo anterior emite correctamente un error.

Ten en cuenta que la superposición parcial todavía está permitida siempre que los tipos de propiedad sean válidos.

```ts
const pl: Point | Label = {
  x: 0,
  y: 0,
  name: "origin" // bien
};
```

## La bandera `--allowUmdGlobalAccess`

En *TypeScript 3.5*, ahora puedes hacer referencia a declaraciones *UMD* globales como

```
export as namespace foo;
```

desde donde sea ⏤ incluso módulos ⏤ usando el nuevo indicador [`allowUmdGlobalAccess`](/tsconfig#allowUmdGlobalAccess).

Este modo agrega flexibilidad para mezclar y combinar la forma en que las bibliotecas de terceros, donde los globales que las bibliotecas declaran siempre se pueden consumir, incluso desde dentro de los módulos.

Para obtener más detalles, [consulta la solicitud de extracción en *GitHub*](https://github.com/Microsoft/TypeScript/pull/30776/files).

## Comprobación más inteligente del tipo unión

En *TypeScript 3.4* y versiones anteriores, el siguiente ejemplo fallaría:

```ts
type S = { done: boolean, valor: number };
type T = { done: false; value: number } | { done: true; value: number };

declare let source: S;
declare let target: T;

target = source;
```

Eso es porque `S` no se puede asignar a `{ done: false, value: number }` ni a `{ done: true, value: number }`.
¿Por qué?
Debido a que la propiedad `done` en `S` no es lo suficientemente específica ⏤ es `boolean` mientras que cada componente de `T` tiene una propiedad `done` que específicamente es `true` o `false`.
Eso es lo que queríamos decir con cada tipo de constituyente que se verifica de forma aislada: *TypeScript* no solo une cada propiedad y ve si `S` se puede asignar a eso.
Si lo hiciera, podría pasar algún código incorrecto como el siguiente:

```ts
interface Foo {
  kind: "foo";
  value: string;
}

interface Bar {
  kind: "bar";
  value: number;
}

function doSomething(x: Foo | Bar) {
  if (x.kind === "foo") {
    x.value.toLowerCase();
  }
}

// UH oh - ¡afortunadamente errores de TypeScript aquí!
doSomething({
  kind: "foo",
  value: 123
});
```

Sin embargo, esto fue demasiado estricto para el ejemplo original.
Si averiguas el tipo preciso de cualquier valor posible de `S`, podrás ver que coincide exactamente con los tipos de `T`.

En *TypeScript 3.5*, al asignar tipos con propiedades discriminantes como en `T`, el lenguaje en realidad  *irá más allá* y descompondrá tipos como `S` en una unión de todos los posibles tipos habitantes.
En este caso, dado que `boolean` es una unión de `true` y `false`, `S` se verá como una unión de `{ done: false, value: number }` y `{ done: true, value: number }`.

Para obtener más detalles, puedes [ver la solicitud de extracción original en *GitHub*](https://github.com/microsoft/TypeScript/pull/30779).

## Inferencia de tipos de orden superior a partir de constructores genéricos

In TypeScript 3.4, we improved inference for when generic functions that return functions like so:

```ts
function compose<T, U, V>(f: (x: T) => U, g: (y: U) => V): (x: T) => V {
  return x => g(f(x));
}
```

tomó otras funciones genéricas como argumentos, así:

```ts
function arrayify<T>(x: T): T[] {
  return [x];
}

type Box<U> = { value: U };
function boxify<U>(y: U): Box<U> {
  return { value: y };
}

let newFn = compose(arrayify, boxify);
```

En lugar de un tipo relativamente inútil como `(x: {}) => Box<{}[]>`, que las versiones anteriores del lenguaje inferirían, la inferencia de *TypeScript 3.4* permite que `newFn` sea genérico.
Su nuevo tipo es `<T>(x: T) => Box<T[]>`.

*TypeScript 3.5* generaliza este comportamiento para trabajar también en funciones constructoras.

```ts
class Box<T> {
  kind: "box";
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

class Bag<U> {
  kind: "bag";
  value: U;
  constructor(value: U) {
    this.value = value;
  }
}

function composeCtor<T, U, V>(
  F: new (x: T) => U,
  G: new (y: U) => V
): (x: T) => V {
  return x => new G(new F(x));
}

let f = composeCtor(Box, Bag); // tiene el tipo '<T>(x: T) => Bag<Box<T>>'
let a = f(1024); // tiene el tipo 'Bag<Box<number>>'
```

Además de los patrones de composición como el anterior, esta nueva inferencia sobre constructores genéricos significa que las funciones que operan en componentes de clase en ciertas bibliotecas de *IU* como *React* pueden operar correctamente en componentes de clase genéricos.

```ts
type ComponentClass<P> = new (props: P) => Component<P>;
declare class Component<P> {
  props: P;
  constructor(props: P);
}

declare function myHoc<P>(C: ComponentClass<P>): ComponentClass<P>;

type NestedProps<T> = { foo: number; stuff: T };

declare class GenericComponent<T> extends Component<NestedProps<T>> {}

// el tipo es 'new<T>(props: NestedProps<T>) => Component<NestedProps<T>>'
const GenericComponent2 = myHoc(GenericComponent);
```

Para obtener más información, [consulta la solicitud de extracción original en *GitHub*](https://github.com/microsoft/TypeScript/pull/31116).
