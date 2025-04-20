"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function ExploreFilters() {
  const [distance, setDistance] = useState([50])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interest, setInterest] = useState("")

  const interests = [
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
  ]

  const addInterest = (value: string) => {
    if (value && !selectedInterests.includes(value)) {
      setSelectedInterests([...selectedInterests, value])
      setInterest("")
    }
  }

  const removeInterest = (value: string) => {
    setSelectedInterests(selectedInterests.filter((i) => i !== value))
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Filter Users</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (km)</Label>
          <div className="flex items-center gap-4">
            <Slider id="distance" max={100} step={1} value={distance} onValueChange={setDistance} />
            <span className="w-12 text-center font-medium">{distance[0]}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Interests</Label>
          <Select value={interest} onValueChange={(value) => addInterest(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select interest" />
            </SelectTrigger>
            <SelectContent>
              {interests.map((i) => (
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
          <Input id="location" placeholder="Enter a location" />
        </div>
        <div className="flex items-end">
          <Button className="w-full">Apply Filters</Button>
        </div>
      </div>
    </div>
  )
}
