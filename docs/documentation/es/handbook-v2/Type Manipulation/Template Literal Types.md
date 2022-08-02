---
title: Tipos de plantillas literales
layout: docs
permalink: /docs/handbook/2/template-literal-types.html
oneline: "Generar tipos de mapeo que cambian las propiedades mediante cadenas de plantilla literales."
---

Los tipos de plantillas literales se basan en [tipos de cadenas literales](/docs/handbook / 2 / daily-types.html # literal-types) y tienen la capacidad de expandirse en muchas cadenas a través de uniones.

Tienen la misma sintaxis que [cadenas de plantilla literales en *JavaScript*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals), pero se utilizan en posiciones de tipo.
Cuando se usan con tipos de concretos  literales, una plantilla literal produce un nuevo tipo de cadena literal al concatenar el contenido.

```ts twoslash
type World = "world";

type Greeting = `hello ${World}`;
//   ^?
```

Cuando se usa una unión en la posición interpolada, el tipo es el conjunto de cada literal de cadena posible que podría ser representado por cada miembro de la unión:

```ts twoslash
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
//   ^?
```

Para cada posición interpolada en la plantilla literal, las uniones se multiplican de forma cruzada:

```ts twoslash
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
// ---cut---
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
type Lang = "en" | "ja" | "pt";

type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
//   ^?
```

En general, recomendamos que las personas utilicen la generación anticipada para uniones de grandes cadenas, pero esto es útil en casos más pequeños.

### Uniones de cadena en tipos

El poder de las plantilla literales viene al definir una nueva cadena basada en una cadena existente dentro de un tipo.

Considera el caso en el que una función (`makeWatchedObject`) agrega una nueva función
llamada `on()` a un objeto pasado.  En *JavaScript*, su llamada se podría ver así:
`makeWatchedObject(baseObject)`. Podemos imaginar que el objeto base se ve
así:

```ts twoslash
// @noErrors
const passedObject = {
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
};
```

La función `on` que se agregará al objeto base espera dos argumentos, un `eventName` (una `string`) y un `callBack` (una `function`).

El `eventName` debe tener la forma `attributeInThePassedObject + "Changed"`; por lo tanto, `firstNameChanged` como derivado del atributo `firstName` en el objeto base.

La función `callBack`, cuando se llama:
  * Se debe pasar un valor del tipo asociado con el nombre `attributeInThePassedObject`; por lo tanto, dado que `firstName` se escribe como `string`, la devolución de llamada para el evento `firstNameChanged` espera que se le pase una `string` en el momento de la llamada. Del mismo modo, los eventos asociados con `age` deben esperar ser llamados con un argumento `number`
  * Debería tener el tipo de retorno `void` (para simplificar la demostración)

La firma de la función ingenua de `on()` podría ser: [parcial]on(eventName: string, callBack: (newValue: any) => void)`. Sin embargo, en la descripción anterior, identificamos restricciones de tipo importantes que nos gustaría documentar en nuestro código. Los tipos de plantilla literal nos permiten traer estas restricciones a nuestro código.

```ts twoslash
// @noErrors
declare function makeWatchedObject(obj: any): any;
// ---cut---
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

// makeWatchedObject ha agregado `on` al objeto anónimo

person.on("firstNameChanged", (newValue) => {
  console.log(`firstName was changed to ${newValue}!`);
});
```

Observa que `on` escucha el evento `"firstNameChanged"`, no solo `"firstName"`. Nuestra especificación ingenua de `on()` podría hacerse más robusta si nos aseguráramos de que el conjunto de nombres de eventos elegibles estuviera restringido por la unión de nombres de atributos en el objeto observado con "Canged" agregado al final. Si bien nos sentimos cómodos haciendo este cálculo en *JavaScript*, es decir, ``Object.keys(passedObject).map(x => `${x}Changed`)``, los literales de plantilla _dentro del sistema de tipos_ brindan un enfoque similar para la manipulación de cadenas :

```ts twoslash
type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

/// Crea un "objeto observado" con un método 'on'
/// para que puedas estar atento a los cambios en las propiedades.
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
```

Con esto, podemos construir algo que falla cuando se le da la propiedad incorrecta:

```ts twoslash
// @errors: 2345
type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
// ---cut---
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});

person.on("firstNameChanged", () => {});

// Evita errores humanos sencillos (utiliza la clave en lugar del nombre del evento)
person.on("firstName", () => {});

