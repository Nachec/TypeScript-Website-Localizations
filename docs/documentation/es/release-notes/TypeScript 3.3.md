---
title: TypeScript 3.3
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-3.html
oneline: Notas de la versión de TypeScript 3.3
---

## Comportamiento mejorado para llamar a tipos unión

En versiones anteriores de *TypeScript*, las uniones de tipos invocables solo se podían invocar si tenían listas de parámetros idénticas.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number; // come y clasifica la fruta
type ColorConsumer = (color: Color) => string; // consume y describe los colores

declare let f: FruitEater | ColorConsumer;

// No se puede invocar una expresión cuyo tipo carece de una firma de llamada.
//   Tipo 'FruitEater | ColorConsumer' no tiene firmas de llamada .ts  compatibles (2349)
f("orange");
```

Sin embargo, en el ejemplo anterior, tanto `FruitEater`s como `ColorConsumer`s deberían poder tomar la cadena `"orange"` y devolver un `number` o un `string`.

En *TypeScript 3.3*, esto ya no es un error.

```ts
type Fruit = "apple" | "orange";
type Color = "red" | "orange";

type FruitEater = (fruit: Fruit) => number; // come y clasifica la fruta
type ColorConsumer = (color: Color) => string; // consume y describe los colores

declare let f: FruitEater | ColorConsumer;

f("orange"); // ¡Esto funciona! Devuelve un 'number | string'.

f("apple"); // error - El argumento de tipo `"apple"` no se puede asignar al parámetro de tipo `"orange"`.

f("red"); // error - El argumento de tipo '"red"' no se puede asignar al parámetro de tipo '"orange"'.
```

En *TypeScript 3.3*, los parámetros de estas firmas se *intersectan* juntos para crear una nueva firma.

En el ejemplo anterior, los parámetros `fruit` y `color` se cruzan juntos en un nuevo parámetro de tipo `Fruit & Color`.
`Fruit & Color` es realmente lo mismo que `("apple" | "orange") & ("red" | "orange")` que es equivalente a `("apple" & "red") | ("apple" & "orange") | ("orange" y "red") | ("orange" & "orange")`.
Cada una de esas intersecciones imposibles se reduce a `never`, y nos quedamos con `"orange" & "orange"` que es simplemente `"orange"`.

## Advertencias

Este nuevo comportamiento solo se activa cuando como máximo un tipo en la unión tiene múltiples sobrecargas, y como máximo un tipo en la unión tiene una firma genérica.
Eso significa métodos en `number[] | string[]` como `map` (que es genérico) todavía no se podrá llamar.

Por otro lado, métodos como `forEach` ahora serán invocables, pero en [`noImplicitAny`](/tsconfig#noImplicitAny) puede haber algunos problemas.

```ts
interface Dog {
  kind: "dog";
  dogProp: any;
}
interface Cat {
  kind: "cat";
  catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];

catOrDogArray.forEach(animal => {
  //                ~~~~~~ error!
  // El parámetro 'animal' tiene implícitamente un tipo 'any'.
});
```

Esto todavía es estrictamente más capaz en *TypeScript 3.3*, y agregar una anotación de tipo explícita funcionará.

```ts
interface Dog {
  kind: "dog";
  dogProp: any;
}
interface Cat {
  kind: "cat";
  catProp: any;
}

const catOrDogArray: Dog[] | Cat[] = [];
catOrDogArray.forEach((animal: Dog | Cat) => {
  if (animal.kind === "dog") {
    animal.dogProp;
    // ...
  } else if (animal.kind === "cat") {
    animal.catProp;
    // ...
  }
});
```

## Observación incremental de archivos para proyectos compuestos en `--build --watch`

*TypeScript 3.0* introdujo una nueva característica para estructurar compilaciones llamadas "proyectos compuestos".
Parte del objetivo aquí era garantizar que los usuarios pudieran dividir proyectos grandes en partes más pequeñas que se construyen rápidamente y preserva la estructura del proyecto, sin comprometer la experiencia existente de *TypeScript*.
Gracias a los proyectos compuestos, *TypeScript* puede usar el modo `--build` para recompilar solo el conjunto de proyectos y dependencias.
Puedes pensar en esto como optimizar las compilaciones entre proyectos.

*TypeScript 2.7* también introdujo compilaciones en modo `--watch` a través de una nueva *API* incremental "constructora".
En una línea similar, la idea completa es que este modo solo vuelve a verificar y vuelve a emitir archivos modificados o archivos cuyas dependencias podrían afectar la verificación de tipos.
Puedes pensar en esto como optimizar las compilaciones de *inter*-proyectos.

Antes de 3.3, la construcción de proyectos compuestos usando `--build --watch` en realidad no usaba esta infraestructura de observación incremental de archivos.
Una actualización en un proyecto en el modo `--build --watch` forzaría una compilación completa de ese proyecto, en lugar de determinar qué archivos dentro de ese proyecto se vieron afectados.

En *TypeScript 3.3*, la bandera `--build` del modo `--watch` también aprovecha la observación incremental de archivos.
Eso puede significar compilaciones significativamente más rápidas en `--build --watch`.
En nuestras pruebas, esta funcionalidad resultó en **una reducción del 50% al 75% en los tiempos de construcción** de los tiempos originales de `--build --watch`.
[Puedes leer más sobre la solicitud de extracción original para el cambio](https://github.com/Microsoft/TypeScript/pull/29161) para ver números específicos, pero creemos que la mayoría de los usuarios de proyectos compuestos verán ganancias significativas aquí.
