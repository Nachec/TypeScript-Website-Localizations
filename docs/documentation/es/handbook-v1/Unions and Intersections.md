---
title: Uniones y tipos intersección
layout: docs
permalink: /docs/handbook/unions-and-intersections.html
oneline: Cómo usar uniones y tipos intersección en TypeScript
handbook: "true"
deprecated_by: /docs/handbook/2/everyday-types.html#union-types
# prettier-ignore
deprecation_redirects: [
  discriminating-unions, /docs/handbook/2/narrowing.html#discriminated-unions
]
---

Hasta ahora, el manual ha cubierto tipos que son objetos atómicos.
Sin embargo, a medida que modelas más tipos, te encuentras buscando herramientas que te permitan componer o combinar tipos existentes en lugar de crearlos desde cero.

Los tipos intersección y unión son una de las formas en que puedes componer tipos.

## Tipos unión

Ocasionalmente, te encontrarás con una biblioteca que espera que un parámetro sea un `number` o un `string`.
Por ejemplo, veamos la siguiente función:

```ts twoslash
/**
 * Toma una cadena y agrega "padding" a la izquierda.
 * Si 'padding' es una cadena, entonces 'padding' se agrega al lado izquierdo.
 * Si 'padding' es un número, entonces ese número de espacios se agrega al lado izquierdo.
 */
function padLeft(value: string, padding: any) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${typeof padding}'.`);
}

padLeft("Hello world", 4); // devuelve "    Hello world"
```

El problema con `padLeft` en el ejemplo anterior es que su parámetro `padding` se escribe como `any`.
Eso significa que podemos llamarla con un argumento que no sea ni un `number` ni un `string`, pero *TypeScript* estará bien con eso.

```ts twoslash
declare function padLeft(value: string, padding: any): string;
// ---cut---
// pasa en tiempo de compilación, falla en el entorno de ejecución.
let indentedString = padLeft("Hello world", true);
```

En el código tradicional orientado a objetos, podríamos abstraernos sobre los dos tipos creando una jerarquía de tipos.
Si bien esto es mucho más explícito, también es un poco exagerado.
Una de las cosas buenas de la versión original de `padLeft` era que podíamos pasar primitivos.
Eso significaba que su uso era simple y conciso.
Este nuevo enfoque tampoco ayudaría si intentáramos utilizar una función que ya existe en otro lugar.

En lugar de `any`, podemos usar un *tipo union* para el parámetro `padding`:

```ts twoslash
// @errors: 2345
/**
 * Toma una cadena y agrega "padding" a la izquierda.
 * Si 'padding' es una cadena, entonces 'padding' se agrega al lado izquierdo.
 * Si 'padding' es un número, entonces ese número de espacios se agrega al lado izquierdo.
 */
function padLeft(value: string, padding: string | number) {
  // ...
}

let indentedString = padLeft("Hello world", true);
```

Un tipo unión describe un valor que puede ser uno de varios tipos.
Usamos la barra vertical (`|`) para separar cada tipo, por lo que `number | string | boolean` es el tipo de un valor que puede ser un `number`, un `string` o un `boolean`.

## Campos comunes con unión

Si tenemos un valor que es un tipo unión, solo podemos acceder a los miembros que son comunes a todos los tipos de la unión.

```ts twoslash
// @errors: 2339

interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

declare function getSmallPet(): Fish | Bird;

let pet = getSmallPet();
pet.layEggs();

// Solo disponible en uno de los dos tipos posibles
pet.swim();
```

Los tipos unión pueden ser un poco difíciles aquí, pero solo se necesita un poco de intuición para acostumbrarse.
Si un valor tiene el tipo `A | B`, solo sabemos por *cierto* que tiene miembros que tienen tanto `A` *y* `B`.
En este ejemplo, `Bird` tiene un miembro nombrado `fly`.
No podemos estar seguros de si una variable de tipo `Bird | Fish` tiene un método `fly`.
Si la variable realmente es un `Fish` en el entorno de ejecución, la llamada a `pet.fly()` fallará.

## Uniones discriminatorias

Una técnica común para trabajar con uniones es tener un solo campo que use tipos literales que puedes usar para permitir que *TypeScript* reduzca el posible tipo actual. Por ejemplo, vamos a crear una unión de tres tipos que tienen un solo campo compartido.

```ts
type NetworkLoadingState = {
  estado: "loading";
};

