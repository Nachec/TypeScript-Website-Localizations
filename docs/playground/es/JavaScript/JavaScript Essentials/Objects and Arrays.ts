//// { "order": 1, "compiler": { "strict": false } }

// Los objetos de JavaScript son colecciones de valores envueltos
// con claves nombradas.

const userAccount = {
  name: "Kieron",
  id: 0,
};

// Los puedes combinar para hacerlos más grandes y complejos.
// data-models.

const pie = {
  type: "Manzana",
};

const purchaseOrder = {
  owner: userAccount,
  item: pie,
};

// Si usas el mouse para desplazarte sobre algunas de estas palabras
// (pruebe el purchaseOrder de arriba) puedes ver cómo TypeScript
// interpreta tu JavaScript en tipos etiquetados.

// Se puede acceder a los valores a través del ".", Por lo que para obtener un
// username para una orden de compra:
console.log(purchaseOrder.item.type);

// Si pasas el mouse sobre cada parte del código
// entre los ()s, puedes ver que TypeScript ofrece más
// información sobre cada parte. Intenta volver a escribir esto a continuación:

// Copia esto en la siguiente línea, carácter a carácter:
//
//   purchaseOrder.item.type

// TypeScript proporciona comentarios al playground
// sobre qué objetos JavaScript están disponibles en este
// archivo y te permite evitar errores tipográficos y ver más
// información sin tener que buscarla en otro lugar.

// TypeScript también ofrece estas mismas características a los arreglos.
// Aquí hay un arreglo con solo nuestra orden de compra de arriba.

const allOrders = [purchaseOrder];

// Si pasas el mouse sobre allOrders, puedes decir que es un arreglo
// porque la información de desplazamiento termina con []. Puedes acceder al
// primer orden mediante el uso de corchetes con un índice
// (comenzando desde cero).

const firstOrder = allOrders[0];
console.log(firstOrder.item.type);

// Una forma alternativa de obtener un objeto es abriendo el
// arreglo para eliminar objetos. Hacer esto elimina el objeto
// del arreglo y devuelve el objeto. Se llama
// mutar el arreglo, porque cambia los datos
// subyacentes dentro de él.

const poppedFirstOrder = allOrders.pop();

// Ahora allOrders está vacío. La mutación de datos puede resultar útil para
// muchas cosas, pero una forma de reducir la complejidad en tu
// código base es evitar la mutación. TypeScript ofrece una forma
// para declarar un arreglo de solo lectura en su lugar:

// Crea un tipo basado en la forma de una orden de compra:
type PurchaseOrder = typeof purchaseOrder;

// Crea un arreglo de órdenes de compra de solo lectura
const readonlyOrders: readonly PurchaseOrder[] = [purchaseOrder];

// ¡Sí! Seguro que es un poco más de código. Hay cuatro
// cosas nuevas aquí:
//
//  type PurchaseOrder ⏤ Declara un nuevo tipo a TypeScript.
//
//  typeof ⏤ Utiliza el sistema de inferencia de tipos para establecer el tipo
//           basado en la constante que se pasa en next.
//
//  purchaseOrder ⏤ Obtén la variable purchaseOrder y dile a
//                  TypeScript que esta es la forma de todos
//                  objetos en el arreglo de pedidos.
//
//  readonly ⏤ Este objeto no admite la mutación, una vez
//             se crea entonces el contenido de el arreglo
//             siempre será el mismo.
//
// Ahora, si intentas salir de readonlyOrders, TypeScript
// generará un error.

readonlyOrders.pop();

// Puedes usar readonly en todo tipo de lugares, es un
// un poco de sintaxis adicional aquí y allá, pero
// proporciona mucha seguridad adicional.

// Puedes obtener más información sobre readonly:
//  - https://www.typescriptlang.org/docs/handbook/interfaces.html#readonly-properties
//  - https://basarat.gitbooks.io/typescript/content/docs/types/readonly.html

// Y puedes seguir aprendiendo sobre JavaScript y
// TypeScript en el ejemplo de funciones:
// example:functions
//
// O si quieres saber más sobre inmutabilidad:
// example:immutability
