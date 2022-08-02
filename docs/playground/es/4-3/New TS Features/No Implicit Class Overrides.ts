//// { "compiler": { "ts": "4.3.4" } }
// Al trabajar con jerarquías de clases, puede ser posible
// para que las funciones que redefinas no estén sincronizadas porque
// antes de 4.3, no existe una forma segura de garantizar que una función
// siempre esté redefiniendo una función existente.

// Por ejemplo, esta clase Account espera que su única función sea
// redefinida cuando un usuario es un administrador:

class Account {
  doSomething() {
    console.log("Make me a sandwich");
  }
}

class Admin extends Account {
  doSomething() {
    console.log("Sudo make me a sandwich");
  }
}

// Puedes cambiar los nombres de estas funciones, por ejemplo
// tal vez 'doSomething' sea un poco vago. Si cambias el nombre
// a 'performAction' en Account, pero *no* en Admin tienes
// desacopladas las funciones inesperadamente.

// Para hacer cumplir la coherencia, hay una nueva bandera: noImplicitOverride
// y sintaxis adicional. Para verlo en acción, borra el espacio después de @
// en el siguiente comentario:

// @ noImplicitOverride

// Luego debes agregar `override` donde están los marcadores de error rojos.
