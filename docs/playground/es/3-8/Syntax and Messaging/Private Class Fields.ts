//// { "compiler": { "ts": "3.8.3" } }
// 3.8 agrega campos privados, que son una forma de declarar un campo de clase
// para no estar disponible fuera de la clase contenedora, incluidas las subclases.

// Por ejemplo, la clase Person a continuación no permite que nadie use una
// instancia de la clase para leer el firstName, lastName o prefix

class Person {
  #firstName: string;
  #lastName: string;
  #prefix: string;

  constructor(firstName: string, lastName: string, prefix: string) {
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#prefix = prefix;
  }

  greet() {
    // En islandia es preferible utilizar un nombre completo en lugar de [prefix][lastName]
    // https://www.w3.org/International/questions/qa-personal-names#patronymic
    if (navigator.languages[0] === "is") {
      console.log(`Góðan dag, ${this.#firstName} ${this.#lastName}`);
    } else {
      console.log(`Hello, ${this.#prefix} ${this.#lastName}`);
    }
  }
}

let jeremy = new Person("Jeremy", "Bearimy", "Mr");

// No puedes acceder a ninguno de los campos privados desde fuera de esa clase:

// Por ejemplo, esto no funcionará:
console.log(jeremy.#lastName);

// Ni esto:
console.log("Person's last name:", jeremy["#lastName"]);

// Una pregunta común que recibimos es "¿Por qué usarías esto en lugar la palabra
// clave 'private' en un campo de clase? " ⏤ veamos haciendo una comparación con
// cómo funcionaba en TypeScript antes de 3.8:

class Dog {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }
}

let oby = new Dog("Oby");
// No te permitirá acceder mediante notación de punto
oby._name = "Spot";
// Pero TypeScript permite la notación entre corchetes como una cláusula de escape
oby["_name"] = "Cherny";

// La referencia de TypeScript de 'private' solo existe a nivel de tipo
// lo cual significa que solo puedes confiar en él hasta ahora. Con campos privados
// pronto será parte del lenguaje JavaScript, entonces puedes mejorar
// garantías sobre la visibilidad de tu código.

// No planeamos desaprobar la palabra clave `private` del campo
// en TypeScript, por lo que tu código existente seguirá funcionando, pero ahora
// en su lugar, puedes escribir código que esté más cerca del lenguaje JavaScript.

// Puedes obtener más información sobre los campos de clase en la propuesta tc39
// https://github.com/tc39/proposal-class-fields/
// y las notas de la versión beta:
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#ecmascript-private-fields
