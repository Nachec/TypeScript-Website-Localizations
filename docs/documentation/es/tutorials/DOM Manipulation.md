---
title: Manipulación del DOM
layout: docs
permalink: /docs/handbook/dom-manipulation.html
oneline: Usar el DOM con TypeScript
translatable: true
---

## Manipulación del DOM

### *Una exploración del tipo* `HTMLElement`

En los más de 20 años a partir de su estandarización, *JavaScript* ha recorrido un largo camino. Si bien en 2020, *JavaScript* se puede usar en servidores, en datos de la ciencia e incluso en dispositivos *IoT*, es importante recordar su caso de uso más popular: los navegadores web.

Los sitios web se componen de documentos *HTML* y/o *XML*. Estos documentos son estáticos, no cambian. El *Modelo de objetos del documento (DOM)* es una interfaz de programación implementada por los navegadores para hacer que los sitios web estáticos sean funcionales. La *API DOM* se puede utilizar para cambiar la estructura, el estilo y el contenido del documento. La *API* es tan poderosa que se han desarrollado innumerables marcos *frontend* (*jQuery*, *React*, *Angular*, etc.) en torno a ella para hacer que los sitios web dinámicos sean aún más fáciles de desarrollar.

*TypeScript* es un superconjunto tipado de *JavaScript* y envía definiciones de tipo para la *API* del *DOM*. Estas definiciones están disponibles en cualquier proyecto *TypeScript* predeterminado. De las más de 20.000 líneas de definiciones en `lib.dom.d.ts`, una se destaca entre las demás: `HTMLElement` . Este tipo es la columna vertebral de la manipulación *DOM* con *TypeScript*.

