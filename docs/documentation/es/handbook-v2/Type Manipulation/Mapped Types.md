---
title: Tipos mapeados
layout: docs
permalink: /docs/handbook/2/mapped-types.html
oneline: "Generar tipos reutilizando un tipo existente."
---

Cuando no quieres repetir, a veces un tipo se debe basar en otro tipo.

Los tipos mapeados se basan en la sintaxis del índice de firmas, que se utiliza para declarar los tipos de propiedades que no se han declarado antes de tiempo:

```ts twoslash
type Horse = {};
// ---cut---
type OnlyBoolsAndHorses = {
  [key: string]: boolean | Horse;
};

const conforms: OnlyBoolsAndHorses = {
  del: true,
  rodney: false,
};
```

Un tipo mapeado es un tipo genérico que usa una unión de `PropertyKey`s (frecuentemente creado [a través de una `keyof`](/docs/handbook/2/indexed-access-types.html)) para iterar a través de las claves para crear un tipo:

```ts twoslash
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```

En este ejemplo, `OptionsFlags` tomará todas las propiedades del tipo `Type` y cambiará sus valores para que sean booleanos.

```ts twoslash
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
// ---cut---
type FeatureFlags = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<FeatureFlags>;
//   ^?
```

### Modificadores de mapeo

Hay dos modificadores adicionales que se pueden aplicar durante el mapeo: `readonly` y `? ` que afectan la mutabilidad y la opcionalidad respectivamente.

Puedes eliminar o agregar estos modificadores colocando el prefijo `-` o `+`. Si no agregas un prefijo, se asume `+`.

```ts twoslash
// Elimina los atributos `readonly` de las propiedades de un tipo
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
  readonly id: string;
  readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>;
//   ^?
```

```ts twoslash
// Elimina los atributos `readonly` de las propiedades de un tipo
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

type MaybeUser = {
  id: string;
  nombre?: string;
  age?: number;
};

type User = Concrete<MaybeUser>;
//   ^?
```

## Reasignar claves a través de `as`

A partir de *TypeScript 4.1], puedes volver a mapear claves en tipos mapeados con una cláusula `as` en un tipo mapeado:

```ts
type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as NewKeyType]: Type[Properties]
}
```

Puedes aprovechar características como [tipos de plantillas literales](/docs/handbook/2/template-literal-types.html) para crear nuevos nombres de propiedad a partir de los anteriores:

```ts twoslash
type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};

interface Person {
    name: string;
    age: number;
    location: string;
}

type LazyPerson = Getters<Person>;
//   ^?
```

Puedes filtrar las claves produciendo `never` mediante un tipo condicional:

```ts twoslash
// Elimina la propiedad 'kind'
type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};

interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
//   ^?
```

Puede mapear uniones arbitrarias, no solo uniones de `string | number | symbol`, sino uniones de cualquier tipo:

```ts twoslash
type EventConfig<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (event: E) => void;
}

type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>
//   ^?
```

### Exploración adicional

Los tipos mapeados funcionan bien con otras características en esta sección de manipulación de tipos, por ejemplo, aquí hay [un tipo mapeado que usa un tipo condicional](/docs/handbook/2/conditional-types.html) que devuelve un `true` o un `false` dependiendo de si un objeto tiene la propiedad `pii` establecida en el literal `true`:

```ts twoslash
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};

type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};

type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;
//   ^?
```
