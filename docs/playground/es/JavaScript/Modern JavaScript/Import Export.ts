//// { "order": 1, "target": "ES5" }

// JavaScript agregó import/export al lenguaje en 2016
// y TypeScript tiene soporte completo para este estilo de
// vinculación entre archivos y módulos externos. *TypeScript*:
// expande esta sintaxis al permitir también que se pasen tipos
// con código.

// Veamos la importación de código desde un módulo.

import { danger, message, warn, DangerDSLType } from "danger";

// Esto toma un conjunto de importaciones con nombre de un módulo node
// llamado danger. Si bien hay más de cuatro importaciones,
// estas son las únicas que hemos elegido importar.

// Específicamente nombrar las importaciones que estás importando
// da a las herramientas la capacidad de eliminar el código no utilizado en tus
// aplicaciones y te ayuda a comprender qué se utiliza en
// un archivo particular.

// En este caso: danger, message y warn son import
// JavaScript ⏤ donde DangerDSLType es un tipo de interfaz.

// TypeScript permite a los ingenieros documentar su código usando
// JSDoc y los documentos también se importan. Por ejemplo si
// te desplazas sobre las diferentes partes abajo, verás
// explicaciones de lo que son.

danger.git.modified_files;

// Si quieres saber cómo aportar estas anotaciones de
// documentación lee example:jsdoc-support

// Otra forma de importar código es utilizando la exportación predeterminada
// de un módulo. Un ejemplo de esto es el módulo debug, que
// expone una función que crea una función de registro.

import debug from "debug";
const log = debug("playground");
log("Started running code");

// Debido a la naturaleza de las exportaciones predeterminadas, no tienen un
// nombre, pueden ser complicadas cuando se aplican herramientas de
// análisis estático como el soporte de refactorización en TypeScript, pero
// tienen sus usos.

// Debido a que hay una larga historia en la importación/exportación de código.
// en JavaScript, hay una parte confusa de las exportaciones predeterminadas:
// Algunas exportaciones tienen documentación que implica que puedes escribir
// una importación como esta:

import req from "request";

// Sin embargo, eso falla, y luego encuentras un desbordamiento de la pila
// que recomienda la importación como:

import * as req from "request";

// Y esto funciona. ¿Por qué? Volveremos a eso al final de
// nuestra sección sobre exportación.

// Para importar, debes poder exportar. La forma
// moderna de escribir exportaciones es utilizando la palabra clave export.

/** Las pegatinas actuales que quedan en el rol */
export const numberOfStickers = 11;

// Esto se podría importar a otro archivo mediante:
//
// import { numberOfStickers } from "./path/to/file"

// Puedes tener tantos como desees en un archivo. Luego
// una exportación predeterminada es casi lo mismo.

/** Genera una pegatina para ti */
const stickerGenerator = () => { };
export default stickerGenerator;

// Esto se podría importar a otro archivo mediante:
//
// import getStickers from "./path/to/file"
//
// El nombre depende del consumidor del módulo.

// Estos no son los únicos tipos de importaciones, solo los más comunes
// en código moderno. Cubriendo todas las formas en que el código se pueden cruzar
// los límites del módulo es un tema muy extenso en el manual:
//
// https://www.typescriptlang.org/docs/handbook/modules.html

// Sin embargo, para intentar cubrir esa última pregunta. Si miras
// el código JavaScript para este ejemplo ⏤ verás esto:

// var stickerGenerator = function () { };
// exports.default = stickerGenerator;

// Esto establece la propiedad predeterminada en el objeto de exportación
// para ser stickerGenerator. Hay un código por ahí que
// establece que las exportaciones sean una función, en lugar de un objeto.
//
// TypeScript optó por ceñirse a la especificación ECMAScript
// sobre cómo manejar esos casos, que es lanzar un
// error. Sin embargo, hay una configuración del compilador que
// manejar automáticamente esos casos por ti, que es
// esModuleInterop.
//
// Si activas eso para este ejemplo, verás que
// el error desaparece.
