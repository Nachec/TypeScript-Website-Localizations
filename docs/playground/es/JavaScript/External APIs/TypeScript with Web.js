//// { "order": 0, "isJavaScript": true }

// El DOM (Document Object Model) es la API subyacente para
// trabajar con una página web y TypeScript tiene un gran soporte
// para esa API.

// Creemos una ventana emergente para mostrar cuando presiones "Ejecutar" en
// la barra de herramientas de arriba.

const popover = document.createElement("div");
popover.id = "example-popover";

// Ten en cuenta que popover se escribe correctamente para ser un HTMLDivElement
// específicamente porque pasamos en "div".

// Para que sea posible volver a ejecutar este código, primero
// agrega una función para eliminar el popover si ya estaba allí.

const removePopover = () => {
  const existingPopover = document.getElementById(popover.id);
  if (existingPopover && existingPopover.parentElement) {
    existingPopover.parentElement.removeChild(existingPopover);
  }
};

// Entonces llámalo de inmediato.

removePopover();

// Podemos establecer los estilos en línea en el elemento a través de la
// propiedad .style en un HTMLElement - esto está completamente tipado.

popover.style.backgroundColor = "#0078D4";
popover.style.color = "white";
popover.style.border = "1px solid black";
popover.style.position = "fixed";
popover.style.bottom = "10px";
popover.style.left = "20px";
popover.style.width = "200px";
popover.style.height = "100px";
popover.style.padding = "10px";

// Incluyendo atributos CSS más oscuros u obsoletos.
popover.style.webkitBorderRadius = "4px";

// Para agregar contenido al popover, necesitaremos agregar
// un elemento de párrafo y utilizarlo para agregar texto.

const message = document.createElement("p");
message.textContent = "Here is an example popover";

// Y también agregaremos un botón de cierre.

const closeButton = document.createElement("a");
closeButton.textContent = "X";
closeButton.style.position = "absolute";
closeButton.style.top = "3px";
closeButton.style.right = "8px";
closeButton.style.color = "white";
closeButton.style.cursor = "pointer";

closeButton.onclick = () => {
  removePopover();
};

// Luego agrega todos estos elementos a la página.
popover.appendChild(message);
popover.appendChild(closeButton);
document.body.appendChild(popover);

// Si presionas "Ejecutar" arriba, debería aparecer una ventana emergente
// en la parte inferior izquierda, que puedes cerrar haciendo clic
// en la x en la parte superior derecha de la ventana emergente.

// Este ejemplo muestra cómo puedes trabajar con la API del DOM
// en JavaScript - pero usando TypeScript para proporcionar excelentes
// soporte de herramientas.

// Hay un ejemplo extendido de herramientas de TypeScript con
// WebGL disponible aquí: example:typescript-with-webgl
