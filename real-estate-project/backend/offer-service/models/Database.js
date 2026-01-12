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


