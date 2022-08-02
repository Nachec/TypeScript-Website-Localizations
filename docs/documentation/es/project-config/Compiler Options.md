---
title: Opciones de tsc CLI
layout: docs
permalink: /docs/handbook/compiler-options.html
oneline: Una descripción general de muy alto nivel de las opciones CLI del compilador tsc
disable_toc: true
---

## Usar la *CLI*

Ejecutar `tsc` localmente compilará el proyecto más cercano definido por un `tsconfig.json`, puedes compilar un conjunto de archivos *TypeScript*
pasando el conjunto de archivos que desees.

```sh
# Ejecuta una compilación basada en una mirada hacia atrás a través del fs para un tsconfig.json
`tsc`

# Emite JS solo para index.ts con los valores predeterminados del compilador
tsc index.ts

# Emite JS para cualquier archivo .ts en el directorio src, con la configuración predeterminada
tsc src/*.ts

# Emite archivos a los que se hace referencia con la configuración del compilador de tsconfig.production.json
tsc --project tsconfig.production.json

# Emitir archivos d.ts para un archivo js mostrando las opciones del compilador que son booleanas
tsc index.js --declaration --emitDeclarationOnly

# Emite un solo archivo .js desde dos archivos a través de las opciones del compilador que toman argumentos de cadena
tsc app.ts util.ts --target esnext --outfile index.js
```

## Opciones del compilador

**Si estás buscando más información sobre las opciones del compilador en un tsconfig, consulta la [Referencia de *TSConfig*](/tsconfig)**

<!-- Inicio el reemplazo -><h3>Comandos de la CLI</h3>
<table class="cli-option" width="100%">
  <thead>
    <tr>
      <th>Bandera</th>
      <th>Tipo</th>
    </tr>
  </thead>
  <tbody>
<tr class='odd' name='all'>
  <td><code>--all</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Muestra todas las opciones del compilador.</p>
</td></tr>

<tr class='even' name='generateTrace'>
  <td><code>--generateTrace</code></td>
  <td><p><code>string</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera un seguimiento de eventos y una lista de tipos.</p>
</td></tr>

<tr class='odd' name='help'>
  <td><code>--help</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Proporciona información local para obtener ayuda sobre la CLI.</p>
</td></tr>

<tr class='even' name='init'>
  <td><code>--init</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inicia un proyecto TypeScript y crea un archivo tsconfig.json.</p>
</td></tr>

<tr class='odd' name='listFilesOnly'>
  <td><code>--listFilesOnly</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Imprime los nombres de los archivos que forman parte de la compilación y luego detiene el procesamiento.</p>
</td></tr>

<tr class='even' name='locale'>
  <td><code>--locale</code></td>
  <td><p><code>string</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Establece el idioma de los mensajes de TypeScript. Esto no afecta a la emisión.</p>
</td></tr>

<tr class='odd' name='project'>
  <td><code>--project</code></td>
  <td><p><code>string</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Compila el proyecto con la ruta a su archivo de configuración, o a un directorio con un 'tsconfig.json'.</p>
</td></tr>

<tr class='even' name='showConfig'>
  <td><code>--showConfig</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Imprime la configuración final en lugar de compilar.</p>
</td></tr>

<tr class='odd' name='version'>
  <td><code>--version</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Imprime la versión del compilador.</p>
</td></tr>

</tbody></table>

<h3>Opciones de compilación</h3>
<table class="cli-option" width="100%">
  <thead>
    <tr>
      <th>Bandera</th>
      <th>Tipo</th>
    </tr>
  </thead>
  <tbody>
<tr class='odd' name='build'>
  <td><code>--build</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Crea uno o más proyectos y sus dependencias, si están desactualizados</p>
</td></tr>

<tr class='even' name='clean'>
  <td><code>--clean</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Elimina el resultado de todos los proyectos.</p>
</td></tr>

<tr class='odd' name='dry'>
  <td><code>--dry</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Muestra lo que se compilaría (o eliminaría, si se especifica con '--clean')</p>
</td></tr>

<tr class='even' name='force'>
  <td><code><a href='/tsconfig/#force'>--force</a></code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Crea todos los proyectos, incluidos los que parecen estar actualizados</p>
</td></tr>

<tr class='odd' name='verbose'>
  <td><code><a href='/tsconfig/#verbose'>--verbose</a></code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el registro detallado.</p>
</td></tr>

</tbody></table>

<h3>Opciones de visualización</h3>
<table class="cli-option" width="100%">
  <thead>
    <tr>
      <th>Bandera</th>
      <th>Tipo</th>
    </tr>
  </thead>
  <tbody>
