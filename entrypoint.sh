#!/bin/sh
set -e

# Asegurar que el directorio de datos existe
mkdir -p /app/prisma/data
mkdir -p /app/public/uploads

# Si el archivo data.sqlite no existe en el volumen persistente, copiar la plantilla base
if [ ! -f /app/prisma/data/data.sqlite ]; then
  echo "=> Inicializando base de datos SQLite en volumen persistente..."
  if [ -f /app/prisma/data.sqlite ]; then
    cp /app/prisma/data.sqlite /app/prisma/data/data.sqlite
  fi
fi

exec node server.js
