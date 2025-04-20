"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface Message {
  id: number
  content: string
  sender: "user" | "other"
  timestamp: string
}

export function MessageView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey, how are you doing?",
      sender: "other",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      content: "I'm good, thanks! How about you?",
      sender: "user",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      content: "I'm doing well. I saw you're in New York. I'll be visiting next week!",
      sender: "other",
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      content: "That's great! We should meet up. There's a nice café downtown I can show you.",
      sender: "user",
      timestamp: "10:35 AM",
    },
    {
      id: 5,
      content: "Sounds perfect! I'd love to check it out.",
      sender: "other",
      timestamp: "10:36 AM",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: messages.length + 1,
      content: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder.svg" alt="Alice Smith" />
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">Alice Smith</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
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
        ))}
      </div>
      <div className="p-4 border-t">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