<tr class='odd' name='excludeDirectories'>
  <td><code><a href='/tsconfig/#excludeDirectories'>--excludeDirectories</a></code></td>
  <td><p><code>list</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Elimina una lista de directorios del proceso de observación.</p>
</td></tr>

<tr class='even' name='excludeFiles'>
  <td><code><a href='/tsconfig/#excludeFiles'>--excludeFiles</a></code></td>
  <td><p><code>list</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Elimina una lista de archivos del procesamiento del modo de vigilancia.</p>
</td></tr>

<tr class='odd' name='fallbackPolling'>
  <td><code><a href='/tsconfig/#fallbackPolling'>--fallbackPolling</a></code></td>
  <td><p><code>fixedinterval</code>, <code>priorityinterval</code>, <code>dynamicpriority</code> o <code>fixedchunksize</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica qué enfoque debe utilizar el observador si el sistema se queda sin observadores de archivos nativos.</p>
</td></tr>

<tr class='even' name='synchronousWatchDirectory'>
  <td><code><a href='/tsconfig/#synchronousWatchDirectory'>--synchronousWatchDirectory</a></code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Llama de forma sincrónica a devoluciones de llamada y actualiza el estado de los observadores de directorios en plataformas que no admiten la visualización recursiva de forma nativa.</p>
</td></tr>

<tr class='odd' name='watch'>
  <td><code>--watch</code></td>
  <td><p><code>boolean</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Ve archivos de entrada.</p>
</td></tr>

<tr class='even' name='watchDirectory'>
  <td><code><a href='/tsconfig/#watchDirectory'>--watchDirectory</a></code></td>
  <td><p><code>usefsevents</code>, <code>fixedpollinginterval</code>, <code>dynamicprioritypolling</code> o <code>fixedchunksizepolling</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica cómo se ven los directorios en los sistemas que carecen de la funcionalidad de observación de archivos recursiva.</p>
</td></tr>

<tr class='odd' name='watchFile'>
  <td><code><a href='/tsconfig/#watchFile'>--watchFile</a></code></td>
  <td><p><code>fixedpollinginterval</code>, <code>prioritypollinginterval</code>, <code>dynamicprioritypolling</code>, <code>fixedchunksizepolling</code>, <code>usefsevents</code> o <code>usefseventsonparentdirectory</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica cómo funciona el modo de visualización de TypeScript.</p>
</td></tr>

</tbody></table>

<h3>Banderas del compilador</h3>
<table class="cli-option" width="100%">
  <thead>
    <tr>
      <th>Bandera</th>
      <th>Tipo</th>
      <th>Predeterminado</th>
    </tr>
  </thead>
  <tbody>
<tr class='odd' name='allowJs'>
  <td><code><a href='/tsconfig/#allowJs'>--allowJs</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permita que los archivos JavaScript formen parte de tu programa. Utiliza la opción <code>checkJS</code> para obtener errores de estos archivos.</p>
</td></tr>

<tr class='even' name='allowSyntheticDefaultImports'>
  <td><code><a href='/tsconfig/#allowSyntheticDefaultImports'>--allowSyntheticDefaultImports</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#module"><code>module</code></a> es <code>system</code>, o <a href="#esModuleInterop"><code>esModuleInterop</code></a> y <a href="#module"><code>module</code></a> no es <code>es6</code>/<code>es2015</code> o <code>esnext</code>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Permite "importar x desde y" cuando un módulo no tenga una exportación predeterminada.</p>
</td></tr>

<tr class='odd' name='allowUmdGlobalAccess'>
  <td><code><a href='/tsconfig/#allowUmdGlobalAccess'>--allowUmdGlobalAccess</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permitir el acceso a globales UMD desde módulos.</p>
</td></tr>

<tr class='even' name='allowUnreachableCode'>
  <td><code><a href='/tsconfig/#allowUnreachableCode'>--allowUnreachableCode</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inhabilita el informe de errores para el código inalcanzable.</p>
</td></tr>

<tr class='odd' name='allowUnusedLabels'>
  <td><code><a href='/tsconfig/#allowUnusedLabels'>--allowUnusedLabels</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Inhabilita el informe de errores para etiquetas no utilizadas.</p>
</td></tr>

<tr class='even' name='alwaysStrict'>
  <td><code><a href='/tsconfig/#alwaysStrict'>--alwaysStrict</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Se asegura de que siempre se emita "use strict".</p>
</td></tr>

<tr class='odd' name='assumeChangesOnlyAffectDirectDependencies'>
  <td><code><a href='/tsconfig/#assumeChangesOnlyAffectDirectDependencies'>--assumeChangesOnlyAffectDirectDependencies</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Tener recompilaciones en proyectos que usan el modo <a href="#incremental"> <code>incremental</code></a> y <code>watch</code> supone que los cambios dentro de un archivo solo afectarán a los archivos directamente dependiendo de él. </p>
