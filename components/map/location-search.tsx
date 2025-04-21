"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Search, User, X } from "lucide-react"
import { searchLocationsWithNominatim, type SearchResult } from "@/lib/map/nominatim-service"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { fetchUsers } from "@/lib/services/user-service"

interface LocationSearchProps {
  onLocationSelect: (location: SearchResult) => void
  placeholder?: string
  className?: string
  includeUsers?: boolean
}

export function LocationSearch({
  onLocationSelect,
  placeholder = "Search for a location...",
  className,
  includeUsers = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Search for locations and users when query changes
  useEffect(() => {
    const searchLocationsAndUsers = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        // Get locations from Nominatim
        const locationResults = await searchLocationsWithNominatim(debouncedQuery)

        // Add matching users if includeUsers is true
        let userResults: SearchResult[] = []
        if (includeUsers) {
          const users = await fetchUsers(debouncedQuery)
          userResults = users
            .filter((user) => user.lat && user.lon) // Ensure user has location data
            .map((user) => ({
              id: `user_${user.id}`,
              name: user.name,
              description: user.location || "User",
              coordinates: [user.lon, user.lat],
              type: "user" as const,
            }))
        }

        setResults([...userResults, ...locationResults])
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (debouncedQuery) {
      searchLocationsAndUsers()
    } else {
      setResults([])
    }
  }, [debouncedQuery, includeUsers])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(result)
    setQuery(result.name)
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-8 rounded-l-none"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div ref={resultsRef} className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto p-1">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => handleSelect(result)}
                  >
                    {result.type === "user" ? (
                      <User className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="overflow-hidden">
                      <div className="truncate font-medium">{result.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{result.description}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
