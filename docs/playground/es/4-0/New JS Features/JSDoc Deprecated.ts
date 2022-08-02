// En 4.0, la etiqueta JSDoc @deprecated se agrega al
// sistema de tipos. Puedes usar @deprecated en cualquier lugar
// puedes utilizar JSDoc actualmente.

interface AccountInfo {
  name: string;
  gender: string;

  /** @deprecated use gender field instead */
  sex: "male" | "female";
}

declare const userInfo: AccountInfo;
userInfo.sex;

// TypeScript ofrecerá una advertencia sin bloqueo cuando se
// accede a una propiedad desaprobada, y a los editores les gusta
// vscode usará mostrar la información desaprobada en lugares
// como intellisense, esquemas y en tu código.
