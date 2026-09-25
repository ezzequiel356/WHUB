# Mismo tag de Node en los dos stages a propósito: bytenode incrusta un
# fingerprint de la versión de V8 en el bytecode compilado, y ese bytecode
# no corre en una versión de Node distinta a la que lo compiló.

# ── Stage 1: bundle (ESM -> CJS) + compilar a bytecode V8 ──
FROM node:20.18.0 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm install --no-save esbuild bytenode \
 && node scripts/build-bytenode.cjs

# ── Stage 2: imagen final, solo el artefacto compilado ──
FROM node:20.18.0-slim
WORKDIR /app

# bytenode también hace falta en runtime: es lo que sabe cargar un .jsc
# (el resto de las dependencias -express, mysql2, etc.- ya quedaron
# incluidas dentro del bundle compilado, no hace falta instalarlas de nuevo).
RUN npm install --no-save bytenode

COPY --from=builder /app/dist/server.jsc ./server.jsc
COPY loader.cjs ./
COPY data ./data

# Multer (2.x) no crea el directorio de destino si no existe, y un volumen
# nuevo arranca vacío. Docker copia este contenido de la imagen al volumen
# la primera vez que se crea, así que la primera subida real no falla.
RUN mkdir -p uploads/avatars uploads/banners

EXPOSE 3001
CMD ["node", "loader.cjs"]
