export function UserStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Connections</p>
            <h3 className="text-2xl font-bold">24</h3>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Messages</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
            <h3 className="text-2xl font-bold">142</h3>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nearby Users</p>
            <h3 className="text-2xl font-bold">8</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
