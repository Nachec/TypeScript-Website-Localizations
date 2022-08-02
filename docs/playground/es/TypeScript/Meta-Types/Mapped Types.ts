// Los tipos mapeados son una forma de crear nuevos tipos basados
// en otro tipo. Efectivamente un tipo transformacional.

// Los casos comunes para el uso de un tipo mapeado son los
// subconjuntos parciales de un tipo existente. Por ejemplo
// una API puede devolver un Artist:

interface Artist {
  id: number;
  name: string;
  bio: string;
}

// Sin embargo, si tuviera que enviar una actualización a la API que
// solo cambia un subconjunto del Artist, entonces típicamente
// deberías tendrías que crear un tipo adicional:

interface ArtistForEdit {
  id: number;
  nombre?: string;
  bio?: string;
}

// Es muy probable que esto no esté sincronizado con
// el Artista de arriba. Los tipos mapeados te permiten crear un cambio
// en un tipo existente.

type MyPartialType<Type> = {
  // Para cada propiedad existente dentro del tipo de Type
  // lo convierte en una versión  ?:
  [Property in keyof Type]?: Type[Property];
};

// Ahora podemos usar el tipo mapeado en su lugar para crear
// nuestra interfaz de edición:
type MappedArtistForEdit = MyPartialType<Artist>;

// Esto es casi perfecto, pero hace que el id sea null
// lo que nunca debería suceder. Entonces, hagamos una rápida
// mejora mediante el uso de una intersección de tipo (ve:
// example:union-and-intersection-types )

type MyPartialTypeForEdit<Type> = {
  [Property in keyof Type]?: Type[Property];
} & { id: number };

// Esto toma el resultado parcial del tipo mapeado y
// lo fusiona con un objeto que tiene id: number establecido.
// Forzando efectivamente a el id a estar en el tipo.

type CorrectMappedArtistForEdit = MyPartialTypeForEdit<Artist>;

// Este es un ejemplo bastante simple de cómo trabajando los tipos
// mapeados, pero cubre la mayoría de los conceptos básicos. Si quisieras
// profundizar más, consulta el manual:
//
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
