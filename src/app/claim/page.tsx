"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function upload(platform: string, file?: File) {
  if (!file) return;
  const b64 = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
  await fetch("/api/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, imageBase64: b64 }) });
}

export default function ClaimPage() {
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const handleUpload = async () => {
    await upload("FACEBOOK", files.FACEBOOK);
    await upload("INSTAGRAM", files.INSTAGRAM);
    await upload("TIKTOK", files.TIKTOK);
  };
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sube tus capturas de redes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Facebook</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFiles((f) => ({ ...f, FACEBOOK: e.target.files?.[0] }))} />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFiles((f) => ({ ...f, INSTAGRAM: e.target.files?.[0] }))} />
          </div>
          <div>
            <Label>TikTok</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFiles((f) => ({ ...f, TIKTOK: e.target.files?.[0] }))} />
          </div>
          <Button onClick={handleUpload}>Guardar capturas</Button>
        </CardContent>
      </Card>
    </div>
  );
}
