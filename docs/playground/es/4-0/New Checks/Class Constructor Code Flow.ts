//// { "compiler": { "ts": "4.0.2" } }

// En 4.0, utilizamos el análisis de control de flujo para
// inferir potencial el tipo de una propiedad de clase basada en
// qué valores se establecen durante el constructor.

class UserAccount {
  id; // El tipo se infiere como string | number
  constructor(isAdmin: boolean) {
    if (isAdmin) {
      this.id = "admin";
    } else {
      this.id = 0;
    }
  }
}

// En versiones anteriores de TypeScript, `id` sería
// clasificado como `any`.
