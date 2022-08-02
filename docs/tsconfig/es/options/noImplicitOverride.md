---
display: "noImplicitOverride"
oneline: "Se asegura de que la redefinición de miembros de las clases derivadas estén marcados con un modificador `override`."
---

Cuando se trabaja con clases que usan herencia, es posible que una subclase "no esté sincronizada" con las funciones que sobrecarga cuando se les cambia el nombre en la clase base.

Por ejemplo, imagina que estás modelando un sistema de sincronización de álbumes de música:

```ts twoslash
class Album {
  download() {
    // Comportamiento predeterminado
  }
}

class SharedAlbum extends Album {
  download() {
    // Redefine para obtener información de muchas fuentes
  }
}
```

Luego, cuando agrega soporte para listas de reproducción generadas por aprendizaje automático, refactoriza la clase `Album` para tener una función 'setup' en su lugar:

```ts twoslash
class Album {
  setup() {
    // Comportamiento predeterminado
  }
}

class MLAlbum extends Album {
  setup() {
    // Redefine para obtener información del algoritmo
  }
}

class SharedAlbum extends Album {
  download() {
    // Redefine para obtener información de muchas fuentes
  }
}
```

En este caso, *TypeScript* no ha proporcionado ninguna advertencia de que `download` en `SharedAlbum` *se esperaba* para anular una función en la clase base.

Usando `noImplicitOverride` te puedes asegurar de que las subclases nunca se desincronicen, garantizando que las funciones que reemplazan incluyen la palabra clave `override`.

El siguiente ejemplo tiene habilitado `noImplicitOverride` y puedes ver el error recibido cuando falta `override`:

```ts twoslash
// @noImplicitOverride
// @errors: 4114
class Album {
  setup() {}
}

class MLAlbum extends Album {
  override setup() {}
}

class SharedAlbum extends Album {
  setup() {}
}
```
