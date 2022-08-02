//// { "compiler": {  }, "order": 3 }

// Los mensajes de error de TypeScript a veces pueden ser un poco detallados ...
// Con 3.7, hemos tomado algunos casos que podrían ser particularmente
// enormes.

// Propiedades anidadas

let a = { b: { c: { d: { e: "string" } } } };
let b = { b: { c: { d: { e: 12 } } } };

a = b;

// Antes, eran 2 líneas de código por propiedad anidada, lo que
// rápidamente significó que la gente aprendiera a leer los mensajes de error
// leyendo la primera y luego la última línea de un mensaje de error.

// Ahora están en línea. :tada:

// Anteriormente en 3.6:
//
// Type '{ b: { c: { d: { e: number; }; }; }; }' no es asignable al tipo '{ b: { c: { d: { e: string; }; }; }; }'.
//   Los tipos de la propiedad 'b' son incompatibles.
//     Type '{ c: { d: { e: number; }; }; }' no se puede asignar al tipo '{c: { d: { e: string; }; }; }'.
//       Los tipos de la propiedad 'c' son incompatibles.
//         Type '{ d: { e: number; }; }' no se puede asignar al tipo '{d: { e: string; }; }'.
//           Los tipos de la propiedad 'd' son incompatibles.
//             Type '{ e: number; }' no se puede asignar al tipo '{e: string; }'.
//               Los tipos de la propiedad 'e' son incompatibles.
//                 El tipo 'number' no se puede asignar al tipo 'string'

// Esto puede manejar el trabajo a través de diferentes tipos de objetos,
// para seguir dando un mensaje de error útil y conciso.

class ExampleClass {
  state = "ok";
}

class OtherClass {
  state = 12;
}

let x = { a: { b: { c: { d: { e: { f: ExampleClass } } } } } };
let y = { a: { b: { c: { d: { e: { f: OtherClass } } } } } };
x = y;

// Anteriormente en 3.6:
//
// Type '{ a: { b: { c: { d: { e: { f: typeof OtherClass; }; }; }; }; }; }' no es asignable al tipo '{ a: { b: { c: { d: { e: { f: typeof ExampleClass; }; }; }; }; }; }'.
//   Los tipos de la propiedad 'a' son incompatibles.
//     Type '{ b: { c: { d: { e: { f: typeof OtherClass; }; }; }; }; }' no es asignable al tipo '{ b: { c: { d: { e: { f: typeof ExampleClass; }; }; }; }; }'.
//       Los tipos de la propiedad 'b' son incompatibles.
//         Type '{ c: { d: { e: { f: typeof OtherClass; }; }; }; }' no es asignable al tipo '{ c: { d: { e: { f: typeof ExampleClass; }; }; }; }'.
//           Los tipos de la propiedad 'c' son incompatibles.
//             Type '{ d: { e: { f: typeof OtherClass; }; }; }' no es asignable al tipo '{ d: { e: { f: typeof ExampleClass; }; }; }'.
//               Los tipos de la propiedad 'd' son incompatibles.
//                 Type '{ e: { f: typeof OtherClass; }; }' no es asignable al tipo '{ e: { f: typeof ExampleClass; }; }'.
//                   Los tipos de la propiedad 'e' son incompatibles.
//                     Type '{ f: typeof OtherClass; }' no es asignable al tipo '{ f: typeof ExampleClass; }'.
//                       Los tipos de la propiedad 'f' son incompatibles.
//                         El tipo 'typeof OtherClass' no se puede asignar al tipo 'typeof ExampleClass'.
//                           El tipo 'OtherClass' no se puede asignar al tipo 'ExampleClass'.
//                             Los tipos de la propiedad 'state' son incompatibles.
//                               El tipo 'number' no se puede asignar al tipo 'string'
