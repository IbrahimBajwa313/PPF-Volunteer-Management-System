import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

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

    const body = await request.json()
    const { taskId, submission } = body

    if (!taskId || !submission) {
      return NextResponse.json({ message: "Task ID and submission are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ppf")

    // Check if submission already exists
    const existingSubmission = await db.collection("submissions").findOne({
      taskId: new ObjectId(taskId),
      userId: new ObjectId(decoded.userId),
    })

    if (existingSubmission) {
      // Update existing submission
      await db.collection("submissions").updateOne(
        { _id: existingSubmission._id },
        {
          $set: {
            text: submission,
            status: "submitted",
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Create new submission
      await db.collection("submissions").insertOne({
        taskId: new ObjectId(taskId),
        userId: new ObjectId(decoded.userId),
        text: submission,
        status: "submitted",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ message: "Task submitted successfully" })
  } catch (error) {
    console.error("Error submitting task:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
