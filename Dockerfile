# ========== ETAPA DE DEPENDENCIAS ==========
FROM node:20-alpine AS deps
# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias para build (openssl es requerido por Prisma)
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --only=production --legacy-peer-deps && \
    cp -R node_modules prod_node_modules && \
    npm ci --legacy-peer-deps

# ========== ETAPA DE COMPILACIÓN ==========
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias necesarias para build
RUN apk add --no-cache openssl

# Copiar archivos del proyecto
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copiar archivo .env generado desde ENV_FILE_CONTENT
# Este archivo contiene todas las variables necesarias para la compilación
# Nota: El archivo .env debe ser generado por GitHub Actions antes de construir la imagen
COPY .env .env

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Generar cliente de Prisma y Compilar la aplicación
RUN npx prisma generate
RUN npm run build

# ========== ETAPA DE PRODUCCIÓN ==========
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar dependencias necesarias para runtime (openssl para Prisma)
RUN apk add --no-cache openssl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos necesarios desde la etapa de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Asegurar que el usuario nextjs tenga permisos sobre el directorio de trabajo
# Esto es crucial para que SQLite pueda escribir su archivo .db si se crea en runtime
RUN chown -R nextjs:nodejs /app

# Copiar node_modules de producción
# Nota: standalone ya incluye dependencias necesarias, pero a veces faltan algunas específicas
COPY --from=deps /app/prod_node_modules ./node_modules

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto configurado (3000 para Next.js por defecto)
EXPOSE 3000

# Variables de entorno para el puerto
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