</td></tr>

<tr class='even' name='baseUrl'>
  <td><code><a href='/tsconfig/#baseUrl'>--baseUrl</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el directorio base para resolver nombres de módulos no relativos.</p>
</td></tr>

<tr class='odd' name='charset'>
  <td><code><a href='/tsconfig/#charset'>--charset</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>utf8</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Ya no es compatible. En las primeras versiones, configura manualmente la codificación de texto para leer archivos.</p>
</td></tr>

<tr class='even' name='checkJs'>
  <td><code><a href='/tsconfig/#checkJs'>--checkJs</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el informe de errores en archivos JavaScript de tipo verificado.</p>
</td></tr>

<tr class='odd' name='composite'>
  <td><code><a href='/tsconfig/#composite'>--composite</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita restricciones que permitan utilizar un proyecto de TypeScript con referencias de proyecto.</p>
</td></tr>

<tr class='even' name='declaration'>
  <td><code><a href='/tsconfig/#declaration'>--declaration</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#composite"><code>composite</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera archivos .d.ts a partir de archivos TypeScript y JavaScript en tu proyecto.</p>
</td></tr>

<tr class='odd' name='declarationDir'>
  <td><code><a href='/tsconfig/#declarationDir'>--declarationDir</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica el directorio de salida para los archivos de declaración generados.</p>
</td></tr>

<tr class='even' name='declarationMap'>
  <td><code><a href='/tsconfig/#declarationMap'>--declarationMap</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Cree mapas fuente para archivos d.ts.</p>
</td></tr>

<tr class='odd' name='diagnostics'>
  <td><code><a href='/tsconfig/#diagnostics'>--diagnostics</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Genera información sobre el rendimiento del compilador después de la compilación.</p>
</td></tr>

<tr class='even' name='disableReferencedProjectLoad'>
  <td><code><a href='/tsconfig/#disableReferencedProjectLoad'>--disableReferencedProjectLoad</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Reduce la cantidad de proyectos cargados automáticamente por TypeScript.</p>
</td></tr>

<tr class='odd' name='disableSizeLimit'>
  <td><code><a href='/tsconfig/#disableSizeLimit'>--disableSizeLimit</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Elimina el límite de 20 MB en el tamaño total del código fuente para archivos JavaScript en el servidor de lenguaje TypeScript.</p>
</td></tr>

<tr class='even' name='disableSolutionSearching'>
  <td><code><a href='/tsconfig/#disableSolutionSearching'>--disableSolutionSearching</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Opta por excluir un proyecto de la verificación de referencias de varios proyectos al editarlo.</p>
</td></tr>

<tr class='odd' name='disableSourceOfProjectReferenceRedirect'>
  <td><code><a href='/tsconfig/#disableSourceOfProjectReferenceRedirect'>--disableSourceOfProjectReferenceRedirect</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la preferencia de archivos fuente en lugar de archivos de declaración al hacer referencia a proyectos compuestos.</p>
</td></tr>

<tr class='even' name='downlevelIteration'>
  <td><code><a href='/tsconfig/#downlevelIteration'>--downlevelIteration</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite JavaScript más compatible, pero detallado y con menos rendimiento para la iteración.</p>
</td></tr>

<tr class='odd' name='emitBOM'>
  <td><code><a href='/tsconfig/#emitBOM'>--emitBOM</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Emite una marca de orden de bytes (BOM) UTF-8 al principio de los archivos de salida.</p>
</td></tr>

<tr class='even' name='emitDeclarationOnly'>
  <td><code><a href='/tsconfig/#emitDeclarationOnly'>--emitDeclarationOnly</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Solo genera archivos d.ts y no archivos JavaScript.</p>
</td></tr>

<tr class='odd' name='emitDecoratorMetadata'>
  <td><code><a href='/tsconfig/#emitDecoratorMetadata'>--emitDecoratorMetadata</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Emite metadatos de tipo diseño para declaraciones decoradas en archivos fuente.</p>
</td></tr>

<tr class='even' name='esModuleInterop'>
  <td><code><a href='/tsconfig/#esModuleInterop'>--esModuleInterop</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite JavaScript adicional para facilitar la compatibilidad con la importación de módulos CommonJS. Esto habilita <a href="#allowSyntheticDefaultImports"> <code>allowSyntheticDefaultImports</code></a> para compatibilidad de tipos.</p>
</td></tr>

