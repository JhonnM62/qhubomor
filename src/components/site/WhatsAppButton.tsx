"use client";

import Link from "next/link";

export default function WhatsAppButton() {
  return (
    <Link
      href="https://wa.me/573044430427"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-[#25D366]/50 group"
      aria-label="Contactar por WhatsApp"
    >
      <span className="absolute right-full mr-3 bg-white text-black px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md hidden md:block">
        ¡Escríbenos!
      </span>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp" 
        className="w-8 h-8"
      />
    </Link>
  );
}
    </Link>
  );
}
