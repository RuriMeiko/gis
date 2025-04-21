export interface User {
  id: number
  name: string
  email: string
  bio?: string
  avatar?: string
  lat: number
  lon: number
  location?: string
  interests: string[]
}
