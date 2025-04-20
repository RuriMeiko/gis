import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"

// Session duration in seconds (7 days)
const SESSION_DURATION = 7 * 24 * 60 * 60

// Development mode flag - set to true for development, false for production
const DEV_MODE = process.env.NODE_ENV === "development"

// Mock user for development
const DEV_USER = {
  id: 1,
  name: "Demo User",
  email: "user@example.com",
  password_hash: "$2b$10$8KbM.KfHwn5MWmGR1atVeOCVVl.8aQmAz.zCXGb.KfNNM1vFqUBdq", // hashed 'password'
}

// Create a new session for a user
export async function createSession(userId: number) {
  const sessionId = uuidv4()
  const expires = new Date(Date.now() + SESSION_DURATION * 1000)

  // Store session in cookies
  cookies().set("session_id", sessionId, {
    httpOnly: true,
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  // Store session in database (in a real app)
  // await sql`INSERT INTO sessions (id, user_id, expires) VALUES (${sessionId}, ${userId}, ${expires})`;

  return sessionId
}

// Get the current user from the session
export async function getCurrentUser() {
  const sessionId = cookies().get("session_id")?.value

  if (!sessionId) {
    return null
  }

  // In a real app, you would query the sessions table and join with users
  // For now, we'll just return a mock user
  // const user = await sql`SELECT users.* FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.id = ${sessionId}`;
  // return user[0] || null;

  return DEV_MODE ? DEV_USER : null
}

// Register a new user
export async function registerUser(name: string, email: string, password: string) {
  try {
    // In development mode, just pretend we registered successfully
    if (DEV_MODE) {
      console.log("DEV MODE: Simulating user registration for", email)
      return 1 // Return a fake user ID
    }

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      throw new Error("User already exists")
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the user
    const result = await sql`
      INSERT INTO users (name, email, password_hash) 
      VALUES (${name}, ${email}, ${passwordHash}) 
      RETURNING id
    `

    return result[0].id
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof Error && error.message === "User already exists") {
      throw error
    }
    throw new Error("Failed to register user. Please try again later.")
  }
}

// Login a user
export async function loginUser(email: string, password: string) {
  try {
    // In development mode, allow login with demo credentials
    if (DEV_MODE) {
      // For development, allow login with user@example.com/password
      if (email === "user@example.com" && password === "password") {
        console.log("DEV MODE: Simulating successful login for", email)
        await createSession(DEV_USER.id)
        return DEV_USER
      }
    }

    // Get the user
    const users = await sql`SELECT * FROM users WHERE email = ${email}`

    if (users.length === 0) {
      throw new Error("Invalid email or password")
    }

    const user = users[0]

    // Check the password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      throw new Error("Invalid email or password")
    }

    // Create a session
    await createSession(user.id)

    return user
  } catch (error) {
    console.error("Login error:", error)
    // Rethrow the error to be handled by the action
    throw error
  }
}

// Logout the current user
export async function logoutUser() {
  cookies().delete("session_id")
}
