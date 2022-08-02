//// { "order": 5, "isJavaScript": true }

// Este ejemplo crea un lienzo HTML que usa WebGL para
// renderizar confeti giratorio usando JavaScript. Vamos a
// recorrer el código para comprender cómo funciona, y
// ve cómo las herramientas de TypeScript brindan información útil.

// Este ejemplo se basa en: example:working-with-the-dom

// Primero, necesitamos crear un elemento de lienzo HTML, que
// hacemos a través de la API del DOM y establecemos algunos atributos de estilo en línea:

const canvas = document.createElement("canvas");
canvas.id = "spinning-canvas";
canvas.style.backgroundColor = "#0078D4";
canvas.style.position = "fixed";
canvas.style.bottom = "10px";
canvas.style.right = "20px";
canvas.style.width = "500px";
canvas.style.height = "400px";
canvas.style.zIndex = "100";

// A continuación, para facilitar la realización de cambios, eliminamos las
// versiones del lienzo al presionar "Ejecutar" - ahora puedes
// hacer cambios y verlos reflejados cuando presiones "Ejecutar"
// o (cmd + intro):

const existingCanvas = document.getElementById(canvas.id);
if (existingCanvas && existingCanvas.parentElement) {
  existingCanvas.parentElement.removeChild(existingCanvas);
}

// Le dice al elemento de lienzo que usaremos WebGL para dibujar
// dentro del elemento (y no el motor ráster predeterminado):

const gl = canvas.getContext("webgl");

// A continuación, necesitamos crear sombreadores de vértices - estos aproximadamente son
// pequeños programas que aplican las matemáticas a un conjunto de
// arreglos de vértices (números).

// Puedes ver el gran conjunto de atributos en la parte superior del sombreador,
// estos se pasan al sombreador compilado más adelante en el ejemplo.

// Hay una gran descripción general de cómo funcionan aquí:
// https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vertexShader,
  `
precision lowp float;

attribute vec2 a_position; // Cuadrado plano en el plano XY
attribute float a_startAngle;
attribute float a_angularVelocity;
attribute float a_rotationAxisAngle;
attribute float a_particleDistance;
attribute float a_particleAngle;
attribute float a_particleY;
uniform float u_time; // Estado global

varying vec2 v_position;
varying vec3 v_color;
varying float v_overlight;

void main() {
  float angle = a_startAngle + a_angularVelocity * u_time;
  float vertPosition = 1.1 - mod(u_time * .25 + a_particleY, 2.2);
  float viewAngle = a_particleAngle + mod(u_time * .25, 6.28);

  mat4 vMatrix = mat4(
    1.3, 0.0, 0.0, 0.0,
    0.0, 1.3, 0.0, 0.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 shiftMatrix = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    a_particleDistance * sin(viewAngle), vertPosition, a_particleDistance * cos(viewAngle), 1.0
  );

  mat4 pMatrix = mat4(
    cos(a_rotationAxisAngle), sin(a_rotationAxisAngle), 0.0, 0.0,
    -sin(a_rotationAxisAngle), cos(a_rotationAxisAngle), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ) * mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(angle), sin(angle), 0.0,
    0.0, -sin(angle), cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  gl_Position = vMatrix * shiftMatrix * pMatrix * vec4(a_position * 0.03, 0.0, 1.0);
  vec4 normal = vec4(0.0, 0.0, 1.0, 0.0);
  vec4 transformedNormal = normalize(pMatrix * normal);

  float dotNormal = abs(dot(normal.xyz, transformedNormal.xyz));
  float regularLighting = dotNormal / 2.0 + 0.5;
  float glanceLighting = smoothstep(0.92, 0.98, dotNormal);
  v_color = vec3(
    mix((0.5 - transformedNormal.z / 2.0) * regularLighting, 1.0, glanceLighting),
    mix(0.5 * regularLighting, 1.0, glanceLighting),
    mix((0.5 + transformedNormal.z / 2.0) * regularLighting, 1.0, glanceLighting)
  );

  v_position = a_position;
  v_overlight = 0.9 + glanceLighting * 0.1;
}
`
);
gl.compileShader(vertexShader);

// Este ejemplo también usa sombreadores de fragmentos: un sombreador
// fragmento es otro pequeño programa que se ejecuta en todos los
// píxeles en el lienzo y establece su color.

// En este caso, si juegas con los números, verás cómo
// esto afecta la iluminación de la escena, así como el borde.
// radio en el confeti:

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  fragmentShader,
  `
precision lowp float;
varying vec2 v_position;
varying vec3 v_color;
varying float v_overlight;

void main() {
  gl_FragColor = vec4(v_color, 1.0 - smoothstep(0.8, v_overlight, length(v_position)));
}
`
);
gl.compileShader(fragmentShader);

// Toma los sombreadores compilados y los agrega al contexto
// del lienzo WebGL para que se pueda utilizar:

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

// Necesitamos obtener/establecer las variables de entrada en el sombreador en una
// forma segura para la memoria, por lo que el orden y la longitud de
// los valores se deben almacenar.

