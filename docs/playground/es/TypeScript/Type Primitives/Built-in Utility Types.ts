//// { "order": 3, "compiler": { "strictNullChecks": true } }

// Cuando un tipo en particular se siente útil en la mayoría
// del código base, se agrega a TypeScript y se vuelve
// disponible para cualquiera, lo cual significa que puedes
// confiar en su disponibilidad

// Partial<Type>

// Toma un tipo y convierte todas sus propiedades
// a opcionales.

interface Sticker {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  submitter: undefined | string;
}

type StickerUpdateParam = Partial<Sticker>;

// Readonly<Type>

// Toma un objeto y hace que sus propiedades sean de solo lectura.

type StickerFromAPI = Readonly<Sticker>;

// Record<KeysFrom, Type>

// Crea un tipo que usa la lista de propiedades de
// KeysFrom y les da el valor de Type.

// Enumera de qué claves provienen:
type NavigationPages = "home" | "stickers" | "about" | "contact";

// La forma de los datos para los que se necesita cada ^:
interface PageInfo {
  title: string;
  url: string;
  axTitle?: string;
}

const navigationInfo: Record<NavigationPages, PageInfo> = {
  home: { title: "Home", url: "/" },
  about: { title: "About", url: "/about" },
  contact: { title: "Contact", url: "/contact" },
  stickers: { title: "Stickers", url: "/stickers/all" },
};

// Pick<Type, Keys>

// Crea un tipo seleccionando el conjunto de propiedades Keys
// de Type. Esencialmente una lista de permitidos para extraer
// información de un tipo.

type StickerSortPreview = Pick<Sticker, "name" | "updatedAt">;

// Omit<Type, Keys>

// Crea un tipo eliminando el conjunto de propiedades Keys
// de Type. Esencialmente una lista de bloqueo para extraer
// información de un tipo.

type StickerTimeMetadata = Omit<Sticker, "name">;

// Exclude<Type, RemoveUnion>

// Crea un tipo donde cualquier propiedad en las propiedades del tipo
// que no se superponen con RemoveUnion.

type HomeNavigationPages = Exclude<NavigationPages, "home">;

// Extract<Type, MatchUnion>

// Crea un tipo donde cualquier propiedad en las propiedades del tipo
// se incluyen si se superponen con MatchUnion.

type DynamicPages = Extract<NavigationPages, "home" | "stickers">;

// NonNullable<Type>

// Crea un tipo excluyendo null y undefined de un conjunto
// de propiedades. Útil cuando tienes una comprobación de validez.

type StickerLookupResult = Sticker | undefined | null;
type ValidatedResult = NonNullable<StickerLookupResult>;

// ReturnType<Type>

// Extrae el valor de retorno de un tipo.

declare function getStickerByID(id: number): Promise<StickerLookupResult>;
type StickerResponse = ReturnType<typeof getStickerByID>;

// InstanceType<Type>

// Crea un tipo que es una instancia de una clase u objeto
// con una función constructora.

class StickerCollection {
  stickers: Sticker[];
}

type CollectionItem = InstanceType<typeof StickerCollection>;

// Required<Type>

// Crea un tipo que convierte todas las propiedades opcionales
// a requeridas.

type AccessiblePageInfo = Required<PageInfo>;

// ThisType<Type>

// A diferencia de otros tipos, ThisType no devuelve un nuevo
// tipo, pero en su lugar manipula la definición de this
// dentro de una función. Solo puedes usar ThisType cuando
// have noImplicitThis activado en tu TSConfig.

// https://www.typescriptlang.org/docs/handbook/utility-types.html
