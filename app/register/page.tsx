"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const CAMPAIGN_DOMAINS = [
  "Gaza Awareness",
  "Boycott",
  "Social Media Warfare",
  "Gaza Relief / Child Adoption",
  "Building Teams for Gaza",
  "Masajid for Gaza",
  "University Teams",
  "Intellectual Capital Building",
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    city: "",
    area: "",
    university: "",
    skills: "",
    domains: [] as string[],
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDomainChange = (domain: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        domains: [...prev.domains, domain],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        domains: prev.domains.filter((d) => d !== domain),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/volunteers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to PPF Volunteer Platform. You can now login.",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          cnic: "",
          city: "",
          area: "",
          university: "",
          skills: "",
          domains: [],
          password: "",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Registration Failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join PPF Volunteer Network</h1>
          <p className="text-gray-600 mt-2">Register to become part of our Gaza support campaigns</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Volunteer Registration</CardTitle>
            <CardDescription>Fill out the form below to join our volunteer network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cnic">CNIC *</Label>
                  <Input
                    id="cnic"
                    placeholder="12345-1234567-1"
                    value={formData.cnic}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cnic: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills & Expertise</Label>
                <Textarea
                  id="skills"
                  placeholder="Describe your skills, experience, and how you can contribute..."
                  value={formData.skills}
                  onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Preferred Campaign Domains *</Label>
                <p className="text-sm text-gray-600 mb-4">Select all domains you're interested in:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CAMPAIGN_DOMAINS.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={domain}
                        checked={formData.domains.includes(domain)}
                        onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                      />
                      <Label htmlFor={domain} className="text-sm font-normal">
                        {domain}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Enter a password (min 6 characters)"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Registering..." : "Register as Volunteer"}
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Already have an account? Login
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}