//// { "order": 0 }

// Una clase es un tipo de objeto JavaScript especial que
// siempre se crea a través de un constructor. Estas clases
// actúan como objetos y tienen una estructura de herencia
// similar a lenguajes como Java/C#/Swift.

// Aquí hay una clase de ejemplo:

class Vendor {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    return "Hello, welcome to " + this.name;
  }
}

// Se puede crear una instancia mediante la nueva palabra clave y
// puedes llamar a métodos y acceder a propiedades desde el
// object.

const shop = new Vendor("Ye Olde Shop");
console.log(shop.greet());

// Puedes subclasificar un objeto. Aquí hay un carrito de comida que
// tiene una variedad y un nombre:

class FoodTruck extends Vendor {
  cuisine: string;

  constructor(name: string, cuisine: string) {
    super(name);
    this.cuisine = cuisine;
  }

  greet() {
    return "Hi, welcome to food truck " + this.name + ". We serve " + this.cuisine + " food.";
  }
}

// Porque indicamos que debe haber dos argumentos
// para crear un nuevo FoodTruck, TypeScript proporcionará errores
// cuando solo usas una:

const nameOnlyTruck = new FoodTruck("Salome's Adobo");

// Pasar correctamente dos argumentos te permitirá crear una
// nueva instancia de FoodTruck:

const truck = new FoodTruck("Dave's Doritos", "junk");
console.log(truck.greet());
