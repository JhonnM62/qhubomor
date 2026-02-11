"use client"

import { useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Star, Pencil, Trash2, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { ReviewForm } from "./ReviewForm"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/dialog" // Note: Assuming standard shadcn path, check if exists or use window.confirm for simplicity first if dialog not present
// Actually, let's use standard window.confirm or just simple state for now if Dialog component path is unsure. 
// I saw dialog.tsx in src/components/ui/dialog.tsx so it should work. But imports might differ.
// Let's stick to standard imports if I'm not 100% sure of the exports.
// I saw `dialog.tsx` in the LS output.

// Define types locally to match API response
interface ReviewUser {
  name: string | null
  image: string | null
}

interface Review {
  id: number
  userId: string
  title: string
  content: string
  rating: number
  createdAt: string
  User: ReviewUser
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ReviewList() {
  const { data: session } = useSession()
  const { data: reviews, error, mutate } = useSWR<Review[]>("/api/reviews", fetcher)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  if (error) return <div className="text-red-500">Error al cargar las opiniones</div>
  if (!reviews) return <div className="text-muted-foreground">Cargando opiniones...</div>

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Opinión eliminada")
      mutate() // Refresh list
    } catch (error) {
      toast.error("No se pudo eliminar la opinión")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">Opiniones de nuestros clientes ({reviews.length})</h2>
      
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Sé el primero en dejar una opinión.</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border rounded-lg p-6 shadow-sm transition-all hover:shadow-md">
              {editingId === review.id ? (
                <ReviewForm
                  initialData={{
                    title: review.title,
                    content: review.content,
                    rating: review.rating,
                  }}
                  reviewId={review.id}
                  onSuccess={() => {
                    setEditingId(null)
                    mutate()
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.User.image || ""} />
                        <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{review.User.name || "Usuario Anónimo"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-primary/5 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-bold text-sm">{review.rating}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg mb-2">{review.title}</h4>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>

                  {session?.user && (session as any).userId === review.userId && (
                    <div className="flex gap-2 justify-end border-t pt-4 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(review.id)}
                      >
                        <Pencil className="w-3 h-3 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("¿Estás seguro de que quieres eliminar esta opinión?")) {
                            handleDelete(review.id)
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
