"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  dob: z.string(),
});

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      toast.error(j.error ?? "Error al registrar");
      return;
    }
    toast.success("Registro creado. Puedes iniciar sesión.");
    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide">Nombre completo</Label>
              <Input {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide">Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide">Contraseña</Label>
              <Input type="password" {...register("password")} />
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide">Fecha de nacimiento</Label>
              <Input type="date" {...register("dob")} />
            </div>
            <Button disabled={loading} type="submit" className="w-full">Crear cuenta</Button>
          </form>
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => signIn("google")}>Registro con Google</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
