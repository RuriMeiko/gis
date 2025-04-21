import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get unique interests from user_interests table
    console.log("Fetching interests from database...")
    const result = await sql`
      SELECT DISTINCT interest 
      FROM user_interests 
      ORDER BY interest
    `

    console.log("Interests query result:", result)

    // Check if result.rows exists before mapping
    if (!result || !result.rows) {
      console.warn("SQL result doesn't contain rows property:", result)
      return NextResponse.json({ interests: [] })
    }

    const interests = result.rows.map((row) => row.interest)

    return NextResponse.json({ interests })
  } catch (error) {
    console.error("Error fetching interests:", error)
    // Return an empty array instead of an error to avoid breaking the client
    return NextResponse.json({ interests: [] }, { status: 200 })
  }
}
