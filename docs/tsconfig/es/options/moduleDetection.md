---
display: "moduleDetection"
oneline: "Controla qué método se usa para detectar si un archivo JS es un módulo."
---

Hay tres opciones: 

- `"auto"` (predeterminado) - *TypeScript* no solo buscará declaraciones `import` y `export`, sino que también verificará si el campo `"type"` en un `package.json` está configurado como `"module"` cuando se ejecuta con [`module`](#module): `nodenext` o `node16`, y verifica si el archivo actual es un archivo *JSX* cuando se ejecuta bajo [`jsx`](#jsx):  `react-jsx`.

- `"legacy"` - El mismo comportamiento que 4.6 y versiones anteriores, utilizando declaraciones `import` y `export` para determinar si un archivo es un módulo.

- `"force"` - Garantiza que todos los archivos que no sean de declaración se traten como un módulo.
