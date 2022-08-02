// # Fusión nula
//
// Este es un nuevo operador `??` que está destinado a aumentar
// el uso común de `||` de la misma manera `===` aumenta `==`
// como una forma de igualdad más estricta.
//
// Para entenderlo, veamos cómo trabaja ||:

const response = {
  nullValue: null,
  headerText: "",
  animationDuration: 0,
  height: 400,
  showSplashScreen: false,
} as const;

const undefinedValue = response.undefinedValue || "some other default";
// Esto sería: 'some other default'

const nullValue = response.nullValue || "some other default";

// Estos dos ejemplos funcionan de manera similar en la mayoría de los lenguajes. Como herramienta || es
// bastante bueno para hacer cosas predeterminadas, pero las comprobaciones falsas
// de JavaScript pueden sorprenderte por algunos valores comunes:

// Potencialmente involuntario. '' es falso, resultado: 'Hello, world!'
const headerText = response.headerText || "Hello, world!";

// Potencialmente involuntario. 0 es falso, resultado: 300
const animationDuration = response.animationDuration || 300;

// Potencialmente involuntario. false es falso, resultado: true
const showSplashScreen = response.showSplashScreen || true;

// Al cambiar a usar ?? en su lugar, se usa la igualdad ===
// para comparar los dos lados:

const emptyHeaderText = response.headerText ?? "Hello, world!";
const zeroAnimationDuration = response.animationDuration ?? 300;
const skipSplashScreen = response.showSplashScreen ?? true;
