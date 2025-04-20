"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Coordinate } from "ol/coordinate"
import { MapPin, Navigation, X, CornerDownLeft, Clock, Route } from "lucide-react"
import { type DirectionsResult, type RouteInfo, formatDistance, formatDuration } from "@/lib/map/directions-service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { searchLocations } from "@/lib/map/geocoding"

interface DirectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  onDirectionsRequest: (
    origin: string | Coordinate,
    destination: string | Coordinate,
    travelMode: "driving" | "walking" | "cycling",
  ) => void
  directionsResult?: DirectionsResult
  isLoading: boolean
  userLocation?: Coordinate
}

export function DirectionsPanel({
  isOpen,
  onClose,
  onDirectionsRequest,
  directionsResult,
  isLoading,
  userLocation,
}: DirectionsPanelProps) {
  const [origin, setOrigin] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [travelMode, setTravelMode] = useState<"driving" | "walking" | "cycling">("driving")
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null)

  // Autocomplete states
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ id: string; name: string }>>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<Array<{ id: string; name: string }>>([])
  const [originOpen, setOriginOpen] = useState(false)
  const [destinationOpen, setDestinationOpen] = useState(false)
  const [originSearching, setOriginSearching] = useState(false)
  const [destinationSearching, setDestinationSearching] = useState(false)

  // Debounce timers
  const originTimerRef = useRef<NodeJS.Timeout | null>(null)
  const destinationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Set active route when directions result changes
  useEffect(() => {
    if (directionsResult?.routes && directionsResult.routes.length > 0) {
      setActiveRoute(directionsResult.routes[0])
    } else {
      setActiveRoute(null)
    }
  }, [directionsResult])

  // Handle origin input change with debounce
  const handleOriginChange = (value: string) => {
    setOrigin(value)

    if (originTimerRef.current) {
      clearTimeout(originTimerRef.current)
    }

    if (value.length > 2) {
      setOriginSearching(true)
      originTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchLocations(value)
          setOriginSuggestions(
            results.map((item) => ({
              id: item.placeId || item.address,
              name: item.address,
            })),
          )
        } catch (error) {
          console.error("Error searching locations:", error)
        } finally {
          setOriginSearching(false)
        }
      }, 300)
    } else {
      setOriginSuggestions([])
    }
  }

  // Handle destination input change with debounce
  const handleDestinationChange = (value: string) => {
    setDestination(value)

    if (destinationTimerRef.current) {
      clearTimeout(destinationTimerRef.current)
    }

    if (value.length > 2) {
      setDestinationSearching(true)
      destinationTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchLocations(value)
          setDestinationSuggestions(
            results.map((item) => ({
              id: item.placeId || item.address,
              name: item.address,
            })),
          )
        } catch (error) {
          console.error("Error searching locations:", error)
        } finally {
          setDestinationSearching(false)
        }
      }, 300)
    } else {
      setDestinationSuggestions([])
    }
  }

  // Use current location
  const useCurrentLocation = () => {
    if (userLocation) {
      setOrigin("My Location")
      // In a real app, you would reverse geocode the coordinates to get a readable address
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Use coordinates if origin is "My Location"
    const originValue = origin === "My Location" && userLocation ? userLocation : origin

    onDirectionsRequest(originValue, destination, travelMode)
  }

  // Swap origin and destination
  const swapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originTimerRef.current) {
        clearTimeout(originTimerRef.current)
      }
      if (destinationTimerRef.current) {
        clearTimeout(destinationTimerRef.current)
      }
    }
  }, [])

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
                <Input
                  id="origin"
                  placeholder="Starting point"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  required
                  className="w-full"
                />
                {origin.length > 2 && originSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full max-w-[300px] mt-1 bg-background border rounded-md shadow-md">
                    <ul className="py-1">
                      {originSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setOrigin(suggestion.name)
                            setOriginSuggestions([])
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                          {suggestion.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <Input
                  id="destination"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  required
                  className="w-full"
                />
                {destination.length > 2 && destinationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full max-w-[300px] mt-1 bg-background border rounded-md shadow-md">
                    <ul className="py-1">
                      {destinationSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setDestination(suggestion.name)
                            setDestinationSuggestions([])
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                          {suggestion.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="driving" id="driving" />
                <Label htmlFor="driving" className="cursor-pointer">
                  Driving
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="walking" id="walking" />
                <Label htmlFor="walking" className="cursor-pointer">
                  Walking
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="cycling" id="cycling" />
                <Label htmlFor="cycling" className="cursor-pointer">
                  Cycling
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Getting directions..." : "Get Directions"}
          </Button>
        </form>
      </div>

      {directionsResult?.status === "ZERO_RESULTS" && (
        <div className="p-4 text-center text-muted-foreground">No routes found. Please try different locations.</div>
      )}

      {directionsResult?.status === "ERROR" && (
        <div className="p-4 text-center text-destructive">
          Error getting directions: {directionsResult.errorMessage || "Unknown error"}
        </div>
      )}

      {activeRoute && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDuration(activeRoute.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDistance(activeRoute.distance)}</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {activeRoute.instructions.map((instruction, index) => (
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
                      <span>•</span>
                      <span>{formatDuration(instruction.duration)}</span>
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
