//// { "order": 2 }

// Al llamar a un método de una clase, generalmente esperas
// para hacer referencia a la instancia actual de la clase.

class Safe {
  contents: string;

  constructor(contents: string) {
    this.contents = contents;
  }

  printContents() {
    console.log(this.contents);
  }
}

const safe = new Safe("Crown Jewels");
safe.printContents();

// Si vienes de un lenguaje orientado a objeciones donde la
// variable this/self es fácilmente predecible, entonces puedes
// encontrar que necesitas leer sobre lo confuso que puede ser 'this':
//
// https://yehudakatz.com/2011/08/11/understanding-javascript-function-invocation-and-this/
// https://aka.ms/AA5ugm2

// TLDR: esto puede cambiar. La referencia a la que this se refiere
// puede ser diferente dependiendo de cómo llames a la función.

// Por ejemplo, si usas una referencia a la función en otro
// objeto, y luego lo llamas a través de eso ⏤ la variable this
// se ha movido para hacer referencia al objeto de alojamiento:

const customObjectCapturingThis = { contents: "http://gph.is/VxeHsW", print: safe.printContents };
customObjectCapturingThis.print(); // Imprime "http://gph.is/VxeHsW" ⏤ no "Crown Jewels"

// Esto es complicado, porque cuando se trata de API de devolución de llamada ⏤
// puede ser muy tentador pasar la referencia de la función
// directamente. Esto se puede solucionar creando una nueva
// función en el sitio de la llamada.

const objectNotCapturingThis = { contents: "N/A", imprime: () => safe.printContents() };
objectNotCapturingThis.print();

// Hay algunas formas de solucionar este problema. Una
// ruta es forzar la unión de este para que sea el objeto
// que originalmente pretendías a través de bind.

const customObjectCapturingThisAgain = { contents: "N/A", imprime: safe.printContents.bind(safe) };
customObjectCapturingThisAgain.print();

// Para evitar un contexto inesperado, también puedes
// cambiar la forma en que creas funciones en tu clase. Creando
// una propiedad que utiliza una función de flecha, la
// vinculación de esto se realiza en un momento diferente. Que hace
// más predecible para los menos experimentados con el
// entorno de ejecución de JavaScript.

class SafelyBoundSafe {
  contents: string;

  constructor(contents: string) {
    this.contents = contents;
  }

  printContents = () => {
    console.log(this.contents);
  };
}

// Ahora pasando la función para que la ejecute
// otro objeto no cambia esto accidentalmente.

const saferSafe = new SafelyBoundSafe("Golden Skull");
saferSafe.printContents();

const customObjectTryingToChangeThis = {
  contents: "http://gph.is/XLof62",
  print: saferSafe.printContents,
};

customObjectTryingToChangeThis.print();

// Si tienes un proyecto TypeScript, puedes usar el indicador
// noImplicitThis del compilador para resaltar los casos en los que TypeScript
// no puede determinar qué tipo es "this" para una función.

// Puedes obtener más información sobre eso en el manual:
//
// https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypet
