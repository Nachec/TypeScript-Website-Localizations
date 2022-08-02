//// { "order": 3, "compiler": { "strictNullChecks": false } }

// JavaScript tiene dos formas de declarar valores que no
// existen, y TypeScript agrega una sintaxis adicional que permite incluso
// más formas de declarar algo como opcional o anulable.

// Primero, la diferencia entre los dos primitivos
// JavaScript: undefined y null

// Undefined es cuando algo no se puede encontrar o configurar

const emptyObj = {};
const anUndefinedProperty: undefined = emptyObj["anything"];

// Null está destinado a usarse cuando hay una falta consciente
// de un valor.

const searchResults = {
  video: { name: "LEGO Movie" },
  text: null,
  audio: { name: "LEGO Movie Soundtrack" },
};

// ¿Por qué no usar undefined? Principalmente, porque ahora puedes verificar
// que ese texto se incluyó correctamente. Si el texto se devolvió como
// undefined, el resultado es el mismo que si no
// estuviera ahí.

// Esto puede parecer un poco superficial, pero cuando se convierte en
// una cadena JSON, si el texto fuera undefined, no sería
// incluido en la cadena equivalente.

// Tipos null estrictos

// Antes de TypeScript 2.0 undefined y null eran efectivamente
// ignorados en el sistema de tipos. Esto permitió que TypeScript proporcionara una
// entorno de codificación más cercano a JavaScript no tipado.

// La versión 2.0 agregó un indicador al compilador llamado "strictNullChecks"
// y este indicador requería que las personas trataran a undefined y a null
// como tipos que se deben manejar mediante análisis de flujo de código
// (ve más en el example:code-flow)

// Para ver un ejemplo de la diferencia al activar la comprobación
// strict null en TypeScript, coloca el cursor sobre "Potential String" a continuación:

type PotentialString = string | undefined | null;

// PotentialString descarta los undefined y null. Si
// subes a la configuración y activas el modo strict y regresas
// verás que al pasar el cursor sobre PotentialString ahora se muestra
// la unión completa.

declare function getID(): PotentialString;

const userID = getID();
console.log("User Logged in: ", userID.toUpperCase());

// Solo en modo strict lo anterior fallará ^

// Hay formas de decirle a TypeScript que sabes más, como
// una aserción de tipo o mediante un operador de aserción no nula (!)

const definitelyString1 = getID() as string;
const definitelyString2 = getID()!;

// O puedes verificar de manera segura la existencia a través de un if:

if (userID) {
  console.log(userID);
}

// Propiedades opcionales

// `void`

// Void es el tipo de retorno de una función que no
// devuelve un valor.

const voidFunction = () => { };
const resultOfVoidFunction = voidFunction();

// Esto suele ser un accidente y TypeScript mantiene el tipo
// void alrededor para permitirte obtener errores del compilador ⏤ aunque en
// el entorno de ejecución sería undefined.
