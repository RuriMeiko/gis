"use client"

import { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat, toLonLat } from "ol/proj"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style"
import "ol/ol.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Search } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lon: number }) => void
  initialLocation?: { lat: number; lon: number }
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(
    initialLocation || null
  )

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create vector source and layer for marker
    const markerSource = new VectorSource()
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#3b82f6" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      }),
    })
    markerLayerRef.current = markerLayer

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        markerLayer,
      ],
      view: new View({
        center: initialLocation 
          ? fromLonLat([initialLocation.lon, initialLocation.lat]) 
          : fromLonLat([0, 0]),
        zoom: initialLocation ? 14 : 2,
      }),
    })

    // Add click handler to set marker
    const handleMapClick = (evt: any) => {
      const coords = evt.coordinate
      const lonLat = toLonLat(coords)
      updateMarker(coords)
      
      // Use a callback function for setState to avoid dependency issues
      setCurrentLocation(() => ({ lon: lonLat[0], lat: lonLat[1] }))
      
      // Call the callback outside of the render cycle
      setTimeout(() => {
        onLocationSelect({ lon: lonLat[0], lat: lonLat[1] })
      }, 0)
    }
    
    map.on("click", handleMapClick)

    mapInstanceRef.current = map

    // Add initial marker if location exists
    if (initialLocation) {
      const coords = fromLonLat([initialLocation.lon, initialLocation.lat])
      updateMarker(coords)
    }

    setIsLoading(false)

    return () => {
      // Clean up event listeners to prevent memory leaks
      map.un("click", handleMapClick)
      map.setTarget(undefined)
    }
  }, [initialLocation]) // Remove onLocationSelect from dependencies

  // Update marker position
  const updateMarker = (coords: number[]) => {
    if (!markerLayerRef.current) return

    // Clear existing markers
    markerLayerRef.current.getSource()?.clear()

    // Add new marker
    const marker = new Feature({
      geometry: new Point(coords),
    })
    markerLayerRef.current.getSource()?.addFeature(marker)
  }

  // Get current location from browser
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const coords = fromLonLat([longitude, latitude])
          
          // Update map view
          if (mapInstanceRef.current) {
            mapInstanceRef.current.getView().animate({
              center: coords,
              zoom: 14,
              duration: 500,
            })
          }
          
          // Update marker
          updateMarker(coords)
          
          // Update state and callback
          setCurrentLocation({ lat: latitude, lon: longitude })
          onLocationSelect({ lat: latitude, lon: longitude })
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
        },
        { enableHighAccuracy: true }
      )
    }
  }

  // Search for a location by name
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      
      // Use Nominatim API to search for locations with more parameters for better results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'GIS-Web-Application/1.0'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to search location')
      }
      
      const results = await response.json()
      
      if (results && results.length > 0) {
        const { lat, lon } = results[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        console.log("Found location:", results[0].display_name, "at", latitude, longitude)
        
        // Convert to OpenLayers coordinates
        const coords = fromLonLat([longitude, latitude])
        
        // Update map view with a slight delay to ensure map is ready
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.getView().animate({
              center: coords,
              zoom: 14,
              duration: 500,
            })
            
            // Update marker
            updateMarker(coords)
          }
        }, 100)
        
        // Update state and callback
        setCurrentLocation({ lat: latitude, lon: longitude })
        onLocationSelect({ lat: latitude, lon: longitude })
      } else {
        console.log('No results found for query:', searchQuery)
        alert('No locations found. Please try a different search term.')
      }
    } catch (error) {
      console.error('Error searching for location:', error)
      alert('Error searching for location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Select your location</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleGetCurrentLocation}
          disabled={isLoading || isSearching}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          Use my location
        </Button>
      </div>
      
      <form 
        onSubmit={handleSearch} 
        className="flex gap-2"
        // Add this to ensure the form doesn't reload the page
        action="javascript:void(0);"
      >
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          disabled={isSearching}
        />
        <Button 
          type="button" // Change from submit to button
          variant="secondary" 
          size="sm"
          disabled={isSearching || !searchQuery.trim()}
          onClick={handleSearch} // Add onClick handler
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <div 
        ref={mapRef} 
        className="h-[200px] w-full rounded-md border"
        style={{ position: "relative" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      {currentLocation && (
        <p className="text-xs text-muted-foreground">
          Selected location: {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
        </p>
      )}
    </div>
  )
}