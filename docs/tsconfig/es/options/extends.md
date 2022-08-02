---
display: "Extends"
oneline: "Especifica una o más referencias de node module o ruta a los archivos de configuración base de los que se heredan las configuraciones."
---

El valor de `extends` es una cadena que contiene una ruta a otro archivo de configuración para heredar.
La ruta puede usar una resolución de estilo *Node.js*.

La configuración del archivo base se carga primero y luego se reemplaza por las del archivo de configuración heredado. Todas las rutas relativas que se encuentren en el archivo de configuración se resolverán en relación con el archivo de configuración en el que se originaron.

Vale la pena señalar que [`files`](#files), [`include`](#include) y `exclude` del archivo de configuración heredado *sobrescribe* los del
archivo de configuración base, y esa circularidad entre archivos de configuración no está permitida.

Actualmente, la única propiedad de nivel superior que está excluida de la herencia es [`references`](#references).

##### Ejemplo

`configs/base.json`:

```json tsconfig
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

`tsconfig.json`:

```json tsconfig
{
  "extends": "./configs/base",
  "files": ["main.ts", "supplemental.ts"]
}
```

`tsconfig.nostrictnull.json`:

```json tsconfig
{
  "extends": "./tsconfig",
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

Las propiedades con rutas relativas encontradas en el archivo de configuración, que no están excluidas de la herencia, se resolverán en relación con el archivo de configuración en el que se originaron.
