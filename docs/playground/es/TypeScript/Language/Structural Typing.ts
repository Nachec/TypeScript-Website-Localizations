// TypeScript es un sistema de tipos estructurales. Un sistema de
// tipo estructural significa que al comparar tipos, TypeScript solo
// tiene en cuenta los miembros del tipo.

// Esto contrasta con los sistemas de tipo nominal, donde
// podrías crear dos tipos pero no los podrías asignar a cada
// otro. Ve example:nominal-typing

// Por ejemplo, estas dos interfaces son completamente
// transferibles en un sistema de tipo estructural:

interface Ball {
  diameter: number;
}
interface Sphere {
  diameter: number;
}

let ball: Ball = { diameter: 10 };
let sphere: Sphere = { diameter: 20 };

sphere = ball;
ball = sphere;

// Si agregamos un tipo que contiene estructuralmente todos los
// miembros de Ball y Sphere, entonces también se puede
// configurar para ser una ball o sphere.

interface Tube {
  diameter: number;
  length: number;
}

let tube: Tube = { diameter: 12, length: 3 };

tube = ball;
ball = tube;

// Debido a que una ball no tiene una longitud, no se puede
// asignar a la variable tube. Sin embargo, todos los miembros
// de Ball están dentro del tube, por lo que se puede asignar.

// TypeScript está comparando cada miembro del tipo
// unos a otros para verificar su igualdad.

// Una función es un objeto en JavaScript y se compara
// de una forma similar. Con un útil truco extra
// los params:

let createBall = (diameter: number) => ({ diameter });
let createSphere = (diameter: number, useInches: boolean) => {
  return { diameter: useInches ? diameter * 0.39 : diameter };
};

createSphere = createBall;
createBall = createSphere;

// TypeScript permitirá que (number) sea igual a (number, boolean)
// en los parámetros, pero no (number, boolean) -> (number)

// TypeScript descartará el booleano en la primera asignación
// porque es muy común que el código JavaScript omita pasar
// params cuando no son necesarios.

// Por ejemplo, la devolución de llamada forEach del arreglo tiene
// tres parámetros, value, index y el arreglo completo ⏤ si TypeScript
// no admitiera el descarte de parámetros, entonces tendrías que
// Incluya todas las opciones para que las funciones coincidan:

[createBall(1), createBall(2)].forEach((ball, _index, _balls) => {
  console.log(ball);
});

// Nadie necesita eso.

// Los tipos de devolución se tratan como objetos y cualquier diferencia
// se compara con las mismas reglas de igualdad de objetos anteriores.

let createRedBall = (diameter: number) => ({ diameter, color: "red" });

createBall = createRedBall;
createRedBall = createBall;

// Dónde funciona la primera asignación (ambos tienen diámetro)
// pero la segunda no (la ball no tiene color).
