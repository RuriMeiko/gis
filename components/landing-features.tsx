import { Users, MapPin, MessageSquare, Search } from "lucide-react"

export function LandingFeatures() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover what makes Global Connect the perfect platform for connecting with people worldwide
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h3 className="text-xl font-bold">Interactive Map</h3>
              </div>
              <p className="text-muted-foreground">
                Explore an interactive world map showing users from around the globe. Find people near you or discover
                connections in places you'd like to visit.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <h3 className="text-xl font-bold">Advanced Search</h3>
              </div>
              <p className="text-muted-foreground">
                Filter users by location, interests, and more to find your perfect connections. Our powerful search
                tools make it easy to find like-minded individuals.
              </p>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-xl font-bold">User Profiles</h3>
              </div>
              <p className="text-muted-foreground">
                Create your personal profile showcasing your interests, location, and a brief bio. Control what
                information you share with the community.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-xl font-bold">Messaging</h3>
              </div>
              <p className="text-muted-foreground">
                Connect with users through our simple messaging system. Start conversations and build relationships with
                people from different cultures and backgrounds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