const attrs = [
  { name: "a_position", length: 2, offset: 0 }, // p.ej. x e y representan 2 espacios en la memoria
  { name: "a_startAngle", length: 1, offset: 2 }, // pero el ángulo es solo 1 valor
  { name: "a_angularVelocity", length: 1, offset: 3 },
  { name: "a_rotationAxisAngle", length: 1, offset: 4 },
  { name: "a_particleDistance", length: 1, offset: 5 },
  { name: "a_particleAngle", length: 1, offset: 6 },
  { name: "a_particleY", length: 1, offset: 7 },
];

const STRIDE = Object.keys(attrs).length + 1;

// Recorre nuestros atributos conocidos y crea punteros en la memoria para que el
// lado JS pueda rellenar el sombreador.

// Para entender un poco esta API: WebGL está basado en OpenGL
// que es una API con estilo de máquina de estado. Pasas comandos en un
// orden particular para renderizar cosas en la pantalla.

// Por lo tanto, el uso previsto a menudo no es pasar objetos a todas las llamadas a la
// API WebGL, pero en su lugar pasa una cosa a una función, luego pasa
// otro al siguiente. Entonces, aquí preparamos WebGL para crear un arreglo de
// punteros de vértice:

for (var i = 0; i < attrs.length; i++) {
  const name = attrs[i].name;
  const length = attrs[i].length;
  const offset = attrs[i].offset;
  const attribLocation = gl.getAttribLocation(shaderProgram, name);
  gl.vertexAttribPointer(attribLocation, length, gl.FLOAT, false, STRIDE * 4, offset * 4);
  gl.enableVertexAttribArray(attribLocation);
}

// Luego, en esta línea, están vinculados a un arreglo en la memoria:

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());

// Configura algunas constantes para renderizar:

const NUM_PARTICLES = 200;
const NUM_VERTICES = 4;

// Intenta reducir este y presiona "Ejecutar" nuevamente,
// representa cuántos puntos deben existir en
// cada confeti y tener un número impar envía
// está fuera de control.

const NUM_INDICES = 6;

// Cree los arreglos de entradas para los sombreadores de vértices
const vertices = new Float32Array(NUM_PARTICLES * STRIDE * NUM_VERTICES);
const indices = new Uint16Array(NUM_PARTICLES * NUM_INDICES);

for (let i = 0; i < NUM_PARTICLES; i++) {
  const axisAngle = Math.random() * Math.PI * 2;
  const startAngle = Math.random() * Math.PI * 2;
  const groupPtr = i * STRIDE * NUM_VERTICES;

  const particleDistance = Math.sqrt(Math.random());
  const particleAngle = Math.random() * Math.PI * 2;
  const particleY = Math.random() * 2.2;
  const angularVelocity = Math.random() * 2 + 1;

  for (let j = 0; j < 4; j++) {
    const vertexPtr = groupPtr + j * STRIDE;
    vertices[vertexPtr + 2] = startAngle; // Ángulo inicial
    vertices[vertexPtr + 3] = angularVelocity; // Velocidad angular
    vertices[vertexPtr + 4] = axisAngle; // Diferencia de ángulo
    vertices[vertexPtr + 5] = particleDistance; // Distancia de la partícula desde el (0,0,0)
    vertices[vertexPtr + 6] = particleAngle; // Ángulo alrededor del eje Y
    vertices[vertexPtr + 7] = particleY; // Ángulo alrededor del eje Y
  }

  // Coordenadas
  vertices[groupPtr] = vertices[groupPtr + STRIDE * 2] = -1;
  vertices[groupPtr + STRIDE] = vertices[groupPtr + STRIDE * 3] = +1;
  vertices[groupPtr + 1] = vertices[groupPtr + STRIDE + 1] = -1;
  vertices[groupPtr + STRIDE * 2 + 1] = vertices[groupPtr + STRIDE * 3 + 1] = +1;

  const indicesPtr = i * NUM_INDICES;
  const vertexPtr = i * NUM_VERTICES;
  indices[indicesPtr] = vertexPtr;
  indices[indicesPtr + 4] = indices[indicesPtr + 1] = vertexPtr + 1;
  indices[indicesPtr + 3] = indices[indicesPtr + 2] = vertexPtr + 2;
  indices[indicesPtr + 5] = vertexPtr + 3;
}

// Pasa los datos al contexto WebGL
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const timeUniformLocation = gl.getUniformLocation(shaderProgram, "u_time");
const startTime = (window.performance || Date).now();

// Comienza el color de fondo como negro
gl.clearColor(0, 0, 0, 1);

// Permite canales alfa en el sombreador de vértices
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

// Establece el contexto de WebGL para que tenga el tamaño completo del lienzo
gl.viewport(0, 0, canvas.width, canvas.height);

// Crea un bucle de ejecución para dibujar todo el confeti.
(function frame() {
  gl.uniform1f(timeUniformLocation, ((window.performance || Date).now() - startTime) / 1000);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, NUM_INDICES * NUM_PARTICLES, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(frame);
})();

// Agrega el nuevo elemento de lienzo en la parte inferior izquierda
// del playground
document.body.appendChild(canvas);

// Crédito: basado en este JSFiddle de Subzey
// https://jsfiddle.net/subzey/52sowezj/
