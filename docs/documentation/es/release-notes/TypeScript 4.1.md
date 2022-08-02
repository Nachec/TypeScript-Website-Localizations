---
title: TypeScript 4.1
layout: docs
permalink: /docs/handbook/release-notes/typescript-4-1.html
oneline: Notas de la versión de TypeScript 4.1
---

## Tipos de plantillas literales

Los tipos de cadenas literales en *TypeScript* nos permiten modelar funciones y *API* que esperan un conjunto de cadenas específicas.

```ts twoslash
// @errors: 2345
function setVerticalAlignment(location: "top" | "middle" | "bottom") {
  // ...
}

setVerticalAlignment("middel");
```

Esto es bastante bueno porque los tipos de cadena literal básicamente pueden revisar la ortografía de nuestros valores de cadena.

También nos gusta que las cadenas literales se puedan usar como nombres de propiedad en tipos mapeados.
En este sentido, también se pueden utilizar como bloques de construcción:

```ts
type Options = {
  [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean;
};
// igual que
//   type Options = {
//       noImplicitAny?: boolean,
//       StrictNullChecks ?: boolean,
//       strictFunctionTypes?: boolean
//   };
```

Pero hay otro lugar donde esos tipos de cadenas literales se podrían usar como bloques de construcción: construyendo otros tipos de cadenas literales.

Es por eso que *TypeScript 4.1* trae el tipo de cadena literal de plantilla.
Tiene la misma sintaxis que [plantillas de cadena literales en *JavaScript*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals), pero se usa en posiciones de tipo.
Cuando lo usas con tipos de literales concretos, produce un nuevo tipo de cadena literal al concatenar el contenido.

```ts twoslash
type World = "world";

type Greeting = `hello ${World}`;
//   ^?
```

¿Qué pasa cuando tienes uniones en posiciones de sustitución?
Produce el conjunto de todas las posibles cadena literales que podrían representar cada miembro de la unión.

```ts twoslash
type Color = "red" | "blue";
type Quantity = "one" | "two";

type SeussFish = `${Quantity | Color} fish`;
//   ^?
```

Esto se puede usar más allá de los lindos ejemplos en las notas de la versión.
Por ejemplo, varias bibliotecas para componentes de la IU tienen una forma de especificar la alineación vertical y horizontal en sus *API*s, a menudo con ambas a la vez usando una sola cadena como `"bottom-right"`.
Entre alinearse verticalmente con `"top"`, `"middle"` y `"bottom"`, y alinearse horizontalmente con `"left"`, `"center"` y `"right"`, hay 9 posibles cadenas en las que cada una de las primeras está conectada con cada una de las últimas mediante un guión.

```ts twoslash
// @errors: 2345
type VerticalAlignment = "top" | "middle" | "bottom";
type HorizontalAlignment = "left" | "center" | "right";

// Acepta
//   | "top-left"    | "top-center"    | "top-right"
//   | "middle-left" | "middle-center" | "middle-right"
//   | "bottom-left" | "bottom-center" | "bottom-right"

declare function setAlignment(value: `${VerticalAlignment}-${HorizontalAlignment}`): void;

setAlignment("top-left");   // ¡funciona!
setAlignment("top-middel"); // ¡error!
setAlignment("top-pot");    // ¡error! pero buenas donas si alguna vez vas a Seattle
```

Mientras hay **lotes** de ejemplos de este tipo de *API* en la naturaleza, esto sigue siendo un ejemplo de juguete, ya que podríamos escribirlos manualmente.
De hecho, para 9 cadenas, esto probablemente esté bien; pero cuando necesites una tonelada de cadenas, deberías considerar generarlas automáticamente antes de tiempo para ahorrar trabajo en cada verificación de tipo (o simplemente usa `string`, que será mucho más simple de comprender).

Parte del valor real proviene de la creación dinámica de nuevas cadenas literales.
Por ejemplo, imagina una *API* `makeWatchedObject` que toma un objeto y produce un objeto casi idéntico, pero con un nuevo método `on` para detectar cambios en las propiedades.

```ts
let person = makeWatchedObject({
  firstName: "Homer",
  age: 42, // Da o toma
  location: "Springfield",
});

person.on("firstNameChanged", () => {
  console.log(`firstName was changed!`);
});
```

Observa que `on` escucha el evento `"firstNameChanged"`, no solo `"firstName"`.
¿Cómo escribiríamos esto?

