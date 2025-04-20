"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function NotificationSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    newMessages: true,
    newConnections: true,
    profileViews: false,
    nearbyUsers: true,
    emailNotifications: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const saveSettings = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification settings have been updated successfully.",
    })
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="new-messages">New Messages</Label>
            <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
          </div>
          <Switch
            id="new-messages"
            checked={settings.newMessages}
            onCheckedChange={() => handleToggle("newMessages")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="new-connections">New Connections</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone connects with you</p>
          </div>
          <Switch
            id="new-connections"
            checked={settings.newConnections}
            onCheckedChange={() => handleToggle("newConnections")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="profile-views">Profile Views</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone views your profile</p>
          </div>
          <Switch
            id="profile-views"
            checked={settings.profileViews}
            onCheckedChange={() => handleToggle("profileViews")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="nearby-users">Nearby Users</Label>
            <p className="text-sm text-muted-foreground">Get notified when users are near your location</p>
          </div>
          <Switch
            id="nearby-users"
            checked={settings.nearbyUsers}
            onCheckedChange={() => handleToggle("nearbyUsers")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.emailNotifications}
            onCheckedChange={() => handleToggle("emailNotifications")}
          />
        </div>
        <Button onClick={saveSettings} className="mt-4">
          Save Notification Settings
        </Button>
      </div>
    </div>
  )
}
