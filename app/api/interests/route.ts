import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Query to get unique interests from user_interests table
    const interests = await sql`
      SELECT DISTINCT interest_name 
      FROM user_interests 
      ORDER BY interest_name ASC
    `

    // Extract interest names from the result
    const interestNames = interests.map((row: any) => row.interest_name)

    return NextResponse.json({ interests: interestNames })
  } catch (error) {
    console.error("Error fetching interests:", error)
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    )
  }
}
