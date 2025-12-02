import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-white/10 py-12 text-sm text-gray-400">
      <div className="max-w-6xl mx-auto px-4 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {/* Marca y Logo */}
        <div className="space-y-4">
          <Link href="/" className="block w-32 h-10 relative opacity-80 hover:opacity-100 transition-opacity">
            <Image 
              src="/images/logohorizontal.png" 
              alt="Q'hubo Mor Logo" 
              fill 
              className="object-contain" 
            />
          </Link>
          <p className="leading-relaxed">
            Los mejores granizados con y sin licor en Ipiales. Vive la experiencia.
          </p>
        </div>

        {/* Navegación Principal */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold tracking-wide">Explorar</h3>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="hover:text-yellow-400 transition-colors">Inicio</Link>
            <Link href="/links" className="hover:text-yellow-400 transition-colors">Nuestras Redes</Link>
            <Link href="/games" className="hover:text-yellow-400 transition-colors">Juegos</Link>
          </nav>
        </div>

        {/* Cuenta */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold tracking-wide">Tu Cuenta</h3>
          <nav className="flex flex-col gap-2">
            <Link href="/login" className="hover:text-yellow-400 transition-colors">Iniciar Sesión</Link>
            <Link href="/register" className="hover:text-yellow-400 transition-colors">Registrarse</Link>
            <Link href="/profile" className="hover:text-yellow-400 transition-colors">Mi Perfil</Link>
          </nav>
        </div>

        {/* Contacto */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold tracking-wide">Visítanos</h3>
          <p>Mistares 3 casa 182<br/>Ipiales, Nariño</p>
          <p>+57 318 135 9070</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Q'hubo Mor. Todos los derechos reservados.
      </div>
    </footer>
  );
}
