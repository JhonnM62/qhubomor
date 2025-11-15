import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaStar, FaTicketAlt } from "react-icons/fa";

export default function Gamification() {
  return (
    <section className="grid gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Bonos y premios instantáneos</h2>
        <p className="text-muted-foreground">Incentivos para que arranques rápido y ganes más.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <FaStar size={24} className="text-primary" />
            <CardTitle className="text-base">Bono de bienvenida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Al registrarte, recibes 1 intento extra en el primer juego.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-2">
            <FaTicketAlt size={24} className="text-primary" />
            <CardTitle className="text-base">Premio instantáneo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Probabilidad mejorada de premio en tu primera jugada.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
