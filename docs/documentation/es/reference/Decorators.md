---
title: Decoradores
layout: docs
permalink: /docs/handbook/decorators.html
oneline: Descripción general de los decoradores de TypeScript
translatable: true
---

## Introducción

<blockquote class='bg-reading'>
  <p>Lectura adicional:<br/><a href='https://saul-mirone.github.io/a-complete-guide-to-typescript-decorator/'>Una guía completa para decoradores de TypeScript</a></p>
</blockquote>

Con la introducción de *Clases* en *TypeScript* y *ES6*, ahora existen ciertos escenarios que requieren características adicionales para admitir la anotación o modificación de clases y miembros de clase.
Los decoradores proporcionan una forma de agregar anotaciones y una sintaxis de metaprogramación para las declaraciones de clase y los miembros.
Los decoradores son una [propuesta de etapa 2](https://github.com/tc39/proposal-decorators) para *JavaScript* y están disponibles como una función experimental de *TypeScript*.

> NOTA&emsp; Los decoradores son una característica experimental que puede cambiar en futuras versiones.

Para habilitar el soporte experimental para decoradores, debes habilitar la opción del compilador [`experimentalDecorators`](/tsconfig#experimentalDecorators) ya sea en la línea de comandos o en tu `tsconfig.json`:

**Línea de comandos**:

```shell
tsc --target ES5 --experimentalDecorators
```

**tsconfig.json**:

```json tsconfig
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```

## Decoradores

Un *Decorator* es un tipo especial de declaración que se puede adjuntar a una [declaración de clase](#decoradores-de-clase), [método](#decoradores-de-metodo), [descriptor de acceso](#decoradores-de-acceso), [propiedad](#decoradores-de-propiedades) o [parámetro](#-decoradores-de-parametros).
Los decoradores usan la forma `@expression`, donde `expression` debe evaluar una función que será llamada en el entorno de ejecución con información sobre la declaración decorada.

Por ejemplo, el decorador `@sealed` dado podríamos escribir la función `sealed` de la siguiente manera:

```ts
function sealed(target) {
  // hace algo con 'target' ...
}
```

## Fábrica de decoradores

Si queremos personalizar cómo se aplica un decorador a una declaración, podemos escribir una fábrica de decoradores.
Una *fábrica de decoradores* simplemente es una función que devuelve la expresión que llamará el decorador en el entorno de ejecución.

Podemos escribir una fábrica de decoradores de la siguiente manera:

```ts
function color(value: string) {
  // esta es la fábrica de decoradores, se instala
  // la función decoradora devuelta
  return function (target) {
    // este es el decorador
    // hace algo con 'target' y 'value' ...
  };
}
```

## Composición del decorador

Se pueden aplicar varios decoradores a una declaración, por ejemplo, en una sola línea:

```ts twoslash
// @experimentalDecorators
// @noErrors
function f() {}
function g() {}
// ---cut---
@f @g x
```

En varias líneas:

```ts twoslash
// @experimentalDecorators
// @noErrors
function f() {}
function g() {}
// ---cut---
@f
@g
x
```

Cuando varios decoradores se aplican a una sola declaración, su evaluación es similar a [composición de funciones en matemáticas](http://wikipedia.org/wiki/Function_composition). En este modelo, al componer funciones *f* y *g*, el compuesto resultante (*f* ∘ *g*) (*x*) es equivalente a *f* (*g* (*x*)).

Como tal, los siguientes pasos se realizan al evaluar múltiples decoradores en una sola declaración en *TypeScript*:

1. Las expresiones de cada decorador se evalúan de arriba hacia abajo.
2. A continuación, los resultados se denominan funciones de abajo hacia arriba.

Si usáramos [fábricas de decoradores](#fabricas-de-decoradores), podemos observar este orden de evaluación con el siguiente ejemplo:

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}
```

Que imprimiría esta salida en la consola:

```shell
first(): factory evaluated
second(): factory evaluated
second(): called
first(): called
```

## Evaluación del decorador

Hay un orden bien definido sobre cómo se aplican los decoradores aplicados a varias declaraciones dentro de una clase:

1. *Decoradores de parámetros*, seguido de *Método*, *Accesor* o *Decoradores de propiedad* se aplican para cada miembro de instancia.
2. Se aplican *Decoradores de parámetros*, seguidos de *Método*, *Accesor* o *Decoradores de propiedades* para cada miembro estático.
3. Los *Decoradores de parámetros* se aplican al constructor.
4. Los *Decoradores de clase* se aplican para la clase.

## Decoradores de clase

Un *Decorador de clase*  se declara justo antes de una declaración de clase.
El decorador de clase se aplica al constructor de la clase y se puede usar para observar, modificar o reemplazar una definición de clase.
Un decorador de clase no se puede usar en un archivo de declaración o en cualquier otro contexto ambiental (como en una `declare` clase).

La expresión para el decorador de clases se llamará como una función en el entorno de ejecución, con el constructor de la clase decorada como único argumento.

Si el decorador de clases devuelve un valor, reemplazará la declaración de clase con la función constructora proporcionada.

> NOTA&nbsp; Si eliges devolver una nueva función constructor, debes tener cuidado de mantener el prototipo original.
> La lógica que aplica decoradores en el entorno de ejecución **no** lo hace por ti.

El siguiente es un ejemplo de un decorador de clases (`@sealed`) aplicado a una clase `BugReport`:

```ts twoslash
// @experimentalDecorators
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
// ---cut---
@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
```

Podemos definir el decorador `@sealed` usando la siguiente declaración de función:

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
```

Cuando se ejecuta `@sealed`, sellará tanto el constructor como su prototipo y, por lo tanto, evitará que se agreguen o eliminen más funciones de esta clase dentro del entorno de ejecución accediendo a `BugReport.prototype` o definiendo propiedades en `BugReport` en sí mismo (ten en cuenta que las clases de *ES2015* en realidad son azúcar sintáctico para funciones constructor basadas en prototipos). Este decorador **no** evita que las clases deriven de `BugReport`.

A continuación, tenemos un ejemplo de cómo redefinir el constructor para establecer nuevos valores predeterminados.

<!-- prettier-ignore -->
```ts twoslash
// @errors: 2339
// @experimentalDecorators
function reportableClassDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}

@reportableClassDecorator
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

const bug = new BugReport("Needs dark mode");
console.log(bug.title); // Imprime "Necesitas el modo dark"
console.log(bug.type); // Imprime "report"

// Ten en cuenta que el decorador no cambia el tipo de TypeScript
// por lo que el sistema de tipos no conoce la nueva
// propiedad `reportingURL`:
bug.reportingURL;
```

## Decoradores de métodos

Un *Decorador de método* se declara justo antes de una declaración de método.
El decorador se aplica al *Descriptor de propiedad* para el método y se puede usar para observar, modificar o reemplazar la definición de un método.
Un decorador de método no se puede usar en un archivo de declaración, en una sobrecarga o en cualquier otro contexto ambiental (como en una`declare`  clase).

La expresión para el decorador de método se llamará como una función en el entorno de ejecución, con los siguientes tres argumentos:

1. O la función constructora de la clase para un miembro estático o el prototipo de la clase para un miembro de instancia.
2. El nombre del miembro.
3. El *Descriptor de propiedad* del miembro.

> NOTA&emsp; El *Descriptor de propiedad* será `undefined` si el destino de tu script es menor que `ES5`.

Si el decorador de método devuelve un valor, se utilizará como *Descriptor de propiedad* para el método.

> NOTA&emsp; El valor de retorno se ignora si el destino de el script es menor que `ES5`.

El siguiente es un ejemplo de un decorador de método (`@enumerable`) aplicado a un método en la clase `Greeter`:

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function enumerable(value: boolean) {
  return function (target: any,propertyKey: string,descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
// ---cut---
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

Podemos definir el decorador `@enumerable` usando la siguiente declaración de función:

<!-- prettier-ignore -->
```ts twoslash
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
```

El decorador `@enumerable(false)` aquí es una [fábrica de decoradores](#fabrica-de-decoradores).
Cuando se llama al decorador `@enumerable(false)`, modifica la propiedad `enumerable` del descriptor de propiedad.

## Decorador de accesores

Un *Decorador de accesores* se declara justo antes de una declaración de accesor.
El decorador de accesor se aplica al *Descriptor de propiedad* para el descriptor de acceso y se puede utilizar para observar, modificar o reemplazar las definiciones de un descriptor de acceso.
No se puede usar un decorador de acceso en un archivo de declaración, o en cualquier otro contexto ambiental (como en una `declare` clase).

> NOTA&emsp; TypeScript no permite decorar tanto el descriptor de acceso `get` como `set` para un solo miembro.
> En su lugar, todos los decoradores del miembro se deben aplicar al primer descriptor de acceso especificado en el orden del documento.
> Esto se debe a que los decoradores se aplican a un *Descriptor de propiedad*, que combina los accesos `get` y `set`, no cada declaración por separado.

La expresión para el decorador de acceso se llamará como una función en el entorno de ejecución, con los siguientes tres argumentos:

1. O la función constructora de la clase para un miembro estático o el prototipo de la clase para un miembro de instancia.
2. El nombre del miembro.
3. El *Descriptor de propiedad* del miembro.

> NOTA&emsp; El *Descriptor de propiedad* será `undefined` si el destino de tu script es menor que `ES5`.

Si el decorador de acceso devuelve un valor, se utilizará como *Descriptor de propiedad* para el miembro.

> NOTA&emsp; El valor de retorno se ignora si el destino de el script es menor que `ES5`.

El siguiente es un ejemplo de un decorador de acceso (`@configurable`) aplicado a un miembro de la clase `Point`:

```ts twoslash
// @experimentalDecorators
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}
// ---cut---
class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() {
    return this._x;
  }

  @configurable(false)
  get y() {
    return this._y;
  }
}
```

Podemos definir el decorador `@configurable` usando la siguiente declaración de función:

<!-- prettier-ignore -->
```ts
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}
```

## Decorador de propiedades

Un *Decorador de propiedades* se declara justo antes de una declaración de propiedad.
Un decorador de propiedades no se puede usar en un archivo de declaración o en cualquier otro contexto ambiental (como en una `declare` clase).

La expresión para el decorador de propiedades se llamará como una función en el entorno de ejecución, con los dos siguientes argumentos:

1. O la función constructora de la clase para un miembro estático o el prototipo de la clase para un miembro de instancia.
2. El nombre del miembro.

> NOTA&emsp; Un *Descriptor de propiedad* no se proporciona como argumento para un decorador de propiedades debido a cómo se inician los decoradores de propiedades en *TypeScript*.
> Esto se debe a que actualmente no existe un mecanismo para describir una propiedad de instancia al definir miembros de un prototipo, y no hay forma de observar o modificar el iniciador de una propiedad. El valor de retorno también se ignora.
> Como tal, un decorador de propiedades solo se puede usar para observar que una propiedad de un nombre específico ha sido declarada para una clase.

Podemos utilizar esta información para registrar metadatos sobre la propiedad, como en el siguiente ejemplo:

```ts
class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
```

Luego podemos definir el decorador `@format` y las funciones `getFormat` usando las siguientes declaraciones de función:

```ts
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
```

El decorador `@format("Hello,%s")` aquí es una [fábrica de decoradores](#fabrica-de-decoradores).
Cuando se llama a `@format("Hello,%s")`, agrega una entrada de metadatos para la propiedad usando la función `Reflect.metadata` de la biblioteca `reflect-metadata`.
Cuando se llama a `getFormat`, lee el valor de metadatos del formato.

> NOTA&emsp; Este ejemplo requiere la biblioteca `reflect-metadata`.
> Consulta [Metadatos](#metadatos) para obtener más información sobre la biblioteca `reflect-metadata`.

## Decorador de parámetros

Un *Decorador de parámetros* se declara justo antes de una declaración de parámetro.
El decorador de parámetros se aplica a la función para un constructor de clase o declaración de método.
Un decorador de método no se puede usar en un archivo de declaración, en una sobrecarga o en cualquier otro contexto ambiental (como en una `declare` clase).

La expresión para el decorador de método se llamará como una función en el entorno de ejecución, con los siguientes tres argumentos:

1. O la función constructora de la clase para un miembro estático o el prototipo de la clase para un miembro de instancia.
2. El nombre del miembro.
3. El índice ordinal del parámetro en la lista de parámetros de la función.

> NOTA&emsp; Un decorador de parámetros solo se puede utilizar para observar que se ha declarado un parámetro en un método.

Se ignora el valor de retorno del decorador de parámetros.

El siguiente es un ejemplo de un decorador de parámetros (`@required`) aplicado a un parámetro de un miembro de la clase `BugReport`:

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {}
function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {}
// ---cut---
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }

  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
     return this.title; 
    }
  }
}
```

Luego podemos definir los decoradores `@required` y `@ validate` usando las siguientes declaraciones de función:

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
// @emitDecoratorMetadata
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;

  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}
```

El decorador `@required` agrega una entrada de metadatos que marca el parámetro como requerido.
El decorador `@validate` luego envuelve el método `greet` existente en una función que valida los argumentos antes de invocar al método original.

> NOTA&emsp; Este ejemplo requiere la biblioteca `reflect-metadata`.
> Consulta [Metadatos](#metadatos) para obtener más información sobre la biblioteca `reflect-metadata`.

## Metadatos

Algunos ejemplos usan la biblioteca `reflect-metadata` que agrega un `polyfill` para una [*API* de metadatos experimental](https://github.com/rbuckton/ReflectDecorators).
Esta biblioteca aún no forma parte del estándar *ECMAScript* (*JavaScript*).
Sin embargo, una vez que los decoradores se adopten oficialmente como parte del estándar *ECMAScript*, estas extensiones se propondrán para su adopción.

Puedes instalar esta biblioteca a través de `npm`:

```shell
npm i reflect-metadata --save
```

*TypeScript* incluye soporte experimental para emitir ciertos tipos de metadatos para declaraciones que tienen decoradores.
Para habilitar este soporte experimental, debes configurar la opción del compilador [`emitDecoratorMetadata`](/tsconfig#emitDecoratorMetadata) en la línea de comandos o en tu `tsconfig.json`:

**Línea de comandos**:

```shell
tsc --target ES5 --experimentalDecorators --emitDecoratorMetadata
```

**tsconfig.json**:

```json tsconfig
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Cuando está habilitado, siempre que se haya importado la biblioteca `reflect-metadata`, se expondrá información adicional de tipo en tiempo de diseño en el entorno de ejecución.

Podemos ver esto en acción en el siguiente ejemplo:

<!-- prettier-ignore -->
```ts twoslash
// @emitDecoratorMetadata
// @experimentalDecorators
// @strictPropertyInitialization: false
import "reflect-metadata";

class Point {
  constructor(public x: number, public y: number) {}
}

class Line {
  private _start: Point;
  private _end: Point;

  @validate
  set start(value: Point) {
    this._start = value;
  }

  get start() {
    return this._start;
  }

  @validate
  set end(value: Point) {
    this._end = value;
  }

  get end() {
    return this._end;
  }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  let set = descriptor.set!;
  
  descriptor.set = function (value: T) {
    let type = Reflect.getMetadata("design:type", target, propertyKey);

    if (!(value instanceof type)) {
      throw new TypeError(`Invalid type, got ${typeof value} not ${type.name}.`);
    }

    set.call(this, value);
  };
}

const line = new Line()
line.start = new Point(0, 0)

// @ts-ignore
// line.end = {}

// Falla en el entorno de ejecución con:
// > Tipo no válido, el objeto obtenido no es Point

```

El compilador de *TypeScript* inyectará información de tipo en tiempo de diseño utilizando el decorador `@Reflect.metadata`.
Lo podrías considerar el equivalente del siguiente *TypeScript*:

```ts
class Line {
  private _start: Point;
  private _end: Point;

  @validate
  @Reflect.metadata("design:type", Point)
  set start(value: Point) {
    this._start = value;
  }
  get start() {
    return this._start;
  }

  @validate
  @Reflect.metadata("design:type", Point)
  set end(value: Point) {
    this._end = value;
  }
  get end() {
    return this._end;
  }
}
```

> NOTA&emsp; Los metadatos del decorador son una función experimental y pueden introducir cambios importantes en versiones futuras.
