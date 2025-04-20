import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const connectionResult = await checkDatabaseConnection()

    if (connectionResult.connected) {
      return NextResponse.json({
        status: "success",
        message: connectionResult.message,
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: connectionResult.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
