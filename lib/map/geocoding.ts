import type { Coordinate } from "ol/coordinate"
import { fromLonLat } from "ol/proj"

export interface GeocodingResult {
  address: string
  coordinate: Coordinate
  placeId?: string
}

// Common locations for autocomplete suggestions
const commonLocations = [
  { name: "New York", coordinates: [-74.006, 40.7128] },
  { name: "London", coordinates: [-0.1278, 51.5074] },
  { name: "Paris", coordinates: [2.3522, 48.8566] },
  { name: "Tokyo", coordinates: [139.6503, 35.6762] },
  { name: "Sydney", coordinates: [151.2093, -33.8688] },
  { name: "Berlin", coordinates: [13.405, 52.52] },
  { name: "Rome", coordinates: [12.4964, 41.9028] },
  { name: "Madrid", coordinates: [-3.7038, 40.4168] },
  { name: "Moscow", coordinates: [37.6173, 55.7558] },
  { name: "Beijing", coordinates: [116.4074, 39.9042] },
  { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  { name: "Chicago", coordinates: [-87.6298, 41.8781] },
  { name: "Toronto", coordinates: [-79.3832, 43.6532] },
  { name: "Dubai", coordinates: [55.2708, 25.2048] },
  { name: "Singapore", coordinates: [103.8198, 1.3521] },
  { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
  { name: "Barcelona", coordinates: [2.1734, 41.3851] },
  { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  { name: "Miami", coordinates: [-80.1918, 25.7617] },
  { name: "Bangkok", coordinates: [100.5018, 13.7563] },
]

// Search for locations based on a query string
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return []
  }

  // Filter locations that match the query
  const matches = commonLocations
    .filter((location) => location.name.toLowerCase().includes(normalizedQuery))
    .map((location) => ({
      address: location.name,
      coordinate: fromLonLat(location.coordinates),
      placeId: `place_${location.name.toLowerCase().replace(/\s/g, "_")}`,
    }))

  // Add some variations for more suggestions
  if (matches.length < 5) {
    const extraMatches = commonLocations
      .filter((location) => !location.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 5 - matches.length)
      .map((location) => ({
        address: `${location.name} (Popular destination)`,
        coordinate: fromLonLat(location.coordinates),
        placeId: `place_${location.name.toLowerCase().replace(/\s/g, "_")}_popular`,
      }))

    return [...matches, ...extraMatches]
  }

  return matches
}

// Mock geocoding service for demonstration
// In a real app, you would integrate with a geocoding API like Mapbox, Google Maps, or Nominatim
export async function geocode(address: string): Promise<GeocodingResult[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check for exact matches in common locations
  const normalizedAddress = address.toLowerCase()

  for (const location of commonLocations) {
    if (location.name.toLowerCase().includes(normalizedAddress)) {
      return [
        {
          address: location.name,
          coordinate: fromLonLat(location.coordinates),
          placeId: `place_${location.name.toLowerCase().replace(/\s/g, "_")}`,
        },
      ]
    }
  }

  // If no exact match, return a random location
  const randomLocation = commonLocations[Math.floor(Math.random() * commonLocations.length)]

  return [
    {
      address: `${address} (near ${randomLocation.name})`,
      coordinate: fromLonLat(randomLocation.coordinates),
      placeId: `place_${randomLocation.name.toLowerCase().replace(/\s/g, "_")}_approx`,
    },
  ]
}

export async function reverseGeocode(coordinate: Coordinate): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, you would make an API call to a geocoding service
  return "Current Location"
}
