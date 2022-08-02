//// { "order": 1 }

// Sí, lo sabemos, los valores predeterminados para tsconfig de TypeScript no
// hacen tener strict activado. Sin embargo, en cada oportunidad
// ¿El equipo puede recomendar que los usuarios intenten migrar hacia
// tener el modo strict habilitado en sus configuraciones.

// Sin embargo, para el playground, podemos configurar los valores predeterminados
// para que sea strict. El playground también hará un seguimiento de los
// indicadores del compilador que han cambiado desde los valores predeterminados
// del playground y hacerlos compartibles en la URL.

// Puedes leer más sobre las URL en
// example:sharable-urls

// ¿Me pregunto cuáles son los nuevos valores predeterminados?

declare const trueInTS: boolean;
declare const trueInJS: boolean;
declare const monaco: any;

const defaultCompilerOptions = {
  noImplicitAny: true,
  strictNullChecks: trueInTS,
  strictFunctionTypes: true,
  strictPropertyInitialization: true,
  strictBindCallApply: true,
  noImplicitThis: true,
  noImplicitReturns: true,

  alwaysStrict: true,
  allowUnreachableCode: false,
  allowUnusedLabels: false,

  downlevelIteration: false,
  noEmitHelpers: false,
  noLib: false,
  noStrictGenericChecks: false,
  noUnusedLocals: false,
  noUnusedParameters: false,

  esModuleInterop: true,
  preserveConstEnums: false,
  removeComments: false,
  skipLibCheck: false,

  checkJs: trueInJS,
  allowJs: trueInJS,

  experimentalDecorators: false,
  emitDecoratorMetadata: false,

  target: monaco.languages.typescript.ScriptTarget.ES2017,
  jsx: monaco.languages.typescript.JsxEmit.None,
};
