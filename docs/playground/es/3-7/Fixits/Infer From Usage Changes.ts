//// { "compiler": {  "noImplicitAny": false }, "order": 2 }

// Con la 'inferencia de uso' existente de TypeScript 3.7
// la corrección de código se volvió más inteligente. Ahora usará una lista de
// tipos importantes conocidos (string, number, array, Promise)
// e inferir si el uso de un tipo coincide con la API
// de estos objetos.

// Para los siguientes ejemplos, selecciona los parámetros de
// las funciones, haz clic en la bombilla y elige
// "Inferir el tipo de los parámetros..."

// Infiere un array de números:

function pushNumber(arr) {
  arr.push(12);
}

// Infiere una promesa:

function awaitPromise(promise) {
  promise.then((value) => console.log(value));
}

// Infiere la función y su tipo de retorno:

function inferAny(app) {
  const result = app.use("hi");
  return result;
}

// Infiere un arreglo de strings porque se le
// agregó una cadena:

function insertString(names) {
  names[1] = "hello";
}
