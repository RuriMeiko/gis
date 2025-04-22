"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSearch } from "./location-search"

interface ExploreFiltersProps {
  onFilterChange?: (filters: {
    distance?: number
    gender?: string
    ageRange?: [number, number]
    location?: string
    centerCoordinates?: any
  }) => void
}

export function ExploreFilters({ onFilterChange }: ExploreFiltersProps) {
  const [distance, setDistance] = useState([50])
  const [gender, setGender] = useState("")
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30])
  const [location, setLocation] = useState("")
  const [centerLocation, setCenterLocation] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)
  const initialLoadDone = useRef(false)

  const handleLocationSelect = (result: any) => {
    setLocation(result.name)
    setCenterLocation(result)
    setIsDirty(true)
  }

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        distance: distance[0],
        gender: gender || undefined,
        ageRange,
        location: location || undefined,
        centerCoordinates: centerLocation?.coordinates,
      })
    }
    setIsDirty(false)
  }

  // Modify the useEffect to only apply filters when explicitly requested
  useEffect(() => {
    // Only apply filters on initial mount once
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      handleApplyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Filter Users</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Khoảng cách */}
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (km)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="distance"
              max={100}
              step={1}
              value={distance}
              onValueChange={(value) => {
                setDistance(value)
                setIsDirty(true)
              }}
            />
            <span className="w-12 text-center font-medium">{distance[0]}</span>
          </div>
        </div>

        {/* Giới tính */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={(value) => { setGender(value); setIsDirty(true) }}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Độ tuổi */}
        <div className="space-y-2">
          <Label htmlFor="age">Age Range</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="age"
              min={18}
              max={80}
              step={1}
              value={ageRange}
              onValueChange={(value) => {
                setAgeRange(value as [number, number])
                setIsDirty(true)
              }}
            />
            <span className="w-24 text-center font-medium">
              {ageRange[0]} - {ageRange[1]}
            </span>
          </div>
        </div>

        

        {/* Nút áp dụng */}
        <div className="flex items-end">
          <Button className="w-full" onClick={handleApplyFilters} disabled={!isDirty}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
