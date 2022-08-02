//// { "order": 3 }

// Deno es un JavaScript y TypeScript en proceso
// del entorno de ejecución basado en v8 con un enfoque en la seguridad.

// https://deno.land

// Deno tiene un sistema de permisos basado en sandbox que reduce el
// acceso a JavaScript que tiene al sistema de archivos o a la red y utiliza
// importaciones basadas en http que se descargan y almacenan en caché localmente.

// A continuación, se muestra un ejemplo del uso de deno para la creación de scripts:

import compose from "https://deno.land/x/denofun/lib/compose.ts";

function greet(name: string) {
  return `Hello, ${name}!`;
}

function makeLoud(x: string) {
  return x.toUpperCase();
}

const greetLoudly = compose(makeLoud, greet);

// Ecos "HELLO, WORLD!."
greetLoudly("world");

import concat from "https://deno.land/x/denofun/lib/concat.ts";

// Devuelve "helloworld"
concat("hello", "world");
