"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function PrivacySettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    shareLocation: true,
    showOnMap: true,
    allowMessages: true,
    publicProfile: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const saveSettings = () => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy settings have been updated successfully.",
    })
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="share-location">Share Location</Label>
            <p className="text-sm text-muted-foreground">Allow the app to access and share your location</p>
          </div>
          <Switch
            id="share-location"
            checked={settings.shareLocation}
            onCheckedChange={() => handleToggle("shareLocation")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-on-map">Show on Map</Label>
            <p className="text-sm text-muted-foreground">Display your profile on the public map</p>
          </div>
          <Switch id="show-on-map" checked={settings.showOnMap} onCheckedChange={() => handleToggle("showOnMap")} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow-messages">Allow Messages</Label>
            <p className="text-sm text-muted-foreground">Receive messages from other users</p>
          </div>
          <Switch
            id="allow-messages"
            checked={settings.allowMessages}
            onCheckedChange={() => handleToggle("allowMessages")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="public-profile">Public Profile</Label>
            <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
          </div>
          <Switch
            id="public-profile"
            checked={settings.publicProfile}
            onCheckedChange={() => handleToggle("publicProfile")}
          />
        </div>
        <Button onClick={saveSettings} className="mt-4">
          Save Privacy Settings
        </Button>
      </div>
    </div>
  )
}
