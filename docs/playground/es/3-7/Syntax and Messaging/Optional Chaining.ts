//// { "compiler": {  }, "order": 1 }

// El encadenamiento opcional alcanzó el consenso de TC39 Etapa 3 durante
// el desarrollo de 3.7. El encadenamiento opcional te permite escribir
// código que puede detener inmediatamente la ejecución de expresiones
// cuando llega a un valor null o undefined.

// Acceso a la propiedad

// Imaginemos que tenemos un álbum donde el artista y es posible
// que la biografía de los artistas no esté presente en los datos. Por ejemplo
// una compilación no puede tener un solo artista.

type AlbumAPIResponse = {
  title: string;
  artist?: {
    name: string;
    bio?: string;
    previousAlbums?: string[];
  };
};

declare const album: AlbumAPIResponse;

// Con el encadenamiento opcional, puedes escribir
// código como este:

const artistBio = album?.artist?.bio;

// En lugar de:

const maybeArtistBio = album.artist && album.artist.bio;

// En este caso ?. actúa de manera diferente que &&s ya que &&
// actuará de forma diferente en los valores "falsos" (p. ej., una cadena vacía,
// 0, NaN, y, bueno, false).

// El encadenamiento opcional solo tomará null o undefined como
// una señal para detener y devolver undefined.

// Acceso al elemento opcional

// El acceso a la propiedad es a través del. operador, el encadenamiento opcional
// también trabaja con los operadores [] al acceder a elementos.

const maybeArtistBioElement = album?.["artist"]?.["bio"];

const maybeFirstPreviousAlbum = album?.artist?.previousAlbums?.[0];

// Llamadas opcionales

// Cuando se trata de funciones que pueden o no existir en
// el entorno de ejecución, el encadenamiento opcional solo admite la llamada
// a una función si existiera. Esto puede reemplazar el código donde tradicionalmente
// escribirías algo como: if (func) func()

// Por ejemplo, aquí hay una llamada opcional a la devolución de llamada desde
// una solicitud a la API:

const callUpdateMetadata = (metadata: any) => Promise.resolve(metadata); // Llamada falsa a la API

const updateAlbumMetadata = async (metadata: any, callback?: () => void) => {
  await callUpdateMetadata(metadata);

  callback?.();
};

// Puedes leer más sobre el encadenamiento opcional en la publicación del blog 3.7:
//
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/
