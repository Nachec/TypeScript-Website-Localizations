// Type Guarding es el término en el que influyes en el análisis del
// flujo de código mediante código. TypeScript utiliza el
// comportamiento de JavaScript existente que valida tus objetos en el
// entorno de ejecución para influir el flujo de código. Este ejemplo
// asume que has leído example:code-flow

// Para ejecutar estos ejemplos, crearemos algunas clases,
// aquí hay un sistema para manejar pedidos por Internet o por teléfono.

interface Order {
  address: string;
}
interface TelephoneOrder extends Order {
  callerNumber: string;
}
interface InternetOrder extends Order {
  email: string;
}

// Luego, un tipo que podría ser uno de los dos subtipos de Order o undefined
type PossibleOrders = TelephoneOrder | InternetOrder | undefined;

// Y una función que devuelve un PossibleOrder
declare function getOrder(): PossibleOrders;
const possibleOrder = getOrder();

// Podemos utilizar el operador "in" para comprobar si una determinada
// clave está en el objeto para reducir la unión. ("in" is a JavaScript
// operador para probar claves de objeto.)

if ("email" in possibleOrder) {
  const mustBeInternetOrder = possibleOrder;
}

// Puedes utilizar el operador "instanceof" de JavaScript si
// tienes una clase que se ajuste a la interfaz:

class TelephoneOrderClass {
  address: string;
  callerNumber: string;
}

if (possibleOrder instanceof TelephoneOrderClass) {
  const mustBeTelephoneOrder = possibleOrder;
}

// Puedes utilizar el operador "typeof" de JavaScript para
// reducir tu unión. Esto solo funciona con primitivos
// inside JavaScript (like strings, objects, numbers).

if (typeof possibleOrder === "undefined") {
  const definitelyNotAnOder = possibleOrder;
}

// Puedes ver una lista completa de posibles tipos de valores
// aquí: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/typeof

// El uso de operadores de JavaScript solo puede llegar hasta cierto punto. Cuando
// deseas verificar tus propios tipos de objetos que puedes usar
// la función de predicado type.

// Una función de predicado type es una función donde el tipo
// devuelto ofrece información al análisis de flujo de código cuando
// la función devuelve true.

// Al utilizar la posible orden, podemos utilizar dos tipos de protectores.
// para declarar de qué tipo es possibleOrder:

function isAnInternetOrder(order: PossibleOrders): order is InternetOrder {
  return order && "email" in order;
}

function isATelephoneOrder(order: PossibleOrders): order is TelephoneOrder {
  return order && "callerNumber" in order;
}

// Ahora podemos usar estas funciones en declaraciones if para reducir
// el tipo en que possibleOrder esté dentro del if:

if (isAnInternetOrder(possibleOrder)) {
  console.log("Order received via email:", possibleOrder.email);
}

if (isATelephoneOrder(possibleOrder)) {
  console.log("Order received via phone:", possibleOrder.callerNumber);
}

// Puedes leer más sobre el análisis de flujo de código aquí:
//
//  - example:code-flow
//  - example:type-guards
//  - example:discriminate-types
