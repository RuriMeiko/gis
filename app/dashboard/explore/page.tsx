import { ExploreFilters } from "@/components/map/explore-filters"
import { EnhancedMap } from "@/components/map/enhanced-map"

// Sample user data
const users = [
  { id: 1, name: "Alice", lat: 40.7128, lon: -74.006, interests: ["Travel", "Photography"] },
  { id: 2, name: "Bob", lat: 34.0522, lon: -118.2437, interests: ["Music", "Hiking"] },
  { id: 3, name: "Charlie", lat: 51.5074, lon: -0.1278, interests: ["Art", "Cooking"] },
  { id: 4, name: "Diana", lat: 48.8566, lon: 2.3522, interests: ["Technology", "Reading"] },
  { id: 5, name: "Evan", lat: 35.6762, lon: 139.6503, interests: ["Sports", "Gaming"] },
  { id: 6, name: "Fiona", lat: -33.8688, lon: 151.2093, interests: ["Travel", "Music"] },
  { id: 7, name: "George", lat: 52.52, lon: 13.405, interests: ["Technology", "Art"] },
  { id: 8, name: "Hannah", lat: 37.7749, lon: -122.4194, interests: ["Photography", "Hiking"] },
  { id: 9, name: "Ian", lat: 55.7558, lon: 37.6173, interests: ["Reading", "Cooking"] },
  { id: 10, name: "Julia", lat: -22.9068, lon: -43.1729, interests: ["Sports", "Travel"] },
]

export default function ExplorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>
      <ExploreFilters />
      <div className="h-[600px] rounded-lg border overflow-hidden">
        <EnhancedMap users={users} showDirections={true} showSearch={true} showControls={true} />
      </div>
    </div>
  )
}
