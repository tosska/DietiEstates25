FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Creiamo la struttura cartelle per le immagini per sicurezza
# (Anche se il tuo codice lo fa, è meglio che la cartella esista nel container)
RUN mkdir -p images/active/temp

EXPOSE 3003

CMD ["node", "index.js"]