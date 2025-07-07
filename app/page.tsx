import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Users, Target, Globe, Heart } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row justify-between items-center py-6 gap-4">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <Image
          src="/logo.png"
          alt="PPF Logo"
          width={80}
          height={80}
          className="object-contain"
        />
        <h1 className="text-large md:text-3xl font-bold text-gray-900">
          PPF Fsd Volunteer Platform
        </h1>
      </div>
      <div className="flex space-x-2">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Join as Volunteer</Button>
        </Link>
      </div>
    </div>
  </div>
</header>


      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Join the Movement for Gaza
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Be part of PPF Fsd's volunteer network working across multiple domains to support Gaza. From awareness
            campaigns to relief efforts, your contribution matters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Register as Volunteer
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                View Progress Feed
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campaign Domains */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Campaign Domains
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Gaza Awareness", icon: Globe, desc: "Spread awareness about Gaza situation" },
              { name: "Boycott", icon: Target, desc: "Organize boycott campaigns" },
              { name: "Social Media Warfare", icon: Users, desc: "Digital advocacy and campaigns" },
              { name: "Relief & Child Adoption", icon: Heart, desc: "Humanitarian aid and support" },
              { name: "Building Teams for Gaza", icon: Users, desc: "Organize volunteer teams" },
              { name: "Masajid for Gaza", icon: Globe, desc: "Mosque-based initiatives" },
              { name: "University Teams", icon: Users, desc: "Campus organizing" },
              { name: "Intellectual Capital Building", icon: Target, desc: "Knowledge and research" },
            ].map((domain, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <domain.icon className="h-10 w-10 mx-auto text-blue-600 mb-4" />
                  <CardTitle className="text-lg">{domain.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{domain.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Campaign Domains</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10+</div>
              <div className="text-gray-600">Areas Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">PPF Fsd Volunteer Platform</h3>
          <p className="text-gray-400 mb-6">
            Together we stand for Gaza, together we make a difference.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Link href="/feed" className="text-gray-400 hover:text-white">
              Progress Feed
            </Link>
            <Link href="/register" className="text-gray-400 hover:text-white">
              Join Us
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
