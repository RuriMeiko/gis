import Link from "next/link";
import { Globe } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-background px-10">
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <span className="text-xl font-bold">Global Connect</span>
        </div>
        <nav className="flex gap-6">
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Global Connect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
