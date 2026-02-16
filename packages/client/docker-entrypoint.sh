#!/bin/sh
# Script para inyectar variables de entorno en runtime
# Útil para cambiar API_URL sin rebuild

# Si existe VITE_API_URL en runtime, reemplazar en los archivos JS
if [ -n "$RUNTIME_API_URL" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__RUNTIME_API_URL__|$RUNTIME_API_URL|g" {} \;
fi

exec "$@"
