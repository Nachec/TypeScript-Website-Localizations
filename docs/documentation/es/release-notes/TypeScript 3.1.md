---
title: TypeScript 3.1
layout: docs
permalink: /docs/handbook/release-notes/typescript-3-1.html
oneline: Notas de la versión de TypeScript 3.1
---

## Tipos mapeados en tuplas y arreglos

En *TypeScript 3.1*, los tipos de objetos mapeados<sup>[[1]](#ts-3-1-only-homomorphic)</sup> sobre tuplas y arreglos ahora producen nuevas tuplas/arreglos, en lugar de crear un nuevo tipo donde los miembros como `push()`, `pop()` y `length` se convierten.
Por ejemplo:

```ts
type MapToPromise<T> = { [K in keyof T]: Promise<T[K]> };

type Coordinate = [number, number];

type PromiseCoordinate = MapToPromise<Coordinate>; // [Promise<number>, Promise<number>]
```

`MapToPromise` toma un tipo `T`, y cuando ese tipo es una tupla como `Coordinate`, solo se convierten las propiedades numéricas.
En `[number, number]`, hay dos propiedades nombradas numéricamente: `0` y `1`.
Cuando se le da una tupla como esa, `MapToPromise` creará una nueva tupla donde las propiedades `0` y `1` son `Promise` del tipo original.
Entonces, el tipo resultante `PromiseCoordinate` termina con el tipo `[Promise<number>, Promise<number>]`.

## Declaración de propiedades sobre funciones

*TypeScript 3.1* brinda la capacidad de definir propiedades en declaraciones de funciones y funciones declaradas por `const`, simplemente asignando propiedades en estas funciones en el mismo alcance.
Esto nos permite escribir código *JavaScript* canónico sin tener que recurrir a improvisaciones de "espacio de nombres".
Por ejemplo:

```ts
function readImage(path: string, callback: (err: any, image: Image) => void) {
  // ...
}

readImage.sync = (path: string) => {
  const contents = fs.readFileSync(path);
  return decodeImageSync(contents);
};
```

Aquí, tenemos una función `readImage` que lee una imagen de una manera asincrónica sin bloqueo.
Además de `readImage`, hemos proporcionado una función de conveniencia en `readImage` llamada `readImage.sync`.

Si bien las exportaciones de *ECMAScript* a menudo son una mejor manera de proporcionar esta funcionalidad, este nuevo soporte permite que el código escrito en este estilo "simplemente funcione" en *TypeScript*.
Además, este enfoque para las declaraciones de propiedades nos permite expresar patrones comunes como `defaultProps` y `propTypes` en los componentes de la función *React* (anteriormente conocidos como *CFSE*).

```ts
export const FooComponent = ({ name }) => <div>Hello! I am {name}</div>;

FooComponent.defaultProps = {
  name: "(anonymous)",
};
```

<!--
fs.readFile(path, (err, data) => {
        if (err) callback(err, undefined);
        else decodeImage(data, (err, image) => {
            if (err) callback(err, undefined);
            else callback(undefined, image);
        });
    });
-->

---

<sup id="ts-3-1-only-homomorphic">[1]</sup>Específicamente, tipos mapeados homomórficos como en el formulario anterior.

## Selección de versión con `typesVersions`

La retroalimentación de nuestra comunidad, así como nuestra propia experiencia, nos han demostrado que aprovechar las funciones más nuevas de *TypeScript* y, al mismo tiempo, dar cabida a los usuarios de las versiones anteriores es difícil.
*TypeScript* introduce una nueva función llamada `typesVersions` para ayudar a adaptarse a estos escenarios.

Puedes leer [sobre esto en la sección *Publicación* de la sección de archivos de declaración](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#version-selection-with-typesversions)
