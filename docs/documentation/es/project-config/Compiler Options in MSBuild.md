---
title: Opciones del compilador en MSBuild
layout: docs
permalink: /docs/handbook/compiler-options-in-msbuild.html
oneline: Qué opciones del compilador están disponibles en los proyectos de MSBuild.
---

## Descripción general

Cuando tienes un proyecto basado en *MSBuild* que utiliza *TypeScript*, como un proyecto *ASP.NET Core*, puedes configurar *TypeScript* de dos formas. Ya sea a través de un `tsconfig.json` o mediante la configuración del proyecto.

## Usar un `tsconfig.json`

Recomendamos usar un `tsconfig.json` para tu proyecto cuando sea posible. Para agregar uno a un proyecto existente, agrega un nuevo elemento a tu proyecto que se denomina "Archivo de configuración *JSON* de *TypeScript*" en las versiones modernas de *Visual Studio*.

El nuevo `tsconfig.json` se utilizará como fuente de verdad para la información de compilación específica de *TypeScript*, como archivos y configuración. Puedes aprender [acerca de cómo funciona *TSConfigs* aquí](/docs/handbook/tsconfig-json.html) y hay una [referencia completa aquí](/tsconfig).

## Uso de la configuración del proyecto

También puedes definir la configuración de *TypeScript* dentro de la configuración de tu proyecto. Esto se hace editando el *XML* en tu `.csproj` para definir `PropertyGroups` que describen cómo puede funcionar la compilación:

```xml
<PropertyGroup>
  <TypeScriptNoEmitOnError>true</TypeScriptNoEmitOnError>
  <TypeScriptNoImplicitReturns>true</TypeScriptNoImplicitReturns>
</PropertyGroup>
```

Hay una serie de asignaciones para configuraciones comunes de *TypeScript*, estas son configuraciones que se asignan directamente a [Opciones *cli* de *TypeScript*](/docs/handbook/compiler-options.html) y se utilizan para ayudarte a escribir un archivo de proyecto más comprensible. Puedes utilizar la [referencia de *TSConfig*](/tsconfig) para obtener más información sobre qué valores y cuales valores predeterminados son para cada asignación.

<!-- Inicio del reemplazo -><h3>Asignaciones CLI</h3>

  <table class='cli-option' width="100%">
    <thead>
    <tr>
    <th>Nombre Config de MSBuild</th>
    <th>Bandera TSC</th>
    </tr>
  </thead>
  <tbody>

<tr class='odd' name='allowJs'>
<td><code>&#x3C;TypeScriptAllowJS&#x3E;</code></td>
<td><code><a href='/tsconfig/#allowJs'>--allowJs</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permita que los archivos JavaScript formen parte de tu programa. Utiliza la opción <code>checkJS</code> para obtener errores de estos archivos.</p>

</tr></td>
<tr class='even' name='removeComments'>
<td><code>&#x3C;TypeScriptRemoveComments&#x3E;</code></td>
<td><code><a href='/tsconfig/#removeComments'>--removeComments</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inhabilita la emisión de comentarios.</p>

</tr></td>
<tr class='odd' name='noImplicitAny'>
<td><code>&#x3C;TypeScriptNoImplicitAny&#x3E;</code></td>
<td><code><a href='/tsconfig/#noImplicitAny'>--noImplicitAny</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilite el informe de errores para expresiones y declaraciones con un tipo <code>any</code> implícito...</p>

</tr></td>
<tr class='even' name='declaration'>
<td><code>&#x3C;TypeScriptGeneratesDeclarations&#x3E;</code></td>
<td><code><a href='/tsconfig/#declaration'>--declaration</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera archivos .d.ts a partir de archivos TypeScript y JavaScript en tu proyecto.</p>

</tr></td>
<tr class='odd' name='module'>
<td><code>&#x3C;TypeScriptModuleKind&#x3E;</code></td>
<td><code><a href='/tsconfig/#module'>--module</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica qué código de módulo se genera.</p>

</tr></td>
<tr class='even' name='jsx'>
<td><code>&#x3C;TypeScriptJSXEmit&#x3E;</code></td>
<td><code><a href='/tsconfig/#jsx'>--jsx</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica qué código JSX se genera.</p>

</tr></td>
<tr class='odd' name='outDir'>
<td><code>&#x3C;TypeScriptOutDir&#x3E;</code></td>
<td><code><a href='/tsconfig/#outDir'>--outDir</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica un directorio de salida para todos los archivos emitidos.</p>