type NetworkFailedState = {
  estado: "failed";
  codigo: number;
};

type NetworkSuccessState = {
  estado: "success";
  response: {
    title: string;
    duration: number;
    summary: string;
  };
};

// Crea un tipo que representa solo uno de los tipos anteriores
// pero aún no estás seguro de cuál es.
type NetworkState =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState;
```

<style type="text/css">
.markdown table.tg  {
  border-collapse:collapse;
  width: 100%;
  text-align: center;
  display: table;
}

.tg th {
  border-bottom: 1px solid black;
  padding: 8px;
  padding-bottom: 0;
}

.tg tbody, .tg tr {
  width: 100%;
}

.tg .highlight {
  background-color: #F3F3F3;
}

@media (prefers-color-scheme: dark) {
  .tg .highlight {
    background-color: #424242;
  }
}

</style>

Todos los tipos anteriores tienen un campo llamado `state`, y luego también tienen sus propios campos:

<table class='tg' width="100%">
  <tbody>
    <tr>
      <th><code>NetworkLoadingState</code></th>
      <th><code>NetworkFailedState</code></th>
      <th><code>NetworkSuccessState</code></th>
    </tr>
    <tr class='highlight'>
      <td>state</td>
      <td>state</td>
      <td>state</td>
    </tr>
    <tr>
      <td></td>
      <td>code</td>
      <td>response</td>
    </tr>
    </tbody>
</table>

Dado que el campo `state` es común en todos los tipos dentro de `NetworkState` ⏤ es seguro que su código acceda sin una verificación de existencia.

Con `state` como tipo literal, puedes comparar el valor de `state` con la cadena equivalente y *TypeScript* sabrá qué tipo se está utilizando actualmente.

<table class='tg' width="100%">
  <tbody>
    <tr>
      <th><code>NetworkLoadingState</code></th>
      <th><code>NetworkFailedState</code></th>
      <th><code>NetworkSuccessState</code></th>
    </tr>
    <tr>
      <td><code>"loading"</code></td>
      <td><code>"failed"</code></td>
      <td><code>"success"</code></td>
    </tr>
    </tbody>
</table>

En este caso, puedes usar una instrucción `switch` para delimitar qué tipo se representa en el entorno de ejecución:

```ts twoslash
// @errors: 2339
type NetworkLoadingState = {
  estado: "loading";
};

type NetworkFailedState = {
  estado: "failed";
  codigo: number;
};

type NetworkSuccessState = {
  estado: "success";
  response: {
    title: string;
    duration: number;
    summary: string;
  };
};
// ---cut---
type NetworkState =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState;

function logger(state: NetworkState): string {
  // En este momento TypeScript no sabe cuál de los tres
  // potenciales tipos de estado podría ser.

  // Intenta acceder a una propiedad que no se comparte
  // en todos los tipos generará un error
  state.code;

  // Al activar el estado, TypeScript puede reducir la unión
  // abajo en el análisis de flujo de código
  switch (state.state) {
    case "loading":
      return "Downloading...";
    case "failed":
      // El tipo aquí debe ser NetworkFailedState,
      // así que acceder al campo `code` es seguro
      return `Error ${state.code} downloading`;
    case "success":
      return `Downloaded ${state.response.title} ⏤ ${state.response.summary}`;
  }
}
```

## Comprobación de la exhaustividad de la unión

Nos gustaría que el compilador nos dijera cuándo no cubrimos todas las variantes de la unión discriminada.
Por ejemplo, si agregamos `NetworkFromCachedState` a `NetworkState`, también necesitamos actualizar `logger`:

```ts twoslash
// @errors: 2366
type NetworkLoadingState = { state: "loading" };
type NetworkFailedState = { state: "failed"; code: number };
type NetworkSuccessState = {
  estado: "success";
  response: {
    title: string;
    duration: number;
    summary: string;
  };
};
// ---cut---
type NetworkFromCachedState = {
  estado: "from_cache";
  id: string;
  response: NetworkSuccessState["response"];
};

