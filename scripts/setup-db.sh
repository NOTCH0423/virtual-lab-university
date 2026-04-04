#!/bin/bash
# Script para inicializar la base de datos en producción

echo "🔄 Conectando con la base de datos Neon..."
echo "📋 Pusheando schema..."

# Usar la DATABASE_URL del entorno
npx prisma db push

echo "✅ Schema push completado!"

echo "📊 Ejecutando seed..."
npx prisma db seed

echo "🎉 Base de datos inicializada correctamente!"
