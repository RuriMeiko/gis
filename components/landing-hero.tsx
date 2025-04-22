import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 p-10 overflow-hidden relative">
      <img
        src={"/AdobeStock_472119374.webp"}
        className="absolute top-0 left-0 -z-10 brightness-125 blur-sm"
      ></img>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Connect with people around the world
            </h1>
            <p className="max-w-[600px]  md:text-xl drop-shadow-2xl">
              Discover new connections on our interactive global map. Share your
              location, find people with similar interests, and build meaningful
              relationships.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="px-8">
                Explore Map
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden border bg-background">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              {/* <Globe className="h-24 w-24" /> */}
              <img src={"/PLANET.jpg"} className="h-full"></img>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
