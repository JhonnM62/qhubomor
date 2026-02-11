"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const reviewSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(255),
  content: z.string().min(10, "La opinión debe tener al menos 10 caracteres"),
  rating: z.number().min(1).max(5),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  onSuccess?: () => void
  initialData?: ReviewFormValues
  reviewId?: number
  onCancel?: () => void
}

export function ReviewForm({ onSuccess, initialData, reviewId, onCancel }: ReviewFormProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      rating: 5,
    },
  })

  async function onSubmit(data: ReviewFormValues) {
    setIsSubmitting(true)
    try {
      const url = reviewId ? `/api/reviews/${reviewId}` : "/api/reviews"
      const method = reviewId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Debes iniciar sesión para realizar esta acción")
          router.push("/login")
          return
        }
        if (response.status === 429) {
          toast.error("Por favor espera un momento antes de publicar otra opinión")
          return
        }
        throw new Error("Error al guardar la opinión")
      }

      toast.success(reviewId ? "Opinión actualizada" : "¡Gracias por tu opinión!")
      if (!reviewId) form.reset()
      
      // Update SWR cache
      mutate("/api/reviews")
      
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error("Hubo un problema al guardar tu opinión")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{reviewId ? "Editar opinión" : "Deja tu opinión"}</h3>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} type="button">
              Cancelar
            </Button>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puntuación</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-colors"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => field.onChange(star)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoveredRating || field.value)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Resumen de tu experiencia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opinión</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Cuéntanos más detalles..." 
                  className="resize-none min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Enviando..." : "Publicar Opinión"}
        </Button>
      </form>
    </Form>
  )
}
