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

    // Get user to find their domains
    const user = await db.collection("volunteers").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Find tasks assigned to this user or their domains
    const tasks = await db
      .collection("tasks")
      .find({
        $or: [{ assignedTo: new ObjectId(decoded.userId) }, { domain: { $in: user.domains } }],
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get submissions for this user
    const submissions = await db
      .collection("submissions")
      .find({
        userId: new ObjectId(decoded.userId),
      })
      .toArray()

    // Merge tasks with submissions
    const tasksWithSubmissions = tasks.map((task) => {
      const submission = submissions.find((sub) => sub.taskId.toString() === task._id.toString())
      return {
        ...task,
        status: submission ? submission.status : "pending",
        submission: submission ? submission.text : null,
      }
    })

    return NextResponse.json(tasksWithSubmissions)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
