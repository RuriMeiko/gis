"use client"

import { useState, useCallback } from "react"
import { ExploreFilters } from "@/components/map/explore-filters"
import { EnhancedMap } from "@/components/map/enhanced-map"
import type { User } from "@/types/user"

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([])
  const [mapKey, setMapKey] = useState(Date.now()) // Used to force map re-render when filters change
  const [centerCoordinates, setCenterCoordinates] = useState<any>(null)
  const [searchDistance, setSearchDistance] = useState<number>(50)
  const [gender, setGender] = useState<string | undefined>(undefined)
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30])
  const [shouldRefetch, setShouldRefetch] = useState(true)

  // Handle filter changes
  const handleFilterChange = useCallback((filters: {
    distance?: number
    gender?: string
    ageRange?: [number, number]
    location?: string
    centerCoordinates?: any
  }) => {
    // Check if filters have actually changed before triggering a re-render
    const genderChanged = filters.gender !== gender;
    const ageRangeChanged = JSON.stringify(filters.ageRange || []) !== JSON.stringify(ageRange);
    const distanceChanged = filters.distance !== searchDistance;
    const locationChanged = 
      (filters.centerCoordinates && !centerCoordinates) || 
      (!filters.centerCoordinates && centerCoordinates) ||
      (filters.centerCoordinates && centerCoordinates && 
        JSON.stringify(filters.centerCoordinates) !== JSON.stringify(centerCoordinates));
    
    // Only update state and trigger re-render if something has changed
    if (genderChanged || ageRangeChanged || distanceChanged || locationChanged) {
      // Store filter values to pass to the map component
      setGender(filters.gender)
      setAgeRange(filters.ageRange || [18, 30])
      setCenterCoordinates(filters.centerCoordinates || null)
      setSearchDistance(filters.distance || 50)

      // Set flag to indicate data should be refetched
      setShouldRefetch(true)
      
      // Force map to re-render with new filters
      setMapKey(Date.now())
    }
  }, [gender, ageRange, searchDistance, centerCoordinates])

  // Handle users loaded from the map component
  const handleUsersLoaded = useCallback((loadedUsers: User[]) => {
    setUsers(loadedUsers)
    // Reset the refetch flag after data has been loaded
    setShouldRefetch(false)
  }, [])

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
          gender={gender}
          ageRange={ageRange}
          onUsersLoaded={handleUsersLoaded}
          searchRadius={searchDistance}
          searchCenter={centerCoordinates}
          shouldRefetch={shouldRefetch}
        />
      </div>
    </div>
  )
}