```ts twoslash
type PropEventSource<T> = {
    on(eventName: `${string & keyof T}Changed`, callback: () => void): void;
};

/// Crea un "objeto observado" con un método 'on'
/// para que puedas estar atento a los cambios en las propiedades.
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
```

¡Con esto, podemos construir algo que se equivoque cuando le damos la propiedad incorrecta!

```ts twoslash
// @errors: 2345
type PropEventSource<T> = {
    on(eventName: `${string & keyof T}Changed`, callback: () => void): void;
};
declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
let person = makeWatchedObject({
  firstName: "Homer",
  age: 42, // Da o toma
  location: "Springfield",
});

// ---cut---
// ¡error!
person.on("firstName", () => {});

// ¡error!
person.on("frstNameChanged", () => {});
```

También podemos hacer algo especial en los tipos de plantillas literales: podemos *inferir* desde posiciones de sustitución.
Podemos hacer que nuestro último ejemplo sea genérico para inferir de partes de la cadena `eventName` para averiguar la propiedad asociada.

```ts twoslash
type PropEventSource<T> = {
    on<K extends string & keyof T>
        (eventName: `${K}Changed`, callback: (newValue: T[K]) => void ): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;

let person = makeWatchedObject({
    firstName: "Homer",
    age: 42,
    location: "Springfield",
});

// ¡funciona! 'newName' tiene el tipo 'string'
person.on("firstNameChanged", newName => {
    // 'newName' tiene el tipo de 'firstName'
    console.log(`new name is ${newName.toUpperCase()}`);
});

// ¡funciona! 'newAge' tiene el tipo 'number'
person.on("ageChanged", newAge => {
    if (newAge < 0) {
        console.log("warning! negative age");
    }
})
```

Aquí convertimos `on` en un método genérico.
Cuando un usuario llama con la cadena `"firstNameChanged'`, *TypeScript* intentará inferir el tipo correcto para `K`.
Para hacer eso, comparará `K` con el contenido antes de `"Changed"` e inferirá la cadena `"firstName"`.
Una vez que *TypeScript* se da cuenta de eso, el método `on` puede obtener el tipo de `firstName` en el objeto original, que es `string` en este caso.
De manera similar, cuando llamamos con `"ageChanged"`, encuentra el tipo de la propiedad `age` que es `number`).

La inferencia se puede combinar de diferentes formas, a menudo para deconstruir cadenas y reconstruirlas de diferentes formas.
De hecho, para ayudar con la modificación de estos tipos de cadena literal, hemos agregado algunos nuevos alias de tipos de utilidad para modificar el uso de mayúsculas y minúsculas (es decir, convertir a caracteres en minúsculas y mayúsculas).

```ts twoslash
type EnthusiasticGreeting<T extends string> = `${Uppercase<T>}`

type HELLO = EnthusiasticGreeting<"hello">;
//   ^?
```

Los nuevos alias de tipo son `Uppercase`, `Lowercase`, `Capitalize` y `Uncapitalize`.
Los dos primeros transforman cada carácter de una cadena y los dos últimos transforman solo el primer carácter de una cadena.

