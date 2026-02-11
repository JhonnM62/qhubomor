"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"
import { ReviewList } from "@/components/reviews/ReviewList"
import { ReviewForm } from "@/components/reviews/ReviewForm"
import { Button } from "@/components/ui/button"

function ReviewsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [isHandlingAuth, setIsHandlingAuth] = useState(false)

  useEffect(() => {
    const action = searchParams.get("action")
    if (action === "write") {
      if (status === "authenticated") {
        setShowForm(true)
        // Clean URL without reloading
        window.history.replaceState(null, "", "/reviews")
      } else if (status === "unauthenticated" && !isHandlingAuth) {
        setIsHandlingAuth(true)
        router.push("/login?callbackUrl=/reviews?action=write")
      }
    }
  }, [status, searchParams, router, isHandlingAuth])

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opiniones de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Descubre lo que dicen nuestros clientes sobre su experiencia.
          </p>
        </div>
        
        {session?.user && !showForm && (
          <Button onClick={() => setShowForm(true)} className="shrink-0">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Escribir Opinión
          </Button>
        )}

        {!session?.user && (
          <Button onClick={() => router.push("/login?callbackUrl=/reviews?action=write")} className="shrink-0">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Iniciar sesión para opinar
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <ReviewForm 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ReviewList />
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="container max-w-4xl mx-auto py-8 px-4 text-center">Cargando...</div>}>
      <ReviewsContent />
    </Suspense>
  )
}
