//// { "compiler": { "ts": "4.4.2", "useJavaScript": true, "checkJS": false } }
// Para los usuarios de JavaScript, TypeScript impulsa la mayoría de las herramientas
// para autocompletar y otras características del IDE como la refactorización.

// Durante el proceso de ejecución del compilador de TypeScript sobre
// archivos JavaScript, TypeScript normalmente *no* genera errores
// en un editor a menos que el proyecto esté habilitado a través de 'checkJS' o
// tiene comentarios // @check-ts

// Con 4.4, permitimos que el compilador de TypeScript sugiera
// correcciones ortográficas cuando esté seguro de que un
// el nombre está mal escrito.

const album = {
  name: "Afraid of Heights",
  author: {
    name: "Billy Talent",
    releaseDate: "2016",
  },
};

// En una versión anterior de las herramientas de TypeScript para JavaScript,
// esto no habría sugerido nada, aunque casi no
// haya ninguna manera ser correcto.
album.nme;

// Para obtener más detalles, consulta:
// https://github.com/microsoft/TypeScript/commit/e53f19f8f235ed21f405017a1f8670e9329027ce
