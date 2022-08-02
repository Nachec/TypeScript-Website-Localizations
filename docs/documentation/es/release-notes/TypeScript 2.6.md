---
title: TypeScript 2.6
layout: docs
permalink: /docs/handbook/release-notes/typescript-2-6.html
oneline: Notas de la versión de TypeScript 2.6
---

## Tipos de funciones estrictas

*TypeScript 2.6* introduce una nueva marca de verificación estricta, [`strictFunctionTypes`](/tsconfig#strictFunctionTypes).
El modificador [`strictFunctionTypes`](/tsconfig#strictFunctionTypes) es parte de la familia de modificadores [`strict`](/tsconfig#strict), lo cual significa que por omisión está activado en modo [`strict`](/tsconfig#strict).
Puedes optar por no participar configurando `--strictFunctionTypes false` en tu línea de comandos o en tu `tsconfig.json`.

En [`StrictFunctionTypes`](/tsconfig#StrictFunctionTypes), las posiciones de los parámetros del tipo de función se comprueban *contrariamente* en lugar de *bivariadamente*.
Para conocer algunos antecedentes sobre lo que significa la varianza para los tipos de función, consulta [¿Qué son la covarianza y la contravarianza?](https://www.stephanboyer.com/post/132/what-are-covariance-and-contravariance).

La comprobación más estricta se aplica a todos los tipos de funciones, *excepto* las que se originan en declaraciones de métodos o constructores.
Los métodos se excluyen específicamente para garantizar que las clases e interfaces genéricas (como `Array<T>`) continúen relacionándose principalmente de forma covariable.

Considera el siguiente ejemplo en el que `Animal` es el supertipo de `Dog` y `Cat`:

```ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
declare let f3: (x: Cat) => void;
f1 = f2; // Error con --strictFunctionTypes
f2 = f1; // Bien
f2 = f3; // Error
```

La primera asignación, de manera predeterminada, está permitida en el modo de comprobación de tipos, pero marcada como un error en el modo de tipos de funciones estrictas.
Intuitivamente, el modo predeterminado permite la asignación porque *posiblemente* es sólido, mientras que el modo de tipos de función estricta lo convierte en un error porque *probablemente* no es sólido.
En cualquier modo, la tercera asignación es un error porque *nunca* suena.

Otra forma de describir el ejemplo es que el tipo `(x: T) => void` es *bivariante* (es decir, covariante *o* contravariante) para `T` en el modo de verificación de tipo predeterminado, pero *contravariante* para `T` en el modo de tipos de función estrictos.

##### Ejemplo

```ts
interface Comparer<T> {
  compare: (a: T, b: T) => number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer; // Error
dogComparer = animalComparer; // Bien
```

La primera asignación ahora es un error. Efectivamente, `T` es contravariante en `Comparer<T>` porque se usa solo en posiciones de parámetros de tipo `function`.

Por cierto, ten en cuenta que mientras que algunos lenguajes (por ejemplo, *C#* y *Scala*) requieren anotaciones de varianza (`out`/`in` o `+`/`-`), la varianza surge naturalmente del uso real de un parámetro de tipo dentro de un tipo genérico debido al sistema de tipos estructurales de *TypeScript*.

##### Nota

En [`StrictFunctionTypes`](/tsconfig#StrictFunctionTypes) la primera asignación aún está permitida si `compare` se declaró como un método.
Efectivamente, `T` es bivariante en `Comparer<T>`porque se usa solo en las posiciones de los parámetros del método.

```ts
interface Comparer<T> {
  compare(a: T, b: T): number;
}

declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;

animalComparer = dogComparer; // Bien debido a la bivariancia
dogComparer = animalComparer; // Bien
```

*TypeScript 2.6* también mejora la inferencia de tipos que involucran posiciones contravariantes:

```ts
function combine<T>(...funcs: ((x: T) => void)[]): (x: T) => void {
  return x => {
    for (const f of funcs) f(x);
  };
}

function animalFunc(x: Animal) {}
function dogFunc(x: Dog) {}

let combined = combine(animalFunc, dogFunc); // (x: Dog) => void
```

Arriba, todas las inferencias para "T" se originan en posiciones contravariantes y, por lo tanto, inferimos el *subtipo común más común* para `T`.
Esto contrasta con las inferencias de posiciones covariantes, donde inferimos el *mejor supertipo común*.

## Caché de objetos de plantilla etiquetados en módulos

*TypeScript 2.6* corrige la emisión de la cadena de plantilla etiquetada para alinearse mejor con la especificación *ECMAScript*.
Según la [especificación *ECMAScript*](https://tc39.github.io/ecma262/#sec-gettemplateobject), cada vez que se evalúa una etiqueta de plantilla, el objeto de cadenas de plantilla `same` (el mismo `TemplateStringsArray`) se debe pasar como el primer argumento.
Antes de *TypeScript 2.6*, la salida generada era un objeto de plantilla completamente nuevo cada vez.
Aunque el contenido de la cadena es el mismo, esta emisión afecta a las bibliotecas que utilizan la identidad de la cadena para fines de invalidación de caché, p. ej. [`lit-html`](https://github.com/PolymerLabs/lit-html/issues/58).

##### Ejemplo

```ts
export function id(x: TemplateStringsArray) {
  return x;
}

export function templateObjectFactory() {
  return id`hello world`;
}

let result = templateObjectFactory() === templateObjectFactory(); // true en TS 2.6
```

Resultados en el siguiente código generado:

```js
"use strict";
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, "raw", { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };

function id(x) {
  return x;
}

var _a;
function templateObjectFactory() {
  return id(
    _a || (_a = __makeTemplateObject(["hello world"], ["hello world"]))
  );
}

var result = templateObjectFactory() === templateObjectFactory();
```

> Nota: Este cambio trae un nuevo asistente de emisión, `__makeTemplateObject`;
> si estás utilizando [`importHelpers`](/tsconfig#importHelpers) con [`tslib`](https://github.com/Microsoft/tslib), una actualización a la versión 1.8 o posterior.

## Diagnóstico localizado en la línea de comandos

El paquete *TypeScript 2.6* `npm` se envía con versiones localizadas de mensajes de diagnóstico para 13 idiomas.
Los mensajes localizados están disponibles cuando se usa el indicador `--locale` en la línea de comandos.

##### Ejemplo

Mensajes de error en ruso:

```sh
c:\ts>tsc --v
Version 2.6.0-dev.20171003

c:\ts>tsc --locale ru --pretty c:\test\a.ts

../test/a.ts(1,5): error TS2322: Тип ""string"" не может быть назначен для типа "number".

1 var x: number = "string";
      ~
```

Y ayuda en japonés:

```sh
PS C:\ts> tsc --v
Version 2.6.0-dev.20171003

PS C:\ts> tsc --locale ja-jp
バージョン 2.6.0-dev.20171003
構文: tsc [オプション] [ファイル ...]

例:  tsc hello.ts
    tsc --outFile file.js file.ts
    tsc @args.txt

オプション:
 -h, --help                                 このメッセージを表示します。
 --all                                      コンパイラ オプションをすべて表示します。
 -v, --version                              コンパイラのバージョンを表示します。
 --init                                     TypeScript プロジェクトを初期化して、tsconfig.json ファイルを作成します。
 -p ファイルまたはディレクトリ, --project ファイルまたはディレクトリ  構成ファイルか、'tsconfig.json' を含むフォルダーにパスが指定されたプロジェクトをコ
ンパイルします。
 --pretty                                   色とコンテキストを使用してエラーとメッセージにスタイルを適用します (試験的)。
 -w, --watch                                入力ファイルを監視します。
 -t バージョン, --target バージョン                   ECMAScript のターゲット バージョンを指定します: 'ES3' (既定)、'ES5'、'ES2015'、'ES2016'、'ES2017'、'ES
NEXT'。
 -m 種類, --module 種類                         モジュール コード生成を指定します: 'none'、'commonjs'、'amd'、'system'、'umd'、'es2015'、'ESNext'。
 --lib                                      コンパイルに含めるライブラリ ファイルを指定します:
                                              'es5' 'es6' 'es2015' 'es7' 'es2016' 'es2017' 'esnext' 'dom' 'dom.iterable' 'webworker' 'scripthost' 'es201
5.core' 'es2015.collection' 'es2015.generator' 'es2015.iterable' 'es2015.promise' 'es2015.proxy' 'es2015.reflect' 'es2015.symbol' 'es2015.symbol.wellkno
wn' 'es2016.array.include' 'es2017.object' 'es2017.sharedmemory' 'es2017.string' 'es2017.intl' 'esnext.asynciterable'
 --allowJs                                  javascript ファイルのコンパイルを許可します。
 --jsx 種類                                   JSX コード生成を指定します: 'preserve'、'react-native'、'react'。
 -d, --declaration                          対応する '.d.ts' ファイルを生成します。
 --sourceMap                                対応する '.map' ファイルを生成します。
 --outFile ファイル                             出力を連結して 1 つのファイルを生成します。
 --outDir ディレクトリ                            ディレクトリへ出力構造をリダイレクトします。
 --removeComments                           コメントを出力しないでください。
 --noEmit                                   出力しないでください。
 --strict                                   strict 型チェックのオプションをすべて有効にします。
 --noImplicitAny                            暗黙的な 'any' 型を含む式と宣言に関するエラーを発生させます。
 --strictNullChecks                         厳格な null チェックを有効にします。
 --noImplicitThis                           暗黙的な 'any' 型を持つ 'this' 式でエラーが発生します。
 --alwaysStrict                             厳格モードで解析してソース ファイルごとに "use strict" を生成します。
 --noUnusedLocals                           使用されていないローカルに関するエラーを報告します。
 --noUnusedParameters                       使用されていないパラメーターに関するエラーを報告します。
 --noImplicitReturns                        関数の一部のコード パスが値を返さない場合にエラーを報告します。
 --noFallthroughCasesInSwitch               switch ステートメントに case のフォールスルーがある場合にエラーを報告します。
 --types                                    コンパイルに含む型宣言ファイル。
 @<ファイル>
```

## Suprime errores en archivos `.ts` usando comentarios '//@ts-ignore'

*TypeScript 2.6* admite la supresión de errores en archivos `.js` usando comentarios `//@ ts-ignore` colocados encima de las líneas ofensivas.

##### Ejemplo

```ts
if (false) {
  // @ts-ignore: Error de código inalcanzable
  console.log("hello");
}
```

Un comentario `//@ts-ignore` suprime todos los errores que se originan en la siguiente línea.
Es una práctica recomendada que el resto del comentario que sigue a `@ts-ignore` explique qué error se está suprimiendo.

Ten en cuenta que este comentario solo suprime el informe de errores y te recomendamos que utilices este comentario *con moderación*.

## `tsc --watch` más rápido

*TypeScript 2.6* trae una implementación más rápida de `--watch`.
La nueva versión optimiza la generación de código y la verificación de código base utilizando módulos `ES`.
Los cambios detectados en un archivo de módulo darán como resultado regenerar *solo* el módulo modificado y los archivos que dependen de él, en lugar de todo el proyecto.
Los proyectos con una gran cantidad de archivos se deberían beneficiar al máximo de este cambio.

La nueva implementación también trae mejoras de rendimiento a la visualización en `tsserver`.
La lógica del observador se ha reescrito por completo para responder más rápido a los eventos de cambio.

## Las referencias de solo escritura ahora están marcadas como no utilizadas

*TypeScript 2.6* agrega la implementación revisada de [`noUnusedLocals`](/tsconfig#noUnusedLocals) y [`noUnusedParameters`](/tsconfig#noUnusedParameters) [opciones del compilador](/docs/handbook/compiler-options.html).
Las declaraciones solo se escriben pero nunca se leen desde ahora están marcadas como no utilizadas.

##### Ejemplo

A continuación, tanto `n` como `m` se marcarán como no utilizados, porque sus valores nunca se leen. Anteriormente, *TypeScript* solo verificaba si sus valores estaban *referenciados*.

```ts
function f(n: number) {
  n = 0;
}

class C {
  private m: number;
  constructor() {
    this.m = 0;
  }
}
```

Además, las funciones que solo se llaman dentro de sus propios cuerpos se consideran no utilizadas.

##### Ejemplo

```ts
function f() {
  f(); // Error: Se declara 'f' pero su valor nunca se lee
}
```