</tr></td>
<tr class='even' name='sourcemap'>
<td><code>&#x3C;TypeScriptSourceMap&#x3E;</code></td>
<td><code><a href='/tsconfig/#sourcemap'>--sourcemap</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p> Crea archivos de mapas fuente para archivos JavaScript emitidos.</p>

</tr></td>
<tr class='odd' name='target'>
<td><code>&#x3C;TypeScriptTarget&#x3E;</code></td>
<td><code><a href='/tsconfig/#target'>--target</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Configura la versión del lenguaje JavaScript para JavaScript emitido e incluye declaraciones de biblioteca compatibles.</p>

</tr></td>
<tr class='even' name='noResolve'>
<td><code>&#x3C;TypeScriptNoResolve&#x3E;</code></td>
<td><code><a href='/tsconfig/#noResolve'>--noResolve</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>No permite que <code>import</code>s, <code>require</code>s o <code>&#x3C;reference></code>s expandan la cantidad de archivos que TypeScript debe agregar a un proyecto.</p>

</tr></td>
<tr class='odd' name='mapRoot'>
<td><code>&#x3C;TypeScriptMapRoot&#x3E;</code></td>
<td><code><a href='/tsconfig/#mapRoot'>--mapRoot</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica la ubicación donde el depurador debe ubicar los archivos de mapas en lugar de las ubicaciones generadas.</p>

</tr></td>
<tr class='even' name='sourceRoot'>
<td><code>&#x3C;TypeScriptSourceRoot&#x3E;</code></td>
<td><code><a href='/tsconfig/#sourceRoot'>--sourceRoot</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica la ruta raíz para que los depuradores encuentren el código fuente de referencia.</p>

</tr></td>
<tr class='odd' name='charset'>
<td><code>&#x3C;TypeScriptCharset&#x3E;</code></td>
<td><code><a href='/tsconfig/#charset'>--charset</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Ya no es compatible. En las primeras versiones, configura manualmente la codificación de texto para leer archivos.</p>

</tr></td>
<tr class='even' name='emitBOM'>
<td><code>&#x3C;TypeScriptEmitBOM&#x3E;</code></td>
<td><code><a href='/tsconfig/#emitBOM'>--emitBOM</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite una marca de orden de bytes (BOM) UTF-8 al principio de los archivos de salida.</p>

</tr></td>
<tr class='odd' name='noLib'>
<td><code>&#x3C;TypeScriptNoLib&#x3E;</code></td>
<td><code><a href='/tsconfig/#noLib'>--noLib</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactive la inclusión de cualquier archivo de biblioteca, incluido el lib.d.ts.</p>

</tr></td>
<tr class='even' name='preserveConstEnums'>
<td><code>&#x3C;TypeScriptPreserveConstEnums&#x3E;</code></td>
<td><code><a href='/tsconfig/#preserveConstEnums'>--preserveConstEnums</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Deshabilita el borrado de declaraciones <code>const enum</code> en el código generado.</p>

</tr></td>
<tr class='odd' name='suppressImplicitAnyIndexErrors'>
<td><code>&#x3C;TypeScriptSuppressImplicitAnyIndexErrors&#x3E;</code></td>
<td><code><a href='/tsconfig/#suppressImplicitAnyIndexErrors'>--suppressImplicitAnyIndexErrors</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Suprime errores <code>`noImplicitAny`</code> al indexar objetos que carecen de índice de firmas.</p>

</tr></td>
<tr class='even' name='noEmitHelpers'>
<td><code>&#x3C;TypeScriptNoEmitHelpers&#x3E;</code></td>
<td><code><a href='/tsconfig/#noEmitHelpers'>--noEmitHelpers</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Deshabilita la generación de funciones auxiliares personalizadas como <code>__extends</code> en la salida compilada. </p>

</tr></td>
<tr class='odd' name='inlineSourceMap'>
<td><code>&#x3C;TypeScriptInlineSourceMap&#x3E;</code></td>
<td><code><a href='/tsconfig/#inlineSourceMap'>--inlineSourceMap</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Incluye archivos de mapa fuente dentro del JavaScript emitido.</p>

</tr></td>
<tr class='even' name='inlineSources'>
<td><code>&#x3C;TypeScriptInlineSources&#x3E;</code></td>
<td><code><a href='/tsconfig/#inlineSources'>--inlineSources</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Incluye el código fuente en los mapas fuentes dentro del JavaScript emitido.</p>

