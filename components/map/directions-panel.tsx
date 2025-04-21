"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Coordinate } from "ol/coordinate"
import { MapPin, Navigation, X, CornerDownLeft, Clock, Route, Car, FootprintsIcon as Walking, Bike } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/map/directions-service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LocationSearch } from "@/components/map/location-search"
import { reverseGeocode } from "@/lib/map/nominatim-service"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/types/user"

interface DirectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  onDirectionsRequest: (
    origin: Coordinate,
    destination: Coordinate,
    travelMode: "driving" | "walking" | "cycling",
  ) => void
  directionsResult?: any
  isLoading: boolean
  userLocation?: Coordinate
  users?: User[]
}

export function DirectionsPanel({
  isOpen,
  onClose,
  onDirectionsRequest,
  directionsResult,
  isLoading,
  userLocation,
  users = [],
}: DirectionsPanelProps) {
  const [origin, setOrigin] = useState<{ name: string; coordinates?: Coordinate }>({ name: "" })
  const [destination, setDestination] = useState<{ name: string; coordinates?: Coordinate }>({ name: "" })
  const [travelMode, setTravelMode] = useState<"driving" | "walking" | "cycling">("driving")
  const [userLocationName, setUserLocationName] = useState<string>("My Location")
  const [activeRoute, setActiveRoute] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Set active route when directions result changes
  useEffect(() => {
    if (directionsResult?.status === "OK" && directionsResult.routes && directionsResult.routes.length > 0) {
      setActiveRoute(directionsResult.routes[0])
      setError(null)
    } else if (directionsResult?.status === "ZERO_RESULTS") {
      setActiveRoute(null)
      setError("No route found between these locations. Please try different locations.")
    } else if (directionsResult?.status === "ERROR") {
      setActiveRoute(null)
      setError(directionsResult.errorMessage || "An error occurred while calculating the route.")
    } else {
      setActiveRoute(null)
    }
  }, [directionsResult])

  // Get user location name
  useEffect(() => {
    if (userLocation) {
      const fetchLocationName = async () => {
        try {
          const name = await reverseGeocode(userLocation)
          setUserLocationName(name.split(",")[0] || "My Location")
        } catch (error) {
          console.error("Error getting location name:", error)
          setUserLocationName("My Location")
        }
      }
      fetchLocationName()
    }
  }, [userLocation])

  // Use current location
  const useCurrentLocation = () => {
    if (userLocation) {
      setOrigin({
        name: userLocationName,
        coordinates: userLocation,
      })
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!origin.coordinates) {
      setError("Please select a valid starting point")
      return
    }

    if (!destination.coordinates) {
      setError("Please select a valid destination")
      return
    }

    onDirectionsRequest(origin.coordinates, destination.coordinates, travelMode)
  }

  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-0 left-0 z-20 h-full w-full max-w-md bg-background border-r shadow-lg flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Directions</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 border-b">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label htmlFor="origin" className="sr-only">
                  Starting point
                </Label>
                <LocationSearch
                  placeholder="Starting point"
                  onLocationSelect={(result) => {
                    setOrigin({
                      name: result.name,
                      coordinates: result.coordinates,
                    })
                  }}
                  includeUsers={true}
                />
              </div>
              {userLocation && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  className="whitespace-nowrap"
                >
                  My Location
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full ml-5"
                onClick={swapLocations}
              >
                <CornerDownLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label htmlFor="destination" className="sr-only">
                  Destination
                </Label>
                <LocationSearch
                  placeholder="Destination"
                  onLocationSelect={(result) => {
                    setDestination({
                      name: result.name,
                      coordinates: result.coordinates,
                    })
                  }}
                  includeUsers={true}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Travel mode</Label>
            <RadioGroup
              value={travelMode}
              onValueChange={(value) => setTravelMode(value as "driving" | "walking" | "cycling")}
              className="flex space-x-2"
            >
              <div className="flex flex-1 items-center justify-center">
                <RadioGroupItem value="driving" id="driving" className="sr-only" />
                <Label
                  htmlFor="driving"
                  className={cn(
                    "flex flex-col items-center justify-center w-full p-2 rounded-md cursor-pointer border",
                    travelMode === "driving" ? "bg-primary/10 border-primary" : "hover:bg-accent",
                  )}
                >
                  <Car className={cn("h-5 w-5", travelMode === "driving" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs mt-1">Driving</span>
                </Label>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <RadioGroupItem value="walking" id="walking" className="sr-only" />
                <Label
                  htmlFor="walking"
                  className={cn(
                    "flex flex-col items-center justify-center w-full p-2 rounded-md cursor-pointer border",
                    travelMode === "walking" ? "bg-primary/10 border-primary" : "hover:bg-accent",
                  )}
                >
                  <Walking
                    className={cn("h-5 w-5", travelMode === "walking" ? "text-primary" : "text-muted-foreground")}
                  />
                  <span className="text-xs mt-1">Walking</span>
                </Label>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <RadioGroupItem value="cycling" id="cycling" className="sr-only" />
                <Label
                  htmlFor="cycling"
                  className={cn(
                    "flex flex-col items-center justify-center w-full p-2 rounded-md cursor-pointer border",
                    travelMode === "cycling" ? "bg-primary/10 border-primary" : "hover:bg-accent",
                  )}
                >
                  <Bike
                    className={cn("h-5 w-5", travelMode === "cycling" ? "text-primary" : "text-muted-foreground")}
                  />
                  <span className="text-xs mt-1">Cycling</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !origin.name || !destination.name}>
            {isLoading ? "Getting directions..." : "Get Directions"}
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  {i < 3 && <Skeleton className="w-0.5 h-16 mt-1" />}
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeRoute && !isLoading && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDuration(activeRoute.duration / 60)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDistance(activeRoute.distance)}</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {activeRoute.instructions.map((instruction: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === activeRoute.instructions.length - 1
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < activeRoute.instructions.length - 1 && (
                      <div className="w-0.5 h-full bg-muted-foreground/20 my-1" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{instruction.text}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDistance(instruction.distance)}</span>
                      {instruction.duration > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(instruction.duration / 60)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
