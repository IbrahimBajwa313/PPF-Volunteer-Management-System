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

    // Get all tasks
    const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, domain, assignTo, dueDate } = body

    if (!title || !description || !domain || !dueDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Find volunteers to assign task to
    let assignedTo: ObjectId[] = []

    if (assignTo === "all") {
      // Assign to all volunteers in the domain
      const volunteers = await db
        .collection("volunteers")
        .find({
          domains: domain,
          role: "Volunteer",
        })
        .toArray()
      assignedTo = volunteers.map((v) => v._id)
    }

    // Create task
    const task = {
      title,
      description,
      domain,
      assignedTo,
      dueDate: new Date(dueDate),
      status: "pending",
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("tasks").insertOne(task)

    return NextResponse.json({
      message: "Task created successfully",
      taskId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
