---
title: ASP.NET Core
layout: docs
permalink: /docs/handbook/asp-net-core.html
oneline: Uso de TypeScript en ASP.NET Core
---

## Instalar *ASP.NET Core* y *TypeScript*

Primero, instala [*ASP.NET Core*](https://dotnet.microsoft.com/apps/aspnet) si lo necesitas. Esta guía de inicio rápido requiere *Visual Studio 2015* o *2017*.

A continuación, si tu versión de *Visual Studio* aún no tiene la última versión de *TypeScript*, la puedes [instalar](https://www.typescriptlang.org/index.html#download-links).

## Crea un nuevo proyecto

1. Elige **File**
2. Elige **Nuevo proyecto** (Ctrl + Shift + N)
3. Busca **.NET Core** en la barra de búsqueda del proyecto
4. Selecciona **Aplicación web ASP.NET Core** y presiona el botón *Siguiente*

![Captura de pantalla de la ventana del proyecto *Visual Studio*](/images/tutorials/aspnet/createwebapp.png)

5. Nombra tu proyecto y solución. Después de seleccionar el botón *Crear*

![Captura de pantalla de la ventana del nuevo proyecto de Visual Studio](/images/tutorials/aspnet/namewebapp.png)

6. En la última ventana, selecciona la plantilla **Vacía** y presiona el botón *Crear*

![Captura de pantalla de la aplicación web de Visual Studio](/images/tutorials/aspnet/emptytemplate.png)

Ejecuta la aplicación y asegúrate de que trabaja.

![Una captura de pantalla de Edge que muestra "Hello World" como un éxito](/images/tutorials/aspnet/workingsite.png)

### Configurar el servidor

Abre **Dependencias ▹ Administrar paquetes NuGet ▹ Examinar**. Busca e instala `Microsoft.AspNetCore.StaticFiles` y `Microsoft.TypeScript.MSBuild`:

![La búsqueda de Visual Studio para Nuget](/images/tutorials/aspnet/downloaddependency.png)

Abre tu archivo `Startup.cs` y edita tu función `Configure` para que se vea así:

```cs
public void Configure(IApplicationBuilder app, IHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseDefaultFiles();
    app.UseStaticFiles();
}
```

Es posible que debas reiniciar *VS* para que desaparezcan las líneas onduladas rojas debajo de `UseDefaultFiles` y `UseStaticFiles`.

## Agregar *TypeScript*

A continuación, agregaremos un nuevo directorio y lo llamaremos `scripts`.

![La ruta de "Add" y luego "New Folder" en Visual Studio desde un proyecto web](/images/tutorials/aspnet/newfolder.png)

![](/images/tutorials/aspnet/scripts.png)

## Agregar código *TypeScript*

Haz clic con el botón derecho en `scripts` y haz clic en **Nuevo elemento**. Luego elige **Archivo TypeScript** y nombra el archivo `app.ts`

![Lo más destacado del nuevo directorio](/images/tutorials/aspnet/tsfile.png)

### Agregar código de ejemplo

Agrega el siguiente código al archivo `app.ts`.

```ts
function sayHello() {
  const compiler = (document.getElementById("compiler") as HTMLInputElement)
    .value;
  const framework = (document.getElementById("framework") as HTMLInputElement)
    .value;
  return `Hello from ${compiler} and ${framework}!`;
}
```

## Configurar la construcción

*Configurar el compilador de TypeScript*

Primero necesitamos decirle a *TypeScript* cómo construir. Haz clic con el botón derecho en `scripts` y haz clic en **Nuevo elemento**. Luego elige **Archivo de configuración de TypeScript** y usa el nombre predeterminado de `tsconfig.json`

![Una captura de pantalla que muestra el diálogo del nuevo archivo con la configuración JSON de TypeScript seleccionada](/images/tutorials/aspnet/tsconfig.png)

Reemplaza el contenido del archivo `tsconfig.json` con:

```json tsconfig
{
  "compilerOptions": {
    "noEmitOnError": true,
    "noImplicitAny": true,
    "sourceMap": true,
    "target": "es6"
  },
  "files": ["./app.ts"],
  "compileOnSave": true
}
```

- [`noEmitOnError`](/tsconfig#noEmitOnError) ⏤ No emite salida si se reportaron errores.
- [`noImplicitAny`](/tsconfig#noImplicitAny) ⏤ Genera error en expresiones y declaraciones con un tipo `any` implícito.
- [`sourceMap`](/tsconfig#sourceMap) ⏤ Genera el archivo `.map` correspondiente.
- [`target`](/tsconfig#target) ⏤ Especifica la versión destino de *ECMAScript*.

Nota: `"ESNext"` apunta a la última compatibilidad de

[`noImplicitAny`](/tsconfig#noImplicitAny) es una buena idea siempre que estés escribiendo un código nuevo; puedes asegurarte de no escribir ningún código sin escribir por error. `"compileOnSave"` facilita la actualización de tu código en una aplicación web en ejecución.

#### Configurar *NPM*

Necesitamos configurar *NPM* para que se puedan descargar los paquetes de *JavaScript*. Haz clic derecho en el proyecto y selecciona **Nuevo elemento**. Luego elige **Archivo de configuración NPM** y usa el nombre predeterminado de `package.json`.

![Captura de pantalla de VS que muestra un cuadro de diálogo de archivo nuevo con 'archivo de configuración npm' seleccionado](/images/tutorials/aspnet/packagejson.png)

Dentro de la sección `"devDependencies"` del archivo `package.json`, agrega `gulp` y `del`

```json tsconfig
"devDependencies": {
    "gulp": "4.0.2",
    "del": "5.1.0"
}
```

*Visual Studio* debería comenzar a instalar `gulp` y `del` tan pronto como guardes el archivo. De lo contrario, haz clic con el botón derecho en `package.json` y luego en *Restaurar paquetes*.

Después, deberías ver un directorio `npm` en el explorador de soluciones

![Captura de pantalla de VS que muestra el directorio npm](/images/tutorials/aspnet/npm.png)

#### Configurar `gulp`

Haz clic derecho en el proyecto y haz clic en **Nuevo elemento**. Luego elige **Archivo JavaScript** y usa el nombre de `gulpfile.js`

```js
/// <binding AfterBuild='default' Clean='clean' />
/*
Este archivo es el principal punto de entrada para definir las tareas de Gulp y usar complementos de Gulp.
Clic aquí para saber más. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require("gulp");
var del = require("del");

var paths = {
  scripts: ["scripts/**/*.js", "scripts/**/*.ts", "scripts/**/*.map"],
};

gulp.task("clean", function () {
  return del(["wwwroot/scripts/**/*"]);
});

gulp.task("default", function (done) {
    gulp.src(paths.scripts).pipe(gulp.dest("wwwroot/scripts"));
    done();
});
```

La primera línea le dice a *Visual Studio* que ejecute la tarea "predeterminada" después de que finalice la compilación. También ejecutará la tarea `clean` cuando le pidas a *Visual Studio* que limpie la compilación.

Ahora haz clic derecho en `gulpfile.js` y haz clic en *Task Runner Explorer*.

![Captura de pantalla de hacer clic derecho en "Gulpfile.js" con 'Task Runner Explore' seleccionado](/images/tutorials/aspnet/taskrunner.png)

Si las tareas `default` y `clean` no aparecen, actualiza el explorador:

![Captura de pantalla del explorador de tareas con "Gulpfile.js" en él](/images/tutorials/aspnet/taskrunnerrefresh.png)

## Escribe una página *HTML*

Haz clic derecho en el directorio `wwwroot` (si no ves el directorio, intenta construir el proyecto) y agrega un nuevo elemento llamado `index.html` dentro. Utiliza el siguiente código para `index.html`

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <script src="scripts/app.js"></script>
    <title></title>
</head>
<body>
    <div id="message"></div>
    <div>
        Compilador: <input id="compiler" value="TypeScript" onkeyup="document.getElementById('message').innerText = sayHello()" /><br />
        Marco: <input id="framework" value="ASP.NET" onkeyup="document.getElementById('message').innerText = sayHello()" />
    </div>
</body>
</html>
```

## Prueba

1. Ejecuta el proyecto
2. ¡A medida que escribes en los cuadros, deberías ver aparecer/cambiar el mensaje!

![Un GIF de Edge que muestra el código que acabas de escribir](https://media.giphy.com/media/U3mTibRAx34DG3zhAN/giphy.gif)

## Depurar

1. En *Edge*, presiona *F12* y haz clic en la pestaña *Depurador*.
2. Busca en el primer directorio `localhost`, luego `scripts/app`.ts
3. Pon un punto de interrupción en la línea con `return`.
4. Escribe en los cuadros y confirma que el punto de interrupción llega al código *TypeScript* y que la inspección funciona correctamente.

![Una imagen que muestra al depurador ejecutando el código que acabas de escribir](/images/tutorials/aspnet/debugger.png)

Felicitaciones, has creado tu propio proyecto *.NET Core* con una interfaz de *TypeScript*.
