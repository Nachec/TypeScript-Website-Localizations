//// { "compiler": { "ts": "4.1.0-dev.20201028" } }

// TypeScript 4.1 agregó soporte para plantillas literales, puedes
// comprender algunos de los conceptos básicos en el example:intro-to-template-literals

// 4.1 introduce una nueva sintaxis dentro de una declaración de tipos mapeados,
// ahora puedes usar "as`template string`" que se puede usar para transformar
// cadenas dentro de una unión.

// Por ejemplo, este tipo transformará todas las propiedades de un
// tipo en cuatro funciones que corresponden a las llamadas REST tradicionales.

// Las plantillas de cadenas literales para describir cada punto final de la API:
type GET<T extends string> = `get${Capitalize<T>}`
type POST<T extends string> = `post${Capitalize<T>}`
type PUT<T extends string> = `put${Capitalize<T>}`
type DELETE<T extends string> = `delete${Capitalize<T>}`

// Una unión de los tipos literales anteriores
type REST<T extends string> = GET<T> | POST<T> | PUT<T> | DELETE<T>

// Toma un tipo, luego por cada propiedad de la cadena en el tipo, mapea
// esa clave al REST de arriba, que crearía las cuatro funciones.

type RESTify<Type> = {
  [Key in keyof Type as REST<Key extends string ? Key : never>]: () => Type[Key]
};

// ¿`Key extiende la cadena? Key : nunca` es necesario porque un objeto
// puede contener cadenas, números y símbolos como claves. Solo podemos manejar
// los casos de string aquí.

// Ahora tenemos una lista de objetos disponibles a través de la API:

interface APIs {
  artwork: { id: string, title: string };
  artist: { id: string, name: string };
  location: { id: string, address: string, country: string }
}

// Luego, cuando tengamos un objeto que use estos tipos
declare const api: RESTify<APIs>

// Entonces todas estas funciones se crean automáticamente 
api.getArtist()
api.postArtist()
api.putLocation()

// Continúa aprendiendo más sobre las plantillas literales en:
// example:string-manipulation-with-template-literals

// O lee la publicación de la publicación en el blog:
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types

