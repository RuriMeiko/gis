"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function DatabaseConnectionTest() {
  const [status, setStatus] = useState<{
    connected: boolean
    message: string
    loading: boolean
  }>({
    connected: false,
    message: "Testing database connection...",
    loading: true,
  })

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("/api/test-db-connection")
        const data = await response.json()

        setStatus({
          connected: data.connected,
          message: data.message,
          loading: false,
        })
      } catch (error) {
        setStatus({
          connected: false,
          message: `Error testing connection: ${error instanceof Error ? error.message : String(error)}`,
          loading: false,
        })
      }
    }

    testConnection()
  }, [])

  if (status.loading) {
    return (
      <Alert className="bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Testing Database Connection</AlertTitle>
        <AlertDescription>Please wait while we test the database connection...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant={status.connected ? "default" : "destructive"}>
      {status.connected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{status.connected ? "Database Connected" : "Database Connection Error"}</AlertTitle>
      <AlertDescription>{status.message}</AlertDescription>
    </Alert>
  )
}
