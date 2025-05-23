import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import { Globe } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] md:w-[550px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-2">
                <Globe className="h-6 w-6" />
                <span className="text-xl font-bold">Global Connect</span>
              </Link>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your information below to create your account</p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
