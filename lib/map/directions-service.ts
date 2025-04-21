import type { Coordinate } from "ol/coordinate"
import { fromLonLat, toLonLat } from "ol/proj"
import { LineString } from "ol/geom"
import { Feature } from "ol"
import { Style, Stroke } from "ol/style"
import { decode } from "@/lib/map/polyline"

// Interface for route information
export interface RouteInfo {
  distance: number // in kilometers
  duration: number // in minutes
  instructions: RouteInstruction[]
  geometry: LineString
}

export interface RouteInstruction {
  text: string
  distance: number
  duration: number
  maneuver?: string
}

export interface DirectionsRequest {
  origin: Coordinate
  destination: Coordinate
  waypoints?: Coordinate[]
  travelMode?: "driving" | "walking" | "cycling"
}

export interface DirectionsResult {
  routes: RouteInfo[]
  status: "OK" | "ZERO_RESULTS" | "ERROR"
  errorMessage?: string
}

// Get directions between two points using OSRM
export async function getDirections(request: DirectionsRequest): Promise<DirectionsResult> {
  try {
    // Convert coordinates from EPSG:3857 (Web Mercator) to EPSG:4326 (WGS84)
    const originLonLat = toLonLat(request.origin)
    const destinationLonLat = toLonLat(request.destination)

    // Use OSRM for routing
    const profile = request.travelMode === "driving" ? "car" : request.travelMode === "cycling" ? "bike" : "foot"
    const url = `https://router.project-osrm.org/route/v1/${profile}/${originLonLat[0]},${originLonLat[1]};${destinationLonLat[0]},${destinationLonLat[1]}?overview=full&geometries=polyline&steps=true`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return {
        routes: [],
        status: "ZERO_RESULTS",
      }
    }

    // Process the route data
    const route = data.routes[0]
    const decodedGeometry = decode(route.geometry)
    const coordinates = decodedGeometry.map((point) => fromLonLat([point[1], point[0]]))

    // Create a LineString geometry for the route
    const routeGeometry = new LineString(coordinates)

    // Create instructions from steps
    const instructions: RouteInstruction[] = []

    // Add start instruction
    instructions.push({
      text: "Start",
      distance: 0,
      duration: 0,
      maneuver: "start",
    })

    // Process legs and steps
    if (route.legs && route.legs.length > 0) {
      route.legs.forEach((leg) => {
        if (leg.steps) {
          leg.steps.forEach((step) => {
            instructions.push({
              text: step.maneuver?.instruction || "Continue",
              distance: step.distance,
              duration: step.duration,
              maneuver: step.maneuver?.type,
            })
          })
        }
      })
    }

    // Add end instruction
    instructions.push({
      text: "Arrive at destination",
      distance: 0,
      duration: 0,
      maneuver: "arrive",
    })

    const routeInfo: RouteInfo = {
      distance: route.distance,
      duration: route.duration,
      instructions,
      geometry: routeGeometry,
    }

    return {
      routes: [routeInfo],
      status: "OK",
    }
  } catch (error) {
    console.error("Error getting directions:", error)
    return {
      routes: [],
      status: "ERROR",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create a route feature with styling
export function createRouteFeature(route: RouteInfo): Feature {
  const feature = new Feature({
    geometry: route.geometry,
    name: "Route",
    route: route,
  })

  feature.setStyle(
    new Style({
      stroke: new Stroke({
        color: "#3b82f6",
        width: 6,
      }),
    }),
  )

  return feature
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`
  }
  return `${(distance / 1000).toFixed(1)} km`
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours} h ${mins} min`
}
