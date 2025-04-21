"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, MessageSquare, UserPlus, Calendar, Globe, Clock } from "lucide-react"
import { EnhancedMap } from "@/components/map/enhanced-map"

// Sample user data - in a real app, this would come from an API
const usersData = [
  {
    id: 1,
    name: "Alice Smith",
    avatar: "/placeholder.svg",
    location: "New York, USA",
    bio: "Travel enthusiast and photographer. Always looking for new adventures and connections around the world.",
    interests: ["Travel", "Photography", "Music"],
    memberSince: "January 2023",
    lastActive: "2 hours ago",
    connections: 24,
    lat: 40.7128,
    lon: -74.006,
  },
  {
    id: 2,
    name: "Bob Johnson",
    avatar: "/placeholder.svg",
    location: "Los Angeles, USA",
    bio: "Hiking lover and music producer. Enjoy meeting people who share my passions.",
    interests: ["Music", "Hiking", "Technology"],
    memberSince: "March 2023",
    lastActive: "5 hours ago",
    connections: 18,
    lat: 34.0522,
    lon: -118.2437,
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "/placeholder.svg",
    location: "London, UK",
    bio: "Art enthusiast and cooking hobbyist. Love to share recipes and discuss art with people from different cultures.",
    interests: ["Art", "Cooking", "Reading"],
    memberSince: "February 2023",
    lastActive: "1 day ago",
    connections: 31,
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "/placeholder.svg",
    location: "Paris, France",
    bio: "Tech professional and avid reader. Always looking to expand my knowledge and network.",
    interests: ["Technology", "Reading", "Travel"],
    memberSince: "April 2023",
    lastActive: "Just now",
    connections: 42,
    lat: 48.8566,
    lon: 2.3522,
  },
  {
    id: 5,
    name: "Evan Williams",
    avatar: "/placeholder.svg",
    location: "Tokyo, Japan",
    bio: "Sports enthusiast and gamer. Looking for people to play online games with or discuss sports.",
    interests: ["Sports", "Gaming", "Technology"],
    memberSince: "May 2023",
    lastActive: "3 hours ago",
    connections: 15,
    lat: 35.6762,
    lon: 139.6503,
  },
]

export default function UserProfilePage() {
  const params = useParams()
  const userId = Number(params.id)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch user data
    setIsLoading(true)
    setTimeout(() => {
      const foundUser = usersData.find((u) => u.id === userId)
      setUser(foundUser || null)
      setIsLoading(false)
    }, 500)
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground">The user you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - User info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{user.location}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {user.interests.map((interest: string) => (
                    <span key={interest} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-6 w-full">
                  <Button className="flex-1" onClick={() => (window.location.href = `/dashboard/messages/${userId}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">About</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Member since {user.memberSince}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Last active {user.lastActive}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.connections} connections</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs with content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="location">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="location" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-medium">User Location</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-md overflow-hidden border">
                    <EnhancedMap
                      initialCenter={[user.lon, user.lat]}
                      initialZoom={12}
                      users={[user]}
                      showControls={true}
                      showDirections={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="posts" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-medium">Recent Posts</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample posts - in a real app, these would come from an API */}
                    <div className="border rounded-md p-4">
                      <p className="text-sm">
                        Just visited the most amazing place in {user.location.split(",")[0]}! Anyone else been here?
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">12 likes</span>
                          <span className="text-xs">5 comments</span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <p className="text-sm">
                        Looking for recommendations on places to visit in Europe this summer. Any suggestions?
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">8 likes</span>
                          <span className="text-xs">15 comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="connections" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-medium">Connections</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sample connections - in a real app, these would come from an API */}
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 border rounded-md">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">User {i}</p>
                          <p className="text-xs text-muted-foreground">Connected 2 weeks ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