> Puedes explorar el código fuente de las [definiciones de tipo *DOM*](https://github.com/microsoft/TypeScript/blob/main/lib/lib.dom.d.ts)

## Ejemplo básico

Dado un archivo `index.html` simplificado:

```HTML
<!DOCTYPE html>
<html lang="es">
  <head><title>Manipulación del DOM con TypeScript</title></head>
  <body>
    <div id="app"></div>
    <!-- Asume que index.js es la salida compilada de index.ts -->
    <script src="index.js"></script>
  </body>
</html>
```

Exploremos un script *TypeScript* que agrega un elemento `<p>¡Hola, mundo!</p>` al elemento `#app`.

```ts
// 1. Selecciona el elemento div usando la propiedad id
const app = document.getElementById("app");

// 2. Crea un nuevo elemento <p></p> mediante programación
const p = document.createElement("p");

// 3. Agrega el contenido de texto
p.textContent = "¡Hola, mundo!";

// 4. Agrega el elemento p al elemento div
app?.appendChild(p);
```

Después de compilar y ejecutar la página `index.html`, el *HTML* resultante será:

```HTML
<div id="app">
  <p>¡Hola, mundo!</p>
</div>
```

## La interfaz `Document`

La primera línea del código *TypeScript* utiliza una variable global `document`. La inspección de la variable muestra que está definida por la interfaz `Document` del archivo `lib.dom.d.ts`. El fragmento de código contiene llamadas a dos métodos, `getElementById` y `createElement`.

### `Document.getElementById`

La definición de este método es la siguiente:

```ts
getElementById(elementId: string): HTMLElement | null;
```

Pásale una cadena de identificación de elemento y devolverá `HTMLElement` o `null`. Este método introduce uno de los tipos más importantes, `HTMLElement`. Sirve como interfaz base para todas las demás interfaces de elementos. Por ejemplo, la variable `p` en el código de ejemplo es de tipo `HTMLParagraphElement`. También ten en cuenta que este método puede devolver `null`. Esto se debe a que el método no puede determinar antes del entorno de ejecución si realmente podrá encontrar el elemento especificado o no. En la última línea del fragmento de código, se usa el nuevo operador `optional chaining` para llamar a `appendChild`.

### `Document.createElement`

La definición de este método es (he omitido la definición `deprecated`):

```ts
createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
```

Esta es una definición de función sobrecargada. La segunda sobrecarga es la más simple y funciona de manera muy similar al método `getElementById`. Pásale cualquier `string` y devolverá un `HTMLElement` estándar. Esta definición es lo que permite a los desarrolladores crear etiquetas de elementos *HTML* únicas.

Por ejemplo, `document.createElement('xyz')` devuelve un elemento `<xyz></xyz>`, claramente no un elemento especificado por la especificación *HTML*.

> Para aquellos interesados, puedes interactuar con elementos de etiqueta personalizados usando el `document.getElementsByTagName`

Para la primera definición de `createElement`, se utilizan algunos patrones genéricos avanzados. Se entiende mejor dividido en partes, comenzando con la expresión genérica: `<K extends keyof HTMLElementTagNameMap>`. Esta expresión define un parámetro genérico `K` que está *restringido* a las claves de la interfaz `HTMLElementTagNameMap`. La interfaz `map` contiene cada nombre de etiqueta *HTML* especificado y su tipo de interfaz correspondiente. Por ejemplo, aquí están los primeros 5 valores mapeados:

```ts
interface HTMLElementTagNameMap {
    "a": HTMLAnchorElement;
    "abbr": HTMLElement;
    "address": HTMLElement;
    "applet": HTMLAppletElement;
    "area": HTMLAreaElement;
        ...
}
```

Algunos elementos no exhiben propiedades únicas y, por lo tanto, solo devuelven `HTMLElement`, pero otros tipos tienen propiedades y métodos únicos, por lo que devuelven su interfaz específica (que se extenderá desde o implementará `HTMLElement`).

Ahora, para el resto de la definición de `createElement`: `(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]`. El primer argumento `tagName` se define como el parámetro genérico `K`. El intérprete de *TypeScript* es lo suficientemente inteligente como para *inferir* el parámetro genérico de este argumento. Esto significa que el desarrollador no tiene que especificar el parámetro genérico cuando usa el método; cualquier valor que se pase al argumento `tagName` se deducirá como `K` y, por lo tanto, se puede utilizar en el resto de la definición. Que es exactamente lo que pasa; el valor de retorno `HTMLElementTagNameMap[K]` toma el argumento `tagName` y lo usa para devolver el tipo correspondiente. Esta definición es cómo la variable `p` del fragmento de código obtiene un tipo de `HTMLParagraphElement`. Y si el código fuera `document.createElement('a')`, entonces sería un elemento de tipo `HTMLAnchorElement`.

## La interfaz `Node`

La función `document.getElementById` devuelve un `HTMLElement`. La interfaz `HTMLElement` extiende la interfaz `Element` que extiende la interfaz `Node`. Esta extensión prototípica permite que todos los `HTMLElements` utilicen un subconjunto de métodos estándar. En el fragmento de código, usamos una propiedad definida en la interfaz `Node` para agregar el nuevo elemento `p` al sitio web.

### `Node.appendChild`

La última línea del fragmento de código es `app?.appendChild(p)`. La sección anterior, `document.getElementById`, detallaba que el operador `optional chaining` se usa aquí porque `app` potencialmente puede ser `null` en el entorno de ejecución. El método `appendChild` está definido por:

```ts
appendChild<T extends Node>(newChild: T): T;
```

Este método trabaja de manera similar al método `createElement` ya que el parámetro genérico `T` se infiere del argumento `newChild`. `T` está *restringido* a otra interfaz base `Node`.

## Diferencia entre `children` y `childNodes`

Anteriormente, este documento detalla que la interfaz `HTMLElement` se extiende desde `Element` que, a su ves, se extiende desde `Node`. En la *API DOM* hay un concepto de elementos `children`. Por ejemplo, en el siguiente *HTML*, las etiquetas `p` son elementos secundarios del elemento `div`

```tsx
<div>
  <p>¡Hola, mundo</p>
  <p>TypeScript!</p>
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(2) [p, p]

div.childNodes;
// NodeList(2) [p, p]
```

Después de capturar el elemento `div`, la propiedad `children` devolverá una lista de `HTMLCollection` que contiene los `HTMLParagraphElements`. La propiedad `childNodes` devolverá una lista similar de nodos `NodeList`. Cada etiqueta `p` seguirá siendo de tipo `HTMLParagraphElements`, pero la `NodeList` puede contener *nodos HTML* adicionales que la lista `HTMLCollection` no puede.

Modifica el *html* eliminando una de las etiquetas `p`, pero conserva el texto.

```tsx
<div>
  <p>¡Hola, mundo</p>
  TypeScript!
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(1) [p]

div.childNodes;
// NodeList(2) [p, text]
```

Ve cómo cambian ambas listas. `children` ahora solo contiene el elemento `<p>¡Hola, mundo</p>`, y `childNodes` contiene un nodo `text` en lugar de dos nodos `p`. La parte `text` de `NodeList` es el `Node` literal que contiene el texto `TypeScript!`. La lista `children` no contiene este `Node` porque no se considera un `HTMLElement`.

## Los métodos `querySelector` y `querySelectorAll`

Ambos métodos son excelentes herramientas para obtener listas de elementos del `dom` que se ajustan a un conjunto más exclusivo de restricciones. Se definen en `lib.dom.d.ts` como:

```ts
/**
 * Devuelve el primer elemento que es descendiente de un nodo que
 * coincide con los selectores.
 */
querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
querySelector<E extends Element = Element>(selectors: string): E | null;

/**
 * Devuelve todos los elementos descendientes del nodo que
 * coinciden con los selectores.
 */
querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
```

La definición de `querySelectorAll` es similar a `getElementsByTagName`, excepto que devuelve un nuevo tipo: `NodeListOf`. Este tipo devuelto esencialmente es una implementación personalizada del elemento de lista estándar de *JavaScript*. Se podría decir que reemplazar `NodeListOf<E>` por `E[]` resultaría en una experiencia de usuario muy similar. `NodeListOf` solo implementa las siguientes propiedades y métodos: `length`, `item(index)`, `forEach((value, key, parent) => void)`, e indexación numérica. Además, este método devuelve una lista de *elementos*, no *nodos*, que es lo que `NodeList` estaba devolviendo del método `.childNodes`. Si bien esto puede parecer una discrepancia, ten en cuenta que la interfaz `Element` se extiende desde `Node`.

Para ver estos métodos en acción, modifica el código existente para:

```tsx
<ul>
  <li>Primero :)</li>
  <li>Segundo!</li>
  <li> La tercera vez es un encanto.</li>
</ul>;

const first = document.querySelector("li"); // returns the first li element
const all = document.querySelectorAll("li"); // devuelve la lista de todos los elementos li
```

## ¿Interesado en aprender más?

La mejor parte de las definiciones de tipo `lib.dom.d.ts` es que reflejan los tipos anotados en el sitio de documentación de Mozilla Developer Network (MDN). Por ejemplo, la interfaz `HTMLElement` está documentada por esta [página `HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement) en MDN. Estas páginas enumeran todas las propiedades, métodos y, a veces, incluso ejemplos disponibles. Otro gran aspecto de las páginas es que proporcionan enlaces a los documentos estándar correspondientes. Aquí está el enlace a la [Recomendación del W3C para `HTMLElement`](https://www.w3.org/TR/html52/dom.html#htmlelement).

Fuentes:

- [Estándar *ECMA-262*](http://www.ecma-international.org/ecma-262/10.0/index.html)
- [Introducción al *DOM*](https://developer.mozilla.org/docs/Web/API/Document_Object_Model/Introduction)