Para obtener más detalles, [consulta la solicitud de extracción original](https://github.com/microsoft/TypeScript/pull/40336) y [la solicitud de extracción en curso para cambiar a los auxiliares de alias de tipo](https://github.com/microsoft/TypeScript/pull/40580).

## Reasignación de claves en tipos mapeados

Solo como una actualización, un tipo mapeado puede crear nuevos tipos de objetos basados ​​en claves arbitrarias

```ts
type Options = {
  [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean;
};
// igual que
//   type Options = {
//       noImplicitAny?: boolean,
//       StrictNullChecks ?: boolean,
//       strictFunctionTypes?: boolean
//   };
```

o nuevos tipos de objetos basados ​​en otros tipos de objetos.

```ts
/// 'Partial<T>' es lo mismo que 'T', pero con cada propiedad marcada como opcional.
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

Hasta ahora, los tipos mapeados solo podían producir nuevos tipos de objetos con las claves que les proporcionaste; sin embargo, muchas veces deseas poder crear nuevas claves, o filtrar claves, basándose en las entradas.

Es por eso que *TypeScript 4.1* te permite reasignar claves en tipos mapeados con una nueva cláusula `as`.

```ts
type MappedTypeWithNewKeys<T> = {
    [K in keyof T as NewKeyType]: T[K]
    //            ^^^^^^^^^^^^^
    //            ¡Esta es la nueva sintaxis!
}
```

Con esta nueva cláusula `as`, puedes aprovechar características como tipos de plantillas literales para crear fácilmente nombres de propiedades basados ​​en los antiguos.

```ts twoslash
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

interface Person {
    name: string;
    age: number;
    location: string;
}

type LazyPerson = Getters<Person>;
//   ^?
```

e incluso puedes filtrar las claves produciendo `never`.
Eso significa que no tienes que usar un tipo auxiliar `Omit` adicional en algunos casos.

```ts twoslash
// Elimina la propiedad 'kind'
type RemoveKindField<T> = {
    [K in keyof T as Exclude<K, "kind">]: T[K]
};

interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
//   ^?
```

Para obtener más información, consulta [la solicitud de extracción original en GitHub](https://github.com/microsoft/TypeScript/pull/40336).

## Tipos condicionales recursivos

En *JavaScript*, es bastante común ver funciones que pueden aplanar y construir tipos de contenedores en niveles arbitrarios.
Por ejemplo, considera el método `.then()` en instancias de `Promise`.
`.then(...)` desenvuelve cada promesa hasta que encuentra un valor que no es "similar a una promesa", y pasa ese valor a una devolución de llamada.
También hay un método `flat` relativamente nuevo en `Array` que puede penetrar en la profundidad por aplanar .

Expresar esto en el sistema de tipos de *TypeScript* fue, a todos los efectos prácticos, imposible.
Si bien hubo trucos para lograr esto, los tipos terminaron pareciendo muy poco razonables.

Es por eso que *TypeScript 4.1* facilita algunas restricciones sobre los tipos condicionales: para que puedan modelar estos patrones.
En *TypeScript 4.1*, los tipos condicionales ahora pueden hacer referencia a sí mismos inmediatamente dentro de sus ramas, lo que facilita la escritura de alias de tipos recursivos.

Por ejemplo, si quisiéramos escribir un tipo para obtener los tipos de elementos de los arreglos anidados, podríamos escribir el siguiente tipo `deepFlatten`.

```ts
type ElementType<T> = T extends ReadonlyArray<infer U> ? ElementType<U> : T;

function deepFlatten<T extends readonly unknown[]>(x: T): ElementType<T>[] {
  throw "not implemented";
}

// Todos estos devuelven el tipo 'number[]':
deepFlatten([1, 2, 3]);
deepFlatten([[1], [2, 3]]);
deepFlatten([[1], [[2]], [[[3]]]]);
```

De manera similar, en *TypeScript 4.1* podemos escribir un tipo `Awaited` para desenvolver profundamente las `Promise`s.

```ts
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/// Como `promise.then(...)`, pero más precisos en tipos.
declare function customThen<T, U>(
  p: Promise<T>,
  onFulfilled: (value: Awaited<T>) => U
): Promise<Awaited<U>>;
```

Ten en cuenta que, si bien estos tipos recursivos son poderosos, se deben usar de manera responsable y con moderación.

En primer lugar, estos tipos pueden hacer mucho trabajo, lo cual significa que pueden aumentar el tiempo de verificación de tipos.
Intentar modelar números en la conjetura de `Collatz` o la secuencia de `Fibonacci` puede ser divertido, pero no envíes eso en archivos `.d.ts` a `npm`.

Además de ser computacionalmente intensivos, estos tipos pueden alcanzar un límite de profundidad de recursión interna en entradas suficientemente complejas.
Cuando se alcanza ese límite de recursividad, se produce un error en tiempo de compilación.
En general, es mejor no utilizar estos tipos en absoluto que escribir algo que falle en ejemplos más realistas.

Ve más [en la implementación](https://github.com/microsoft/TypeScript/pull/40002).

## Accesos indexados comprobados (`--noUncheckedIndexedAccess`)

*TypeScript* tiene una característica llamada *índice de firmas*.
Estas firmas son una forma de indicar al sistema de tipos que los usuarios pueden acceder a propiedades con nombres arbitrarios.

```ts twoslash
interface Options {
  path: string;
  permissions: number;

  // Las propiedades adicionales son capturadas por este índice de firma.
  [nombrePropiedad: string]: string | number;
}

function checkOptions(opts: Options) {
  opts.path; // string
  opts.permissions; // number

  // ¡Todos estos también están permitidos!
  // Tienen el tipo 'string | number'.
  opts.yadda.toString();
  opts["foo bar baz"].toString();
  opts[Math.random()].toString();
}
```

En el ejemplo anterior, `Options` tiene un índice de firma que dice que cualquier propiedad a la que se acceda que no esté listada debería tener el tipo `string | number`.
Esto suele ser conveniente para el código optimista que asume que sabes lo que estás haciendo, pero la verdad es que la mayoría de los valores en *JavaScript* no son compatibles con todos los nombres de propiedades potenciales.
La mayoría de los tipos, por ejemplo, no tendrán un valor para una clave de propiedad creada por `Math.random()` como en el ejemplo anterior.
Para muchos usuarios, este comportamiento era indeseable y se sentía como si no estuviera aprovechando la comprobación estricta completa de [`strictNullChecks`](/tsconfig#strictNullChecks).

Es por eso que *TypeScript 4.1* viene con una nueva bandera llamada [`noUncheckedIndexedAccess`](/tsconfig#noUncheckedIndexedAccess).
Bajo este nuevo modo, cada acceso a propiedad (como `foo.bar`) o acceso indexado (como `foo["bar"]`) se considera potencialmente indefinido.
Eso significa que en nuestro último ejemplo, `opts.yadda` tendrá el tipo `string | number | undefined` en lugar de solo `string | number`.
Si necesitas acceder a esa propiedad, primero deberás verificar su existencia o usar un operador de aserción no null (el carácter `!` posfijo).

```ts twoslash
// @errors: 2532
// @noUncheckedIndexedAccess
interface Options {
  path: string;
  permissions: number;

  // Las propiedades adicionales son capturadas por este índice de firma.
  [nombrePropiedad: string]: string | number;
}
// ---cut---
function checkOptions(opts: Options) {
  opts.path; // string
  opts.permissions; // number

  // Estos no están permitidos con noUncheckedIndexedAccess
  opts.yadda.toString();
  opts["foo bar baz"].toString();
  opts[Math.random()].toString();

  // Verifica si realmente está ahí primero.
  if (opts.yadda) {
    console.log(opts.yadda.toString());
  }

  // Básicamente diciendo "confía en mí, sé lo que estoy haciendo"
  // con '!' el operador de aserción no nula.
  opts.yadda!.toString();
}
```

Una consecuencia de usar [`noUncheckedIndexedAccess`](/tsconfig#noUncheckedIndexedAccess) es que la indexación en un arreglo también se verifica de manera más estricta, incluso en un bucle con límites controlados.

```ts twoslash
// @errors: 2532
// @noUncheckedIndexedAccess
function oddRawStrings(strs: string[]) {
  // Esto tendrá problemas
  for (let i = 0; i < strs.length; i++) {
    console.log(strs[i].toUpperCase());
  }
}
```

Si no necesitas los índices, puedes iterar sobre elementos individuales usando un bucle `for`-`of` o una llamada a `forEach`.

```ts twoslash
// @noUncheckedIndexedAccess
function oddRawStrings(strs: string[]) {
  // Esto trabaja bien
  for (const str of strs) {
    console.log(str.toUpperCase());
  }

  // Esto trabaja bien
  strs.forEach((str) => {
    console.log(str.toUpperCase());
  });
}
```

Esta bandera puede ser útil para detectar errores fuera de los límites, pero puede ser ruidosa para una gran cantidad de código, por lo que no se habilita automáticamente con la bandera [`strict`](/tsconfig#strict); sin embargo, si esta característica es interesante para ti, no dudes en probarla y determinar si tiene sentido para el código base de tu equipo.

Puedes obtener más información [en la solicitud de extracción de implementación](https://github.com/microsoft/TypeScript/pull/39560).

## `paths` sin `baseUrl`

El uso del mapeo de rutas es bastante común ⏤ a menudo es para tener importaciones más agradables, a menudo es para simular el comportamiento de enlace de "monorepo".

Desafortunadamente, especificar [`paths`](/tsconfig#paths) para habilitar el mapeo de rutas requiere también especificar una opción llamada [`baseUrl`](/tsconfig#baseUrl), que permite que la especificación de rutas desnudas también sean alcanzadas en relación con [`baseUrl`](/tsconfig#baseUrl).
Esto también provocó que las autoimportaciones utilizaran rutas deficientes.

En *TypeScript 4.1*, la opción [`paths`](/tsconfig#paths) se puede usar sin [`baseUrl`](/tsconfig#baseUrl).
Esto ayuda a evitar algunos de estos problemas.

## `checkJs` Implica `allowJs`

Anteriormente, si estabas iniciando un proyecto marcado por *JavaScript*, tenías que configurar tanto [`allowJs`](/tsconfig#allowJs) como [`checkJs`](/tsconfig#checkJs).
Esta fue una fricción un poco molesta en la experiencia, por lo que [`checkJs`](/tsconfig#checkJs) ahora de manera predeterminada implica [`allowJs`](/tsconfig#allowJs).

[Ve más detalles en la solicitud de extracción](https://github.com/microsoft/TypeScript/pull/40275).

## Fábricas *React 17 JSX*

*TypeScript 4.1* admite las próximas funciones de fábrica `jsx` y `jsxs` de *React 17* a través de dos nuevas opciones para la opción del compilador [`jsx`](/tsconfig#jsx):

- `react-jsx`
- `react-jsxdev`

Estas opciones están destinadas a compilaciones de producción y desarrollo, respectivamente.
A menudo, las opciones de uno se pueden extender desde el otro.
Por ejemplo, un `tsconfig.json` para compilaciones de producción podría tener el siguiente aspecto:

```json tsconfig
// ./src/tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "es2015",
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["./**/*"]
}
```

y uno para compilaciones de desarrollo podría tener el siguiente aspecto:

```json tsconfig
// ./src/tsconfig.dev.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsxdev"
  }
}
```

Para obtener más información, [consulta la *SE* correspondiente](https://github.com/microsoft/TypeScript/pull/39199).

## Soporte del editor para la etiqueta `@see` de *JSDoc*

La etiqueta `@ see` de *JSDoc* ahora tiene un mejor soporte en editores para *TypeScript* y *JavaScript*.
Esto te permite utilizar funciones como ir a la definición en un nombre con puntos después de la etiqueta.
Por ejemplo, ir a la definición en `first` o `C` en el comentario *JSDoc* simplemente funciona en el siguiente ejemplo:

```ts
// @filename: first.ts
export class C {}

