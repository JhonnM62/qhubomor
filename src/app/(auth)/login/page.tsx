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
  const callbackUrl = searchParams.get("callbackUrl") || "/games";
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
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 tracking-wide">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 tracking-wide">Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button disabled={loading} className="w-full" onClick={handleLogin}>Entrar</Button>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full gap-2" onClick={() => signIn("google", { callbackUrl })}>
              <Google className="w-5 h-5" />
              Entrar con Google
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
