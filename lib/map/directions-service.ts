import type { Coordinate } from "ol/coordinate"
import { fromLonLat, toLonLat } from "ol/proj"
import { LineString } from "ol/geom"
import { Feature } from "ol"
import { Style, Stroke } from "ol/style"

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

// Get directions between two points
export async function getDirections(request: DirectionsRequest): Promise<DirectionsResult> {
  try {
    // Convert coordinates from EPSG:3857 (Web Mercator) to EPSG:4326 (WGS84)
    const originLonLat = toLonLat(request.origin)
    const destinationLonLat = toLonLat(request.destination)

    // In a real app, you would make an API call to a routing service here
    // For demo purposes, we'll create a more realistic route with waypoints
    const route = createEnhancedRoute(originLonLat, destinationLonLat, request.travelMode)

    return {
      routes: [route],
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

// Create a more realistic route with waypoints
function createEnhancedRoute(
  origin: [number, number],
  destination: [number, number],
  travelMode: "driving" | "walking" | "cycling" = "driving",
): RouteInfo {
  // Calculate distance between points (haversine formula)
  const distance = calculateDistance(origin, destination)

  // Estimate duration based on travel mode and distance
  let speed: number
  switch (travelMode) {
    case "walking":
      speed = 5 // km/h
      break
    case "cycling":
      speed = 15 // km/h
      break
    case "driving":
    default:
      speed = 50 // km/h
      break
  }

  const duration = (distance / speed) * 60 // minutes

  // Create a route with realistic waypoints
  // For a straight line, we'd just need origin and destination
  // For a more realistic route, we'll add some intermediate points with slight deviations
  const numPoints = Math.max(5, Math.ceil(distance / 3)) // At least 5 points, more for longer distances
  const coordinates: Coordinate[] = []

  // Add origin
  coordinates.push(fromLonLat(origin))

  // Add intermediate points with some randomness to simulate real roads
  for (let i = 1; i < numPoints - 1; i++) {
    const fraction = i / (numPoints - 1)
    // Base point on the straight line
    const lat = origin[1] + fraction * (destination[1] - origin[1])
    const lon = origin[0] + fraction * (destination[0] - origin[0])

    // Add some randomness to simulate roads (more for driving, less for walking)
    const deviation = travelMode === "driving" ? 0.01 : 0.005
    const randomLat = lat + (Math.random() - 0.5) * deviation
    const randomLon = lon + (Math.random() - 0.5) * deviation

    coordinates.push(fromLonLat([randomLon, randomLat]))
  }

  // Add destination
  coordinates.push(fromLonLat(destination))

  // Create route geometry
  const geometry = new LineString(coordinates)

  // Create instructions based on the route
  const instructions: RouteInstruction[] = generateInstructions(coordinates, distance, duration, travelMode)

  return {
    distance,
    duration,
    instructions,
    geometry,
  }
}

// Generate realistic turn-by-turn instructions
function generateInstructions(
  coordinates: Coordinate[],
  totalDistance: number,
  totalDuration: number,
  travelMode: "driving" | "walking" | "cycling",
): RouteInstruction[] {
  const instructions: RouteInstruction[] = []
  const numSegments = coordinates.length - 1

  // Start instruction
  instructions.push({
    text: `Start ${travelMode === "driving" ? "driving" : travelMode === "walking" ? "walking" : "cycling"} toward your destination`,
    distance: 0,
    duration: 0,
    maneuver: "start",
  })

  // Intermediate instructions
  let distanceCovered = 0
  let durationCovered = 0

  for (let i = 1; i < numSegments; i++) {
    const segmentDistance = totalDistance * (1 / numSegments)
    const segmentDuration = totalDuration * (1 / numSegments)

    distanceCovered += segmentDistance
    durationCovered += segmentDuration

    // Generate a random instruction based on the segment
    const instructionType = Math.floor(Math.random() * 4)
    let text = ""

    switch (instructionType) {
      case 0:
        text = "Continue straight ahead"
        break
      case 1:
        text = "Turn right onto the next street"
        break
      case 2:
        text = "Turn left at the intersection"
        break
      case 3:
        text = "Slight right at the fork"
        break
      default:
        text = "Continue on your route"
    }

    instructions.push({
      text,
      distance: segmentDistance,
      duration: segmentDuration,
      maneuver: ["straight", "right", "left", "slight-right"][instructionType],
    })
  }

  // Final instruction
  instructions.push({
    text: "Arrive at your destination",
    distance: totalDistance - distanceCovered,
    duration: totalDuration - durationCovered,
    maneuver: "arrive",
  })

  return instructions
}

// Calculate distance between two points using the haversine formula
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((point2[1] - point1[1]) * Math.PI) / 180
  const dLon = ((point2[0] - point1[0]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1[1] * Math.PI) / 180) *
      Math.cos((point2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
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
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  return `${distance.toFixed(1)} km`
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
