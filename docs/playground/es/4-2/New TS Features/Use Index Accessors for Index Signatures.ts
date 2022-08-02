//// { "compiler": { "ts": "4.2.0-beta", "noPropertyAccessFromIndexSignature": true } }
// JavaScript tiene dos formas de acceder a un objeto en una propiedad, la primera es a través de
// el operador punto x.y, el otro es mediante corchetes x["y"] ⏤ la segunda
// sintaxis x["y"] se denomina accesores de índice.

// Esta sintaxis se refleja en el sistema de tipos, donde puedes agregar una firma de
// índice a un tipo, lo cual significa que cualquier propiedad desconocida tendrá un tipo particular.

// Este tipo usa un índice de firma para indicar que puedes preguntar
// por cualquier cadena y obtendrás una cadena de undefined back.

type ENV = {
  [envVar: string]: string | undefined;
};

// En 4.2, hay un indicador del compilador para garantizar la coherencia con la forma en que
// la sintaxis para acceder a la variable es coherente con la forma en que la variable
// fue declarada.

// Por ejemplo, podemos tener un objeto de clasificación de juegos, donde los juegos son
// dados un rango de 1 a 5. Hay juegos conocidos de antemano,
// pero podrías recuperar muchos objetos diferentes

type Rating = 1 | 2 | 3 | 4 | 5;

interface GameRatingLibrary {
  hades: Rating;
  ringFitAdventures: Rating;
  discoElysium: Rating;

  // Las propiedades desconocidas están cubiertas por este índice de firma.
  [nombrePropiedad: string]: Rating;
}

declare const getYearRatings: (year: string) => GameRatingLibrary;
const ratings = getYearRatings("2020");

// Estos se conocen anteriormente y, por lo tanto, puedes usar de manera segura
// la sintaxis de punto.
const hadesScore = ratings.hades;
const ringFitScore = ratings.ringFitAdventures;

// Este juego no se declara arriba, y la firma del índice
// se usa en su lugar, esto significa que no puedes usar el operador
// punto y debes acceder a través de calificaciones ["oriAndTheBlindForest"]
const nodeEnv = ratings.oriAndTheBlindForest;
