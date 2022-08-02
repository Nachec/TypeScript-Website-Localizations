---
title: Mixins
layout: docs
permalink: /docs/handbook/mixins.html
oneline: Usar el patrón mixin con TypeScript
translatable: true
---

Junto con las jerarquías OO tradicionales, otra forma popular de crear clases a partir de componentes reutilizables es crearlas combinando clases parciales más simples.
Es posible que estés familiarizado con la idea de combinaciones o rasgos para lenguajes como *Scala*, y el patrón también ha alcanzado cierta popularidad en la comunidad de *JavaScript*.

## ¿Cómo funciona un *Mixin*?

El patrón se basa en el uso de genéricos con herencia de clases para extender una clase base.
El mejor soporte de mezcla de *TypeScript* se realiza a través del patrón de expresión de clase.
Puedes leer más sobre cómo funciona este patrón en [*JavaScript* aquí](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/).

Para comenzar, necesitaremos una clase en la que se apliquen los *mixins* además de:

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
```

Entonces necesitas un tipo y una función de fábrica que devuelva una expresión de clase que extienda la clase base.

```ts twoslash
// Para comenzar, necesitamos un tipo que usaremos para extender
// desde otras clases. La principal responsabilidad es declarar
// que el tipo que se pasa es una clase.

type Constructor = new (...args: any[]) => {};

// Este mixin agrega una propiedad a scale, con captadores y definidores
// para cambiarla con una propiedad privada encapsulada:

function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Los mixins no pueden declarar propiedades privadas/protegidas
    // sin embargo, puedes utilizar los campos privados de ES2020
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
```

Con todo esto configurado, puedes crear una clase que represente la clase base con *mixins* aplicados:

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Constructor = new (...args: any[]) => {};
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Los mixins no pueden declarar propiedades privadas/protegidas
    // sin embargo, puedes utilizar los campos privados de ES2020
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
// ---cut---
// Compone una nueva clase desde la clase Sprite,
// aplicando el mixin Scale:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
```

## *Mixins* restringidos

En la forma anterior, los *mixin* no tienen un conocimiento subyacente de la clase, lo que puede dificultar la creación del diseño que deseas.

Para modelar esto, modificamos el tipo del constructor original para aceptar un argumento genérico.

```ts twoslash
// Este fue nuestro constructor anterior:
type Constructor = new (...args: any[]) => {};
// Ahora usamos una versión genérica que puede aplicar una restricción en
// la clase a la que se aplica este mixin
type GConstructor<T = {}> = new (...args: any[]) => T;
```

Esto permite crear clases que solo funcionan con clases base restringidas:

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
// ---cut---
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
```

Luego, puedes crear *mixins* que solo funcionan cuando tienes una base particular sobre la que construir:

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
// ---cut---

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // Este mixin solo funcionará si se pasa una clase
      // base que tiene setPos definido debido a la
      // restricción posicionable.
      this.setPos(0, 20);
    }
  };
}
```

## Patrón alternativo

Las versiones anteriores de este documento recomendaban una forma de escribir *mixins* en la que creabas tanto el entorno de ejecución como las jerarquías de tipos por separado y entonces, al final las combinaba:

```ts twoslash
// @strict: false
// Cada mixin es una clase ES tradicional
class Jumpable {
  jump() {}
}

class Duckable {
  duck() {}
}

// Incluyendo la base
class Sprite {
  x = 0;
  y = 0;
}

// Luego creas una interfaz que se fusiona
// los mixins esperados con el mismo nombre que tu base
interface Sprite extends Jumpable, Duckable {}
// Aplica los mixins en la clase base a través de
// el JS en el entorno de ejecución
applyMixins(Sprite, [Jumpable, Duckable]);

let player = new Sprite();
player.jump();
console.log(player.x, player.y);

// Esto puede vivir en cualquier lugar de tu código base:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
```

Este patrón se basa menos en el compilador y más en tu código base para garantizar que tanto el entorno de ejecución como el sistema de tipos se mantengan correctamente sincronizados.

## Restricciones

El patrón *mixin* se admite de forma nativa dentro del compilador de *TypeScript* mediante análisis de flujo del código.
Hay algunos casos en los que puedes tocar los bordes del soporte nativo.

#### Decoradores y *mixins* [`#4881`](https://github.com/microsoft/TypeScript/issues/4881)

No puedes usar decoradores para proporcionar *mixins* a través del análisis de flujo del código:

```ts twoslash
// @experimentalDecorators
// @errors: 2339
// Una función decoradora que replica el patrón *mixin*:
const Pausable = (target: typeof Player) => {
  return class Pausable extends target {
    shouldFreeze = false;
  };
};

@Pausable
class Player {
  x = 0;
  y = 0;
}

// La clase Player no tiene el tipo de decorador combinado:
const player = new Player();
player.shouldFreeze;

// Si el aspecto del entorno de ejecución se pudiera replicar manualmente
// a través de la composición de tipo o fusión de interfaz.
type FreezablePlayer = Player & { shouldFreeze: boolean };

const playerTwo = (new Player() as unknown) as FreezablePlayer;
playerTwo.shouldFreeze;
```

#### Propiedades *mixin* estáticas [`#17829`](https://github.com/microsoft/TypeScript/issues/17829)

Más un problema que una restricción.
El patrón de expresión de clase crea *singletons*, por lo que no se pueden asignar en el sistema de tipos para admitir diferentes tipos de variables.

Puedes solucionar esto mediante el uso de funciones para devolver sus clases que difieren en función de un genérico:

```ts twoslash
function base<T>() {
  class Base {
    static prop: T;
  }
  return Base;
}

function derived<T>() {
  class Derived extends base<T>() {
    static anotherProp: T;
  }
  return Derived;
}

class Spec extends derived<string>() {}

Spec.prop; // string
Spec.anotherProp; // string
```
