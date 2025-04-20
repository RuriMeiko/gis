import { UserStats } from "@/components/dashboard/user-stats"
import { DatabaseConnectionTest } from "@/components/database-connection-test"
import { EnhancedMap } from "@/components/map/enhanced-map"

// Sample nearby users
const nearbyUsers = [
  { id: 1, name: "Alice", lat: 40.7128, lon: -74.006, interests: ["Travel", "Photography"] },
  { id: 2, name: "Bob", lat: 40.72, lon: -74.01, interests: ["Music", "Hiking"] },
  { id: 3, name: "Charlie", lat: 40.715, lon: -74.005, interests: ["Art", "Cooking"] },
  { id: 4, name: "Diana", lat: 40.718, lon: -74.008, interests: ["Technology", "Reading"] },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <DatabaseConnectionTest />
      <UserStats />
      <div className="h-[500px] rounded-lg border overflow-hidden">
        <EnhancedMap users={nearbyUsers} initialCenter={[-74.006, 40.7128]} initialZoom={12} showDirections={true} />
      </div>
    </div>
  )
}
