import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ppf")

    // Get all progress reports/posts
    const posts = await db.collection("progress_reports").find({}).sort({ createdAt: -1 }).toArray()

    // Get comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await db
          .collection("comments")
          .find({
            postId: post._id,
          })
          .sort({ createdAt: 1 })
          .toArray()

        return {
          ...post,
          comments: comments || [],
        }
      }),
    )

    return NextResponse.json(postsWithComments)
  } catch (error) {
    console.error("Error fetching feed:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
