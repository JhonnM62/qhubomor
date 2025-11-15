# Componentes: Avatar y Bingo

## Avatar en Navbar
- Componente: `src/components/site/UserNav.tsx`
- Integración: incluido en `src/components/site/Header.tsx` dentro del `<nav>`
- Proveedor de sesión: `src/components/providers/AuthProvider.tsx`, envuelto en `src/app/layout.tsx`
- Comportamiento: muestra imagen del usuario o inicial, efecto `hover` y responsivo.

## Bingo en tiempo real
- Proveedor: `src/components/providers/BingoProvider.tsx` (Socket.IO)
- Servidor WebSocket: `src/pages/api/bingo/socket.ts`
- Cliente reutilizable: `src/components/games/BingoClient.tsx`
- Ubicaciones:
  - `/bingo`: usa `BingoClient`
  - `/games`: incrustado con `dynamic` (SSR off)
  - Inicio: incrustado con `dynamic` (SSR off)
- Persistencia: el `BingoProvider` mantiene la conexión socket para navegar entre páginas.

## Estilos
- Usa componentes `shadcn/ui` (Card, Button, Input, Avatar)
- Tailwind para layout responsivo.

## Notas
- El path del socket es `/api/bingo/socket`.
- Los controles de admin se muestran; se puede restringir por email si se desea.
