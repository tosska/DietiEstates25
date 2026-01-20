# Usa un'immagine Node leggera e recente
FROM node:20-alpine

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file di dipendenze (package.json e package-lock.json se esiste)
# Questo passaggio è separato per sfruttare la cache di Docker e velocizzare le build successive
COPY package*.json ./

# Installa le dipendenze
RUN npm install --production

# Copia il resto del codice sorgente
COPY . .

# Espone la porta definita nel tuo index.js (3001)
EXPOSE 3001

# Avvia l'applicazione
CMD ["node", "index.js"]