"use server"

import { registerUser, loginUser, logoutUser } from "@/lib/auth"
import { redirect } from "next/navigation"

// Update the registerAction function to accept location data
export async function registerAction(data: { 
  name: string; 
  email: string; 
  password: string;
  location?: { lat: number; lon: number };
}) {
  try {
    const { name, email, password, location } = data
    
    // Call the registerUser function with location data
    const userId = await registerUser(name, email, password, location)
    
    return { success: true, userId }
  } catch (error) {
    console.error("Registration action error:", error)
    throw error
  }
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
