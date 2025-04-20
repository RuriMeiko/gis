import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function ProfileHeader() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold">John Doe</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
            <MapPin className="h-4 w-4" />
            <span>New York, USA</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-muted px-3 py-1 text-xs">Travel</div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs">Photography</div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs">Music</div>
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6 text-center">
        <div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-muted-foreground">Connections</p>
        </div>
        <div>
          <p className="text-2xl font-bold">142</p>
          <p className="text-sm text-muted-foreground">Profile Views</p>
        </div>
        <div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Messages</p>
        </div>
      </div>
    </div>
  )
}