<tr class = 'odd' name = 'exactOptionalPropertyTypes'>
  <td><code><a href='/tsconfig/#exactOptionalPropertyTypes'>--exactOptionalPropertyTypes</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Interpreta los tipos de propiedad opcionales tal como están escritos, en lugar de agregar <code>undefined</code>.</p>
</td></tr>

<tr class='even' name='experimentalDecorators'>
  <td><code><a href='/tsconfig/#experimentalDecorators'>--experimentalDecorators</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el soporte experimental para decoradores de la etapa 2 del borrador TC39.</p>
</td></tr>

<tr class='odd' name='explainFiles'>
  <td><code><a href='/tsconfig/#explainFiles'>--explainFiles</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Imprimir archivos leídos durante la compilación, incluido el motivo por el que se incluyeron.</p>
</td></tr>

<tr class='even' name='extendedDiagnostics'>
  <td><code><a href='/tsconfig/#extendedDiagnostics'>--extendedDiagnostics</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera información sobre el rendimiento del compilador después de la compilación.</p>
</td></tr>

<tr class='odd' name='forceConsistentCasingInFileNames'>
  <td><code><a href='/tsconfig/#forceConsistentCasingInFileNames'>--forceConsistentCasingInFileNames</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Se asegura de que la carcasa sea correcta en las importaciones.</p>
</td></tr>

<tr class='even' name='generateCpuProfile'>
  <td><code><a href='/tsconfig/#generateCpuProfile'>--generateCpuProfile</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>profile.cpuprofile</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Emite un perfil de CPU v8 del compilador que se ejecuta para depurar.</p>
</td></tr>

<tr class='odd' name='importHelpers'>
  <td><code><a href='/tsconfig/#importHelpers'>--importHelpers</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permite importar funciones auxiliares desde <code>tslib</code> una vez por proyecto, en lugar de incluirlas por archivo.</p>
</td></tr>

<tr class='even' name='importsNotUsedAsValues'>
  <td><code><a href='/tsconfig/#importsNotUsedAsValues'>--importsNotUsedAsValues</a></code></td>
  <td><p><code>remove</code>, <code>preserve</code>, o <code>error</code></p>
</td>
  <td><p><code>remove</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el comportamiento de emisión/comprobación para las importaciones que solo se utilizan para tipos.</p>
</td></tr>

<tr class='odd' name='incremental'>
  <td><code><a href='/tsconfig/#incremental'>--incremental</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#composite"><code>composite</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Guarda los archivos .tsbuildinfo para permitir la compilación incremental de proyectos.</p>
</td></tr>

<tr class='even' name='inlineSourceMap'>
  <td><code><a href='/tsconfig/#inlineSourceMap'>--inlineSourceMap</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Incluye archivos de mapa fuente dentro del JavaScript emitido.</p>
</td></tr>

<tr class='odd' name='inlineSources'>
  <td><code><a href='/tsconfig/#inlineSources'>--inlineSources</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Incluye el código fuente en los mapas fuentes dentro del JavaScript emitido.</p>
</td></tr>

<tr class='even' name='isolatedModules'>
  <td><code><a href='/tsconfig/#isolatedModules'>--isolatedModules</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Asegúrate de que cada archivo se pueda transpilar de forma segura sin depender de otras importaciones.</p>
</td></tr>

<tr class='odd' name='jsx'>
  <td><code><a href='/tsconfig/#jsx'>--jsx</a></code></td>
  <td><p><code>preserve</code>, <code>react</code>, <code>react-native</code>, <code>react-jsx</code> o <code>react-jsxdev</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica qué código JSX se genera.</p>
</td></tr>

<tr class='even' name='jsxFactory'>
  <td><code><a href='/tsconfig/#jsxFactory'>--jsxFactory</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>React.createElement</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica la función de fábrica JSX utilizada al apuntar a React JSX emit, p. ej. 'React.createElement' o 'h'</p>
</td></tr>

<tr class='odd' name='jsxFragmentFactory'>
  <td><code><a href='/tsconfig/#jsxFragmentFactory'>--jsxFragmentFactory</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>React.Fragment</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica la referencia de fragmento JSX utilizada para los fragmentos al apuntar a la emisión de React JSX, p. ej. 'React.Fragment' o 'Fragment'.</p>
</td></tr>

<tr class='even' name='jsxImportSource'>
  <td><code><a href='/tsconfig/#jsxImportSource'>--jsxImportSource</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>react</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Precisa el especificador de módulo utilizado para importar las funciones de fábrica JSX cuando se usa <code>jsx: react-jsx*</code>.</p>
</td></tr>

<tr class='odd' name='keyofStringsOnly'>
  <td><code><a href='/tsconfig/#keyofStringsOnly'>--keyofStringsOnly</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Hacer keyof solo devuelve cadenas en lugar de cadenas, números o símbolos. Opción heredada.</p>
