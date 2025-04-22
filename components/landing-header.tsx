import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="border-b bg-background px-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <span className="text-xl font-bold">Global Connect</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
