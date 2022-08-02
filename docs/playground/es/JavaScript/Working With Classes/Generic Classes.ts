//// { "order": 3 }

// Este ejemplo principalmente está en TypeScript, porque es mucho
// más fácil entender de esta manera primero. Al final vamos a
// cubrir cómo crear la misma clase pero usando JSDoc en su lugar.

// Las clases genéricas son una forma de decir que un tipo particular
// depende de otro tipo. Por ejemplo, aquí hay un cajón
// que puede contener cualquier tipo de objeto, pero solo un tipo:

class Drawer<ClothingType> {
  contents: ClothingType[] = [];

  add(object: ClothingType) {
    this.contents.push(object);
  }

  remove() {
    return this.contents.pop();
  }
}

// Para utilizar un cajón, necesitarás otro
// tipo para trabajar con:

interface Sock {
  color: string;
}

interface TShirt {
  size: "s" | "m" | "l";
}

// Podemos crear un cajón solo para calcetines pasando el
// tipo Sock cuando creemos un nuevo Drawer:
const sockDrawer = new Drawer<Sock>();

// Ahora podemos agregar o quitar calcetines al cajón:
sockDrawer.add({ color: "white" });
const mySock = sockDrawer.remove();

// Además de crear un cajón para camisetas:
const tshirtDrawer = new Drawer<TShirt>();
tshirtDrawer.add({ size: "m" });

// Si eres un poco excéntrico, incluso podrías crear un cajón
// que mezcla calcetines y camisetas mediante una unión:

const mixedDrawer = new Drawer<Sock | TShirt>();

// Creando una clase como Drawer sin la sintaxis TypeScript
// adicional requiere el uso de la etiqueta de plantilla en JSDoc.adicional En este
// ejemplo, definimos la variable de plantilla, luego proporcionamos
// las propiedades de la clase:

// Para que esto funcione en el playground, deberás cambiar
// la configuración para que sea un archivo JavaScript, y elimina el
// código TypeScript de arriba

/**
 * @template {{}} ClothingType
 */
class Dresser {
  constructor() {
    /** @type {ClothingType[]} */
    this.contents = [];
  }

  /** @param {ClothingType} object */
  add(object) {
    this.contents.push(object);
  }

  /** @return {ClothingType} */
  remove() {
    return this.contents.pop();
  }
}

// Luego creamos un nuevo tipo a través de JSDoc:

/**
 * @typedef {Object} Coat An item of clothing
 * @property {string} color The colour for coat
 */

// Luego, cuando creamos una nueva instancia de esa clase
// usamos @type para asignar la variable como Dresser
// que maneja Coats.

/** @type {Dresser<Coat>} */
const coatDresser = new Dresser();

coatDresser.add({ color: "green" });
const coat = coatDresser.remove();