</td></tr>

<tr class='even' name='lib'>
  <td><code><a href='/tsconfig/#lib'>--lib</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica un conjunto de archivos de declaración de biblioteca empaquetados que describen el entorno de ejecución de destino.</p>
</td></tr>

<tr class='odd' name='listEmittedFiles'>
  <td><code><a href='/tsconfig/#listEmittedFiles'>--listEmittedFiles</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Imprime los nombres de los archivos emitidos después de una compilación.</p>
</td></tr>

<tr class='even' name='listFiles'>
  <td><code><a href='/tsconfig/#listFiles'>--listFiles</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Imprime todos los archivos leídos durante la compilación.</p>
</td></tr>

<tr class='odd' name='mapRoot'>
  <td><code><a href='/tsconfig/#mapRoot'>--mapRoot</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica la ubicación donde el depurador debe ubicar los archivos de mapas en lugar de las ubicaciones generadas.</p>
</td></tr>

<tr class='even' name='maxNodeModuleJsDepth'>
  <td><code><a href='/tsconfig/#maxNodeModuleJsDepth'>--maxNodeModuleJsDepth</a></code></td>
  <td><p><code>number</code></p>
</td>
  <td><p><code>0</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica la profundidad máxima del directorio utilizado para comprobar archivos JavaScript de <code>node_modules</code>. Solo se aplica con <a href="#allowJs"> <code>allowJs</code></a>.</p>
</td></tr>

<tr class='odd' name='module'>
  <td><code><a href='/tsconfig/#module'>--module</a></code></td>
  <td><p><code>none</code>, <code>commonjs</code>, <code>amd</code>, <code>umd</code>, <code>system</code>, <code>es6</code>/<code>es2015</code>, <code>es2020</code>, <code>es2022</code>, <code>esnext</code>, <code>node16</code> o <code>nodenext</code></p>
</td>
  <td><ul><li><p><code>CommonJS</code> si <a href="#target"><code>target</code></a> es <code>ES3</code> o <code>ES5</code>,</p>
</li><li><p><code>ES6</code>/<code>ES2015</code> de lo contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica qué código de módulo se genera.</p>
</td></tr>

<tr class='even' name='moduleDetection'>
  <td><code><a href='/tsconfig/#moduleDetection'>--moduleDetection</a></code></td>
  <td><p><code>legacy</code>, <code>auto</code> o <code>force</code></p>
</td>
  <td><p>"auto": Trata archivos con imports, exports, import.meta, jsx (con jsx: react-jsx), o formato esm (con module: node16+) como módulos.</p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Controla qué método se usa para detectar si un archivo JS es un módulo.</p>
</td></tr>

<tr class='odd' name='moduleResolution'>
  <td><code><a href='/tsconfig/#moduleResolution'>--moduleResolution</a></code></td>
  <td><p><code>classic</code>, <code>node</code>, <code>node16</code> o <code>nodenext</code></p>
</td>
  <td><ul><li><p><code>Classic</code> si <a href="#module"><code>module</code></a> es <code>AMD</code>, <code>UMD</code>, <code>System</code> o <code>ES6</code>/<code>ES2015</code>,</p>
</li><li><p>Coincide si <a href="#module"><code>module</code></a> es <code>node12</code> o <code>nodenext</code>,</p>
</li><li><p><code>Node</code> de lo contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica cómo busca TypeScript un archivo de un especificador de módulo determinado.</p>
</td></tr>

<tr class='even' name='moduleSuffixes'>
  <td><code><a href='/tsconfig/#moduleSuffixes'>--moduleSuffixes</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Lista de sufijos de nombre de archivo para buscar al resolver un módulo.</p>
</td></tr>

<tr class='odd' name='newLine'>
  <td><code><a href='/tsconfig/#newLine'>--newLine</a></code></td>
  <td><p><code>crlf</code> o <code>lf</code></p>
</td>
  <td><p>Plataforma específica.</p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Establece el carácter de nueva línea para emitir archivos.</p>
</td></tr>

<tr class='even' name='noEmit'>
  <td><code><a href='/tsconfig/#noEmit'>--noEmit</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactiva la emisión de archivos de una compilación.</p>
</td></tr>

<tr class='odd' name='noEmitHelpers'>
  <td><code><a href='/tsconfig/#noEmitHelpers'>--noEmitHelpers</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Deshabilita la generación de funciones auxiliares personalizadas como <code>__extends</code> en la salida compilada. </p>
</td></tr>

