// Los genéricos proporcionan una forma de utilizar tipos como variables en otros
// tipos. Meta.

// Intentaremos que este ejemplo sea ligero, puedes hacerlo
// mucho con los genéricos y es probable que veas algún muy 
// complicado código usando genéricos en algún momento ⏤ pero eso
// no significa que los genéricos sean complicados.

// Comencemos con un ejemplo en el que envolvemos un objeto de entrada.
// en un arreglo. Solo nos preocuparemos por una variable en este
// caso, el tipo que se pasó en:

function wrapInArray<Type>(input: Type): Type[] {
  return [input];
}

// Nota: es común ver al tipo referido como T. Esto es
// culturalmente es similar a cómo la gente usa i en un bucle for para
// representar el índice. T normalmente representa el tipo, por lo que
// utilizar el nombre completo para mayor claridad.

// Nuestra función usará inferencia para mantener siempre el tipo
// pasado de la misma manera que el tipo se pasó (aunque
// estará envuelto en un arreglo).

const stringArray = wrapInArray("hello generics");
const numberArray = wrapInArray(123);

// Podemos verificar que esto funciona como se esperaba marcando
// si podemos asignar un arreglo de cadenas a una función que
// debe ser un arreglo de objetos:
const notStringArray: string[] = wrapInArray({});

// También puedes omitir la inferencia genérica agregando el
// tipo tú mismo también:
const stringArray2 = wrapInArray<string>("");

// wrapInArray permite que se use cualquier tipo, sin embargo, hay
// casos en los que solo necesitas permitir un subconjunto de tipos.
// En esos casos se puede decir que el tipo tiene que extender un
// tipo particular.

interface Drawable {
  draw: () => void;
}

// Esta función toma un conjunto de objetos que tienen una función
// para dibujar en la pantalla
function renderToScreen<Type extends Drawable>(input: Type[]) {
  input.forEach((i) => i.draw());
}

const objectsWithDraw = [{ draw: () => {} }, { draw: () => {} }];
renderToScreen(objectsWithDraw);

// Fallará si falta el dibujo:

renderToScreen([{}, { draw: () => {} }]);

// Los genéricos pueden empezar a parecer complicados cuando tienes
// múltiples variables. A continuación, se muestra un ejemplo de almacenamiento en caché.
// función que te permite tener diferentes conjuntos de tipos de entrada
// y cachés.

interface CacheHost {
  save: (a: any) => void;
}

function addObjectToCache<Type, Cache extends CacheHost>(obj: Type, cache: Cache): Cache {
  cache.save(obj);
  return cache;
}

// Es el mismo que el anterior, pero con un parámetro adicional.
// Nota: Sin embargo, para que esto funcione, tuvimos que usar un any. Este
// se puede resolver utilizando una interfaz genérica.

interface CacheHostGeneric<ContentType> {
  save: (a: ContentType) => void;
}

// Ahora, cuando se utiliza CacheHostGeneric, debes indicar
// lo que es ContentType.

function addTypedObjectToCache<Type, Cache extends CacheHostGeneric<Type>>(obj: Type, cache: Cache): Cache {
  cache.save(obj);
  return cache;
}

// Eso escaló bastante rápido en términos de sintaxis. Sin embargo,
// esto proporciona más seguridad. Estas son compensaciones, en que
// tienes más conocimientos para hacer ahora. Al proporcionar APIs para
// otros, los genéricos ofrecen una forma flexible de permitir que otros usen
// tus propios tipos con inferencia de código completo.

// Para obtener más ejemplos de genéricos con clases e interfaces:
//
// example:advanced-classes
// example:typescript-with-react
// https://www.typescriptlang.org/docs/handbook/generics.html
