import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("ppf")

    // Verify user is admin
    const user = await db.collection("volunteers").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || (user.role !== "Super Admin" && user.role !== "Domain Head")) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Get all volunteers
    const volunteers = await db.collection("volunteers").find({}).sort({ createdAt: -1 }).toArray()

    // Remove passwords from response
    const volunteersWithoutPasswords = volunteers.map(({ password, ...volunteer }) => volunteer)

    return NextResponse.json(volunteersWithoutPasswords)
  } catch (error) {
    console.error("Error fetching volunteers:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