<tr class='even' name='noEmitOnError'>
  <td><code><a href='/tsconfig/#noEmitOnError'>--noEmitOnError</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactiva la emisión de archivos si se informa algún error de verificación de tipo.</p>
</td></tr>

<tr class='odd' name='noErrorTruncation'>
  <td><code><a href='/tsconfig/#noErrorTruncation'>--noErrorTruncation</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Deshabilita los tipos de truncamiento en los mensajes de error.</p>
</td></tr>

<tr class='even' name='noFallthroughCasesInSwitch'>
  <td><code><a href='/tsconfig/#noFallthroughCasesInSwitch'>--noFallthroughCasesInSwitch</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el informe de errores para casos fallidos en declaraciones de cambio.</p>
</td></tr>

<tr class='odd' name='noImplicitAny'>
  <td><code><a href='/tsconfig/#noImplicitAny'>--noImplicitAny</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores para expresiones y declaraciones con un tipo <code>any</code> implícito.</p>
</td></tr>

<tr class='even' name='noImplicitOverride'>
  <td><code><a href='/tsconfig/#noImplicitOverride'>--noImplicitOverride</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Se asegura de que los miembros redefinidos en las clases derivadas estén marcados con un modificador de redefinición.</p>
</td></tr>

<tr class='odd' name='noImplicitReturns'>
  <td><code><a href='/tsconfig/#noImplicitReturns'>--noImplicitReturns</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores para las rutas de código que no regresan explícitamente en una función.</p>
</td></tr>

<tr class='even' name='noImplicitThis'>
  <td><code><a href='/tsconfig/#noImplicitThis'>--noImplicitThis</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el informe de errores cuando a <code>this</code> se le asigne el tipo <code>any</code>.</p>
</td></tr>

<tr class='odd' name='noImplicitUseStrict'>
  <td><code><a href='/tsconfig/#noImplicitUseStrict'>--noImplicitUseStrict</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Inhabilita la adición de directivas de "use strict" en los archivos JavaScript emitidos.</p>
</td></tr>

<tr class='even' name='noLib'>
  <td><code><a href='/tsconfig/#noLib'>--noLib</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactive la inclusión de cualquier archivo de biblioteca, incluido el lib.d.ts.</p>
</td></tr>

<tr class='odd' name='noPropertyAccessFromIndexSignature'>
  <td><code><a href='/tsconfig/#noPropertyAccessFromIndexSignature'>--noPropertyAccessFromIndexSignature</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Impone el uso de descriptores de acceso indexados para las claves declaradas con un tipo indexado.</p>
</td></tr>

<tr class='even' name='noResolve'>
  <td><code><a href='/tsconfig/#noResolve'>--noResolve</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>No permite que <code>import</code>s, <code>require</code>s o <code>&#x3C;reference></code>s expandan la cantidad de archivos que TypeScript debe agregar a un proyecto.</p>
</td></tr>

<tr class='odd' name='noStrictGenericChecks'>
  <td><code><a href='/tsconfig/#noStrictGenericChecks'>--noStrictGenericChecks</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la comprobación estricta de firmas genéricas en tipos de funciones.</p>
</td></tr>

<tr class='even' name='noUncheckedIndexedAccess'>
  <td><code><a href='/tsconfig/#noUncheckedIndexedAccess'>--noUncheckedIndexedAccess</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Agrega <code>undefined</code> a un tipo cuando se acceda mediante un índice.</p>
</td></tr>

<tr class='odd' name='noUnusedLocals'>
  <td><code><a href='/tsconfig/#noUnusedLocals'>--noUnusedLocals</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita el informe de errores cuando no se lean las variables locales.</p>
</td></tr>

<tr class='even' name='noUnusedParameters'>
  <td><code><a href='/tsconfig/#noUnusedParameters'>--noUnusedParameters</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Genera un error cuando no se lee un parámetro de función.</p>
</td></tr>

<tr class='odd' name='out'>
  <td><code><a href='/tsconfig/#out'>--out</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Configuración obsoleta. Utiliza <a href="#outFile"><code>outFile</code></a> en su lugar.</p>
</td></tr>

<tr class='even' name='outDir'>
  <td><code><a href='/tsconfig/#outDir'>--outDir</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica un directorio de salida para todos los archivos emitidos.</p>
</td></tr>

<tr class='odd' name='outFile'>
  <td><code><a href='/tsconfig/#outFile'>--outFile</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica un archivo que agrupa todas las salidas en un archivo JavaScript. Si <a href="#declaration"><code>declaration</code></a> es true, también designa un archivo que agrupa toda la salida .d.ts.</p>
</td></tr>

