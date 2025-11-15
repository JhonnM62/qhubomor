param()
Write-Host "Inicializando base de datos Prisma..."
npx prisma generate
npx prisma migrate deploy
if ($LASTEXITCODE -eq 0) { Write-Host "OK" } else { Write-Error "Falló la inicialización" }
