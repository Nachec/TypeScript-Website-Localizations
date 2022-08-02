//// { "compiler": { "ts": "4.1.0-dev.20201028" } }

// Las plantillas literales se pueden usar para extraer y manipular tipos de cadena literal.
// Estos tipos de cadena literal, a su vez, se pueden usar como propiedades y pueden describir
// posibles transformaciones de una cadena a un objeto en una API.

// ## Separación de cadenas en un objeto

// Las plantilla literales pueden usar patrones como "puntos de división" para inferir
// subcadenas intermedias. Por ejemplo...

// Este tipo es una cadena literal que se ajusta a una cadena similar a SemVer.
type TSVersion = "4.1.2"

// Podemos crear un tipo para extraer los componentes de esa cadena.
// Nos dividiremos en dos caracteres '.' de punto.
type ExtractSemver<SemverString extends string> =
    SemverString extends `${infer Major}.${infer Minor}.${infer Patch}` ?
    { major: Major, minor: Minor, patch: Patch } : { error: "Cannot parse semver string" }

// La línea 1 debería resultarte familiar si has observado los ejemplos anteriores:
// example:intro-to-template-literals / example:mapped-types-with-template-literals

// La línea 2 es un tipo condicional, TypeScript valida que el patrón inferido coincide
// contra el parámetro SemverString.

// La línea 3 es el resultado del condicional, si es true, proporciona un objeto
// con las subcadenas pasadas a diferentes posiciones en un objeto. Si la cadena
// no coincide, devuelve el tipo con una forma de error.

type TS = ExtractSemver<TSVersion>

// Esto no manejará SemVer 100%, porque es un ejemplo:
type BadSemverButOKString = ExtractSemver<"4.0.Four.4444">

// Sin embargo, ExtractSemver fallará en cadenas que no se ajusten al formato. Este caso
// solo coincidirá cuando una cadena tenga el formato "X.Y.Z", que la siguiente línea no:
type SemverError = ExtractSemver<"Four point Zero point Five">

// ## División recursiva de cadenas

// El ejemplo anterior solo funcionará cuando tengas una cadena exacta para que coincida,
// para casos más matizados, deseas trabajar con la función TypeScript 4.0: example:variadic-tuples.

// Para dividir una cadena en componentes reutilizables, las tuplas son una buena forma de mantener
// el seguimiento de los resultados. Aquí hay un tipo split:

type Split<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

// La línea 1 declara dos parámetros, usaremos caracteres únicos para abreviar.
// S representa la cadena a dividir y D es el deliminador. Este
// línea garantiza que ambas sean cadenas.

// La línea 2 comprueba si la cadena es un literal, comprobando si una cadena general
// se puede ampliar desde la cadena de entrada. Si es así, devuelve un arreglo de cadenas. Nosotros
// no podemos trabajar con una cadena no literal.

// P. ej. este caso:
type S1 = Split<string, ".">

// La línea 3 comprueba si la cadena está vacía, si es así, devuelve una tupla vacía
type S2 = Split<"", ".">

// La línea 4 tiene un control similar a nuestro ExtractSemver. Si la cadena coincide
// `[Prefijo as T][Deliminador] [Suffix como U]` luego extrae el prefijo (T) en el
// primer parámetro de una tupla, luego vuelve a ejecutar Split en el sufijo (U) para asegurarse
// que se puede encontrar más de una coincidencia.
//
// Si la cadena no incluye el deliminador, devuelve una tupla de longitud 
// 1 que contiene la cadena pasada como argumento (S).

// Caso simple
type S3 = Split<"1.2", ".">

// Se repetirá una vez para dividir todos los .'s
type S4 = Split<"1.2.3", ".">

// Con este conocimiento, deberías poder leer y comprender bastante
// algunos de los ejemplos de la comunidad sobre plantillas literales, por ejemplo:
//
// - Un extractor de rutas exprés de Dan Vanderkam
// https://twitter.com/danvdk/status/1301707026507198464
//
// - Una definición de document.querySelector por Mike Ryan
// https://twitter.com/mikeryandev/status/1308472279010025477
//
// La gente también ha experimentado con analizadores de cadenas bastante complicados. 
// usando plantillas de cadenas literales, que son divertidas ⏤ pero no recomendadas para
// código base de producción.
//
// https://github.com/ghoullier/awesome-template-literal-types
// 
// O lee la publicación de la publicación en el blog:
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types
