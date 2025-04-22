"use server"

import { registerUser, loginUser, logoutUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"

// Update the registerAction function to accept location data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  location?: {
    lat: number;
    lon: number;
  };
}

export async function registerAction(data: RegisterData) {
  try {
    const { name, email, password, location ,age, gender} = data
    
    // Call the registerUser function with location data
    const userId = await registerUser(name, email, password, location , age, gender)
    
    return { success: true, userId }
  } catch (error) {
    console.error("Registration action error:", error)
    throw error
  }

  // Create the user in the database
  const user = await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: await bcrypt.hash(data.password, 10),
    gender: data.gender,
    age: data.age,
    lat: data.location?.lat,
    lon: data.location?.lon,
    // ... other fields ...
  }).returning();
}

export async function loginAction({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    await loginUser(email, password)
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Invalid email or password" }
  }
}

export async function logoutAction() {
  try {
    await logoutUser()
    // Return success instead of redirecting directly
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Logout failed" }
  }
}

// Separate function for server-side redirects
export async function logoutAndRedirectAction() {
  await logoutUser()
  redirect("/")
}
