"use client"

import { useEffect, useRef, useState } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat } from "ol/proj"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"
import { MapControls } from "@/components/map/map-controls"
import { MapSearch } from "@/components/map/map-search"
import "ol/ol.css"

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Sample user data
    const users = [
      { id: 1, name: "Alice", lat: 40.7128, lon: -74.006, interests: ["Travel", "Photography"] },
      { id: 2, name: "Bob", lat: 34.0522, lon: -118.2437, interests: ["Music", "Hiking"] },
      { id: 3, name: "Charlie", lat: 51.5074, lon: -0.1278, interests: ["Art", "Cooking"] },
      { id: 4, name: "Diana", lat: 48.8566, lon: 2.3522, interests: ["Technology", "Reading"] },
      { id: 5, name: "Evan", lat: 35.6762, lon: 139.6503, interests: ["Sports", "Gaming"] },
    ]

    // Create vector source and features for users
    const vectorSource = new VectorSource()

    users.forEach((user) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.lon, user.lat])),
        user: user,
      })

      vectorSource.addFeature(feature)
    })

    // Create vector layer with custom style
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#3b82f6" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      }),
    })

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([0, 30]),
        zoom: 2,
      }),
      controls: [],
    })

    // Create popup overlay
    const popupElement = document.createElement("div")
    popupElement.className = "bg-white p-3 rounded-lg shadow-lg max-w-xs"

    const popup = new Overlay({
      element: popupElement,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    })

    map.addOverlay(popup)

    // Handle click events on the map
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature) {
        const user = feature.get("user")
        setSelectedUser(user)

        popupElement.innerHTML = `
          <h3 class="font-bold">${user.name}</h3>
          <p class="text-sm text-muted-foreground">Interests: ${user.interests.join(", ")}</p>
          <button class="text-xs text-blue-600 mt-1">View Profile</button>
        `

        popup.setPosition(feature.getGeometry().getCoordinates())
      } else {
        popup.setPosition(undefined)
        setSelectedUser(null)
      }
    })

    mapInstanceRef.current = map

    return () => {
      map.setTarget(undefined)
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      <div className="absolute top-4 left-4 z-10">
        <MapSearch />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <MapControls map={mapInstanceRef.current} />
      </div>
    </div>
  )
}
