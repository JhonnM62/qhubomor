import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-white/10 py-8 md:py-12 text-sm text-gray-400">
      <div className="max-w-6xl mx-auto px-4 grid gap-8 md:gap-8 md:grid-cols-4">
        {/* Marca y Logo - Centrado en móvil */}
        <div className="space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
          <Link href="/" className="block w-32 h-10 relative opacity-80 hover:opacity-100 transition-opacity">
            <Image 
              src="/images/logohorizontal.png" 
              alt="Q'hubo Mor Logo" 
              fill 
              className="object-contain" 
            />
          </Link>
          <p className="leading-relaxed max-w-xs">
            Los mejores granizados con y sin licor en Ipiales. Vive la experiencia.
          </p>
        </div>

        {/* Enlaces condensados en móvil (Grid 2 columnas) */}
        <div className="grid grid-cols-2 gap-8 md:contents">
          {/* Navegación Principal */}
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-white font-semibold tracking-wide">Explorar</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="hover:text-yellow-400 transition-colors">Inicio</Link>
              <Link href="/links" className="hover:text-yellow-400 transition-colors">Redes</Link>
              <Link href="/games" className="hover:text-yellow-400 transition-colors">Juegos</Link>
            </nav>
          </div>

          {/* Cuenta */}
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-white font-semibold tracking-wide">Cuenta</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/login" className="hover:text-yellow-400 transition-colors">Login</Link>
              <Link href="/register" className="hover:text-yellow-400 transition-colors">Registro</Link>
              <Link href="/profile" className="hover:text-yellow-400 transition-colors">Perfil</Link>
            </nav>
          </div>
        </div>

        {/* Contacto - Centrado en móvil */}
        <div className="space-y-3 text-center md:text-left md:col-start-4">
          <h3 className="text-white font-semibold tracking-wide">Visítanos</h3>
          <p>Mistares 3 casa 182<br/>Ipiales, Nariño</p>
          <p>+57 304 443 0427</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Q'hubo Mor. Todos los derechos reservados.
      </div>
    </footer>
  );
}
