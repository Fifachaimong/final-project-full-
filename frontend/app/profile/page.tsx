import { getProfile } from "@/app/actions/profile"
import ProfileEditPage from "@/components/profile-edit-page"

export const dynamic = "force-dynamic"

export default async function Page() {
  const profile = await getProfile()

  return <ProfileEditPage initialProfile={profile} />
}