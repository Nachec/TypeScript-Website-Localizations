//// { "compiler": { "ts": "4.0.2" } }
// Las tuplas son arreglos donde el orden es importante para el sistema de tipos,
// puedes aprender más sobre ellos en example:tuples

// En TypeScript 4.0, el tipo Tupla adquirió la capacidad de dar
// un nombre para las diferentes partes del arreglo.

// Por ejemplo, solía escribir una ubicación Lat Long a través de una tupla:

type OldLocation = [number, number]

const locations: OldLocation[] = [
    [40.7144, -74.006],
    [53.6458, -1.785]
]

// Saber cuál es la latitud y la longitud es ambiguo, por lo que
// lo más probable es que lo hubieras llamado tupla LatLong.

// Con 4.0, puedes escribir:

type NewLocation = [lat: number, long: number]

const newLocations: NewLocation[] = [
    [52.3702, 4.8952],
    [53.3498, -6.2603]
]

// Los nombres ahora aparecen en el editor cuando pasas el cursor sobre
// el 0 y el 1 al final de la siguiente línea
const firstLat = newLocations[0][0]
const firstLong = newLocations[0][1]

// Si bien eso puede parecer un poco decepcionante, el objetivo principal 
// es garantizar que la información no se pierda al trabajar
// con el sistema de tipos. Por ejemplo, al extraer
// parámetros de una función usando la utilidad 
// Parameter de tipo:

function centerMap(lng: number, lat: number) { }

// En 4.0, esto mantiene lng y lat
type CenterMapParams = Parameters<typeof centerMap>

// En 3.9, esto se vería así
type OldCenterMapParams = [number, number]

// Haciendo que alguna manipulación de los tipos más complejos tenga pérdidas
// en la información de los parámetros.
