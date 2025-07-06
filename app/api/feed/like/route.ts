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
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ppf")

    // Check if user already liked this post
    const existingLike = await db.collection("likes").findOne({
      postId: new ObjectId(postId),
      userId: new ObjectId(decoded.userId),
    })

    if (existingLike) {
      // Unlike the post
      await db.collection("likes").deleteOne({ _id: existingLike._id })
      await db.collection("progress_reports").updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: -1 } })
    } else {
      // Like the post
      await db.collection("likes").insertOne({
        postId: new ObjectId(postId),
        userId: new ObjectId(decoded.userId),
        createdAt: new Date(),
      })
      await db.collection("progress_reports").updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: 1 } })
    }

    return NextResponse.json({ message: "Success" })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
