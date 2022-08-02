// Hay dos herramientas principales para declarar la forma de un
// objeto: interfaces y alias de tipo.
//
// Son muy similares, y para los casos más comunes
// actúan igual.

type BirdType = {
  wings: 2;
};

interface BirdInterface {
  wings: 2;
}

const bird1: BirdType = { wings: 2 };
const bird2: BirdInterface = { wings: 2 };

// Dado que TypeScript es un sistema de tipos estructurales,
// también es posible mezclar su uso.

const bird3: BirdInterface = bird1;

// Ambos admiten la ampliación de otras interfaces y tipos.
// Los alias de tipo hacen esto a través de tipos de intersección, mientras que
// las interfaces tienen una palabra clave.

type Owl = { nocturnal: true } & BirdType;
type Robin = { nocturnal: false } & BirdInterface;

interface Peacock extends BirdType {
  colourful: true;
  flies: false;
}
interface Chicken extends BirdInterface {
  colourful: false;
  flies: false;
}

let owl: Owl = { wings: 2, nocturnal: true };
let chicken: Chicken = { wings: 2, colourful: false, flies: false };

// Dicho esto, te recomendamos que utilices interfaces en lugar de alias de
// tipo. Específicamente, porque obtendrás mejores mensajes
// de error. Si pasas el cursor sobre los siguientes errores, puedes
// ver cómo TypeScript puede proporcionar más concisos y más enfocados
// mensajes cuando se trabaja con interfaces como Chicken.

owl = chicken;
chicken = owl;

// Una diferencia importante entre los alias de tipo y las interfaces
// es que las interfaces están abiertas y los alias de tipo están cerrados.
// Esto significa que puedes extender una interfaz declarándola
// por segunda vez.

interface Kitten {
  purrs: boolean;
}

interface Kitten {
  colour: string;
}

// En el otro caso, no se puede cambiar un tipo fuera de
// su declaración.

type Puppy = {
  color: string;
};

type Puppy = {
  toys: number;
};

// Dependiendo de tus objetivos, esta diferencia podría ser
// positiva o negativa. Sin embargo, para exponer tipos
// públicamente, es mejor convertirlos en una interfaz.

// Uno de los mejores recursos para ver todas los casos
// ventajosos alrededor de tipos vs interfaces, este hilo de stack overflow
// es un buen lugar para comenzar:

// https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types/52682220#52682220
