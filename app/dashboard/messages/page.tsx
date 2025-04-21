"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Sample conversations data
const initialConversations = [
  {
    id: 1,
    name: "Alice Smith",
    avatar: "/placeholder.svg",
    lastMessage: "Let me know when you're here, I can show you around!",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    name: "Bob Johnson",
    avatar: "/placeholder.svg",
    lastMessage: "Yes! I love exploring new trails. Do you have any recommendations?",
    time: "2h ago",
    unread: false,
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "/placeholder.svg",
    lastMessage: "Hello! I saw your profile and we share an interest in art.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "/placeholder.svg",
    lastMessage: "Hi! I'm planning a tech meetup next week. Would you be interested?",
    time: "3d ago",
    unread: false,
  },
  {
    id: 5,
    name: "Evan Williams",
    avatar: "/placeholder.svg",
    lastMessage: "Hey! Are you into online gaming? I'm looking for people to join my team.",
    time: "1w ago",
    unread: false,
  },
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground">No conversations found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                    <div
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent ${
                        pathname === `/dashboard/messages/${conversation.id}` ? "bg-accent" : ""
                      } ${conversation.unread ? "font-medium" : ""}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                        <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{conversation.name}</span>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex items-center justify-center bg-muted/30">
          <div className="text-center p-6">
            <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
            <p className="text-muted-foreground">Choose a conversation from the list or start a new one</p>
          </div>
        </div>
      </div>
    </div>
  )
}
