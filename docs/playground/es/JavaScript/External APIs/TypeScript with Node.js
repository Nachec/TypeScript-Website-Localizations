//// { "order": 3, "isJavaScript": true }

// Node.js es un entorno de ejecución de JavaScript muy popular construido en v8,
// el motor JavaScript que impulsa a Chrome. Lo puedes usar
// para construir servidores, clientes front-end y cualquier cosa intermedia.

// https://nodejs.org/

// Node.js viene con un conjunto de bibliotecas centrales que amplían el
// entorno de ejecución de JavaScript. Van desde el manejo de rutas:

import { join } from "path";
const myPath = join("~", "downloads", "todo_list.json");

// Para la manipulación de archivos:

import { readFileSync } from "fs";
const todoListText = readFileSync(myPath, "utf8");

// Puedes agregar tipos de forma incremental a tus proyectos JavaScript
// utilizando el tipado estilo JSDoc. Haremos uno para nuestro elemento de la lista TODO
// basado en la estructura JSON:

/**
 * @typedef {Object} TODO un elemento TODO
 * @property {string} title El nombre para mostrar del elemento TODO
 * @property {string} body La descripción del elemento TODO
 * @property {boolean} done Si el elemento TODO está completo
 */

// Ahora asigna eso al valor de retorno de JSON.parse
// para obtener más información sobre esto, consulta: example:jsdoc-support

/** @type {TODO []} una lista de TODOs */
const todoList = JSON.parse(todoListText);

// Y manejo de procesos:
import { spawnSync } from "child_process";
todoList
  .filter(todo => !todo.done)
  .forEach(todo => {
    // Utiliza el cliente de ghi para crear un problema para cada tarea
    // elemento de la lista que aún no se ha completado.

    // Ten en cuenta que obtienes el autocompletado correcto y
    // docs en JS cuando resaltas 'todo.title' a continuación.
    spawnSync(`ghi open --message "${todo.title}\n${todo.body}"`);
  });

// TypeScript tiene definiciones de tipo actualizadas para todos los
// módulos integrados a través de DefinitelyTyped - lo cual significa que
// puedes escribir programas node con una fuerte cobertura de tipos.