</tr></td>
<tr class='odd' name='newLine'>
<td><code>&#x3C;TypeScriptNewLine&#x3E;</code></td>
<td><code><a href='/tsconfig/#newLine'>--newLine</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Establece el carácter de nueva línea para emitir archivos.</p>

</tr></td>
<tr class='even' name='isolatedModules'>
<td><code>&#x3C;TypeScriptIsolatedModules&#x3E;</code></td>
<td><code><a href='/tsconfig/#isolatedModules'>--isolatedModules</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Asegúrate de que cada archivo se pueda transpilar de forma segura sin depender de otras importaciones.</p>

</tr></td>
<tr class='odd' name='emitDecoratorMetadata'>
<td><code>&#x3C;TypeScriptEmitDecoratorMetadata&#x3E;</code></td>
<td><code><a href='/tsconfig/#emitDecoratorMetadata'>--emitDecoratorMetadata</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Emite metadatos de tipo diseño para declaraciones decoradas en archivos fuente.</p>

</tr></td>
<tr class='even' name='rootDir'>
<td><code>&#x3C;TypeScriptRootDir&#x3E;</code></td>
<td><code><a href='/tsconfig/#rootDir'>--rootDir</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el directorio raíz dentro de tus archivos fuente.</p>

</tr></td>
<tr class='odd' name='experimentalDecorators'>
<td><code>&#x3C;TypeScriptExperimentalDecorators&#x3E;</code></td>
<td><code><a href='/tsconfig/#experimentalDecorators'>--experimentalDecorators</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el soporte experimental para decoradores de la etapa 2 del borrador TC39.</p>

</tr></td>
<tr class='even' name='moduleResolution'>
<td><code>&#x3C;TypeScriptModuleResolution&#x3E;</code></td>
<td><code><a href='/tsconfig/#moduleResolution'>--moduleResolution</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica cómo busca TypeScript un archivo de un especificador de módulo determinado.</p>

</tr></td>
<tr class='odd' name='suppressExcessPropertyErrors'>
<td><code>&#x3C;TypeScriptSuppressExcessPropertyErrors&#x3E;</code></td>
<td><code><a href='/tsconfig/#suppressExcessPropertyErrors'>--suppressExcessPropertyErrors</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la notificación de errores de propiedad excesivos durante la creación del objeto literal. </p>

</tr></td>
<tr class='even' name='reactNamespace'>
<td><code>&#x3C;TypeScriptReactNamespace&#x3E;</code></td>
<td><code><a href='/tsconfig/#reactNamespace'>--reactNamespace</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el objeto invocado para <code>createElement</code>. Esto solo se aplica cuando se apunta a <code>react</code> JSX emit.</p>

</tr></td>
<tr class='odd' name='skipDefaultLibCheck'>
<td><code>&#x3C;TypeScriptSkipDefaultLibCheck&#x3E;</code></td>
<td><code><a href='/tsconfig/#skipDefaultLibCheck'>--skipDefaultLibCheck</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Omite la verificación de tipos de archivos .d.ts que se incluyen con TypeScript.</p>

</tr></td>
<tr class='even' name='allowUnusedLabels'>
<td><code>&#x3C;TypeScriptAllowUnusedLabels&#x3E;</code></td>
<td><code><a href='/tsconfig/#allowUnusedLabels'>--allowUnusedLabels</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inhabilita el informe de errores para etiquetas no utilizadas.</p>

</tr></td>
<tr class='odd' name='noImplicitReturns'>
<td><code>&#x3C;TypeScriptNoImplicitReturns&#x3E;</code></td>
<td><code><a href='/tsconfig/#noImplicitReturns'>--noImplicitReturns</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores para las rutas de código que no regresan explícitamente en una función.</p>

</tr></td>
<tr class='even' name='noFallthroughCasesInSwitch'>
<td><code>&#x3C;TypeScriptNoFallthroughCasesInSwitch&#x3E;</code></td>
<td><code><a href='/tsconfig/#noFallthroughCasesInSwitch'>--noFallthroughCasesInSwitch</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el informe de errores para casos fallidos en declaraciones de cambio.</p>

</tr></td>
<tr class='odd' name='allowUnreachableCode'>
<td><code>&#x3C;TypeScriptAllowUnreachableCode&#x3E;</code></td>
<td><code><a href='/tsconfig/#allowUnreachableCode'>--allowUnreachableCode</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Inhabilita el informe de errores para el código inalcanzable.</p>

