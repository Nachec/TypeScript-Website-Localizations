---
display: "Importaciones no utilizadas como valores"
oneline: "Especifica el comportamiento de emisión/comprobación para las importaciones que solo se utilizan para tipos."
---

Esta bandera controla cómo funciona `import`, hay 3 opciones diferentes:

- `remove` ⏤ El comportamiento predeterminado de descartar declaraciones `import` que solo hacen referencia a tipos.

- `preserve` ⏤ Conserva todas las declaraciones de `import` cuyos valores o tipos nunca se utilizan. Esto puede hacer que se conserven las importaciones/efectos secundarios.

- `error` ⏤ Esto conserva todas las importaciones (lo mismo que la opción de conservación), pero generará un error cuando una importación de valor solo se use como un tipo. Esto puede ser útil si deseas asegurarte de que no se importen valores accidentalmente, pero aún así, hacer que las importaciones de efectos secundarios sean explícitas.

Esta bandera funciona porque puedes usar el `tipo import` para crear explícitamente una declaración `import` que nunca debería ser emitida en *JavaScript*.
