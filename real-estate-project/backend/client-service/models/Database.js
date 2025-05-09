import { Sequelize } from "sequelize";
import { createModel as createCustomerModel } from "./Customer.js";

import 'dotenv/config.js';  // Legge il file .env e lo rende disponibile in process.env

export const database = new Sequelize(process.env.DB_CONNECTION_URI, {
    dialect: process.env.DIALECT
});

// Crea i modelli
createCustomerModel(database);

// Esporta i modelli
export const { Customer } = database.models;

// Sincronizzazione del database
database.sync()
    .then(() => {
        console.log("Database sincronizzato correttamente");
    })
    .catch(err => {
        console.error("Errore nella sincronizzazione del database: " + err.message);
    });