FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Esponiamo la porta 3002 come definito nel tuo index.js
EXPOSE 3002

CMD ["node", "index.js"]