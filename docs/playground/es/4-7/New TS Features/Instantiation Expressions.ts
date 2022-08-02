//// { "compiler": { "ts": "4.7.3" } }
// Antes de *TypeScript 4.7*, tendrías que llamar a una función
// para reducir un tipo genérico a algo específico. Por
// ejemplo, tomemos un objeto Map:

const map = new Map<string, number>();
//    ^?

// Este map usa cadenas para claves y números para valores. Hasta que
// creamos el map, los valores para clave (cadena) y valor (número)
// aún no se habían definido y aún podría ser cualquier cosa.

// Las expresiones de creación de instancias significan que podemos crear una versión de la
// función de Map que siempre aceptará solo cadenas para claves y 
// números para valores:

const MapStrNum = Map<string, number>;

const map2 = new MapStrNum()
//    ^?

// Esta función nos permite crear elegantemente un tipado más específico
// de funciones sin tener que envolver la función en otra función.