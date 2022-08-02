---
display: "Lib"
oneline: "Especifica un conjunto de archivos de declaración de biblioteca empaquetados que describen el entorno de ejecución destino."
---

*TypeScript* incluye un conjunto predeterminado de definiciones de tipos para las *API*s *JS* integradas (como `Math`), así como definiciones de tipos para cosas que se encuentran en entornos de navegador (como `document`).
*TypeScript* también incluye *API*s para funciones *JS* más nuevas que coincidan con el [`target`](#target) que especifiques; por ejemplo, la definición de `Map` está disponible si [`target`](#target) es `ES6` o más reciente.

Es posible que desees cambiarlos por algunas razones:

- Tu programa no se ejecuta en un navegador, por lo que no deseas las definiciones de tipo `"dom"`
- Tu plataforma del entorno de ejecución proporciona ciertos objetos de *API* de *JavaScript* (tal vez a través de `polyfills`), pero aún no es compatible con la sintaxis completa de una versión de *ECMAScript* determinada
- Tienes `polyfills` o implementaciones nativas para algunos, pero no todos, de una versión de *ECMAScript* de nivel superior

En *TypeScript 4.5*, los archivos `lib` se pueden redefinir por módulos `npm`, obtén más información [en el blog](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#supporting-lib-from-node_modules).

### Bibliotecas de alto nivel

| Nombre | Contenido |
| ------- | ------------ |
| `ES5` | Definiciones básicas para todas las funciones de *ES3* y *ES5* |
| `ES2015` | *API*s adicionales disponibles en *ES2015* (también conocido como *ES6*) ⏤ `array.find`, `Promise`, `Proxy`, `Symbol`, `Map`, `Set`, `Reflect`, etc. |
| `ES6`        | Alias para `"ES2015"` |
| `ES2016` | *API*s adicionales disponibles en *ES2016* ⏤ `array.include`, etc. |
| `ES7` | Alias ​​de `"ES2016"` |
| `ES2017` | *API*s adicionales disponibles en *ES2017* ⏤ `Object.entries`, `Object.values`, `Atomics`, `SharedArrayBuffer`, `date.formatToParts`, arrays tipados, etc. |
| `ES2018` | *API*s adicionales disponibles en *ES2018* ⏤ `async` iterables, `promise.finally`, `Intl.PluralRules`, `regexp.groups`, etc. |
| `ES2019` | *API*s adicionales disponibles en *ES2019* ⏤ `array.flat`, `array.flatMap`, `Object.fromEntries`, `string.trimStart`, `string.trimEnd`, etc. |
| `ES2020` | *API*s adicionales disponibles en *ES2020* ⏤ `string.matchAll`, etc.                                                                                     |
| `ES2021` | *API*s adicionales disponibles en *ES2021* ⏤ `promise.any`, `string.replaceAll`, etc. |
| `ESNext` | *API*s adicionales disponibles en *ESNext* ⏤ Esto cambia a medida que evoluciona la especificación de *JavaScript* |
| `DOM` | Definiciones de [*DOM*](https://developer.mozilla.org/docs/Glossary/DOM) ⏤ `window`, `document`, etc. |
| `WebWorker` | *API*s disponibles en contextos de [*WebWorker*](https://developer.mozilla.org/docs/Web/API/Web_Workers_API/Using_web_workers) |
| `ScriptHost` | *API*s para [*Windows Script Hosting System*](https://wikipedia.org/wiki/Windows_Script_Host) |

### Componentes individuales de la biblioteca

| Nombre |
| -------------------- |
| `DOM.Iterable` |
| `ES2015.Core` |
| `ES2015.Collection` |
| `ES2015.Generator` |
| `ES2015.Iterable` |
| `ES2015.Promise` |
| `ES2015.Proxy` |
| `ES2015.Reflect` |
| `ES2015.Symbol` |
| `ES2015.Symbol.WellKnown` |
| `ES2016.Array.Include` |
| `ES2017.object` |
| `ES2017.Intl` |
| `ES2017.SharedMemory` |
| `ES2017.String` |
| `ES2017.TypedArrays` |
| `ES2018.Intl` |
| `ES2018.Promise` |
| `ES2018.RegExp` |
| `ES2019.Array` |
| `ES2019.Object` |
| `ES2019.String` |
| `ES2019.Symbol` |
| `ES2020.String` |
| `ES2020.Symbol.wellknown` |
| `ES2021.Promise` |
| `ES2021.String` |
| `ES2021.Weakref` |
| `ESNext.AsyncIterable` |
| `ESNext.Array` |
| `ESNext.Intl` |
| `ESNext.Symbol` |

Esta lista puede estar desactualizada, puedes ver la lista completa en el [código fuente de *TypeScript*](https://github.com/microsoft/TypeScript/tree/main/lib).
