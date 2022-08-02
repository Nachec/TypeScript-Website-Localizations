//// { "compiler": { "ts": "4.3.4" } }
// El sistema de tipos de TypeScript tiene como objetivo proporcionar herramientas de tipos
// que coinciden con el código JavaScript existente y una de las
// características que son naturales en el código JavaScript son
// para admitir muchos tipos diferentes de entradas para un valor,
// pero solo para proporcionar una salida establecida.

// Con TS 4.3, ahora puedes tener diferentes tipos de conjuntos
// vs la obtención de una propiedad en particular con captadores
// y definidores.

// Por ejemplo, este temporizador acepta muchos tipos posibles
// al establecer la propiedad de inicio, pero solo dará
// un objeto Date de vuelta.

class Timer {
  #start = new Date();

  get start(): Date {
    return this.#start;
  }

  set start(value: string | number | Date | undefined) {
    if (!value) this.#start = new Date();
    else if (value instanceof Date) this.#start = value;
    else this.#start = new Date(value);
  }
}

const timer = new Timer();

timer.start = "2021-06-28T14";
console.log(timer.start);

timer.start = 1624890417925;
console.log(timer.start);

timer.start = new Date();
console.log(timer.start);
