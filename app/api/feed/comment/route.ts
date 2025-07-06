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
    const { postId, text } = body

    if (!postId || !text) {
      return NextResponse.json({ message: "Post ID and comment text are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ppf")

    // Get user info
    const user = await db.collection("volunteers").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create comment
    const comment = {
      postId: new ObjectId(postId),
      userId: new ObjectId(decoded.userId),
      authorName: user.name,
      text,
      createdAt: new Date(),
    }

    await db.collection("comments").insertOne(comment)

    return NextResponse.json({ message: "Comment added successfully" })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
