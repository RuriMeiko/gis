"use client"

import { useState } from "react"
import { ExploreFilters } from "@/components/map/explore-filters"
import { EnhancedMap } from "@/components/map/enhanced-map"
import type { User } from "@/types/user"

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([])
  const [filterInterests, setFilterInterests] = useState<string[]>([])
  const [mapKey, setMapKey] = useState(Date.now()) // Used to force map re-render when filters change

  // Handle filter changes
  const handleFilterChange = (filters: {
    distance?: number
    interests?: string[]
    location?: string
  }) => {
    // Store filter interests to pass to the map component
    setFilterInterests(filters.interests || [])

    // Force map to re-render with new filters
    setMapKey(Date.now())
  }

  // Handle users loaded from the map component
  const handleUsersLoaded = (loadedUsers: User[]) => {
    setUsers(loadedUsers)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>
      <ExploreFilters onFilterChange={handleFilterChange} />
      <div className="h-[600px] rounded-lg border overflow-hidden">
        <EnhancedMap
          key={mapKey}
          showDirections={true}
          showSearch={true}
          showControls={true}
          filterInterests={filterInterests}
          onUsersLoaded={handleUsersLoaded}
        />
      </div>
    </div>
  )
}