// @filename: main.ts
import * as first from "./first";

/**
 * @see first.C
 */
function related() {}
```

¡Gracias al colaborador frecuente [Wenlu Wang](https://github.com/Kingwl) [por implementar esto](https://github.com/microsoft/TypeScript/pull/39760)!

## Ruptura por cambios

### Cambios `lib.d.ts`

`lib.d.ts` puede tener un conjunto de *API*s modificadas, potencialmente en parte debido a cómo se generan automáticamente los tipos del *DOM*.
Un cambio específico es que se eliminó `Reflect.enumerate`, ya que se eliminó de *ES2016*.

### Los miembros `abstract` no se pueden marcar como `async`

Los miembros marcados como `abstract`os ya no se pueden marcar como `async`.
La solución aquí es eliminar la palabra clave `async`, ya que las personas que llaman solo se preocupan por el tipo de retorno.

### `any`/`unknown` se propagan en posiciones falsas

Anteriormente, para una expresión como `foo && somethingElse`, el tipo de `foo` era `any` o `unknown`, el tipo del conjunto de esa expresión sería el tipo de `somethingElse`.

Por ejemplo, anteriormente el tipo para `x` aquí era `{someProp: string }`.

```ts
declare let foo: unknown;
declare let somethingElse: { someProp: string };

