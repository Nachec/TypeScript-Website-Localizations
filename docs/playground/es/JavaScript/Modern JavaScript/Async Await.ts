//// { "order": 1, "target": "es5" }

// El JavaScript moderno agregó una forma de manejar devoluciones de llamada en una
// manera elegante agregando una API basada en Promise que tiene sintaxis
// especial que te permite tratar el código asincrónico como si
// actuara sincrónicamente.

// Como todas las funciones del lenguaje, esta es una compensación en
// complejidad: hacer una función asincrónica significa tu regreso
// de valores están envueltos en promesas. ¿Qué solía devolver una
// cadena, ahora devuelve una Promise<string>.

const func = () => ":wave:";
const asyncFunc = async () => ":wave:";

const myString = func();
const myPromiseString = asyncFunc();

myString.length;

// myPromiseString es una Promise, no la cadena:

myPromiseString.length;

// Puedes utilizar la palabra clave await para convertir una promesa.
// en su valor. Hoy, estos solo funcionan dentro de una función
//  async.

const myWrapperFunction = async () => {
  const myString = func();
  const myResolvedPromiseString = await asyncFunc();

  // A través de la palabra clave await, ahora myResolvedPromiseString
  // es una cadena
  myString.length;
  myResolvedPromiseString.length;
};

// El código que se ejecuta a través de un await puede generar errores,
// y es importante detectar esos errores en alguna parte.

const myThrowingFunction = async () => {
  throw new Error("Do not call this");
};

// Podemos envolver llamando a una función asíncrona en un intento de captura para
// manejar casos donde la función actúa inesperadamente.

const asyncFunctionCatching = async () => {
  const myReturnValue = "Hello world";
  try {
    await myThrowingFunction();
  } catch (error) {
    console.error("myThrowingFunction failed", error);
  }
  return myReturnValue;
};

// Debido a la ergonomía de esta API, ya sea regresando
// un solo valor, o lanzando, deberías considerar ofrecer
// información sobre el resultado dentro del valor devuelto y
// usar throw solo cuando algo realmente excepcional haya
// ocurrido.

const exampleSquareRootFunction = async (input: any) => {
  if (isNaN(input)) {
    throw new Error("Only numbers are accepted");
  }

  if (input < 0) {
    return { success: false, message: "Cannot square root negative number" };
  } else {
    return { success: true, value: Math.sqrt(input) };
  }
};

// Luego, los consumidores de la función pueden verificar la respuesta y
// averigüa qué hacer con su valor de retorno. Mientras esto
// es un ejemplo trivial, una vez que hayas comenzado a trabajar con
// código de red estas API vale la pena la sintaxis adicional.

const checkSquareRoot = async (value: number) => {
  const response = await exampleSquareRootFunction(value);
  if (response.success) {
    response.value;
  }
};

// Async/Await tomó un código que se veía así:

// getResponse(url, (response) => {
//   getResponse(response.url, (secondResponse) => {
//     const responseData = secondResponse.data
//     getResponse(responseData.url, (thirdResponse) => {
//       ...
//     })
//   })
// })

// Y deja que se vuelva lineal como:

// const response = await getResponse(url)
// const secondResponse = await getResponse(response.url)
// const responseData = secondResponse.data
// const thirdResponse = await getResponse(responseData.url)
// ...

// Lo que puedes hacer que el código se sienta más cerca del borde izquierdo y
// ser leído con un ritmo constante.
