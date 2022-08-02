//// { "compiler": { "strictFunctionTypes": false } }

// Sin experiencia en teoría de tipos, es poco probable
// familiarizarse con la idea de que un sistema de tipos es "sólido".

// La solidez es la idea de que el compilador puede ofrecer garantías
// sobre el tipo que tiene un valor en el entorno de ejecución, y no solo
// durante la compilación. Esto es normal para la mayoría de los lenguajes
// de programación que se construyen con tipos desde el primer día.

// Construir un sistema de tipos que modela un lenguaje que ha
// existido durante algunas décadas, sin embargo, se trata de hacer
// decisiones con compensaciones en tres cualidades: Sencillez,
// Usabilidad y solidez.

// Con el objetivo de TypeScript de poder admitir todo el código
// JavaScript, el lenguaje tiende a la simplicidad y la usabilidad
// cuando se le presentan formas de agregar tipos a JavaScript.

// Veamos algunos casos en los que TypeScript probadamente
// no suena, para entender cómo se verían esas compensaciones
// como de otra manera.

// Aserciones de tipo

const usersAge = ("23" as any) as number;

// TypeScript te permitirá usar aserciones de tipo para redefinir
// la inferencia de algo que está bastante mal. Utilizar
// aserciones de tipo es una forma de decirle a TypeScript que sabes
// bien lo que haces, y TypeScript intentará dejarte seguir adelante.

// Los lenguajes que son sólidos ocasionalmente usarían comprobaciones en el
// entorno de ejecución para asegurarse de que los datos coincidan con lo que dicen sus tipos ⏤ pero
// TypeScript tiene como objetivo no tener ningún impacto en el entorno de
// ejecución con reconocimiento de tipos en tu código transpilado.

// Función Parámetro Bivarianza

// Los parámetros para una función admiten la redefinición del parámetro
// para ser un subtipo de la declaración original.

interface InputEvent {
  timestamp: number;
}
interface MouseInputEvent extends InputEvent {
  x: number;
  y: number;
}
interface KeyboardInputEvent extends InputEvent {
  keyCode: number;
}

function listenForEvent(eventType: "keyboard" | "mouse", handler: (event: InputEvent) => void) { }

// Puedes volver a declarar el tipo de parámetro como un subtipo de
// la declaracion. Arriba, el controlador esperaba un tipo InputEvent
// pero en los siguientes ejemplos de uso ⏤ TypeScript acepta
// un tipo que tiene propiedades adicionales.

listenForEvent("keyboard", (event: KeyboardInputEvent) => { });
listenForEvent("mouse", (event: MouseInputEvent) => { });

// Esto se puede remontar hasta el tipo común más pequeño:

listenForEvent("mouse", (event: {}) => { });

// Pero no más allá:

listenForEvent("mouse", (event: string) => { });

// Esto cubre el patrón del mundo real del escucha de eventos.
// en JavaScript, a costa de ser sólido.

// TypeScript puede generar un error cuando esto sucede a través de
// `strictFunctionTypes`. O podrías solucionar este caso
// particular con sobrecarga de funciones,
// ve: example:typing-functions

// Carcasa especial vacía

// Descarte de parámetros

// Para aprender sobre casos especiales con parámetros de función
// ve el example:structural-typing

// Parámetros `rest`

// Se supone que todos los parámetros rest son opcionales, esto significa
// que TypeScript no tendrá una forma de hacer cumplir el número de
// parámetros disponibles para una devolución de llamada.

function getRandomNumbers(count: number, callback: (...args: number[]) => void) { }

getRandomNumbers(2, (first, second) => console.log([first, second]));
getRandomNumbers(400, (first) => console.log(first));

// Las funciones void pueden coincidir con una función con un valor de retorno

// Una función que devuelve una función void, puede aceptar una
// función que tome cualquier otro tipo.

const getPI = () => 3.14;

function runFunction(func: () => void) {
  func();
}

runFunction(getPI);

// Para obtener más información sobre los lugares donde la solidez del
// sistema de tipos está comprometido, consulta:

// https://github.com/Microsoft/TypeScript/wiki/FAQ#type-system-behavior
// https://github.com/Microsoft/TypeScript/issues/9825
// https://www.typescriptlang.org/docs/handbook/type-compatibility.html
