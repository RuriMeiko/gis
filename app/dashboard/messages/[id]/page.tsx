"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Sample user data - in a real app, this would come from an API
const usersData = [
  {
    id: 1,
    name: "Alice Smith",
    avatar: "/placeholder.svg",
    online: true,
  },
  {
    id: 2,
    name: "Bob Johnson",
    avatar: "/placeholder.svg",
    online: false,
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "/placeholder.svg",
    online: true,
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "/placeholder.svg",
    online: true,
  },
  {
    id: 5,
    name: "Evan Williams",
    avatar: "/placeholder.svg",
    online: false,
  },
]

// Sample messages - in a real app, these would come from an API
const initialMessages = [
  {
    id: 1,
    userId: 1,
    content: "Hey there! I saw you're also interested in photography.",
    timestamp: "10:30 AM",
    sender: "other",
  },
  {
    id: 2,
    userId: 1,
    content: "Yes, I love taking photos during my travels. Do you have any favorite spots in New York?",
    timestamp: "10:32 AM",
    sender: "user",
  },
  {
    id: 3,
    userId: 1,
    content: "Central Park is amazing for nature shots, and the Brooklyn Bridge at sunset is spectacular!",
    timestamp: "10:33 AM",
    sender: "other",
  },
  {
    id: 4,
    userId: 1,
    content: "I'll have to check those out. I'm planning to visit next month.",
    timestamp: "10:35 AM",
    sender: "user",
  },
  {
    id: 5,
    userId: 1,
    content: "Let me know when you're here, I can show you around!",
    timestamp: "10:36 AM",
    sender: "other",
  },
  {
    id: 6,
    userId: 2,
    content: "Hi there! I noticed you're into hiking too.",
    timestamp: "Yesterday",
    sender: "other",
  },
  {
    id: 7,
    userId: 2,
    content: "Yes! I love exploring new trails. Do you have any recommendations?",
    timestamp: "Yesterday",
    sender: "user",
  },
  {
    id: 8,
    userId: 3,
    content: "Hello! I saw your profile and we share an interest in art.",
    timestamp: "2 days ago",
    sender: "other",
  },
  {
    id: 9,
    userId: 4,
    content: "Hi! I'm planning a tech meetup next week. Would you be interested?",
    timestamp: "3 days ago",
    sender: "other",
  },
  {
    id: 10,
    userId: 5,
    content: "Hey! Are you into online gaming? I'm looking for people to join my team.",
    timestamp: "1 week ago",
    sender: "other",
  },
]

export default function DirectMessagePage() {
  const params = useParams()
  const userId = Number(params.id)
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate API call to fetch user data and messages
    setIsLoading(true)
    setTimeout(() => {
      const foundUser = usersData.find((u) => u.id === userId)
      setUser(foundUser || null)

      // Filter messages for this user
      const userMessages = initialMessages.filter((m) => m.userId === userId)
      setMessages(userMessages)

      setIsLoading(false)
    }, 500)
  }, [userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      userId: userId,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "user",
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

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
        <p className="text-muted-foreground">The conversation you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/messages" className="mt-4">
          <Button variant="outline">Back to Messages</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Link href="/dashboard/messages">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.name}</h3>
          <p className="text-xs text-muted-foreground">{user.online ? "Online" : "Offline"}</p>
        </div>
        <div className="ml-auto">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
