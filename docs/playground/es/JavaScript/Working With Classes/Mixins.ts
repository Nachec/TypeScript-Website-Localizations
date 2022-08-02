//// { "order": 4 }

// Los mixins son un patrón de herencia falso-múltiple para las clases
// en JavaScript para el que TypeScript es compatible. El patrón
// te permite crear una clase que es una combinación de muchas
// clases.

// Para comenzar, necesitamos un tipo que usaremos para extender
// desde otras clases. La principal responsabilidad es declarar
// que el tipo que se pasa es una clase.

type Constructor = new (...args: any[]) => {};

// Entonces podemos crear una serie de clases que se extienden
// la clase final envolviéndola. Este patrón funciona bien
// cuando objetos similares tienen capacidades diferentes.

// Este mixin agrega una propiedad a scale, con captadores y definidores
// para cambiarla con una propiedad privada encapsulada:

function Scale<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
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

// Este mixin agrega métodos adicionales en torno a la composición alfa
// algo que las computadoras modernas usan para crear profundidad:

function Alpha<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    alpha = 1;

    setHidden() {
      this.alpha = 0;
    }

    setVisible() {
      this.alpha = 1;
    }

    setAlpha(alpha: number) {
      this.alpha = alpha;
    }
  };
}

// Una clase básica de sprites simple que luego se extenderá:

class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}

// Aquí creamos dos tipos diferentes de sprites
// que tienen diferentes capacidades:

const ModernDisplaySprite = Alpha(Scale(Sprite));
const EightBitSprite = Scale(Sprite);

// La creación de instancias de estas clases muestra que
// los objetos tienen diferentes conjuntos de propiedades
// y métodos por sus mixins:

const flappySprite = new ModernDisplaySprite("Bird");
flappySprite.x = 10;
flappySprite.y = 20;
flappySprite.setVisible();
flappySprite.setScale(0.8);
console.log(flappySprite.scale);

const gameBoySprite = new EightBitSprite("L block");
gameBoySprite.setScale(0.3);

// Falla porque un EightBitSprite no tiene
// el mixin para cambiar alfas:
gameBoySprite.setAlpha(0.5);

// Si quieres dar más garantías sobre las clases
// que envuelvas, puedes usar un constructor con genéricos.

type GConstructor<T = {}> = new (...args: any[]) => T;

// Ahora puedes declarar que este mixin solo se puede
// aplicar cuando la clase base tiene una determinada forma.

type Moveable = GConstructor<{ setXYAcceleration: (x: number, y: number) => void }>;

// Luego podemos crear un mixin que se base en la función
// presente en el parámetro del GConstructor anterior.

function Jumpable<TBase extends Moveable>(Base: TBase) {
  return class extends Base {
    jump() {
      // Este mixin sabe sobre setXYAcceleration ahora
      this.setXYAcceleration(0, 20);
    }
  };
}

// No podemos crear este sprite hasta que haya una clase
// en la jerarquía mixin que agrega setXYAcceleration:
const UserSprite = new Jumpable(ModernDisplaySprite);
