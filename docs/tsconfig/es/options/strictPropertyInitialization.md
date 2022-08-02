---
display: "Iniciación de propiedad estricta"
oneline: "Comprueba las propiedades de la clase que están declaradas pero no establecidas en el constructor."
---

Cuando se establece en `true`, *TypeScript* generará un error cuando se declaró una propiedad de clase pero no se estableció en el constructor.

```ts twoslash
// @errors: 2564
class UserAccount {
  name: string;
  accountType = "user";

  email: string;
  address: string | undefined;

  constructor(name: string) {
    this.name = name;
    // Ten en cuenta que this.email no está configurado
  }
}
```

En el caso anterior:

- `this.name` se establece específicamente.
- `this.accountType` está configurado de forma predeterminada.
- `this.email` no está configurado y genera un error.
- `this.address` se declara como potencialmente `undefined`, lo cual significa que no es necesario establecerlo.
