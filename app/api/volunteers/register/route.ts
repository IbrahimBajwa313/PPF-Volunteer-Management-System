import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, cnic, city, area, university, skills, domains, password } = body

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !cnic ||
      !city ||
      !area ||
      !domains ||
      domains.length === 0 ||
      !password ||
      password.length < 6
    ) {
      return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ppf")

    // Check if user already exists
    const existingUser = await db.collection("volunteers").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create volunteer document
    const volunteer = {
      name,
      email,
      phone,
      cnic,
      city,
      area,
      university: university || "",
      skills: skills || "",
      domains,
      role: "Volunteer",
      password: hashedPassword,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("volunteers").insertOne(volunteer)

    return NextResponse.json(
      {
        message: "Registration successful",
        volunteerId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}