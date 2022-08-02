//// { "compiler": { "ts": "3.8.3" } }
// En versiones anteriores de TypeScript, el corrector no
// verifica que los campos no declarados en una unión se ajusten a tipos
// any indexados en la unión.

// Puedes obtener información sobre los tipos indexados aquí: example:indexed-types

// Por ejemplo, el IdentifierCache a continuación indica que la
// clave any del objeto será un número:

type IdentifierCache = { [key: string]: number };

// Lo cual significa que esto fallará, porque 'file_a' tiene un
// valor string

const cacheWithString: IdentifierCache = { file_a: "12343" };

// Sin embargo, cuando pones eso en una unión, entonces la
// comprobación de validación no sucederá:

let userCache: IdentifierCache | { index: number };
userCache = { file_one: 5, file_two: "abc" };

// Esto está arreglado y habría un error sobre
// 'file_two' del compilador.

// Esto también tiene en cuenta cuando la clave es de un tipo
// diferente, por ejemplo: ([key: string] and [key: number])

type IdentifierResponseCache = { [key: number]: number };

let resultCache: IdentifierCache | IdentifierResponseCache;
resultCache = { file_one: "abc" };