let x = foo && somethingElse;
```

Sin embargo, en *TypeScript 4.1*, tenemos más cuidado con la forma en que determinamos este tipo.
Dado que no se sabe nada sobre el tipo en el lado izquierdo de `&&`, propagamos `any` y `unknown` hacia afuera en lugar del tipo en el lado derecho.

El patrón más común que vimos de esto solía ser cuando se verificaba la compatibilidad con `boolean`os, especialmente en funciones de predicado.

```ts
function isThing(x: any): boolean {
  return x && typeof x === "object" && x.blah === "foo";
}
```

A menudo, la solución adecuada es cambiar de `foo && someExpression` a `!!foo && someExpression`.

### Los parámetros de `resolve` ya no son opcionales en `Promise`s

Al escribir código como el siguiente

```ts
new Promise((resolve) => {
  doSomethingAsync(() => {
    doSomething();
    resolve();
  });
});
```

Puedes recibir un error como el siguiente:

```
  resolve()
  ~~~~~~~~~
error TS2554: Se esperaba 1 argumento, pero obtuve 0.
  No se proporcionó un argumento para 'valor'.
```

Esto se debe a que `resolve` ya no tiene un parámetro opcional, por lo que, de forma predeterminada, ahora se debe pasar un valor.
A menudo, esto detecta errores legítimos al usar `Promise`s.
La solución típica es pasarle el argumento correcto y, a veces, agregar un argumento de tipo explícito.

```ts
new Promise<number>((resolve) => {
  //     ^^^^^^^^
  doSomethingAsync((value) => {
    doSomething();
    resolve(value);
    //      ^^^^^
  });
});
```

Sin embargo, a veces `resolve()` realmente necesita ser llamado sin un argumento.
En estos casos, podemos dar a `Promise` un argumento explícito de tipo genérico `void` (es decir, escribirlo como `Promise<void>`).
Esto aprovecha la nueva funcionalidad en *TypeScript 4.1*, donde un parámetro final potencialmente "vacío" (`void`) se puede volver opcional.

```ts
new Promise<void>((resolve) => {
  //     ^^^^^^
  doSomethingAsync(() => {
    doSomething();
    resolve();
  });
});
```

*TypeScript 4.1* se envía con una solución rápida para ayudar a solucionar este problema.

### Los diferenciales condicionales crean propiedades opcionales

En *JavaScript*, la difusión de objetos (como `{ ...foo }`) no operan sobre valores falsos.
Entonces, en un código como `{ ...foo }`, `foo` se omitirá si es `null` o `undefined`.

Muchos usuarios aprovechan esto para difundirse en propiedades "condicionalmente".

```ts
interface Person {
  name: string;
  age: number;
  location: string;
}

