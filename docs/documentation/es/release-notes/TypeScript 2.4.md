---
title: TypeScript 2.4
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-4.html
oneline: Notas de la versión de TypeScript 2.4
---

## Expresiones de importación dinámica

Las expresiones `import` dinámicas son una característica nueva y parte de *ECMAScript* que permite a los usuarios solicitar de forma asincrónica un módulo en cualquier punto arbitrario de tu programa.

Esto significa que puedes importar de forma condicional y diferida otros módulos y bibliotecas.
Por ejemplo, aquí hay una función `async` que solo importa una biblioteca de utilidades cuando es necesaria:

```ts
async function getZipFile(name: string, files: File[]): Promise<File> {
  const zipUtil = await import("./utils/create-zip-file");
  const zipContents = await zipUtil.getContentAsBlob(files);
  return new File(zipContents, name);
}
```

Muchos paquetes tienen soporte para dividir automáticamente paquetes de salida basados ​​en estas expresiones `import`, así que considera usar esta nueva característica con el destino del módulo `esnext`.

## Enumeraciones `string`

*TypeScript 2.4* ahora permite que los miembros de enumeración contengan iniciadores de cadena.

```ts
enum Colors {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}
```

La advertencia es que las enumeraciones iniciadas con cadena no se pueden asignar de forma inversa para obtener el nombre del miembro de la enumeración original.
En otras palabras, no puede escribir `Colors["RED"]` para obtener la cadena `"Red"`.

## Inferencia mejorada para genéricos

*TypeScript 2.4* introduce algunos cambios maravillosos en la forma en que se infieren los genéricos.

### Tipos de retorno como objetivos de inferencia

Por un lado, *TypeScript* ahora puedes hacer inferencias para el tipo de retorno de una llamada.
Esto puede mejorar tu experiencia y detectar errores.
Algo que ahora funciona:

```ts
function arrayMap<T, U>(f: (x: T) => U): (a: T[]) => U[] {
  return a => a.map(f);
}

const lengths: (a: string[]) => number[] = arrayMap(s => s.length);
```

Como ejemplo de nuevos errores, puedes detectar como resultado:

```ts
let x: Promise<string> = new Promise(resolve => {
  resolve(10);
  //      ~~ Error!
});
```

### Inferencia de parámetros de tipo a partir de tipos contextuales

Antes de *TypeScript 2.4*, en el siguiente ejemplo

```ts
let f: <T>(x: T) => T = y => y;
```

`y` tendría el tipo `any`.
Esto significaba que el programa verificaría el tipo, pero técnicamente podría hacer cualquier cosa con `y`, como lo siguiente:

```ts
let f: <T>(x: T) => T = y => y() + y.foo.bar;
```

Ese último ejemplo no es realmente seguro para los tipos.

En *TypeScript 2.4*, la función del lado derecho implícitamente *gana* parámetros de tipo, y se infiere que `y` tiene el tipo de ese parámetro de tipo.

Si usas `y` de una manera que la restricción del parámetro de tipo no es compatible, obtendrás correctamente un error.
En este caso, la restricción de `T` era (implícitamente) `{}`, por lo que el último ejemplo fallará apropiadamente.

### Comprobación más estricta de funciones genéricas

*TypeScript* ahora intenta unificar el tipo de los parámetros al comparar dos tipos de firma única.
Como resultado, obtendrás controles más estrictos al relacionar dos firmas genéricas y puede detectar algunos errores.

```ts
type A = <T, U>(x: T, y: U) => [T, U];
type B = <S>(x: S, y: S) => [S, S];

function f(a: A, b: B) {
  a = b; // Error
  b = a; // Bien
}
```

## Contravarianza estricta para los parámetros de devolución de llamada

*TypeScript* siempre ha comparado parámetros de forma bivariante.
Hay varias razones para esto, pero en general, esto no fue un gran problema para nuestros usuarios hasta que vimos algunos de los efectos adversos que tuvo con `Promise`s y `Observable`s.

*TypeScript 2.4* introduce esto más estricto cuando se relacionan dos tipos de devolución de llamada. Por ejemplo:

```ts
interface Mappable<T> {
  map<U>(f: (x: T) => U): Mappable<U>;
}

declare let a: Mappable<number>;
declare let b: Mappable<string | number>;

a = b;
b = a;
```

Antes de *TypeScript 2.4*, este ejemplo tendría éxito.
Al relacionar los tipos `map`, *TypeScript* relacionaría bidireccionalmente sus parámetros (es decir, el tipo de `f`).
Al relacionar cada `f`, *TypeScript* también relacionaría bidireccionalmente el tipo de *esos* parámetros.

Al relacionar el tipo `map` en *TS 2.4*, el lenguaje verificará si cada parámetro es un tipo de devolución de llamada y, de ser así, se asegurará de que esos parámetros se verifiquen de manera contravariante con respecto a la relación actual.

En otras palabras, *TypeScript* ahora detecta el error anterior, que puede ser un cambio importante para algunos usuarios, pero será de gran ayuda.

## Detección débil de tipo

*TypeScript 2.4* introduce el concepto de "tipos débiles".
Cualquier tipo que no contenga nada más que un conjunto de propiedades totalmente opcionales se considera *débil*.
Por ejemplo, este tipo de `Opciones` es un tipo débil:

```ts
interface Options {
  data?: string;
  tiempoTerminado?: number;
  maxRetries?: number;
}
```

En *TypeScript 2.4*, ahora es un error asignar algo a un tipo débil cuando no hay superposición en las propiedades.
Por ejemplo:

```ts
function sendMessage(options: Options) {
  // ...
}

const opts = {
  payload: "hello world!",
  retryOnFail: true
};

// ¡Error!
sendMessage(opts);
// No hay superposición entre el tipo de 'opts' y 'Options' en sí.
// Quizás queríamos usar 'data'/ 'maxRetries' en lugar de 'payload'/ 'retryOnFail'.
```

Puedes pensar en esto como que *TypeScript* "endurece" las débiles garantías de estos tipos para detectar lo que de otro modo serían errores silenciosos.

Dado que se trata de un cambio importante, es posible que debas conocer las soluciones alternativas que son las mismas que las de las comprobaciones estrictas de objetos literales:

1. Declara las propiedades si realmente existen.
2. Agrega un índice de firma al tipo débil (es decir, `[propName: string]: {}`).
3. Utiliza una aserción de tipo (es decir, `opt as Options").
