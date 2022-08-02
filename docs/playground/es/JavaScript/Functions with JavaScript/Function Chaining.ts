//// { "order": 2, "compiler": { "esModuleInterop": true } }

// Las API de encadenamiento de funciones son un patrón común en
// JavaScript, que puede hacer que tu código se enfoque
// con valores menos intermedios y más fáciles de leer
// debido a sus cualidades de anidación.

// Una API muy común que funciona mediante encadenamiento
// es jQuery. Aquí hay un ejemplo de jQuery
// que se utiliza con los tipos de DefinitelyTyped:

import $ from "jquery";

// Aquí hay un ejemplo de uso de la API jQuery:

$("#navigation").css("background", "red").height(300).fadeIn(200);

// Si agregas un punto en la línea de arriba, verás
// una larga lista de funciones. Este patrón es fácil de
// reproducir en JavaScript. La clave es asegurarte
// de siempre devolver el mismo objeto.

// Aquí hay una API de ejemplo que crea un encadenamiento
// API. La clave es tener una función externa que
// realice un seguimiento del estado interno, y un objeto que
// exponga la API que siempre se devuelve.

const addTwoNumbers = (start = 1) => {
  let n = start;

  const api = {
    // Implementa cada función en tu API
    add(inc: number = 1) {
      n += inc;
      return api;
    },

    print() {
      console.log(n);
      return api;
    },
  };
  return api;
};

// Lo cual permite el mismo estilo de API que nosotros
// vimos en jQuery:

addTwoNumbers(1).add(3).add().print().add(1);

// Aquí hay un ejemplo similar que usa una clase:

class AddNumbers {
  private n: number;

  constructor(start = 0) {
    this.n = start;
  }

  public add(inc = 1) {
    this.n = this.n + inc;
    return this;
  }

  public print() {
    console.log(this.n);
    return this;
  }
}

// Aquí está en acción:

new AddNumbers(2).add(3).add().print().add(1);

// Este ejemplo usó TypeScript
// inferencia de tipo para proporcionar una forma de
// proporcionar herramientas a los patrones de JavaScript.

// Para más ejemplos sobre esto:
//
//  - example:code-flow
