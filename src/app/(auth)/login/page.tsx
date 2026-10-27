"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { Google } from "@/components/ui/icons";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/fidelidad?bienvenida=true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Credenciales incorrectas");
      return;
    }
    if (res?.ok) {
      window.location.href = callbackUrl;
    }
  };
  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="border-border/60 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-foreground">Iniciar Sesión</CardTitle>
          <p className="text-sm text-muted-foreground">Accede a tus sellos, misiones y beneficios exclusivos</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 py-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-[#4285F4] hover:shadow-lg transition-all rounded-xl font-bold text-base"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <Google className="w-5 h-5" />
              <span>Continuar con Google</span>
            </Button>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">O con correo</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 tracking-wide font-medium">Email</Label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 tracking-wide font-medium">Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button disabled={loading} className="w-full py-5 font-bold text-base" onClick={handleLogin}>
              {loading ? "Iniciando sesión..." : "Entrar a mi cuenta"}
            </Button>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/register">¿No tienes cuenta? Regístrate aquí</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
