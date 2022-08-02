// Hay momentos en los que te encuentras duplicando tipos.
// Un ejemplo común son los recursos anidados en una generación automática.
// Respuesta de API.

interface ArtworkSearchResponse {
  artists: {
    name: string;
    artworks: {
      name: string;
      deathdate: string | null;
      bio: string;
    }[];
  }[];
}

// Si esta interfaz fuera hecha a mano, es bastante fácil
// imagina sacar las obras de arte en una interfaz como:

interface Artwork {
  name: string;
  deathdate: string | null;
  bio: string;
}

// Sin embargo, en este caso no controlamos la API, y si
// Creamos a mano la interfaz, entonces es posible que
// artworks sea parte de ArtworkSearchResponse y
// Artwork se pueden desincronizar cuando cambia la respuesta.

// La solución para esto son los tipos indexados, que replican cómo
// JavaScript permite acceder a las propiedades a través de cadenas.

type InferredArtwork = ArtworkSearchResponse["artists"][0]["artworks"][0];

// El InferredArtwork se genera mirando a través de las
// propiedades del tipo y dando un nuevo nombre al subconjunto
// que has indexado.
