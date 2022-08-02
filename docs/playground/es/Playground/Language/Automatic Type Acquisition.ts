// Adquisición automática de tipos es el término que describe cómo TypeScript
// toma definiciones de tipo de @types en npm detrás de la escena
// para proporcionar una mejor experiencia de usuario a los usuarios de JavaScript.

// El playground ahora tiene una versión similar (pero un poco más limitada)
// del proceso de adquisición de tipos integrado en
// TypeScript.

// La puedes usar creando importaciones en tu código. Funciona
// ya sea a través de @types de DefinitelyTyped o mediante
// archivos d.ts dentro de la propia dependencia.

import { danger } from "danger";

// Resalta estos identificadores a continuación para ver los
// JSDocs de los tipos integrados:

danger.github;

// Esto también maneja dependencias transitivas, por lo que en este caso,
// danger también depende de @octokit/rest.

danger.github.api.pulls.createComment();

// La adquisición de tipos también tomará en cuenta los módulos
// integrados de Node y extrae las declaraciones de tipo de Node
// cuando uses cualquiera de esas dependencias. Tenga en cuenta que estos
// tienden a tardar un poco más que los demás, ya que hay
// ¡muchos tipos para descargar!

import { readFileSync } from "fs";

const inputPath = "my/path/file.ts";
readFileSync(inputPath, "utf8");
