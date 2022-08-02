//// { "compiler": { "ts": "4.2.0-beta" } }
// En 4.2, un miembro de la comunidad (@a-tarasyuk) agregó la capacidad de generar funciones
// a partir de llamadas que no están definidas. Por ejemplo, si seleccionas todo el código en la línea 5,
// luego haz clic en "Solución rápida", verás la opción de generar la función que falta.

const id = generateUUID();

// La solución tendrá en cuenta información contextual como el potencial
// tipo de retorno para la función. Por ejemplo, TypeScript conoce el tipo de retorno
// debido a que está anotado en la declaración de variable.

const idStr: string = generateUUID1();

// La solución mantendrá el mismo número de argumentos genéricos cuando se utilicen:

const idObj = generateUUID3<{ id: string }>();

// Los parámetros también actúan como cabría esperar:

const complexUUID = generateUUID4("SHA32", 5, { namespace: "typescriptlang.org" });

// No es posible mostrar en el playground, pero el código corregido puede crear funciones
// que además trabajan en diferentes módulos ⏤ mucho para usar.
