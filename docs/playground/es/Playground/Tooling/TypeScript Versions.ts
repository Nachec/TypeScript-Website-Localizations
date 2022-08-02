// Con el nuevo Playground, tenemos mucho más control sobre
// el entorno en el que se ejecuta tu código. El nuevo PlayGround
// ahora está acoplado debidamente tanto a monaco-editor como a
// monaco-typescript que proporciona la experiencia de edición.

// https://github.com/microsoft/monaco-editor/
// https://github.com/microsoft/monaco-typescript

// Acoplamiento debidamente significa que el playground admite dejar
// a los usuarios elegir entre muchas versiones diferentes del
// compilación de TypeScript que monaco-typescript ha integrado.

// Contamos con infraestructura para construir una copia tanto de monaco-editor
// como de monaco-typescript para cualquier versión de TypeScript. Esto
// significa que ahora podemos admitir:

// - Compilaciones beta de TypeScript
// - Compilaciones nocturnas de TypeScript
// - Compilaciones Pull Request de TypeScript
// - Compilaciones más antiguas de TypeScript

// vía https://github.com/orta/make-monaco-builds

// La arquitectura fundamental de cómo el nuevo playground
// admite diferentes versiones de TypeScript provenientes del
// proyecto del cual este sitio es una bifurcación:

// https://github.com/agentcooper/typescript-play
