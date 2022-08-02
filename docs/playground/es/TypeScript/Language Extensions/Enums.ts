// Las enumeraciones son una característica agregada a JavaScript en TypeScript
// lo que facilita el manejo de conjuntos de constantes con nombre.

// De forma predeterminada, una enumeración se basa en números, comenzando en cero,
// y a cada opción se le asigna un incremento de uno. Esto es
// útil cuando el valor no es importante.

enum CompassDirection {
  North,
  East,
  South,
  West,
}

// Al anotar una opción de enumeración, estableces el valor;
// los incrementos continúan a partir de ese valor:

enum StatusCodes {
  OK = 200,
  BadRequest = 400,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
}

// Haces referencia a una enumeración mediante EnumName.Value

const startingDirection = CompassDirection.East;
const currentStatus = StatusCodes.OK;

// Las enumeraciones admiten el acceso a datos en ambas direcciones desde la clave
// al valor y desde el valor a la clave.

const okNumber = StatusCodes.OK;
const okNumberIndex = StatusCodes["OK"];
const stringBadRequest = StatusCodes[400];

// Las enumeraciones pueden ser de diferentes tipos, un tipo string es común.
// El uso de una cadena puede facilitar la depuración, porque el
// valor en tiempo de ejecución no requiere que busques el número.

enum GamePadInput {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// Si deseas reducir la cantidad de objetos en tu
// entorno de ejecución JavaScript, puedes crear una enumeración constante.

// El valor de una enumeración constante se reemplaza por TypeScript durante
// la transpilación de tu código, en lugar de buscarlo
// a través de un objeto en el entorno de ejecución.

const enum MouseAction {
  MouseDown,
  MouseUpOutside,
  MouseUpInside,
}

const handleMouseAction = (action: MouseAction) => {
  switch (action) {
    case MouseAction.MouseDown:
      console.log("Mouse Down");
      break;
  }
};

// Si observas el JavaScript transpilado, puedes ver
// cómo existen las otras enumeraciones como objetos y funciones,
// sin embargo, MouseAction no está allí.

// Esto también es cierto para la comprobación contra MouseAction.MouseDown
// dentro de la instrucción switch dentro de handleMouseAction.

// Las enumeraciones pueden hacer más que esto, puedes leer más en el
// Manual de TypeScript:
//
// https://www.typescriptlang.org/docs/handbook/enums.html
