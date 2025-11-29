"use client";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "@/components/ui/icons";
import { useRef } from "react";

interface Props {
  value: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
}

export default function QrCodeGenerator({ value, size = 200, showDownload = false, className = "" }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qhubomor-qr.png";
      a.click();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="bg-white p-4 rounded-xl shadow-lg" ref={qrRef}>
        <QRCodeCanvas 
          value={value} 
          size={size} 
          level="H" 
          includeMargin={true}
        />
      </div>
      {showDownload && (
        <Button onClick={downloadQr} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Descargar QR
        </Button>
      )}
    </div>
  );
}
