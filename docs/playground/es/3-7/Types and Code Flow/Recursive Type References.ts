//// { "compiler": {  }, "order": 2 }

// Elegir entre el uso de tipo o interfaz se trata de las
// restricciones en las características de cada uno. Con 3.7, unas de
// las restricciones se eliminaron en el tipo pero no en la interfaz.

// Puedes encontrar más información sobre esto en example:types-vs-interfaces

// Se ​​usaba para que no pudieras referirte al tipo que
// está definiendo dentro del tipo en sí. Esto fue un limite
// que no existía dentro de una interfaz y se podía evadir
// con un poco de trabajo.

// Por ejemplo, esto no es factible en 3.6:
type ValueOrArray<T> = T | Array<ValueOrArray<T>>;

// Una implementación se habría visto así, mezclando
// el tipo con una interfaz.
type ValueOrArray2<T> = T | ArrayOfValueOrArray<T>;
interface ArrayOfValueOrArray<T> extends Array<ValueOrArray2<T>> { }

// Esto permite una definición JSON completa,
// que funciona refiriéndose a sí misma.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const exampleStatusJSON: Json = {
  disponibles: true,
  username: "Jean-loup",
  room: {
    name: "Highcrest",
    // No se pueden agregar funciones en el tipo Json
    // update: () => {}
  },
};

// Hay más que aprender de las notas de la versión 3.7 beta y su SE:
//
// https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/
// https://github.com/microsoft/TypeScript/pull/33050
