//// { "compiler": {  }, "order": 1 }

// Nuevo en 3.7 es una validación dentro de las declaraciones if para
// cuando accidentalmente usas una función en lugar
// del valor de retorno de una función.

// Esto solo aplica cuando se sabe que la función
// existe haciendo que la declaración if siempre sea true.

// Aquí hay una interfaz de complemento de ejemplo, donde hay
// devoluciones de llamada opcionales y no opcionales.

interface PluginSettings {
  pluginShouldLoad?: () => void;
  pluginIsActivated: () => void;
}

declare const plugin: PluginSettings;

// Debido a que pluginShouldLoad no podría existir, entonces
// la validación es legítima.

if (plugin.pluginShouldLoad) {
  // Hacer algo cuando exista pluginShouldLoad.
}

// En 3.6 e inferior, esto no fue un error.

if (plugin.pluginIsActivated) {
  // Quiere hacer algo cuando el complemento está activado,
  // pero en lugar de llamar al método lo usamos como una
  // propiedad.
}

// pluginIsActivated debería existir siempre, pero TypeScript
// todavía permite la verificación, porque el método se llama
// dentro del bloque if.

if (plugin.pluginIsActivated) {
  plugin.pluginIsActivated();
}
