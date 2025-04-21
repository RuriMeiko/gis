export function decode(str: string, precision = 5): number[][] {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates: number[][] = []
  let shift = 0
  let result = 0
  let byte = null
  const factor = Math.pow(10, precision)

  while (index < str.length) {
    // Reset shift, result
    byte = null
    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    // Reset shift, result
    shift = 0
    result = 0

    do {
      byte = str.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}

/**
 * Encodes a series of coordinates into an encoded polyline string
 * @param coordinates Array of [lat, lng] coordinates
 * @param precision The precision (default: 5)
 * @returns Encoded polyline string
 */
export function encode(coordinates: number[][], precision = 5): string {
  if (!coordinates.length) return ""

  const factor = Math.pow(10, precision)
  let output = ""
  let lat = 0
  let lng = 0

  for (let i = 0; i < coordinates.length; i++) {
    const point = coordinates[i]
    const latRound = Math.round(point[0] * factor)
    const lngRound = Math.round(point[1] * factor)

    const deltaLat = latRound - lat
    const deltaLng = lngRound - lng

    lat = latRound
    lng = lngRound

    output += encodeValue(deltaLat) + encodeValue(deltaLng)
  }

  return output
}

function encodeValue(value: number): string {
  let output = ""
  let v = value < 0 ? ~(value << 1) : value << 1

  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  output += String.fromCharCode(v + 63)
  return output
}
