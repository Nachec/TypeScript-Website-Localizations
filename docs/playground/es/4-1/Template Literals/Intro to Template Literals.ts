//// { "compiler": { "ts": "4.1.0-dev.20201028" } }

// TypeScript ya admite el tratamiento de una cadena/número exacto 
// como literal, por ejemplo, esta función solo permite dos
// cadenas exactas y no otras:

declare function enableFeature(command: "redesign" | "newArtistPage"): void;
enableFeature("redesign");
enableFeature(`newArtistPage`);
enableFeature("newPaymentSystem");

// Las cadenas literales admiten todas las formas en que puedes escribir 
// una cadena en ES2020, con TypeScript 4.1 hemos ampliado 
// el soporte para la interpolación dentro de una plantilla de cadena literal.

type Features = "Redesign" | "newArtistPage";

// Esto toma la unión de características anterior y transforma
// cada parte de la unión para agregar `-branch` después de la cadena
type FeatureBranch = `${Features}-branch`;

// 4.1 admite un conjunto de nuevas palabras clave de tipo genérico que
// puedes usar dentro de una plantilla literal para manipular cadenas.
// Estos son: Uppercase, Lowercase, Capitalize y Uncapitalize

type FeatureID = `${Lowercase<Features>}-id`;
type FeatureEnvVar = `${Uppercase<Features>}-ID`;

// Las cadenas en las uniones se multiplican de forma cruzada, por lo que si se usa
// más de un tipo unión, entonces se evalúa a cada miembro de la unión
// contra cada miembro de la otra unión.

type EnabledStates = "enabled" | "disabled";
type FeatureUIStrings = `${Features} is ${EnabledStates}`;

// Esto garantiza que todas las combinaciones posibles de cada
// unión se contabiliza.

// Este tipo se puede utilizar con una firma indexada.
// para hacer rápidamente una lista de claves:

type SetFeatures = {
  [K in FeatureID]: boolean
};

// Continúa aprendiendo más sobre las plantillas literales en
// example:mapped-types-with-template-literals

// O lee la publicación de la publicación en el blog:
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types
