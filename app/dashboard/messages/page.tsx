import { MessageList } from "@/components/messages/message-list"
import { MessageView } from "@/components/messages/message-view"

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <MessageList />
        </div>
        <div className="md:col-span-2 border rounded-lg overflow-hidden">
          <MessageView />
        </div>
      </div>
    </div>
  )
}