</tr></td>
<tr class='even' name='forceConsistentCasingInFileNames'>
<td><code>&#x3C;TypeScriptForceConsistentCasingInFileNames&#x3E;</code></td>
<td><code><a href='/tsconfig/#forceConsistentCasingInFileNames'>--forceConsistentCasingInFileNames</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Se asegura de que la carcasa sea correcta en las importaciones.</p>

</tr></td>
<tr class='odd' name='allowSyntheticDefaultImports'>
<td><code>&#x3C;TypeScriptAllowSyntheticDefaultImports&#x3E;</code></td>
<td><code><a href='/tsconfig/#allowSyntheticDefaultImports'>--allowSyntheticDefaultImports</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permite "importar x desde y" cuando un módulo no tenga una exportación predeterminada.</p>

</tr></td>
<tr class='even' name='noImplicitUseStrict'>
<td><code>&#x3C;TypeScriptNoImplicitUseStrict&#x3E;</code></td>
<td><code><a href='/tsconfig/#noImplicitUseStrict'>--noImplicitUseStrict</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inhabilita la adición de directivas de "use strict" en los archivos JavaScript emitidos.</p>

</tr></td>
<tr class='odd' name='lib'>
<td><code>&#x3C;TypeScriptLib&#x3E;</code></td>
<td><code><a href='/tsconfig/#lib'>--lib</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica un conjunto de archivos de declaración de biblioteca empaquetados que describen el entorno de ejecución de destino.</p>

</tr></td>
<tr class='even' name='baseUrl'>
<td><code>&#x3C;TypeScriptBaseUrl&#x3E;</code></td>
<td><code><a href='/tsconfig/#baseUrl'>--baseUrl</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el directorio base para resolver nombres de módulos no relativos.</p>

</tr></td>
<tr class='odd' name='declarationDir'>
<td><code>&#x3C;TypeScriptDeclarationDir&#x3E;</code></td>
<td><code><a href='/tsconfig/#declarationDir'>--declarationDir</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica el directorio de salida para los archivos de declaración generados.</p>

</tr></td>
<tr class='even' name='noImplicitThis'>
<td><code>&#x3C;TypeScriptNoImplicitThis&#x3E;</code></td>
<td><code><a href='/tsconfig/#noImplicitThis'>--noImplicitThis</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el informe de errores cuando a <code>this</code> se le asigne el tipo <code>any</code>.</p>

</tr></td>
<tr class='odd' name='skipLibCheck'>
<td><code>&#x3C;TypeScriptSkipLibCheck&#x3E;</code></td>
<td><code><a href='/tsconfig/#skipLibCheck'>--skipLibCheck</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Omite la comprobación de tipos de todos los archivos .d.ts.</p>

</tr></td>
<tr class='even' name='strictNullChecks'>
<td><code>&#x3C;TypeScriptStrictNullChecks&#x3E;</code></td>
<td><code><a href='/tsconfig/#strictNullChecks'>--strictNullChecks</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Al verificar el tipo, ten en cuenta <code>null</code> y <code>undefined</code>.</p>

</tr></td>
<tr class='odd' name='noUnusedLocals'>
<td><code>&#x3C;TypeScriptNoUnusedLocals&#x3E;</code></td>
<td><code><a href='/tsconfig/#noUnusedLocals'>--noUnusedLocals</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores cuando no se lean las variables locales.</p>

</tr></td>
<tr class='even' name='noUnusedParameters'>
<td><code>&#x3C;TypeScriptNoUnusedParameters&#x3E;</code></td>
<td><code><a href='/tsconfig/#noUnusedParameters'>--noUnusedParameters</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera un error cuando no se lee un parámetro de función</p>

</tr></td>
<tr class='odd' name='alwaysStrict'>
<td><code>&#x3C;TypeScriptAlwaysStrict&#x3E;</code></td>
<td><code><a href='/tsconfig/#alwaysStrict'>--alwaysStrict</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Se asegura de que siempre se emita "use strict".</p>

</tr></td>
<tr class='even' name='importHelpers'>
<td><code>&#x3C;TypeScriptImportHelpers&#x3E;</code></td>
<td><code><a href='/tsconfig/#importHelpers'>--importHelpers</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Permite importar funciones auxiliares desde <code>tslib</code> una vez por proyecto, en lugar de incluirlas por archivo.</p>

