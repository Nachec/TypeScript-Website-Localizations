---
display: "Sin truncamiento de errores"
oneline: "Deshabilita los tipos de truncamiento en los mensajes de error."
---

No trunca los mensajes de error.

Con `false`, el valor predeterminado.

```ts twoslash
// @errors: 2322 2454
var x: {
  propertyWithAnExceedinglyLongName1: string;
  propertyWithAnExceedinglyLongName2: string;
  propertyWithAnExceedinglyLongName3: string;
  propertyWithAnExceedinglyLongName4: string;
  propertyWithAnExceedinglyLongName5: string;
  propertyWithAnExceedinglyLongName6: string;
  propertyWithAnExceedinglyLongName7: string;
  propertyWithAnExceedinglyLongName8: string;
};

// La representación de cadena del tipo de 'x' debe estar truncada en el mensaje de error
var s: string = x;
```

Con `true`

```ts twoslash
// @errors: 2322 2454
// @noErrorTruncation: true
var x: {
  propertyWithAnExceedinglyLongName1: string;
  propertyWithAnExceedinglyLongName2: string;
  propertyWithAnExceedinglyLongName3: string;
  propertyWithAnExceedinglyLongName4: string;
  propertyWithAnExceedinglyLongName5: string;
  propertyWithAnExceedinglyLongName6: string;
  propertyWithAnExceedinglyLongName7: string;
  propertyWithAnExceedinglyLongName8: string;
};

// La representación de cadena del tipo de 'x' debe estar truncada en el mensaje de error
var s: string = x;
```
