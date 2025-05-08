import { Sequelize } from "sequelize";
import { createOfferModel } from "./Offer.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createOfferModel(database);

// Esporta i modelli
export const { Offer } = database.models;



// Sincronizzazione del database
database.sync({alter: true})
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });