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
import { Google } from "@/components/ui/icons";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  dob: z.string(),
});

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ 
    resolver: zodResolver(schema),
    mode: "onChange"
  });
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
          <div className="mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 py-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-[#4285F4] hover:shadow-lg transition-all rounded-xl font-bold text-base"
              onClick={() => signIn("google", { callbackUrl: "/fidelidad?bienvenida=true" })}
            >
              <Google className="w-5 h-5" />
              <span>Registrarse con Google</span>
            </Button>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">O formulario manual</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide font-medium">Nombre completo</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide font-medium">Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide font-medium">Contraseña</Label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="mb-2 tracking-wide font-medium">Fecha de nacimiento</Label>
              <Input type="date" {...register("dob")} />
              {errors.dob && <p className="text-sm text-red-500">{errors.dob.message}</p>}
            </div>
            <Button disabled={loading} type="submit" className="w-full py-5 font-bold">Crear cuenta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