</tr></td>
<tr class='odd' name='jsxFactory'>
<td><code>&#x3C;TypeScriptJSXFactory&#x3E;</code></td>
<td><code><a href='/tsconfig/#jsxFactory'>--jsxFactory</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica la función de fábrica JSX utilizada al apuntar a React JSX emit, p. ej. 'React.createElement' o 'h'</p>

</tr></td>
<tr class='even' name='stripInternal'>
<td><code>&#x3C;TypeScriptStripInternal&#x3E;</code></td>
<td><code><a href='/tsconfig/#stripInternal'>--stripInternal</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactiva la emisión de declaraciones que tengan <code>@internal</code> en sus comentarios JSDoc.</p>

</tr></td>
<tr class='odd' name='checkJs'>
<td><code>&#x3C;TypeScriptCheckJs&#x3E;</code></td>
<td><code><a href='/tsconfig/#checkJs'>--checkJs</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores en archivos JavaScript de tipo verificado.</p>

</tr></td>
<tr class='even' name='downlevelIteration'>
<td><code>&#x3C;TypeScriptDownlevelIteration&#x3E;</code></td>
<td><code><a href='/tsconfig/#downlevelIteration'>--downlevelIteration</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite JavaScript más compatible, pero detallado y con menos rendimiento para la iteración.</p>

</tr></td>
<tr class='odd' name='strict'>
<td><code>&#x3C;TypeScriptStrict&#x3E;</code></td>
<td><code><a href='/tsconfig/#strict'>--strict</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita todas las opciones estrictas de verificación de tipo.</p>

</tr></td>
<tr class='even' name='noStrictGenericChecks'>
<td><code>&#x3C;TypeScriptNoStrictGenericChecks&#x3E;</code></td>
<td><code><a href='/tsconfig/#noStrictGenericChecks'>--noStrictGenericChecks</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactiva la comprobación estricta de firmas genéricas en tipos de funciones.</p>

</tr></td>
<tr class='odd' name='preserveSymlinks'>
<td><code>&#x3C;TypeScriptPreserveSymlinks&#x3E;</code></td>
<td><code><a href='/tsconfig/#preserveSymlinks'>--preserveSymlinks</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la resolución de enlaces simbólicos a su ruta real. Esto se correlaciona con la misma bandera en el nodo.</p>

</tr></td>
<tr class='even' name='strictFunctionTypes'>
<td><code>&#x3C;TypeScriptStrictFunctionTypes&#x3E;</code></td>
<td><code><a href='/tsconfig/#strictFunctionTypes'>--strictFunctionTypes</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Al asignar funciones, verifica que los parámetros y los valores devueltos sean compatibles con los subtipos.</p>

</tr></td>
<tr class='odd' name='strictPropertyInitialization'>
<td><code>&#x3C;TypeScriptStrictPropertyInitialization&#x3E;</code></td>
<td><code><a href='/tsconfig/#strictPropertyInitialization'>--strictPropertyInitialization</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Comprueba las propiedades de clase que están declaradas pero no establecidas en el constructor.</p>

</tr></td>
<tr class='even' name='esModuleInterop'>
<td><code>&#x3C;TypeScriptESModuleInterop&#x3E;</code></td>
<td><code><a href='/tsconfig/#esModuleInterop'>--esModuleInterop</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite JavaScript adicional para facilitar la compatibilidad con la importación de módulos CommonJS. Esto habilita <code>allowSyntheticDefaultImports</code> para compatibilidad de tipos.</p>

</tr></td>
<tr class='odd' name='emitDeclarationOnly'>
<td><code>&#x3C;TypeScriptEmitDeclarationOnly&#x3E;</code></td>
<td><code><a href='/tsconfig/#emitDeclarationOnly'>--emitDeclarationOnly</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Solo genera archivos d.ts y no archivos JavaScript.</p>

</tr></td>
<tr class='even' name='keyofStringsOnly'>
<td><code>&#x3C;TypeScriptKeyofStringsOnly&#x3E;</code></td>
<td><code><a href='/tsconfig/#keyofStringsOnly'>--keyofStringsOnly</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Hacer keyof solo devuelve cadenas en lugar de cadenas, números o símbolos. Opción heredada.</p>

</tr></td>
<tr class='odd' name='useDefineForClassFields'>
<td><code>&#x3C;TypeScriptUseDefineForClassFields&#x3E;</code></td>
<td><code><a href='/tsconfig/#useDefineForClassFields'>--useDefineForClassFields</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Emite campos de clase compatibles con el estándar ECMAScript.</p>

