import type { User } from "@/types/user"

export async function fetchUsers(query?: string, interests?: string[]): Promise<User[]> {
  try {
    // Build the URL with query parameters
    const url = new URL("/api/users", window.location.origin)

    if (query) {
      url.searchParams.append("query", query)
    }

    if (interests && interests.length > 0) {
      interests.forEach((interest) => {
        url.searchParams.append("interest", interest)
      })
    }

    console.log("Fetching users from:", url.toString())

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Check if response is rate limited
      if (response.status === 429) {
        console.warn("Rate limit exceeded when fetching users")
        return []
      }
      throw new Error(`Error fetching users: ${response.status} ${response.statusText}`)
    }

    // Check if response is valid JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid response content type:", contentType)
      const text = await response.text()
      console.error("Response text:", text.substring(0, 200) + (text.length > 200 ? "..." : ""))
      return []
    }

    const data = await response.json()

    // Check if data.users exists before mapping
    if (!data || !data.users) {
      console.warn("API response doesn't contain users data:", data)
      return []
    }

    // Log any errors returned from the API
    if (data.error) {
      console.error("API returned error:", data.error)
    }

    return data.users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      avatar: user.avatar_url || "/placeholder.svg",
      lat: Number.parseFloat(user.latitude) || 0,
      lon: Number.parseFloat(user.longitude) || 0,
      location: user.location_name || "",
      interests: user.interests || [],
    }))
  } catch (error) {
    // Handle abort errors gracefully
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("Fetch request for users was aborted due to timeout")
      return []
    }

    console.error("Error fetching users:", error)
    return []
  }
}