// Es resistente a errores de tipo
person.on("frstNameChanged", () => {});
```

### Inferencia con plantillas literales

Tenga en cuenta que no nos beneficiamos de toda la información proporcionada en el objeto original pasado. Dado el cambio de un `firstName` (es decir, un evento `firstNameChanged`), deberíamos esperar que la devolución de llamada reciba un argumento de tipo `string`. De manera similar, la devolución de llamada para un cambio a `age` debe recibir un argumento `number`. Ingenuamente estamos usando `any` para escribir el argumento `callBack`. Una vez más, los tipos literales de plantilla permiten garantizar que el tipo de datos de un atributo sea el mismo tipo que el primer argumento de devolución de llamada de ese atributo.

La idea clave que hace que esto sea posible es la siguiente: podemos usar una función con un genérico tal que:

1. El literal utilizado en el primer argumento se captura como un tipo literal
2. Ese tipo literal se puede validar como parte de la unión de atributos válidos en el genérico
3. El tipo del atributo validado se puede buscar en la estructura del genérico usando Acceso indexado
4. Esta información de tipo _luego_ se puede aplicar para asegurarse de que el argumento para
   la función de devolución de llamada es del mismo tipo.


```ts twoslash
type PropEventSource<Type> = {
    on<Key extends string & keyof Type>
        (eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void ): void;
};

declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});

person.on("firstNameChanged", newName => {
    //                        ^?
    console.log(`new name is ${newName.toUpperCase()}`);
});

person.on("ageChanged", newAge => {
    //                  ^?
    if (newAge < 0) {
        console.warn("warning! negative age");
    }
})
```

Aquí convertimos `on` en un método genérico.

Cuando un usuario llama con la cadena `"firstNameChanged'`, *TypeScript* intentará inferir el tipo correcto para `Key`.
Para hacer eso, comparará `Key` con el contenido antes de `"Changed"` e inferirá la cadena `"firstName"`.
Una vez que *TypeScript* se da cuenta de eso, el método `on` puede obtener el tipo de `firstName` en el objeto original, que es `string` en este caso.
De manera similar, cuando se llama con `"ageChanged"`, *TypeScript* encuentra el tipo de la propiedad `age` que es `number`.

La inferencia se puede combinar de diferentes formas, a menudo para deconstruir cadenas y reconstruirlas de diferentes formas.

## Tipos de manipulación intrínseca de cadenas

Para ayudar con la manipulación de cadenas, *TypeScript* incluye un conjunto de tipos que se pueden utilizar en la manipulación de cadenas. Estos tipos vienen integrados en el compilador para el rendimiento y no se pueden encontrar en los archivos `.d.ts` incluidos con *TypeScript*.

### `Uppercase<StringType>`

Convierte cada carácter de la cadena a la versión en mayúsculas.

##### Ejemplo

```ts twoslash
type Greeting = "Hello, world"
type ShoutyGreeting = Uppercase<Greeting>
//   ^?

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`
type MainID = ASCIICacheKey<"my_app">
//   ^?
```

### `Lowercase<StringType>`

Convierte cada carácter de la cadena al equivalente en minúsculas.

##### Ejemplo

```ts twoslash
type Greeting = "Hello, world"
type QuietGreeting = Lowercase<Greeting>
//   ^?

type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`
type MainID = ASCIICacheKey<"MY_APP">
//   ^?
```

### `Capitalize<StringType>`

Convierte el primer carácter de la cadena en un equivalente en mayúsculas.

##### Ejemplo

```ts twoslash
type LowercaseGreeting = "hello, world";
type Greeting = Capitalize<LowercaseGreeting>;
//   ^?
```

### `Uncapitalize<StringType>`

Convierte el primer carácter de la cadena en un equivalente en mayúsculas.

##### Ejemplo

```ts twoslash
type UppercaseGreeting = "HELLO WORLD";
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
//   ^?
```

<details>
    <summary>Detalles técnicos sobre los tipos intrínsecos de manipulación de cadenas</summary>
    <p>El código, a partir de *TypeScript 4.1*, para estas funciones intrínsecas utiliza las funciones del entorno de ejecución de cadenas *JavaScript* directamente para la manipulación y no son conscientes de la configuración regional.</p>
    <code><pre>
function applyStringMapping(symbol: Symbol, str: string) {
    switch (intrinsicTypeKinds.get(symbol.escapedName as string)) {
        case IntrinsicTypeKind.Uppercase: return str.toUpperCase();
        case IntrinsicTypeKind.Lowercase: return str.toLowerCase();
        case IntrinsicTypeKind.Capitalize: return str.charAt(0).toUpperCase() + str.slice(1);
        case IntrinsicTypeKind.Uncapitalize: return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str;
}</pre></code>
</details>
