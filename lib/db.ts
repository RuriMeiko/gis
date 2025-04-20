import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string, with fallbacks
export const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || "")

// Helper function to execute SQL queries with better error handling
export async function query(queryText: string, params: any[] = []) {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      throw new Error("Database connection string is not defined. Please check your environment variables.")
    }

    // Use sql.query for parameterized queries instead of direct function call
    return await sql.query(queryText, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to check database connection
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as connection_test`
    return { connected: true, message: "Successfully connected to the database" }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      connected: false,
      message: `Failed to connect to the database: ${error instanceof Error ? error.message : String(error)}`,
      error,
    }
  }
}
