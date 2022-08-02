// Los operadores lógicos y la asignación son características nuevas en
// JavaScript 2020. Es un conjunto de nuevos operadores
// que editan un objeto JavaScript.

// Su objetivo es reutilizar el concepto de operadores 
// matemáticos (p. ej., += -= *=) pero con lógica en su lugar.

interface User {
  id?: number
  name: string
  location: {
      postalCode?: string
  }
}

function updateUser(user: User) {
  // Este código se puede reemplazar con 
  if (!user.id) user.id = 1

  // O este código:
  user.id = user.id || 1

  // Con este código:
  user.id ||= 1
}

// Los conjuntos de operadores pueden manejar anidaciones profundas, que 
// también puede ahorrar en una gran cantidad de código repetitivo.

declare const user: User
user.location.postalCode ||= "90210"

// Hay tres nuevos operadores: 
//
//   ||= mostrado arriba
//   &&= que usa 'and' lógico en lugar de 'or'
//   ??= que se basa en example:nullish-coalescing para ofrecer una
//       versión de || que usa === en su lugar

// Para obtener más información sobre la propuesta, consulta:
// https://github.com/tc39/proposal-logical-assignment
