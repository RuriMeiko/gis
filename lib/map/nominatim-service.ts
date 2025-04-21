import type { Coordinate } from "ol/coordinate"
import { fromLonLat, toLonLat } from "ol/proj"

export interface NominatimResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  address?: {
    road?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
    [key: string]: string | undefined
  }
  icon?: string
}

export interface SearchResult {
  id: string
  name: string
  description: string
  coordinates: Coordinate
  type: "location" | "user"
  icon?: string
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

// Search for locations using Nominatim
export async function searchLocationsWithNominatim(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "5",
      "accept-language": "en",
    })

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
      headers: {
        "User-Agent": "GlobalConnectApp/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data: NominatimResult[] = await response.json()

    return data.map((item) => {
      // Create a descriptive name from the address components
      const address = item.address || {}
      const city = address.city || address.town || address.village || ""
      const state = address.state || ""
      const country = address.country || ""

      let description = ""
      if (city && (state || country)) {
        description = [city, state, country].filter(Boolean).join(", ")
      } else {
        description = item.display_name
      }

      return {
        id: `place_${item.place_id}`,
        name: address.road || city || item.display_name.split(",")[0],
        description,
        coordinates: fromLonLat([Number.parseFloat(item.lon), Number.parseFloat(item.lat)]),
        type: "location",
        icon: item.icon,
      }
    })
  } catch (error) {
    console.error("Error searching locations:", error)
    return []
  }
}

// Reverse geocode a coordinate to get address information
export async function reverseGeocode(coordinate: Coordinate): Promise<string> {
  try {
    const [lon, lat] = toLonLat(coordinate)

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: "json",
      addressdetails: "1",
      "accept-language": "en",
    })

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
      headers: {
        "User-Agent": "GlobalConnectApp/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data: NominatimResult = await response.json()
    return data.display_name
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return "Unknown location"
  }
}

// Get route between two points using OSRM API
export interface RouteStep {
  distance: number
  duration: number
  instruction: string
  name: string
  type: string
  way_points: number[]
}

export interface RouteSegment {
  distance: number
  duration: number
  steps: RouteStep[]
}

export interface RouteResponse {
  routes: {
    distance: number
    duration: number
    segments: RouteSegment[]
    geometry: string // Encoded polyline
  }[]
  status: {
    code: number
    message: string
  }
}

export async function getRouteFromNominatim(
  start: Coordinate,
  end: Coordinate,
  mode: "driving" | "walking" | "cycling" = "driving",
): Promise<RouteResponse | null> {
  try {
    const [startLon, startLat] = toLonLat(start)
    const [endLon, endLat] = toLonLat(end)

    // Use OSRM demo server for routing
    // In production, you should use your own OSRM instance or a commercial service
    const profile = mode === "driving" ? "car" : mode === "cycling" ? "bike" : "foot"
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=polyline&steps=true`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform OSRM response to our expected format
    if (data.routes && data.routes.length > 0) {
      return {
        routes: data.routes.map((route: any) => ({
          distance: route.distance,
          duration: route.duration,
          segments: route.legs.map((leg: any) => ({
            distance: leg.distance,
            duration: leg.duration,
            steps: leg.steps.map((step: any) => ({
              distance: step.distance,
              duration: step.duration,
              instruction: step.maneuver.instruction || step.name,
              name: step.name,
              type: step.maneuver.type,
              way_points: step.way_points,
            })),
          })),
          geometry: route.geometry,
        })),
        status: {
          code: 0,
          message: "OK",
        },
      }
    }

    return null
  } catch (error) {
    console.error("Error getting route:", error)
    return null
  }
}