interface Animal {
  name: string;
  owner: Person;
}

function copyOwner(pet?: Animal) {
  return {
    ...(pet && pet.owner),
    otherStuff: 123,
  };
}

// También podríamos usar el encadenamiento opcional aquí:

function copyOwner(pet?: Animal) {
  return {
    ...pet?.owner,
    otherStuff: 123,
  };
}
```

Aquí, si se define `pet`, las propiedades de `pet.owner` se distribuirán en ⏤ de lo contrario, no se distribuirán propiedades en el objeto devuelto.

El tipo de retorno de `copyOwner` era anteriormente un tipo de unión basado en cada extensión:

```
{ x: number } | { x: number, name: string, age: number, location: string }
```

Esto modeló exactamente cómo ocurriría la operación: si se definiera `pet`, todas las propiedades de `Person`a estarían presentes; de lo contrario, ninguna de ellas se definiría en el resultado.
Fue una operación de todo o nada.

Sin embargo, hemos visto este patrón llevado al extremo, con cientos de extensiones en un solo objeto, cada extensión potencialmente agregando cientos o miles de propiedades.
Resulta que, por varias razones, esto termina siendo extremadamente costoso y, por lo general, sin muchos beneficios.

En *TypeScript 4.1*, el tipo devuelto a veces usa propiedades totalmente opcionales.

```
{
    x: number;
    nombre?: string;
    age?: number;
    location?: string;
}
```

Esto termina funcionando mejor y, en general, también se muestra mejor.

Para obtener más detalles, [consulta el cambio original](https://github.com/microsoft/TypeScript/pull/40778).
Si bien este comportamiento no es del todo consistente en este momento, esperamos que una versión futura produzca resultados más limpios y predecibles.

### Los parámetros incomparables ya no están relacionados

*TypeScript* relacionaría previamente los parámetros que no se correspondían entre sí relacionándolos con el tipo `any`.
Con [cambios en *TypeScript 4.1*](https://github.com/microsoft/TypeScript/pull/41308), el lenguaje ahora omite este proceso por completo.
Esto significa que algunos casos de asignabilidad ahora fallarán, pero también significa que algunos casos de resolución de sobrecarga también pueden fallar.
Por ejemplo, la resolución de sobrecarga en `util.promisify` en *Node.js* puede seleccionar una sobrecarga diferente en *TypeScript 4.1*, lo que a veces provoca errores nuevos o diferentes en sentido descendente.

Como solución alternativa, es mejor utilizar una aserción de tipo para silenciar los errores.
