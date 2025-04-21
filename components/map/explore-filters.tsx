"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ExploreFiltersProps {
  onFilterChange?: (filters: {
    distance?: number
    interests?: string[]
    location?: string
  }) => void
}

export function ExploreFilters({ onFilterChange }: ExploreFiltersProps) {
  const [distance, setDistance] = useState([50])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interest, setInterest] = useState("")
  const [location, setLocation] = useState("")
  const [isDirty, setIsDirty] = useState(false)
  const [availableInterests, setAvailableInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available interests from the database
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching interests from API...")
        // Get unique interests from user_interests table
        const response = await fetch("/api/interests")

        if (!response.ok) {
          throw new Error(`Error fetching interests: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Interests API response:", data)

        // Check if data.interests exists before using it
        if (data && Array.isArray(data.interests)) {
          setAvailableInterests(data.interests)
        } else {
          console.warn("API response doesn't contain interests array:", data)
          // Fallback to default interests
          setAvailableInterests([
            "Travel",
            "Photography",
            "Music",
            "Art",
            "Technology",
            "Sports",
            "Gaming",
            "Cooking",
            "Reading",
            "Hiking",
          ])
        }
      } catch (error) {
        console.error("Error fetching interests:", error)
        // Fallback to default interests if API fails
        setAvailableInterests([
          "Travel",
          "Photography",
          "Music",
          "Art",
          "Technology",
          "Sports",
          "Gaming",
          "Cooking",
          "Reading",
          "Hiking",
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterests()
  }, [])

  const addInterest = (value: string) => {
    if (value && !selectedInterests.includes(value)) {
      const newInterests = [...selectedInterests, value]
      setSelectedInterests(newInterests)
      setInterest("")
      setIsDirty(true)
    }
  }

  const removeInterest = (value: string) => {
    const newInterests = selectedInterests.filter((i) => i !== value)
    setSelectedInterests(newInterests)
    setIsDirty(true)
  }

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        distance: distance[0],
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
        location: location || undefined,
      })
    }
    setIsDirty(false)
  }

  // Apply filters when component mounts to initialize the map
  useEffect(() => {
    handleApplyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Filter Users</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="space-y-2">
          <Label>Interests</Label>
          <Select value={interest} onValueChange={(value) => addInterest(value)} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading interests..." : "Select interest"} />
            </SelectTrigger>
            <SelectContent>
              {availableInterests.map((i) => (
                <SelectItem key={i} value={i} disabled={selectedInterests.includes(i)}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedInterests.map((i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {i}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(i)} />
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter a location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setIsDirty(true)
            }}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={handleApplyFilters} disabled={!isDirty}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
