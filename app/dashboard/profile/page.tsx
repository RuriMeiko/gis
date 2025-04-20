import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileHeader } from "@/components/profile/profile-header"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      <div className="space-y-6">
        <ProfileHeader />
        <ProfileForm />
      </div>
    </div>
  )
}
