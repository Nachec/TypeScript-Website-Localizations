---
title: Tipos básicos
layout: docs
permalink: /docs/handbook/basic-types.html
oneline: "Paso dos para aprender TypeScript: Tipos básicos."
handbook: "true"
deprecated_by: /docs/handbook/2/everyday-types.html
# prettier-ignore
deprecation_redirects: [
  never, /docs/handbook/2/narrowing.html#the-never-type,
  unknown, /docs/handbook/2/functions.html#unknown,
  void, /docs/handbook/2/functions.html#void
]
---

Para que los programas sean útiles, necesitamos poder trabajar con algunas de las unidades de datos más simples: números, cadenas, estructuras, valores booleanos y similares.
En *TypeScript*, admitimos los mismos tipos que cabría esperar en *JavaScript*, con un tipo de enumeración adicional incluido para ayudar.

## `Boolean`

El tipo de dato más básico es el valor simple `true`/`false`, que *JavaScript* y *TypeScript* llaman un valor `boolean`.

```ts twoslash
let isDone: boolean = false;
```

## `Number`

Como en *JavaScript*, todos los números en *TypeScript* son valores de coma flotante o `BigIntegers`.
Estos números de coma flotante obtienen el tipo `number`, mientras que los `BigIntegers` obtienen el tipo `bigint`.
Además de literales hexadecimales y decimales, *TypeScript* también admite literales binarios y octales introducidos en *ECMAScript 2015*.

```ts twoslash
// @target: ES2020
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let big: bigint = 100n;
```

## `String`

Otra parte fundamental de la creación de programas en *JavaScript* para páginas web y servidores por igual es trabajar con datos textuales.
Al igual que en otros lenguajes, usamos el tipo `string` para referirnos a estos tipos de datos textuales.
Justo cómo *JavaScript*, *TypeScript* también utiliza comillas dobles (`"`) o comillas simples (`'`) para rodear datos de cadena.

```ts twoslash
let color: string = "blue";
// prettier-ignore
color = 'red';
```

