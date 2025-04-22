import type { User } from "@/types/user"

export interface UserFilters {
  gender?: string
  minAge?: number
  maxAge?: number
  interests?: string[]
}

/**
 * Gọi API /api/users để lấy danh sách người dùng theo bộ lọc
 */
export async function fetchUsers(filters?: UserFilters): Promise<User[]> {
  try {
    const url = new URL("/api/users", window.location.origin)

    // Thêm bộ lọc vào URL query
    if (filters?.gender) {
      url.searchParams.append("gender", filters.gender)
    }

    if (filters?.minAge !== undefined) {
      url.searchParams.append("minAge", String(filters.minAge))
    }

    if (filters?.maxAge !== undefined) {
      url.searchParams.append("maxAge", String(filters.maxAge))
    }


    console.log("Fetching users from:", url.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Rate limit exceeded")
        return []
      }
      throw new Error(`HTTP ${response.status} - ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.warn("Invalid content-type. Response text:", text.slice(0, 200))
      return []
    }

    const data = await response.json()

    if (!data || !data.users) {
      console.warn("No users found in API response", data)
      return []
    }
    console.log("Fetched users:", data.users);
    
    return data.users.map((user: any): User => ({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      avatar: user.avatar_url || "/placeholder.svg",
      lat: Number.parseFloat(user.latitude) || 0,
      lon: Number.parseFloat(user.longitude) || 0,
      gender: user.gender || "",
      age: user.age || 0,
      location: user.location_name || "",
      interests: user.interests || [],
    }))
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("Fetch aborted due to timeout")
      return []
    }

    console.error("Fetch users error:", error)
    return []
  }
}
