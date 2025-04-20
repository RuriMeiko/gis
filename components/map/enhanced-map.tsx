"use client"

import { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import XYZ from "ol/source/XYZ"
import { fromLonLat } from "ol/proj"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style"
import Overlay from "ol/Overlay"
import type { Coordinate } from "ol/coordinate"
import { MapControls } from "@/components/map/map-controls"
import { MapSearch } from "@/components/map/map-search"
import { DirectionsPanel } from "@/components/map/directions-panel"
import {
  type DirectionsRequest,
  type DirectionsResult,
  getDirections,
  createRouteFeature,
} from "@/lib/map/directions-service"
import "ol/ol.css"
import { defaults as defaultInteractions } from "ol/interaction"
import { defaults as defaultControls } from "ol/control"

interface EnhancedMapProps {
  initialCenter?: [number, number]
  initialZoom?: number
  showSearch?: boolean
  showControls?: boolean
  showDirections?: boolean
  height?: string
  className?: string
  users?: Array<{
    id: number
    name: string
    lat: number
    lon: number
    interests?: string[]
    avatar?: string
  }>
}

export function EnhancedMap({
  initialCenter = [0, 30],
  initialZoom = 2,
  showSearch = true,
  showControls = true,
  showDirections = true,
  height = "h-full",
  className = "",
  users = [],
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<Overlay | null>(null)
  const standardLayerRef = useRef<TileLayer<OSM> | null>(null)
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null)
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard")
  const [directionsOpen, setDirectionsOpen] = useState(false)
  const [directionsResult, setDirectionsResult] = useState<DirectionsResult | undefined>(undefined)
  const [isLoadingDirections, setIsLoadingDirections] = useState(false)
  const [userLocation, setUserLocation] = useState<Coordinate | undefined>(undefined)

  // Handle user location using browser's native geolocation API
  useEffect(() => {
    let watchId: number | null = null

    if (navigator.geolocation) {
      // Request permission and get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          const mapCoords = fromLonLat([longitude, latitude])
          setUserLocation(mapCoords)
        },
        (error) => {
          console.warn("Geolocation error:", error.message)
        },
        { enableHighAccuracy: true },
      )

      // Watch position for updates
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          const mapCoords = fromLonLat([longitude, latitude])
          setUserLocation(mapCoords)
        },
        (error) => {
          console.warn("Geolocation watch error:", error.message)
        },
        { enableHighAccuracy: true },
      )
    }

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create vector source for users
    const usersSource = new VectorSource()

    // Add user features
    users.forEach((user) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.lon, user.lat])),
        user: user,
      })

      usersSource.addFeature(feature)
    })

    // Create vector layer for users
    const usersLayer = new VectorLayer({
      source: usersSource,
      style: (feature) => {
        const user = feature.get("user")
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#3b82f6" }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
          }),
          text: user?.name
            ? new Text({
                text: user.name,
                offsetY: 20,
                font: "12px sans-serif",
                fill: new Fill({ color: "#000000" }),
                stroke: new Stroke({ color: "#ffffff", width: 3 }),
              })
            : undefined,
        })
      },
      zIndex: 10,
    })

    // Create vector source and layer for routes
    const routesSource = new VectorSource()
    const routesLayer = new VectorLayer({
      source: routesSource,
      zIndex: 5,
    })
    routeLayerRef.current = routesLayer

    // Create base layers
    const standardLayer = new TileLayer({
      source: new OSM(),
      visible: mapType === "standard",
    })
    standardLayerRef.current = standardLayer

    // Satellite layer (using a free alternative since we don't have API keys)
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
      }),
      visible: mapType === "satellite",
    })
    satelliteLayerRef.current = satelliteLayer

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [standardLayer, satelliteLayer, routesLayer, usersLayer],
      view: new View({
        center: fromLonLat(initialCenter),
        zoom: initialZoom,
        maxZoom: 19,
      }),
      controls: defaultControls({ zoom: false, rotate: false }),
      interactions: defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
    })

    // Create popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    })
    map.addOverlay(popupOverlay)
    overlayRef.current = popupOverlay

    // Handle click events on the map
    map.on("click", (evt) => {
      // Check if the click is on a form element
      const target = evt.originalEvent.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "BUTTON") {
        return // Don't process map clicks on form elements
      }

      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature && feature.get("user")) {
        const user = feature.get("user")
        setSelectedUser(user)

        if (popupRef.current) {
          popupOverlay.setPosition(feature.getGeometry().getCoordinates())
        }
      } else {
        popupOverlay.setPosition(undefined)
        setSelectedUser(null)
      }
    })

    mapInstanceRef.current = map

    return () => {
      map.setTarget(undefined)
    }
  }, [users, initialCenter, initialZoom]) // Remove mapType from dependencies

  // Update map layers when mapType changes
  useEffect(() => {
    if (!standardLayerRef.current || !satelliteLayerRef.current) return

    standardLayerRef.current.setVisible(mapType === "standard")
    satelliteLayerRef.current.setVisible(mapType === "satellite")
  }, [mapType])

  // Handle directions request
  const handleDirectionsRequest = async (
    origin: string | Coordinate,
    destination: string | Coordinate,
    travelMode: "driving" | "walking" | "cycling",
  ) => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return

    setIsLoadingDirections(true)

    try {
      // In a real app, you would geocode the text addresses to coordinates
      // For this demo, we'll use random coordinates if strings are provided
      let originCoord: Coordinate
      let destinationCoord: Coordinate

      if (typeof origin === "string") {
        if (origin === "My Location" && userLocation) {
          originCoord = userLocation
        } else {
          // Random coordinates near the center of the map
          const view = mapInstanceRef.current.getView()
          const center = view.getCenter()!
          originCoord = [center[0] - 5000 + Math.random() * 10000, center[1] - 5000 + Math.random() * 10000]
        }
      } else {
        originCoord = origin
      }

      if (typeof destination === "string") {
        // Random coordinates near the center of the map
        const view = mapInstanceRef.current.getView()
        const center = view.getCenter()!
        destinationCoord = [center[0] - 5000 + Math.random() * 10000, center[1] - 5000 + Math.random() * 10000]
      } else {
        destinationCoord = destination
      }

      // Get directions
      const request: DirectionsRequest = {
        origin: originCoord,
        destination: destinationCoord,
        travelMode,
      }

      const result = await getDirections(request)
      setDirectionsResult(result)

      // Clear previous routes
      routeLayerRef.current.getSource()?.clear()

      // Add new route to the map
      if (result.status === "OK" && result.routes.length > 0) {
        const routeFeature = createRouteFeature(result.routes[0])
        routeLayerRef.current.getSource()?.addFeature(routeFeature)

        // Fit the map to the route
        const geometry = result.routes[0].geometry
        mapInstanceRef.current.getView().fit(geometry, {
          padding: [50, 50, 50, 50],
          duration: 500,
        })
      }
    } catch (error) {
      console.error("Error getting directions:", error)
      setDirectionsResult({
        routes: [],
        status: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoadingDirections(false)
    }
  }

  // Toggle map type
  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"))
  }

  return (
    <div className={`relative ${height} w-full ${className}`}>
      <div ref={mapRef} className="h-full w-full" />

      {/* Popup for user information */}
      <div
        ref={popupRef}
        className="absolute bg-white p-3 rounded-lg shadow-lg max-w-xs invisible"
        style={{ visibility: selectedUser ? "visible" : "hidden" }}
      >
        {selectedUser && (
          <>
            <h3 className="font-bold">{selectedUser.name}</h3>
            {selectedUser.interests && (
              <p className="text-sm text-muted-foreground">Interests: {selectedUser.interests.join(", ")}</p>
            )}
            <button className="text-xs text-blue-600 mt-1">View Profile</button>
          </>
        )}
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 z-10">
          <MapSearch />
        </div>
      )}

      {/* Map controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10">
          <MapControls
            map={mapInstanceRef.current}
            onToggleDirections={showDirections ? () => setDirectionsOpen(!directionsOpen) : undefined}
            directionsActive={directionsOpen}
            onToggleMapType={toggleMapType}
            userLocation={userLocation}
          />
        </div>
      )}

      {/* Directions panel */}
      {showDirections && (
        <DirectionsPanel
          isOpen={directionsOpen}
          onClose={() => setDirectionsOpen(false)}
          onDirectionsRequest={handleDirectionsRequest}
          directionsResult={directionsResult}
          isLoading={isLoadingDirections}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}
