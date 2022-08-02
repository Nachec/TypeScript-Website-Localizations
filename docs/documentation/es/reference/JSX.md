---
title: JSX
layout: docs
permalink: /docs/handbook/jsx.html
oneline: Usar JSX con TypeScript
translatable: true
---

[*JSX*](https://facebook.github.io/jsx/) es una sintaxis similar a *XML* incrustable.
Está destinado a ser transformado en *JavaScript* válido, aunque la semántica de esa transformación es específica de la implementación.
*JSX* ganó popularidad con el marco [*React*](https://reactjs.org/), pero desde entonces también ha visto otras implementaciones.
*TypeScript* admite la incrustación, la verificación de tipos y la compilación de *JSX* directamente en *JavaScript*.

## Uso básico

Para utilizar *JSX* debes hacer dos cosas.

1. Nombra tus archivos con una extensión `.tsx`
2. Habilita la opción [`jsx`](/tsconfig#jsx)

*TypeScript* se envía con tres modos *JSX*: `preserve`, `react` y `react-native`.
Estos modos solo afectan la etapa de emisión ⏤ la comprobación de tipo no se ve afectada.
El modo `preserve` mantendrá el *JSX* como parte de la salida para ser consumido por otro paso de transformación (por ejemplo, [*Babel*](https://babeljs.io/)).
Además, la salida tendrá una extensión de archivo `.jsx`.
El modo `react` emitirá `React.createElement`, no necesita pasar por una transformación *JSX* antes de su uso, y la salida tendrá una extensión de archivo `.js`.
El modo `react-native` es el equivalente de `preserve` en el sentido de que mantiene todo *JSX*, pero la salida tendrá una extensión de archivo `.js`.

| Modo | Entrada | Salida | Extensión del archivo de salida |
| -------------- | ---- | ----------- | ----------- |
| `preserve`     | `<div />` | `<div />`                                         | `.jsx`                |
| `react`        | `<div />` | `React.createElement("div")`                      | `.js`                 |
| `react-native` | `<div />` | `<div />`                                         | `.js`                 |
| `react-jsx`    | `<div />` | `_jsx("div", {}, void 0);`                        | `.js`                 |
| `react-jsxdev` | `<div />` | `_jsxDEV("div", {}, void 0, false, {...}, this);` | `.js`                 |

Puedes especificar este modo usando el indicador de la línea de comandos [`jsx`](/tsconfig#jsx) o la opción correspondiente [`jsx` en tu archivo `tsconfig.json`](/tsconfig#jsx).

> \*Nota: Puedes especificar la función de fábrica *JSX* que se utilizará al apuntar a *react JSX emit* con la opción [`jsxFactory`](/tsconfig#jsxFactory) (de manera predeterminada es `React.createElement`)

## El operador `as`

Recuerda cómo escribir una aserción de tipo:

```ts
const foo = <foo>bar;
```

Esto acierta que la variable `bar` tiene el tipo `foo`.
Dado que *TypeScript* también usa corchetes angulares para las aserciones de tipo, combinarlo con la sintaxis de *JSX* introduciría ciertas dificultades de análisis. Como resultado, *TypeScript* no permite las aserciones de tipo con corchetes angulares en archivos `.tsx`.

Dado que la sintaxis anterior no se puede usar en archivos `.tsx`, se debe usar un operador de aserción de tipo alternativo: `as`.
El ejemplo se puede reescribir fácilmente con el operador `as`.

```ts
const foo = bar as foo;
```

El operador `as` está disponible en archivos `.ts` y `.tsx`, y es idéntico en comportamiento al estilo de aserción de tipo de corchetes angulares.

## Comprobación de tipo

Para comprender la comprobación de tipos con *JSX*, primero debes comprender la diferencia entre los elementos intrínsecos y los elementos basados ​​en valores.
Dada una expresión *JSX* `<expr />`, `expr` se puede referir a algo intrínseco al entorno (por ejemplo, un `div` o `span` en un entorno *DOM*) o a un componente personalizado que hayas creado.
Esto es importante por dos razones:

1. Para *React*, los elementos intrínsecos se emiten como cadenas (`React.createElement("div")`), mientras que un componente que hayas creado no es (`React.createElement(MyComponent)`).
2. Los tipos de atributos que se pasan en el elemento *JSX* se deben buscar de manera diferente.
   Los atributos intrínsecos de los elementos se deben conocer *intrínsecamente*, mientras que los componentes probablemente deseen especificar su propio conjunto de atributos.

*TypeScript* usa la [misma convención que hace *React*](http://facebook.github.io/react/docs/jsx-in-depth.html#html-tags-vs.-react-components) para distinguir entre estos.
Un elemento intrínseco siempre comienza con una letra minúscula y un elemento basado en valores siempre comienza con una letra mayúscula.

## Elementos intrínsecos

Los elementos intrínsecos se buscan en la interfaz especial `JSX.IntrinsicElements`.
De forma predeterminada, si no se especificas esta interfaz, todo vale y los elementos intrínsecos no comprobarán el tipo.
Sin embargo, si esta interfaz *está* presente, entonces el nombre del elemento intrínseco se busca como una propiedad en la interfaz `JSX.IntrinsicElements`.
Por ejemplo:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
  }
}

<foo />; // Bien
<bar />; // error
```

En el ejemplo anterior, `<foo />` funcionará bien pero `<bar />` dará como resultado un error ya que no se ha especificado en `JSX.IntrinsicElements`.

> Nota: También puedes especificar un indexador de cadenas `catch-all` en `JSX.IntrinsicElements` de la siguiente manera:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
```

## Elementos basados ​​en valores

Los elementos basados ​​en valores simplemente se buscan mediante identificadores que están dentro del alcance.

```ts
import MyComponent from "./myComponent";

<MyComponent />; // Bien
<SomeOtherComponent />; // error
```

Hay dos formas de definir un elemento basado en valores:

1. Componente de función (CF)
2. Componente de clase

Debido a que estos dos tipos de elementos basados ​​en valores son indistinguibles entre sí en una expresión *JSX*, primero *TS* intenta resolver la expresión como un *Componente de función* utilizando la resolución de sobrecarga. Si el proceso tiene éxito, *TS* termina de resolver la expresión en su declaración. Si el valor no se resuelve como un componente de función, *TS* intentará resolverlo como un *componente de clase*. Si eso falla, *TS* informará un error.

### *Componente de función*

Como sugiere el nombre, el componente se define como una función de *JavaScript* donde su primer argumento es un objeto `props`.
*TS* obliga a que su tipo de retorno se pueda asignar a `JSX.Element`.

```ts
interface FooProp {
  name: string;
  X: number;
  Y: number;
}

declare function AnotherComponent(prop: { name: string });
function ComponentFoo(prop: FooProp) {
  return <AnotherComponent name={prop.name} />;
}

const Button = (prop: { value: string }, context: { color: string }) => (
  <button />
);
```

Debido a que un componente de función es simplemente una función *JavaScript*, las sobrecargas de funciones también se pueden usar aquí:

```ts twoslash
// @noErrors
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// ---cut---
interface ClickableProps {
  children: JSX.Element[] | JSX.Element;
}

interface HomeProps extends ClickableProps {
  home: JSX.Element;
}

interface SideProps extends ClickableProps {
  side: JSX.Element | string;
}

function MainButton(prop: HomeProps): JSX.Element;
function MainButton(prop: SideProps): JSX.Element;
function MainButton(prop: ClickableProps): JSX.Element {
  // ...
}
```

> Nota: Los *componentes de función* se conocían anteriormente como *componentes de función sin estado* (`SFC`). Como los *componentes de función* ya no se pueden considerar sin estado en las versiones recientes de *react*, el tipo `SFC` y su alias `StatelessComponent` quedaron obsoletos.

### Componente de clase

Es posible definir el tipo de componente de una clase.
Sin embargo, para hacerlo, es mejor comprender dos nuevos términos: el *tipo de clase de elemento* y el *tipo de instancia de elemento*.

Dada la `<Expr />`, el *tipo de clase de elemento* es el tipo de `Expr`.
Entonces, en el ejemplo anterior, si `MyComponent` fuera una clase *ES6*, el tipo de clase sería el constructor y la estática de esa clase.
Si `MyComponent` fuera una función de fábrica, el tipo de clase sería esa función.

Una vez que se establece el tipo de clase, el tipo de instancia se determina mediante la unión de los tipos de retorno de la construcción del tipo de clase o firmas de llamada (lo que esté presente).
Entonces, nuevamente, en el caso de una clase *ES6*, el tipo de instancia sería el tipo de una instancia de esa clase, y en el caso de una función de fábrica, sería el tipo del valor devuelto por la función.

```ts
class MyComponent {
  render() {}
}

// usa una firma de construcción
const myComponent = new MyComponent();

// tipo de clase de elemento => MyComponent
// tipo de instancia de elemento => {render: () => void }

function MyFactoryFunction() {
  return {
    render: () => {},
  };
}

// usa una firma de llamada
const myComponent = MyFactoryFunction();

// tipo de clase de elemento => MyFactoryFunction
// tipo de instancia de elemento => {render: () => void }
```

El tipo de instancia del elemento es interesante porque debe ser asignable a `JSX.ElementClass` o resultará en un error.
De manera predeterminada, `JSX.ElementClass` es `{}`, pero se puede extender para limitar el uso de *JSX* solo a los tipos que se ajustan a la interfaz adecuada.

```ts
declare namespace JSX {
  interface ElementClass {
    render: any;
  }
}

class MyComponent {
  render() {}
}
function MyFactoryFunction() {
  return { render: () => {} };
}

<MyComponent />; // Bien
<MyFactoryFunction />; // Bien

class NotAValidComponent {}
function NotAValidFactoryFunction() {
  return {};
}

<NotAValidComponent />; // error
<NotAValidFactoryFunction />; // error
```

## Comprobar el tipo del atributo

El primer paso para comprobar el tipo de los atributos es determinar el *tipo de los atributos del elemento*.
Esto es ligeramente diferente entre elementos intrínsecos y basados ​​en valores.

Para elementos intrínsecos, es el tipo de la propiedad en `JSX.IntrinsicElements`

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: { bar?: boolean };
  }
}

// El tipo de los atributos del elemento para 'foo' es '{bar ?: boolean}'
<foo bar />;
```

Para los elementos basados ​​en valores, es un poco más complejo.
Está determinado por el tipo de propiedad en el *tipo de instancia del elemento* que se determinó previamente.
La propiedad a utilizar está determinada por `JSX.ElementAttributesProperty`.
Se sebe declarar con una sola propiedad.
Luego se usa el nombre de esa propiedad.
A partir de *TypeScript 2.8*, si no se proporciona `JSX.ElementAttributesProperty`, se utilizará en su lugar el tipo de primer parámetro del constructor del elemento de clase o la llamada del *Componente de función*.

```ts
declare namespace JSX {
  interface ElementAttributesProperty {
    props; // especifica el nombre de la propiedad a utilizar
  }
}

class MyComponent {
  // especifica la propiedad en el tipo de instancia del elemento
  props: {
    foo?: string;
  };
}

// El tipo de atributos de elemento para 'MyComponent' es '{foo?: string}'
<MyComponent foo="bar" />;
```

El tipo de atributo de elemento se usa para comprobar los atributos en el *JSX*.
Se admiten propiedades opcionales y requeridas.

```ts
declare namespace JSX {
  interface IntrinsicElements {
    foo: { requiredProp: string; optionalProp?: number };
  }
}

<foo requiredProp="bar" />; // Bien
<foo requiredProp="bar" optionalProp={0} />; // Bien
<foo />; // error, requiredProp is missing
<foo requiredProp={0} />; // error, requiredProp debe ser una cadena
<foo requiredProp="bar" unknownProp />; // error, unknownProp no existe
<foo requiredProp="bar" some-unknown-prop />; // ok, porque 'some-unknown-prop' no es un identificador válido
```

> Nota: Si un nombre de atributo no es un identificador *JS* válido (como un atributo `data-*`), no se considera un error si no se encuentra en el tipo de atributos del elemento.

Además, la interfaz `JSX.IntrinsicAttributes` se puede usar para especificar propiedades adicionales utilizadas por el marco *JSX* que generalmente no son utilizadas por los apoyos o argumentos de los componentes. por ejemplo, `key` en *React*. Especializándose aún más, el tipo genérico `JSX.IntrinsicClassAttributes<T>` también se puede usar para especificar el mismo tipo de atributos adicionales solo para los componentes de la clase (y no los *Componentes de función*). En este tipo, el parámetro genérico corresponde al tipo de instancia de clase. En *React*, esto se usa para permitir el atributo `ref` de tipo `Ref<T>`. En términos generales, todas las propiedades de estas interfaces deben ser opcionales, a menos que tengas la intención de que los usuarios de tu marco *JSX* necesiten proporcionar algún atributo en cada etiqueta.

El operador de propagación también funciona:

```ts
const props = { requiredProp: "bar" };
<foo {...props} />; // Bien

const badProps = {};
<foo {...badProps} />; // error
```

## Control de tipo de los descendientes

En *TypeScript 2.3*, *TS* introdujo la comprobación de tipos de *descendientes*. *descendientes* es una propiedad especial en un *tipo de atributos de elemento* donde se toman las `JSXExpression`s descendientes para insertarlas en los atributos.
De manera similar a como *TS* usa `JSX.ElementAttributesProperty` para determinar el nombre de `props`, *TS* usa `JSX.ElementChildrenAttribute` para determinar el nombre de `children` dentro de esas `props`.
`JSX.ElementChildrenAttribute` se debe declarar con una sola propiedad.

```ts
declare namespace JSX {
  interface ElementChildrenAttribute {
    children: {}; // especifica el nombre de children a usar
  }
}
```

```ts
<div>
  <h1>Hello</h1>
</div>;

<div>
  <h1>Hello</h1>
  World
</div>;

const CustomComp = (props) => <div>{props.children}</div>
<CustomComp>
  <div>Hello World</div>
  {"This is just a JS expression..." + 1000}
</CustomComp>
```

Puedes especificar el tipo de `children` como cualquier otro atributo. Esto redefinirá el tipo predeterminado de, por ejemplo, [*React types*](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) si los usas.

```ts
interface PropsType {
  children: JSX.Element
  name: string
}

class Component extends React.Component<PropsType, {}> {
  render() {
    return (
      <h2>
        {this.props.children}
      </h2>
    )
  }
}

// Bien
<Component name="foo">
  <h1>Hello World</h1>
</Component>

// Error: children es de tipo JSX.Element no arreglo de JSX.Element
<Component name="bar">
  <h1>Hello World</h1>
  <h2>Hello World</h2>
</Component>

// Error: children es de tipo JSX.Element, no arreglo de JSX.Element o string.
<Component name="baz">
  <h1>Hello</h1>
  World
</Component>
```

## El tipo de resultado *JSX*

De forma predeterminada, el resultado de una expresión *JSX* se escribe como `any`.
Puedes personalizar el tipo especificando la interfaz `JSX.Element`.
Sin embargo, no es posible recuperar información de tipo sobre el elemento, los atributos o `children` del *JSX* desde esta interfaz.
Es una caja negra.

## Incrustar expresiones

*JSX* te permite incrustar expresiones entre etiquetas rodeando las expresiones con llaves (`{}`).

```ts
const a = (
  <div>
    {["foo", "bar"].map((i) => (
      <span>{i / 2}</span>
    ))}
  </div>
);
```

El código anterior resultará en un error ya que no puedes dividir una cadena por un número.
La salida, cuando se usa la opción `preserve`, se ve así:

```ts
const a = (
  <div>
    {["foo", "bar"].map(function (i) {
      return <span>{i / 2}</span>;
    })}
  </div>
);
```

## Integración *React*

Para usar *JSX* con *React*, debes usar [*React types*](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react).
Estas tipificaciones definen el espacio de nombres `JSX` apropiadamente para su uso con *React*.

```ts
/// <reference path="react.d.ts" />

interface Props {
  foo: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>;
  }
}

<MyComponent foo="bar" />; // Bien
<MyComponent foo={0} />; // error
```

### Configurar *JSX*

Hay varios indicadores del compilador que se pueden usar para personalizar tu *JSX*, que funcionan como un indicador del compilador y a través de pragmas en línea por archivo. Para obtener más información, consulta las páginas de referencia de `tsconfig`:

- [`jsxFactory`](/tsconfig/#jsxFactory)
- [`jsxFragmentFactory`](/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](/tsconfig#jsxImportSource)