<tr class='even' name='paths'>
  <td><code><a href='/tsconfig/#paths'>--paths</a></code></td>
  <td><p><code>object</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica un conjunto de entradas que reasignen las importaciones a ubicaciones de búsqueda adicionales.</p>
</td></tr>

<tr class='odd' name='plugins'>
  <td><code><a href='/tsconfig/#plugins'>--plugins</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica una lista de complementos de servicios de idiomas a incluir.</p>
</td></tr>

<tr class='even' name='preserveConstEnums'>
  <td><code><a href='/tsconfig/#preserveConstEnums'>--preserveConstEnums</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> if <a href="#isolatedModules"><code>isolatedModules</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Deshabilita el borrado de declaraciones <code>const enum</code> en el código generado.</p>
</td></tr>

<tr class='odd' name='preserveSymlinks'>
  <td><code><a href='/tsconfig/#preserveSymlinks'>--preserveSymlinks</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la resolución de enlaces simbólicos a su ruta real. Esto se correlaciona con la misma bandera en el nodo.</p>
</td></tr>

<tr class='even' name='preserveValueImports'>
  <td><code><a href='/tsconfig/#preserveValueImports'>--preserveValueImports</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Conserva los valores importados no utilizados en la salida de JavaScript que, de lo contrario, se eliminarían.</p>
</td></tr>

<tr class='odd' name='preserveWatchOutput'>
  <td><code><a href='/tsconfig/#preserveWatchOutput'>--preserveWatchOutput</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la limpieza de la consola en modo observador.</p>
</td></tr>

<tr class='even' name='pretty'>
  <td><code><a href='/tsconfig/#pretty'>--pretty</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>true</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita el color y el formato en la salida para facilitar la lectura de los errores del compilador.</p>
</td></tr>

<tr class='odd' name='reactNamespace'>
  <td><code><a href='/tsconfig/#reactNamespace'>--reactNamespace</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>React</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica el objeto invocado para <code>createElement</code>. Esto solo se aplica cuando se apunta a <code>react</code> JSX emit.</p>
</td></tr>

<tr class='even' name='removeComments'>
  <td><code><a href='/tsconfig/#removeComments'>--removeComments</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Inhabilita la emisión de comentarios.</p>
</td></tr>

<tr class='odd' name='resolveJsonModule'>
  <td><code><a href='/tsconfig/#resolveJsonModule'>--resolveJsonModule</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Habilita la importación de archivos .json</p>
</td></tr>

<tr class='even' name='rootDir'>
  <td><code><a href='/tsconfig/#rootDir'>--rootDir</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p>Calculado a partir de la lista de archivos de entrada.</p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el directorio raíz dentro de tus archivos fuente.</p>
</td></tr>

<tr class='odd' name='rootDirs'>
  <td><code><a href='/tsconfig/#rootDirs'>--rootDirs</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td><p>Calculado a partir de la lista de archivos de entrada.</p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Permite que varios directorios se traten como uno solo al resolver módulos.</p>
</td></tr>

<tr class='even' name='skipDefaultLibCheck'>
  <td><code><a href='/tsconfig/#skipDefaultLibCheck'>--skipDefaultLibCheck</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Omite la verificación de tipos de archivos .d.ts que se incluyen con TypeScript.</p>
</td></tr>

<tr class='odd' name='skipLibCheck'>
  <td><code><a href='/tsconfig/#skipLibCheck'>--skipLibCheck</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Omite la comprobación de tipos de todos los archivos .d.ts.</p>
</td></tr>

<tr class='even' name='sourceMap'>
  <td><code><a href='/tsconfig/#sourceMap'>--sourceMap</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p> Crea archivos de mapas fuente para archivos JavaScript emitidos.</p>
</td></tr>

<tr class='odd' name='sourceRoot'>
  <td><code><a href='/tsconfig/#sourceRoot'>--sourceRoot</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica la ruta raíz para que los depuradores encuentren el código fuente de referencia.</p>
</td></tr>

<tr class='even' name='strict'>
  <td><code><a href='/tsconfig/#strict'>--strict</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Habilita todas las opciones estrictas de verificación de tipo.</p>
</td></tr>

<tr class='odd' name='strictBindCallApply'>
  <td><code><a href='/tsconfig/#strictBindCallApply'>--strictBindCallApply</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Comprueba que los argumentos de los métodos <code>bind</code>, <code>call</code> y <code>apply</code> coincidan con la función original.</p>
</td></tr>

<tr class='even' name='strictFunctionTypes'>
  <td><code><a href='/tsconfig/#strictFunctionTypes'>--strictFunctionTypes</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Al asignar funciones, verifica que los parámetros y los valores devueltos sean compatibles con los subtipos.</p>
</td></tr>

