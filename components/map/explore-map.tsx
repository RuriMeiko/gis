"use client"

import { useEffect, useRef } from "react"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat } from "ol/proj"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style"
import Cluster from "ol/source/Cluster"
import { MapControls } from "@/components/map/map-controls"
import { MapSearch } from "@/components/map/map-search"
import "ol/ol.css"

export function ExploreMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Generate sample user data
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      lat: Math.random() * 170 - 85,
      lon: Math.random() * 360 - 180,
      interests: ["Travel", "Photography", "Music", "Art", "Technology"].sort(() => 0.5 - Math.random()).slice(0, 2),
    }))

    // Create vector source and features for users
    const vectorSource = new VectorSource()

    users.forEach((user) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([user.lon, user.lat])),
        user: user,
      })

      vectorSource.addFeature(feature)
    })

    // Create cluster source
    const clusterSource = new Cluster({
      distance: 40,
      source: vectorSource,
    })

    // Create vector layer with custom style
    const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const size = feature.get("features").length

        if (size > 1) {
          // Cluster style - Fixed the text style
          return new Style({
            image: new CircleStyle({
              radius: 15,
              fill: new Fill({ color: "#3b82f6" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({ color: "#ffffff" }),
              font: "bold 12px sans-serif",
            }),
          })
        } else {
          // Single user style
          return new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#3b82f6" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          })
        }
      },
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

    // Handle click events on the map
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature) {
        const features = feature.get("features")
        if (features.length === 1) {
          // Single user
          const user = features[0].get("user")
          console.log("Selected user:", user)
          // Here you would show user details or navigate to profile
        } else {
          // Cluster of users
          const extent = features[0].getGeometry().getExtent().slice()
          for (let i = 1; i < features.length; i++) {
            const geom = features[i].getGeometry()
            if (geom) {
              // Use the correct method to get the extent
              const featureExtent = geom.getExtent()
              extent[0] = Math.min(extent[0], featureExtent[0])
              extent[1] = Math.min(extent[1], featureExtent[1])
              extent[2] = Math.max(extent[2], featureExtent[2])
              extent[3] = Math.max(extent[3], featureExtent[3])
            }
          }

          // Zoom to the extent of the cluster
          map.getView().fit(extent, {
            duration: 500,
            padding: [50, 50, 50, 50],
          })
        }
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
      <div className="absolute top-4 left-4 z-10 h-100">
        <MapSearch />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <MapControls map={mapInstanceRef.current} />
      </div>
    </div>
  )
}
