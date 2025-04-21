import { UserStats } from "@/components/dashboard/user-stats"
import { DatabaseConnectionTest } from "@/components/database-connection-test"
import { EnhancedMap } from "@/components/map/enhanced-map"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <DatabaseConnectionTest />
      <UserStats />
      <div className="h-[500px] rounded-lg border overflow-hidden">
        <EnhancedMap
          initialCenter={[-74.006, 40.7128]}
          initialZoom={12}
          showDirections={true}
          showSearch={true}
          showControls={true}
        />
      </div>
    </div>
  )
}
