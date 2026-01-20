# FASE 1: Costruzione (Build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Installa tutte le dipendenze per poter compilare TS
RUN npm install
COPY . .
# Compila il codice (crea la cartella /dist)
RUN npm run build

# FASE 2: Produzione (Run)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Installa solo dipendenze essenziali
RUN npm install --production
# Copia il codice compilato dalla Fase 1
COPY --from=builder /app/dist ./dist
# Porta definita nel tuo index.ts
EXPOSE 3005
CMD ["node", "dist/index.js"]