También puedes usar *cadenas de plantilla*, que pueden abarcar varias líneas y tener expresiones incrustadas.
Estas cadenas están rodeadas por el carácter `comilla invertida`/`acento invertido` (`` ` ``), y las expresiones incrustadas son de la forma `${ expr }`.

```ts twoslash
let fullName: string = `Bob Bobbington`;
let age: number = 37;
let sentence: string = `Hello, my name is ${fullName}.

I'll be ${age + 1} years old next month.`;
```

Esto es equivalente a declarar `sentence` así:

```ts twoslash
let fullName: string = `Bob Bobbington`;
let age: number = 37;
// ---cut---
let sentence: string =
  "Hello, my name is " +
  fullName +
  ".\n\n" +
  "I'll be " +
  (age + 1) +
  " years old next month.";
```

## Arreglo o `array`

Tanto *TypeScript*, como *JavaScript*, te permiten trabajar con arreglos de valores.
Los tipos `Array` se pueden escribir en una de dos maneras.
En la primera, usas el tipo de los elementos seguido por `[]` para denotar un arreglo de ese tipo de elemento:

```ts twoslash
let list: number[] = [1, 2, 3];
```

La segunda forma usa un tipo de arreglo genérico `Array<tipoElem>`:

```ts twoslash
let list: Array<number> = [1, 2, 3];
```

## `Tupla`

Los tipos `Tupla` te permiten expresar un arreglo con un número fijo de elementos cuyos tipos son conocidos, pero no necesariamente los mismos. Por ejemplo, posiblemente desees representar un valor como un par de un `string` y un `number`:

```ts twoslash
// @errors: 2322
// Declara un tipo tupla
let x: [string, number];
// La inicia
x = ["hello", 10]; // Bien
// La Inicia incorrectamente
x = [10, "hello"]; // Error
```

Al acceder a un elemento con un índice conocido, se recupera el tipo correcto:

```ts twoslash
// @errors: 2339
let x: [string, number];
x = ["hello", 10]; // Bien
/// ---cut---
// Bien
console.log(x[0].substring(1));

console.log(x[1].substring(1));
```

El acceso a un elemento fuera del conjunto de índices conocido falla con un error:

```ts twoslash
// @errors: 2493 2532 2322
let x: [string, number];
x = ["hello", 10]; // Bien
/// ---cut---
x[3] = "palabra";

console.log(x[5].toString());
```

## `Enum`

Una útil adición al conjunto estándar de tipos de datos de *JavaScript* es el `enum`.
Al igual que en lenguajes como `C#`, un `enum` es una forma de dar nombres más amigables a conjuntos de valores numéricos.

```ts twoslash
enum Color {
  Red,
  Green,
  Blue,
}
let c: Color = Color.Green;
```

De manera predeterminada, los `enum`s comienzan a numerar sus miembros a partir de `0`.
Puedes cambiar esto configurando manualmente el valor de uno de sus miembros.
Por ejemplo, podemos comenzar el ejemplo anterior en `1` en lugar de `0`:

```ts twoslash
enum Color {
  Rojo = 1,
  Green,
  Blue,
}
let c: Color = Color.Green;
```

O bien, incluso configurar manualmente todos los valores en el `enum`:

```ts twoslash
enum Color {
  Rojo = 1,
  Green = 2,
  Blue = 4,
}
let c: Color = Color.Green;
```

Una característica práctica de los `enum`s es que también puedes pasar un valor numérico al nombre de ese valor en el `enum`.
Por ejemplo, si tuviéramos el valor `2` pero no estuviéramos seguros de lo que se correlacionó en el `enum` `Color` anterior, podríamos buscar el nombre correspondiente:

```ts twoslash
enum Color {
  Rojo = 1,
  Green,
  Blue,
}
let colorName: string = Color[2];

// Muestra 'Green'
console.log(colorName);
```

## `Unknown`

Posiblemente necesitemos describir el tipo de variables que no conocemos cuando escribimos una aplicación.
Estos valores pueden provenir de contenido dinámico ⏤ p. ej. del usuario ⏤ o podemos querer aceptar intencionalmente todos los valores en nuestra *API*.
En estos casos, queremos proporcionar un tipo que le diga al compilador y a los futuros lectores que esta variable podría ser cualquier cosa, por lo que le damos el tipo `unknown`.

```ts twoslash
let notSure: unknown = 4;
notSure = "tal vez una cadena en su lugar";

// BIEN, definitivamente un booleano
notSure = false;
```

Si tienes una variable con un tipo desconocido, la puedes limitar a algo más específico haciendo comprobaciones de tipo `typeof`, comprobaciones de comparación o protecciones de tipo más avanzadas que se analizarán en un capítulo posterior:

```ts twoslash
// @errors: 2322 2322 2322
declare const maybe: unknown;
// 'maybe' podría ser una cadena, objeto, booleano, indefinido u otros tipos
const aNumber: number = maybe;

if (maybe === true) {
  // TypeScript sabe que talvez sea un booleano ahora
  const aBoolean: boolean = maybe;
  // Entonces, no puede ser una cadena
  const aString: string = maybe;
}

if (typeof maybe === "string") {
  // TypeScript sabe que maybe es una cadena
  const aString: string = maybe;
  // Entonces, no puede ser un booleano
  const aBoolean: boolean = maybe;
}
```

## `Any`

En algunas situaciones, no todos los tipos de información están disponibles o su declaración requeriría un esfuerzo inadecuado.
Estos pueden ocurrir para valores de código que se ha escrito sin *TypeScript* o una biblioteca de terceros.
En estos casos, es posible que deseemos excluirnos de la comprobación de tipos.
Para hacerlo, etiquetamos estos valores con el tipo `any`:

```ts twoslash
declare function getValue(key: string): any;
// BIEN, el valor de retorno de 'getValue' no está comprobado
const str: string = getValue("myString");
```

El tipo `any` es una poderosa forma de trabajar con *JavaScript* existente, permitiéndote activar y desactivar gradualmente la comprobación de tipos durante la compilación.

A diferencia de `unknown`, las variables de tipo `any` te permiten acceder a propiedades arbitrarias, incluso a las que no existen.
Estas propiedades incluyen funciones y *TypeScript* no comprobará su existencia o tipo:

```ts twoslash
// @errors: 2571
let looselyTyped: any = 4;
// BIEN, ifItExists podría existir en el entorno de ejecución
looselyTyped.ifItExists();
// BIEN, toFixed existe (pero el compilador no lo comprueba)
looselyTyped.toFixed();

let strictlyTyped: unknown = 4;
strictlyTyped.toFixed();
```

El `any` continuará propagándose a través de tus objetos:

```ts twoslash
let looselyTyped: any = {};
let d = looselyTyped.a.b.c.d;
//  ^?
```

Después de todo, recuerda que toda la conveniencia de `any` tiene el costo de perder la seguridad de los tipos.
La seguridad de tipos es una de las principales motivaciones para usar *TypeScript* y debes intentar evitar usar `any` cuando no sea necesario.

## `void`

`void` es un poco lo contrario de `any`: la ausencia de tener ningún tipo en absoluto.
Normalmente puedes ver esto como el tipo de retorno de las funciones que no devuelven un valor:

```ts twoslash
function warnUser(): void {
  console.log("Este es mi mensaje de advertencia");
}
```

Declarar variables de tipo `void` no es útil porque solo puedes asignarles `null` (solo si no se especifica [`strictNullChecks`](/tsconfig#strictNullChecks), consulta la siguiente sección) o `undefined`:

```ts twoslash
// @strict: false
let unusable: void = undefined;
// BIEN si no se da `--strictNullChecks`
unusable = null;
```

## `null` y `undefined`

En *TypeScript*, tanto `undefined` como `null` tienen sus tipos denominados `undefined` y `null` respectivamente.
Muy similares a `void`, no son extremadamente útiles por sí mismos:

```ts twoslash
// ¡No hay mucho más que podamos asignar a estas variables!
let u: undefined = undefined;
let n: null = null;
```

De manera predeterminada `null` y `undefined` son subtipos de todos los demás tipos.
Lo cual significa que puedes asignar `null` y `undefined` a algo como `number`.

Sin embargo, cuando se usa el indicador [`strictNullChecks`](/tsconfig#strictNullChecks), `null` y `undefined` solo se pueden asignar a `unknown`, `any` y a sus respectivos tipos (la única excepción es que `undefined` también se puede asignar a `void`).
Esto ayuda a evitar *muchos* errores comunes.
En los casos en que deseas pasar ya sea en un `string`, `null` o `undefined`, puedes utilizar los tipos unión `string | null | undefined`.

Los tipos unión son un tema avanzado que trataremos en un capítulo posterior.

> Como nota: recomendamos el uso de [`strictNullChecks`](/tsconfig#strictNullChecks) cuando sea posible, pero para los propósitos de este manual, asumiremos que está desactivado.

## Never

El tipo `never` representa el tipo de valores que nunca ocurren.
Por ejemplo, `never` es el tipo de retorno para una expresión de función o una expresión de función de flecha que siempre arroja una excepción o una que nunca regresa.
Las variables también adquieren el tipo `never` cuando se restringen por cualquier tipo de protectores que nunca pueden ser `true`.

El tipo `never` es un subtipo de, y asignable a, cada tipo; sin embargo, *ningún* tipo es un subtipo de, o asignable a, `never` (excepto `never` en sí mismo).
Incluso `any` no es asignable a `never`.

Algunos ejemplos de funciones que regresan `never`:

```ts twoslash
// La función que regresa never no debe tener un punto final alcanzable
function error(message: string): never {
  throw new Error(message);
}

// El tipo de retorno inferido es never
function fail() {
  return error("Algo falló");
}

// La función que regresa never no debe tener un punto final alcanzable
function infiniteLoop(): never {
  while (true) {}
}
```

## Objeto

`object` es un tipo que representa el tipo no primitivo, es decir, cualquier cosa que no sea `number`, `string`, `boolean`, `bigint`, `symbol`, `null` o `undefined`.

Con el tipo `object`, las *API*s como `Object.create` se pueden representar mejor. Por ejemplo:

```ts twoslash
// @errors: 2345
declare function create(o: object | null): void;

// Bien
create({ prop: 0 });
create(null);
create(undefined); // con el indicador `--strictNullChecks` habilitado, undefined no es un subtipo de null

create(42);
create("string");
create(false);
```

Generalmente, no necesitarás usar esto.

## Aserciones de tipo

A veces terminarás en una situación en la que sabrás más acerca de un valor que el mismo *TypeScript*.
Por lo general, esto sucederá cuando sepas que el tipo de alguna entidad podría ser más específico que su tipo actual.

Las *aserciones de tipo* son una forma de decirle al compilador "confía en mí, sé lo que estoy haciendo".
Una aserción de tipo es como una conversión de tipo en otros lenguajes, pero no realiza ninguna comprobación o reestructuración especial de los datos.
No tiene ningún impacto en el entorno de ejecución y exclusivamente lo utiliza el compilador.
*TypeScript* supone que tú, el programador, haz realizado las comprobaciones especiales que necesitas.

Las aserciones de tipo tienen dos formas.

Uno es la sintaxis `as`:

```ts twoslash
let someValue: unknown = "esto es una cadena";

let strLength: number = (someValue as string).length;
```

La otra versión es la sintaxis de "corchetes angulares":

```ts twoslash
let someValue: unknown = "esto es una cadena";

let strLength: number = (<string>someValue).length;
```

Los dos ejemplos son equivalentes.
Usar uno sobre el otro es principalmente una elección de preferencia; sin embargo, cuando se utiliza *TypeScript* con *JSX*, solo se permiten aserciones al estilo `as`.

## Una nota sobre `let`

Posiblemente hayas notado que hasta ahora, hemos estado usando la palabra clave `let` en lugar de la palabra clave `var` de *JavaScript* con la que podrías estar más familiarizado.
La palabra clave `let` en realidad es una construcción de *JavaScript* más nueva que *TypeScript* hace disponible.
Puedes leer en la Referencia del manual sobre [Declaración de variables](/docs/handbook/variable-declarations.html) sobre cómo `let` y `const` solucionan muchos de los problemas con `var`.

## Sobre `Number`, `String`, `Boolean`, `Symbol` y `Object`

Puede resultar tentador pensar que los tipos `Number`, `String`, `Boolean`, `Symbol` u `Object` son los mismos que los de las versiones en minúsculas recomendadas anteriormente.
Sin embargo, estos tipos no se refieren a los primitivos del lenguaje y casi nunca se deben utilizar como un tipo.

```ts twoslash
// @errors: 2339
function reverse(s: String): String {
  return s.split("").reverse().join("");
}

reverse("hello world");
```

En su lugar, utiliza los tipos `number`, `string`, `boolean`, `object` y `symbol`.

```ts twoslash
function reverse(s: string): string {
  return s.split("").reverse().join("");
}

reverse("hello world");
```
