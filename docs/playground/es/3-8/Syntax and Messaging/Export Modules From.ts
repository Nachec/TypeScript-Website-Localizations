//// { "compiler": { "ts": "3.8.3" } }
// La capacidad de TypeScript para reexportar se acercó más a admitir
// los casos adicionales disponibles en ES2018
//
// Las exportaciones de JavaScript tienen la capacidad de
// reexportar una parte de una dependencia:

export { ScriptTransformer } from "@jest/transform";

// Cuando querías exportar el objeto completo, eso
// se volvió un poco más detallado en versiones anteriores
// de TypeScript:

import * as console from "@jest/console";
import * as reporters from "@jest/reporters";

export { console, reporters };

// Con 3.8, TypeScript admite más declaraciones
// de la forma export en las especificaciones de JavaScript, permitiéndote
// escribir una sola línea para reexportar un módulo

export * as jestConsole from "@jest/console";
export * as jestReporters from "@jest/reporters";