</tr></td>
<tr class='even' name='declarationMap'>
<td><code>&#x3C;TypeScriptDeclarationMap&#x3E;</code></td>
<td><code><a href='/tsconfig/#declarationMap'>--declarationMap</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Cree mapas fuente para archivos d.ts.</p>

</tr></td>
<tr class='odd' name='resolveJsonModule'>
<td><code>&#x3C;TypeScriptResolveJsonModule&#x3E;</code></td>
<td><code><a href='/tsconfig/#resolveJsonModule'>--resolveJsonModule</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita la importación de archivos .json</p>

</tr></td>
<tr class='even' name='strictBindCallApply'>
<td><code>&#x3C;TypeScriptStrictBindCallApply&#x3E;</code></td>
<td><code><a href='/tsconfig/#strictBindCallApply'>--strictBindCallApply</a></code></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Comprueba que los argumentos de los métodos <code>bind</code>, <code>call</code> y <code>apply</code> coincidan con la función original.</p>

</tr></td>
<tr class='odd' name='noEmitOnError'>
<td><code>&#x3C;TypeScriptNoEmitOnError&#x3E;</code></td>
<td><code><a href='/tsconfig/#noEmitOnError'>--noEmitOnError</a></code></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la emisión de archivos si se informa algún error de verificación de tipo.</p>

</tr></td>
</tbody></table>
<!-- Fin de sustitución -->

### Banderas adicionales

Debido a que el sistema *MSBuild* pasa argumentos directamente a la *CLI* de *TypeScript*, puedes usar la opción `TypeScriptAdditionalFlags` para proporcionar indicadores específicos que no tienen un mapeo arriba.

Por ejemplo, esto activará [`noPropertyAccessFromIndexSignature`](/tsconfig#noPropertyAccessFromIndexSignature):

```xml
<TypeScriptAdditionalFlags> $(TypeScriptAdditionalFlags) --noPropertyAccessFromIndexSignature</TypeScriptAdditionalFlags>
```

### Depurar y liberar compilaciones

Puedes utilizar las condiciones de *PropertyGroup* para definir diferentes conjuntos de configuraciones. Por ejemplo, una tarea común es eliminar comentarios y mapas fuente en producción. En este ejemplo, definimos un grupo de propiedades de depuración y liberación que tiene diferentes configuraciones de *TypeScript*:

```xml
<PropertyGroup Condition="'$(Configuration)' == 'Debug'">
  <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
  <TypeScriptSourceMap>true</TypeScriptSourceMap>
</PropertyGroup>

<PropertyGroup Condition="'$(Configuration)' == 'Release'">
  <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
  <TypeScriptSourceMap>false</TypeScriptSourceMap>
</PropertyGroup>

<Import
    Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
    Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets')" />
```

### *ToolsVersion*

El valor de la propiedad `<TypeScriptToolsVersion>1.7</TypeScriptToolsVersion>` en el archivo del proyecto identifica la versión del compilador que se usará para compilar (1.7 en este ejemplo).
Esto permite que un proyecto compile contra las mismas versiones del compilador en diferentes máquinas.

Si no se especifica `TypeScriptToolsVersion`, la última versión del compilador instalada en la máquina se usará para compilar.

Los usuarios que usen versiones más nuevas de *TS* verán un aviso para actualizar su proyecto en la primera carga.

### `TypeScriptCompileBlocked`

Si estás utilizando una herramienta de compilación diferente para construir tu proyecto (por ejemplo, `gulp`, `grunt`, etc.) y *VS* para la experiencia de desarrollo y depuración, configura `<TypeScriptCompileBlocked>`true`</TypeScriptCompileBlocked>` en tu proyecto.
Esto debería darte todo el soporte de edición, pero no la compilación cuando presionas *F5*.

### `TypeScriptEnableIncrementalMSBuild` (*TypeScript 4.2 Beta* y posterior)

De forma predeterminada, *MSBuild* solo intentará ejecutar el compilador de *TypeScript* cuando los archivos fuente del proyecto se hayan actualizado desde la última compilación.
Sin embargo, si este comportamiento está causando problemas, como cuando la opción [`incremental`](/tsconfig#incremental) de *TypeScript* está habilitada, establece `<TypeScriptEnableIncrementalMSBuild>false</TypeScriptEnableIncrementalMSBuild>` para asegurarse de que el compilador de *TypeScript* se invoque con cada ejecución de *MSBuild*.