<tr class='odd' name='strictNullChecks'>
  <td><code><a href='/tsconfig/#strictNullChecks'>--strictNullChecks</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Al verificar el tipo, ten en cuenta <code>null</code> y <code>undefined</code>.</p>
</td></tr>

<tr class='even' name='strictPropertyInitialization'>
  <td><code><a href='/tsconfig/#strictPropertyInitialization'>--strictPropertyInitialization</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Comprueba las propiedades de clase que están declaradas pero no establecidas en el constructor.</p>
</td></tr>

<tr class='odd' name='stripInternal'>
  <td><code><a href='/tsconfig/#stripInternal'>--stripInternal</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Desactiva la emisión de declaraciones que tengan <code>@internal</code> en sus comentarios JSDoc.</p>
</td></tr>

<tr class='even' name='suppressExcessPropertyErrors'>
  <td><code><a href='/tsconfig/#suppressExcessPropertyErrors'>--suppressExcessPropertyErrors</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Desactiva la notificación de errores de propiedad excesivos durante la creación del objeto literal. </p>
</td></tr>

<tr class='odd' name='suppressImplicitAnyIndexErrors'>
  <td><code><a href='/tsconfig/#suppressImplicitAnyIndexErrors'>--suppressImplicitAnyIndexErrors</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Suprime los errores <a href="#noImplicitAny"><code>noImplicitAny</code></a> al indexar objetos que carecen de firmas de índice.</p>
</td></tr>

<tr class='even' name='target'>
  <td><code><a href='/tsconfig/#target'>--target</a></code></td>
  <td><p><code>es3</code>, <code>es5</code>, <code>es6</code>/<code>es2015</code>, <code>es2016</code>, <code>es2017</code>, <code>es2018</code>, <code>es2019</code>, <code>es2020</code>, <code>es2021</code>, <code>es2022</code> o <code>esnext</code></p>
</td>
  <td><p><code>ES3</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Configura la versión del lenguaje JavaScript para JavaScript emitido e incluye declaraciones de biblioteca compatibles.</p>
</td></tr>

<tr class='odd' name='traceResolution'>
  <td><code><a href='/tsconfig/#traceResolution'>--traceResolution</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><p><code>false</code></p>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Rutas de registro utilizadas durante el proceso de <a href="#moduleResolution"><code>moduleResolution</code></a>.</p>
</td></tr>

<tr class='even' name='tsBuildInfoFile'>
  <td><code><a href='/tsconfig/#tsBuildInfoFile'>--tsBuildInfoFile</a></code></td>
  <td><p><code>string</code></p>
</td>
  <td><p><code>.tsbuildinfo</code></p>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica el directorio para los archivos de compilación incremental .tsbuildinfo.</p>
</td></tr>

<tr class='odd' name='typeRoots'>
  <td><code><a href='/tsconfig/#typeRoots'>--typeRoots</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Especifica varios directorios que actúen como <code>./node_modules/@types</code>.</p>
</td></tr>

<tr class='even' name='types'>
  <td><code><a href='/tsconfig/#types'>--types</a></code></td>
  <td><p><code>list</code></p>
</td>
  <td>
</td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Especifica los nombres de los paquetes de tipo que se incluirán sin que se haga referencia a ellos en un archivo fuente.</p>
</td></tr>

<tr class='odd' name='useDefineForClassFields'>
  <td><code><a href='/tsconfig/#useDefineForClassFields'>--useDefineForClassFields</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#target"><code>target</code></a> es <code>ES2022</code> o superior, incluyendo <code>ESNext</code>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description odd"><td colspan="3">
<p>Emite campos de clase compatibles con el estándar ECMAScript.</p>
</td></tr>

<tr class='even' name='useUnknownInCatchVariables'>
  <td><code><a href='/tsconfig/#useUnknownInCatchVariables'>--useUnknownInCatchVariables</a></code></td>
  <td><p><code>boolean</code></p>
</td>
  <td><ul><li><p><code>true</code> si <a href="#strict"><code>strict</code></a>,</p>
</li><li><p><code>false</code> en caso contrario.</p>
</li></ul></td>
</tr>
<tr class="option-description even"><td colspan="3">
<p>Variables de cláusula catch predeterminada como <code>unknown</code> en lugar de <code>any</code>.</p>
</td></tr>

</tbody></table>
<!-- Fin de sustitución -->

## Relacionado

- Cada opción se explica completamente en la [Referencia de *TSConfig*](/tsconfig).
- Aprende a usar archivos [`tsconfig.json`](/docs/handbook/tsconfig-json.html).
- Aprende a trabajar en un [proyecto de *MSBuild*](/docs/handbook/compiler-options-in-msbuild.html).
