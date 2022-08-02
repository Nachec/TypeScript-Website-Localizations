---
display: "Generar perfil de CPU"
oneline: "Emite un perfil de CPU v8 del compilador ejecutado para depuración."
---

Esta opción le da la oportunidad de que *TypeScript* emita un perfil de *CPU v8* durante la ejecución del compilador. El perfil de la *CPU* puede proporcionar información sobre por qué sus compilaciones pueden ser lentas.

Esta opción solo se puede utilizar desde la *CLI* a través de: `--generateCpuProfile tsc-output.cpuprofile`.

```sh
npm run tsc --generateCpuProfile tsc-output.cpuprofile
```

Este archivo se puede abrir en un navegador basado en *Chrome* como *Chrome* o *Edge Developer* en la sección [el perfil de *CPU*](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/js-execution).
Puedes obtener más información sobre cómo comprender el rendimiento de los compiladores en la [sección wiki de *TypeScript* sobre rendimiento](https://github.com/microsoft/TypeScript/wiki/Performance).
