import { SettingsForm } from "@/components/settings/settings-form"
import { PrivacySettings } from "@/components/settings/privacy-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="space-y-6">
        <SettingsForm />
        <PrivacySettings />
        <NotificationSettings />
      </div>
    </div>
  )
}
