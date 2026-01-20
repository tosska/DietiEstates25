FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Creiamo la cartella images per sicurezza (visto che index.js la usa)
RUN mkdir -p images

# Porta 3000 definita nel tuo index.js
EXPOSE 3000

CMD ["node", "index.js"]