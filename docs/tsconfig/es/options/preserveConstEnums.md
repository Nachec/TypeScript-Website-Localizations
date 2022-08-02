---
display: "Conservar enumeraciones constantes"
oneline: "Desactiva el borrado de declaraciones `const enum` en el código generado."
---

No borra las declaraciones `const enum` en el código generado. `const enum`s proporciona una forma de reducir la huella de memoria general
de tu aplicación en el entorno de ejecución emitiendo el valor de enumeración en lugar de una referencia.

Por ejemplo, con este *TypeScript*:

```ts twoslash
const enum Album {
  JimmyEatWorldFutures = 1,
  TubRingZooHypothesis = 2,
  DogFashionDiscoAdultery = 3,
}

const selectedAlbum = Album.JimmyEatWorldFutures;
if (selectedAlbum === Album.JimmyEatWorldFutures) {
  console.log("That is a great choice.");
}
```

El comportamiento predeterminado de `const enum` es convertir cualquier `Album.Something` al número literal correspondiente y eliminar una referencia
a la enumeración del *JavaScript* por completo.

```ts twoslash
// @showEmit
const enum Album {
  JimmyEatWorldFutures = 1,
  TubRingZooHypothesis = 2,
  DogFashionDiscoAdultery = 3,
}

const selectedAlbum = Album.JimmyEatWorldFutures;
if (selectedAlbum === Album.JimmyEatWorldFutures) {
  console.log("That is a great choice.");
}
```

Con `preserveConstEnums` establecido en `true`, la `enum` existe en el entorno de ejecución y los números aún se emiten.

```ts twoslash
// @preserveConstEnums: true
// @showEmit
const enum Album {
  JimmyEatWorldFutures = 1,
  TubRingZooHypothesis = 2,
  DogFashionDiscoAdultery = 3,
}

const selectedAlbum = Album.JimmyEatWorldFutures;
if (selectedAlbum === Album.JimmyEatWorldFutures) {
  console.log("That is a great choice.");
}
```

Básicamente, esto hace que tales `const enums` sean solo una característica del código fuente, sin rastros del entorno de ejecución.
