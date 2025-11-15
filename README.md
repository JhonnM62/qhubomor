# Qhubomor Casino

## Requisitos
- Node.js 18+
- Variables de entorno en `.env.local`

## Variables de entorno
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `DATABASE_URL` (SQLite)
- `PROMO_CODE_PREFIX`
- `SOCIAL_FACEBOOK_URL`, `SOCIAL_INSTAGRAM_URL`, `SOCIAL_TIKTOK_URL`

## Instalación
1. `npm install`
2. `npm run db:init`
3. `npm run dev`

## Funcionalidades
- Registro/login con Google y credenciales
- Validación de edad (>=18)
- 5 juegos de azar y progreso
- Subida de capturas de redes y generación de códigos + QR
- Panel admin: ver usuarios, promociones y verificar códigos

## Estructura
- `src/app/(auth)/login` y `register`
- `src/app/games/*`
- `src/app/claim`
- `src/app/admin`
- `src/app/api/*`
- `prisma/schema.prisma`

## Iconos (Convenciones)
- Librería: `react-icons` (importación selectiva por paquete: `fa`, `md`, etc.)
- Tamaño por defecto: `24px` (`size={24}`); se puede ajustar según contexto.
- Color: hereda `currentColor`; usa clases de Tailwind para theming (`text-primary`, `text-muted-foreground`).
- Rendimiento: importa solo los iconos utilizados, p.ej. `import { FaGift } from 'react-icons/fa'`.
- Estilo: preferir contorno/solid acorde al diseño y uso (consistente en toda la app).