type NetworkState =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState
  | NetworkFromCachedState;

function logger(s: NetworkState) {
  switch (s.state) {
    case "loading":
      return "loading request";
    case "failed":
      return `failed with code ${s.code}`;
    case "success":
      return "got response";
  }
}
```

Hay dos maneras de hacer esto
La primera es activar [`strictNullChecks`](/tsconfig#strictNullChecks) y especificar un tipo de retorno:

```ts twoslash
// @errors: 2366
type NetworkLoadingState = { state: "loading" };
type NetworkFailedState = { state: "failed"; code: number };
type NetworkSuccessState = { state: "success" };
type NetworkFromCachedState = { state: "from_cache" };

type NetworkState =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState
  | NetworkFromCachedState;

// ---cut---
function logger(s: NetworkState): string {
  switch (s.state) {
    case "loading":
      return "loading request";
    case "failed":
      return `failed with code ${s.code}`;
    case "success":
      return "got response";
  }
}
```

Debido a que `switch` ya no es exhaustivo, *TypeScript* es consciente de que la función a veces podría regresar `undefined`.
Si tienes un tipo de retorno `string` explícito, obtendrás un error de que el tipo de retorno en realidad es `string | undefined`.
Sin embargo, este método es bastante sutil y, además, [`strictNullChecks`](/tsconfig#strictNullChecks) no siempre funciona con código antiguo.

El segundo método usa el tipo `never` que el compilador usa para revisar la exhaustividad:

```ts twoslash
// @errors: 2345
type NetworkLoadingState = { state: "loading" };
type NetworkFailedState = { state: "failed"; code: number };
type NetworkSuccessState = { state: "success" };
type NetworkFromCachedState = { state: "from_cache" };

type NetworkState =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState
  | NetworkFromCachedState;
// ---cut---
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function logger(s: NetworkState): string {
  switch (s.state) {
    case "loading":
      return "loading request";
    case "failed":
      return `failed with code ${s.code}`;
    case "success":
      return "got response";
    default:
      return assertNever(s);
  }
}
```

Aquí, `assertNever` comprueba que `f` son de tipo `never` ─ el tipo que queda después de que se hayan eliminado todos los demás casos.
Si olvidas un caso, entonces `f` tendrá un tipo real y obtendrás un error de tipo.
Este método requiere que definas una función adicional, pero es mucho más obvio cuando lo olvidas porque el mensaje de error incluye el nombre del tipo que falta.

## Tipos intersección

Los tipos intersección están estrechamente relacionados con los tipos unión, pero se usan de manera muy diferente.
Un tipo intersección combina múltiples tipos en uno.
Esto te permite agregar tipos existentes para obtener un solo tipo que tenga todas las características que necesitas.
Por ejemplo, `Person & Serializable & Loggable` es un tipo que es todo de `Person`, `Serializable` *y* `Loggable`.
Eso significa que un objeto de este tipo tendrá todos los miembros de los tres tipos.

Por ejemplo, si tienes solicitudes de red con un manejo de errores consistente, entonces puedes separar el manejo de errores en su propio tipo, que se fusiona con los tipos que corresponden a un solo tipo de respuesta.

```ts twoslash
interface ErrorHandling {
  success: boolean;
  error?: { mensaje: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

interface ArtistsData {
  artists: { name: string }[];
}

// Estas interfaces están compuestas para tener
// consistente manejo de errores y sus propios datos.

type ArtworksResponse = ArtworksData & ErrorHandling;
type ArtistsResponse = ArtistsData & ErrorHandling;

const handleArtistsResponse = (response: ArtistsResponse) => {
  if (response.error) {
    console.error(response.error.message);
    return;
  }

  console.log(response.artists);
};
```
