// Los tipos unión son una forma de declarar que un objeto
// podría tener más de un tipo.

type StringOrNumber = string | number;
type ProcessStates = "open" | "closed";
type OddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
type AMessyUnion = "hello" | 156 | { error: true };

// Si el uso de "open" y "closed" frente a string es
// nuevo para ti, échale un vistazo a: example:literals

// Podemos mezclar diferentes tipos en una unión y
// lo que estamos diciendo es que el valor es uno de esos tipos.

// TypeScript te dejará entonces para que averigües cómo
// determinar qué valor podría tener en el entorno de ejecución.

// Las uniones a veces se pueden ver socavadas por la ampliación de tipos,
// por ejemplo:

type WindowStates = "open" | "closed" | "minimized" | string;

// Si pasas el cursor por encima, puedes ver que WindowStates
// se convierte en una string ⏤ no la unión. Esto está cubierto en
// example:type-widening-and-narrowing

// Si una unión es un OR, entonces una intersección es un AND.
// Los tipos intersección son cuando dos tipos se cruzan para crear
// un nuevo tipo. Esto permite la composición de tipos.

interface ErrorHandling {
  success: boolean;
  error?: { mensaje: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

interface ArtistsData {
  artists: { name: string }[];
}

// Estas interfaces se pueden componer en respuestas que ambas
// manejan consistentemente los errores como sus propios datos.

type ArtworksResponse = ArtworksData & ErrorHandling;
type ArtistsResponse = ArtistsData & ErrorHandling;

// Por ejemplo:

const handleArtistsResponse = (response: ArtistsResponse) => {
  if (response.error) {
    console.error(response.error.message);
    return;
  }

  console.log(response.artists);
};

// Una mezcla de tipos de intersección y unión se vuelve realmente
// útil cuando tienes casos en los que un objeto tiene que
// incluir uno de dos valores:

interface CreateArtistBioBase {
  artistID: string;
  thirdParty?: boolean;
}

type CreateArtistBioRequest = CreateArtistBioBase & ({ html: string } | { markdown: string });

// Ahora solo puedes crear una solicitud cuando incluyes
// artistID y html o markdown

const workingRequest: CreateArtistBioRequest = {
  artistID: "banksy",
  markdown: "Banksy is an anonymous England-based graffiti artist...",
};

const badRequest: CreateArtistBioRequest = {
  artistID: "banksy",
};
