"use client"

import Link from "next/link"
import useSWR from "swr"
import { Star, MessageSquarePlus, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function HomeReviews() {
  const { data: reviews, error, isLoading } = useSWR<Review[]>("/api/reviews?limit=3", fetcher)

  if (error) return null 

  return (
    <section className="py-12 px-4 md:px-6 bg-gradient-to-b from-background to-secondary/5" aria-labelledby="reviews-heading">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Descubre las experiencias reales de nuestra comunidad. Tu opinión nos ayuda a mejorar cada día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-full border-border/50 bg-card/50">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </CardContent>
              </Card>
            ))
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Card 
                key={review.id} 
                className="h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={review.User.image || ""} alt={review.User.name || "Usuario"} />
                        <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm leading-none mb-1">{review.User.name || "Usuario Anónimo"}</p>
                        <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: es })}
                        </time>
                      </div>
                    </div>
                    <div className="flex bg-primary/5 px-2 py-1 rounded-full shrink-0" aria-label={`Calificación: ${review.rating} de 5 estrellas`}>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-bold text-xs">{review.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{review.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                    {review.content}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-card rounded-lg border border-dashed">
              <p className="text-muted-foreground">Aún no hay reseñas destacadas. ¡Sé el primero!</p>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button 
            asChild 
            size="lg" 
            className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
          >
            <Link href="/reviews?action=write">
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Escribir una reseña
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
