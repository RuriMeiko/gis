import { neon } from "@neondatabase/serverless"

// Create a SQL client with the database URL from environment variables
// Add connection pooling options to improve performance and reliability
export const sql = neon(process.env.DATABASE_URL!, {
  // These are the default values
  maxRetries: 3,
  connectionTimeoutMillis: 5000,
})

// Simple function to test the database connection
export async function checkDatabaseConnection() {
  try {
    console.log("Testing database connection...")
    const startTime = Date.now()

    // Use a simple query with a timeout
    const result = (await Promise.race([
      sql`SELECT 1 as test`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 5000)),
    ])) as any

    const duration = Date.now() - startTime
    console.log(`Database connection successful in ${duration}ms:`, result)

    return {
      connected: true,
      message: `Database connection successful in ${duration}ms!`,
      duration,
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
