# Usiamo una versione leggera di Node
FROM node:20-alpine

# Impostiamo la directory di lavoro
WORKDIR /app

# Copiamo i file di configurazione delle dipendenze
COPY package*.json ./

# Installiamo le dipendenze
# Nota: Dato che nodemon è nelle 'dependencies' e non 'devDependencies', 
# npm install lo scaricherà, ma in produzione useremo 'node' diretto.
RUN npm install

# Copiamo tutto il resto del codice
COPY . .

# Esponiamo la porta definita nel tuo index.js
EXPOSE 3004

# Comando di avvio: Usiamo direttamente node invece di nodemon per stabilità in prod
CMD ["node", "index.js"]