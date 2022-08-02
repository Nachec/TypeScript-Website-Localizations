//// { "compiler": { "ts": "4.2.0-beta" } }
// TypeScript ha admitido clases abstractas desde 2015, que
// proporcionas errores del compilador si intentas crear una instancia de esa clase.

// TypeScript 4.2 agrega soporte para declarar que la función constructora
// es abstracta. Esto, principalmente lo utilizan las personas que usan
// el patrón mixin ( example:mixins )

// El patrón mixin implica que las clases se envuelvan dinámicamente
// unas a otras para "mezclar" ciertas características con el resultado final.

// Este patrón se representa en TypeScript a través de una cadena de funciones
// constructoras de las clases, y al declarar una como abstracta puedes usar
// clases abstractas dentro de tus mixins.

// Todos los mixins comienzan con un constructor genérico para pasar la T, ahora
// estos pueden ser abstractos.
type AbstractConstructor<T> = abstract new (...args: any[]) => T

// Crearemos una clase abstracta "Animal" donde
// las subclases deben redefinir 'walk' 
abstract class Animal {
  abstract walk(): void;
  breath() { }
}

// Un mixin que agrega una nueva función (en este caso, animate)
function animatableAnimal<T extends AbstractConstructor<object>>(Ctor: T) {
  abstract class StopWalking extends Ctor {
    animate() { }
  }
  return StopWalking;
}

// Una subclase de Animal, a través de los mixins, aún debe
// manejar el contrato abstracto para Animal. Lo cual significa que
// necesita implementar 'walk' a continuación. Intenta eliminar la función
// para ver que pasa.

class Dog extends animatableAnimal(Animal) {
  walk() { }
}


const dog = new Dog()
dog.breath()
dog.walk()
dog.animate()
