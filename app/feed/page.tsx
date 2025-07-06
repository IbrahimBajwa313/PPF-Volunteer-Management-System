"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageCircle, MapPin, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FeedPost {
  _id: string
  title: string
  description: string
  area: string
  city: string
  authorName: string
  authorRole: string
  createdAt: string
  likes: number
  comments: Comment[]
  isLiked?: boolean
}

interface Comment {
  _id: string
  text: string
  authorName: string
  createdAt: string
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const response = await fetch("/api/feed")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error fetching feed:", error)
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/feed/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        fetchFeed() // Refresh feed
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      })
    }
  }

  const addComment = async (postId: string) => {
    if (!commentText.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/feed/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, text: commentText }),
      })

      if (response.ok) {
        setCommentText("")
        setCommentingOn(null)
        fetchFeed() // Refresh feed
        toast({
          title: "Comment Added!",
          description: "Your comment has been posted.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Progress Feed</h1>
            </div>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Latest Progress Updates</h2>
          <p className="text-gray-600">
            See what our volunteers and area leads are accomplishing across different regions
          </p>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No progress updates yet. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          <AvatarInitials name={post.authorName} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.authorName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="outline">{post.authorRole}</Badge>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {post.area}, {post.city}
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likePost(post._id)}
                      className={`flex items-center space-x-2 ${post.isLiked ? "text-red-600" : "text-gray-600"}`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span>{post.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommentingOn(commentingOn === post._id ? null : post._id)}
                      className="flex items-center space-x-2 text-gray-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length}</span>
                    </Button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h5 className="font-medium text-sm text-gray-700">Comments</h5>
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              <AvatarInitials name={comment.authorName} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="font-medium text-sm">{comment.authorName}</p>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  {commentingOn === post._id && (
                    <div className="pt-4 border-t">
                      <div className="flex space-x-3">
                        <Input
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addComment(post._id)}
                        />
                        <Button onClick={() => addComment(post._id)}>Post</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
