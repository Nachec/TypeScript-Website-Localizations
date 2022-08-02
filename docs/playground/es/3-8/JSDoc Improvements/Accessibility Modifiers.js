//// { "compiler": { "ts": "3.8.3" }, "isJavaScript": true }
// @ts-check

// La compatibilidad con JSDoc para TypeScript se amplió para admitir
// los modificadores de accesibilidad en las propiedades de la clase. Hay:
//
// @public - el predeterminado, y qué sucede si no estableces uno
// @private - solo se puede acceder al campo en la misma clase
//            donde se define el campo
// @protected - el campo es accesible para la clase donde está
//              definida y subclases de esa clase
//

// Esta es una clase base de Animal, tiene campos tanto un privado
// como un protegido. Las subclases pueden acceder a "this.isFast" pero
// no a "this.type".

// Fuera de estos, la clase, ambos campos no son
// visible y devuelven un error del compilador cuando // @ts-check está
// encendido:

class Animal {
  constructor(type) {
    /** @private */
    this.type = type;
    /** @protected */
    this.isFast = type === "cheetah";
  }

  makeNoise() {
    // Supuestamente estos son bastante silenciosos
    if (this.type === "bengal") {
      console.log("");
    } else {
      throw new Error("makeNoise was called on a base class");
    }
  }
}

class Cat extends Animal {
  constructor(type) {
    super(type || "housecat");
  }

  makeNoise() {
    console.log("meow");
  }

  runAway() {
    if (this.isFast) {
      console.log("Got away");
    } else {
      console.log("Did not make it");
    }
  }
}

class Cheetah extends Cat {
  constructor() {
    super("cheetah");
  }
}

class Bengal extends Cat {
  constructor() {
    super("bengal");
  }
}

const housecat = new Cat();
housecat.makeNoise();

// Estos no están disponibles
housecat.type;
housecat.isFast;

// Puedes leer más en la publicación ⏤o post⏤.
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#jsdoc-modifiers
