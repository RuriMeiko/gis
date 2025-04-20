"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: boolean
}

export function MessageList() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "Alice Smith",
      avatar: "/placeholder.svg",
      lastMessage: "Hey, how are you doing?",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      name: "Bob Johnson",
      avatar: "/placeholder.svg",
      lastMessage: "I'm planning to visit New York next month",
      time: "2h ago",
      unread: false,
    },
    {
      id: 3,
      name: "Charlie Brown",
      avatar: "/placeholder.svg",
      lastMessage: "Did you see the event happening downtown?",
      time: "1d ago",
      unread: false,
    },
    {
      id: 4,
      name: "Diana Prince",
      avatar: "/placeholder.svg",
      lastMessage: "Thanks for the recommendations!",
      time: "3d ago",
      unread: false,
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages" className="pl-8" />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent ${
              selectedConversation === conversation.id ? "bg-accent" : ""
            } ${conversation.unread ? "font-medium" : ""}`}
            onClick={() => setSelectedConversation(conversation.id)}
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
        ))}
      </div>
    </div>
  )
}
