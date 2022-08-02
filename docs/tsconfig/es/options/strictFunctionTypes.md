---
display: "Tipos function estrictos"
oneline: "Al asignar funciones, verifica que los parámetros y los valores devueltos sean compatibles con el subtipo."
---

Cuando está habilitada, esta bandera hace que los parámetros de las funciones se comprueben de manera más correcta.

Aquí hay un ejemplo básico con `strictFunctionTypes` desactivado:

```ts twoslash
// @strictFunctionTypes: false
function fn(x: string) {
  console.log("Hello, " + x.toLowerCase());
}

type StringOrNumberFunc = (ns: string | number) => void;

// Asignación insegura
let func: StringOrNumberFunc = fn;
// Llamada insegura - se estrellará
func(10);
```

Con `StrictFunctionTypes` *on*, el error se detecta correctamente:

```ts twoslash
// @errors: 2322
function fn(x: string) {
  console.log("Hello, " + x.toLowerCase());
}

type StringOrNumberFunc = (ns: string | number) => void;

// Se evita la asignación insegura
let func: StringOrNumberFunc = fn;
```

Durante el desarrollo de esta función, descubrimos una gran cantidad de jerarquías de clases intrínsecamente inseguras, incluidas algunas en el *DOM*.
Debido a esto, la configuración solo se aplica a las funciones escritas en la sintaxis `function`, no a las que tienen la sintaxis `method`:

```ts twoslash
type Methodish = {
  func(x: string | number): void;
};

function fn(x: string) {
  console.log("Hello, " + x.toLowerCase());
}

// En última instancia, una asignación insegura, pero no detectada
const m: Methodish = {
  func: fn,
};
m.func(10);
```
