---
display: "Target"
oneline: "Establece la versión de lenguaje JavaScript para JavaScript emitido e incluye declaraciones de biblioteca compatibles."
---

Los navegadores modernos admiten todas las funciones de `ES6`, por lo que `ES6` es una buena opción.
Puedes elegir establecer un objetivo más bajo si tu código se implementa en entornos más antiguos, o un objetivo más alto si se garantiza que tu código se ejecutará en entornos más nuevos.

La configuración de `target` cambia qué características de *JS* se bajan de nivel y cuáles se dejan intactas.
Por ejemplo, una función de flecha `() => this` se convertirá en una expresión de `function` equivalente si `target` es *ES5* o inferior.

Cambiar `target` también cambia el valor predeterminado de [`lib`](#lib).
Puedes "mezclar y combinar" las configuraciones de `target` y `lib` como desees, pero puedes simplemente establecer `target` para tu conveniencia.

Para plataformas de desarrollo como *Node*, existen líneas base para el `target`, dependiendo del tipo de plataforma y su versión. Puedes encontrar un conjunto de `TSConfigs` organizados por la comunidad en [`tsconfig`/`bases`](https://github.com/tsconfig/bases#centralized-recommendations-for-tsconfig-bases), que tiene configuraciones para plataformas comunes y sus versiones.

El valor especial `ESNext` se refiere a la versión más alta que admite su versión de *TypeScript*.
Esta configuración se debe usar con precaución, ya que no significa lo mismo entre diferentes versiones de *TypeScript* y puede hacer que las actualizaciones sean menos predecibles.
