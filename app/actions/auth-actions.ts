"use server"

import { registerUser, loginUser, logoutUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function registerAction({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  try {
    await registerUser(name, email, password)
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Registration failed" }
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
