"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function MapSearch() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  // Sample search results
  const searchResults = [
    { id: 1, name: "New York, USA", type: "location" },
    { id: 2, name: "London, UK", type: "location" },
    { id: 3, name: "Tokyo, Japan", type: "location" },
    { id: 4, name: "Alice Smith", type: "user" },
    { id: 5, name: "Bob Johnson", type: "user" },
  ]

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[300px] justify-between bg-white">
            {value || "Search locations or users..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search locations or users..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Locations">
                {searchResults
                  .filter((item) => item.type === "location")
                  .map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        setValue(item.name)
                        setOpen(false)
                      }}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Users">
                {searchResults
                  .filter((item) => item.type === "user")
                  .map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        setValue(item.name)
                        setOpen(false)
                      }}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
